/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////////
// Data Chooser Save as Topic
////////////////////////////////////

dc.saveAsTopic = {
    // Server messages constants
    RESOURCE_DOESNT_EXISTS_RESPONSE : 'resource doesnt exist',
    RESOURCE_ALREADY_EXISTS_RESPONSE : 'resource already exists',
    RESOURCE_OF_OTHER_TYPE_EXISTS_RESPONSE : 'resource of other type already exists',
    ID_TOPIC_NAME : 'topicName',
    ID_TOPIC_LOCATION : 'topicLocation',
    ID_TOPIC_DESCRIPTION : 'topicDesc',
    ID_HIDDEN_TOPIC_NAME : 'slTopicLabel',
    ID_HIDDEN_TOPIC_LOCATION : 'slTopicLocation',
    ID_HIDDEN_TOPIC_DESCRIPTION : 'slTopicDesc',
    ID_SAVE_AS_TOPIC_CONFIRM : 'standardConfirm',
    SAVE_TOPIC_BUTTONS: ['#goToDesigner_table', '#goToDesigner_chart', '#goToDesigner_crosstab'],

    fillForm: function() {
        $('slTopicLabel').writeAttribute('value', $F('topicName'));
        $('slTopicLocation').writeAttribute('value', $F('topicLocation'));
        $('slTopicDesc').writeAttribute('value', $F('topicDesc'));
    },

    getFlowControlsClickEventHandler: function() {
        return this._flowControlsClickEventHandlerWrapper.bind(this);
    },

    init : function(params) {
        // Server params
        this.params = params;
        this.organizationId = params.organizationId;
        this.storedTopicLocationPath = params.folderURI;
        this.ORGANIZATIONS_FOLDER_URI = params.organizationsFolderUri;
        this.ORGANIZATION_MATCHER = "^#{org}(/[^/]+#{org})*$".
                interpolate({org: dc.saveAsTopic.ORGANIZATIONS_FOLDER_URI});


        var topicDescriptionMaxLength = params.maxTopicDescription;

        // Topic saving input fields
        this.topicName = $(this.ID_TOPIC_NAME);
        this.topicName.writeAttribute('maxLength', params.maxTopicName);

        this.topicDescription = $(this.ID_TOPIC_DESCRIPTION);
        this.topicDescription.writeAttribute('maxLength', topicDescriptionMaxLength);
        this.topicDescription.writeAttribute('error', domain._messages['tooLongDescription'].
                replace("{0}", topicDescriptionMaxLength));

        this.topicLocation = $(this.ID_TOPIC_LOCATION);

        // Page specific buttons
        this.saveTopicBtn = null;

        // Dialogs
        this.saveAsTopicConfirm = $(this.ID_SAVE_AS_TOPIC_CONFIRM);

        // Click handlers registration.
        this._clickHandlersHash = this._clickHandlersFactory();
        domain.registerClickHandlers([
            this._flowControlsClickEventHandlerWrapper.bind(this),
            this._clickHandler.bind(this)]);
        this._registerKeyUpHandlers();
    },

    _changeEventIdForSaveButtons: function() {
        this.SAVE_TOPIC_BUTTONS.each(function(buttonId) {
            dc.flowControlsEventMap.get(buttonId).eventId = 'save';        
        });
    },

    _maxLengthValidator: function(value, length, message) {
        var isValid = true;
        var errorMessage = "";

        if (value.length > length) {
            errorMessage = message;
            isValid = false;
        }

        return {
            isValid: isValid,
            errorMessage: errorMessage
        };
    },

    _isDataValid : function() {
        return this._validateInput(this.topicDescription);
    },

    _validateInput : function(input) {
        return ValidationModule.validate([
            {
                validator: function(value) {
                    return this._maxLengthValidator(value, input.readAttribute('maxLength'), input.readAttribute('error'));
                }.bind(this),
                element: input
            }
        ]);
    },

    _flowControlsClickEventHandlerWrapper : function(element) {
        var eventHandled = false;

        this.SAVE_TOPIC_BUTTONS.each(function(button) {
            if (domain.elementClicked(element, button)) {
                eventHandled = true;

                this.saveTopicBtn = $$(button).first();
                if (!dc.saveAsTopic._isDataValid()) {
                    throw $break;
                }

                var params = this._formToParams();
                if (!params[this.ID_HIDDEN_TOPIC_NAME]) {
                    dc.flowControlsClickEventHandler(element);
                    throw $break;
                }
                this.checkIfTopicExists(params, function(response) {
                    ValidationModule.hideError($(this.ID_TOPIC_NAME));

                    if (!response) {
                        throw("malformed server response");
                    }
                    if (response === this.RESOURCE_DOESNT_EXISTS_RESPONSE) {
                        this.saveTopic();
                    } else if (response === this.RESOURCE_OF_OTHER_TYPE_EXISTS_RESPONSE) {
                        ValidationModule.showError($(this.ID_TOPIC_NAME), domain._messages['resource_of_other_type_exists']);
                    } else {
                        this.showConfirmDialog();
                    }
                }.bind(this));

                throw $break;
            }
        }, this);

        return eventHandled || dc.flowControlsClickEventHandler(element);
    },

    _clickHandler : function(element) {
        domain.basicClickHandler(element, this._clickHandlersHash);
    },

    _registerKeyUpHandlers : function() {
        var that = this;
        this.topicDescription.observe('keyup', function() {
            that._validateInput(this);
        });
    },

    _clickHandlersFactory : function() {
        return $H({
            '#saveAsTopicOverwriteButtonId' : function() {
                this.saveTopic();
                dialogs.popup.hide(this.saveAsTopicConfirm);
            }.bind(this),
            '#saveAsTopicOverwriteCancelButtonId' : function() {
                dialogs.popup.hide(this.saveAsTopicConfirm);
            }.bind(this),
            '#browser_button' : function() {
                var browser = this.repositoryBrowser;
                if (!browser.isInitialized) {
                    browser.init(this.params);
                    dialogs.popup.show(browser.browseRepositoryDialog);
                } else {
                    dialogs.popup.show(browser.browseRepositoryDialog);
                    browser.saveAsTree.selectFolder($('topicLocation').getValue());
                }
                return true;
            }.bind(this)
        });
    },

    checkIfTopicExists : function(params, callback) {
        domain.sendAjaxRequest({
                flowExecutionKey : dc.flowExecutionKey,
                eventId : 'checkIfExists'
            },
            params, callback);
    },

    saveTopic : function() {
        this._changeEventIdForSaveButtons();        
        dc.flowControlsClickEventHandler(this.saveTopicBtn);
    },

    showConfirmDialog : function() {
        dialogs.popup.show(this.saveAsTopicConfirm);
    },

    _formToParams : function() {
        var params = {};
        params[this.ID_HIDDEN_TOPIC_NAME] = $F(this.ID_TOPIC_NAME) || this.params.topicName;
        params[this.ID_HIDDEN_TOPIC_LOCATION] = $F(this.ID_TOPIC_LOCATION) || this.params.topicLocation;
        params[this.ID_HIDDEN_TOPIC_DESCRIPTION] = $F(this.ID_TOPIC_DESCRIPTION) || this.params.topicDescription;
        return params;
    }
};

var dc_saveAs = dc.saveAsTopic;

dc_saveAs.repositoryBrowser = {
    isInitialized : false,

    init : function(params) {
        this.browseRepositoryDialog = $('selectFromRepository');
        this.selectFromRepoButton = $('selectFromRepoBtnSelect');
        this.saveAsTree = this.createRepositoryTree(params);

        // Click handlers registration.
        this._clickHandlersHash = this._createClickHandlersFactory();
        domain.registerClickHandlers([function(element){
                    domain.basicClickHandler(element, this._clickHandlersHash);
        }.bind(this)]);

        this.isInitialized = true;
    },

    createRepositoryTree : function(options) {
        var _TREE_ID = 'addFileTreeRepoLocation';
        var _PROVIDER_ID = 'repositoryTreeFoldersProvider';
        var _uri = options.folderURI ? options.folderURI : '/';

        // Setup folders tree
        var _tree = new dynamicTree.createRepositoryTree(_TREE_ID, {
            providerId: _PROVIDER_ID,
            organizationId: options.organizationId,
            publicFolderUri: options.publicFolderUri
        });

        _tree.getTreeId = function() {
            return _TREE_ID;
        };

        _tree.selectFolder = function(folderUri) {
            _tree.openAndSelectNode(folderUri);
        };

        _tree.getSelectedFolderUri = function() {
            var selectedNode = _tree.getSelectedNode();
            return selectedNode && selectedNode.param.uri;
        };

        _tree.observe('server:error', function() {
            window.console && console.log("Server internal error occurred on repo tree loading.");
        });

        _tree.observe('childredPrefetched:loaded', function() {
            _tree.openAndSelectNode(_uri);
        });

        _tree.observe('tree:loaded', function() {
            _tree.openAndSelectNode(_uri);
        });

        _tree.observe('node:selected', function(event) {
            this._refreshSelectButtonState(event.memo.node);
        }.bind(this));

        _tree.showTreePrefetchNodes(_uri);

        return _tree;
    },

    _refreshSelectButtonState : function(folder) {
        if (!folder) return;

        var isOrganizations = !!folder.param.uri.match(dc.saveAsTopic.ORGANIZATION_MATCHER);
        if (folder.param.extra.isWritable && !isOrganizations) {
            buttonManager.enable(this.selectFromRepoButton);
        } else {
            buttonManager.disable(this.selectFromRepoButton);
        }
    },

    _createClickHandlersFactory : function() {
        return $H({
            '#selectFromRepoBtnCancel': function() {
                dialogs.popup.hide(this.browseRepositoryDialog);
            }.bind(this),
            '#selectFromRepoBtnSelect' : function() {
                $('topicLocation').value = this.saveAsTree.getSelectedFolderUri();
                dialogs.popup.hide(this.browseRepositoryDialog);
            }.bind(this)
        });
    }
};

////////////////////////////////////////////////
// Initialization entry point
///////////////////////////////////////////////

document.observe('dom:loaded', dc.initialize.bind(dc));
