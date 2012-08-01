/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

adhocDesigner.moveToMeasuresOrAttributes = function(node){
    if (node) {
        var nodes = Object.isArray(node) ? node : [node];
        node = nodes.first();

        var srcTreeId = node.getTreeId();
        var srcTreeRootNode = adhocDesigner[srcTreeId].getRootNode();
        var destTree =  srcTreeId.indexOf('dimension') == 0 ? adhocDesigner.measuresTree : adhocDesigner.dimensionsTree;

        _.each(nodes, function(node) {
            adhocDesigner.mergeToDestTree(adhocDesigner.copyParentStructure(node, destTree), destTree.getRootNode());

            var nodeParent = node;
            while (nodeParent != srcTreeRootNode && nodeParent.childs.length == 0) {
                var parent = nodeParent.parent;
                parent.removeChild(nodeParent);
                nodeParent = parent;
            }
        });
        destTree.resortTree();
        destTree.renderTree();
        destTree.openAndSelectNode(node.param.uri);
    }
}

adhocDesigner.copyParentStructure = function(sourceNode, destTree) {
    if (sourceNode && destTree) {
        var sourceTree = dynamicTree.trees[sourceNode.getTreeId()];
        var isMeasure = (destTree === adhocDesigner.measuresTree);

        var metanodeBuilder = localContext.metaNodeBuilder ? localContext.metaNodeBuilder : adhocDesigner.metaNodeBuilder;
        var destNode = destTree.processNode(metanodeBuilder(sourceNode, isMeasure));

        var sourceNodeParent = sourceNode.parent;
        var destParent = null;

        while (sourceNodeParent && sourceNodeParent != sourceTree.getRootNode()) {
            destParent = destTree.processNode(metanodeBuilder(sourceNodeParent, isMeasure));
            destParent.addChild(destNode);
            destNode = destParent;
            sourceNodeParent = sourceNodeParent.parent;
        }

        return destNode;
    }
}

adhocDesigner.mergeToDestTree = function (node, existingParent) {
    if (!existingParent) {
        return;
    }

    var tree = dynamicTree.trees[existingParent.getTreeId()];

    var existingNode = tree.findNodeChildByMetaName(existingParent, node.param.id);

    if (existingNode != null) {
        if (node.hasChilds()) {
            node.childs.each(function(child) {
                adhocDesigner.mergeToDestTree(child, existingNode);
            });
        }
    } else {
        adhocDesigner.markNodeAsLoaded(node);
        existingParent.addChild(node);
    }
}

/*
 * Utilities for copying nodes from one tree to another
 */
adhocDesigner.metaNodeBuilder = function(node, isMeasure) {
    var metaNode = {
        id: node.param.id,
        label: node.name,
        type: node.param.type,
        uri: node.param.uri,
        order: node.orderNumber
    };

    if (node.param.extra) {
        var extra = Object.extend({}, node.param.extra);
        metaNode.extra =  Object.extend(extra, {
            id: node.param.id,
            isMeasure: isMeasure,
            dimensionId: isMeasure ? adhocDesigner.MEASURES : node.param.id
        })
    }

    return metaNode;
}

adhocDesigner.markNodeAsLoaded = function (node) {
    node.isloaded = true;
    if (node.isParent()) {
        node.childs.each(function(child) {
            adhocDesigner.markNodeAsLoaded(child);
        })
    }
}

/**
 * Get all leaves of a node
 * @param node
 */
adhocDesigner.getAllLeaves = function(node, tree){
    var leaves = arguments[2] || [];
    if(!node){
        if(!tree){
            return leaves;
        }
        node = tree.getRootNode();
        if (!node) return leaves;
    }

    if (!node.hasChilds()) {
        leaves.push(node);
        return  leaves;
    }
    for (var i = 0; i < node.childs.length; i++) {
        this.getAllLeaves(node.childs[i], null, leaves);
    }
    return leaves;
}

adhocDesigner.getFirstLeaf = function(node) {
    if (!node) return null;
    var leaf = node;
    if (!node.childs || node.childs.length === 0) {
        return leaf;
    }
    for (var i = 0; i < node.childs.length; i++) {
        leaf = this.getFirstLeaf(node.childs[i]);
        if (leaf) {
            return leaf;
        }
    }
}

adhocDesigner.getNodeByEvent = function(event) {
    return this.measuresTree.getTreeNodeByEvent(event)
        || this.dimensionsTree.getTreeNodeByEvent(event);
}

