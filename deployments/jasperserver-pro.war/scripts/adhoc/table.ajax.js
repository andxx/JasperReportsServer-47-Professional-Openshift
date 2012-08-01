/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/*
 * Column
 */
AdHocTable.addFieldAsColumnAtPosition = function(fieldName, position){
    if (!AdHocTable.canAddFieldAsColumn(fieldName)) {
        return;
    }
    var isNoDataBefore = adhocDesigner.isNoDataToDisplay();
    var callback = function(model){
    	AdHocTable.hoverColumn = -1;
        localContext.standardTableOpCallback(model);
        if (isNoDataBefore && !adhocDesigner.isNoDataToDisplay()){
            adhocDesigner.checkMaxRowsLimit();
        }
    };
    designerBase.sendRequest(
    	"ta_insertColumn", 
    	new Array("f=" + encodeText(fieldName), "i=" + position), 
    	callback, 
    	{"bPost" : true}
    );
};

AdHocTable.moveColumn = function(fromIndex, toIndex, customCallback, single){
	var indices = single ? fromIndex : _.pluck(selObjects, 'index').join(","),
        offset = (toIndex - fromIndex),
        callback = function(state) {
            localContext.standardTableOpCallback(state);
            customCallback && customCallback(state)
        };

    designerBase.sendRequest("ta_moveColumn", ["indexes=" + indices, "offset=" + offset], callback);
};

AdHocTable.switchToColumn = function(fieldName, from, to){
    if (!fieldName && selObjects.length > 0) {
        fieldName = selObjects[0].fieldName;
        from = selObjects[0].index;
        to = -1;
    }
    designerBase.sendRequest("ta_switchToColumn", ["item=" + encodeText(fieldName), "from=" + from, "to=" + to],
        localContext.standardTableOpCallback);
};

AdHocTable.removeColumn = function(_index,extra_callback) {
	var indices = _.isNumber(_index) ? _index : _.pluck(selObjects, 'index').join(','),
        callback = extra_callback || localContext.standardTableOpCallback;

    designerBase.sendRequest("ta_removeColumn", ["indexes=" + indices], callback);
};

AdHocTable.tableColumnResize = function(sizerElement, index){
    var newWidth = AdHocTable.getNewColumnWidth(sizerElement, index);
    var callback = function(model){
        localContext.standardTableOpCallback(model);
    };
    designerBase.sendRequest("ta_resizeColumn", new Array("i=" + index, "w=" + newWidth), callback);
};
/*
 * Column header
 */
AdHocTable.setColumnHeaderToNull = function(colIndex){
	var callback = function(model){
	    localContext.standardTableOpCallback(model);
	};
	designerBase.sendRequest("ta_setColumnHeader", new Array("i=" + colIndex, "l=_null", "w=-1"), callback);
};
	
AdHocTable.updateColumnHeaderRequest = function(text, index, width){
	var callback = function(model) {
	    localContext.standardTableOpCallback(model);
	};
	if (text.length === 0) {
	    localContext.removeColumnHeaderRequest();
	} else {
	    designerBase.sendRequest("ta_setColumnHeader", new Array("i=" + index, "l=" + encodeText(text), "w=" + width), callback);
	}
};
/*
 * Column mask
 */
AdHocTable.setMask = function(thisMask, colIndex){
    var callback = function(model){
        localContext.standardTableOpCallback(model);
        // clear selection to prevent caching old objects in selection array
        designerBase.unSelectAll();
    };
    designerBase.sendRequest("ta_setColumnMask", new Array("m=" + encodeText(thisMask), "i=" + colIndex), callback);
};
/*
 * Details
 */
AdHocTable.toggleTableDetails = function(){
    var callback = function(model){
        localContext.standardTableOpCallback(model);
    };
    designerBase.sendRequest('ta_toggleDetails', new Array(), callback);
};
/*
 * Field
 */
AdHocTable.updateCalcFieldAndView = function(fieldName, formulaId, argList){
    var callback = function(state){
        localContext.standardOpCallback(state);
        if(adhocDesigner.isInUse(fieldName)){
            adHocFilterModule.resetFilterPanel();
        }
    };
    designerBase.sendRequest("co_updateFieldAndView", new Array("fieldName=" + encodeText(fieldName), "formula=" + formulaId, "args=" + argList), callback);
};
/*
 * Group
 */
AdHocTable.addFieldAsGroup = function(fieldName,index) {
    if (!fieldName) {
        index = -1;
        fieldName = adhocDesigner.collectFields(adhocDesigner.getSelectedTreeNodes(), true).join(",");
    }

    designerBase.sendRequest("ta_insertGroup", ["f=" + encodeText(fieldName), "i=" + index], localContext.standardTableOpCallback);
};

AdHocTable.moveGroup = function(from, to, customCallback){
    var callback = function(model){
        localContext.standardTableOpCallback(model);
        customCallback && customCallback();
    };
    designerBase.sendRequest("ta_moveGroup", ["i1=" + (from), "i2=" + (to)], callback);
};

AdHocTable.switchToGroup = function(fieldName, from, to){
    // If fieldName is undefined then it means we need to take info from last selected object
    if (!fieldName && selObjects.length > 0) {
        fieldName = jQuery(selObjects[0].header).attr('data-fieldname');
        from = selObjects[0].index;
        to = -1;
    }
    designerBase.sendRequest("ta_switchToGroup", ["item=" + encodeText(fieldName), "from=" + from, "to=" + to],
        localContext.standardTableOpCallback);
};


AdHocTable.removeGroup = function(_index,extra_callback){
	var index = parseInt(_index),
	    object,
        callback = extra_callback || localContext.standardTableOpCallback;

	if(isNaN(index)) {
        index = (object = adhocDesigner.getSelectedColumnOrGroup()) && object.index;
	}
    designerBase.sendRequest("ta_removeGroup", ["i=" + index], callback);
};
/*
 * Group label
 */
AdHocTable.updateGroupLabel = function(label, groupIndex){
    if (!label || label.blank()) {
        localContext.setGroupLabelToNull(groupIndex);
        return;
    }
    var callback = function(model) {
        localContext.standardTableOpCallback(model);
    };
    designerBase.sendRequest("ta_setGroupLabel", new Array("g=" + groupIndex, "l=" + encodeText(label)), callback);
};

AdHocTable.setGroupLabelToNull = function(groupIndex){
    var callback = function(model){
        localContext.standardTableOpCallback(model);
    };
    designerBase.sendRequest("ta_setGroupLabel", new Array("g=" + groupIndex, "l=_null"), callback);
};
/*
 * Group mask
 */
AdHocTable.setGroupMask = function(thisMask, grIndex){
    var callback = function(model){
        localContext.standardTableOpCallback(model);
    };
    designerBase.sendRequest("ta_setGroupMask", new Array("m=" + encodeText(thisMask), "i=" + grIndex), callback);
};
/*
 * Row
 */
AdHocTable.fetchMoreRows = function(){
	AdHocTable.fetchingRows = true;
    var callback = function(state){
        adhocDesigner.registerTemplate(AdHocTable, "tableRowsTemplate", "tableRowsTemplate");

        var renderedTemplate = AdHocTable.tableRowsTemplate(state)
            .replace(/^[\s]*<tbody id="tableDetails" class="copyTo">/g, "")
            .replace(/<\/tbody>[\s]*/g, "");

        jQuery("#canvasTable > tbody.copyTo").append(renderedTemplate);
        localContext.initNewRows();
    };

    designerBase.sendRequest("ta_" + AdHocTable.FETCH_MORE_ROWS, [], callback, null);
};
/*
 * Summary
 */
AdHocTable.addDefaultColumnSummary = function(){
    var summaryFunction;
    var selectedColumnIndex = null;
    var object = adhocDesigner.getSelectedColumnOrGroup();

    if (object) {
        if (selectionCategory.area === designerBase.SUMMARY_LEVEL) {
            var overlayId = object.identify();
            selectedColumnIndex = AdHocTable.digitRegex.exec(overlayId)[0];
        } else if (selectionCategory.area === designerBase.COLUMN_LEVEL) {
            selectedColumnIndex = object.index;
        }

        if (AdHocTable.isSelectedMeasureNumeric(AdHocTable.columnHeaderRow.cells[adhocDesigner.getSelectedColumnOrGroup()])) {
            summaryFunction = adhocDesigner.DEFAULT_SUMMARY_NUM_FUNC;
        }
        else {
            summaryFunction = adhocDesigner.DEFAULT_SUMMARY_NONNUM_FUNC;
        }
        var callback = function(model) {
            localContext.standardTableOpCallback(model);
        };
        designerBase.sendRequest("ta_setColumnSummaryFunction", new Array("f=" + summaryFunction, "sf=" + "_schema", "i=" + selectedColumnIndex), callback);
    }
};

AdHocTable.removeColumnSummary = function(){
    var index = null;
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if (object) {
        if (selectionCategory.area === designerBase.SUMMARY_LEVEL) {
            var overlayId = object.identify();
            index = AdHocTable.digitRegex.exec(overlayId)[0];
        } else if (selectionCategory.area === designerBase.COLUMN_LEVEL) {
            index = object.index;
        }
        var callback = function(model) {
            localContext.standardTableOpCallback(model);

        };
        designerBase.sendRequest("ta_setColumnSummaryFunction",  new Array("f=_null", "i=" + index), callback);
    }
};
/*
 * Summary function
 */
AdHocTable.setSummaryFunction = function(thisFunction, colIndex){
    var callback = function(model){
        localContext.standardTableOpCallback(model);
    };
    designerBase.sendRequest("ta_setColumnSummaryFunction", new Array("f=" + thisFunction, "i=" + colIndex), callback);
};
//***************************************************************
// AJAX Callbacks
//***************************************************************
/*
 * Custom field callback
 */
AdHocTable.updateCustomFieldCallback = function() {
	localContext.standardTableOpCallback();
    if(localContext.state.inDesignView) {
        adhocDesigner.updateAllFieldLabels();
    }
};
/*
 * pivot callback
 */
AdHocTable.getCallbacksForPivot = function(state){
    localContext.standardOpCallback(state);
};
/*
 * Standard callback
 */
AdHocTable.standardOpCallback = function(state) {
    if (state) {
        localContext.standardTableOpCallback(state,true);
    } else {
        throw "standardOpCallback called without a state!";
    }
};
/*
 * Standard table callback
 */
AdHocTable.standardTableOpCallback = function(state) {
	adhocDesigner.render(state);
};
