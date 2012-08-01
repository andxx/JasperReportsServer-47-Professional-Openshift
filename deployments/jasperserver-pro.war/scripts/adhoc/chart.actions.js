/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/**
 * Used to show chart menu
 * @param evt
 * @param menuLevel
 */
AdHocChart.showChartMenu = function(evt, menuLevel){
	if(isIPad()){
		adhocDesigner.showDynamicMenu(evt, menuLevel,{menuLeft: evt.changedTouches[0].clientX,menuTop:evt.changedTouches[0].clientY-100});
	} else {
		adhocDesigner.showDynamicMenu(evt, menuLevel,{menuLeft: evt.clientX,menuTop:evt.clientY-100});
	}       
}
/**
 * Used to get the current measure
 */
AdHocChart.getCurrentMeasure = function(){
    if (localContext.state.numberOfMeasures == 1 || AdHocChart.isPie()){
        return 0; //the only one!
    }
    //since we can select only one measure at a time, get the first object in selObject
    var selectedObject =  designerBase.getSelectedObject();
    var index = selectedObject.index;
    if(!isNaN(index)){
        return parseInt(index);
    }
    //negative represents nothing to act on
    return -1;
}
/**
 * Used to add fields as a measure
 */
AdHocChart.addFieldAsMeasure = function(includeSubSets, pos){
    var fieldList = "";
    if (!_.isNumber(pos)) {
        pos = AdHocChart.hoverLegendIndex;
    }

    if(selObjects.length > 0){
        var selectedNodes = adhocDesigner.getSelectedTreeNodes();

        fieldList = adhocDesigner.collectFields(selectedNodes, includeSubSets).join(",");

        if (AdHocChart.supportsSeries()) {
            if(_.isNumber(pos) && pos > -1){
                AdHocChart.addAsMeasure(fieldList, pos);
            }else{
                AdHocChart.addAsLastMeasure(fieldList);
            }
        }
        else {
            AdHocChart.replaceMeasure(fieldList); // should be just one name
        }
    }
};

AdHocChart.addFieldAsGroup = function() {
    var selectedObject =  designerBase.getSelectedObject();
    if (selectedObject) {
        var fieldName = adhocDesigner.getNameForSelected(selectedObject);
        AdHocChart.setGroup(fieldName);
    }
};

AdHocChart.functionSelected = function(thisFunction, measureIndex){
    if (!measureIndex) {
        measureIndex = AdHocChart.getCurrentMeasure();
    }
    var newMeasureType = AdHocChart.getUpdatedMeasureType(thisFunction);
    if (newMeasureType) {
        AdHocChart.setSummaryFunctionAndMask(thisFunction, defaultMasks[newMeasureType], measureIndex);
    }
    else {
        AdHocChart.setSummaryFunction(thisFunction, measureIndex);
    }
};

AdHocChart.getUpdatedMeasureType = function(thisFunction){
    var newType = localContext.getMeasureType(thisFunction);
    if (newType != localContext.state.dataTypes[AdHocChart.getCurrentMeasure()])
        return newType;
    return null; //no change
}

AdHocChart.getMeasureType = function(thisFunction){
    if (thisFunction == "Count" || thisFunction == "DistinctCount")
        return "int";
    //otherwise use field type
    return localContext.state.dataTypes[AdHocChart.getCurrentMeasure()];
};

AdHocChart.maskSelected = function(thisMask, measureIndex){
    if (!measureIndex) {
        measureIndex = AdHocChart.getCurrentMeasure();
    }
    AdHocChart.setMask(thisMask, measureIndex);
};

AdHocChart.deselectAllSelectedOverlays = function(){
    var legendOverlays = $$(adhocDesigner.LEGEND_OVERLAY_PATTERN);
    legendOverlays.each(function(legend){
        if($(legend)){
            buttonManager.unSelect($(legend));
            if(isIPad()) {
            	$(legend).removeClassName(layoutModule.HOVERED_CLASS);
            	$(legend).removeClassName(layoutModule.PRESSED_CLASS);
            }
        }
    });
};

AdHocChart.getNewChartPositionAndMove = function(){
    var chartContainer = $("chartBorder");
    var left = null;
    var top = null;
    var offset = null;
    var scrollOffset = null;
    var adjust = false;

    if (chartContainer) {
        offset = chartContainer.positionedOffset();
        scrollOffset = chartContainer.cumulativeScrollOffset();
        if (AdHocChart.isContentPageSize()) {
            left = offset[0] + scrollOffset[0];
            top = offset[1] + scrollOffset[1];
            //check to make sure we are not out of bounds
            if(left < 0){
                left = 0;
            }
            if(top < getTitleBottom()){
                top = getTitleBottom();
            }
        } else {
            //get right and bottom
            var right = offset[0] + getChartWidth();
            var bottom = offset[1] + getChartHeight();
            if(right > localContext.state.availableChartWidth){
                left = localContext.state.availableChartWidth - getChartWidth();
                left += scrollOffset[0];
                adjust = true;
            }else{
                left = offset[0] + scrollOffset[0];
            }

            if(bottom > localContext.state.availableChartHeight){
                top = localContext.state.availableChartHeight - getChartHeight();
                top += scrollOffset[1];
                adjust = true;
            }else{
                if(offset[1] < 0){
                    top = getTitleBottom();
                }else{
                    top = offset[1] + scrollOffset[1];
                }
            }
            //check to make sure we are not out of bounds
            if(left < 0){
                left = 0;
            }
            if(top < getTitleBottom()){
                top = getTitleBottom();
            }

            if(adjust){
                //use animate to move
                moveTo(chartContainer, left, top, null);
            }
        }
        moveChart(left, top);
    }
}

AdHocChart.computeDimensions = function(w,h) {
    var chartWidth = null;
    var chartHeight = null;
    var chartContainer = $("chartBorder");
    var dimensions = null;

    if (chartContainer) {
        chartWidth = isNaN(w) ? parseInt(chartContainer.getStyle("width")) : w;
        chartHeight = isNaN(h) ? parseInt(chartContainer.getStyle("height")) : h;
        if(!AdHocChart.isContentPageSize()){
            if(chartWidth >  AdHocChart.state.availableChartWidth - AdHocChart.state.chartX){
                chartWidth =  AdHocChart.state.availableChartWidth - AdHocChart.state.chartX
            }

            if(chartHeight > AdHocChart.state.availableChartHeight - AdHocChart.state.chartY){
                chartHeight = AdHocChart.state.availableChartHeight - AdHocChart.state.chartY
            }
        }
        chartWidth = (chartWidth < AdHocChart.MIN_CHART_WIDTH) ? AdHocChart.MIN_CHART_WIDTH : chartWidth;
        chartHeight = (chartHeight < AdHocChart.MIN_CHART_HEIGHT) ? AdHocChart.MIN_CHART_HEIGHT : chartHeight;

        dimensions = [chartWidth,chartHeight];
    }
    return dimensions;
}

    