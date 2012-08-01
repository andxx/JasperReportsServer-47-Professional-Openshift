/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 *
 * Unless you have purchased  a commercial license agreement from Jaspersoft,
 * the following license terms  apply:
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License  as
 * published by the Free Software Foundation, either version 3 of  the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero  General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public  License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

JRS.SaveAsDialog = (function(jQuery, dynamicTree) {
    return function(inputOptions) {
        var defaultOptions = {
            templateMatcher: "#saveAs",
            insertAfterMatcher: "#frame",
            cloneTemplate: false,
            elementId: null,
            okButtonMatcher: ".saveButton",
            cancelButtonMatcher: ".cancelButton",
            inputMatchers: {
                name: ".resourceName",
                description: ".resourceDescription"
            },
            foldersTreeMatcher: "ul.folders",
            organizationId: "",
            publicFolderUri: "/public",
            validator: function(placeToSave) { return true;}, //default validator
            saveHandler: function(placeToSave) { //default save handler
                var deferred = jQuery.Deferred(); //use this to delay dialog close until server confirms successful save
                deferred.resolve();
                return deferred;
            }
        }
        var opt = jQuery.extend({}, defaultOptions, inputOptions);
        var thisSaveAsDialog = this;
        var dialogElement = getDialogElement(opt);
        this.dialogElement = dialogElement;
        var inputElements = findInputElements(dialogElement, opt);
        this.inputElements = inputElements;
        var placeToSave = {folder: null};
        var saveAsTree = null;
        var foldersTree = dialogElement.find(opt.foldersTreeMatcher);
        this.foldersTree = foldersTree;

        function getDialogElement(options) {
            var dialogElement = jQuery(options.templateMatcher);
            if(opt.cloneTemplate) {
                dialogElement = this.dialogElement.clone();
            }
            if(opt.cloneTemplate && opt.elementId) {
                dialogElement.attr("id", options.elementId);
            }
            jQuery(opt.insertAfterMatcher).append(dialogElement);
            return dialogElement
        }

        function findInputElements(dialogElement, opt) {
            var ret = {};
            for(inputName in opt.inputMatchers) {
                if(!opt.inputMatchers.hasOwnProperty(inputName)) {
                    continue;
                }
                ret[inputName] = dialogElement.find(opt.inputMatchers[inputName]);
            }
            return ret;
        }

        function updatePlaceToSave(place) {
            for(inputName in inputElements) {
                if(!inputElements.hasOwnProperty(inputName)) {
                    continue;
                }
                place[inputName] = inputElements[inputName].val();
            }
            var selNode = saveAsTree.getSelectedNode();
            if(selNode) {
                place.folder = selNode.param.uri;
                place.isWritable = selNode.param.extra ? selNode.param.extra.isWritable : true
            } else {
                place.folder = null;
            }
        }

        function okButtonHandler(event) {
            event.stopPropagation();
            updatePlaceToSave(placeToSave);
            if(!opt.validator(placeToSave)) {
                return;
            }
            opt.saveHandler(placeToSave).then(function() {
                thisSaveAsDialog.close();
            });
        };

        function cancelButtonHandler(event) {
            event.stopPropagation();
            thisSaveAsDialog.close();
        };

        function getSaveAsTree() {
            var foldersTreeId = foldersTree.attr("id");
            var saveAsTree = dynamicTree.createRepositoryTree(foldersTreeId, {
                providerId: 'adhocRepositoryTreeFoldersProvider',
                rootUri: '/',
                organizationId: opt.organizationId,
                publicFolderUri: opt.publicFolderUri,
                urlGetNode: 'flow.html?_flowId=adhocTreeFlow&method=getNode',
                urlGetChildren: 'flow.html?_flowId=adhocTreeFlow&method=getChildren',
                treeErrorHandlerFn: function() {}
            });

            return saveAsTree;
        }

        this.open = function(initialPlaceToSave) {
            placeToSave = initialPlaceToSave;
            if(!placeToSave.folder) {
                placeToSave.folder = "/";
            }

            dialogs.popup.show(dialogElement.get(0));

            for(inputName in inputElements) {
                if(!inputElements.hasOwnProperty(inputName)) {
                    continue;
                }
                inputElements[inputName].val(placeToSave[inputName]);
            }

            dialogElement.find(opt.okButtonMatcher).click(okButtonHandler);
            dialogElement.find(opt.cancelButtonMatcher).click(cancelButtonHandler);

            saveAsTree = getSaveAsTree();

            /*
             saveAsTree.observe("node:selected", function (event) {
             try {
             dialogElement.find(opt.okButtonMatcher)[0].disabled = !event.memo.node.param.extra.isWritable;
             }
             catch (e) {
             dialogElement.find(opt.okButtonMatcher)[0].disabled = true;
             console && console.log("report.view.pro[this.open] - " + e);
             }
             });
             */

            var deferred = jQuery.Deferred();
            saveAsTree.showTreePrefetchNodes(placeToSave.folder, function() {
                saveAsTree.openAndSelectNode(placeToSave.folder);
                deferred.resolve();
            });
            return deferred;
        }

        this.close = function() {
            dialogElement.find(opt.okButtonMatcher).unbind("click", okButtonHandler);
            dialogElement.find(opt.cancelButtonMatcher).unbind("click", cancelButtonHandler);
            dialogs.popup.hide(dialogElement.get(0));
        }
    }
})(jQuery, dynamicTree);
