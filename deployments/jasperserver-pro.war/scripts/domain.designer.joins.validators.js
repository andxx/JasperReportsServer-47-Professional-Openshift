/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////
// Delete join validator
////////////////////////////////

dd_joins.deleteJoinValidator = {
    _DELETE_CALCFIELDS_TEMPLATE_ID: 'calcFieldsForJoinConfirmMessage',
    _CALC_FIELDS_DETAILS_LINK_ID: '#calcFieldsForJoinsDetails',
    _DELETE_FILTERS_TEMPLATE_ID: 'filtersForJoinConfirmMessage',
    _callback: null,
    _validateUnjoinedTableForCalcFields: null,
    _buildDataIslands: null,
    _getNotJoinedTablesAfterDeleting: null,
    _involvedFieldsIds: null,
    _involvedFieldsExpressionIds: null,

    /////////////////
    // Public
    /////////////////

    init: function(validateUnjoinedTableForCalcFields, buildDataIslands, getNotJoinedTablesAfterDeleting) {
        dd_joins.deleteJoinValidator._init
                .bind(dd_joins.deleteJoinValidator, validateUnjoinedTableForCalcFields, buildDataIslands, getNotJoinedTablesAfterDeleting)()
    },

    validate: function(joins, join, callback) {
        dd_joins.deleteJoinValidator._validate
                .bind(dd_joins.deleteJoinValidator, joins, join, callback)()
    },

    /////////////////
    // Private
    /////////////////

    _init: function(validateUnjoinedTableForCalcFields, buildDataIslands, getNotJoinedTablesAfterDeleting) {
        this._validateUnjoinedTableForCalcFields = validateUnjoinedTableForCalcFields;
        this._buildDataIslands = buildDataIslands;
        this._getNotJoinedTablesAfterDeleting = getNotJoinedTablesAfterDeleting;
    },

    _validate: function(joins, join, callback) {
        this._callback = callback;
        
        var lostTable = this._findLostTable(joins, join);


        if (lostTable) {
            this._validateUnjoinedTableForCalcFields(lostTable, this._validationCallback.bind(this, joins, join));
        } else {
            this._validateIfJoinFiledsUsedInfilters(joins, join);
        }        
    },

    _validationCallback: function(joins, join, json) {
        if ('success' === json) {
            this._validateIfJoinFiledsUsedInfilters(joins, join);
            return;
        }

        this._involvedFieldsIds = json.involvedFieldsIds;
        this._involvedFieldsExpressionIds = json.involvedFieldsExpressionIds;

        domain.confirmDialog.show(
                this._DELETE_CALCFIELDS_TEMPLATE_ID,
                this._validateIfJoinFiledsUsedInfilters.bind(this, joins, join),
                this._onCancel.bind(this),
                this._showAffectedResources.bind(this));
    },

    _validateIfJoinFiledsUsedInfilters: function(joins, join) {
        var tablesFromJoinUsedInFilters = this._getNotJoinedTablesAfterDeleting(joins, join);

        if (tablesFromJoinUsedInFilters.first()) {
            domain.confirmDialog.show(
                    this._DELETE_FILTERS_TEMPLATE_ID,
                    this._onOk.bind(this),
                    this._onCancel.bind(this),
                    this._showAffectedResources.bind(this));
        } else {
            this._onOk();
        }
    },

    _onOk: function() {
        this._callback
        && this._callback(this._involvedFieldsIds, this._involvedFieldsExpressionIds);
    },

    _onCancel: function() {
        //do nothing
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._CALC_FIELDS_DETAILS_LINK_ID)) {
            domain.detailsDialog.show(this._involvedFieldsExpressionIds);
            return true;
        }
    },

    _findLostTable: function(joins, join) {
        var oldIslands = this._buildDataIslands(joins);
        var newIslands = this._buildDataIslands(joins.without(join));

        var lostTable = null;
        oldIslands.each(function(oldIsland) {
            oldIsland.each(function(oldTable) {
                var tableFound = false;

                newIslands.each(function(newIsland) {
                    newIsland.each(function(newTable) {
                        if (oldTable == newTable) {
                            tableFound = true;
                        }
                    });
                });

                if (!tableFound) {
                    lostTable = oldTable;
                    throw $break;
                }
            });

            if (lostTable) {
                throw $break;
            }
        });

        return lostTable;
    }
};

////////////////////////////////
// Create join validator
////////////////////////////////
dd_joins.createJoinValidator = {
    _CREATE_COMPOSITE_KEY: 'createCompositeKeyConfirmMessage',
    _callback: null,

    /////////////////
    // Public
    /////////////////

    validate: function(leftField, rightField, existingJoins, callback) {
        dd_joins.createJoinValidator._validate
                .bind(dd_joins.createJoinValidator, leftField, rightField, existingJoins, callback)()
    },

    /////////////////
    // Private
    /////////////////

    _validate: function(leftField, rightField, existingJoins, callback) {
        this._callback = callback;

        var leftTableId = leftField.parent.param.id;
        var rightTableId = rightField.parent.param.id;

        var tablesAlreadyJoined = false;

        existingJoins.each(function(join) {
            var leftTablePresentInJoin =
                    (join.left.table.id === leftTableId || join.right.table.id === leftTableId);

            var rightTablePresentInJoin =
                    (join.left.table.id === rightTableId || join.right.table.id === rightTableId);

            if (leftTablePresentInJoin && rightTablePresentInJoin) {
                tablesAlreadyJoined = true;
                throw $break;
            }
        });

        if (!tablesAlreadyJoined) {
            this._onOk();
            return;
        }

        domain.confirmDialog.show(
                this._CREATE_COMPOSITE_KEY,
                this._onOk.bind(this),
                this._onCancel.bind(this),
                null);
    },

    _onOk: function() {
        this._callback && this._callback();
    },

    _onCancel: function() {
        //do nothing
    }
};
