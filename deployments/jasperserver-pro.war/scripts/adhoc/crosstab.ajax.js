/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

///////////////////////////////////////////////////////////////
// Ajax calls (OLAP)
///////////////////////////////////////////////////////////////
/**
 * Add an unused dimension to axis with a specific level shown
 * @param dimName
 * @param level
 * @param axis
 * @param position
 * @param measurePosition
 */
AdHocCrosstab.insertDimensionInAxisWithChild = function(dimName, axis, position, level, measurePosition, isMeasure, uri) {
    var params = ['dim=' + encodeText(dimName), 'axis=' + axis, 'pos=' + position];
    if (isNotNullORUndefined(measurePosition)) {
    	params.push('measure_pos=' + measurePosition);
    }
    if (isNotNullORUndefined(level)) {
    	params.push('child=' + encodeText(level));
    }
    if (isNotNullORUndefined(uri)) {
        params.push('uri=' + encodeText(uri));
    }
    if (isNotNullORUndefined(isMeasure)) {
        params.push('isMeasure=' + encodeText(isMeasure));
    }
    designerBase.sendRequest('cr_insertDimensionInAxisWithChild', params, localContext.standardCrosstabOpCallback, {bPost : true});
};

AdHocCrosstab.insertDimensionInRowAxisWithLevel = function(dimName, level, position, measurePosition) {
	AdHocCrosstab.insertDimensionInAxisWithChild(dimName, 'row', position, level, measurePosition);
};

AdHocCrosstab.insertDimensionInColumnAxisWithLevel = function(dimName, level, position, measurePosition) {
	AdHocCrosstab.insertDimensionInAxisWithChild(dimName, 'column', position, level, measurePosition);
};

AdHocCrosstab.insertDimensionInRowAxisWithAllLevels = function(dimName, position) {
	AdHocCrosstab.insertDimensionInAxisWithChild(dimName, 'row', position);
};

AdHocCrosstab.insertDimensionInColumnAxisWithAllLevels = function(dimName, position) {
	AdHocCrosstab.insertDimensionInAxisWithChild(dimName, 'column', position);
};

/**
 * move dimension to a new location
 * @param dimName name of a dimension already in an axis
 * @param axis new axis
 * @param position new position
 */
AdHocCrosstab.moveDimension = function(dimName, axis, position) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_moveDimension', new Array('dim=' + encodeText(dimName), 'axis=' + axis, 'pos=' + position), callback, null);
};

/**
 * remove dimension
 * @param axis axis
 * @param position position
 */
AdHocCrosstab.removeDimension = function(axis, position) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_removeDimension', new Array('axis=' + axis, 'pos=' + position), callback, null);
};

/**
 * Show a row level
 * @param fieldName
 * @param position
 */
AdHocCrosstab.showRowLevel = function(dimName, level) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_showRowLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(level)), callback, null);
};

/**
 * Hide a row level
 * @param fieldName
 * @param position
 */
AdHocCrosstab.hideRowLevel = function(dimName, levelName) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);

        var level = localContext.state.getLevelObject(levelName, dimName, "row");
        if(level && level.propertyMap && level.propertyMap.lastFilteredLevel == "true") {
            dialogs.systemConfirm.show(adhocDesigner.getMessage("ADH_CROSSTAB_LAST_FILTERED_LEVEL"), 5000);
        }
    };
    designerBase.sendRequest('cr_hideRowLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(levelName)), callback, null);
};

/**
 * Show a column level
 * @param fieldName
 * @param position
 */
AdHocCrosstab.showColumnLevel = function(dimName, level) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_showColumnLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(level)), callback, null);
};

/**
 * Hide a column level
 * @param fieldName
 * @param position
 */
AdHocCrosstab.hideColumnLevel = function(dimName, levelName) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);

        var level = localContext.state.getLevelObject(levelName, dimName, "column");
        if(level && level.propertyMap && level.propertyMap.lastFilteredLevel == "true") {
            dialogs.systemConfirm.show(adhocDesigner.getMessage("ADH_CROSSTAB_LAST_FILTERED_LEVEL"), 5000);
        }
    };
    designerBase.sendRequest('cr_hideColumnLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(levelName)), callback, null);
};

AdHocCrosstab.pivot = function() {
    designerBase.sendRequest('cr_pivot', [], localContext.standardCrosstabOpCallback, null);
};

/**
 * just insert the measure; if no measures dim, add it to end of column axis
 */
AdHocCrosstab.insertMeasure = function(measure, position, axis) {
    var callback = function(state) {
        localContext.standardCrosstabOpCallback(state);
    };
    var args = ['measure=' + encodeURIComponent(measure)];
    if (!Object.isUndefined(position)) {
    	args.push('pos=' + position);
    }
    if (!Object.isUndefined(axis)) {
    	args.push('axis=' + axis);
    }
    designerBase.sendRequest('cr_insertMeasure', args, callback, null);
};

AdHocCrosstab.moveMeasure = function(measure, to) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        designerBase.unSelectAll();
    };

    designerBase.sendRequest('cr_moveMeasureByName', ['measure='+measure,'to='+to], callback, null);
};

AdHocCrosstab.removeMeasure = function(index) {
    if (!Object.isNumber(index)){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        index = object.index;
    }

    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_removeMeasure', new Array('i='+index), callback, null);
};

/**
 * Sends a request to expand a level
 * @param dimension
 * @param level
 */
AdHocCrosstab.expandLevel = function(dimension, level) {
    if (!dimension || !level) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        dimension = object.dimension;
        level = object.level;
    }


    var params = new Array('f=' + encodeText(dimension), 'level=' + encodeText(level));
    designerBase.sendRequest('cr_expandLevel', params, localContext.standardCrosstabOpCallback, null);
};

/**
 * Sends a request to collapse a level
 * @param dimension
 * @param level
 */
AdHocCrosstab.collapseLevel = function(dimension, level) {
    if (!dimension || !level) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        dimension = object.dimension;
        level = object.level;
    }

    var params = new Array('f=' + encodeText(dimension), 'level=' + encodeText(level));
    designerBase.sendRequest('cr_collapseLevel', params, localContext.standardCrosstabOpCallback, null);
};

///////////////////////////////////////////////////////////////
// Ajax calls (from xtab)
///////////////////////////////////////////////////////////////
/**
 * Sends a request to add a field as a column group
 * @param fieldName
 * @param position
 */
AdHocCrosstab.insertColumnGroup = function(fieldName,position) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    if (canAddAsGroup()) {
        designerBase.sendRequest('cr_insertColumnGroup', new Array('f=' + encodeText(fieldName), 'i=' + position), callback, null);
    }
};

/**
 * Sends a request to add a field as a row group
 * @param fieldName
 * @param position
 */
AdHocCrosstab.insertRowGroup = function(fieldName,position) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    if (canAddAsGroup()) {
        designerBase.sendRequest('cr_insertRowGroup', new Array('f=' + encodeText(fieldName), 'i=' + position), callback, null);
    }
};

AdHocCrosstab.removeColumnGroup = function(index) {
    if (!index) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        index = AdHocCrosstab.getSelectedDimensionIndex(object);
    }
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_removeColumnGroup', new Array('i='+index), callback, null);
};

AdHocCrosstab.removeRowGroup = function(index) {
    if (!index){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        index = AdHocCrosstab.getSelectedDimensionIndex(object);
    }
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_removeRowGroup', new Array('i='+index), callback, null);
};

AdHocCrosstab.moveRowGroup = function(from, to, customCallback) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        customCallback && customCallback();
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_moveRowGroup', new Array('f='+from,'t='+to), callback, null);
};

AdHocCrosstab.moveColumnGroup = function(from, to, customCallback) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        customCallback && customCallback();
        designerBase.unSelectAll();
    };
    designerBase.sendRequest('cr_moveColumnGroup', new Array('f='+from,'t='+to), callback, null);
};

AdHocCrosstab.toggleExpandCollapseForColumn = function(nodePath, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_toggleExpandCollapseForColumn', new Array('nodePath=' + encodeText(nodePath), 'i=' + index ),callback, null);
};

AdHocCrosstab.toggleExpandCollapseForRow = function(nodePath, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_toggleExpandCollapseForRow', new Array('nodePath=' + encodeText(nodePath), 'i=' + index), callback, null);
};

AdHocCrosstab.switchToRowGroup = function(ind) {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = _.isNumber(ind) ? ind : object.groupIndex;
    designerBase.sendRequest('cr_switchToRowGroup', new Array('i=' + index),localContext.standardCrosstabOpCallback, null);
};

AdHocCrosstab.switchToColumnGroup = function(ind) {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    // TODO: adapt/normalize data from tree and from custom generated event
    var index = _.isNumber(ind) ? ind : object.groupIndex;
    designerBase.sendRequest('cr_switchToColumnGroup', new Array('i=' + index), localContext.standardCrosstabOpCallback, null);
};

AdHocCrosstab.deleteRowGroupSummary = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = AdHocCrosstab.getSelectedDimensionIndex(object);
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setIncludeAllOnRows', new Array('pos=' + index, 'value=false'), callback, null);
};

AdHocCrosstab.addRowGroupSummary = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = AdHocCrosstab.getSelectedDimensionIndex(object);
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setIncludeAllOnRows', new Array('pos=' + index, 'value=true'), callback, null);
};

AdHocCrosstab.deleteColumnGroupSummary = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = AdHocCrosstab.getSelectedDimensionIndex(object);
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setIncludeAllOnColumns', new Array('pos='+index, 'value=false'), callback, null);
};

AdHocCrosstab.addColumnGroupSummary = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = AdHocCrosstab.getSelectedDimensionIndex(object);
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setIncludeAllOnColumns', new Array('pos='+index, 'value=true'), callback, null);
};

AdHocCrosstab.sortControlClicked = function(measureIndex) {
    //this condition prevents sending multiple requests at once
    if (AdHocCrosstab.requestsInProgress < 1) {
        AdHocCrosstab.requestsInProgress++;
        var callback = function(state) {
            AdHocCrosstab.requestsInProgress--;
            localContext.standardCrosstabOpCallback(state);
        };
        designerBase.sendRequest('cr_sortControlClicked', new Array('i=' + measureIndex), callback, null);
    }
};

/**
 * Used to update a calculated field and the canvas view
 */
AdHocCrosstab.updateCalcFieldAndView = function(fieldName, formulaId, argList){
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
        adhocDesigner.updateAllFieldLabels();
        if(adhocDesigner.isInUse(fieldName)){
            adHocFilterModule.resetFilterPanel();
        }
    };
    designerBase.sendRequest("co_updateFieldAndView", new Array("fieldName=" + encodeText(fieldName), "formula=" + formulaId, "args=" + argList), callback, null);
};

AdHocCrosstab.setCategoryForRowGroup = function(catName, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setRowGroupCategorizer', new Array('cat='+encodeText(catName),'i='+index), callback, null);
};

AdHocCrosstab.setCategoryForColumnGroup = function(catName, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setColumnGroupCategorizer', new Array('cat='+encodeText(catName),'i='+index), callback, null);
};

AdHocCrosstab.setMask = function(thisMask, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setDataMask', new Array('m=' + encodeText(thisMask), 'i=' + index), callback, null);
};

AdHocCrosstab.setSummaryFunction = function(thisFunction, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setSummaryFunction', new Array('f=' + thisFunction, 'i=' + index), callback, null);
};

AdHocCrosstab.setSummaryFunctionAndMask = function(thisFunction, thisMask, index) {
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setSummaryFunctionAndDataMask', new Array('f='+ thisFunction,'m='+ encodeText(thisMask),'i='+ index), callback, null);
};

AdHocCrosstab.getOverflowRowGroups = function(){
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_showInUnsafeRowMode', [], callback, null);

};

AdHocCrosstab.getOverflowColumnGroups = function(){
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_showInUnsafeColumnMode', [], callback, null);
};

AdHocCrosstab.getDrillUrl = function() {
    var baseURL = removeTrailingPound(document.location.href); //in case href added #

    var topicRegex = new RegExp("&realm=[^&]+");
    var topicParam = baseURL.match(topicRegex);
    var flowRegex = new RegExp("&_flowExecutionKey=[^&]+");
    var flowParam = baseURL.match(flowRegex);
    var eventIdRegex = new RegExp("&_eventId=[^&]+");
    var eventIdParam = baseURL.match(eventIdRegex);

    var url = 'flow.html?_flowId=adhocFlow' +
                    (topicParam ? topicParam : '') +
                    flowParam +
                    eventIdParam +
                    '&reportType=table' +
                    '&usePreparedState=true' +
                    '&clientKey=' + Math.floor(Math.random()*9999999999999); //ensure new client session
    return url;
};

AdHocCrosstab.drill = function(rowGroupPathIndex, colGroupPathIndex) {
    if (AdHocCrosstab.allowDrill === false) {
        return;
    }

    AdHocCrosstab.allowDrill = false;

    if(isIPad()) JRS.vars.win = window.open();

    var callback = function(json) {
        AdHocCrosstab.allowDrill = true;

        if (json.success) {
            var windowPopper = function(){
                if(isIPad()) {
                    JRS.vars.win.location = AdHocCrosstab.getDrillUrl();
                } else {
                    window.name = "";
                    runPopup = window.open(AdHocCrosstab.getDrillUrl(), "drillTable");
                    runPopup.focus();
                }
            };

            setTimeout(windowPopper,0);
        }
    };

    var drillErrorHandler = function() {
        AdHocCrosstab.allowDrill = true;
    };

    var jsonObject = adHocFilterModule.createJSONDrillThrough(
            localContext.state.rowNodeList[rowGroupPathIndex], localContext.state.columnNodeList[colGroupPathIndex]);

    if (!isIPad() || !JRS.vars.element_scrolled) {
        designerBase.sendRequest('cr_prepareDrillTableState',
            new Array("drillThroughAdhocFilter=" + jsonObject), callback, null, drillErrorHandler);
    }

    return false;
};

AdHocCrosstab.getDrillOlapUrl = function(tempARUName) {
    return 'flow.html?_flowId=viewAdhocReportFlow&clientKey=' + clientKey + "&reportUnit=" + tempARUName + "&noReturn=true";
};

AdHocCrosstab.drillOLAP = function(rowGroupPathIndex, colGroupPathIndex) {
    if (AdHocCrosstab.allowDrill === false) {
        return;
    }

    AdHocCrosstab.allowDrill = false;

    var callback = function(json) {
        AdHocCrosstab.allowDrill = true;

        if (json.tempARUName) {
            localContext.tempARUName = json.tempARUName;
            if(isIPad()) {
//                    JRS.vars.win.location = localContext.getDrillOlapUrl(json.tempARUName);
            } else {
                windowPopUp = window.open("", "jr");
                windowPopUp.location = localContext.getDrillOlapUrl(json.tempARUName);
            }
        } else {
            // do nothing. Seems like there's some error. Standard alert should pop-up
        }
    };

    var drillErrorHandler = function() {
        AdHocCrosstab.allowDrill = true;
    };

    var jsonObject = adHocFilterModule.createJSONDrillThrough(
            localContext.state.rowNodeList[rowGroupPathIndex], localContext.state.columnNodeList[colGroupPathIndex]);

    if (!isIPad() || !JRS.vars.element_scrolled) {
        designerBase.sendRequest('cr_prepareDrillTableStateOLAP',
            new Array("drillThroughAdhocFilter=" + jsonObject), callback, null, drillErrorHandler);
    }
    return false;
};


///////////////////////////////////////////////////////////////
// Ajax calls (toolbar)
///////////////////////////////////////////////////////////////

AdHocCrosstab.getIsHideEmptyRows = function() {
    return AdHocCrosstab.state.crosstabState.hideEmptyRows;
};

AdHocCrosstab.hideEmptyRowsEquals =  function(thisValue) {
    return localContext.getIsHideEmptyRows() === thisValue;
};

AdHocCrosstab.setHideEmptyRows = function() {

    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setProperty', new Array("name=hideEmptyRows", "value=true"),callback, null);
};

AdHocCrosstab.setUnhideEmptyRows = function() {
    //alert("THORICK  adhoc.olap.crosstab.js  setUnhideEmptyRows called");
    var callback = function(state){
        localContext.standardCrosstabOpCallback(state);
    };
    designerBase.sendRequest('cr_setProperty', new Array("name=hideEmptyRows", "value=false"),callback, null);
};

///////////////////////////////////////////////////////////////
// Ajax callbacks
///////////////////////////////////////////////////////////////
AdHocCrosstab.standardOpCallback = function(state) {
    if (state) {
        localContext.standardCrosstabOpCallback(state);
    } else {
        throw "standardOpCallback called without a state!";
    }
};


AdHocCrosstab.getCallbacksForPivot = function(){
    localContext.standardOpCallback();
};

/**
 * Operations callbacks
 */
// update available tree also (re-entrance)
AdHocCrosstab.undoAndRedoCallback = function() {
    adhocDesigner.undoAndRedoCallback();
    localContext.standardCrosstabOpCallback();
};

/**
 * Custom field callback
 */
AdHocCrosstab.updateCustomFieldCallback = function() {
    this.standardCrosstabOpCallback();
};

AdHocCrosstab.reInitOverlayCallback = function(){
};

/**
 * Standard table callback
 */
AdHocCrosstab.standardCrosstabOpCallback = function(state) {
    adhocDesigner.render(state);
//    adhocDesigner.unSelectAll();
};

