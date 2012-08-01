/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////////////
// Auto generate joins validator
//////////////////////////////////

dd_tables.autoGenerateJoinsValidator = {
    _REGENERATE_JOINS_TEMPLATE_ID: 'regenerateJoinsConfirmMessage',
    _REGENERATE_JOINS_CHECKBOX_PATTERN: 'label[for=inspectAndJoin]',
    _REGENERATE_JOINS_CHECKBOX_DOM_ID: 'inspectAndJoin',
    _JOINS_DETAILS_LINK_ID: '#joinsDetails',
    _joinsCheckbox: null,
    _joinsList: [],

    ////////////////
    // Public
    ////////////////

    init: function(joins) {
        dd_tables.autoGenerateJoinsValidator._init
                .bind(dd_tables.autoGenerateJoinsValidator, joins)()
    },

    ////////////////
    // Private
    ////////////////

    _init: function(joins) {
        this._buildJoinsList(joins);
        this._joinsCheckbox = $(this._REGENERATE_JOINS_CHECKBOX_DOM_ID);
        this._joinsCheckbox.observe('checkbox:check', this._checkBoxCheck.bindAsEventListener(this));
        domain.registerClickHandlers([this._clickEventHandler.bind(this)]);
    },

    _clickEventHandler: function(element) {
        if (matchAny(element, [this._REGENERATE_JOINS_CHECKBOX_PATTERN], true)) {
            var hasJoins = this._joinsList.length > 0;
            var checkBoxChecked =
                    element.identify() === this._REGENERATE_JOINS_CHECKBOX_DOM_ID
                            ? $F(this._joinsCheckbox)
                            : !$F(this._joinsCheckbox);

            if (hasJoins && checkBoxChecked) {
                domain.confirmDialog.show(
                    this._REGENERATE_JOINS_TEMPLATE_ID,
                    this._onOk.bind(this), this._onCancel.bind(this),
                    this._showAffectedResources.bind(this));
                return true;
            } else {
                return domain.PROPAGATE_EVENT;
            }
        }
    },

    _buildJoinsList: function(joins) {
        this._joinsList = [];

        var fieldsList = {};
        joins && joins.each(function(join) {
            fieldsList[join.left] = join.left;
            fieldsList[join.right] = join.right;
        });

        for (var field in fieldsList) {
            this._joinsList.push(field);
        }
    },

    _checkBoxCheck: function(event) {
        dd.setUnsavedChangesPresent(true);
        this._joinsCheckbox.checked = true;
    },

    _onOk: function() {
        this._joinsCheckbox.fire('checkbox:check');
    },

    _onCancel: function() {
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._JOINS_DETAILS_LINK_ID)) {
            domain.detailsDialog.show(this._joinsList);
            return true;
        }
    }
};

/////////////////////////////////////
// Invalid selected tables validator
/////////////////////////////////////

dd_tables.invalidSelectedTablesValidator = {
    _DELTE_SCHEMA_RESOURCES_TEMPLATE_ID: 'deleteSchemaResourcesConfirmMessage',
    _RESOURCE_DETAILS_LINK_ID: '#schemaResourceDetails',
    _invalidFields: null,
    _invalidFieldLabels: null,
    _callback: null,
    _findInvalidFields: null,
    _removeInvalidFields: null,

    ////////////////////////
    // Public
    ////////////////////////

    init: function(findInvalidFields, removeInvalidFields) {
        dd_tables.invalidSelectedTablesValidator._init
                .bind(dd_tables.invalidSelectedTablesValidator, findInvalidFields, removeInvalidFields)();
    },

    validate: function(callback) {
        dd_tables.invalidSelectedTablesValidator._validate
                .bind(dd_tables.invalidSelectedTablesValidator, callback)();
    },

    ////////////////////////
    // Private
    ////////////////////////

    _init: function(findInvalidFields, removeInvalidFields) {
        this._findInvalidFields = findInvalidFields;
        this._removeInvalidFields = removeInvalidFields;
    },

    _validate: function(callback) {
        this._callback = callback;
        this._invalidFields = this._findInvalidFields();

        if (!this._invalidFields || !this._invalidFields.first()) {
            this._callback && this._callback();
            return;
        } else {
            //keep just labels
            this._invalidFieldLabels = this._invalidFields.collect(function(field) {
                return field.param.extra.table + "." + field.param.extra.itemId;
            })
        }

        domain.confirmDialog.show(
                this._DELTE_SCHEMA_RESOURCES_TEMPLATE_ID,
                this._onOk.bind(this),
                this._onCancel.bind(this),
                this._showAffectedResources.bind(this));
    },

    _onOk: function() {
        this._removeInvalidFields(this._invalidFields);
        this._callback && this._callback();
    },

    _onCancel: function() {
        this._callback && this._callback();
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._RESOURCE_DETAILS_LINK_ID)) {
            domain.detailsDialog.show(this._invalidFieldLabels);
            return true;
        }
    }
};

///////////////////////////////////////
// Fields schema prefixes validator
///////////////////////////////////////

dd_tables.fixSchemaPrefixesValidator = {
    _FIX_SCHEMA_PREFIXES_TEMPLATE_DOM_ID: 'fixSchemaPrefixesConfirmMessage',
    _TABLE_DETAILS_LINK_ID: '#tablesDetails',
    _invalidTableLabels: null,
    _callback: null,
    _fixSchemaPrefixes: null,
    _selectedSchemasList: null,
    _dataSource: null,

    ////////////////////
    // Public
    ////////////////////

    init: function(fixSchemaPrefixes) {
        dd_tables.fixSchemaPrefixesValidator._init
                .bind(dd_tables.fixSchemaPrefixesValidator, fixSchemaPrefixes)();
    },

    validate: function(findInvalidFields, callback, selectedSchemasList, dataSource) {
        dd_tables.fixSchemaPrefixesValidator._validate
                .bind(dd_tables.fixSchemaPrefixesValidator, findInvalidFields, callback, selectedSchemasList, dataSource)();        
    },

    ////////////////////
    // Private
    ////////////////////

    _init: function(fixSchemaPrefixes) {
        this._fixSchemaPrefixes = fixSchemaPrefixes;
    },

    _validate: function(findInvalidFields, callback, selectedSchemasList, dataSource) {
        var invalidFields = findInvalidFields();
        this._callback = callback;
        this._selectedSchemasList = selectedSchemasList;
        this._dataSource = dataSource;

        if (invalidFields && invalidFields.first()) {
            this._buildInvalidTableLabels(invalidFields);

            domain.confirmDialog.show(
                    this._FIX_SCHEMA_PREFIXES_TEMPLATE_DOM_ID,
                    this._onOk.bind(this),
                    this._onCancel.bind(this),
                    this._showAffectedResources.bind(this));
        } else {
            callback && callback();
        }
    },

    _buildInvalidTableLabels: function(invalidFields) {
        this._invalidTableLabels = [];
        
        var invalidTableLabels = {};
        invalidFields.each(function(field) {
            invalidTableLabels[field.param.extra.table] = field.param.extra.table;
        });

        for (var tableLabel in invalidTableLabels) {
            this._invalidTableLabels.push(tableLabel);
        }
    },

    _onOk: function() {
        pageDimmer.show();
        this._fixSchemaPrefixes(this._dataSource, this._selectedSchemasList);
    },

    _onCancel: function() {
        this._callback && this._callback();
    },

    _showAffectedResources: function(element) {
        if (domain.elementClicked(element, this._TABLE_DETAILS_LINK_ID)) {
            domain.detailsDialog.show(this._invalidTableLabels);
            return true;
        }
    }
};