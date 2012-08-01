/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////////////////////////////////////////
// Re-entrant ad hoc
///////////////////////////////////////////////////////////////

var adhocReentrance = {

    TEMPLATE_ID: 'selectFields',
    TREE_TEMPLATE_DOM_ID: "list_responsive_collapsible_type_sets",

    OK_PATTERN: '#selectFieldsOk',
    CANCEL_PATTERN: '#selectFieldsCancel',
    ajaxBuffer: 'ajaxbuffer',
    callbackCalled : false,

    initialize : function() {
        this._dialog = $(this.TEMPLATE_ID);

        this.actionHash = {
            '#selectFieldsOk': function(event) {
                dc_fields.fillForm();
                adhocReentrance.callbackCalled = true;
                var callback = function() {
                    adhocDesigner.generalDesignerCallback();
                };
                designerBase.sendRequest("co_setAdhocFields", ['selectedModel=' + encodeText($('selectedModel').value)], callback, {'bPost':true});
                this.close();
            },

            '#selectFieldsCancel': function(event) {
                this.close();
            }
        };

        this.getAction = function(element) {
            for (var id in this.actionHash) {
                if (element.match(id)) {
                    return this.actionHash[id];
                }
            }

            return doNothing;
        };

        this._dialog.observe("click", function(e) {
            var element = e.element();
            var btn = matchAny(element, [this.OK_PATTERN, this.CANCEL_PATTERN], true);

            if (btn) {
                this.getAction(btn).bind(this)(e);
            }

            e.stop();
        }.bindAsEventListener(this));

    },

    launchDialog : function() {
        designerBase.sendRequest("co_loadSchemaPos", [], adhocReentrance.init, {'target':adhocReentrance.ajaxBuffer, 'bpost':true, 'mode':AjaxRequester.prototype.EVAL_JSON});
    },

    init : function(response) {
        response = response[0];
        dc_fields.mode = dc_fields.RE_ENTRANCE_MODE;
        dc_fields.TREE_TEMPLATE_DOM_ID = adhocReentrance.TREE_TEMPLATE_DOM_ID;
        dc_fields.NODE_CLASS = adhocReentrance.ReentranceNode;
        domain.setMessage('disabledFolderTooltip', disabledFolderTooltip);
        dc_fields.disableNodesInAdhocReEntrance = function() {
            adhocReentrance.disableNode(dynamicTree.trees[dc_fields.DESTINATION_FIELDS_DOM_ID].rootNode, response['disabledNodes']);
        };
        dc_fields.updateReEntrantControls = function(params) {
            var okButton = $$(adhocReentrance.OK_PATTERN);
            if (okButton.size() && typeof(params.destTreeHasVisibleNodes) != 'undefined') {
                domain.enableButton(okButton[0], params.destTreeHasVisibleNodes);
            }
        };
        delete domain._bodyClickEventHandlers;
        dc_fields.init();
        dialogs.popup.show($('selectFields'));
        designerBase.updateMainOverlay('hidden');
    },

    disableNode : function(node, disabledNodes) {
        var id = $H(disabledNodes).keys().detect(function(id) {return node.param.id == id;});
        if (id) {
            node.disable(disabledNodes[id]);
        }

        node.childs.each(function(child) {
            adhocReentrance.disableNode(child, disabledNodes);
        });

        var parent = node.parent;
        while (parent && parent != dynamicTree.trees[node.getTreeId()].rootNode) {
            var disabledChilds = parent.childs.findAll(function(child) {
                return child.disabled;
            });

            if (parent.childs.length > 0 && parent.childs.length == disabledChilds.length) {
                parent.disable(disabledFolderTooltip);
            }

            parent = parent.parent;
        }
    },

    close : function() {
        dialogs.popup.hide($('selectFields'));
        if(!adhocReentrance.callbackCalled){
            adhocDesigner.generalDesignerCallback();
        }
        adhocReentrance.callbackCalled = false;
    }
};

adhocReentrance.ReentranceNode = function(options) {
    domain.ItemNode.call(this, options);

    this.Types = {
        Folder : new dynamicTree.TreeNode.Type('ItemGroupType'),
        Leaf : new dynamicTree.TreeNode.Type('ItemType')
    };

    this.nodeHeaderTemplateDomId = 'list_responsive_collapsible_type_sets:sets';
};

adhocReentrance.ReentranceNode.prototype = deepClone(domain.ItemNode.prototype);
