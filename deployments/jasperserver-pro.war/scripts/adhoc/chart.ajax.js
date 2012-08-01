/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

_.extend(AdHocChart, {
    addAsMeasure: function(fieldNames, index){
        designerBase.sendRequest('ch_insertMeasure', ['fs=' + encodeText(fieldNames), 'i=' + index]);
    },
    addAsLastMeasure: function(fieldNames){
        designerBase.sendRequest('ch_insertMeasureLast', ['fs=' + encodeText(fieldNames)]);
    },
    replaceMeasure: function(fieldName){
        designerBase.sendRequest('ch_replaceMeasures', ['f=' + encodeText(fieldName)]);
    },
    moveMeasure: function(from, to){
        designerBase.sendRequest('ch_moveMeasure', ['f=' + from, 't=' + to]);
    },
    moveMeasureUp: function(){
        var from = parseInt(selObjects[0].index);
        designerBase.sendRequest('ch_moveMeasure', ['f=' + from, 't=' + (from + 1)]);
    },
    moveMeasureDown: function(){
        var from = parseInt(selObjects[0].index);
        designerBase.sendRequest('ch_moveMeasure', ['f=' + from, 't=' + (from - 1)]);
    },
    switchToMeasure: function(fieldName, from, to){
        designerBase.sendRequest("ch_switchToMeasure", ["fs=" + encodeText(fieldName), "to=" + to]);
    },
    setGroup: function(fieldName){
        designerBase.sendRequest('ch_setGroup', ['g=' + encodeText(fieldName)]);
    },
    removeMeasure: function(index){
        if (!index && index != 0) index = AdHocChart.getCurrentMeasure();
        designerBase.sendRequest('ch_removeMeasure', ["i=" + index]);
    },
    removeGroup: function(){
        designerBase.sendRequest('ch_removeGroup', []);
    },
    switchToGroup: function(fieldName, from){
        designerBase.sendRequest("ch_switchToGroup", ["fs=" + encodeText(fieldName), "from=" + from]);
    },
    changeChartType: function(type){
        designerBase.sendRequest('ch_changeType', ['t=' + type]);
    },
    toggle3D: function(){
        designerBase.sendRequest('ch_toggle3D', []);
    },
    toggleStack: function(){
        designerBase.sendRequest('ch_toggleStack', []);
    },
    toggleOrientation: function(){
        designerBase.sendRequest('ch_toggleChartOrientation', []);
    },
    togglePoints: function(){
        designerBase.sendRequest('ch_togglePoints', []);
    },
    toggleLines: function(){
        designerBase.sendRequest('ch_toggleLines', []);
    },
    toggleGradient: function(){
        designerBase.sendRequest('ch_toggleGradient', []);
    },
    toggleBackground: function(){
        designerBase.sendRequest('ch_toggleBackground', []);
    },
    toggleLegend: function(){
        designerBase.sendRequest('ch_toggleLegend', []);
    },
    toggleXAxisLabel: function(){
        designerBase.sendRequest('ch_toggleXAxisLabel', []);
    },
    toggleYAxisLabel: function(){
        designerBase.sendRequest('ch_toggleYAxisLabel', []);
    },
    updateLegendLabel: function(title, index){
        if(title.blank()) title = " ";
        designerBase.sendRequest('ch_setLegendLabel', ['l=' + encodeText(title), 'i=' + index]);
    },
    setSummaryFunction: function(thisFunction, index){
        designerBase.sendRequest('ch_setSummaryFunction', ['f=' + thisFunction, 'i=' + index]);
    },
    setSummaryFunctionAndMask: function(thisFunction, thisMask, index){
        designerBase.sendRequest('ch_setSummaryFunctionAndMeasureMask', ['f=' + thisFunction, 'm=' + encodeText(thisMask), 'i=' + index]);
    },
    setMask: function(thisMask, index){
        designerBase.sendRequest('ch_setMeasureMask', ['m=' + encodeText(thisMask), 'i=' + index]);
    },
    moveChart: function(x, y){
        designerBase.sendRequest('ch_moveChart', ['x=' + x, 'y=' + y]);
    },
    resizeChart: function(w, h){
        var dimensions = AdHocChart.computeDimensions(w,h);
        dimensions && designerBase.sendRequest('ch_resizeChart', ['w=' + dimensions[0], 'h=' + dimensions[1]]);
    }
});
/**
 * Used to update a calculated field and the canvas view
 */
AdHocChart.updateCalcFieldAndView = function(fieldName, formulaId, argList){
    var callback = function(state){
        adhocDesigner.render(state);
        adhocDesigner.updateAllFieldLabels();
        if(adhocDesigner.isInUse(fieldName)){
            adHocFilterModule.resetFilterPanel();
        }
    };
    designerBase.sendRequest("co_updateFieldAndView", ["fieldName=" + encodeText(fieldName), "formula=" + formulaId, "args=" + argList], callback);
};

/*
 * Standard callback
 */
AdHocChart.standardOpCallback = function(state) {
    localContext.standardChartOpCallback(state);
};
/*
 * Standard chart callback
 */
AdHocChart.standardChartOpCallback = function(state) {
    adhocDesigner.render(state);
};

