/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////////////////////////////////////////
// Type conversation helper functions
///////////////////////////////////////////////////////////////
AdHocCrosstab.isIntegerType = function(type) {
    return localContext.INTEGER_JAVA_TYPES.indexOf(type) >= 0;
};

AdHocCrosstab.isDecimalType = function(type) {
    return localContext.DECIMAL_JAVA_TYPES.indexOf(type) >= 0;
};

AdHocCrosstab.isDateType = function(type) {
    return localContext.DATE_JAVA_TYPES.indexOf(type) >= 0;
};

AdHocCrosstab.isBooleanType = function(type) {
    return localContext.BOOLEAN_JAVA_TYPES.indexOf(type) >= 0;
};

AdHocCrosstab.getSuperType = function(type) {
    if (localContext.isIntegerType(type)) {
        return localContext.INTEGER_TYPE_DISPLAY;
    } else if (localContext.isDecimalType(type)) {
        return localContext.DECIMAL_TYPE_DISPLAY;
    } else  if (localContext.isDateType(type)) {
        return localContext.DATE_TYPE_DISPLAY;
    } else {
        return localContext.NOT_A_NUMBER_TYPE_DISPLAY;
    }
};

///////////////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////////////

// these are called in other modules, so even though we don't use overlays, leave them stubbed out
AdHocCrosstab.deselectAllSelectedOverlays = function(){
};

AdHocCrosstab.deselectAllColumnGroupOverlays = function(){
}

AdHocCrosstab.deselectAllRowGroupOverlays = function(){
}

AdHocCrosstab.deselectAllMeasureOverlays = function(){
}


AdHocCrosstab.removeFromSelectObjects = function(overlayId){
    var foundObject = null;
    selObjects.each(function(object){
        if(object.id == overlayId){
            foundObject = object;
        }
    });
    selObjects = selObjects.without(foundObject);
};


AdHocCrosstab.getSelectedDimensionIndex = function(selectedObject){
    if(selectedObject){
        var dimension = selectedObject.isMeasure ? adhocDesigner.MEASURES : selectedObject.dimension;
        var index = -1;

        _.find(localContext.state.getDimensions(selectedObject.axis), function(elem, ind) {
            if (elem.name === dimension) {
                index = ind;
                return true;
            }
        });
    }

    return index;
};

AdHocCrosstab.getSelectedMeasure = function(){
    if(selObjects && selObjects.length > 0){
        var object = selObjects[0];
        if(object.isMeasure){
            return localContext.state.measures[object.index];
        }
    }
    return null;
}

AdHocCrosstab.getSelectedGroup = function(object){
    if (!object) {
        return null;
    }

    return object.axis === "row"
        ? localContext.state.rowGroups[object.groupIndex]
        : localContext.state.columnGroups[object.groupIndex];
}

AdHocCrosstab.getMeasureTypeByFunction = function(thisFunction){
    var object = AdHocCrosstab.getSelectedMeasure();
    if(object){
        var type = localContext.getSuperType(object.type);
        if(thisFunction === "Average"){
            return "dec";
        }else if(thisFunction === "Count" ||thisFunction ==="DistinctCount"){
            return "int";
        }else{
            return type;
        }
    }
    return null;
}

/**
 * Fills "Add levels" menu items with dynamic values - all sibling levels
 */
AdHocCrosstab.updateContextMenuWithSiblingLevels = function(contextName, contextActionModel) {
    if (!adhocDesigner.ui.display_manager) {
        return contextActionModel;
    }

    var menuToUpdate = contextActionModel.find(function(item) {
        return item.clientTest === "AdHocCrosstab.canAddSiblingLevels";
    });

    if (!menuToUpdate) {
        return contextActionModel;
    }

    var siblingLevels = null;
    var rootNode = null;
    var action = null;

    if (!selObjects.first().isMeasure) {
        if (localContext.isOlapMode()) {
            rootNode = adhocDesigner.dimensionsTree.getRootNode().childs.find(function(node) {
                return node.param.extra.id === selObjects.first().dimension;
            });

            action = selObjects.first().axis === "row" ? "AdHocCrosstab.appendDimensionToRowAxisWithLevel" : "AdHocCrosstab.appendDimensionToColumnAxisWithLevel";
        } else {
            //In nonOLAP mode there is only one level for any dimension
            selObjects.first().index = 0;
            return contextActionModel;
        }
    } else {
        rootNode = adhocDesigner.measuresTree.getRootNode();
        action = selObjects.first().axis === "row" ? "AdHocCrosstab.appendMeasureToRow" : "AdHocCrosstab.appendMeasureToColumn";
    }

    if (selObjects.first().allLevels === undefined) {
        var metadata = selObjects.first();
        metadata.allLevels = AdHocCrosstab.state.getLevelsFromDimension(selObjects.first().dimension, metadata.axis);
        metadata.index = metadata.allLevels.indexOf(metadata.level);
    }

    if (selObjects.first().allLevels) {
        if (localContext.isOlapMode()) {
            siblingLevels = rootNode.childs.findAll(function(node) {
                return !selObjects.first().allLevels.include(node.param.extra.id);
            });
        } else {
            siblingLevels = adhocDesigner.getAllLeaves(rootNode, adhocDesigner.measuresTree)
                .findAll(function(node) {
                    return !selObjects.first().allLevels.include(node.param.extra.id);
                });
        }
    }

    if (!siblingLevels || siblingLevels.length == 0) {
        return contextActionModel;
    }

    menuToUpdate.text = adhocDesigner.getMessage(selObjects.first().isMeasure ? 'addMeasures' : 'addLevels');
    menuToUpdate.children = siblingLevels.collect(function(node) {
        return actionModel.createMenuElement("optionAction", {
            text: node.name,
            action: action,
            actionArgs: selObjects.first().isMeasure ? [node.param.extra.id] : [{id: node.param.extra.id, groupId: node.param.extra.dimensionId, isMeasure: false}]
        });
    });

    return contextActionModel;
};
