/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////////////
// Check design validator
///////////////////////////////////

dd.checkDesignValidator = {
    _INVALID_DESIGN_TEMPLATE_DOM_ID: 'invalidDesignConfirmMessage',
    _INVALID_DESIGN_LINK_ID: '#designDetails',
    _DONE_BUTTON_ID: 'done',

    _callback: null,
    _errorMessage: null,
    _showConfirmation: null,

    ////////////////////////
    // Public
    ////////////////////////

    validate: function(showConfirmation, callback) {
        dd.checkDesignValidator._validate.bind(dd.checkDesignValidator, showConfirmation, callback)();
    },

    ////////////////////////
    // Private
    ////////////////////////

    _validate: function(showConfirmation, callback) {
        this._callback = callback;
        this._showConfirmation = showConfirmation;
        dd.emptySetsValidator.validate(this._emptySetsCallback.bind(this));
    },

    _emptySetsCallback: function(json) {
        if (json === 'empty') {
            domain.enableButton(this._DONE_BUTTON_ID, false);
        }

        dd.checkDesign.bind(dd, this._checkDesignCallback.bind(this))();
    },

    _checkDesignCallback: function(json) {
        if ('success' === json) {
            this._callback ? this._callback() : dialogs.systemConfirm.show(domain.getMessage('designIsValid'));
        } else {
            this._errorMessage = json.errorMessage;

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

///////////////////////////////////
// Check empty sets validator
///////////////////////////////////

dd.emptySetsValidator = {
    _EMPTY_SETS_TEMPLATE_DOM_ID: 'emptySetsConfirmMessage',
    _EMPTY_SETS_LINK_ID: '#emptySetsDetails',
    _callback: null,
    _emptySets: null,

    ////////////////////////
    // Public
    ////////////////////////

    validate: function(callback) {
        dd.emptySetsValidator._validate.bind(dd.emptySetsValidator, callback)();
    },

    ////////////////////////
    // Private
    ////////////////////////

    _validate: function(callback) {
        this._callback = callback;
        dd.checkForEmptySets
                .bind(dd, this._checkCallback.bind(this))()
    },

    _checkCallback: function(emptySets) {
        if (emptySets && emptySets.first()) {
            this._emptySets = emptySets;
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
        dd.deleteEmptySets.bind(dd, this._emptySets, this._callback)()
    },

    _onCancel: function() {
        this._callback && this._callback();
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._EMPTY_SETS_LINK_ID)) {
            domain.detailsDialog.show(this._emptySets);
            return true;
        }
    }
};

/////////////////////////////////////
// Export schema prefixes validator
/////////////////////////////////////

dd.exportSchemaValidator = {
    _EXPORT_SCHEMA_PREFIXES_TEMPLATE_DOM_ID: 'exportSchemaPrefixesConfirmMessage',
    _callback: null,

    ////////////////////////
    // Public
    ////////////////////////

    validate: function(callback) {
        dd.exportSchemaValidator._validate.bind(dd.exportSchemaValidator, callback)();
    },

    ////////////////////////
    // Private
    ////////////////////////

    _validate: function(callback) {
        this._callback = callback;
        dd.getCheckDesignValidator().validate(true, this._checkDesignValidatorCallback.bind(this))
    },

    _checkDesignValidatorCallback: function() {
        if (dd.hasSchemas) {
            domain.confirmDialog.show(
                this._EXPORT_SCHEMA_PREFIXES_TEMPLATE_DOM_ID,
                this._onOk.bind(this),
                this._onCancel.bind(this),
                null,
                domain.confirmDialog.MODE_YES_NO
            );

        } else {
            this._callback && this._callback();
        }
    },

    _onOk: function() {
        this._callback && this._callback(true);
    },

    _onCancel: function() {
        this._callback && this._callback(false);
    }
};

/////////////////////////////////////
// Export bundles validator
/////////////////////////////////////

dd.exportBundlesValidator = {
    _EXPORT_BUNDLES_TEMPLATE_DOM_ID: 'exportBundlesConfirmMessage',
    _GENERATE_LABEL_KEYS_PATTERN: '#autoGenerateLabelKeys',
    _GENERATE_LABEL_KEYS_ID: 'generateLabelKeys',
    _GENERATE_DESCR_KEYS_PATTENR: '#autoGenerateDescriptionKeys',
    _GENERATE_DESCR_KEYS_ID: 'generateDescriptionKeys',
    _callback: null,
    _generateLabelKeys: false,
    _generateDescrKeys: false,

    ////////////////////////
    // Public
    ////////////////////////

    validate: function(callback) {
        dd.exportBundlesValidator._validate.bind(dd.exportBundlesValidator, callback)();
    },

    ////////////////////////
    // Private
    ////////////////////////

    _validate: function(callback) {
        this._callback = callback;
        dd.getCheckDesignValidator().validate(true, this._checkDesignValidatorCallback.bind(this))
    },

    _checkDesignValidatorCallback: function() {
        domain.confirmDialog.show(
            this._EXPORT_BUNDLES_TEMPLATE_DOM_ID,
            this._onOk.bind(this),
            this._onCancel.bind(this),
            this._handleCheckBoxes.bind(this)
        );
    },

    _onOk: function() {
        this._callback
        && this._callback(this._generateDescrKeys, this._generateLabelKeys);
    },

    _onCancel: function() {

    },

    _handleCheckBoxes: function(element) {
        if (matchMeOrUp($(element), this._GENERATE_LABEL_KEYS_PATTERN)) {
           this._generateLabelKeys = $F(this._GENERATE_LABEL_KEYS_ID);
           return domain.PROPAGATE_EVENT;
        } else if (matchMeOrUp($(element),this._GENERATE_DESCR_KEYS_PATTENR)) {
            this._generateDescrKeys = $F(this._GENERATE_DESCR_KEYS_ID);
            return domain.PROPAGATE_EVENT;
        }
    }
};

////////////////////////////////
// Delete calc fields validator
////////////////////////////////

dd.deleteCalcFieldsValidator = {
    _DELETE_CALCFIELDS_TEMPLATE_ID: 'calcFieldsConfirmMessage',
    _CALC_FIELDS_DETAILS_LINK_ID: '#calcFieldsDetails',
    _involvedFieldsIds: null,
    _involvedFieldsExpressionIds: null,
    _nodes: null,
    _callback: null,
    _validateForCalcFields: null,

    /////////////////
    // Public
    /////////////////

    init: function(validateForCalcFields) {
        dd.deleteCalcFieldsValidator._init
                .bind(dd.deleteCalcFieldsValidator, validateForCalcFields)()
    },

    validate: function(nodes, isRealTables, callback) {
        dd.deleteCalcFieldsValidator._validate
                .bind(dd.deleteCalcFieldsValidator, nodes, isRealTables, callback)()
    },

    /////////////////
    // Private
    /////////////////

    _init: function(validateForCalcFields) {
        this._validateForCalcFields = validateForCalcFields;
    },

    _validate: function(nodes, isRealTables, callback) {
        this._nodes = nodes;
        this._callback = callback;

        var tableIds = Object.toJSON(nodes.collect(function(node) {
            return node.param.extra.datasourceId + "." + node.param.extra.itemId;
        }));

        this._validateForCalcFields(tableIds, isRealTables, this._validationCallback.bind(this));
    },

    _validationCallback: function(json) {
        this._involvedFieldsIds = [];
        this._involvedFieldsExpressionIds = [];

        if ('success' === json) {
            this._onOk();
        } else {
            this._involvedFieldsIds = json.involvedFieldsIds;
            this._involvedFieldsExpressionIds = json.involvedFieldsExpressionIds;

            domain.confirmDialog.show(
                    this._DELETE_CALCFIELDS_TEMPLATE_ID,
                    this._onOk.bind(this),
                    this._onCancel.bind(this),
                    this._showAffectedResources.bind(this));
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
    }
};

////////////////////////////////
// Delete fiters validator
////////////////////////////////

dd.deleteFiltersValidator = {
    _DELETE_FILTERS_TEMPLATE_ID: 'deleteFiltersConfirmMessage',
    _FILTER_DETAILS_LINK_ID: '#filtersDetails',
    _tablesAffectedInFilters: null,
    _nodes: null,
    _callback: null,
    _getTablesUsedForFilters: null,

    /////////////////
    // Public
    /////////////////

    init: function(getTablesUsedForFilters) {
        dd.deleteFiltersValidator._init
                .bind(dd.deleteFiltersValidator, getTablesUsedForFilters)()
    },

    validate: function(nodes, callback) {
        dd.deleteFiltersValidator._validate
                .bind(dd.deleteFiltersValidator, nodes, callback)()
    },

    /////////////////
    // Private
    /////////////////

    _init: function(getTablesUsedForFilters) {
        this._getTablesUsedForFilters = getTablesUsedForFilters;
    },

    _validate: function(nodes, callback) {
        this._callback = callback;

        this._tablesAffectedInFilters =
                this._getTablesUsedForFilters(nodes);

        if (this._tablesAffectedInFilters.first()) {
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
        this._callback && this._callback();
    },

    _onCancel: function() {
        //do nothing
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._FILTER_DETAILS_LINK_ID)) {
            domain.detailsDialog.show(this._tablesAffectedInFilters);
            return true;
        }
    }
};

////////////////////////////////////
// Composite validator for
// deleting calc fields and filters
////////////////////////////////////

dd.calcFieldsAndFiltersValidator = {
    ////////////////////
    // Public
    ///////////////////
    init: function(validateForCalcFields, getTablesUsedForFilters) {
        dd.deleteCalcFieldsValidator.init(validateForCalcFields);
        dd.deleteFiltersValidator.init(getTablesUsedForFilters);        
    },
    
    validate: function(nodes, isRealTables, callback) {
        dd.deleteCalcFieldsValidator.validate(
                nodes,
                isRealTables,
                dd.calcFieldsAndFiltersValidator._deleteCalcFieldsCallback
                        .bind(dd.calcFieldsAndFiltersValidator, callback, nodes));
    },

    ////////////////////
    // Private
    ///////////////////
    _deleteCalcFieldsCallback: function(callback, nodes, involvedFieldsIds, involvedFieldsExpressionIds) {
        dd.deleteFiltersValidator.validate(nodes, this._deleteFiltersCallback.bind(this, callback, involvedFieldsIds, involvedFieldsExpressionIds))
    },

    _deleteFiltersCallback: function(callback, involvedFieldsIds, involvedFieldsExpressionIds) {
        callback && callback(involvedFieldsIds, involvedFieldsExpressionIds);
    }
};
