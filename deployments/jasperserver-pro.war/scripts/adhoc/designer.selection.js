/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/*
 * Method used to add items to the selObjects array
 * @param object
 */
adhocDesigner.addSelectedObject = function(event, object, isMultiSelect, isSelected){
    if (isMultiSelect) {
        isSelected ? this.removeSelectedObject(object) : designerBase.addToSelected(object);
    } else {
        designerBase.unSelectAll();
        designerBase.addToSelected(object);
    }
};

/*
 * Removes all items from the selObjects array and adds the object to it
 * @param object the item we want to select
 */
adhocDesigner.selectSingleObject = function(object){
    designerBase.unSelectAll();
    designerBase.addToSelected(object);
}
/*
 * Helper to delete items from selObjects array
 * @param obj
 */
adhocDesigner.deselectSelectedObject = function(obj){
    this.removeSelectedObject(obj);
}
/*
 * Helper to remove item
 * @param obj
 */
adhocDesigner.removeSelectedObject = function(obj){
    designerBase.unSelectGiven(obj);
}

/*
 * deselect all tree nodes
 * @param event
 */
adhocDesigner.unSelectAvailableTreeNodes = function(event){
    this.measuresTree && this.measuresTree._deselectAllNodes();
    this.dimensionsTree && this.dimensionsTree._deselectAllNodes();
}

/*
 * Used to get the selected nodes name
 */
adhocDesigner.getNameForSelectedTreeNode = function() {
    var so = designerBase.getSelectedObject();
    return so ? so.param.id : '';
}
/**
 * Gets selected nodes from available tree
 */
adhocDesigner.getSelectedTreeNodes = function(){
    return adhocDesigner.dimensionsTree.selectedNodes.length > 0
        ? adhocDesigner.dimensionsTree.selectedNodes
        : adhocDesigner.measuresTree.selectedNodes;
}

/**
 * Check to see if the currently selected node is selected
 * @param object item we are checking
 */
adhocDesigner.isSelectedNode = function(node){
    if (!node || !node.getTreeId) {
        return null;
    }

    var tree = dynamicTree.trees[node.getTreeId()];
    return tree.isNodeSelected(node);
}
/**
 * Used to determine if a node is a leaf or not
 */
adhocDesigner.isSelectedTreeNodeAFolder = function(){
    var so = designerBase.getSelectedObject();
    return so ? so.hasChilds() : true;
}

/**
 * Helper to check if item is already selected
 * @param obj
 */
adhocDesigner.isAlreadySelected = function(obj){
    return designerBase.isInSelection(obj);
}
/**
 * Used to determine if clicked was meant to be for multiselect
 * @param event
 * @param area
 */
adhocDesigner.isMultiSelect = function(event, area){
    var metaKey = isMetaHeld(event);
    var shiftKey = isShiftHeld(event);
    var section = selectionCategory.area == area;

    if(selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA){
        return (section && (metaKey || shiftKey));
    }else{
        return (section && metaKey);
    }
}
/**
 * Test to see if the spacer is in the current selection
 */
adhocDesigner.hasSpacerInSelection = function() {
    for (var i = 0; i < selObjects.length; i++) {
        if (adhocDesigner.getNameForSelected(selObjects[i]) === designerBase.SPACER_NAME) {
            return true;
        }
    }
    return false;
}
/**
 * Test to see if the current selected object is a spacer
 * @param obj
 */
adhocDesigner.isSpacerSelected = function(obj){
    if(obj){
        return (adhocDesigner.getNameForSelected(obj) === designerBase.SPACER_NAME);
    }else{
        return (adhocDesigner.getNameForSelected(selObjects[0]) === designerBase.SPACER_NAME);
    }
}
/**
 * Test to see if the current selected object is a constant field
 * @param obj
 */
adhocDesigner.isConstantSelected = function(obj){
    if(obj){
        return (adhocDesigner.getNameForSelected(obj).startsWith(constantFieldsLevel + "."));
    }else{
        return (adhocDesigner.getNameForSelected(obj).startsWith(constantFieldsLevel + "."));
    }
}
/**
 * Test to see if the current selected object is a constant field
 * @param obj
 */
adhocDesigner.isMeasureSelected = function(obj){
    if(obj && obj.menuLevel){
        return obj.menuLevel.startsWith(this.OLAP_MEASURES_TREE);
    }else{
        return false;
    }
}
/**
 * Check to see if field is used as a group
 * @param fieldName
 */
adhocDesigner.isUsedAsGroup = function(fieldName) {
    var inUse = false;
    if (localContext.state.groups != null) {
        for (var i = 0; i < localContext.state.groups.length; i++) {
            if (localContext.state.groups[i] == fieldName) {
                inUse = true;
                break;
            }
        }
    }
    return inUse;
}
/**
 * Check to see if we have a group object selected
 */
adhocDesigner.hasGroupInSelection = function() {
    for (var i = 0; i < selObjects.length; i++) {
        if (adhocDesigner.isUsedAsGroup(adhocDesigner.getNameForSelected(selObjects[i]))) {
            return true;
        }
    }
    return false;
}
