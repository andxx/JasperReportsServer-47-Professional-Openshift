/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////
// Domain Designer Joins
///////////////////////////
dd.joins = {
    PAGE: 'joins',
    TREE_TEMPLATE_DOM_ID: 'list_responsive_collapsible_type_tables',
    TREE_DRAG_PATTERN: '.draggable',
    LEFT_TREE_DOM_ID: 'leftTree',
    RIGHT_TREE_DOM_ID: 'rightTree',
    TREE_DATA_PROVIDER: 'selectedTreeDataProvider',
    JOINS_LIST_TEMPLATE_ID: 'list_domain_designer_joins',
    JOINS_LIST_TEMPLATE_ITEM_ID: 'list_domain_designer_joins:leaf',
    JOINS_LIST_DOM_ID: 'joinsList',
    JOINS_DOM_ID: 'joinsPanel',
    LIST_REMOVE_LINK_PATTERN: 'a',
    JOIN_BUTTON_IDS: ['inner', 'left', 'right', 'full'],
    ALL_JOINS_TAB_ID: 'allJoins',
    SELECTED_TABLE_JOINS_TAB_ID: 'selectedTableJoins',
    JOINS_LIST_MODE: {
        ALL_JOINS: 'allJoins',
        BY_TABLE: 'byTable'
    },
    TOOLBAR_COPY_TABLE_ID: 'copyTable',
    TOOLBAR_CHANGE_TABLE_ID: 'changeID',
    TOOLBAR_DELETE_TABLE_ID: 'delete',
    REMOVE_JOIN_LINK_PATTERN: 'a.launcher',
    leftTree: null,
    rightTree: null,
    joinsList: null,
    joins: null,
    usedTablesByItemId: null,
    usedFieldsByItemId: null,
    usedJoinedTablesByItemId: null,
    dataSourceId: null,

    copyMoveController: new domain.TablesCopyMoveController(),
    joinsListViewMode: null,

    getValidationPostData: function() {
        return {
            selectedModel: this.getSelectedModel(),
            joinsInput: this.joinsList.getItems().toJSON(),
            page: this.PAGE
        }
    },

    getSelectedModel: function() {
        var childNodes = this.leftTree.getRootNode().childs;
        return Object.toJSON(childNodes);
    },

    fillForm: function() {
        $('selectedModel').writeAttribute('value', this.getSelectedModel());
        $('joinsInput').writeAttribute('value', this.joinsList.getItems().toJSON());
        $('unsavedChangesPresent').writeAttribute('value', dd.isUnsavedChangesPresent().toString());
    },
    
    initFromOptions: function(options) {
        this.dataSourceId = options.dataSourceId;
        this.joins = options.jsonJoins;
        this.usedTablesByItemId = options.usedTablesByItemId;
        this.usedFieldsByItemId = options.usedFieldsByItemId;
        this.usedJoinedTablesByItemId = options.usedJoinedTablesByItemId;
    },

    init: function(options) {
        this.initFromOptions(options);

        dd.calcFieldsAndFiltersValidator.init(dd.validateForCalcFields.bind(dd),
                dd.getTablesUsedForFilters.bind(dd, this.usedTablesByItemId[this.dataSourceId]));

        domain.resetTreeSelectionHandler.init(
                (this.JOIN_BUTTON_IDS.concat(
                        [this.LEFT_TREE_DOM_ID, this.RIGHT_TREE_DOM_ID, this.JOINS_DOM_ID,
                            this.TOOLBAR_COPY_TABLE_ID, this.TOOLBAR_CHANGE_TABLE_ID, this.TOOLBAR_DELETE_TABLE_ID]))
                                .collect(function(elem) {return '#' + elem})
                                .concat([this.REMOVE_JOIN_LINK_PATTERN]),
                function() {return [this.leftTree, this.rightTree]}.bind(this),
                this.updateButtonsState.bind(this));

        domain.registerClickHandlers([
            this.changeJoinsListViewModeClickEventHandler.bind(this),
            this.createJoinButtonClickEventHandler.bind(this)]);

        dd_joins.deleteJoinValidator.init(
                this.validateUnjoinedTableForCalcFields.bind(this),
                this.buildDataIslands.bind(this),
                this.getNotJoinedTablesAfterDeleting.bind(this));

        this.initTrees();
        this.updateButtonsState();
    },

    initTrees: function() {
        this.leftTree = domain.createItemsTree({
            multiSelectEnabled: false,
            treeId: this.LEFT_TREE_DOM_ID,
            providerId: this.TREE_DATA_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            nodeClass: domain.TablesNode
        });

        this.rightTree = domain.createItemsTree({
            multiSelectEnabled: false,
            treeId: this.RIGHT_TREE_DOM_ID,
            providerId: this.TREE_DATA_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            nodeClass: domain.TablesNode
        });

        for (var eventName in this.treeEventFactory) {
            [this.leftTree, this.rightTree]
                    .invoke('observe', eventName, this.treeEventFactory[eventName].bindAsEventListener(this))
        }

        this.leftTree.showTree(1, this.afterLeftTreeLoaded.bind(this), domain.treeErrorHandler);
        this.rightTree.showTree(1, this.buildTreeMap.bind(this, this.rightTree), domain.treeErrorHandler);
    },

    afterLeftTreeLoaded: function() {
        this.buildTreeMap(this.leftTree);
        this.initJoinsList();
        this.makeTreeEditable(this.leftTree);
    },

    makeTreeEditable: function(tree) {
        $H(tree.treeMap).each(function(pair) {
            var table = pair.value;
            table.editable = (table.param.type === table.Types.Folder.name
                    && table.param.id !== table.CONSTANT_TABLE_ID);            
        });
    },

    initJoinsList: function() {
        //At first show standard joins list view mode selected
        this.joinsListViewMode = this.JOINS_LIST_MODE.ALL_JOINS;

        var listItems = this.joins.collect(function(listItem) {
            return this.createJoinsListItem.bind(this)(listItem.left, listItem.right, listItem.type);
        }.bind(this));

        this.joinsList = new domain.JoinsList(this.JOINS_LIST_DOM_ID, {
            listTemplateDomId: this.JOINS_LIST_TEMPLATE_ID,
            items: listItems
        });

        for (var eventName in this.listEventFactory) {
            this.joinsList.observe(eventName, this.listEventFactory[eventName].bindAsEventListener(this));        
        }

        this.joinsList.show();
    },

    /////////////////////////////
    // Start of joins page logic
    /////////////////////////////
    
    buildTreeMap: function(tree) {
        tree.treeMap = {};

        var processNode = function(node) {
            tree.treeMap[node.param.id] = node;
            if (node.isParent()) {
                node.childs.each(processNode);
            }
        };

        tree.getRootNode().childs.each(processNode);
    },
    
    createJoinsListItem: function(leftFieldId, rightFieldId, joinType) {
        var leftField = this.leftTree.treeMap[leftFieldId];
        var righField = this.leftTree.treeMap[rightFieldId];

        var item = {
            left: {
                id: leftField.param.id,
                label: leftField.param.extra.itemId,
                table: {
                    id: leftField.parent.param.id,
                    label: leftField.parent.param.extra.itemId
                }
            },
            right: {
                id: righField.param.id,
                label: righField.param.extra.itemId,
                table: {
                    id: righField.parent.param.id,
                    label: righField.parent.param.extra.itemId
                }
            },

            type: joinType
        };

        return new domain.JoinsListItem({
            value: item,
            templateDomId: this.JOINS_LIST_TEMPLATE_ITEM_ID
        });
    },

    removeJoin: function(joinListItem) {
        var joins = this.joinsList.getItems().collect(function(item) {
            return item.getValue();
        });

        var join = joinListItem.getValue();

        var callback = function(involvedFieldsIds, involvedFieldsExpressionIds) {
            dd.setUnsavedChangesPresent(true);

            if (involvedFieldsIds && involvedFieldsIds.first()) {
                dd.deleteNodesFromTreeById(involvedFieldsIds, this.leftTree, this.copyMoveController);
                dd.deleteNodesFromTreeById(involvedFieldsIds, this.rightTree, this.copyMoveController);
            }

            this.deleteNotJoinedTablesFromState(joins, join);
            joinListItem.remove();
            this.updateButtonsState();
        };
        
        dd_joins.deleteJoinValidator.validate(joins, join, callback.bind(this));
    },

    buildDataIslands: function (joins)  {
        var dataIslands = [];
        joins.each(function (join) {
            var leftLabel = join.left.table.label;
            var rightLabel = join.right.table.label;

            var isDataIslandExist = false;
            dataIslands.each(function (dataIsland) {
                if (dataIsland.include(leftLabel) || dataIsland.include(rightLabel)) {
                    dataIsland.push(leftLabel);
                    dataIsland.push(rightLabel);
                    isDataIslandExist = true;
                }
            });

            if (!isDataIslandExist) {
                dataIslands.push([leftLabel, rightLabel]);
            }
        });

        return dataIslands.collect(function(dataIsland) {
            return dataIsland.uniq();
        });
    },

    compareJoins: function(join1Left, join1Right, join2Left, join2Right) {
        return (join1Left == join2Left && join1Right == join2Right
                || join1Right == join2Left && join1Left == join2Right);
    },

    getNotJoinedTablesAfterDeleting: function (joins, join)  {
        var notJoinedTables = [];

        if (!join || !this.usedJoinedTablesByItemId || !this.usedJoinedTablesByItemId[this.dataSourceId]) {
            return notJoinedTables;
        }

        var usedJoinedTables = this.usedJoinedTablesByItemId[this.dataSourceId];

        var newDataIslands = this.buildDataIslands(joins.findAll(function (j) {
            return !this.compareJoins(j.left.id, j.right.id, join.left.id, join.right.id);
        }.bind(this)));

        var newUsedJoinedTables = [];

        usedJoinedTables.each(function(joinTable) {
            newDataIslands.each(function (dataIsland) {
                var containsFirstTable = dataIsland.indexOf(joinTable[0]) > -1;
                var containsSecondTable = dataIsland.indexOf(joinTable[1]) > -1;

                if (containsFirstTable && containsSecondTable) {
                    newUsedJoinedTables.push([joinTable[0], joinTable[1]]);
                }
            });
        });

        usedJoinedTables.each(function (joinedTable) {
            var isNotJoinedTable = !newUsedJoinedTables.find(function (newJoinedTable) {
                return this.compareJoins(joinedTable[0], joinedTable[1], newJoinedTable[0], newJoinedTable[1]);
            }.bind(this));

            if (!newUsedJoinedTables.first() || isNotJoinedTable) {
                notJoinedTables.push(joinedTable);
            }
        }.bind(this));

        return notJoinedTables;
    },

    deleteNotJoinedTablesFromState: function (joins, join)  {
        var notJoinedTables = this.getNotJoinedTablesAfterDeleting(joins, join);

        if (!this.usedJoinedTablesByItemId || !this.usedJoinedTablesByItemId[this.dataSourceId]) {
            return;
        }

        var usedJoinedTables = this.usedJoinedTablesByItemId[this.dataSourceId];

        var removeIndexes = [];

        usedJoinedTables.each(function(joinedTable, i) {
            notJoinedTables.each(function (notJoinedTable) {
                if (this.compareJoins(joinedTable[0], joinedTable[1], notJoinedTable[0], notJoinedTable[1])) {
                    removeIndexes.push(i);
                }
            }.bind(this));
        }.bind(this));

        removeIndexes = removeIndexes.reverse();

        removeIndexes.each(function (index) {
            usedJoinedTables.splice(index,1);
        });
    },

    updateJoinsByTableListState: function() {
        if (this.joinsListViewMode !== this.JOINS_LIST_MODE.BY_TABLE) {
            return;
        }

        var selectedNode = this.leftTree.selectedNodes.first();

        var selectedTableId = null;
        if (selectedNode) {
            selectedTableId = selectedNode.isParent() ? selectedNode.param.id : selectedNode.parent.param.id;
        }

        this.joinsList.getItems().each(function(item) {
            var hidden = selectedTableId
                    ? (item.getValue().left.table.id !== selectedTableId && item.getValue().right.table.id !== selectedTableId)
                    : true;
            item.hide(hidden);
        })
    },

    createJoin: function(leftFieldId, rightFieldId, joinType) {
        dd.setUnsavedChangesPresent(true);
        var listItem = this.createJoinsListItem(leftFieldId, rightFieldId, joinType);
        this.changeJoinTypeForAllCompositeJoins(listItem);
        this.joinsList.addItems([listItem]);
        this.joinsList.refresh();
        this.updateButtonsState();
    },

    changeJoinTypeForAllCompositeJoins: function(item) {
        var join = item.getValue();

        var otherCompositeJoins = this.findOtherCompositeJoins(join);
        if (otherCompositeJoins && otherCompositeJoins.first()) {
            otherCompositeJoins.each(function(join, otherJoin) {
                otherJoin.setJoinType(join.type)
            }.bind(this, join))
        }
    },

    findOtherCompositeJoins: function(join) {
        var leftTableId = join.left.table.id;
        var rightTableId = join.right.table.id;
        
        return this.joinsList.getItems().findAll(function(item) {
            var joinItem = item.getValue();

            if (join === joinItem) {
                return false;
            }

            var leftTablePresentInJoin =
                    (joinItem.left.table.id === leftTableId || joinItem.right.table.id === leftTableId);

            var rightTablePresentInJoin =
                    (joinItem.left.table.id === rightTableId || joinItem.right.table.id === rightTableId);

            return leftTablePresentInJoin && rightTablePresentInJoin;
        });
    },

    removeTable: function(table) {
        if (!table) {
            return;
        }

        var callback = function(involvedFieldsIds, involvedFieldsExpressionIds) {
            dd.setUnsavedChangesPresent(true);
            var tableId = table.param.id;

            if (involvedFieldsIds && involvedFieldsIds.first()) {
                dd.deleteNodesFromTreeById(involvedFieldsIds, this.leftTree, this.copyMoveController);
                dd.deleteNodesFromTreeById(involvedFieldsIds, this.rightTree, this.copyMoveController);
            }

            dd.deleteNodesFromTreeById([tableId], this.leftTree, this.copyMoveController);
            dd.deleteNodesFromTreeById([tableId], this.rightTree, this.copyMoveController);

            this.joinsList.getItems().each(function(item) {
                var itemValue = item.getValue();
                if (itemValue.left.table.id === tableId || itemValue.right.table.id === tableId) {
                    item.remove();
                }
            });
            
            this.updateButtonsState();
        };

        dd.calcFieldsAndFiltersValidator.validate([table], false, callback.bind(this));
    },

    duplicateTableForTree: function(tree, table, editable) {
        var copy = this.copyMoveController.copy([table], tree.getRootNode(), true).first();
        copy.editable = !!editable;
        tree.treeMap[copy.param.id] = copy;
        if (copy.childs.first()) {
            copy.childs.each(function(child) {
                tree.treeMap[child.param.id] = child;
            }.bind(this));
        }
        tree.resortSubtree(copy.parent);
        tree.renderTree();
    },

    duplicateTable: function(table) {
        if (!table) {
            return;
        }

        dd.setUnsavedChangesPresent(true);
        this.duplicateTableForTree(this.leftTree, table, true);
        this.duplicateTableForTree(this.rightTree, table, false);

        sessionManager.resetSession(dd.flowExecutionKey);
    },

    editNode: function(node) {
        node && node.edit();
        $(node._getTitle().parentNode).removeClassName(layoutModule.ERROR_CLASS);
    },

    nodeEndEdit: function(node) {
        if (!dynamicTree.editaborted) {
            return;
        }

        dynamicTree.treeNodeEdited = node;
        dynamicTree.editaborted = false;
    },

    changeNodeId: function(node, newId, updateJoinsList) {
        var oldId = node.param.id;
        var tree = dynamicTree.trees[node.getTreeId()];
        
        if (node.isParent()) {
            if (!node.param.extra.originalId) {
                node.param.extra.originalId = node.param.extra.itemId;
            }
            node.param.extra.itemId = newId;
            node.changeName(newId);
            node.param.id = node.param.extra.datasourceId + '.' + node.param.extra.itemId;
            delete tree.treeMap[oldId];
            tree.treeMap[node.param.id] = node;
        } else {
            if (!node.param.extra.originalId) {
                node.param.extra.originalId = node.parent.param.extra.originalId + '.' + node.param.extra.itemId;
            }            
            node.param.id = node.parent.param.id + '.' + node.param.extra.itemId;
            delete tree.treeMap[oldId];
            tree.treeMap[node.param.id] = node;

            updateJoinsList && this.joinsList.getItems().each(function(node, oldId, listItem) {
                var value = listItem.getValue();
                if (value.left.id === oldId) {
                    value.left.id = node.param.id,
                    //Do not need to update value.left.label since it is not changed
                    value.left.table.id = node.parent.param.id,
                    value.left.table.label = node.parent.param.extra.itemId;
                    listItem.refresh();
                } else if (value.right.id === oldId) {
                    value.right.id = node.param.id,
                    //Do not need to update value.right.label since it is not changed
                    value.right.table.id = node.parent.param.id,
                    value.right.table.label = node.parent.param.extra.itemId;
                    listItem.refresh();
                }
            }.curry(node, oldId));
        }
    },

    isNewAliasExists: function(newValue) {
        var nodes = $H(this.leftTree.treeMap).values();
        var existedNode = nodes.find(function(node) {
            return node.param.extra.itemId === newValue
        });

        return !!existedNode;
    },

    updateExpressions: function(expressionChanges) {
        if (!expressionChanges || !expressionChanges.first()) {
            return;
        }

        expressionChanges.each(function(expressionChange) {
            for (var id in expressionChange) {
                [this.leftTree, this.rightTree].each(function(tree) {
                    var field = tree.treeMap[id];
                    field.param.extra.expression = expressionChange[id];
                })
            }
        }.bind(this));
    },
    
    changeNodeAlias: function(node, newValue) {
        if (node.name === newValue) {
            return;
        }

       if (!dd.nonEmptyItemIdValidator(newValue).isValid || this.isNewAliasExists(newValue)) {
           $(node._getTitle().parentNode).addClassName(layoutModule.ERROR_CLASS);
           dynamicTree.editaborted = true;
           return;           
       } else {
           $(node._getTitle().parentNode).removeClassName(layoutModule.ERROR_CLASS);
       }

        var oldId = node.param.id;
        var oldAlias = node.param.extra.itemId;
        var rightTreeNode = this.rightTree.treeMap[oldId];

        var callback = function(json) {
            if (json === 'error') {
                $(node._getTitle().parentNode).addClassName(layoutModule.ERROR_CLASS);
                dynamicTree.editaborted = true;
                return;
            }

            dd.setUnsavedChangesPresent(true);
            
            this.updateExpressions(json.changesExpressions);
            
            [node, rightTreeNode].each(function(table, index) {
                this.changeNodeId(table, newValue);
                table.childs.each(function(child) {
                    this.changeNodeId(child, newValue, index === 0);
                }.bind(this))
            }.bind(this));
        };

        dd.changeTableAlias(oldAlias, newValue, callback.bind(this));
    },

    ///////////////////////////////////////
    // AJAX calls for joins business logic
    ///////////////////////////////////////

    validateUnjoinedTableForCalcFields: function(tableItemId, callback) {
        var urlData = {
            flowExecutionKey: dd.flowExecutionKey,
            eventId: 'validateUnjoinedTableForCalcFields'
        };

        var postData = {
            unjoinedTableItemId: tableItemId
        };

        domain.sendAjaxRequest(urlData, postData, callback);
    },

    ///////////////////////////////////////
    // Click handlers logic
    ///////////////////////////////////////
    changeJoinsListViewModeClickEventHandler: function(element) {
        var eventHandled = false;
        this.changeJoinsListHandlerMap.each(function(pair){
            if (domain.elementClicked(element, pair.key)) {
                eventHandled = true;
                
                if (this.joinsListViewMode === pair.value) {
                    throw $break;
                }

                this.joinsListViewMode = pair.value;
                if (this.joinsListViewMode === this.JOINS_LIST_MODE.BY_TABLE) {
                    this.updateJoinsByTableListState();
                } else {
                    this.joinsList.getItems().each(function(item) {
                        item.hide(false);
                    })
                }

                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    treeClickEventHandler: function(node) {
        var tree = dynamicTree.trees[node.getTreeId()];
        if (tree === this.leftTree) {
            this.updateJoinsByTableListState();
        }
        
        this.updateButtonsState();
    },

    createJoinButtonClickEventHandler: function(element) {
        var eventHandled = false;
        this.createJoinHandlerMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                var leftField = this.leftTree.selectedNodes.first();
                var rightField = this.rightTree.selectedNodes.first();
                var existingJoins = this.joinsList.getItems().collect(function(listItem) {
                    return listItem.getValue();
                });

                dd_joins.createJoinValidator
                        .validate(leftField, rightField, existingJoins,
                        this.createJoin.bind(this, leftField.param.id, rightField.param.id, pair.value.type));
                sessionManager.resetSession(dd.flowExecutionKey);

                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    updateButtonsState: function() {
        this.updateToolbarButtonsState();
        this.updateCreateJoinButtonsState();
        this.updateJoinsByTableListState();
    },

    updateToolbarButtonsState: function() {
        [this.TOOLBAR_COPY_TABLE_ID,
         this.TOOLBAR_CHANGE_TABLE_ID,
         this.TOOLBAR_DELETE_TABLE_ID].each(function(toolbarButtonId) {
            toolbarButtonModule.setButtonState($(toolbarButtonId), this.toolbarButtonsEnabled());
         }.bind(this));
    },

    updateCreateJoinButtonsState: function() {
        var leftTreeSelectedNode = this.leftTree.selectedNodes.first();
        var rightTreeSelectedNode = this.rightTree.selectedNodes.first();

        var isLeftNodeField = leftTreeSelectedNode && !leftTreeSelectedNode.isParent();
        var isRightNodeField = rightTreeSelectedNode && !rightTreeSelectedNode.isParent();

        var isLeftFieldCalculated =
                isLeftNodeField
                        ? leftTreeSelectedNode.param.extra.expression
                        : true;
        var isRightFieldCalculated =
                isRightNodeField
                        ? rightTreeSelectedNode.param.extra.expression
                        : true;

        var fieldsFromOneTable =
                (isLeftNodeField && isRightNodeField)
                        ? leftTreeSelectedNode.parent.param.id === rightTreeSelectedNode.parent.param.id
                        : true;

        var enabled = !fieldsFromOneTable && !isLeftFieldCalculated && !isRightFieldCalculated;
        if (enabled) {
            //Let's see if such join already exists
            enabled = !this.joinsList.getItems().find(function(listItem) {
                var value = listItem.getValue();
                return this.compareJoins(leftTreeSelectedNode.param.id, rightTreeSelectedNode.param.id, value.left.id, value.right.id);
            }.bind(this))
        }

        this.createJoinHandlerMap.each(function(pair) {
            domain.enableButton(pair.value.domId, enabled);
        });
    }

};

// Alias for dd.joins
var dd_joins = dd.joins;

///////////////////////////////
// Toolbar integration
///////////////////////////////

//action array
dd_joins.toolbarActionMap = {
    'copyTable' : "dd_joins.copyTable",
    'changeID' : "dd_joins.changeTableId",
    'delete': "dd_joins.deleteTable"
};

dd_joins.copyTable = function() {
    var selectedTable = dd_joins.leftTree.selectedNodes.first();
    dd_joins.duplicateTable.bind(dd_joins, selectedTable)();
};

dd_joins.changeTableId = function() {
    dd_joins.editNode(dd_joins.leftTree.selectedNodes.first());
};

dd_joins.deleteTable = function() {
    var selectedTable = dd_joins.leftTree.selectedNodes.first();
    dd_joins.removeTable.bind(dd_joins, selectedTable)();
};

dd_joins.toolbarButtonsEnabled = function() {
    var selectedNode = dd_joins.leftTree.selectedNodes.first();
    return selectedNode
            && selectedNode.isParent()
            && selectedNode.param.id !== selectedNode.CONSTANT_TABLE_ID
            && selectedNode.param.id !== selectedNode.CROSSTABLES_FIELDS_TABLE_ID
};

////////////////////////////////////////////////
// Factories
///////////////////////////////////////////////

dd_joins.treeEventFactory = {
    'leaf:mouseup': function(event){
        this.treeClickEventHandler(event.memo.node);
        Event.stop(event);
    },

    'node:mouseup': function(event) {
        this.treeClickEventHandler(event.memo.node);
        Event.stop(event);
    },

    'node:dblclick': function(event) {
        this.editNode(event.memo.node);
        Event.stop(event);
    },

    'node:edit': function(event) {
        this.changeNodeAlias(event.memo.node, event.memo.newValue);
        Event.stop(event);
    },

    'node:endEdit': function(event) {
        this.nodeEndEdit(event.memo.node);
        Event.stop(event);
    }
};

dd_joins.listEventFactory = {

    'item:change': function(event){
        var item = event.memo.item;
        item.getValue().type = event.memo.targetEvent.element().value;
        this.changeJoinTypeForAllCompositeJoins(item);
        Event.stop(event);
    },

    'item:click': function(event) {
        var targetElement = event.memo.targetEvent.element();
        var item = event.memo.item;

        if (targetElement.match(this.LIST_REMOVE_LINK_PATTERN)) {
            this.removeJoin(item);
        }

        Event.stop(event);
    }
};

dd_joins.changeJoinsListHandlerMap = $H({
    '#allJoins': dd_joins.JOINS_LIST_MODE.ALL_JOINS,
    '#selectedTableJoins': dd_joins.JOINS_LIST_MODE.BY_TABLE
});

dd_joins.createJoinHandlerMap = $H({
    '#inner': {type: 'inner', domId: 'inner'},
    '#left': {type: 'leftOuter', domId: 'left'},
    '#right': {type: 'rightOuter', domId: 'right'},
    '#full': {type: 'fullOuter', domId: 'full'}
});

///////////////////////////
// Entry point
///////////////////////////

document.observe('dom:loaded', dd.initialize.bind(dd));
