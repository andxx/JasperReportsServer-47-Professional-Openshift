/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/**
 * Helper to determine if we can save report
 */
AdHocChart.canSaveReport = function(){
    return (localContext.state.canSave);
};

AdHocChart.canSetMask = function(){
    return localContext.state.dataTypes[AdHocChart.getCurrentMeasure()] != 'NaN';
};
/**
 * Event listener for chart sizer
 */
AdHocChart.draggerListener = function (evt){
    evt.preventDefault();
    localContext.currentlyDragging = true;
    var moved = {
        x : (evt.pointerX() - localContext.containerMovePosition.x),
        y : (evt.pointerY() - localContext.containerMovePosition.y)};

    localContext.containerMovePosition = {x : evt.pointerX(), y : evt.pointerY()};
    var objectWidth = parseInt($("chartBorder").getStyle("width"));
    var objectHeight = parseInt($("chartBorder").getStyle("height"));

    var width = Math.abs(objectWidth + moved.x);
    var height = Math.abs(objectHeight + moved.y);

    $("chartBorder").setStyle({
        width :  width + "px",
        height :  height + "px"
    });
};

AdHocChart.canMoveMeasureUp = function(){
	var v = false;
	if(selObjects[0] && (selObjects[0].index < (localContext.state.measureNames.length-1) )) v = true;
	return v;
}

AdHocChart.canMoveMeasureDown = function(){
	var v = false;
	if(selObjects[0] && selObjects[0].index && (selObjects[0].index > 0)) v = true;
	return v;
}

/*
 * Helpers to determine chart type
 */
AdHocChart.supportsSeries = function(){
    return localContext.state.type != AdHocChart.PIE_CHART;
}

AdHocChart.isPie = function(){
    return localContext.state.type == AdHocChart.PIE_CHART;
}

AdHocChart.isBar = function(){
    return localContext.state.type == AdHocChart.BAR_CHART;
}

AdHocChart.isArea = function(){
    return localContext.state.type == AdHocChart.AREA_CHART;
}

AdHocChart.isLine = function(){
    return localContext.state.type == AdHocChart.LINE_CHART;
}

AdHocChart.isType = function(aType){
    return localContext.state.type == aType;
};

AdHocChart.isMeasureNumeric = function(index){
    var thisIndex = (arguments.length === 0) ? AdHocChart.getCurrentMeasure() : index;
    return localContext.state.isNumeric[thisIndex];
};

AdHocChart.isSelectedMeasureNumeric = function(){
    return isMeasureNumeric();
};

AdHocChart.isDataType = function(thisType, index){
    var thisIndex = (arguments.length < 2) ? AdHocChart.getCurrentMeasure() : index;
    return localContext.state.dataTypes[thisIndex] == thisType;
};

AdHocChart.isMask = function(thisMask, index){
    var thisIndex = (arguments.length < 2) ? AdHocChart.getCurrentMeasure() : index;
    return localContext.state.masks[thisIndex] == thisMask;
};

AdHocChart.isFunctionSelected = function(functionName, measureIndex){
    measureIndex = measureIndex ? measureIndex : AdHocChart.getCurrentMeasure();
    return localContext.state.summaryFunctions[measureIndex] == functionName;
};

AdHocChart.isContentPageSize = function(){
    return (localContext.state.paperSize == AdHocChart.CONTENT_PAGE_SIZE)
};

AdHocChart.isInLegendArea = function(x, y){
    var extraLegendPadding = 20;
    //get charts offset
    var chartOffset = $("chartBorder").cumulativeOffset();
    var chartScrollOffset = $("chartBorder").cumulativeScrollOffset();
    var combinedOffset = {
        left : (chartOffset[0] + chartScrollOffset[0]),
        top : (chartOffset[1] + chartScrollOffset[1])
    };

    var legendOffset = {
        left : combinedOffset.left + localContext.state.legendLeft,
        top  : combinedOffset.top + localContext.state.legendTop
    };

    return ((x < legendOffset.left + localContext.state.legendWidth + extraLegendPadding)
            && (x >= legendOffset.left - extraLegendPadding)
            && (y < legendOffset.top + localContext.state.legendHeight + extraLegendPadding)
            && (y >= legendOffset.top - extraLegendPadding));
};

AdHocChart.getChartWidth = function(){
    return $("chartBorder").getWidth();
}

AdHocChart.getChartHeight = function(){
    return $("chartBorder").getHeight();
}

AdHocChart.getHasMargins = function(){
    return localContext.state.hasMargins;
}

AdHocChart.getTitleHeight = function(){
    var titleHeight = 0;
    var title = $("titleCaption");

    if(title){
        return title.getHeight();
    }

    return titleHeight;
}

AdHocChart.getTitleBottom = function(){
    var height = getTitleHeight();
    if(height == 0){
        return height;
    }else{
        var offset = $("titleCaption").positionedOffset();
        return height + offset[1];
    }
}

/**
 * Used to determine if we can add field as a measure
 */
AdHocChart.canAddAsMeasure = function(){
    var isMultiSelect = (selObjects.length > 1);
    return ((!localContext.state.hasMeasures && !isMultiSelect) || (localContext.state.seriesEnabled && AdHocChart.supportsSeries()));
};

AdHocChart.selectedMeasureShowsSummaryOptions = function() {
    var selectedMeasureName = localContext.state.measureNames[AdHocChart.getCurrentMeasure()];
    return !adhocDesigner.isPercentOfParentCalc(selectedMeasureName);
};

AdHocChart.canReplaceMeasure = function() {
    if(selObjects.length == 1){
        var selectedObject =  designerBase.getSelectedObject();
        var isParentNode;
        if(selectedObject){
            isParentNode = selectedObject.isParent();
        } else {
            return false;
        }
        return localContext.state.hasMeasures && (!localContext.state.seriesEnabled || !AdHocChart.supportsSeries()) && !isParentNode;
    }
    return false;
};

AdHocChart.canAddAsGroup = function(allowReplace){
    if(selObjects[0]){
        if(selObjects[0].parent.treeId == 'measuresTree') return false;
    }
    if(selObjects.length == 1){
        var selectedObject =  designerBase.getSelectedObject();
        var isParentNode;
        if(selectedObject){
            isParentNode = selectedObject.isParent();
        } else {
            return false;
        }
        return (allowReplace || !localContext.state.hasGroup) && !isParentNode && !adhocDesigner.isPercentOfParentCalcSelected(selectedObject);
    }
    return false;
};

AdHocChart.canReplaceGroup = function(){
    if(selObjects[0]){
        if(selObjects[0].parent.treeId == 'measuresTree') return false;
    }
    if(selObjects.length == 1){
        var selectedObject =  designerBase.getSelectedObject();
        var isParentNode;
        if(selectedObject){
            isParentNode = selectedObject.isParent();
        } else {
            return false;
        }
        return localContext.state.hasGroup && !isParentNode && !adhocDesigner.isPercentOfParentCalcSelected(selectedObject);
    }
    return false;
};