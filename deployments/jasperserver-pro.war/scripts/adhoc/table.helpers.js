/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/*
 * Tests for add
 */
AdHocTable.canAddFieldAsColumn = function(fieldName) {
    if (AdHocTable.isSpacer(fieldName)) { //spacers are always welcome
        return true;
    }
    //field not already exists?
    return !_.any(localContext.state.columns, function(col) {
        return col.name === fieldName;
    });
};

AdHocTable.isSpacer = function(fieldName){
    return fieldName == designerBase.SPACER_NAME;
};

AdHocTable.canAddAsColumn = function() {
    return _.all(selObjects, function(node) {
        return AdHocTable.canAddFieldAsColumn(node.param.id);
    });
};
/*
 * Tests for move
 */
AdHocTable.canMoveColumnsLeft = function(){
    return AdHocTable.getLeftMostPositionFromSelectedColumns() > 0;
};

AdHocTable.canMoveColumnsRight = function(){
    return AdHocTable.getRightMostPositionFromSelectedColumns() < (AdHocTable._getTableHeaders().length - 1);
};
/*
 * Used to get the left position of the selected object
 */
AdHocTable.getLeftMostPositionFromSelectedColumns = function(){
    var size = selObjects.length;
    if (size > 0) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var left = object.index;
        for (var index = 1; index < size; index++) {
            var l = selObjects[index].index;
            if (l < left) {
                left = l;
            }
        }
        return parseInt(left);
    }
    return -1;
};
/*
 * Used to get the right most position of the selected column
 */
AdHocTable.getRightMostPositionFromSelectedColumns = function(){
    var size = selObjects.length;
    if (size > 0) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var right = object.index;
        for (var index = 1; index < size; index++) {
            var r = selObjects[index].index;
            if (r > right) {
                right = r;
            }
        }
        return parseInt(right);
    }
    return -1;
};
/*
 * Column resize helper
 */
AdHocTable.getNewColumnWidth = function(element, index){
    var dragger = element;
    var headerCell = localContext._getTableHeaders()[index];
    /*
     * left of dragger - left of cell == new width of cell/column
     */
    var leftOfDragger =  $(dragger).cumulativeOffset()[0] + dragger.cumulativeScrollOffset()[0];
    var leftOfCellHeader = $(headerCell).cumulativeOffset()[0] + headerCell.cumulativeScrollOffset()[0];
    var newWidth = leftOfDragger - leftOfCellHeader;
    return Math.max(newWidth, AdHocTable.MINIMUM_COL_WIDTH);
};
/*
 * Check to see if the column type is equal to the type passed
 */
AdHocTable.isSelectedColumnType = function(type){
    return localContext.getSelectedColumnType() == type;
};
/*
 * Used to get the datatype for the column
 */
AdHocTable.getSelectedColumnType = function(){
    if(selObjects.length != 0){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
            var overlayId = object.identify();
            var colHeader = localContext._getTableHeaders()[AdHocTable.digitRegex.exec(overlayId)[0]];
            return  colHeader.readAttribute("data-type");
        }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
            return  object.header.readAttribute("data-type");
        }else{
            return adhocDesigner.NaN;
        }
    }else{
        return adhocDesigner.NaN;
    }
};
/*
 * Tests ran by AdHocTable.shouldFetchMoreRows
 */
AdHocTable.hasColumns = function(){
    var hasCols = false;
    AdHocTable.theCols = $("canvasTableCols").getElementsByTagName("col");
    if(AdHocTable.theCols){
        hasCols = (AdHocTable.theCols.length > 0);
    }
    return hasCols;
};
AdHocTable.hasGroups = function(){
    return localContext.state.groups.length > 0;
};
/*
 * Test to see if we are currently getting more rows
 */
AdHocTable.isFetchingRows = function() {
    return AdHocTable.fetchingRows;
};
/*
 * Test to see if we are fetching more rows
 */
AdHocTable.shouldFetchMoreRows = function() {
    return ((AdHocTable.hasColumns() || AdHocTable.hasGroups())
            && (localContext.state.isShowingFullData && !localContext.state.endOfFile)
            && (AdHocTable.theRows.length < adhocDesigner.ROW_SIZE_TO_TRIGGER_SCROLLBAR));
};
/*
 * Test to fetch more rows
 */
AdHocTable.tableScrolled = function() {
    if ((localContext.getMode() === designerBase.TABLE) && localContext.state.isShowingFullData
            && !localContext.state.endOfFile  && !AdHocTable.isFetchingRows()) {

        var scrolledToBottom = isIPad() ?
            adhocDesigner._touchController.isBottom() : isAlmostInView(AdHocTable.theRows[AdHocTable.lastRow],AdHocTable.ALMOST_IN_VIEW_OFFSET);
        scrolledToBottom && localContext.fetchMoreRows();
    }
};
AdHocTable.selectedColumnCanAddSummary = function(){
    return !adhocDesigner.hasSpacerInSelection() && !AdHocTable.selectedColumnHasSummary();
};
/*
 * Used to test if the column has a selected summary
 */
AdHocTable.selectedColumnHasSummary = function(){
    if(selObjects.length != 1){
        return false;
    }else{
        var selectedObject = designerBase.getSelectedObject();
        var fieldName = null;
        if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
            var overlayId = selectedObject.identify();
            var colHeader = localContext._getTableHeaders()[AdHocTable.digitRegex.exec(overlayId)[0]];
            fieldName = colHeader.readAttribute("data-fieldName");
        }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
            fieldName = selectedObject.header.readAttribute("data-fieldName");
        }else{
            return false;
        }
        var index = localContext.state.summarizedFields.indexOf(fieldName);
        return (index >= 0);
    }
};

AdHocTable.selectedColumnShowsSummaryOptions = function(){
    return AdHocTable.selectedColumnHasSummary() && AdHocTable.selectedMeasureShowsSummaryOptions();
};

AdHocTable.selectedMeasureShowsSummaryOptions = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if(object){
        var summaryIndex = $(object).readAttribute("data-summaryIndex");
        var name = localContext.state.columns[parseInt(summaryIndex)].name;
        return !adhocDesigner.isPercentOfParentCalc(name);
    }
    return false;
};

AdHocTable.isSelectedMeasureNumeric = function(){
    return AdHocTable.isSelectedColumnType("int") || AdHocTable.isSelectedColumnType("dec");
};

AdHocTable.isSelectedSummaryFunction = function(thisFunction){
    var cell = AdHocTable.getSelectedSummaryCell();
    if(cell){
        return $(cell).readAttribute("data-name") === thisFunction;
    }else{
        return false;
    }
};

AdHocTable.getSelectedSummaryCell = function(){
    if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
        return selObjects[0];
    }else{
        return null;
    }
};
AdHocTable.functionSelected = function(thisFunction){
    if(selObjects.length > 0){
        var selectedObject = designerBase.getSelectedObject();
        var index = null;
        
        if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
            var overlayId = selectedObject.identify();
            index = AdHocTable.digitRegex.exec(overlayId)[0];
        } else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
            index = selectedObject.index;
        }
        localContext.setSummaryFunction(thisFunction, index);
    }
};
/*
 * check to see if the selected object has be used in sorting.
 */
AdHocTable.selectedFieldUsedForSorting = function() {
    var selectedObject = designerBase.getSelectedObject();
    var fieldName = adhocDesigner.getNameForSelected(selectedObject);
    return AdHocTable.usedInSorting(fieldName);
};
/*
 * Test to see if the field can be used for sorting.
 */
AdHocTable.selectedFieldCouldBeUsedForSorting = function() {
    return !(adhocDesigner.hasSpacerInSelection() ||
            adhocDesigner.hasGroupInSelection() ||
            AdHocTable.selectedFieldUsedForSorting() ||
            designerBase.isSelectedNodeAFolder());
};
/*
 * Test to see if the column is being used for sorting
 */
AdHocTable.selectedColumnUsedForSorting = function(){
    if(!localContext.state.inDesignView){
        return false;
    }
    return selObjects.any(function(column){
        return AdHocTable.usedInSorting(column.header.readAttribute("data-fieldName"));
    });
};

AdHocTable.selectedColumnCouldBeUsedForSorting = function(){
    if(!localContext.state.inDesignView){
        return false;
    }
    return !AdHocTable.selectedColumnUsedForSorting() && !adhocDesigner.hasSpacerInSelection();
};
/*
 * Used to test if a field is being used in sorting.
 */
AdHocTable.usedInSorting = function(fieldName){
    if (localContext.state.sortFields != null) {
        var sfs = localContext.state.sortFields;
        for (var i = 0; i < sfs.length; i++) {
            if (sfs[i].name == fieldName) {
                return true;
            }
        }
    }
    return false;
};
AdHocTable.canAddAsGroup = function() {
	if(selObjects[0]){
		if(selObjects[0].parent.treeId == 'measuresTree') return false;
	}
    return !(adhocDesigner.hasSpacerInSelection() ||
            adhocDesigner.multiSelect ||
            adhocDesigner.isSelectedTreeNodeAFolder() ||
            adhocDesigner.isPercentOfParentCalcSelected());
};

AdHocTable.canSwitchToGroup = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    return object && object.ftype === "dimension";
};

AdHocTable.canMoveGroupUp = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    return object && (object.index) > 0;
};

AdHocTable.canMoveGroupDown = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var numberOfGroups = localContext.state.groups.length;
    return object && (object.index) < (numberOfGroups - 1);
};

AdHocTable.isSelectedGroupType = function(type){
    return AdHocTable.getSelectedGroupType() === type;
};


AdHocTable.getSelectedGroupType = function(){
    if(selectionCategory.area === designerBase.GROUP_LEVEL){
        if(selObjects.length > 0){
            var object = selObjects[0];
            return object.dataType;
        }
    }
    return adhocDesigner.NaN;
};

AdHocTable.canAddGroupLabelToSelected = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if (object) {
        var label = object.label;
        return label.blank();
    }
    return false;
};

AdHocTable.canGroupSetMask = function(){
    return AdHocTable.getSelectedGroupType() != adhocDesigner.NaN;
};

AdHocTable.isGroupMaskSelected =  function(mask){
    return AdHocTable.getMaskForSelectedGroup() == mask.unescapeHTML();
};

AdHocTable.getMaskForSelectedGroup = function(){
    if(selectionCategory.area === designerBase.GROUP_LEVEL){
        if(selObjects.length > 0){
            var object = selObjects[0];
            return object.mask;
        }
    }
    return null;
};

AdHocTable.canColumnSetMask = function() {
    return (localContext.getSelectedColumnType() != adhocDesigner.NaN);
};
/**
 * Test to see if the selected mask is equal to the mask passed
 * @param mask
 */
AdHocTable.isColumnMaskSelected = function(mask){
    return AdHocTable.getMaskForSelectedColumn() === mask.unescapeHTML();
};
/*
 * Used to get the current mask for the selected column
 */
AdHocTable.getMaskForSelectedColumn = function(){
    return adhocDesigner.getSelectedColumnOrGroup().header.getAttribute("data-mask");
};

/*
 * Used to test if we can edit a column header
 */
AdHocTable.canEditColumnHeaderForSelected = function(){
    return !AdHocTable.selectedHasNoColumnHeader() && !adhocDesigner.hasSpacerInSelection();
};
/*
 * Used to test if we can add a column header
 */
AdHocTable.canAddColumnHeaderToSelected = function(){
    return AdHocTable.selectedHasNoColumnHeader() && !adhocDesigner.hasSpacerInSelection();
};
/*
 * Used to test if the current column has no header
 */
AdHocTable.selectedHasNoColumnHeader = function(){
    var headerObj = adhocDesigner.getSelectedColumnOrGroup();
    return (headerObj.header.hasClassName("deletedHeader"));
};

AdHocTable.getTableTop = function() {
    var tableTop;
    var offsetTop = $("canvasTable").offsetTop;
    if (Prototype.Browser.Gecko || !$("titleCaption")) {
        tableTop = offsetTop + "px";
    } else {
        tableTop = offsetTop + $("titleCaption").getHeight() + "px";
    }
    return tableTop;
};

AdHocTable.getTableHeight = function() {
    var tableHeight;
    var offsetHeight = $("canvasTable").offsetHeight;
    if (Prototype.Browser.Gecko || !$("titleCaption")) {
        tableHeight = offsetHeight + "px";
    } else {
        tableHeight = offsetHeight - $("titleCaption").getHeight() + "px";
    }
    return tableHeight;
};

