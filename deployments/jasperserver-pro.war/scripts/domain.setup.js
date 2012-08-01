/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//todo: localization

domain.wizard = {
    securityFile: null,
    bundles: null,
    bundleList: null,

    bundleExtention: '.properties',

    selectSecurityDialog: null,
    selectBundleDialog: null,
    isDataSourceValid: true,
    organizationId: null,
    publicFolderUri: null,


    STEP_DISPLAY_FORM: "pageForm",
    INPUT_DS: "dataSourceInput",
    LAUNCH_DD: "launchDD",
    CREATE_RADIO: "schemaCreateRadio",
    UPLOAD_RADIO: "schemaUploadRadio",
    BROWSER_BUTTON: "browser_button",
    DATA_SOURCE_BROWSER_BUTTON: "ds_browser_button",
    SCHEMA_UPLOAD: "schemaUpload",
	LAUNCHER:"launcher",
    RESOURCE_ALREADY_EXISTS: "resource already exists",

    ADD_BUNDLE_LEAF: "addBundleLeaf",

    INPUT_SL_NAME: "slName",
    INPUT_SL_RESOURCE_ID: "slResourceID",
    SCHEMA_DESCRIPTION: "slDescription",
    SCHEMA_LOCATION: "schemaLocation",
    SCHEMA_LOCATION_HIDDEN: "slLocation",
    BUTTON_SAVE: "done",
    BUTTON_CANCEL: "cancel_button",

    _canGenerateId: true,

    initialize: function() {
        webHelpModule.setCurrentContext("domain");

        domain.confirmDialog.init();
        domain.detailsDialog.init();

        this._label = $(this.INPUT_SL_NAME);
        this._resourceId = $(this.INPUT_SL_RESOURCE_ID);
        this._description = $(this.SCHEMA_DESCRIPTION);

        this._label.validator = resource.labelValidator.bind(this);
        this._resourceId.validator = resource.resourceIdValidator.bind(this);
        this._description.validator = resource.descriptionValidator.bind(this);

        this._isEditMode = domain.wizard.mode == 'edit';

        $(this.STEP_DISPLAY_FORM).observe('keyup', function(e) {
            var element = e.element();
            var targetElements = [this._label, this._resourceId, this._description];

            if (targetElements.include(element)) {
                ValidationModule.validate(resource.getValidationEntries([element]));

                if (element == this._resourceId
                        && this._resourceId.getValue() != resource.generateResourceId(this._label.getValue())) {
                    this._canGenerateId = false;
                }

                if (element == this._label && !this._isEditMode && this._canGenerateId) {
                    this._resourceId.setValue(resource.generateResourceId(this._label.getValue()));

                    ValidationModule.validate(resource.getValidationEntries([this._resourceId]));
                }
            }
        }.bindAsEventListener(this));

        $(this.STEP_DISPLAY_FORM).observe('click', function(e) {
            var elem = e.element();

            // observe Save and Cancel
            var button = matchAny(elem, [layoutModule.BUTTON_PATTERN], true);
            if (button) {
                if (button.match('#' + this.BUTTON_SAVE) && !button.hasAttribute(layoutModule.DISABLED_ATTR_NAME)) {
                    this.saveSchema();
                    e.stop();
                    return;
                }
                if (button.match('#' + this.BUTTON_CANCEL)) {
                    this.exit();
                    e.stop();
                    return;
                }
            }

            // observe launch DD
            if (elem.match('#' + this.LAUNCH_DD) && !elem.hasAttribute(layoutModule.DISABLED_ATTR_NAME)) {
                this.launchDomainDesigner();
                return;
            }

            // observe schema create/upload
            if (elem.match('#' + this.CREATE_RADIO)) {
                this.disableUploadSchema();
				this.enableCreateLink();
                return;
            }

            if (elem.match('#' + this.UPLOAD_RADIO)) {
                domain.wizard.enableUploadSchema();
				domain.wizard.disableCreateLink();
                return;
            }

            // observe bundles/security file
            if (elem.match('a#addSecurityLink')) {
                this.addSecurityFile();
                return;
            }

            if (elem.match('p.one > a')) {
                if (matchMeOrUp(elem, "#securityFileLeaf")) {
                    this.downloadSecurityFile();
                    return;
                } else if (matchMeOrUp(elem, "#bundlesList")) {
                    this.downloadBundle(elem.up('li'));
                    return;
                }
            }

            if (elem.match('p.two > a')) {
                if (matchMeOrUp(elem, "#securityFileLeaf")) {
                    !elem.previous("a") ? this.changeSecurityFile() : this.removeSecurityFile();
                } else if (matchMeOrUp(elem, "#bundlesList")) {
                    !elem.previous("a") ? this.changeBundle(elem.up('li')) : this.removeBundle(elem.up('li'));
                }

                return;
            }

            if (elem.match('a#addBundleLink')) {
                this.addBundle();
            }
        }.bindAsEventListener(this));


        // observe schema upload input
        $(this.INPUT_SL_NAME).observe('change', this.onNameChange.bind(this));
        $(this.SCHEMA_LOCATION).observe('change', this.onLocationChange.bind(this));
        $(this.INPUT_DS).observe('change', this.updateDataSourceUri.bind(this));

        // observe schema upload input
        $(this.SCHEMA_UPLOAD).observe('change', this._uploadSchema.bind(this));

        // init datasources
        if (!this.firstLoad) {
            var datasource = $(this.INPUT_DS);
            if (this.selectedDatasourcesUri.length > 0) {
                datasource.value = this.selectedDatasourcesUri[0];
            }
        }

        this.dataSourceSelector = new picker.FileSelector({
            treeId: 'addResourceTreeRepoLocation',
            providerId: 'repositoryTreeDatasourceProvider',
            uriTextboxId: this.INPUT_DS,
            browseButtonId: this.DATA_SOURCE_BROWSER_BUTTON,
            onOk: this.updateDataSourceUri.bind(this),
            title: domain.getMessage('CSLD_SELECT_DS_FROM_REPO'),
            selectLeavesOnly: true,
            suffix: '_DataSourcePicker',
            treeOptions: {
                organizationId: this.organizationId,
                publicFolderUri: this.publicFolderUri
            }
        });

        this.selectSecurityDialog = new SelectFileDialog({idSuffix: '_security'});
        this.selectBundleDialog = new SelectFileDialog({idSuffix: '_bundle'});

        this.folderSelector = new picker.FileSelector({
            treeId: 'addResourceTreeRepoLocation',
            providerId: 'repositoryTreeFoldersProvider',
            uriTextboxId: this.SCHEMA_LOCATION,
            browseButtonId: this.BROWSER_BUTTON,
            onOk: this.onLocationChange.bind(this),
            title: domain.getMessage('CSLD_SAVE_DS_DIALOG_TITLE'),
            disabled: this.mode !== 'create',
            suffix: '_LocationPicker',
            treeOptions: {
                organizationId: this.organizationId,
                publicFolderUri: this.publicFolderUri
            }
        });

        ////////////////
        // init trees
        ////////////////

        $H({'repositoryTreeSecurityProvider': this.selectSecurityDialog,
            'repositoryTreeBundleProvider':  this.selectBundleDialog}).each(function(pair) {
                pair.value.tree = dynamicTree.createRepositoryTree(pair.value.treeLocationId, {
                    providerId: pair.key,
                    organizationId: this.organizationId,
                    publicFolderUri: this.publicFolderUri
                });
                pair.value.tree.showTree(1);
        }.bind(this));

        //////////////////////////////////
        // init security file and bundles
        ///////////////////////////.//////

        function _initSecurityFile() {
            if (domain.wizard.securityFile != null) {
                domain.wizard.updateSecurityFileUI();
            }
        }

        function _initBundleList() {

            var items = [];
            for (var i=0;i<domain.wizard.bundles.length;i++) {
                items.push(new dynamicList.ListItem({
                    label: domain.wizard.bundles[i],
                    value: domain.wizard.bundles[i],
                    respondOnItemEvents: false
                }));
            }

            items.each(function(item) {
                item.processTemplate = function(element) {

                    element.select('p.one > a')[0].update(this._value);
                    element.select('p.two > a')[0].update(domain.getMessage("CSLD_CHANGE_LINK"));
                    element.select('p.two > a')[1].update(domain.getMessage("CSLD_REMOVE_LINK"));

                    return element;
                };
            });

            domain.wizard.bundleList = new dynamicList.List('bundlesList', {
                listTemplateDomId: "list_domain_bundles",
                itemTemplateDomId: "list_domain_bundles:leaf",
                items: items
            });


            domain.wizard.bundleList.show();
        }

        _initSecurityFile();
        _initBundleList();

        this.refreshSchemaArea();
        this.refreshSaveButton();

    },

    onNameChange: function() {
        ValidationModule.hideError($(this.INPUT_SL_NAME));
        this.refreshSaveButton();
    },

    onLocationChange: function() {
        ValidationModule.hideError($(this.SCHEMA_LOCATION));
        $(this.SCHEMA_LOCATION_HIDDEN).setValue($F(this.SCHEMA_LOCATION));
        this.refreshSaveButton();
    },

    refreshSaveButton: function() {
        var ds = this.getDataSource();

        if ($(this.INPUT_SL_NAME).getValue().length > 0 && $(this.SCHEMA_LOCATION).getValue().length > 0 && ds && ds.uri.length > 0 && this.isSchemaSet && this.isDataSourceValid) {
            domain.enableButton(this.BUTTON_SAVE, true)
        } else {
            domain.enableButton(this.BUTTON_SAVE, false)
        }
    },



//////////////////////
// Select Datasource
//////////////////////
    getDataSource: function() {
        var uri = $F(this.INPUT_DS);
        if (!uri.length > 0) {
            return {uri: '', name: ''};
        }

        if (!uri.startsWith('/') || !uri.split('/').last()) {
            return false;
        }

        return {uri: uri, name: uri.split('/').last()};
    },

    checkDataSource: function(ds, callback) {
        var internalCallback = function(result) {
            if ('success' === result) {
                this.isDataSourceValid = true;
                callback && callback();
            } else {
                ValidationModule.showError($(this.INPUT_DS), domain.getMessage('CSLD_DATA_SOURCE_IS_INVALID'));
                this.isDataSourceValid = false;
                this.refreshSchemaArea();
                this.refreshSaveButton();
            }
        }.bind(this);

        var params = {
            datasources: "['" + ds.uri + "']"
        };

        this._sendInfo('checkDataSource', params, internalCallback);
    },

    updateDataSourceUri: function() {
        var ds = this.getDataSource();
        ValidationModule.hideError($(this.INPUT_DS));

        this.refreshSchemaArea();
        this.refreshSaveButton();

        if (!ds) {
            ValidationModule.showError($(this.INPUT_DS), domain.getMessage('CSLD_DATA_SOURCE_IS_INVALID'));
            return;
        }

        if (ds.uri) {
            var checkDataSourceCallback = function() {
                var params = {
                    datasources: "['" + ds.uri + "']",
                    mappedDatasources: "[{'" + ds.name + "':'" + ds.uri + "'}]"
                };

                var callback = function() {
                    this.selectedDatasourcesUri = [ds.uri];
                    dialogs.systemConfirm.show(domain.getMessage('CSLD_DATA_SOURCE_IS_SET'));
                    this.refreshSchemaArea();
                    this.refreshSaveButton();
                }.bind(this);

                this._sendInfo('setDatasources', params, callback);
            }.bind(this);

            this.checkDataSource(ds, checkDataSourceCallback);
        }
    },



///////////////////////////////////////////////////////
// Schema: UI handlers, upload, launch Domain Designer
///////////////////////////////////////////////////////

    enableSchemaArea: function() {
        $(domain.wizard.CREATE_RADIO).removeAttribute(layoutModule.DISABLED_ATTR_NAME);
        $(domain.wizard.UPLOAD_RADIO).removeAttribute(layoutModule.DISABLED_ATTR_NAME);
        $(domain.wizard.LAUNCH_DD).removeAttribute(layoutModule.DISABLED_ATTR_NAME);
        if ($(domain.wizard.UPLOAD_RADIO).checked) {
            $(domain.wizard.SCHEMA_UPLOAD).removeAttribute(layoutModule.DISABLED_ATTR_NAME);
        }
    },
    disableSchemaArea: function() {
        $(domain.wizard.CREATE_RADIO).setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
        $(domain.wizard.UPLOAD_RADIO).setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
        $(domain.wizard.LAUNCH_DD).setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
        $(domain.wizard.SCHEMA_UPLOAD).setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
    },
    refreshSchemaArea: function() {
        var ds = this.getDataSource();

        if (ds && ds.uri.length > 0 && this.isDataSourceValid) {
            this.enableSchemaArea();
        } else {
            this.disableSchemaArea();
        }
    },

	enableCreateLink: function(){
	$(domain.wizard.LAUNCH_DD).removeClassName(layoutModule.DISABLED_CLASS).addClassName(domain.wizard.LAUNCHER);
	},
	disableCreateLink: function(){
	$(domain.wizard.LAUNCH_DD).removeClassName(domain.wizard.LAUNCHER).addClassName(layoutModule.DISABLED_CLASS);},

    enableUploadSchema: function() {
        $(domain.wizard.SCHEMA_UPLOAD).removeAttribute(layoutModule.DISABLED_ATTR_NAME);
    },
    disableUploadSchema: function() {
        $(domain.wizard.SCHEMA_UPLOAD).setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
    },

    launchDomainDesigner: function() {
        var schemaForm = $(domain.wizard.STEP_DISPLAY_FORM);
        schemaForm.action = "flow.html?_flowId=createSLDatasourceFlow";
        schemaForm.method = "post";
        schemaForm.enctype = "multipart/form-data";
        schemaForm._eventId.value = domain.wizard.isSchemaSet ? "editSchema" : "createSchema";

        schemaForm.submit();
    },




////////////////////////////////////////////////////////////
// Security File and bundles: add, change, remove, download
////////////////////////////////////////////////////////////

    addSecurityFile: function() {
        domain.wizard.showSelectResourceFromRepository({fileType: 'security', mode: 'add'});
    },

    downloadSecurityFile: function() {
        var params = {
            securityFile: domain.wizard.securityFile,
            _flowExecutionKey: domain.wizard.flowExecutionKey,
            _eventId: 'downloadFile'
        }
        var url = 'flow.html?' + Object.toQueryString(params);
        ajaxIframeDownload(url);
    },

    changeSecurityFile: function() {
        domain.wizard.showSelectResourceFromRepository({fileType: 'security', mode: 'edit'});
    },

    removeSecurityFile: function() {
        var params = {
            securityUri: domain.wizard.securityFile
        };

        var deleteCallback = function(response) {
            if (response.result) {
                domain.wizard.securityFile = null;
                dialogs.systemConfirm.show(domain.getMessage("CSLD_SECURITY_FILE_IS_REMOVED"));
                $('securityFileLeaf').addClassName('hidden');
                $('noSecurityFileLeaf').removeClassName('hidden');
            } else {
                dialogs.systemConfirm.show(domain.getMessage('error'));
            }
        }.bind(this);

        domain.wizard._sendInfo('deleteSecurity', params, deleteCallback);
    },

    updateSecurityFileUI: function() {
        var element = $('securityFileLeaf');
        element.removeClassName('hidden');
        $('noSecurityFileLeaf').addClassName('hidden');

        element.select('p.one > a')[0].update(domain.wizard.securityFile);
        element.select('p.two > a')[0].update(domain.getMessage("CSLD_CHANGE_LINK"));
        element.select('p.two > a')[1].update(domain.getMessage("CSLD_REMOVE_LINK"));
    },

    addBundle: function() {
        domain.wizard.showSelectResourceFromRepository({fileType: 'bundle', mode: 'add'});
    },

    changeBundle: function(element) {
        domain.wizard.showSelectResourceFromRepository({fileType: 'bundle', mode: 'edit', oldUri: element.listItem.getValue(), oldId: element.listItem.getId()});
    },


    downloadBundle: function(element) {
        var params = {
            bundle: element.listItem.getValue(),
            _flowExecutionKey: domain.wizard.flowExecutionKey,
            _eventId: 'downloadFile'
        }
        var url = 'flow.html?' + Object.toQueryString(params);
        ajaxIframeDownload(url);
    },


    removeBundle: function(element) {

        // Delete logic designed for bulk delete which was eleminated since VFR.
        // Anyway we leave it as designed just in case in the future.

        var name = element.listItem.getValue();
        var deleted = [];
        deleted.push(name);

        var params = {
            deletedBundles: "['" + deleted.join("','") + "']"
        };

        var deleteCallback = function(response) {
            if (response.result) {
                var deleted = element.listItem.getValue();
                for (var i=0; i<domain.wizard.bundles.length; i++) {
                    if (deleted == domain.wizard.bundles[i]) {
                        domain.wizard.bundles.splice(i, 1);
                        break;
                    }
                }
                element.listItem.remove();
                dialogs.systemConfirm.show(domain.getMessage("CSLD_BUNDLE_REMOVED"));
            } else {
                dialogs.systemConfirm.show(domain.getMessage("error"));
            }
        }.bind(this);

        domain.wizard._sendInfo('deleteBundle', params, deleteCallback);
    },



////////////////////////////////////////////
// Security File and bundles: Select dialog
////////////////////////////////////////////

    showSelectResourceFromRepository: function(options) {

        var dialog;
        var title;
        var requestFunction = null;

        if (options.fileType == 'security') {
            if (options.mode == 'add') {
                title = domain.getMessage("CSLD_ADD_SECURITY_FILE");
            } else {
                title = domain.getMessage("CSLD_CHANGE_SECURITY_FILE");
            }
            dialog = domain.wizard.selectSecurityDialog;
            requestFunction = domain.wizard._uploadSecurity;
        } else if (options.fileType == 'bundle') {
            if (options.mode == 'add') {
                title = domain.getMessage("CSLD_ADD_BUNDLE_FILE");
            } else {
                title = domain.getMessage("CSLD_CHANGE_BUNDLE_FILE");
            }
            dialog = domain.wizard.selectBundleDialog;
            requestFunction = domain.wizard._uploadBundle;
        }

        dialog.title.update(title);
        dialog.filePath.value = "";
        dialog.tree._deselectAllNodes();
        dialog.fromLocalRadio.checked = true;
        ValidationModule.hideError(dialog.filePath);
        ValidationModule.hideError(dialog.fromRepoRadio);
        this.fromLocalHandler(dialog);

        dialog.show();

        dialog.selectedFileClickSelect = function() {
            if (requestFunction(this,options)) {
                dialog.hide();
            }
        }

    },

    fromLocalHandler: function(dialog) {
        if (dialog.mode !== 'local') {
            dialog.mode = 'local';
            dialog.filePath.removeAttribute(layoutModule.DISABLED_ATTR_NAME);
            dialog.lastSelectedNode = dialog.tree.selectedNodes.first();
            dialog.tree._deselectAllNodes();
            dialog.tree._getElement().setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
            dialog.fromLocalRadio.checked = true;
        }
    },

    fromRepoHandler: function(dialog) {
        if (dialog.mode !== 'repo') {
            dialog.mode = 'repo';
            dialog.tree._getElement().removeAttribute(layoutModule.DISABLED_ATTR_NAME);
            dialog.lastSelectedNode && dialog.lastSelectedNode.select();
            dialog.filePath.setAttribute(layoutModule.DISABLED_ATTR_NAME, layoutModule.DISABLED_ATTR_NAME);
            dialog.fromRepoRadio.checked = true;
        }
    },



/////////////////////////////////////////
// Security and bundle files validation
/////////////////////////////////////////

    isCorrectBundle: function(uri) {
            var fileName = domain.wizard.getFileName(uri);
            var existBundle;

            // Check is it '*.properties' file at all
            if (!fileName.endsWith(this.bundleExtention)){
                return domain.getMessage('notCorrectBundleFileType');
            };

            // Check if base names match
            if (domain.wizard.bundles.length > 0) {
                existBundle = domain.wizard.getFileName(domain.wizard.bundles[0]);
                if (!domain.wizard.isSameBaseName(existBundle, fileName)) {
                    return domain.getMessage('notSameBaseName');
                }
            }

            // Check if newly added bundle is already present
            for (var i = 0; i < domain.wizard.bundles.length; i ++) {
                existBundle = domain.wizard.getFileName(domain.wizard.bundles[i]);
                if (existBundle == fileName) {
                    return domain.getMessage('bundleAlreadyExists');
                }
            }

            return null;
    },

    isSameBaseName: function(fileName1, fileName2) {
        var suffix1 = this.getBundleSuffix(fileName1);
        var suffix2 = this.getBundleSuffix(fileName2);

        var baseNameLength;
        baseNameLength = fileName1.length - suffix1.length - this.bundleExtention.length;
        var baseName1 = fileName1.substr(0, baseNameLength);

        baseNameLength = fileName2.length - suffix2.length - this.bundleExtention.length;
        var baseName2 = fileName2.substr(0, baseNameLength);

        return baseName1 == baseName2;
    },

    getBundleSuffix: function(fileName) {
        var parser = new RegExp(".*(?:(?:[_])([a-z][a-z]))(?:[_]){0,1}([A-Z][A-Z]){0,1}(?:(?:[_])([^_]*)){0,1}\.properties");
        var res = parser.exec(fileName);
        if (res) {
            var language = '_' + res[1];
            var country = (res[2]) ? '_' + res[2] : '';
            var variant = (res[3]) ? '_' + res[3] : '';
            return language + country + variant;
        } else {
            return '';
        }
    },

    getFileName: function(file) {
        var indexOfSeparator;
        var pathSeparators = ['\\', '/'];
        for (var i = 0; i < pathSeparators.length; i ++) {
            indexOfSeparator = file.lastIndexOf(pathSeparators[i]);
            if (indexOfSeparator != -1) {
                break;
            }
        }
        var fileName = file.substr((indexOfSeparator == -1) ? 0 : indexOfSeparator + 1, file.length);

        return (fileName.length == 0) ? file : fileName;
    },





//////////////////
// Save Schema
//////////////////

    saveSchema: function() {
        this.isValidateNameAndDescription($(this.INPUT_SL_NAME), $(this.SCHEMA_DESCRIPTION)) && this.validateAndSave();
    },

    isValidateNameAndDescription: function(nameField, descriptionField) {
        ValidationModule.hideError(nameField);
        ValidationModule.hideError(descriptionField);
        return ValidationModule.validate([
            {validator: function(value) {return domain.maxLengthValidator(value, 100, domain.getMessage('tooLongName'))}, element: nameField},
            {validator: function(value) {return domain.maxLengthValidator(value, 250, domain.getMessage('tooLongDescription'))}, element: descriptionField}
        ]);
    },

    validateAndSave: function(notSave) {

        var validateCallback = function(response) {
            if (response.result) {
                if (this.RESOURCE_ALREADY_EXISTS === response.message && this.mode == 'create') {
                    ValidationModule.showError($(this.INPUT_SL_RESOURCE_ID), domain._messages["resourceIdDuplicate"]);
                    //domain.confirmDialog.show("resourceExistsConfirmMessage", this._doSave.bind(this, true), null, null, domain.confirmDialog.MODE_OK_CANCEL);
                } else {
                    if (notSave) {
                        dialogs.systemConfirm.show(domain.getMessage("CSLD_SCHEMA_UPLOADED"));
                    }
                    else {
                        this._doSave(false);
                    }
                }
            } else {
                // validation failed
                domain.wizard.isSchemaSet = false;
                domain.enableButton(this.BUTTON_SAVE, false);
                $(this.LAUNCH_DD).update(domain.getMessage("CSLD_CREATE_WITH_DD"));
                ValidationModule.showError($(this.UPLOAD_RADIO), domain.getMessage('CSLD_SCHEMA_UPLOAD_ERROR'));
                domain.detailsDialog.show(response.message ? response.message : domain.getMessage('CSLD_DOMAIN_VALIDATION_ERROR'));
            }
        }.bind(this);

        var params = {
            slName: $F(this.INPUT_SL_NAME),
            slResourceID: $F(this.INPUT_SL_RESOURCE_ID),
            slLocation: $F(this.SCHEMA_LOCATION)
        };

        ValidationModule.hideError($(this.INPUT_DS));
        ValidationModule.hideError($(this.INPUT_SL_NAME));
        ValidationModule.hideError($(this.SCHEMA_LOCATION));
        this._sendInfo('validateAndCheckIfExists', params, validateCallback);
    },

    _doSave: function(overwrite) {

        var saveCallback = function(response) {
            if (response.result) {
                dialogs.systemConfirm.show(domain.getMessage("CSLD_DOMAIN_SAVED"));
                //Redirect to edit newly created domain
                if (this.mode == 'create') {
                    document.location = buildActionUrl({flowId: 'createSLDatasourceFlow', ParentFolderUri: $F(this.SCHEMA_LOCATION), uri: response.uri});
                }
            } else {
                if ('folder does not exists' === response.message ) {
                    ValidationModule.showError($(this.SCHEMA_LOCATION), domain.getMessage('CSLD_FOLDER_DOESNT_EXIST'));
                } else if ('Access is denied' === response.message) {
                    ValidationModule.showError($(this.SCHEMA_LOCATION), domain.getMessage('CSLD_ACCESS_DENIED'));
                } else if (response.message) {
                    dialogs.systemConfirm.show(response.message);
                } else {
                    dialogs.systemConfirm.show(domain.getMessage("error"));
                }
            }
        }.bind(this);

        var params = {
            slName: $F(this.INPUT_SL_NAME),
            slResourceID: $F(this.INPUT_SL_RESOURCE_ID),
            slDescription: $F(this.SCHEMA_DESCRIPTION),
            slLocation: $F(this.SCHEMA_LOCATION),
            mode: this.mode,
            overwrite: overwrite
        };

        ValidationModule.hideError($(this.SCHEMA_LOCATION));
        domain.wizard._sendInfo('save', params, saveCallback);
    },

    exit: function() {
        var schemaForm = $(domain.wizard.STEP_DISPLAY_FORM);
        schemaForm.action = "flow.html?_flowId=createSLDatasourceFlow";
        schemaForm._eventId.value = "cancel";
        schemaForm.submit();
    },


////////////////////
// Uploading files
////////////////////

    _uploadSchema: function(e) {
        // removing error class if wrong file was selected before
        ValidationModule.hideError($(this.UPLOAD_RADIO));

        if (e.target.getValue().endsWith('.xml')) {

            var endUploadCallback = function(response) {
                if (typeof(response) == 'string') {
                    // in case of file uploading we don't use AjaxRequester.prototype.EVAL_JSON mode
                    response = response.evalJSON();
                }
                if (response.result) {
                    this.isSchemaSet = true;
                    this.wasDesignResetted = true;
                    $(this.LAUNCH_DD).update(domain.getMessage("CSLD_EDIT_WITH_DD"));

                    this.refreshSaveButton();
                } else {
                    ValidationModule.showError($(this.UPLOAD_RADIO), domain.getMessage('CSLD_SCHEMA_UPLOAD_ERROR'));
                    if (response.message) {
                        domain.detailsDialog.show(response.message);
                    }
                }
                this.validateAndSave(true);
            }.bind(this);

            var onOk = function() {
                this._fileUpload($('schemaUpload'), {fileType: 'schema'}, endUploadCallback);
            }.bind(this);

            var onCancel = function() {
                e.target.setValue('');
                $(this.CREATE_RADIO).click();
            }.bind(this);

            if (this.mode === 'edit') {
                domain.confirmDialog.show("uploadSchemaConfirmMessage", onOk, onCancel, null, domain.confirmDialog.MODE_OK_CANCEL);
            } else {
                onOk();
            }

        } else {
            // highlight error
            ValidationModule.showError($(this.UPLOAD_RADIO), domain.getMessage('notCorrectSecurityFileType'));
        }
    },


    _uploadSecurity: function(dialog,options) {
        var fromRepo = dialog.filePath.hasAttribute(layoutModule.DISABLED_ATTR_NAME);

        var uri = fromRepo ? dialog.selectedURI : dialog.filePath.getValue();

        if (!fromRepo && !uri.endsWith('.xml')) {
            // highlight error
            ValidationModule.showError(dialog.filePath, domain.getMessage('notCorrectSecurityFileType'));
            return false;
        }

        // upload security callback
        function endUploadCallback(response) {
            //need to reset filePath after file upload because fileUploader changes fileupload element
            dialog.filePath = dialog._dom.select('#filePath' + dialog.idSuffix)[0];

            if (typeof(response) == 'string') {
                // in case of file uploading we don't use AjaxRequester.prototype.EVAL_JSON mode
                response = response.evalJSON();
            }
            if (response.result) {
                domain.wizard.securityFile = response.fileName;
                domain.wizard.updateSecurityFileUI();

                ValidationModule.hideError($('securityFileError').select('div > p')[0]);
                dialogs.systemConfirm.show(domain.getMessage("CSLD_SECURITY_FILE_IS_SET"));
            } else {
                ValidationModule.showError($('securityFileError').select('div > p')[0], domain.getMessage('securityUploadError'));
                if (response.message) {
                    domain.detailsDialog.show(response.message);
                }
            }
        }

        if (fromRepo) {
            options.securityUri = uri;
            domain.wizard._sendInfo('addSecurityFromRepo', options, endUploadCallback);
        } else {
            domain.wizard._fileUpload(dialog.filePath, options, endUploadCallback);
        }

        return true;

    },


    _uploadBundle: function(dialog,options) {

        var fromRepo = dialog.filePath.hasAttribute(layoutModule.DISABLED_ATTR_NAME);

        var uri = fromRepo ? dialog.selectedURI : dialog.filePath.getValue();

        var errorMessage = domain.wizard.isCorrectBundle(uri);
        if (!errorMessage) {

            // upload bundle callback
            function endUploadCallback(response) {
                //need to reset filePath after file upload because fileUploader changes fileupload element
                dialog.filePath = dialog._dom.select('#filePath' + dialog.idSuffix)[0];

                if (typeof(response) == 'string') {
                    response = response.evalJSON();
                }
                if (response.result) {
                    if (options.oldUri) {

                        // edit mode
                        var items = domain.wizard.bundleList.getItems();
                        for(var i=0; i<items.length; i++) {
                            var element = items[i];
                            if (element.getId() == options.oldId){
                                element.setValue(response.fileName);
                                element.setLabel(response.fileName);
                            }
                            if (domain.wizard.bundles[i] == options.oldUri) {
                                domain.wizard.bundles[i] = response.fileName;
                            }
                         }
                    } else {

                        // add mode
                        var item = new dynamicList.ListItem({
                                label: response.fileName,
                                value: response.fileName,
                                respondOnItemEvents: false
                            });

                        item.processTemplate = function(element) {
                            element.select('p.one > a')[0].update(this._value);
                            element.select('p.two > a')[0].update(domain.getMessage("DOMAIN_WIZARD_CHANGE_DATASOURCE"));
                            element.select('p.two > a')[1].update(domain.getMessage("DOMAIN_WIZARD_REMOVE_DATASOURCE"));
                            return element;
                        };

                        domain.wizard.bundleList.addItems([item]);
                        domain.wizard.bundles.push(item.getValue());

                    }

                    domain.wizard.bundleList.refresh();

                    ValidationModule.hideError($('bundleError').select('div > p')[0]);
                    dialogs.systemConfirm.show(domain.getMessage("CSLD_BUNDLE_IS_SET"));
                } else {
                    var message = response.message ? response.message : domain.getMessage('bundleUploadError');
                    ValidationModule.showError($('bundleError').select('div > p')[0], message);
                }
            }

            if (fromRepo) {
                options.bundleUri = uri;
                domain.wizard._sendInfo('addBundleFromRepo', options, endUploadCallback);
            } else {
                domain.wizard._fileUpload(dialog.filePath, options, endUploadCallback);
            }

            return true;

        } else {

            // highlight error
            var errorElement = fromRepo ? dialog.fromRepoRadio : dialog.filePath;
            ValidationModule.showError(errorElement, errorMessage);
            return false;
        }
    },



//////////////////////////////
// Communication with server
//////////////////////////////

    _sendInfo: function(eventId, params, callback) {
        var urlData = {flowId: 'createSLDatasourceFlow', flowExecutionKey: domain.wizard.flowExecutionKey, eventId: eventId};
        domain.sendAjaxRequest(urlData, params, callback);
    },

    _fileUpload: function (input, options, callback) {
        options._eventId = "upload";
        options._flowExecutionKey = domain.wizard.flowExecutionKey;
        fileSender.upload(input, 'createSLDatasourceFlow', options, callback)
    }
};



document.observe('dom:loaded', domain.wizard.initialize.bind(domain.wizard));

