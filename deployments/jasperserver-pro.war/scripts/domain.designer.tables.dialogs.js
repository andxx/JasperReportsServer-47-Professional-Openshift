/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////////
// Manage Data Source dialog
//////////////////////////////

dd_tables.manageDataSourceDialog = {
    _OK_BUTTON_ID: 'ok',
    _DIALOG_DOM_ID: 'manageDataSource',
    _DATA_SOURCE_ALIAS_ID: 'dataSourceAlias',
    _SELECT_SCHEMAS_ID: 'selectSchemas',
    _dialog: null,
    _callback: null,
    _selectSchema: null,
    _getSchemas: null,

    _dataSourceUri: null,
    _dataSourceId: null,
    _selectedDataSourceProperties: null,
    _dataSourcePropertiesCache: {},
    _doNotSelectSchema: true,

    _visible: false,

    /////////////
    // Public
    ////////////

    init: function(options) {
        dd_tables.manageDataSourceDialog._init.bind(dd_tables.manageDataSourceDialog, options)();
    },

    show: function(dataSource, selectedDataSourceProperties) {
        dd_tables.manageDataSourceDialog._showInternal
                .bind(dd_tables.manageDataSourceDialog, dataSource, selectedDataSourceProperties)();
    },

    /////////////
    // Private
    ////////////

    _init: function(options) {
        this._dialog = $(this._DIALOG_DOM_ID);
        this._callback = options.callback,
        this._selectSchema = options.selectSchema,
        this._getSchemas = options.getSchemas,
        this._dataSourceUri = options.dataSourceUri;
        this._hasSchemas = options.hasSchemas;

        options.onSelectNode = function() {
            domain.enableButton(this._OK_BUTTON_ID, false);
            buttonManager.disable($(this._SELECT_SCHEMAS_ID));
        }.bind(this);

        options.selectDataSource = this._selectDataSource.bind(this);
        options.isVisible = this._isVisible.bind(this);
        options.getDataSourceId = this._getDataSourceId.bind(this);
        options.getAlias = this._getDataSourceAlias.bind(this);

        this.dataSourceTree.initialize(options);
        domain.registerClickHandlers([this._clickEventHandler.bind(this)]);
    },

    _showInternal: function(dataSource, selectedDataSourceProperties) {
        this._doNotSelectSchema = true;
        this._dataSourceUri = dataSource.uri;
        this._dataSourceId = dataSource.id;
        $(this._DATA_SOURCE_ALIAS_ID).value = dataSource.name;
        this._selectedDataSourceProperties = selectedDataSourceProperties[dataSource.name];

        if (!this._dataSourcePropertiesCache[this._dataSourceUri]) {
            var callback = function(dataSourceProperties) {
                this._handleDataSourceProperties(this._getSelectedDataSource(), false, dataSourceProperties);
                this._enableSelectSchemas(this._dataSourcePropertiesCache[this._dataSourceUri]);
            }.bind(this);

            this._getSchemas(this._getSelectedDataSource(), callback)
        }

        this._show();

        this.dataSourceTree.selectFolder(this._dataSourceUri);
        domain.enableButton(this._OK_BUTTON_ID, true);
    },

    _clickEventHandler: function(element) {
        var eventHandled = false;
        this.clickHandlerFactory.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                pair.value.bind(this)();
                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    _show: function() {
        this._visible = true;
        dialogs.popup.show(this._dialog, true);
    },

    _hide: function() {
        dialogs.popup.hide(this._dialog);
        this._visible = false;
    },

    _selectDataSource: function(newDataSource) {
        if (this._doNotSelectSchema) {
            this._doNotSelectSchema = false;
            this._enableSelectSchemas(this._dataSourcePropertiesCache[this._dataSourceUri]);
            return;
        }

        domain.enableButton(this._OK_BUTTON_ID, false);

        this._selectSchema({
            dataSource: newDataSource,
            initialChange: false,
            callback: this._schemaSelectedCallback.bind(this, newDataSource),
            handleDsProps: this._handleDataSourceProperties.bind(this, newDataSource, true),
            dsProps: this._buildDataSourcePropertiesFromCache(newDataSource),
            selectedSchemas: this._selectedDataSourceProperties.schemas,
            hideDialog: this._hide.bind(this),
            showDialog: this._show.bind(this)
        });
    },

    _buildDataSourcePropertiesFromCache: function(dataSource) {
        var dsProperties = null;
        if (this._dataSourcePropertiesCache[dataSource.uri]) {
            dsProperties = {};
            dsProperties[dataSource.name]
                    = this._dataSourcePropertiesCache[dataSource.uri];
        }

        return dsProperties;
    },

    _schemaSelectedCallback: function(dataSource, selectedDataSourceProperties) {
        this._selectedDataSourceProperties = selectedDataSourceProperties[dataSource.name];
        this._dataSourceUri = dataSource.uri;
        this._dataSourceId = dataSource.id;
        this._enableSelectSchemas(this._dataSourcePropertiesCache[this._dataSourceUri]);
        domain.enableButton(this._OK_BUTTON_ID, true);
    },

    _handleDataSourceProperties: function(dataSource, hideDialog, dataSourceProperties) {
        this._hasSchemas(dataSourceProperties, dataSource.name) && (hideDialog && this._hide());
        this._dataSourcePropertiesCache[dataSource.uri] = dataSourceProperties[dataSource.name];
    },

    _onOk: function() {
        if (this._isDataValid()) {
            dd.setUnsavedChangesPresent(true);
            this._callback &&
            this._callback(
                    this._getSelectedDataSource(),
                    this._getSelectedDataSourceProperties());
            this._hide();
        }
    },

    _onCancel: function() {
        ValidationModule.hideError($(this._DATA_SOURCE_ALIAS_ID));
        this._hide();
    },

    _enableSelectSchemas: function(dsProps) {
        if ((dsProps && dsProps.schemas && dsProps.schemas.first()))  {
            buttonManager.enable($(this._SELECT_SCHEMAS_ID));
        } else {
            buttonManager.disable($(this._SELECT_SCHEMAS_ID));
        }
    },

    _selectSchemas: function() {
        var dataSource = this._getSelectedDataSource();
        this._hide();

        var callback = function(selectedDataSourceProperties) {
            this._show();
            this._schemaSelectedCallback(dataSource, selectedDataSourceProperties);
        }.bind(this);

        this._selectSchema({
                    dataSource: dataSource,
                    initialChange: false,
                    callback: callback,
                    handleDsProps: null, //At this moment we always have schemas in cache
                    dsProps: this._buildDataSourcePropertiesFromCache(dataSource),
                    selectedSchemas: this._selectedDataSourceProperties.schemas
                });
    },

    _isDataValid : function() {
        return ValidationModule.validate([
            {
                validator: function(value) {
                    return {
                        isValid: !!value,
                        errorMessage: domain.getMessage('manageDataSource.emptyName')
                    }
                },
                element: $(this._DATA_SOURCE_ALIAS_ID)
            }
        ]);
    },

    _getSelectedDataSource: function() {
        return {
            id: this._dataSourceId,
            name: this._getDataSourceAlias(),
            uri: this._dataSourceUri
        };
    },

    _getSelectedDataSourceProperties: function() {
        var selectedProperties = {};
        selectedProperties[this._getDataSourceAlias()]
                = this._selectedDataSourceProperties;
        return selectedProperties;
    },

    _getDataSourceAlias: function() {
        return $F(this._DATA_SOURCE_ALIAS_ID);
    },

    _getDataSourceId: function() {
        return this._dataSourceId;
    },

    _isVisible: function() {
        return this._visible;
    }
};

var mds_dialog = dd_tables.manageDataSourceDialog;

//////////////////////////////
// Manage Data Source Tree
//////////////////////////////

mds_dialog.dataSourceTree = {
    _TREE_ID: 'selectDataSourceTree',
    _PROVIDER_ID: 'dataSourceTreeDataProvider',
    _organizationId: null,
    _publicFolderUri: null,
    _uri: null,
    _tree: null,
    _onSelectNode: null,
    _selectDataSource: null,
    _isVisible: null,
    _getDataSourceId: null,
    _getAlias: null,

    /////////////
    // Public
    ////////////

    initialize: function (options) {
        mds_dialog.dataSourceTree._initialize
                .bind(mds_dialog.dataSourceTree, options)();
    },

    selectFolder: function(uri) {
        mds_dialog.dataSourceTree._selectFolder
                .bind(mds_dialog.dataSourceTree, uri)();
    },

    //////////////////
    // Private
    //////////////////

    _initialize: function (options) {
        this._uri = options.dataSourceUri;
        this._organizationId = options.organizationId;
        this._publicFolderUri = options.publicFolderUri;
        this._onSelectNode = options.onSelectNode;
        this._selectDataSource = options.selectDataSource;
        this._isVisible = options.isVisible;
        this._getDataSourceId = options.getDataSourceId;
        this._getAlias = options.getAlias;

        // Setup folders tree
        this._tree = dynamicTree.createRepositoryTree(this._TREE_ID, {
            providerId: this._PROVIDER_ID,
            rootUri: '/',
            organizationId: this._organizationId,
            publicFolderUri: this._publicFolderUri
        });

        for (var event in this.treeEventHandlerFactory) {
            this._tree.observe(event, this.treeEventHandlerFactory[event].bindAsEventListener(this));
        }

        this._tree.showTreePrefetchNodes(this._uri);
    },

    _selectFolder: function(uri) {
        this._uri = uri;
        this._tree.openAndSelectNode(uri);
    },

    _childrenPrefetchedLoaded: function(event) {
        if (this._isVisible()) {
            this._tree.openAndSelectNode(this._uri);
        }
    },

    _treeLoaded: function(event) {
        if (this._isVisible()) {
            this._tree.openAndSelectNode(this._uri);
        }
    },

    _leafSelected: function(event) {
        var dataSource = {
            id: this._getDataSourceId(),
            name: this._getAlias(),
            uri: event.memo.node.param.uri
        };

        this._selectDataSource(dataSource);
    },

    _nodeSelected: function(event) {
        this._onSelectNode();
    }
};

/////////////////////////////////
// Select schemas dialog
/////////////////////////////////

dd_tables.selectSchemasDialog = {
    _SELECT_DIALOG_DOM_ID: 'select',
    _SCHEMA_DIALOG_LIST_DOM_ID: 'schemasList',
    _SELECT_DIALOG_OK_BUTTON_ID: 'selectDialogOk',
    _LIST_TEMPLATE: 'list_responsive_collapsible_fields',
    _LIST_ITEM_TEMPLATE: 'list_responsive_collapsible_fields:fields',
    _dialog: null,
    _callback: null,
    _standalone: true,
    _list: null,
    _listItems: null,
    _selectedSchemas: null,
    _dataSource: null,
    _findInvalidFields: null,
    _fixSchemaPrefixesValidate: null,

    //////////////////
    // Public
    //////////////////

    init: function(findInvalidFields, fixSchemaPrefixesValidate) {
        dd_tables.selectSchemasDialog._init.bind(dd_tables.selectSchemasDialog, findInvalidFields, fixSchemaPrefixesValidate)();
    },

    show: function(props) {
        dd_tables.selectSchemasDialog._show.bind(dd_tables.selectSchemasDialog, props)();
    },

    //////////////////
    // Private
    //////////////////

    _init: function(findInvalidFields, fixSchemaPrefixesValidate) {
        this._dialog = $(this._SELECT_DIALOG_DOM_ID);
        this._findInvalidFields = findInvalidFields;
        this._fixSchemaPrefixesValidate = fixSchemaPrefixesValidate;

        this._list = new dynamicList.List(this._SCHEMA_DIALOG_LIST_DOM_ID, {
            listTemplateDomId: this._LIST_TEMPLATE,
            itemTemplateDomId: this._LIST_ITEM_TEMPLATE,
            multiSelect: true,
            items: []
        });

        this._list.observe('item:click', this._listClickHandler.bindAsEventListener(this));
        domain.registerClickHandlers([this._clickeventHandler.bind(this)]);
    },

    _show: function(props) {
        this._callback = props.callback;
        this._selectedSchemas = props.selectedSchemas ? props.selectedSchemas : [];
        this._dataSource = props.dataSource;
        this._standalone = props.standalone;
        this._initList(props.schemasList, props.selectedSchemas);

        if (this._standalone) {
            domain.enableButton(this._SELECT_DIALOG_OK_BUTTON_ID, false);
        }

        dialogs.popup.show(this._dialog, true);
    },

    _clickeventHandler: function(element) {
        var eventHandled = false;
        this.clickEventHandlerFactory.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                pair.value.bind(this)();
                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    _listClickHandler: function() {
        domain.enableButton(this._SELECT_DIALOG_OK_BUTTON_ID, this._list.getSelectedItems().first());
    },

    _hide: function() {
        dialogs.popup.hide(this._dialog);
    },

    _onOk: function() {
        this._hide();
        this._fixSchemaPrefixesValidate(
            this._findInvalidFields,
            this._findInvalidFieldsCallback.bind(this),
            this._getSelectedSchemasList(),
            this._dataSource
        );
    },

    _getSelectedSchemasList: function() {
        return this._list.getSelectedItems().collect(function(item) {
            return item.getValue();
        });
    },

    _findInvalidFieldsCallback: function() {
        this._callback && this._callback(this._getSelectedSchemasList());
    },

    _onCancel: function() {
        if (this._standalone) {
            domain.submitForm(dd.formDomId, {_eventId: "cancel", _flowExecutionKey: dd.flowExecutionKey, flowId: dd.FLOW_ID}, dd.fillForm);
        } else {
            this._hide();
            this._callback && this._callback(this._selectedSchemas);
        }
    },

    _initList: function(listItems, selectedItems) {
        this._items && this._list.removeItems(this._items);

        var itemsToSelect = [];

        this._items = listItems.collect(function(listItem) {
            var item = new dynamicList.ListItem({
                label: listItem,
                value: listItem
            });

            if (selectedItems && selectedItems.first()) {
                var existingItem = selectedItems.find(function(sItem) {
                    return sItem === listItem;
                });

                !!existingItem && itemsToSelect.push(item);
            }

            return item;
        });

        this._list.setItems(this._items);
        this._list.show();

        if (itemsToSelect.first()) {
            itemsToSelect.each(function(item) {
                item.select();
            });
        }
    }
};

var ss_dialog = dd_tables.selectSchemasDialog;

/////////////////////
// Factories
/////////////////////

mds_dialog.clickHandlerFactory = $H({
    '#ok': mds_dialog._onOk,
    '#cancel': mds_dialog._onCancel,
    '#selectSchemas': mds_dialog._selectSchemas
});

mds_dialog.dataSourceTree.treeEventHandlerFactory = {
    'server:error': domain.treeErrorHandler,
    'childredPrefetched:loaded': mds_dialog.dataSourceTree._childrenPrefetchedLoaded,
    'tree:loaded': mds_dialog.dataSourceTree._treeLoaded,
    'leaf:selected': mds_dialog.dataSourceTree._leafSelected,
    'node:selected': mds_dialog.dataSourceTree._nodeSelected
};

ss_dialog.clickEventHandlerFactory = $H({
    '#selectDialogOk': ss_dialog._onOk,
    '#selectDialogCancel': ss_dialog._onCancel
});
