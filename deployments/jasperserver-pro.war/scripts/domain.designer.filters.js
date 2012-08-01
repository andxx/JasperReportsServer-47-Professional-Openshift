/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////////
// Domain Designer Pre-Filters
///////////////////////////////
dd.filters = {
    PAGE: 'filters',

    getValidationPostData: function() {
        return {
            page: this.PAGE
        }
    },

    fillForm: function() {
        $('unsavedChangesPresent').writeAttribute('value', dd.isUnsavedChangesPresent().toString());
    },

    ///////////////////////////////////////
    // Initialization methods
    ///////////////////////////////////////

    init: function(options) {
        dd.formDomId = 'preFiltersForm';

        // Create Filter model controller.
        this.filterModelController = new domain.FilterModelController(
                "filtersListId",
                domain.FilterEditor,
                options);
        // Init Fields tree
        var fields = dd.filters.fields;
        fields.init(this.filterModelController, function() {

            // Continue Filter model controller initialization.
            this.filterModelController.init();
            this.filterModelController.updateHiddenField = function() {
                domain.FilterModelController.prototype.updateHiddenField.call(this.filterModelController);
                dd.setUnsavedChangesPresent(true);
            }.bind(this);
            this.filterModelController.initDropContainer(['draggable']);
        }.bind(this));

        domain.resetTreeSelectionHandler.init(['#' + fields.ITEMS_TREE_DOM_ID], function() {return [fields.itemsTree]});
    }

};

// Alias for dd.filters
var dd_filters = dd.filters;

dd_filters.fields = {
    ITEMS_TREE_DOM_ID : 'fieldsTreeRoot',
    TREE_DATA_PROVIDER : 'filtersJoinTreeDataProvider',

    itemsTree : null,

    init : function(filterModel, callback) {
        this.filterModel = filterModel;

        this.itemsTree = domain.createItemsTree({
            treeId: this.ITEMS_TREE_DOM_ID,
            providerId: this.TREE_DATA_PROVIDER,
            templateDomId: "list_responsive_collapsible_type_tables",
            nodeClass: domain.TablesNode,
            selectOnMousedown: true,            
            dragPattern: '.leaf .draggable'
        });
        this.itemsTree.showTree(10, function() {
            dd_filters.fields.initTreeEvents();
            callback();
        }, domain.treeErrorHandler);
    },

    initTreeEvents : function() {
        this.filterModel.treeEventFactory.each(function(pair) {
            this.itemsTree.observe(pair.key, pair.value.bind(this.filterModel));
        }.bind(this));
    }
};

///////////////////////////
// Entry point
///////////////////////////

document.observe('dom:loaded', dd.initialize.bind(dd));
