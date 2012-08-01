/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////
// Data chooser Display
//////////////////////////
dc.display = {
    ITEMS_TREE_DOM_ID: 'foldersTreeRoot',
    CONTAINER_TREE_DOM_ID: 'containerTree',
    MOVE_BUTTON_IDS: ['#toTop', '#upward', '#downward', '#toBottom'],
    treeItemsModel: null,
    treeItemsMap: {},
    listItemsModel: null,
    listItemsMap: {},
    itemOriginalLabels: null,
    flatList: null,
    flatListOrderChanged: false,
    itemsTree: null,
    changeOrderController: new domain.NodeChangeOrderController(),
    lastSelectedNode: null,

    fillForm: function() {
        $('slSortedQueryTree').writeAttribute('value', dc.display.getTreeItemsModelJSON());
        $('slSortedQueryList').writeAttribute('value', dc.display.getListItemsModelJSON());
        $('isSimpleListCheckbox').writeAttribute('value', dc.display.flatList ? 'true' : 'false');
        $('unsavedChangesPresent').writeAttribute('value', dc.isUnsavedChangesPresent().toString());
    },

    getTreeItemsModelJSON: function() {
        return dc.display.convertNodesModelToJSON(dc.display.treeItemsModel);
    },

    getListItemsModelJSON: function() {
        return dc.display.convertNodesModelToJSON(dc.display.listItemsModel);
    },

    convertNodesModelToJSON: function(rootNode) {
        var children = '';
        if (rootNode.children) {
            rootNode.children.each(function(child) {
                if (children) children += ',';
                children += dc.display._convertNodeToJSON(child);
            });
        }
        return '[' + children + ']';
    },

    _prepareNodeForJSON: function(node) {
        var nmodel = {};
        nmodel.id = node.id;
        nmodel.label = node.label;
        nmodel.type = node.type;
        nmodel.order = node.order;

        if(node.extra) {
            nmodel.labelId = (node.extra.labelId ? node.extra.labelId : "");
            nmodel.dataType = (node.extra.dataType ? node.extra.dataType : "");
            nmodel.resourceId = node.extra.resourceId;
        }

        if (node.children) {
            var children = node.children;
            var childArray = new Array(children.length);

            for(var i=0; i< children.length; i++) {
                childArray[i] = dc.display._prepareNodeForJSON(children[i]);
            }
            childArray.sort(function(nodeA, nodeB) {
                return nodeA.order - nodeB.order
            });

            nmodel.children = childArray;
        }
        return nmodel;
    },

    _convertNodeToJSON: function(node) {
        var preparedNode = dc.display._prepareNodeForJSON(node);
        return Object.toJSON(preparedNode);
    },

    init: function(options) {
        this.setUpJSONModels(options);
        this.initTree();
        this.initFlatListOrderChanged();
        this.initTreeEvents();

        domain.resetTreeSelectionHandler.init(
                this.MOVE_BUTTON_IDS.concat(['#' + this.ITEMS_TREE_DOM_ID]),
                function() {return [this.itemsTree]}.bind(this),
                this.itemSelectionClearCallback.bind(this));

        domain.registerClickHandlers(
                [this.moveButtonsClickEventHandler.bind(this),
                 this.displayAsButtonsClickEventHandler.bind(this)]);
        this.updateMoveButtonsState();

        this.itemsTree.renderTree();
        if (!this.flatList) {
            this.itemsTree.getRootNode() &&
            this.itemsTree.getRootNode().expandAllChilds();
        }
    },

    setUpJSONModels: function(options) {
        this.treeItemsModel = options.treeItemsModel;
        this.listItemsModel = options.listItemsModel;
        this.itemOriginalLabels = options.itemOriginalLabels;
        this.flatList = options.isFlatList;
    },

    buildMapModelFromNode: function(node, map) {
        map[node.id] = node;
        //It is not necessary to show tooltip on display page;
        node.tooltip && delete node.tooltip;

        if (node.children && node.children.length > 0) {
            node.children.each(function(child) {
                child.parent = node;
                this.buildMapModelFromNode(child, map);
            }.bind(this));
        }
    },

    buildTreeFromModel: function(isFlat) {
        if (this.itemsTree && this.itemsTree.getRootNode()) {
            this.itemsTree.getRootNode().childs.each(function(node) {
                node && node.parent.removeChild(node);
            })
        }

        var rootObj = isFlat ? this.listItemsModel : this.treeItemsModel;

        // build items tree
        this.itemsTree.setRootNode(this.itemsTree.processNode(rootObj));

        //Set all nodes to be editable
        for (var id in dynamicTree.nodes) {
            var node = dynamicTree.nodes[id];
            if (this.itemOriginalLabels[node.param.id]) {
                node.param.extra.label = this.itemOriginalLabels[node.param.id];
                if (isFlat && !node.isParent()) {
                    var parentNode = this.treeItemsMap[node.param.id].parent;
                    if (parentNode) {
                        var parentLabel = this.itemOriginalLabels[parentNode.id];
                        node.param.extra.label = parentLabel + '.' + node.param.extra.label;
                    }                    
                }
            }

            if (node.getTreeId() === this.ITEMS_TREE_DOM_ID) {
                node.editable = true;
            }
        }

        this.itemsTree.renderTree();
    },

    buildLeafArrayFromItemsMap: function(itemsMap) {
        var leafArray = [];
        for (var id in itemsMap) {
            var node = itemsMap[id];
            if (!node.children) {
                leafArray.push(node);
            }
        }

        return leafArray;
    },

    initFlatListOrderChanged: function() {
        if (this.flatList) {
            var treeLeaves = this.buildLeafArrayFromItemsMap(this.treeItemsMap);
            var listLeaves = this.buildLeafArrayFromItemsMap(this.listItemsMap);

            for (var i = 0; i < treeLeaves.length; i++) {
                if (treeLeaves[i].id !== listLeaves[i].id) {
                    this.flatListOrderChanged = true;
                    break;
                }
            }
        }
    },

    initTree: function() {

        this.itemsTree = domain.createItemsTree({
            treeId: this.ITEMS_TREE_DOM_ID,
            nodeClass: domain.TwoColumnNode,
            templateDomId: "list_responsive"
        });
        this.itemsTree.NODE_CUSTOM_PATTERNS = [layoutModule.COLUMN_NODE_WRAPPER_PATTERN];
        this.itemsTree.LEAF_CUSTOM_PATTERNS = [layoutModule.COLUMN_LEAF_WRAPPER_PATTERN];

        [{rootNode: this.treeItemsModel, map: this.treeItemsMap},
            {rootNode: this.listItemsModel, map: this.listItemsMap}]
                .each(function(element) {
            this.buildMapModelFromNode(element.rootNode, element.map);
        }.bind(this));

        this.buildTreeFromModel(this.flatList);

        if (isIPad()) {
//            var sTreeElement = $(this.ITEMS_TREE_DOM_ID);
            var sTreeElement = $("containerTree");
            new TouchController(sTreeElement, sTreeElement.up(1));
        }

    },

    // ---- Tree event handling: START ---
    deselectAllExceptSiblings: function(node) {
        if (node && node.parent && node != this.itemsTree.getRootNode()) {
            var siblingsId = node.parent.childs.collect(function(child) {
                return {node: child, selected: child.isSelected()};
            });

            var selectedNodes = this.itemsTree.selectedNodes.collect(function(node) {
                return node;
            });

            this.itemsTree.resetSelected();

            siblingsId.each(function(siblingParam) {
                if (siblingParam.selected) {
                    siblingParam.node.select();
                }
            });

            selectedNodes.each(function(node) {
                node.refreshStyle();
            });
        }
    },

    buildFlatLabel: function(node, isDisplayLabel) {
        if (!node) {
            return;
        }

        var parentNode = node.parent;
        var tree = dynamicTree.trees[node.getTreeId()];
        var flatLabel = isDisplayLabel ? node.name : node.param.extra.label;

        while (parentNode && parentNode != tree.getRootNode()) {
            //if (!flatLabel.startsWith(parentNode.name + '.')) {
            // part of #18845 fix
            if (flatLabel.indexOf(parentNode.name) == -1) {
                flatLabel =
                        isDisplayLabel ? parentNode.name + '.' + flatLabel
                                : parentNode.param.extra.label + '.' + flatLabel;
            }
            parentNode = parentNode.parent;
        }

        return flatLabel;
    },

    updateListItemsMapByNode: function(node) {
        if (!node) {
            return;
        }

        if (!node.isParent()) {
            this.listItemsMap[node.param.id].label = this.buildFlatLabel(node, true);
        } else if (node.hasChilds()) {
            node.childs.each(function(child) {
                this.updateListItemsMapByNode(child);
            }.bind(this));
        }
    },

    nodeMouseup: function(event) {
        var node = event.memo.node;
        if (node) {
            if (dynamicTree.treeNodeEdited != null && dynamicTree.treeNodeEdited !== node) {
                dynamicTree.treeNodeEdited.doEndEdit();
            }

            if (dynamicTree.treeNodeEdited == null || dynamicTree.treeNodeEdited !== node) {
                if (!this.flatList) {
                    this.deselectAllExceptSiblings(node);
                }

                if (this.itemsTree.selectedNodes.length === 1 && this.lastSelectedNode === node) {
                    node.edit();
                }
            }

            if (this.itemsTree.selectedNodes.length === 1) {
                this.lastSelectedNode = this.itemsTree.selectedNodes.first();
            } else {
                this.lastSelectedNode = null;
            }

            this.updateMoveButtonsState();
            sessionManager.resetSession(dc.flowExecutionKey);
            Event.stop(event);
        }
    },

    nodeEdit: function(event) {
        var node = event.memo.node;
        var newValue = event.memo.newValue.escapeHTML().replace(/"/g, '&quot;');

        if (node && node.name !== newValue) {
            node.name = newValue;
            this.treeItemsMap[node.param.id].label = newValue;
            this.treeItemsMap[node.param.id].extra.labelId = '';

            if (this.flatList) {
                this.listItemsMap[node.param.id].label = newValue;
                this.listItemsMap[node.param.id].extra.labelId = '';
            } else {
                this.updateListItemsMapByNode(node);
            }
        }

        node.deselect();
        this.updateMoveButtonsState();
        sessionManager.resetSession(dc.flowExecutionKey);
        Event.stop(event);
    },

    initTreeEvents: function() {
        for (var eventName in this.treeEventFactory) {
            this.itemsTree.observe(eventName, this.treeEventFactory[eventName].bind(this));
        }
    },
    // ---- Tree event handling: END ---

    // ---- Move buttons event handling: START ---
    updateNodeOrderNumberInItemsMap: function(node, order) {
        if (this.flatList) {
            this.flatListOrderChanged = true;
            this.listItemsMap[node.param.id].order = order;
        } else {
            this.treeItemsMap[node.param.id].order = order;
        }
    },

    updateMoveButtonsState: function() {
        if (this.itemsTree && this.itemsTree.selectedNodes.length > 0) {
            var parentNode = this.itemsTree.selectedNodes[0].parent;

            var highestUnselectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, false, true);
            var lowestSelectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, true, false);
            var upButtonsEnabled = highestUnselectedNode && highestUnselectedNode.orderNumber < lowestSelectedNode.orderNumber;
            ['toTop', 'upward'].each(function(buttonId) {
                domain.enableButton(buttonId, upButtonsEnabled);
            });

            var lowestUnselectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, false, false);
            var highestSelectedNode = this.changeOrderController.findMaxSiblingNode(parentNode.childs, true, true);
            var downButtonsEnabled = lowestUnselectedNode && lowestUnselectedNode.orderNumber > highestSelectedNode.orderNumber;
            ['downward', 'toBottom'].each(function(buttonId) {
                domain.enableButton(buttonId, downButtonsEnabled);
            });
        } else {
            ['toTop', 'upward', 'downward', 'toBottom'].each(function(buttonId) {
                domain.enableButton(buttonId, false);
            });
        }
    },

    moveButtonsClickEventHandler: function(element) {
        var eventHandled = false;
        this.moveButtonsClickEventMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                var selectedNodes = this.itemsTree.selectedNodes;
                var sortedNodes = selectedNodes.sort(pair.value.upward ? this.changeOrderController.nodeAscSorter : this.changeOrderController.nodeDescSorter);
                var nodeToScroll = pair.value.upward ? sortedNodes.first() : sortedNodes.last();
                sortedNodes.each(function(selectedNode) {
                    this.changeOrderController.moveNode(selectedNode, pair.value.upward, pair.value.maxmove, this.updateNodeOrderNumberInItemsMap.bind(this));
                }.bind(this));

                this.itemsTree.resortSubtree(selectedNodes[0].parent);
                this.itemsTree.renderTree();
                nodeToScroll.scroll($(this.CONTAINER_TREE_DOM_ID));
                this.updateMoveButtonsState();
                sessionManager.resetSession(dc.flowExecutionKey);

                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    },
    // ---- Move buttons event handling: END ---

    itemSelectionClearCallback: function() {
        if (dynamicTree.treeNodeEdited != null) {
            dynamicTree.treeNodeEdited.doEndEdit();
        }

        this.updateMoveButtonsState();
    },

    // ---- Display As buttons event handling: START ---
    convertTreeModelToListModel: function(node, lastFlatIndex, flatList) {
        if (!node) {
            return;
        }

        if (!node.isParent()) {
            var treeNode = this.treeItemsMap[node.param.id];
            var flatNode = {
                id: treeNode.id,
                tooltip: treeNode.tooltip,
                type: treeNode.type,
                uri: treeNode.uri
            };
            
            flatNode.extra = deepClone(treeNode.extra);
            flatNode.label = this.buildFlatLabel(node, true);
            flatNode.extra.label = this.buildFlatLabel(node, false);
            flatNode.order = lastFlatIndex++;
            flatList.push(flatNode);
        }

        if (node.hasChilds()) {
            node.childs.each(function(child) {
                lastFlatIndex = this.convertTreeModelToListModel(child, lastFlatIndex, flatList);
            }.bind(this))
        }

        return lastFlatIndex;
    },

    convertTreeViewToListView: function() {
        var newFlatModel = [];
        this.convertTreeModelToListModel(this.itemsTree.getRootNode(), 1, newFlatModel);
        this.listItemsModel.children = newFlatModel;
        this.buildMapModelFromNode(this.listItemsModel, this.listItemsMap);
    },

    displayAsButtonsClickEventHandler: function(element) {
        var eventHandled = false;
        this.displayAsButtonsClickEventMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                if (this.flatList !== pair.value.flatListState) {
                    return;
                }

                if (this.flatListOrderChanged) {
                    //TODO remove this when error dialog will be fixed
                    if (!confirm(domain.getMessage('sortingInfoWillBeLost'))) {
                        return;
                    }
                }

                this.flatListOrderChanged = false;
                this.flatList = !this.flatList;

                if (this.flatList) {
                    this.convertTreeViewToListView();
                }

                this.buildTreeFromModel(this.flatList);
                this.itemsTree.resortTree();
                this.itemsTree.renderTree();
                if (!this.flatList) {
                    this.itemsTree.getRootNode() &&
                    this.itemsTree.getRootNode().expandAllChilds();
                }

                if (pair.value.removeClassName) {
                    $('foldersTree').removeClassName(pair.value.removeClassName);
                }
                if (pair.value.addClassName) {
                    $('foldersTree').addClassName(pair.value.addClassName);
                }

                this.itemsTree.resetSelected();
                this.updateMoveButtonsState();
                sessionManager.resetSession(dc.flowExecutionKey);

                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    }
    // ---- Display As buttons event handling: END ---
};

var dc_display = dc.display;

// Default events factory for trees
dc_display.treeEventFactory = {
    'leaf:mouseup': dc_display.nodeMouseup,

    'node:mouseup': dc_display.nodeMouseup,

    'node:edit': dc_display.nodeEdit,

    'leaf:edit': dc_display.nodeEdit
};

dc_display.moveButtonsClickEventMap = $H({
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

dc_display.displayAsButtonsClickEventMap = $H({
    '#nestedList': {
        flatListState: true,
        removeClassName: 'flat'
    },

    '#flatList': {
        flatListState: false,
        addClassName: 'flat'
    }
});

////////////////////////////////////////////////
// Initialization entry point
///////////////////////////////////////////////

document.observe('dom:loaded', dc.initialize.bind(dc));
