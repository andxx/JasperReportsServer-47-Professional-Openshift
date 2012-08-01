/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////////////
// Domain Designer Derived Tables
//////////////////////////////////
dd.derivedTables = {
    PAGE: 'query',
    DERIVED_TABLES_TAB: 'derivedTablesTab',
    FLOW_CONTROLS:     ['tablesTab', 'derivedTablesTab', 'joinsTab', 'preFiltersTab', 'displayTab'],
    TREE_DOM_ID: 'itemsTree',
    TREE_DATA_PROVIDER: 'selectedTreeDataProvider',
    TREE_TEMPLATE_DOM_ID: 'list_responsive_collapsible_type_tables',
    QUERY_NAME_INPUT_ID: 'queryName',
    EXPRESSION_INPUT_ID: 'expression',
    SAVE_TABLE_BUTTON_ID: 'saveTable',
    CANCEL_SAVE_BUTTON_ID: 'cancelSave',
    RUN_QUERY_BUTTON_ID: 'runQuery',
    RETURNED_FIELDS_SELECT_ID: 'returnedFields',
    QUERY_RESULTS_ID: 'queryResults',
    ERROR_REPORT_ID: 'errorReport',
    DROPDOWN_MENU_ID: 'menu',
    CHECK_DESIGN_MENU_ID: 'checkDesign',
    EXPORT_MENU_ID: 'export',
    TOOLBAR_DELETE_TABLE_ID: 'delete',
    QUERY_DATA_SET: "JdbcQueryDataSet",
    DERIVED_TABLE_DETAILS_PANEL: "derivedTableDetailsPanel",
    ITEMS_PANEL: "fields",
    SIZER_PATTERN: "div.sizer",
    queryNameInput: null,
    expressionInput: null,
    returnedFieldsSelect: null,
    itemsTree: null,
    editedTable: null,
    usedTablesByItemId: null,
    dataSourceId: null,
    queryResult: {query: null, result: null},
    selectionRange: null,
    MODES: {
        WAIT_FOR_ACTION: 'wait',
        EDIT: 'edit',
        EDIT_QUERY_SUCCESS: 'edit_query_success',
        EDIT_QUERY_FAIL: 'edit_query_fail'
    },
    mode: null,
    copyMoveController: new domain.TablesCopyMoveController(),
    
    getValidationPostData: function() {
        return {selectedModel: this.getSelectedModel(), page: this.PAGE}
    },

    getSelectedModel: function() {
        var childNodes = this.itemsTree.getRootNode().childs;
        return Object.toJSON(childNodes);
    },

    fillForm: function() {
        $('selectedModel').writeAttribute('value', this.getSelectedModel());
        $('unsavedChangesPresent').writeAttribute('value', dd.isUnsavedChangesPresent().toString());
    },

    ///////////////////////////////////////
    // Initialization methods
    ///////////////////////////////////////

    initFromOptions: function(options) {
        this.dataSourceId = options.dataSourceId;
        this.usedTablesByItemId = options.usedTablesByItemId;
    },

    init: function(options) {
        this.initFromOptions(options);

        dd.calcFieldsAndFiltersValidator.init(dd.validateForCalcFields.bind(dd),
                dd.getTablesUsedForFilters.bind(dd, this.usedTablesByItemId[this.dataSourceId]));

        domain.resetTreeSelectionHandler.init(
                [this.SIZER_PATTERN, this.DERIVED_TABLE_DETAILS_PANEL, this.ITEMS_PANEL, this.TREE_DOM_ID,
                    this.QUERY_NAME_INPUT_ID, this.EXPRESSION_INPUT_ID, this.SAVE_TABLE_BUTTON_ID,
                    this.RUN_QUERY_BUTTON_ID, this.RETURNED_FIELDS_SELECT_ID, this.ERROR_REPORT_ID, this.CANCEL_SAVE_BUTTON_ID,
                    this.DROPDOWN_MENU_ID, this.CHECK_DESIGN_MENU_ID, this.EXPORT_MENU_ID].concat(this.FLOW_CONTROLS).collect(function(element) {return '#' + element}),
                function() {return [this.itemsTree]}.bind(this),
                this.deselectNodes.bind(this), this.deselectNodesValidator.bind(this));

        domain.registerClickHandlers([
            this.cancelSaveClickHandler.bind(this),
            this.runQueryClickHandler.bind(this),
            this.saveTableClickHandler.bind(this)]);

        domain.registerClickHandlers([
            this.checkUnsavedChangesClickHander.bind(this)], null, true);

        this.initTree();
        this.initInputs();
        this.setMode(this.MODES.WAIT_FOR_ACTION);
        this.updateButtonsState();
    },

    initTree: function() {
        this.itemsTree = domain.createItemsTree({
            multiSelectEnabled: false,
            treeId: this.TREE_DOM_ID,
            providerId: this.TREE_DATA_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            nodeClass: domain.DerivedTablesNode,
            selectOnMousedown: false
        });

        for (var eventName in this.treeEventFactory) {
            this.itemsTree.observe(eventName, this.treeEventFactory[eventName].bindAsEventListener(this));
        }

        this.itemsTree.showTree(1, dd.createTreeNodesMap.curry(this.itemsTree), domain.treeErrorHandler);
    },

    initInputs: function() {
        this.queryNameInput = $(this.QUERY_NAME_INPUT_ID);
        this.expressionInput = $(this.EXPRESSION_INPUT_ID);
        this.returnedFieldsSelect = $(this.RETURNED_FIELDS_SELECT_ID);
        this.queryNameInput.observe('keyup', this.queryIdChanged.bind(this));
        this.expressionInput.observe('keyup', this.expressionChanged.bind(this));
        this.expressionInput.observe('mouseup', this.saveSelection.bind(this));
        this.returnedFieldsSelect.observe('change', this.updateButtonsState.bind(this))
    },

    setMode: function(mode) {
        this.mode = mode;
    },

    saveTable: function(dataSource, queryId, query, selectedFields, editedNode) {
        
        var metaNodeId = dataSource + '.' + queryId;
        var metanode = {
            id: metaNodeId,
            label: queryId,
            type: 'level',
            uri: "/" + metaNodeId
        };

        metanode.extra = {
            dataSetType: this.QUERY_DATA_SET,
            dataSource: dataSource,
            datasourceId: dataSource,
            itemId: queryId,
            originalId: queryId,
            repoId: "",
            query: escapeString(query, [/\n/g, /;/g], [' ', ''])
        };

        var qNode = this.itemsTree.processNode(metanode);

        selectedFields.each(function(selectedField) {
            var type = selectedField.type;
            var id = metanode.id + '.' + selectedField.name;

            var metafield = {
                id: id,
                label: selectedField.name,
                type: 'item',
                uri: metanode.uri + '/' + id
            };

            metafield.extra = {
                JavaType: type,
                JdbcType: '',
                dataSource: dataSource,
                datasourceId: dataSource,
                itemId: metafield.label,
                originalId: metanode.extra.originalId + '.' + selectedField.name,
                repoId: '',
                table: metanode.extra.originalId
            };

            var qChild = this.itemsTree.processNode(metafield);

            qNode.addChild(qChild);
        }.bind(this));

        if (editedNode) {
            editedNode.parent.removeChild(editedNode);
        }

        this.itemsTree.getRootNode().addChild(qNode);
        qNode.isloaded = true;
        this.itemsTree.treeMap[qNode.param.id] = qNode;
        this.itemsTree.resortSubtree(this.itemsTree.getRootNode());
        this.itemsTree.renderTree();

        this.cancelEdit();
        dd.setUnsavedChangesPresent(true);
    },

    queryIdChanged: function() {
        if (this.mode === this.MODES.WAIT_FOR_ACTION) {
            this.setMode(this.MODES.CREATE);
        }

        this.updateButtonsState();
    },

    expressionChanged: function() {
        if (this.mode === this.MODES.WAIT_FOR_ACTION) {
            this.setMode(this.MODES.CREATE);
        } else if ((this.mode === this.MODES.EDIT_QUERY_SUCCESS || this.mode === this.MODES.EDIT_QUERY_FAIL)
                && this.queryResult.query !== $F(this.EXPRESSION_INPUT_ID).strip()) {
             this.setMode(this.MODES.EDIT);
            this.queryResult.query = null;
            this.queryResult.result = null;
        }

        this.saveSelection();
        this.updateButtonsState();
    },

    saveSelection: function() {
        if (document.selection) {
            this.selectionRange = document.selection.createRange();
        }
    },

    deselectNodesValidator: function() {
        return this.mode === this.MODES.WAIT_FOR_ACTION
                || confirm(domain.getMessage('changesWillBeLost'));        
    },

    deselectNodes: function() {
        if (this.editedTable) {
            this.cancelEdit();
        }
    },

    cancelEdit: function() {
        this.editedTable && this.editedTable.deselect();
        this.editedTable = null,
        this.queryResult.query = null;
        this.queryResult.result = null;
        [this.queryNameInput, this.expressionInput].invoke('setValue', '');
        this.setMode(this.MODES.WAIT_FOR_ACTION);
        buttonManager.enable(this.queryNameInput);
        $(this.QUERY_RESULTS_ID).removeClassName('success').removeClassName('error');
        [this.queryNameInput, this.expressionInput, this.returnedFieldsSelect]
                .each(function(input) {
                    ValidationModule.hideError(input);
                });
        this.updateButtonsState();
    },

    ////////////////
    // Validators
    ////////////////
    
    queryIdEmptyValidator: function(value) {
        return {
            isValid: dd.emptyValidator(value).isValid,
            errorMessage: domain.getMessage('queryId.empty')
        }
    },

    queryIdInvalidValidator: function(value) {
        return {
            isValid: dd.nonEmptyItemIdValidator(value).isValid && value.indexOf(".") < 0,
            errorMessage: domain.getMessage('queryId.invalid')
        }
    },

    queryIdExistsValidator: function(value) {
        var valid = true;
        if (value && !this.editedTable) {
            var valueExists = $H(this.itemsTree.treeMap).values().find(function(value, node) {
                return node.param.extra.itemId === value;
            }.bind(this, value));

            valid = !valueExists;
        }

        return {
            isValid: valid,
            errorMessage: domain.getMessage('fieldId.exists')
        }
    },

    queryExpressionValidator: function(value) {
        var isValid = false, errMessage = domain.getMessage('expression.empty');
        if (value && value.strip()) {
            var valArr = value.strip().split(/\s+/, 4);
            // min 4 words in a query (select * from TABLE)
            if (valArr.length >= 4 && valArr[0].toLowerCase() == 'select')
                isValid = true;
            else
                errMessage = domain.getMessage('expression.nonselect');
        }

        return {
            isValid:  isValid,
            errorMessage: errMessage
        }
    },

    queryResultValidator: function(value) {
        var valid = false;
        var message = domain.getMessage('expression.notRunned');
        if (this.mode === this.MODES.EDIT_QUERY_SUCCESS) {
            valid = true;
        } else if (this.mode === this.MODES.EDIT_QUERY_FAIL) {
            message = domain.getMessage('expression.queryFailed');
        }

        return {
            isValid: valid,
            errorMessage: message
        }
    },

    isFieldsSelectedValidator: function(value) {
        var valid;
        if (this.mode === this.MODES.EDIT_QUERY_SUCCESS) {
            var slectedFields = $F(this.RETURNED_FIELDS_SELECT_ID);
            valid = slectedFields && slectedFields.first();
        } else {
            valid = true;
        }


        return {
            isValid: valid,
            errorMessage: domain.getMessage('resultFields.emptySelection')
        }
    },

    insertNodeToQuery: function(node) {
        if (node.param.extra.expression || node.param.extra.query
                || [node.CONSTANT_TABLE_ID, node.CROSSTABLES_FIELDS_TABLE_ID].include(node.param.id)) {
            return;
        }

        if (node.param.type)
        var text = node.param.extra.table;
        if (!node.isParent()) {
            text = node.param.extra.itemId;
        }
        
        dd.insertAtCaret($(this.EXPRESSION_INPUT_ID), text, this.selectionRange);
        this.expressionChanged();
    },

    ///////////////////////////////////////
    // Start of derivedTables page logic
    //////////////////////////////////////

    removeTable: function(table) {
        if (!table) {
            return;
        }

        var callback = function(involvedFieldsIds, involvedFieldsExpressionIds) {
            dd.setUnsavedChangesPresent(true);
            var tableId = table.param.id;

            if (involvedFieldsIds && involvedFieldsIds.first()) {
                dd.deleteNodesFromTreeById(involvedFieldsIds, this.itemsTree, this.copyMoveController);
            }

            dd.deleteNodesFromTreeById([tableId], this.itemsTree, this.copyMoveController);

            this.updateButtonsState();
        };

        dd.calcFieldsAndFiltersValidator.validate([table], false, callback.bind(this));
    },

    ///////////////////////////////////////
    // AJAX calls for queries business logic
    ///////////////////////////////////////
    runJDBCquery: function(query, callback) {
        var urlData = {
            eventId: 'runJDBCQuery',
            flowExecutionKey: dd.flowExecutionKey
        };

        var postData = {
            createdQuerySql: query,
            selectedDatasource: this.dataSourceId
        };

        domain.sendAjaxRequest(urlData, postData, callback);
    },

    ///////////////////////////////////////
    // Click handlers logic
    ///////////////////////////////////////
    cancelSaveClickHandler: function(element) {
        if (domain.elementClicked(element, '#' + this.CANCEL_SAVE_BUTTON_ID)) {
            if (this.deselectNodesValidator()) {
                this.cancelEdit();
            }

            return true;
        }
    },

    runQueryClickHandler: function(element) {
        if (domain.elementClicked(element, '#' + this.RUN_QUERY_BUTTON_ID)) {
            var query = $F(this.EXPRESSION_INPUT_ID).strip().split("\r\n").join("\n");

            var callback = function(json) {
                if (json.error) {
                    this.queryResult.query = query;
                    this.queryResult.result = json.error;                    
                    $(this.ERROR_REPORT_ID).update(json.error);
                    $(this.QUERY_RESULTS_ID).removeClassName('success').addClassName('error');
                    this.setMode(this.MODES.EDIT_QUERY_FAIL);
                } else if (json.success) {
                    this.queryResult.query = query;
                    this.queryResult.result = json.success;
                    var selectedFields = [];
                    if (this.editedTable) {
                        selectedFields = this.editedTable.childs.collect(function(child) {
                            return child.param.extra.itemId;
                        })
                    }

                    var returnedFields = this.queryResult.result.collect(function(field) {
                        return field.name;
                    });

                    var twoArraysSize = selectedFields.length  + returnedFields.length;
                    var selectAll = selectedFields.concat(returnedFields).uniq().length === twoArraysSize;

                    var options = this.queryResult.result.collect(function(option) {
                        var selected = selectAll ? true : selectedFields.indexOf(option.name) > -1;
                        return {value: option.name, label: option.name, selected: selected};
                    }, this);

                    domain.setOptionsToSelect(this.returnedFieldsSelect, options);
                    $(this.QUERY_RESULTS_ID).addClassName('success').removeClassName('error');
                    this.setMode(this.MODES.EDIT_QUERY_SUCCESS);
                }

                this.updateButtonsState();
            };

            var valid = ValidationModule.validate([{validator: this.queryExpressionValidator, element: this.expressionInput}]);
            ValidationModule.hideError(this.returnedFieldsSelect);

            valid && this.runJDBCquery(query, callback.bind(this));
            return true;
        }
    },

    saveTableClickHandler: function(element) {
        if (domain.elementClicked(element, '#' + this.SAVE_TABLE_BUTTON_ID)) {
            var valid = ValidationModule.validate([
                {validator: this.queryIdExistsValidator.bind(this), element: this.queryNameInput},
                {validator: this.queryIdInvalidValidator.bind(this), element: this.queryNameInput},
                {validator: this.queryIdEmptyValidator.bind(this), element: this.queryNameInput},
                {validator: this.isFieldsSelectedValidator.bind(this), element: this.returnedFieldsSelect},
                {validator: this.queryResultValidator.bind(this), element: this.expressionInput},
                {validator: this.queryExpressionValidator.bind(this), element: this.expressionInput}
            ]);

            if (valid) {
                var selectedFieldIds = $F(this.RETURNED_FIELDS_SELECT_ID);
                var selectedFields = this.queryResult.result.findAll(function(field) {
                    return selectedFieldIds.indexOf(field.name) >= 0;
                }.bind(this));
                this.saveTable(this.dataSourceId, $F(this.QUERY_NAME_INPUT_ID), this.queryResult.query, selectedFields, this.editedTable);
                this.updateButtonsState();
            }

            return true;
        }
    },

    nodeMouseUp: function(node) {
        if (!node.param.extra.query || (this.mode !== this.MODES.WAIT_FOR_ACTION && this.editedTable !== node)) {
            node.deselect();
            this.editedTable && this.editedTable.select();
        }

        this.updateButtonsState();
    },
    
    nodeClickHandler: function(node) {
        if (this.editedTable === node || !node.param.extra.query) {
            return;
        }

        if (!this.deselectNodesValidator()) {
            return;
        }

        this.cancelEdit();
        
        if (node.param.extra.query) {
            this.editedTable = node;
            this.queryNameInput.setValue(node.param.extra.itemId);
            this.expressionInput.setValue(node.param.extra.query);
            buttonManager.disable(this.queryNameInput);
        }

        this.updateButtonsState();
    },

    checkUnsavedChangesClickHander: function(element) {
        var eventHandled = false;
        this.FLOW_CONTROLS.each(function(tab) {
            if (domain.elementClicked(element, '#' + tab) && tab !== this.DERIVED_TABLES_TAB) {
                var valid = this.deselectNodesValidator();
                if (!valid) {
                    tabModule.setSelected($(this.DERIVED_TABLES_TAB).parentNode);
                    tabModule.setUnselected($(tab).parentNode);                    
                }
                eventHandled = !valid;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    updateButtonsState: function() {
        domain.enableButton(this.RUN_QUERY_BUTTON_ID, $F(this.EXPRESSION_INPUT_ID).strip());

        var textInputsFilled = $F(this.QUERY_NAME_INPUT_ID).strip() && $F(this.EXPRESSION_INPUT_ID).strip();
        var fieldsSelected = this.mode === this.MODES.EDIT_QUERY_SUCCESS && $F(this.RETURNED_FIELDS_SELECT_ID).first();
        domain.enableButton(this.SAVE_TABLE_BUTTON_ID, textInputsFilled && fieldsSelected);

        this.updateToolbarButtonsState();
    },

    updateToolbarButtonsState: function() {
        [this.TOOLBAR_DELETE_TABLE_ID].each(function(toolbarButtonId) {
            toolbarButtonModule.setButtonState($(toolbarButtonId), this.toolbarButtonsEnabled());
         }.bind(this));
    }
};

// Alias for dd.queries
var dd_derivedTables = dd.derivedTables;

///////////////////////////////
// Toolbar integration
///////////////////////////////

//action array
dd_derivedTables.toolbarActionMap = {
    'delete': "dd_derivedTables.deleteTable"
};

dd_derivedTables.deleteTable = function() {
    var selectedTable = dd_derivedTables.itemsTree.selectedNodes.first();
    dd_derivedTables.removeTable.bind(dd_derivedTables, selectedTable)();
};

dd_derivedTables.toolbarButtonsEnabled = function() {
    var selectedNode = dd_derivedTables.itemsTree.selectedNodes.first();
    return selectedNode
            && selectedNode.isParent()
            && selectedNode.param.id !== selectedNode.CONSTANT_TABLE_ID
            && selectedNode.param.id !== selectedNode.CROSSTABLES_FIELDS_TABLE_ID
};

////////////////////////////////////////////////
// Factories
///////////////////////////////////////////////

dd_derivedTables.treeEventFactory = {
    'leaf:mousedown': function(event){
        this.nodeClickHandler(event.memo.node);
        Event.stop(event);
    },

    'node:mousedown': function(event) {
        this.nodeClickHandler(event.memo.node);
        Event.stop(event);
    },

    'leaf:mouseup': function(event){
        this.nodeMouseUp(event.memo.node);
        Event.stop(event);
    },

    'node:mouseup': function(event) {
        this.nodeMouseUp(event.memo.node);
        Event.stop(event);
    },

    'node:dblclick': function(event) {
        this.insertNodeToQuery(event.memo.node);
        Event.stop(event);
    },

    'leaf:dblclick': function(event) {
        this.insertNodeToQuery(event.memo.node);
        Event.stop(event);
    }
};

///////////////////////////
// Entry point
///////////////////////////

document.observe('dom:loaded', dd.initialize.bind(dd));
