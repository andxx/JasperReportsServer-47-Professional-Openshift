/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////
// Data chooser Fields
//////////////////////////
dc.fields = {
    SOURCE_FIELDS_DOM_ID: 'sourceFieldsTree',
    DESTINATION_FIELDS_DOM_ID: 'destinationFieldsTree',
    SOURCE_TABLES_COLUMN_DOM_ID: 'sourceTablesColumn',
    DESTINATION_TABLES_COLUMN_DOM_ID: 'destTablesColumn',
    SOURCE_FIELDS_TREE_PROVIDER: 'semantic-layer-tree-data-provider',
    DESTINATION_FIELDS_TREE_PROVIDER: 'semantic-layer-query-tree-data-provider',
    TREE_TEMPLATE_DOM_ID: "list_responsive_collapsible_fields",
    NODE_CLASS: domain.ItemNode,
    MOVE_BUTTONS_PATTERN_PREFIX: '#moveButtons > .',
    FLOW_NAVIGATION_BUTTONS: ['filtersTab', 'displayTab', 'saveTopicTab', 'goToDesigner_table', 'goToDesigner_chart', 'goToDesigner_crosstab'],
    DRAG_PATTERN: '.draggable',
    CONSTANT_TABLE_ID: 'constant_fields_level',
    DOM_IDS_TO_SAVE_TREE_SELECTION: [
        '#sourceTablesColumn', '#destTablesColumn',
        '#left', '#right', '#toLeft', '#toRight'],
    TAB_CLASS_NAME: 'tab',
    dataIslandParser: new RegExp("(^[^\\.]+)"),
    sourceFieldsTree: null,
    destinationFieldsTree: null,
    nodeCopyMoveController: new domain.FieldsCopyMoveController(),
    DATA_CHOOSER_MODE: 'dataChooserMode',
    RE_ENTRANCE_MODE: 'reEntranceMode',
    mode: this.DATA_CHOOSER_MODE,
    reEntranceDialogCSSSelector: '#selectFields',

    fillForm: function() {
        var selectedModel
                = domain.chooser.fields.destinationFieldsTree.getRootNode().childs.first()
                ? Object.toJSON(domain.chooser.fields.destinationFieldsTree.getRootNode().childs.findAll(function(node) {
                    return !node.isHidden();
                  }))
                : '';

        $('selectedModel').writeAttribute('value', selectedModel);
        $('unsavedChangesPresent').writeAttribute('value', dc.isUnsavedChangesPresent().toString());
    },

    init: function(options) {
        this.initTrees();

        if (this.mode == this.RE_ENTRANCE_MODE) {
            domain.registerClickHandlers([this.moveButtonsClickEventHandler.bind(this)], this.reEntranceDialogCSSSelector);
        } else {
            domain.registerClickHandlers([this.moveButtonsClickEventHandler.bind(this)]);
        }
        domain.detailsDialog.init();

        domain.resetTreeSelectionHandler.init(
                this.DOM_IDS_TO_SAVE_TREE_SELECTION,
                function() {return [this.sourceFieldsTree, this.destinationFieldsTree]}.bind(this),
                this.updateButtonsState.bind(this));

        this.updateButtonsState();

        if (this.mode == this.DATA_CHOOSER_MODE) {
            this.processInvalidFields(options.invalidFields);
        }

        this.sourceFieldsTree.showTree(100, this.sourceTreeUpdateCallback.bind(this), domain.treeErrorHandler);
        this.destinationFieldsTree.showTree(100,  this.destTreeUpdateCallback.bind(this), domain.treeErrorHandler);
        disableSelectionWithoutCursorStyle($(document.body));
    },

    processInvalidFields: function(invalidFields) {
        var deletedFields = invalidFields['deletedFields'] ? '<p>' + invalidFields['deletedFields'].join('</p><p>') + '</p>': null;
        var movedFields = invalidFields['movedFields'] ? '<p>' + invalidFields['movedFields'].join('</p><p>') + '</p>': null;
        
        var message = '';
        if (deletedFields) {
            message += domain.getMessage('error.itemsDeleted', {fields: deletedFields});
        }
        if (movedFields) {
            message += domain.getMessage('error.movedFields', {fields: movedFields});
        }

        message && domain.detailsDialog.show(message);
    },

    sourceTreeUpdateCallback: function() {
        this.updateButtonsState();
    },

    destTreeUpdateCallback: function() {
        this.updateButtonsState();
        this.disableNodesInAdhocReEntrance();
    },

    // defined in designer.reentrant.js
    disableNodesInAdhocReEntrance: function() {},

    // Create trees for data chooser fields page
    initTrees: function(){

        this.sourceFieldsTree = domain.createItemsTree({
            handleNodeOnDblclick: false,
            treeId: this.SOURCE_FIELDS_DOM_ID,
            providerId: this.SOURCE_FIELDS_TREE_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            nodeClass: this.NODE_CLASS,
            dragPattern: this.DRAG_PATTERN,
            selectOnMousedown: !isIPad()
        });

        this.destinationFieldsTree = domain.createItemsTree({
            handleNodeOnDblclick: false,
            treeId: this.DESTINATION_FIELDS_DOM_ID,
            providerId: this.DESTINATION_FIELDS_TREE_PROVIDER,
            templateDomId: this.TREE_TEMPLATE_DOM_ID,
            nodeClass: this.NODE_CLASS,
            dragPattern: this.DRAG_PATTERN,
            selectOnMousedown: !isIPad()
        });

        if (isIPad()) {
            var sTreeElement = $(this.SOURCE_FIELDS_DOM_ID);
            new TouchController(sTreeElement, sTreeElement.up(1));

            var dTreeElement = $(this.DESTINATION_FIELDS_DOM_ID);
            new TouchController(dTreeElement, dTreeElement.up(1));
        }

        $H(this.treeEventFactory).each(function(pair) {
            [this.sourceFieldsTree, this.destinationFieldsTree]
                    .invoke('observe', pair.key, pair.value.bind(this));
        }.bind(this));

        this.initDragAndDrop();        
    },

    validateDataIslands: function(destTree, nodes) {
        var srcTree = dynamicTree.trees[nodes.first().getTreeId()];

        if (srcTree !== this.sourceFieldsTree) {
            return true;
        }

        var sourceTreeDataIslands = nodes.collect(function(node) {
            return this.getNodeDataIsland(node);
        }.bind(this)).uniq();

        var destTreeDataIslands = this.getTreeDataIslands(destTree);
        var differentIslandsSelected = sourceTreeDataIslands.without(this.CONSTANT_TABLE_ID).length > 1;

        return !differentIslandsSelected && this.isSameDataIslandsOnBothTrees(sourceTreeDataIslands, destTreeDataIslands);
    },

    moveNodes: function(nodes, rootNode, moveAll) {
        if (!nodes || !nodes.first()) {
            return;
        }

        dc.setUnsavedChangesPresent(true);
        
        var destTree = dynamicTree.trees[rootNode.getTreeId()];

        ValidationModule.hideError($(this.DESTINATION_FIELDS_DOM_ID));
        if (!this.validateDataIslands(destTree, nodes)) {
            ValidationModule.showError($(this.DESTINATION_FIELDS_DOM_ID), domain.getMessage('error.fromDifferentIslands'));
            return;
        }

        var copies = this.nodeCopyMoveController.move(nodes, rootNode);

        if (!moveAll) {
            var selectedNodes = destTree.selectedNodes.collect(function(node) {
                return node;
            });

            destTree.resetSelected();

            selectedNodes.each(function(node) {
                node.refreshStyle();
            });

            copies.each(function(node) {
                destTree.openAndSelectNode(node.param.uri);
            });
            copies.each(function(node) {
                node.select();
            });
        }

        this.updateButtonsState();
        if (this.mode == this.DATA_CHOOSER_MODE) {
            sessionManager.resetSession(dc.flowExecutionKey);
        }
    },

    nodeDblClick: function(node) {
        if (node) {
            var sourceTree = dynamicTree.trees[node.getTreeId()];
            var destTree = (sourceTree === this.sourceFieldsTree) ?
                    this.destinationFieldsTree : this.sourceFieldsTree;

            if (sourceTree && destTree) {
                this.moveNodes(sourceTree.selectedNodes, destTree.getRootNode());
            }
        }
    },

    // Drag'n'drop
    initDragAndDrop: function() {
        var dropAreas = [
           this.SOURCE_FIELDS_DOM_ID,
           this.DESTINATION_FIELDS_DOM_ID,
           this.SOURCE_TABLES_COLUMN_DOM_ID,
           this.DESTINATION_TABLES_COLUMN_DOM_ID];

        var dropHash = new Hash();
        dropHash.set(this.SOURCE_FIELDS_DOM_ID, [this.DESTINATION_FIELDS_DOM_ID, this.DESTINATION_TABLES_COLUMN_DOM_ID]);
        dropHash.set(this.SOURCE_TABLES_COLUMN_DOM_ID, [this.DESTINATION_FIELDS_DOM_ID, this.DESTINATION_TABLES_COLUMN_DOM_ID]);
        dropHash.set(this.DESTINATION_FIELDS_DOM_ID, [this.SOURCE_FIELDS_DOM_ID, this.SOURCE_TABLES_COLUMN_DOM_ID]);
        dropHash.set(this.DESTINATION_TABLES_COLUMN_DOM_ID, [this.SOURCE_FIELDS_DOM_ID, this.SOURCE_TABLES_COLUMN_DOM_ID]);

        var onDrop = function(dragged, dropped, event) {
            var node = dragged.node;
            if (!node) {
               return;
            }

            var sourceTree = dynamicTree.trees[node.getTreeId()];
            var destTree = matchAny(dropped, ['#' + this.SOURCE_TABLES_COLUMN_DOM_ID], true)
                   ? this.sourceFieldsTree
                   : this.destinationFieldsTree;

            if (sourceTree === destTree) {
               return;
            }

            this.moveNodes(sourceTree.selectedNodes, destTree.getRootNode());
        };

        dropAreas.each(function(dropArea) {
            Droppables.remove(dropArea);
            Droppables.add(dropArea,{
                accept: /*['draggable', 'wrap']*/dropHash.get(dropArea),
                onDrop: onDrop.bind(this)
            });
        }.bind(this));
    },

    getTreeDataIslands: function(tree) {
        var rootNode = tree.getRootNode();
        if (!rootNode) {
            return [];
        }
        
        return rootNode.childs.collect(function(child) {
            if (!child.isHidden()) {
                var res = this.dataIslandParser.exec(child.param.extra.resourceId);
                if (res) {
                    return res[0];
                }
            }
        }.bind(this)).compact().uniq();
    },

    getNodeDataIsland: function(node) {
        if (node.parent.param.uri === '/') {
            var res = this.dataIslandParser.exec(node.param.extra.resourceId);
            if (res) {
                return res[0];
            }
        } else {
            return this.getNodeDataIsland(node.parent);
        }
    },
    
    isSameDataIslandsOnBothTrees: function(sourceTreeDataIslands, destTreeDataIslands) {
        sourceTreeDataIslands = sourceTreeDataIslands.without(this.CONSTANT_TABLE_ID);
        destTreeDataIslands = destTreeDataIslands.without(this.CONSTANT_TABLE_ID);
        return sourceTreeDataIslands.length <= 1
                    && destTreeDataIslands.concat(sourceTreeDataIslands).uniq().length <= 1;
    },

    updateButtonsState: function() {
        var destTree = this.destinationFieldsTree;
        var srcTree = this.sourceFieldsTree;

        var destTreeHasVisibleNodes = destTree.getRootNode() && destTree.getRootNode().hasVisibleChilds();
        var sourceTreeHasVisibleNodes = srcTree.getRootNode() && srcTree.getRootNode().hasVisibleChilds();
        var destTreeHasSelectedNodes =  destTreeHasVisibleNodes && destTree.selectedNodes.length > 0;
        var sourceTreeHasSelectedNodes = sourceTreeHasVisibleNodes && srcTree.selectedNodes.length > 0;
        var destTreeHasEnabledNodes =  destTree.getRootNode() && destTree.getRootNode().hasEnabledChilds();

        var params = {
            'destTreeHasSelectedNodes': destTreeHasSelectedNodes,
            'sourceTreeHasSelectedNodes': sourceTreeHasSelectedNodes,
            'destTreeHasVisibleNodes': destTreeHasVisibleNodes,
            'sourceTreeHasVisibleNodes': sourceTreeHasVisibleNodes,
            'destTreeHasEnabledNodes' : destTreeHasEnabledNodes,
            'sourceTreeDataIslands': this.getTreeDataIslands(srcTree),
            'destTreeDataIslands': this.getTreeDataIslands(destTree)
        };

        this.updateMoveButtonsState(params);
        this.updateFlowButtonsState(params);
        this.updateTreeItems(params);
        this.updateReEntrantControls(params);
    },

    // defined in designer.reentrant.js
    updateReEntrantControls: function(params){},

    updateMoveButtonsState: function(params) {
        this.moveButtonsUpdateStatusEventFactory.each(function(pair) {
            var button = $$(this.MOVE_BUTTONS_PATTERN_PREFIX + pair.key)[0];
            var enable = pair.value.bind(this)(params);
            domain.enableButton(button, enable);
        }.bind(this))
    },

    updateFlowButtonsState: function(params) {
        this.FLOW_NAVIGATION_BUTTONS
                .each(function(flowButtonId) {
                    var flowButton = $(flowButtonId);
                    if (flowButton) {
                        domain.enableButton(flowButton, params.destTreeHasVisibleNodes);
                        var parent = flowButton.up();
                        if (parent.hasClassName(this.TAB_CLASS_NAME)) {
                            domain.enableButton(parent, params.destTreeHasVisibleNodes);
                        }
                    }
                }, this);
    },

    disableNode: function(node, disable) {
        disable ? node.disable() : node.enable();
        if (node.isParent()) {
            node.childs.each(function(child) {
                this.disableNode(child, disable);
            }.bind(this))
        }
    },

    updateTreeItems: function(params) {
        var tree = this.sourceFieldsTree;
        
        if (!tree || !tree.getRootNode()) {
            return;
        }
        
        var dataIslands =
                params.destTreeDataIslands.concat([this.CONSTANT_TABLE_ID]).uniq();

        tree.getRootNode().childs.each(function(dataIslands, child) {
            var enabled = dataIslands.length === 1 || dataIslands.include(this.getNodeDataIsland(child));
            this.disableNode(child, !enabled);
        }.bind(this, dataIslands))
    },

    moveButtonsClickEventHandler: function(element) {
        var eventHandled = false;
        this.moveButtonsClickEventMap.each(function(pair) {
            if (domain.elementClicked(element, pair.key)) {
                var sourceTree = dynamicTree.trees[pair.value.sourceTree];
                var destTree = dynamicTree.trees[pair.value.destTree];

                var nodes = sourceTree.selectedNodes;
                if (pair.value.moveAll) {
                    nodes = sourceTree.getRootNode().childs.findAll(function(table) {
                        return !table.isHidden();
                    });
                }

                this.moveNodes(nodes, destTree.getRootNode(), pair.value.moveAll);

                eventHandled = true;
                throw $break;
            }
        }.bind(this));

        return eventHandled;
    }
};

//Alias for domain.chooser.fields
var dc_fields = dc.fields;

////////////////////////////////////////////////
// Factories
///////////////////////////////////////////////

dc_fields.moveButtonsClickEventMap = $H({
    '#left' : {
        sourceTree:dc_fields.DESTINATION_FIELDS_DOM_ID,
        destTree: dc_fields.SOURCE_FIELDS_DOM_ID
    },

    '#right': {
        sourceTree: dc_fields.SOURCE_FIELDS_DOM_ID,
        destTree: dc_fields.DESTINATION_FIELDS_DOM_ID
    },

    '#toLeft': {
        moveAll: true,
        sourceTree: dc_fields.DESTINATION_FIELDS_DOM_ID,
        destTree: dc_fields.SOURCE_FIELDS_DOM_ID
    },

    '#toRight': {
        moveAll: true,
        sourceTree: dc_fields.SOURCE_FIELDS_DOM_ID,
        destTree: dc_fields.DESTINATION_FIELDS_DOM_ID
    }
});

dc_fields.treeEventFactory = {
    'leaf:dblclick': function(event) {
        var node = event.memo.node;
        dc_fields.nodeDblClick(node);
        Event.stop(event);
    },

    'leaf:mouseup': function(event){
        dc_fields.updateButtonsState();
        Event.stop(event);
    },

    'node:dblclick': function(event) {
        var node = event.memo.node;
        dc_fields.nodeDblClick(node);
        Event.stop(event);
    },

    'node:mouseup': function(event) {
        dc_fields.updateButtonsState();
        Event.stop(event);
    }
};

dc_fields.moveButtonsUpdateStatusEventFactory = $H({
    'left' : function(params) {
        return params.destTreeHasSelectedNodes
    },

    'right': function(params) {
        return params.sourceTreeHasSelectedNodes &&
                this.validateDataIslands(this.destinationFieldsTree, this.sourceFieldsTree.selectedNodes);
    },

    'toLeft': function(params) {
        return params.destTreeHasVisibleNodes && params.destTreeHasEnabledNodes;
    },

    'toRight': function(params) {
        return params.sourceTreeHasVisibleNodes
                && this.isSameDataIslandsOnBothTrees(params.sourceTreeDataIslands, params.sourceTreeDataIslands);
    }
});

////////////////////////////////////////////////
// Initialization entry point
///////////////////////////////////////////////

document.observe('dom:loaded', dc.initialize.bind(dc));
