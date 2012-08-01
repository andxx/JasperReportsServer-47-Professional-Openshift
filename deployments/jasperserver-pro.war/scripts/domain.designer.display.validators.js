/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////
// Delete view item validator
////////////////////////////////

dd_display.deleteViewItemValidator = {
    _DELETE_VIEW_ITEMS_TEMPLATE_ID: 'deleteViewItemsConfirmMessage',
    _VIEW_ITEMS_DETAILS_LINK_ID: '#viewItemsDetails',
    _DONT_WARN_ID: 'dontWarnInCurrentSession',
    _CREATE_MODE: "createMode",
    _EDIT_MODE: "editMode",    
    _mode: null,
    _isDontWarnOfDeleteItems: null,
    _setDontWarnOfDeleteItems: null,
    _buildCompositeIdentifier: null,
    _fieldsInfo: null,

    /////////////////
    // Public
    /////////////////

    init: function(mode, isDontWarnOfDeleteItems, setDontWarnOfDeleteItems, buildCompositeIdentifier) {
        dd_display.deleteViewItemValidator._init
                .bind(dd_display.deleteViewItemValidator)(mode, isDontWarnOfDeleteItems, setDontWarnOfDeleteItems, buildCompositeIdentifier);
    },

    validate: function(items, callback) {
        dd_display.deleteViewItemValidator._validate
                .bind(dd_display.deleteViewItemValidator)(items, callback);
    },

    /////////////////
    // Private
    /////////////////

    _init: function(mode, isDontWarnOfDeleteItems, setDontWarnOfDeleteItems, buildCompositeIdentifier) {
        this._mode = mode;
        this._isDontWarnOfDeleteItems = isDontWarnOfDeleteItems;
        this._setDontWarnOfDeleteItems = setDontWarnOfDeleteItems;
        this._buildCompositeIdentifier = buildCompositeIdentifier;
    },

    _validate: function(items, callback) {

        this._fieldsInfo = this._getFieldsInfo(items);
        var showWarning = this._mode === this._EDIT_MODE && !this._isDontWarnOfDeleteItems() && this._fieldsInfo.first();
        
        if (!showWarning) {
            this._onOk.bind(this)(items, callback);
            return;
        }

        domain.confirmDialog.show(
            this._DELETE_VIEW_ITEMS_TEMPLATE_ID,
            this._onOk.bind(this, items, callback),
            this._onCancel.bind(this),
            this._showAffectedResources.bind(this));
    },

    _getFieldInfo: function(node) {
        var getNodeId = function(node) {
            return node.param.extra.itemId;
        };

        var rootNode = dynamicTree.trees[node.getTreeId()].getRootNode();

        var uri = '/' + this._buildCompositeIdentifier(node, '/', getNodeId, rootNode);

        var label = node.param.extra.label ? node.param.extra.label : node.param.extra.itemId;
        return label + ' ' + uri + ' ' + node.param.extra.dataType;
    },

    _getFieldsInfo: function(nodes) {
        var fieldsData = [];
        nodes.each(function(node) {
            if (node.param.type === node.Types.Folder.name) {
                fieldsData =  fieldsData.concat(this._getFieldsInfo(node.childs));
            } else {
                fieldsData.push(this._getFieldInfo(node));
            }
        }.bind(this));

        return fieldsData;
    },

    _onOk: function(items, callback) {
        this._setDontWarnOfDeleteItems && this._setDontWarnOfDeleteItems(!!$F(this._DONT_WARN_ID));
        callback && callback(items);
    },

    _onCancel: function() {
        //do nothing
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._VIEW_ITEMS_DETAILS_LINK_ID)) {
            domain.detailsDialog.show(this._fieldsInfo);
            return true;
        }
    }
};


////////////////////////////////
// Add view Item validator
////////////////////////////////
dd_display.addViewItemsValidator = {

    /////////////////
    // Public
    /////////////////
    init: function(getDataIslandId) {
        dd_display.addViewItemsValidator._init
                .bind(dd_display.addViewItemsValidator)(getDataIslandId);
    },

    validate: function(parentItem, items, callback) {
        dd_display.addViewItemsValidator._validate
                .bind(dd_display.addViewItemsValidator)(parentItem, items, callback);
    },

    /////////////////
    // Private
    /////////////////
    _init: function(getDataIslandId) {
        this._getDataIslandId = getDataIslandId;
    },

    _validate: function(parentItem, items, callback) {
        var resourceId = '';
        var parentNode = parentItem;
        while (resourceId === '' && parentNode.parent) {
            resourceId = parentNode.param.extra.resourceId;
            parentNode = parentNode.parent;
        }

        var fromDifferentDataIslands = items.find(function(item) {
            var dataIslandId = this._getDataIslandId(item, 'itemId');
            return resourceId && resourceId !== item.CONSTANT_TABLE_ID && dataIslandId !== item.CONSTANT_TABLE_ID && dataIslandId !== resourceId;
        }.bind(this));

        if (fromDifferentDataIslands) {
            domain.detailsDialog.show(domain.getMessage('items.fromDifferentDataIslands'));
        } else {
            callback && callback();
        }
    }
};

//////////////////////////////////////
// Display View Empty Sets Validator
//////////////////////////////////////

dd_display.emptySetsValidator = {
    _EMPTY_SETS_TEMPLATE_DOM_ID: 'emptySetsConfirmMessage',
    _EMPTY_SETS_LINK_ID: '#emptySetsDetails',
    _callback: null,
    _emptySetUris: null,
    _emptySetIds: null,
    _copyMoveController: null,
    _getTree: null,

    ////////////////////////
    // Public
    ////////////////////////
    init: function(getTree, copyMoveController) {
        dd_display.emptySetsValidator._init.bind(dd_display.emptySetsValidator)(getTree, copyMoveController);
    },

    validate: function(callback) {
        dd_display.emptySetsValidator._validate.bind(dd_display.emptySetsValidator)(callback);
    },

    ////////////////////////
    // Private
    ////////////////////////
    _init: function(getTree, copyMoveController) {
        this._getTree = getTree;
        this._copyMoveController = copyMoveController;
    },

    _validate: function(callback) {
        this._callback = callback;

        var emptySets = $H(this._getTree().treeMap).values().findAll(function(item) {
            return item.param.type === item.Types.Folder.name && item !== this._getTree().getRootNode() && !item.childs.first();
        }.bind(this));

        if (emptySets && emptySets.first()) {
            this._emptySetUris = emptySets.collect(function(emptySet) {
                return emptySet.param.uri;
            });
            this._emptySetIds = emptySets.collect(function(emptySet) {
                return emptySet.param.id;
            });

            domain.confirmDialog.show(
                this._EMPTY_SETS_TEMPLATE_DOM_ID,
                this._onOk.bind(this),
                this._onCancel.bind(this),
                this._showAffectedResources.bind(this)
            );
        } else {
            this._callback && this._callback();
        }
    },

    _onOk: function() {
        dd.deleteNodesFromTreeById(this._emptySetIds, this._getTree(), this._copyMoveController);
        this._callback && this._callback();
    },

    _onCancel: function() {
        this._callback && this._callback();
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._EMPTY_SETS_LINK_ID)) {
            domain.detailsDialog.show(this._emptySetUris);
            return true;
        }
    }
};

///////////////////////////////////
// Check design validator
///////////////////////////////////

dd_display.checkDesignValidator = {
    _INVALID_DESIGN_TEMPLATE_DOM_ID: 'invalidDesignConfirmMessage',
    _INVALID_DESIGN_LINK_ID: '#designDetails',

    _callback: null,
    _errorMessage: null,
    _showConfirmation: null,
    _refreshViewTreeStyle: null,

    ////////////////////////
    // Public
    ////////////////////////
    init: function(refreshViewTreeStyle) {
        dd_display.checkDesignValidator._init.bind(dd_display.checkDesignValidator)(refreshViewTreeStyle);
    },

    validate: function(showConfirmation, callback) {
        dd_display.checkDesignValidator._validate.bind(dd_display.checkDesignValidator, showConfirmation, callback)();
    },

    ////////////////////////
    // Private
    ////////////////////////
    _init: function(refreshViewTreeStyle) {
        this._refreshViewTreeStyle = refreshViewTreeStyle;
    },

    _validate: function(showConfirmation, callback) {
        this._callback = callback;
        this._showConfirmation = showConfirmation;
        dd_display.emptySetsValidator.validate(this._emptySetsCallback.bind(this));
    },

    _emptySetsCallback: function() {       
        dd.checkDesign.bind(dd, this._checkDesignCallback.bind(this))();
    },

    _checkDesignCallback: function(json) {
        if ('success' === json) {
            this._refreshViewTreeStyle();
            this._callback ? this._callback() : dialogs.systemConfirm.show(domain.getMessage('designIsValid'));
        } else {
            this._errorMessage = json.errorMessage;
            this._refreshViewTreeStyle(json.presentationObjectIds);
            if (!this._showConfirmation) {
                domain.detailsDialog.show(this._errorMessage);
            } else {
                domain.confirmDialog.show(
                    this._INVALID_DESIGN_TEMPLATE_DOM_ID,
                    this._onOk.bind(this),
                    this._onCancel.bind(this),
                    this._showAffectedResources.bind(this),
                    domain.confirmDialog.MODE_YES_NO
                );
            }
        }
    },

    _onOk: function() {
        this._callback && this._callback();
    },

    _onCancel: function() {

    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._INVALID_DESIGN_LINK_ID)) {
            domain.detailsDialog.show(this._errorMessage);
            return true;
        }
    }
};