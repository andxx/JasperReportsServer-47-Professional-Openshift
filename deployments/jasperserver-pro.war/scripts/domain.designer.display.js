/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/////////////////////////////
// Domain Designer Display
/////////////////////////////
dd.display = {
    PAGE: 'design',
    LEFT_TREE_TEMPLATE_DOM_ID: 'list_responsive_collapsible_type_tables',
    RIGHT_TREE_TEMPLATE_DOM_ID: 'list_responsive_collapsible_type_sets',
    TREE_DRAG_PATTERN: '.draggable',
    JOINS_TREE_ID: 'joinsTree',
    TABLES_TREE_ID: 'tablesTree',
    VIEW_TREE_ID: 'viewTree',
    JOINS_TREE_DATA_PROVIDER: 'joinTreeDataProvider',
    TABLES_TREE_DATA_PROVIDER: 'selectedTreeDataProvider',
    VIEW_TREE_DATA_PROVIDER: 'selectedViewTreeDataProvider',
    RESOURCE_VIEW_MODES: {JOIN_TREE: 'joinTree', TABLES_TREE: 'tablesTree'},
    TAB_JOIN_TREE_VIEW_ID: 'joinTreeView',
    TAB_TABLES_LIST_VIEW_ID: 'tableListView',
    ADD_ITEM_ID: 'add',
    ADD_ITEM_TO_SET_ID: 'addToSet',
    DELETE_ITEM_ID: 'deleteItem',
    DELETE_TABLE_ID: 'deleteTable',
    NEW_SET_ID: 'newSet',
    MOVE_TO_TOP_ID: 'toTop',
    MOVE_UPWARD_ID: 'upward',
    MOVE_TO_BOTTOM_ID: 'toBottom',
    MOVE_DOWNWARD_ID: 'downward',
    DONE_BUTTON_ID: 'done',
    DEFAULT_SET_ID: 'newSet',
    CREATE_NEW_SET_ID: '#newSet',
    RESOURCES_CONTAILNER_ID: 'resourcesBody',
    SETS_CONTAILNER_ID: 'setsAndItemsBody',
    DOM_ID_TO_SAVE_SELECTED_NODES: [
        '#add', '#addToSet', '#deleteTable', '#newSet',
        '#deleteItem', '#toTop', '#upward', '#downward',
        '#toBottom', '#joinTreeView', '#tableListView', '#properties',
        '#joinsTree', '#tablesTree', '#viewTree'],
    joinsTree: null,
    tablesTree: null,
    viewTree: null,
    copyMoveController: new domain.NodeCopyMoveController(),
    resourceViewMode: null,
    dontWarnOfDeleteItems: '',
    islands: null,
    joinTreeModel: null,
    usedTablesByItemId: null,
    dataSourceId: null,
    designerMode: null,
    changeOrderController: new domain.DisplayNodeChangeOrderController(),

    getCheckDesignValidator: function() {
        return this.checkDesignValidator;
    },

    getValidationPostData: function() {
        return {
            page: this.PAGE,
            selectedModel: this.getTreeModel(this.tablesTree),
            islands: Object.toJSON(this.islands),
            selectedView: this.getTreeModel(this.viewTree)
        }
    },

    getTreeModel: function(tree) {
        var childNodes = tree.getRootNode().childs;
        return Object.toJSON(childNodes);
    },

    fillForm: function() {
        $('islands').writeAttribute('value', Object.toJSON(this.islands));
        $('selectedView').writeAttribute('value', this.getTreeModel(this.viewTree));
        $('dontWarnOfDeleteItems').writeAttribute('value', this.dontWarnOfDeleteItems);
        $('selectedModel').writeAttribute('value', this.getTreeModel(this.tablesTree));
        $('unsavedChangesPresent').writeAttribute('value', dd.isUnsavedChangesPresent().toString());
    },

    exportEnabled: function() {
        return this.viewTree && this.viewTree.getRootNode() && !!this.viewTree.getRootNode().childs.first();
    },

    exportBundleStub: function() {
        var reloadTreeCallback = function() {
            if (isWebKitEngine()) {
                this.viewTreeLoadCallback();
            }
            else {
                this.viewTree.showTree(100, this.viewTreeLoadCallback.bind(this), domain.treeErrorHandler);
            }
        }.bind(this);

        var callback = function(generateDescrKeys, generateLabelKeys) {
            dd.generateAndDownloadBundles.bind(dd)(generateDescrKeys, generateLabelKeys, reloadTreeCallback);            
        };

        dd.exportBundlesValidator.validate(callback);
    },

    initFromOptions: function(options) {
        this.joinTreeModel = options.joinTreeModel;
        this.designerMode = options.designerMode;
        this.usedTablesByItemId = options.usedTablesByItemId;
        this.dataSourceId = options.dataSourceId;
    },

    init: function(options) {
        this.initFromOptions(options);

        dd.calcFieldsAndFiltersValidator.init(dd.validateForCalcFields.bind(dd),
                dd.getTablesUsedForFilters.bind(dd, this.usedTablesByItemId[this.dataSourceId]));

        domain.resetTreeSelectionHandler.init(
                this.DOM_ID_TO_SAVE_SELECTED_NODES,
                function() {return [this.tablesTree, this.viewTree, this.joinsTree]}.bind(this),
                this.updateButtonsState.bind(this), this.deselectNodesValidator.bind(this));

        domain.registerClickHandlers([
            this.changeResourceViewModeClickHandler.bind(this),
            this.moveButtonsClickEventHandler.bind(this),
            this.createNewSetClickEventHandler.bind(this),
            this.addDeleteItemsClickEventHandler.bind(this)
        ]);

        dd_display.deleteViewItemValidator.init(this.designerMode,
                this.isDontWarnOfDeleteItems.bind(this),
                this.setDontWarnOfDeleteItems.bind(this),
                this.buildCompositeIdentifier);
        dd_display.addViewItemsValidator.init(domain.getDataIslandId);
        dd_display.checkDesignValidator.init(this.refreshViewTreeStyle.bind(this));
        dd_display.emptySetsValidator.init(this.getViewTree.bind(this), this.copyMoveController);

        this.propertiesEditor.init(options.defaultMasks, options.typesMap);
        this.initTrees();
        propsEditor.hide();
    },

    initTrees: function() {
        this.tablesTree = domain.createItemsTree({
            treeId: this.TABLES_TREE_ID,
            providerId: this.TABLES_TREE_DATA_PROVIDER,
            templateDomId: this.LEFT_TREE_TEMPLATE_DOM_ID,
            nodeClass: domain.TablesNode
        });

        this.joinsTree = domain.createItemsTree({
            treeId: this.JOINS_TREE_ID,
            providerId: this.JOINS_TREE_DATA_PROVIDER,
            templateDomId: this.LEFT_TREE_TEMPLATE_DOM_ID,
            dragPattern: dd.TREE_DRAG_PATTERN,
            nodeClass: domain.TablesNode,
            selectOnMousedown: true
        });

        this.viewTree = domain.createItemsTree({
            treeId: this.VIEW_TREE_ID,
            providerId: this.VIEW_TREE_DATA_PROVIDER,
            templateDomId: this.RIGHT_TREE_TEMPLATE_DOM_ID,
            dragPattern: dd.TREE_DRAG_PATTERN,
            nodeClass: domain.DisplayNode,
            selectOnMousedown: true
        });

        this.viewTree.createDraggableIfNeeded = function(event, node){
            this._overNode = node;
            dynamicTree.Tree.prototype.createDraggableIfNeeded.call(this, event, node);

        };

        this.viewTree.sorters = [this.sortByType, this.viewTree.sortByOrder, this.viewTree.sortByName];

        $H(this.treeEventFactory).each(function(pair) {
            [this.tablesTree, this.joinsTree, this.viewTree]
                    .invoke('observe', pair.key, pair.value.bindAsEventListener(this));
        }.bind(this));

        this.initDragAndDrop();

        this.tablesTree.showTree(1, this.tablesTreeLoadCallback.bind(this), domain.treeErrorHandler);
        this.joinsTree.showTree(2, this.joinsTreeLoadCallback.bind(this), domain.treeErrorHandler);
        this.viewTree.showTree(100, this.viewTreeLoadCallback.bind(this), domain.treeErrorHandler);
    },

    // Sorts tree so items goes first and sets after items
    sortByType: function (node1, node2) {
        var n1 = node1.param.type;
        var n2 = node2.param.type;
        return n1 < n2 ? 1 : (n1 > n2 ? -1 : 0);
    },

    initDragAndDrop: function() {
       var dropAreas = [
           this.JOINS_TREE_ID,
           this.TABLES_TREE_ID,
           this.RESOURCES_CONTAILNER_ID,
           this.VIEW_TREE_ID,
           this.SETS_CONTAILNER_ID];

       var onDrop = function(dragged, dropped, event) {
           var node = dragged.node;
           if (!node) {
               return;
           }

           var sourceTree = dynamicTree.trees[node.getTreeId()];
           var destTree = matchAny(dropped, ['#' + this.RESOURCES_CONTAILNER_ID], true)
                   ? this.joinsTree
                   : this.viewTree;

           if (sourceTree === destTree) {
               return;
           }

           if (sourceTree === this.viewTree) {
               var nodes = this.viewTree.selectedNodes;
               if (this.canDeleteTreeItems(nodes)) {
                   this.deleteItemsFromViewTree(nodes, this.successDeleteTreeItemsCallback.bind(this));
               }
           } else {
               var nodeToDrop = this.viewTree._overNode;

               if (!nodeToDrop) {
                   nodeToDrop = this.viewTree.getRootNode();
               } else if (!nodeToDrop.isParent()) {
                   while (!nodeToDrop.isParent()) {
                       nodeToDrop = nodeToDrop.parent;
                   }
               }

               nodes = this.joinsTree.selectedNodes;
               if (this.canDeleteTreeItems(nodes)) {
                   this.addItemsToViewTree(nodes, nodeToDrop);
               }

               this.viewTree._overNode = null;
           }
       }.bind(this);

       dropAreas.each(function(dropArea) {
           Droppables.remove(dropArea);
           Droppables.add(dropArea,{
               accept: ['draggable', 'wrap'],
               onDrop: onDrop
           });
       });
    },

    tablesTreeLoadCallback: function() {
        this.resourceViewMode = this.RESOURCE_VIEW_MODES.JOIN_TREE;
        $(this.TABLES_TREE_ID).addClassName(layoutModule.HIDDEN_CLASS);
        dd.createTreeNodesMap(this.tablesTree);
        this.updateButtonsState();
    },

    joinsTreeLoadCallback: function() {
        this.islands = this.createIslands(this.joinsTree.getRootNode());
        dd.createTreeNodesMap(this.joinsTree);
        this.updateButtonsState();
    },

    viewTreeLoadCallback: function() {
        dd.createTreeNodesMap(this.viewTree);
        this.buildJoinTreeModelMap();
        this.updateButtonsState();
    },

    isDontWarnOfDeleteItems: function() {
        return this.dontWarnOfDeleteItems;
    },

    setDontWarnOfDeleteItems: function(dontWarnOfDeleteItems) {
        this.dontWarnOfDeleteItems = dontWarnOfDeleteItems;
    },

    getJoinTreeModelNodeId: function(node) {
        return node.extra.itemId;
    },

    getJoinsTreeNodeId: function(node) {
        return node.param.extra.itemId;
    },

    getViewTree: function() {
        return this.viewTree;
    },
    
    buildJoinTreeModelMap: function() {
        if (!this.joinTreeModel) {
            return;
        }

        this.joinTreeModel.treeMap = {};
        this.joinTreeModel.viewTreeMap = {};
        var tempTreeModel = {};

        var processNode = function(parent, node) {
            this.joinTreeModel.treeMap[node.id] = node;            
            node.parent = parent;
            if (node.children && node.children.first()) {
                node.isParent = true;
                node.children.each(processNode.bind(this, node));
            }
        };

        this.joinTreeModel.children &&
            this.joinTreeModel.children.each(processNode.bind(this, this.joinTreeModel));

        $H(this.joinTreeModel.treeMap).values().each(function(node) {
            if (!node.isParent) {
                var resourceId = this.buildCompositeIdentifier(node, '.', this.getJoinTreeModelNodeId, this.joinTreeModel);
                tempTreeModel[resourceId] = node;
            }
        }.bind(this));


        this.viewTree.resourceIdMap = {};
        $H(this.viewTree.treeMap).values().each(function(node) {
            if (!node.isParent()) {
                var resourceId = node.param.extra.resourceId;
                if (tempTreeModel[resourceId]) {
                    this.viewTree.resourceIdMap[resourceId] = node;
                    this.joinTreeModel.viewTreeMap[resourceId] = tempTreeModel[resourceId].id;
                }
            }
        }.bind(this));
    },

    deselectNodesValidator: function() {
        var result = propsEditor.submitEdit();
        result && propsEditor.hide();
        return result;
    },

    changeResourceViewMode: function(options) {
        if (this.resourceViewMode === options.mode) {
            return;
        }
                                                             
        if (!propsEditor.submitEdit()) {
            buttonManager.unSelect(options.destTabId);
            buttonManager.select(options.sourceTabId);
            return;
        }

        var selectedNode = options.getSourceTree().selectedNodes.first();
        if (options.getSourceTree().selectedNodes.length === 1) {
            propsEditor.view(selectedNode);
        }

        $(options.sourceTreeId).addClassName(layoutModule.HIDDEN_CLASS);
        $(options.destTreeId).removeClassName(layoutModule.HIDDEN_CLASS);
        if (selectedNode) {
            var sameNodeInOtherTree = $H(options.getDestTree().treeMap).values().find(function(node) {
                return node.param.id === selectedNode.param.id;
            });

            if (sameNodeInOtherTree) {
                options.getDestTree()._deselectAllNodes();
                options.getDestTree().openAndSelectNode(sameNodeInOtherTree.param.uri);
            }
        }

        if (options.getDestTree() === this.joinsTree) {
            propsEditor.hide();
        } else {
            propsEditor.view(options.getDestTree().selectedNodes.first());
        }

        this.resourceViewMode = options.mode;
    },

    createIslands: function(rootNode) {
        var childs = rootNode.childs;
        var islands = [];
        childs.each(function(child) {
            var tablesIds = child.childs.findAll(function(node) {
                return node.isParent();
            }).collect(function(table) {
                return table.param.id;
            });

            if (tablesIds.length > 0) {
                islands.push({islandId: child.param.extra.itemId, tablesIds: tablesIds});
            }
        });

        return islands;
    },

    buildCompositeIdentifier: function(node, delimiter, getNodeId, rootNode) {
        var compositeId = getNodeId(node);
        var parentNode = node.parent;

        while (parentNode && parentNode !== rootNode) {
            compositeId = getNodeId(parentNode) + delimiter + compositeId;
            parentNode = parentNode.parent;
        }

        return compositeId;
    },

    updateViewTreeResorceIds: function(oldId, table) {
        var joinTreeNode = this.joinTreeModel.treeMap[oldId];

        var getComplexNodeId = function(nodeToChange, newItemId, node) {
            if (node === nodeToChange && newItemId) {
                return newItemId;
            } else {
                return node.extra.itemId;
            }
        }.curry(joinTreeNode, table.param.extra.itemId);

        joinTreeNode.children.each(function(node) {
            var oldResourceId = this.buildCompositeIdentifier(node, '.', this.getJoinTreeModelNodeId, this.joinTreeModel);

            delete this.joinTreeModel.treeMap[node.id];
            node.id = table.param.id + '.' + node.extra.itemId;
            this.joinTreeModel.treeMap[node.id] = node;
            
            var newResourceId = this.buildCompositeIdentifier(node, '.', getComplexNodeId, this.joinTreeModel);
            var viewTreeNode = this.viewTree.resourceIdMap[oldResourceId];
            if (viewTreeNode) {
                viewTreeNode.param.extra.resourceId = newResourceId;
                delete this.viewTree.resourceIdMap[oldResourceId];
                this.viewTree.resourceIdMap[newResourceId] = viewTreeNode;
                delete this.joinTreeModel.viewTreeMap[oldResourceId];
                this.joinTreeModel.viewTreeMap[newResourceId] = node.id;
            }
        }.bind(this));

        delete this.joinTreeModel.treeMap[joinTreeNode.id];
        joinTreeNode.id = table.param.id;
        this.joinTreeModel.treeMap[joinTreeNode.id] = joinTreeNode;
        joinTreeNode.extra.itemId = table.param.extra.itemId;
    },

    changeNodeId: function(node, newId, isTablesTree) {
        if (!node) {
            return;
        }
        
        var oldId = node.param.id;
        var tree = dynamicTree.trees[node.getTreeId()];

        if (node.isParent()) {
            if (!node.param.extra.originalId) {
                node.param.extra.originalId = node.param.extra.itemId;
            }
            node.param.extra.itemId = newId;
            node.name = newId;
            node._getElement() && (node._getTitle().data = newId);
            node.param.id = node.param.extra.datasourceId + '.' + node.param.extra.itemId;

            isTablesTree && this.updateViewTreeResorceIds(oldId, node);
        } else {
            if (!node.param.extra.originalId) {
                node.param.extra.originalId = node.parent.param.extra.originalId + '.' + node.param.extra.itemId;
            }
            node.param.id = node.parent.param.id + '.' + node.param.extra.itemId;
        }

        var isParentRoot = node.parent.param.uri === '/';
        node.param.uri = isParentRoot ? '/' + node.param.id : node.parent.param.uri + '/' + node.param.id;
        delete tree.treeMap[oldId];
        tree.treeMap[node.param.id] = node;
    },
    
    updateExpressions: function(expressionChanges) {
        if (!expressionChanges || !expressionChanges.first()) {
            return;
        }

        expressionChanges.each(function(expressionChange) {
            for (var id in expressionChange) {
                [this.tablesTree, this.joinsTree, this.viewTree].each(function(tree) {
                    var field = tree.treeMap[id];
                    if (field) {
                        field.param.extra.expression = expressionChange[id];
                    }
                })
            }
        }.bind(this));
    },

    changeNodeAlias: function(node, newValue, callback) {
        var oldId = node.param.id;
        node = this.tablesTree.treeMap[oldId];
        var oldAlias = node.param.extra.itemId;
        var joinsTreeNode = this.joinsTree.treeMap[oldId];

        var internalCallback = function(json) {
            if (json === 'error') {
                callback && callback(true);
                return;
            }

            dd.setUnsavedChangesPresent(true);
            this.updateExpressions(json.changesExpressions);

            [node, joinsTreeNode].each(function(table, index) {
                if (table) {
                    this.changeNodeId(table, newValue, index === 0);
                    table.childs.each(function(child) {
                        this.changeNodeId(child, newValue, index === 0);
                    }.bind(this))                    
                }
            }.bind(this));
            callback && callback(true);
        };

        dd.changeTableAlias(oldAlias, newValue, internalCallback.bind(this));
        
        return true;
    },

    idExistsInTree: function(tree, id) {
        var treeMap = tree.treeMap;

        return !!$H(treeMap).values().find(function(node) {
            return node.param.extra.itemId === id || node.param.id === id;
        });
    },

    createNode: function(tree, parentNode, metanode) {
        var newNode = tree.processNode(metanode);
        parentNode.addChild(newNode);
        newNode.isloaded = true;
        tree.treeMap[newNode.param.id] = newNode;

        return newNode;
    },

    getUniqueItemId: function(tree, originalId) {
        var index = 1;
        while (this.idExistsInTree(tree, originalId + index)) {
            index++;
        }

        return originalId + index;
    },

    updateChildOrders: function(parentNode) {
        if (parentNode.childs.first()) {
            this.viewTree.resortSubtree(parentNode);
            
            parentNode.childs.each(function(node, index) {
                node.orderNumber = index + 1;
            });

            parentNode.refreshNode();
        }
    },

    addNewSet: function() {
        dd.setUnsavedChangesPresent(true);

        var parentNode = this.viewTree.selectedNodes.first();
        if (!parentNode) {
            parentNode = this.viewTree.getRootNode();
        } else if (parentNode.param.type !== parentNode.Types.Folder.name) {
            parentNode = parentNode.parent;
        }

        var id = this.getUniqueItemId(this.viewTree, this.DEFAULT_SET_ID);
        var lastSiblingNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, false, false, parentNode.Types.Folder.name);
        var order = lastSiblingNode ? lastSiblingNode.orderNumber : 0;
        var uri = parentNode === this.viewTree.getRootNode() ? '/' + id : parentNode.param.uri + '/' + id;

        var metanode = {
            id: id,
            label: id,
            type: parentNode.Types.Folder.name,
            uri: uri,
            order: order + 1,
            extra: {
                itemId: id,
                label: id,
                descr: id,
                labelId: '',
                descrId: '',
                resourceId: ''
            }
        };

        var newNode = this.createNode(this.viewTree, parentNode, metanode);
        this.updateChildOrders(newNode.parent);
        return newNode;
    },

    canDeleteTreeItems: function(items) {
        sessionManager.resetSession(dd.flowExecutionKey);

        return items && items.first() && propsEditor.submitEdit();
    },

    successDeleteTreeItemsCallback: function() {
        propsEditor.hide();
        this.updateButtonsState();
    },

    getOrCreateJoinsTreeNode: function(nodeId) {
        var node = this.joinsTree.treeMap[nodeId];
        if (node && this.joinsTree.findNodeById(node.param.id)) {
            return node;
        }

        var joinTreeModelNode = this.joinTreeModel.treeMap[nodeId];
        var metanode = {
            id: joinTreeModelNode.id,
            label: joinTreeModelNode.extra.itemId,
            type: joinTreeModelNode.type,
            uri: joinTreeModelNode.uri,
            extra: deepClone(joinTreeModelNode.extra)
        };

        var parentNode;
        if (joinTreeModelNode.parent === this.joinTreeModel) {
            parentNode = this.joinsTree.getRootNode();
        } else {
            parentNode = this.getOrCreateJoinsTreeNode(joinTreeModelNode.parent.id);
        }

        return this.createNode(this.joinsTree, parentNode, metanode);
    },

    restoreItemToJoinsTree: function(resourceId) {
        delete this.viewTree.resourceIdMap[resourceId];
        var joinTreeModelId = this.joinTreeModel.viewTreeMap[resourceId];
        if (joinTreeModelId) {
            this.getOrCreateJoinsTreeNode(joinTreeModelId);
        }
    },

    updateNodeResourceId: function(node) {
        if (!node.isParent() || !node.parent) {
            return;
        }

        var notEmptyElementsCount = node.childs.findAll(function(child) {
            return !child.isParent() || child.param.extra.resourceId !== '';
        }).length;

        if (notEmptyElementsCount > 0) {
            return;
        }

        // if we are here this means that node is empty set so remove resource id from it.
        node.param.extra.resourceId = '';
        if (node.parent != this.viewTree.getRootNode()) {
            this.updateNodeResourceId(node.parent);
        }
    },

    deleteItemsFromViewTree: function(items, successDeleteTreeItemsCallback) {
        dd.setUnsavedChangesPresent(true);

        var deleteEmptyNode = function(item) {
            item.parent.removeChild(item);
            this.updateChildOrders(item.parent);
            delete this.viewTree.treeMap[item.param.id];
            if (!item.isParent()) {
                this.restoreItemToJoinsTree(item.param.extra.resourceId);
            }            
        }.bind(this);

        var deleteNode = function(node) {
            if (node.isParent()) {
                node.childs.clone().each(function(child) {
                    deleteNode(child);
                });
            }
            
            deleteEmptyNode(node);
            this.updateNodeResourceId(node.parent);
        }.bind(this);

        var callback = function(nodes) {
            nodes.clone().each(function(node) {
                deleteNode(node);
            });

            this.joinsTree.resortSubtree(this.joinsTree.getRootNode());
            if (this.resourceViewMode == dd_display.RESOURCE_VIEW_MODES.JOIN_TREE) {
                this.joinsTree.renderTree();
            }
            successDeleteTreeItemsCallback && successDeleteTreeItemsCallback();
        };

        dd_display.deleteViewItemValidator.validate(items, callback.bind(this));
    },

    deleteInvalidViewItems: function(json) {
        if ('success' !== json) {
            var itemIds = $H(json.presentationObjectIds).keys();
            dd.deleteNodesFromTreeById(itemIds, this.viewTree, this.copyMoveController);
        }
    },

    removeTables: function(tables, successDeleteTreeItemsCallback) {
        var tableIds = tables.collect(function(table) {
            return table.param.id;
        });

        var treeLoadCallback = function() {
            this.joinsTreeLoadCallback();
            $(this.JOINS_TREE_ID).addClassName(layoutModule.HIDDEN_CLASS);
        };

        var updateJoinsViewCallback = function() {
            dd.checkDesign(checkDesignCallback.bind(this));
        };

        var checkDesignCallback = function(json) {
            this.deleteInvalidViewItems(json);
            this.joinsTree.showTree(2, treeLoadCallback.bind(this), domain.treeErrorHandler);
            successDeleteTreeItemsCallback && successDeleteTreeItemsCallback();
        };

        var callback = function(involvedFieldsIds, involvedFieldsExpressionIds) {
            dd.setUnsavedChangesPresent(true);
            
            dd.deleteNodesFromTreeById(involvedFieldsIds, this.tablesTree, this.copyMoveController);
            dd.deleteNodesFromTreeById(tableIds, this.tablesTree, this.copyMoveController);
            this.updateJoinView(updateJoinsViewCallback.bind(this));
        };

        dd.calcFieldsAndFiltersValidator.validate(tables, false, callback.bind(this));
    },

    addItemToViewTree: function(item, parentNode) {
        if (item.param.extra.isIsland) {
            return item.childs.collect(function(item) {
                return this.addItemToViewTree(item, parentNode).first();
            }.bind(this));
        } else {
            var id = item.param.id;
            var itemId = item.param.extra.itemId;
            if (this.idExistsInTree(this.viewTree, itemId)) {
                itemId = this.getUniqueItemId(this.viewTree, itemId);
            }
            if (this.idExistsInTree(this.viewTree, id)) {
                id = this.getUniqueItemId(this.viewTree, id);
            }

            var type = item.isParent() ? parentNode.Types.Folder.name : parentNode.Types.Leaf.name;
            
            var rootNode = this.viewTree.getRootNode();
            var lastSiblingNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, false, false, type);
            var order = lastSiblingNode ? lastSiblingNode.orderNumber : 0;
            var uri = parentNode === rootNode ? '/' + id : parentNode.param.uri + '/' + id;
            var resourceId;
            var dataIslandId = domain.getDataIslandId(item, 'itemId');
            if (item.isParent()) {
                resourceId = dataIslandId ? dataIslandId : item.param.extra.itemId;
            } else {
                resourceId = this.buildCompositeIdentifier(item, '.', this.getJoinsTreeNodeId, this.joinsTree.getRootNode());
            }

            var metanode = {
                id: id,
                label: item.name,
                type: type,
                uri: uri,
                order: order + 1,
                extra: {
                    itemId: itemId,
                    label: item.name,
                    descr: itemId,
                    labelId: '',
                    descrId: '',
                    resourceId: resourceId
                }
            };

            if (!item.isParent()) {
                metanode.extra['dataType'] = item.param.extra.JavaType,
                metanode.extra['defaultAgg'] = 'none',
                metanode.extra['defaultMask'] = 'none'
            }

            if (parentNode.param.extra
                    && (!parentNode.param.extra.resourceId
                    || parentNode.param.extra.resourceId === item.CONSTANT_TABLE_ID)) {
                var node = parentNode;
                while (node != this.viewTree.getRootNode()) {
                    node.param.extra.resourceId = dataIslandId;
                    node = node.parent;
                }                
            }

            var viewTreeNode = this.createNode(this.viewTree, parentNode, metanode);
            this.updateChildOrders(viewTreeNode.parent);
            if (!item.isParent()) {
                this.viewTree.resourceIdMap[resourceId] = viewTreeNode;
                this.joinTreeModel.viewTreeMap[resourceId] = item.param.id;
            }

            if (item.isParent()) {
                item.childs.each(function(child) {
                    this.addItemToViewTree(child, viewTreeNode);
                }.bind(this));
            }
            
            return [viewTreeNode];
        }
    },

    addItemsToViewTree: function(items, parentNode) {
        if (!items || !items.first()) {
            return;
        }
        // bug http://bugzilla.jaspersoft.com/show_bug.cgi?id=25856
        parentNode.isloaded = true;
        var callback = function() {
            dd.setUnsavedChangesPresent(true);
            
            var newItems = [];
            items.clone().each(function(item) {
                var newNodes = this.addItemToViewTree(item, parentNode);
                newItems = newItems.concat(newNodes);
                dd.deleteNodesFromTreeById([item.param.id], this.joinsTree, this.copyMoveController);
            }.bind(this));

            newItems.compact().each(function(item) {
                this.viewTree.openAndSelectNode(item.param.uri);
            }.bind(this));
            this.viewTree._deselectAllNodes();
            newItems.each(function(node) {
                node.select();
            });

            if (this.viewTree.selectedNodes.length === 1) {
                propsEditor.view(this.viewTree.selectedNodes.first());
            }

            this.updateButtonsState();
        };

        dd_display.addViewItemsValidator.validate(parentNode, items, callback.bind(this));
    },

    refreshViewTreeStyle: function(invalidItemIds) {
        $H(this.viewTree.treeMap).values().each(function(item) {
            if (item.param.extra && item.param.extra.isInvalid) {
                delete item.param.extra['isInvalid'];
                delete item.tooltip;
                item.refreshNode();
            }
        });

        invalidItemIds && $H(invalidItemIds).each(function(pair) {
            var invalidItem = this.viewTree.treeMap[pair.key];
            if (invalidItem) {
                invalidItem.param.extra.isInvalid = 'true';
                invalidItem.tooltip = pair.value;
                invalidItem.refreshNode();
            }
        }.bind(this));
    },

    ///////////////////////////////////////
    // AJAX calls for joins business logic
    ///////////////////////////////////////
    updateJoinView: function(callback) {
        var urlData = {
            flowExecutionKey: dd.flowExecutionKey,
            eventId: 'updateJoinView'
        };

        var postData = this.getValidationPostData();
        postData['autoGenerateJoins'] = 'false';

        domain.sendAjaxRequest(urlData, postData, callback);
    },

    ///////////////////////////////////////
    // Click handlers logic
    ///////////////////////////////////////
    treeMouseDown: function(node) {
        //TODO
    },

    treeDblclick: function(node) {
        var tree = dynamicTree.trees[node.getTreeId()];
        if (tree === this.joinsTree) {
            $(this.ADD_ITEM_ID).click();
        } else if (tree === this.viewTree) {
            $(this.DELETE_ITEM_ID).click();
        }
    },

    treeMouseUp: function(node) {
        var tree = dynamicTree.trees[node.getTreeId()];
        if (tree === this.joinsTree) {
            this.updateButtonsState();
            return;
        }

        if (!propsEditor.submitEdit()) {
            var propsNode = propsEditor.getNode();
            var propsTree = dynamicTree.trees[propsNode.getTreeId()];
            if (tree === propsTree) {
                tree._deselectAllNodes();
                propsNode.select();
            }

            this.updateButtonsState();
            return;
        }

        if (tree.selectedNodes.length == 1) {
            propsEditor.view(tree.selectedNodes.first());
        } else {
            propsEditor.hide();
        }

        this.updateButtonsState();
    },

    changeResourceViewModeClickHandler: function(element) {
        var eventHandled = false;
        this.changeResourceViewModeHandlerMap.each(function(pair){
            if (domain.elementClicked(element, pair.key)) {
                this.changeResourceViewMode(pair.value);
                this.updateButtonsState();
                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    moveButtonsClickEventHandler: function(element) {
        var eventHandled = false;
        this.moveButtonsClickEventMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                var selectedNodes = this.viewTree.selectedNodes;
                selectedNodes.sort(pair.value.upward ? this.changeOrderController.nodeAscSorter : this.changeOrderController.nodeDescSorter)
                    .each(function(selectedNode) {
                        this.changeOrderController.moveNode(selectedNode, pair.value.upward, pair.value.maxmove);
                    }.bind(this));

                this.viewTree.resortSubtree(selectedNodes.first().parent);
                this.viewTree.renderTree();
                this.updateChangeOrderButtonsState();
                sessionManager.resetSession(dd.flowExecutionKey);

                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    createNewSetClickEventHandler: function(element) {
        if (domain.elementClicked(element, this.CREATE_NEW_SET_ID)) {
            sessionManager.resetSession(dd.flowExecutionKey);

            if (!propsEditor.submitEdit()) {
                throw true;
            }

            var node = this.addNewSet();
            this.viewTree.openAndSelectNode(node.param.uri);
            propsEditor.view(node);

            this.updateButtonsState();
            return true;
        }
    },

    addDeleteItemsClickEventHandler: function(element) {
        var eventHandled = false;
        this.addDeleteItemsClickEventMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                eventHandled = true;
                pair.value.bind(this)();
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    updateButtonsState: function() {
        this.updateSetsButtonsState();
        this.updateChangeOrderButtonsState();
        this.updateDeleteItemButtonState();
        this.updateDeleteTableButtonState();
        this.updateDoneButtonState();
        dd.updateToolBarButtons();
    },

    updateSetsButtonsState: function() {
        if (this.resourceViewMode !== this.RESOURCE_VIEW_MODES.JOIN_TREE) {
            domain.enableButton(this.ADD_ITEM_ID, false);
            domain.enableButton(this.ADD_ITEM_TO_SET_ID, false);

            return;
        }

        domain.enableButton(this.ADD_ITEM_ID, !!this.joinsTree.selectedNodes.first());
        var isAddToSetEnabled =
                this.joinsTree.selectedNodes.first() && this.viewTree.selectedNodes.length == 1
                        && this.viewTree.selectedNodes.first().isParent();
        domain.enableButton(this.ADD_ITEM_TO_SET_ID, isAddToSetEnabled);
    },

    disableMoveButtons: function() {
        [this.MOVE_TO_TOP_ID, this.MOVE_UPWARD_ID, this.MOVE_DOWNWARD_ID, this.MOVE_TO_BOTTOM_ID].each(function(buttonId) {
            domain.enableButton(buttonId, false);
        });
    },

    updateChangeOrderButtonsState: function() {
        if (this.viewTree && this.viewTree.selectedNodes.first()) {
            var parentNode = this.viewTree.selectedNodes.first().parent;
            var isNotSiblingsPresent = this.viewTree.selectedNodes.find(function(node) {
                return node.parent !== parentNode;
            });

            if (isNotSiblingsPresent) {
                this.disableMoveButtons();
                return;
            }

            var selectedNodesType = this.viewTree.selectedNodes.first().param.type;
            var isDifferentTypesPresent = this.viewTree.selectedNodes.find(function(type, node) {
                return node.param.type !== type;
            }.curry(selectedNodesType));

            if (isDifferentTypesPresent) {
                this.disableMoveButtons();
                return;
            }

            var highestUnselectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, false, true, selectedNodesType);
            var lowestSelectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, true, false, selectedNodesType);
            var upButtonsEnabled = highestUnselectedNode && highestUnselectedNode.orderNumber < lowestSelectedNode.orderNumber;
            [this.MOVE_TO_TOP_ID, this.MOVE_UPWARD_ID].each(function(buttonId) {
                domain.enableButton(buttonId, upButtonsEnabled);
            });

            var lowestUnselectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, false, false, selectedNodesType);
            var highestSelectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, true, true, selectedNodesType);
            var downButtonsEnabled = lowestUnselectedNode && lowestUnselectedNode.orderNumber > highestSelectedNode.orderNumber;
            [this.MOVE_DOWNWARD_ID, this.MOVE_TO_BOTTOM_ID].each(function(buttonId) {
                domain.enableButton(buttonId, downButtonsEnabled);
            });
        } else {
            this.disableMoveButtons();
        }
    },

    updateDeleteItemButtonState: function() {
        domain.enableButton(this.DELETE_ITEM_ID, this.viewTree.selectedNodes.first());
    },

    updateDeleteTableButtonState: function() {
        if (this.resourceViewMode !== this.RESOURCE_VIEW_MODES.TABLES_TREE) {
            $(this.DELETE_TABLE_ID).addClassName(layoutModule.HIDDEN_CLASS);
            return;
        }

        $(this.DELETE_TABLE_ID).removeClassName(layoutModule.HIDDEN_CLASS);
        var enabled = this.tablesTree.selectedNodes.first() && !this.tablesTree.selectedNodes.find(function(node) {
            return !node.isParent();
        });
        
        domain.enableButton(this.DELETE_TABLE_ID, enabled);
    },

    updateDoneButtonState: function() {
        var enable = !!(this.viewTree && this.viewTree.getRootNode() && this.viewTree.getRootNode().childs.first());
        domain.enableButton(this.DONE_BUTTON_ID, enable);
    }
};

// Alias for dd.display
var dd_display = dd.display;

/////////////////////
// Properties Editor
/////////////////////

dd_display.propertiesEditor = {
    _PROPERTIES_PANEL_ID: 'properties',
    _MODES: {EMPTY: 'empty', VIEW: 'view', EDIT: 'edit'},
    _ALL_FIELDSETS: ['#identification', '#bundleInfo', '#itemSpecific', '#resourceInfo'],
    _EDIT_ID: 'edit',
    _CANCEL_ID: 'cancel',
    _SAVE_ID: 'save',
    _mode: null,
    _node: null,
    _params: null,
    _defaultAgg: {},
    _defaultMasks: null,
    _dimensionOrMeasureLabels: {},
    _typesMap: null,

    ///////////////
    // Public
    ///////////////
    init: function(defaultMasks, typesMap) {
        dd_display.propertiesEditor._init.bind(dd_display.propertiesEditor)(defaultMasks, typesMap);
    },

    view: function(node, submitCallback) {
        dd_display.propertiesEditor._view.bind(dd_display.propertiesEditor)(node, submitCallback);
    },

    submitEdit: function() {
        return dd_display.propertiesEditor._submitEdit.bind(dd_display.propertiesEditor)();
    },

    getNode: function() {
        return dd_display.propertiesEditor._node;
    },

    hide: function() {
        dd_display.propertiesEditor._hide.bind(dd_display.propertiesEditor)();
    },

    ///////////////
    // Private
    ///////////////

    _init: function(defaultMasks, typesMap) {
        this._defaultMasks = defaultMasks;
        this._typesMap = typesMap;
        this._initAggregations();
        this._initDimensionOrMeasureLabels();

        domain.registerClickHandlers([this._propertiesEditorClickHandler.bind(this)]);
    },

    _propertiesEditorClickHandler: function(element) {
        var eventHandled = false;
        this.buttonsMap.each(function(pair){
            if (domain.elementClicked(element, pair.key)) {
                pair.value && pair.value();

                sessionManager.resetSession(dd.flowExecutionKey);
                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },

    //Used to convert some key value to {value: key, label: getMessageFor(key)} object
    _getGetValueLabelPairForObject: function(key) {
        return {
            'value':key,
            'label':domain.getMessage(key).replace(/&nbsp;/g,' ')
        };
    },

    // Aggregation functions setting
    _initAggregations: function() {
        this._defaultAgg['int'] = this._defaultAgg['dec'] = this.numberAggFunctionArray.collect(this._getGetValueLabelPairForObject);
        this._defaultAgg['NaN'] = this._defaultAgg['date'] = this.nanAggFunctionArray.collect(this._getGetValueLabelPairForObject);
    },

    // Set up measure and dimensions labels
    _initDimensionOrMeasureLabels: function() {
        this._dimensionOrMeasureLabels = this.dimensionOrMeasureArray.collect(this._getGetValueLabelPairForObject);
    },

    _view: function(node) {
        if (!this._submitEdit() || (this._mode === this._MODES.VIEW && this._node === node)) {
            return;
        }

        if (!node) {
            this._hide();
            return;
        }

        this._node = node;

        this._mode = this._MODES.VIEW;

        //Hide all fieldsets and fields firstly
        $$(this._ALL_FIELDSETS).each(function(element) {
            element.addClassName(layoutModule.HIDDEN_CLASS);
        });

        //Show edit button
        $(this._EDIT_ID).removeClassName(layoutModule.HIDDEN_CLASS);

        var factoryElem = this.nodeTypeFactory[node.param.type];
        factoryElem.view.bind(this)(node);
        domain.enableButton(this._EDIT_ID, factoryElem.canEdit(node));

        //Remove edit mode from properties panel
        this._enableEditMode(false);
    },

    _edit: function() {
        if (this._mode != this._MODES.VIEW) {
            return;
        }

        this._mode = this._MODES.EDIT;

        //Get factory element
        this.nodeTypeFactory[this._node.param.type].edit.bind(this)(this._node);
        this._enableEditMode(true);
    },

    _submitEdit: function() {
        if (this._mode !== this._MODES.EDIT) {
            return true;
        }

        var callback = function(result) {
            if (result) {
                dd.setUnsavedChangesPresent(true);
                this._mode = this._MODES.EMPTY;
                this._view(this._node);
            }
        }.bind(this);
        
        if (this._validate()) {
            var factoryElem = this.nodeTypeFactory[this._node.param.type];
            var params = factoryElem.getValues.bind(this)(this._node);
            var result = factoryElem.submitChanges(this._node, params, callback);

            callback(result);
            return result;
        } else {
            return false;
        }
    },

    _cancelEdit: function() {
        if (this._mode !== this._MODES.EDIT) {
            return;
        }

        this._mode = this._MODES.EMPTY;
        this._view(this._node);
        //Hides validation errors if any
        this._validate(true);
    },

    _hide: function() {
        if (!this._submitEdit()) {
            return;
        }

        this._node = null;
        this._validator = null;

        this._mode = this._MODES.EMPTY;
        $$(this._ALL_FIELDSETS.concat(['#' + this._EDIT_ID])).each(function(element) {
            element.addClassName(layoutModule.HIDDEN_CLASS);
        });
        this._enableEditMode(false);
    },

    _validate: function(onlyHideErrors) {
        return this.nodeTypeFactory[this._node.param.type].validate.bind(this)(onlyHideErrors);
    },

    _enableEditMode: function(enable) {
        if (enable) {
            $(this._PROPERTIES_PANEL_ID).addClassName('editMode');
        } else {
            $(this._PROPERTIES_PANEL_ID).removeClassName('editMode');
        }
    },

    _getDataType: function(node) {
        var type = this._typesMap[node.param.extra.dataType];
        if (!type) {
            type = 'NaN';
        }

        return type;
    },

    _itemExistsValidator: function(value) {
        var tree = dynamicTree.trees[this._node.getTreeId()];
        var treeMap = tree.treeMap;

        var valid = !$H(treeMap).values().find(function(value, node) {
            return node != this._node && node.param.extra.itemId === value;
        }.bind(this, value));

        return {
            isValid: valid,
            errorMessage: domain.getMessage('item.exists')
        }
    }
};

// Alias for properties editor
var propsEditor = dd_display.propertiesEditor;

////////////////////////////////////////////////
// Factories
///////////////////////////////////////////////

dd_display.changeResourceViewModeHandlerMap = $H({
    '#joinTreeView': {
        mode: dd_display.RESOURCE_VIEW_MODES.JOIN_TREE,
        getSourceTree: function() {return dd_display.tablesTree},
        getDestTree: function() {return dd_display.joinsTree},
        sourceTreeId: dd_display.TABLES_TREE_ID,
        destTreeId:dd_display.JOINS_TREE_ID,
        sourceTabId: dd_display.TAB_TABLES_LIST_VIEW_ID,
        destTabId: dd_display.TAB_JOIN_TREE_VIEW_ID
    },
    '#tableListView': {
        mode: dd_display.RESOURCE_VIEW_MODES.TABLES_TREE,
        getSourceTree: function() {return dd_display.joinsTree},
        getDestTree: function() {return dd_display.tablesTree},
        sourceTreeId: dd_display.JOINS_TREE_ID,
        destTreeId:dd_display.TABLES_TREE_ID,
        sourceTabId: dd_display.TAB_JOIN_TREE_VIEW_ID,
        destTabId: dd_display.TAB_TABLES_LIST_VIEW_ID
    }
});

dd_display.treeEventFactory = {
    'leaf:mousedown': function(event){
        var node = event.memo.node;
        this.treeMouseDown(node);
        Event.stop(event);
    },

    'node:mousedown': function(event) {
        var node = event.memo.node;
        this.treeMouseDown(node);
        Event.stop(event);
    },

    'leaf:mouseup': function(event){
        var node = event.memo.node;
        this.treeMouseUp(node);
        Event.stop(event);
    },

    'node:mouseup': function(event) {
        var node = event.memo.node;
        this.treeMouseUp(node);
        Event.stop(event);
    },

    'leaf:dblclick': function(event) {
        var node = event.memo.node;
        this.treeDblclick(node);
        Event.stop(event);
    },

    'node:dblclick': function(event) {
        var node = event.memo.node;
        this.treeDblclick(node);
        Event.stop(event);
    },

    'tree:mouseout': function(event) {
        var tree = event.memo.tree;
        if (tree === this.viewTree) {
            tree._overNode = null;
        }
        Event.stop(event);
    },

    'tree:blur': function(event) {
        var tree = event.memo.tree;
        if (tree === this.viewTree) {
            tree._overNode = null;
        }
        Event.stop(event);
    }
};

dd_display.moveButtonsClickEventMap = $H({
    '#toTop' : {
        upward: true,
        maxmove: true
    },

    '#upward': {
        upward: true,
        maxmove: false
    },

    '#downward': {
        upward: false,
        maxmove: false
    },

    '#toBottom': {
        upward: false,
        maxmove: true
    }
});

dd_display.addDeleteItemsClickEventMap = $H({
    '#add': function() {
        var nodes = this.joinsTree.selectedNodes;
        if (this.canDeleteTreeItems(nodes)) {
            this.addItemsToViewTree(nodes, this.viewTree.getRootNode());
        }
    },

    '#addToSet': function() {
        var nodes = this.joinsTree.selectedNodes;
        if (this.canDeleteTreeItems(nodes)) {
            this.addItemsToViewTree(nodes, this.viewTree.selectedNodes.first());
        }
    },

    '#deleteItem': function() {
        var nodes = this.viewTree.selectedNodes;
        if (this.canDeleteTreeItems(nodes)) {
            this.deleteItemsFromViewTree(nodes, this.successDeleteTreeItemsCallback.bind(this));
        }
    },

    '#deleteTable': function() {
        var nodes = this.tablesTree.selectedNodes;
        if (this.canDeleteTreeItems(nodes)) {
            this.removeTables(nodes, this.successDeleteTreeItemsCallback.bind(this));
        }
    }
});

propsEditor.numberAggFunctionArray = [
    'none',
    'Highest',
    'Lowest',
    'Average',
    'Sum',
    'DistinctCount',
    'Count'
];

propsEditor.nanAggFunctionArray = [
    'none',
    'DistinctCount',
    'Count'
];

propsEditor.dimensionOrMeasureArray = [
    'Dimension',
    'Measure'
];

propsEditor.buttonsMap = $H({
    '#edit': propsEditor._edit.bind(propsEditor),
    '#save': propsEditor._submitEdit.bind(propsEditor),
    '#cancel': propsEditor._cancelEdit.bind(propsEditor)
});

propsEditor.nodeTypeFactory = {
    'ItemGroupType': {
        view: function(node) {
            $$(['#identification', '#bundleInfo']).each(function(element) {
                element.removeClassName(layoutModule.HIDDEN_CLASS);
            });

            var extra = node.param.extra;
            var emptyMessage = domain.getMessage('none');
            $('itemName').writeAttribute('readonly', 'readonly').value = extra.label ? extra.label : emptyMessage;
            $('itemID').writeAttribute('readonly', 'readonly').value = extra.itemId;
            $('itemDescription').writeAttribute('readonly', 'readonly').value = extra.descr ? extra.descr : emptyMessage;
            $('itemNameKey').writeAttribute('readonly', 'readonly').value = extra.labelId ? extra.labelId : emptyMessage;
            $('itemDescriptionKey').writeAttribute('readonly', 'readonly').value = extra.descrId ? extra.descrId : emptyMessage;
        },
        canEdit: function(node) {
            return true;
        },                        
        edit: function(node) {
            $('itemName').writeAttribute('readonly', null);
            $('itemID').writeAttribute('readonly', null);
            $('itemDescription').writeAttribute('readonly', null);
            $('itemNameKey').writeAttribute('readonly', null);
            $('itemDescriptionKey').writeAttribute('readonly', null);

            $H({
                'label': 'itemName',
                'descr': 'itemDescription',
                'labelId': 'itemNameKey',
                'descrId': 'itemDescriptionKey'
            }).each(function(pair) {
                if (!node.param.extra[pair.key]) {
                    $(pair.value).value = '';
                }
            });
        },
        getValues: function() {
            return {
                label: $F('itemName'),
                itemId: $F('itemID'),
                descr: $F('itemDescription'),
                labelId: $F('itemNameKey'),
                descrId: $F('itemDescriptionKey')
            }
        },
        validate: function(onlyHideErrors) {
            if (onlyHideErrors) {
                [$('itemName'),
                    $('itemDescription'),
                    $('itemNameKey'),
                    $('itemDescriptionKey'),
                    $('itemID')].each(function(element) {
                    ValidationModule.hideError(element);
                });

                return true;
            }

            return ValidationModule.validate([
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemName')},
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemDescription')},
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemNameKey')},
                {validator: dd.itemIdValidator.bind(this, "itemNameKey.invalid"), element: $('itemNameKey')},
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemDescriptionKey')},
                {validator: dd.itemIdValidator.bind(this, "itemDescriptionKey.invalid"), element: $('itemDescriptionKey')},
                {validator: this._itemExistsValidator.bind(this), element: $('itemID')},
                {validator: dd.nonEmptyItemIdValidator.bind(this), element: $('itemID')},
                {validator: dd.emptyValidator.bind(this), element: $('itemID')}
            ]);
        },
        submitChanges: function(node, values) {
            node.changeName(values.label && values.label.strip() ? values.label : values.itemId);
            $H(values).each(function(pair) {
                node.param.extra[pair.key] = pair.value;
            });

            return true;
        }
    },

    'ItemType': {
        view: function(node) {
            $$(['#identification', '#bundleInfo', '#itemSpecific']).each(function(element) {
                element.removeClassName(layoutModule.HIDDEN_CLASS);
            });

            var extra = node.param.extra;
            var emptyMessage = domain.getMessage('none');
            $('itemName').writeAttribute('readonly', 'readonly').value = extra.label ? extra.label : emptyMessage;
            $('itemID').writeAttribute('readonly', 'readonly').value = extra.itemId;
            $('itemDescription').writeAttribute('readonly', 'readonly').value = extra.descr ? extra.descr : emptyMessage;
            $('itemNameKey').writeAttribute('readonly', 'readonly').value = extra.labelId ? extra.labelId : emptyMessage;
            $('itemDescriptionKey').writeAttribute('readonly', 'readonly').value = extra.descrId ? extra.descrId : emptyMessage;
            $('resourceID').value = extra.resourceId;

            var dataType = this._getDataType(node);

            var buildOptions = function(propName, option, index) {
                var opt = {value: option.value, label: option.label},
                    isNumeric = dataType == 'int' || dataType == 'dec';
                if (extra[propName]) {
                    opt['selected'] = extra[propName] === option.value;
                }else if (propName == 'dimensionOrMeasure'){
                    //set measures as default element in drop-down
                    opt['selected'] =  isNumeric && opt.value == 'Measure'
                }else{
                    //set first element as default in drop-down
                    opt['selected'] =  index == 0
                }
                return opt;
            };

            var options = this._defaultAgg[dataType].collect(buildOptions.curry('defaultAgg'));
            domain.setOptionsToSelect($('summaryType').writeAttribute('disabled', 'diabled'), options);

            options = this._dimensionOrMeasureLabels.collect(buildOptions.curry('dimensionOrMeasure'));
            domain.setOptionsToSelect($('dimensionOrMeasure').writeAttribute('disabled', 'diabled'), options);

            if (dataType !== 'NaN') {
                $$('label[for=dataFormat]').first().removeClassName(layoutModule.HIDDEN_CLASS);
                options = this._defaultMasks[dataType].collect(buildOptions.curry('defaultMask'));
                domain.setOptionsToSelect($('dataFormat').writeAttribute('disabled', 'disabled'), options);
            } else {
                $$('label[for=dataFormat]').first().addClassName(layoutModule.HIDDEN_CLASS);
            }
        },
        canEdit: function(node) {
            return true;
        },
        edit: function(node) {
            $('itemName').writeAttribute('readonly', null);
            $('itemID').writeAttribute('readonly', null);
            $('itemDescription').writeAttribute('readonly', null);
            $('itemNameKey').writeAttribute('readonly', null);
            $('itemDescriptionKey').writeAttribute('readonly', null);
            $('summaryType').writeAttribute('disabled', null);
            if (this._getDataType(node) !== 'NaN') {
                $('dataFormat').writeAttribute('disabled', null);
            }
            $('dimensionOrMeasure').writeAttribute('disabled', null);

            $H({
                'label': 'itemName',
                'descr': 'itemDescription',
                'labelId': 'itemNameKey',
                'descrId': 'itemDescriptionKey'
            }).each(function(pair) {
                if (!node.param.extra[pair.key]) {
                    $(pair.value).value = '';
                }
            });
        },
        getValues: function(node) {
            var values  = {
                label: $F('itemName'),
                itemId: $F('itemID'),
                descr: $F('itemDescription'),
                labelId: $F('itemNameKey'),
                descrId: $F('itemDescriptionKey'),
                defaultAgg: $F('summaryType'),
                dimensionOrMeasure: $F('dimensionOrMeasure')
            };

            if (this._getDataType(node) !== 'NaN') {
               values['defaultMask'] = $F('dataFormat');
            }

            return values;
        },
        validate: function(onlyHideErrors) {
            if (onlyHideErrors) {
                [$('itemName'),
                    $('itemDescription'),
                    $('itemNameKey'),
                    $('itemDescriptionKey'),
                    $('itemID')].each(function(element) {
                    ValidationModule.hideError(element);
                });

                return true;
            }

            return ValidationModule.validate([
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemName')},
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemDescription')},
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemNameKey')},
                {validator: dd.itemIdValidator.bind(this, "itemNameKey.invalid"), element: $('itemNameKey')},
                {validator: dd.escapeJsonValidator.bind(this), element: $('itemDescriptionKey')},
                {validator: dd.itemIdValidator.bind(this, "itemDescriptionKey.invalid"), element: $('itemDescriptionKey')},
                {validator: this._itemExistsValidator.bind(this), element: $('itemID')},
                {validator: dd.nonEmptyItemIdValidator.bind(this), element: $('itemID')},
                {validator: dd.emptyValidator.bind(this), element: $('itemID')}
            ]);
        },
        submitChanges: function(node, values) {
            node.changeName(values.label && values.label.strip() ? values.label : values.itemId);
            $H(values).each(function(pair) {
                node.param.extra[pair.key] = pair.value;
            });

            return true;
        }
    },

    'level': {
        view: function(node) {
            $('resourceInfo').removeClassName(layoutModule.HIDDEN_CLASS);
            $$(['label[for=resourceItemType]']).first().addClassName(layoutModule.HIDDEN_CLASS);

            var extra = node.param.extra;
            $('resourceItemId').writeAttribute('readonly', 'readonly').value = extra.itemId;
            $('resourceItemDataSource').value = extra.dataSource;
            $('resourceItemSourceTable').value = extra.table;
        },
        canEdit: function(node) {
            return !node.param.extra.isIsland && ![node.CONSTANT_TABLE_ID, node.CROSSTABLES_FIELDS_TABLE_ID].include(node.param.id);
        },
        edit: function(node) {
            $('resourceItemId').writeAttribute('readonly', null);
        },
        getValues: function() {
            return {
                itemId: $F('resourceItemId')
            };
        },
        validate: function() {
            return ValidationModule.validate([
                {validator: this._itemExistsValidator.bind(this), element: $('resourceItemId')},
                {validator: dd.nonEmptyItemIdValidator.bind(this), element: $('resourceItemId')},
                {validator: dd.emptyValidator.bind(this), element: $('resourceItemId')}                                
            ]);
        },
        submitChanges: function(node, values, callback) {
            if (node.param.extra.itemId === values.itemId) {
                return true;
            }

            dd_display.changeNodeAlias(node, values.itemId, callback);
            return true;
        }
    },

    'item': {
        view: function(node) {
            $('resourceInfo').removeClassName(layoutModule.HIDDEN_CLASS);
            $$(['label[for=resourceItemType]']).first().removeClassName(layoutModule.HIDDEN_CLASS);

            var extra = node.param.extra;
            $('resourceItemId').writeAttribute('readonly', 'readonly').value = extra.itemId;
            $('resourceItemDataSource').value = extra.dataSource;
            $('resourceItemSourceTable').value = extra.table;
            $('resourceItemType').value = extra.JavaType;
        },
        canEdit: function(node) {
            return false;
        },
        edit: function(node) {
            //Do nothing
        },
        getValues: function() {
            //Do nothing
        },
        validate: function() {
            //Do nothing
        },
        submitChanges: function(node, values) {
            //Do nothing
        }
    }
};

///////////////////////////
// Entry point
///////////////////////////

document.observe('dom:loaded', dd.initialize.bind(dd));
