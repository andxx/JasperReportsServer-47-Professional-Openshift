/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocTable.addFieldAsColumn = function(includeSubSets){
    var selectedNodes = adhocDesigner.getSelectedTreeNodes();

    var fieldList = adhocDesigner.collectFields(selectedNodes, includeSubSets, AdHocTable.canAddFieldAsColumn).join(",");
    var position = (AdHocTable.hoverColumn > -1) ? AdHocTable.hoverColumn : -1;

    AdHocTable.addFieldAsColumnAtPosition(fieldList, position);
};

AdHocTable.addThisFieldAsColumn = function(fieldName){
    var position = AdHocTable.columnHeaderRow.cells.length;
    AdHocTable.addFieldAsColumnAtPosition(fieldName, position);
};

AdHocTable.moveColumnLeft = function(customCallback) {
    var fromIndex = localContext.getLeftMostPositionFromSelectedColumns();
    var toIndex = fromIndex - 1;
    localContext.moveColumn(fromIndex, toIndex, customCallback);
};

AdHocTable.moveColumnRight = function(customCallback) {
    var fromIndex = localContext.getLeftMostPositionFromSelectedColumns();
    var toIndex = fromIndex + 1;
    function callback() {
        AdHocTable.updateSelectedIndexes(1);
        if(customCallback) {
            customCallback();
        }
    }
    localContext.moveColumn(fromIndex, toIndex,  callback);
};

AdHocTable.updateSelectedIndexes = function(mutator){
    for (var i = 0; i<selObjects.length; i++){
        selObjects[i].index = (+selObjects[i].index+mutator).toString();
    }
};

AdHocTable.resizeColumnWhenSizerDrag = function(element) {
    if (element.match('#designer .columnSizer')){
        /*
         * Change cursor type
         */
        var elemId = element.readAttribute("id");
        theBody.style.cursor = "col-resize";
        /*
         * Make draggable
         */
        var selectionArea = designerBase.TABLE_SELECT_AREA;
        adhocDesigner.overlayDraggedColumn = new Draggable(elemId, {
            constraint: 'horizontal',
            onStart : function(){
            	AdHocTable.draggingColumnSizer = true;
                AdHocTable.activateColumnSizer(elemId);
            },
            onEnd: function(obj, evt){
                var draggableObject = obj.element;
                var id = $(draggableObject).readAttribute("id");
                AdHocTable.deactivateColumnSizer(elemId);
                localContext.tableColumnResize(evt.element(), AdHocTable.digitRegex.exec(id)[0]);
                AdHocTable.draggingColumnSizer = false;
            }
        });
    }
};

AdHocTable.selectTableColumn = function(evt, headerObj){  
    /*
     * deselect all rows and summaries
     */
	AdHocTable.deselectAllSummaryCells();
	AdHocTable.deselectAllColumnGroupRows();

    var isMultiSelect = adhocDesigner.isMultiSelect(evt, designerBase.COLUMN_LEVEL);
    var isSelected = adhocDesigner.isAlreadySelected(headerObj);

    var overlayIndex = headerObj.index;
    var overlayObject = "columnOverlay_" + overlayIndex;

    if (!$(overlayObject)) {
        AdHocTable.initOverlays();
    }
    if(isSelected){
        if(isMultiSelect){
            if($(overlayObject)){
                $(overlayObject).removeClassName("selected").removeClassName("over");
                AdHocTable.removeFromSelectObjects(overlayIndex);
            }
        }else{
        	!isIPad() && AdHocTable.deselectAllTableColumns();
            $(overlayObject).addClassName("selected");
            adhocDesigner.addSelectedObject(evt, headerObj, isMultiSelect, isSelected);
            selectionCategory.area = designerBase.COLUMN_LEVEL;
            !isIPad() && AdHocTable.createDraggableColumn($(overlayObject).identify());
            
        }
    }else{
        if(!isMultiSelect){
        	AdHocTable.columnOverlays.each(function(overlay){
                $(overlay).removeClassName("selected").removeClassName("over");
            });
        }
        if($(overlayObject)){
            $(overlayObject).addClassName("selected");
        }
        adhocDesigner.addSelectedObject(evt, headerObj, isMultiSelect, isSelected);
        selectionCategory.area = designerBase.COLUMN_LEVEL;
        !isIPad() && isDesignView && AdHocTable.createDraggableColumn($(overlayObject).identify());
    }
};
/**
 * Used to deselect a table column
 * @param evt
 * @param overlayIndex
 */
AdHocTable.deselectTableColumn = function(evt, overlayIndex){
    var headerObj = {};
    var overlayObject = "columnOverlay_" + overlayIndex;

    if($(overlayObject)){
        $(overlayObject).removeClassName("selected");
        $(overlayObject).removeClassName("over");
        headerObj.header = localContext._getTableHeaders()[overlayIndex];
        headerObj.index = overlayIndex;
    }
};
/**
 * Used to select a column in table mode
 * @param evt
 * @param element
 */
AdHocTable.deselectAllTableColumns = function(){
    var headers = localContext._getTableHeaders();
    var size = headers.length;
    for(var index = 0; index < size; index++){
    	AdHocTable.deselectTableColumn(null, index);
    }
};

AdHocTable.columnMaskSelected = function(theMask){
    var column = adhocDesigner.getSelectedColumnOrGroup();
    if(column){
        localContext.setMask(theMask, column.index);
    }
};

AdHocTable.removeColumnHeaderRequest = function(){
    var column = adhocDesigner.getSelectedColumnOrGroup();
    if(column){
        localContext.setColumnHeaderToNull(column.index);
    }
};

/**
 * Used to launch sorting dialog
 * @param event
 */
AdHocTable.launchSortingDialogForColumn = function(event){
    var selectedObjects = selObjects;
    if(!selectedObjects && adhocDesigner.getSelectedTreeNodes().length){
        selectedObjects = adhocDesigner.getSelectedTreeNodes();
    }
    if (selectedObjects) {
        var names = [];
        jQuery(selectedObjects).each(function(){
            names.push(adhocDesigner.getNameForSelected(this));
        });
        adhocSort.launchDialog(names);
    }
};
/*---------------------------------------------------
 * Group
 ----------------------------------------------------*/
AdHocTable.moveGroupUp = function(customCallback) {
    function callback() {
        AdHocTable.updateSelectedIndexes(-1);
        if(customCallback) {
            customCallback();
        }
    }
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if (object) {
        var fromGroup = parseInt(object.index);
        var toGroup = fromGroup - 1;
        localContext.moveGroup(fromGroup, toGroup, callback);
    }
};

AdHocTable.moveGroupDown = function(customCallback) {
    function callback() {
        AdHocTable.updateSelectedIndexes(1);
        if(customCallback) {
            customCallback();
        }
    }

    var object = adhocDesigner.getSelectedColumnOrGroup();
    if (object) {
        var fromGroup = parseInt(object.index);
        var toGroup = fromGroup + 1;
        localContext.moveGroup(fromGroup, toGroup, callback);
    }
};

/**
 * Used to select a group
 * @param evt
 * @param rowObject
 */
AdHocTable.selectGroup = function(evt, rowObject){
    var overlayId = rowObject.id;
    var overlayIndex  = rowObject.index;
    var isMultiSelect = adhocDesigner.isMultiSelect(evt, designerBase.GROUP_LEVEL);
    selectionCategory.area = designerBase.GROUP_LEVEL;
    var isSelected = adhocDesigner.isAlreadySelected(rowObject);

    if(isSelected){
        AdHocTable.deselectAllColumnGroupRows();
        if($(overlayId)){
            $(overlayId).addClassName("selected");
        }
        adhocDesigner.addSelectedObject(evt, rowObject, isMultiSelect, isSelected);
        //createDraggableGroup(overlayId);
    }else{
        //deselect all other overlays
        AdHocTable.deselectAllColumnGroupRows();
        AdHocTable.deselectAllTableColumns();
        AdHocTable.deselectAllSummaryCells();

        if($(overlayId)){
            $(overlayId).addClassName("selected");
            !isIPad() && AdHocTable.createDraggableGroup(overlayId);
        }
        adhocDesigner.addSelectedObject(evt, rowObject, isMultiSelect, isSelected)
    }
};
/**
 * Used to deselect all column group rows
 */
AdHocTable.deselectAllColumnGroupRows = function(){
    designerBase.deselectOverlaySet(AdHocTable.groupOverlays, "selected");
    designerBase.deselectOverlaySet(AdHocTable.groupOverlays, "pressed");
};

AdHocTable.editGroupLabel = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if(object){
        var groupIndex = object.index;
        var span = $$(adhocDesigner.GROUP_LABEL_SPAN_PATTERN)[groupIndex];
        adhocDesigner.editDataHeader(span.down(), "tableGroup");
    } else {
        alert('Warning: no object selected.');
    }
};

AdHocTable.removeGroupLabel = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if (object) {
        var groupIndex = object.index;
        localContext.setGroupLabelToNull(groupIndex);
    }
};

AdHocTable.groupMaskSelected = function(theMask){
    var group = adhocDesigner.getSelectedColumnOrGroup();
    var index = group.index;
    if(group){
        localContext.setGroupMask(theMask, index);
    }
};
/*-------------------------------------------------
 * Summary
 --------------------------------------------------*/
/**
 * Used to select a single summary cell
 * @param evt
 * @param overlayIndex
 */
AdHocTable.selectGrandRowCell = function(evt, overlayIndex){
    AdHocTable.deselectAllTableColumns();
    AdHocTable.deselectAllColumnGroupRows();

    selectionCategory.area = designerBase.SUMMARY_LEVEL;
    var summaryCells = $("grandSummaryRow").cells;
    var cell = summaryCells[overlayIndex];
    var summaryCellOverlay = "grandSummaryOverlay_" + overlayIndex;

    var isSelected = adhocDesigner.isAlreadySelected(cell);

    if(!isSelected){
        AdHocTable.deselectAllSummaryCells();
        if($(summaryCellOverlay)){
            $(summaryCellOverlay).addClassName("selected");
        }
        adhocDesigner.addSelectedObject(evt, cell, false, isSelected);
    }
};
/**
 * Used to deselect all grand summary cells
 */
AdHocTable.deselectAllSummaryCells = function(){
    designerBase.deselectOverlaySet(AdHocTable.summaryOverlays, "selected");
};

