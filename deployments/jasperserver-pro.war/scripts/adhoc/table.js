/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var AdHocTable = {
	render_mode: 'table',
	state: {},
	FETCH_MORE_ROWS: "fetchMoreRows",
	ALMOST_IN_VIEW_OFFSET: 100,
	MINIMUM_COL_WIDTH: 0,
	DEFAULT_GROUP_LABEL_OVERLAY_LEN: 200,
    digitRegex: /\d+/,   
    /*
     * UI Variables
     */
    columnHeaderRow:null,
    theRows:null,
    theCols:null,
    lastRow:null,
	existingRowCount:null,
	hoverColumn:-1,
	
    reset: function() {
        this.groupOverlays = [];
        this.columnResizers = [];
        this.columnOverlays = [];
        this.summaryOverlays = [];
        this.groupLabelOverlays = [];
        this.draggingColumnSizer = false;
        this.draggingColumnOverlay = false;
        this.draggingGroupOverlay = false;
        this.fetchingRows = false;
        this.draggingMoveOverColumnIndex = -1;
        this.draggingMoveOverGroupIndex = -1;

        adhocDesigner.resetState.call(this);
    },
    getMode: function() {
        return designerBase.TABLE;
    },
    initAll: function(){
        adhocDesigner.overlayParent = isSupportsTouch() ? $("mainTableContainer").down() : $("mainTableContainer");
        adhocDesigner.enableXtabPivot(false);
        AdHocTable.theRows = $('canvasTable').rows;
        AdHocTable.existingRowCount = AdHocTable.theRows.length;
        AdHocTable.columnHeaderRow = $("columnHeaderRow");
        AdHocTable.state.endOfFile = false;
        AdHocTable.shouldFetchMoreRows() && AdHocTable.fetchMoreRows();
        AdHocTable.initRowDependentDimensions();
        AdHocTable.initOverlays();
        AdHocTable.initKeyEvents();
    },
    update: function(state) {
        adhocDesigner.updateState.call(this, state);
        return this;
    },
    render: function(){
        var isDataPresent = !(this.state.columns.length === 0 && this.state.groups.length === 0);
        jQuery('#nothingToDisplayMessage').html(this.nothingToDisplayMessage);
        adhocDesigner.ui.canvas.html(this.tableTemplate(this.state));
        adhocDesigner.setNothingToDisplayVisibility(!isDataPresent);
        return isDataPresent;
    }
};

AdHocTable._getTableHeaders = function(){
    return $$("tr#columnHeaderRow.labels.column th.label");
}

AdHocTable.canSaveReport = function(){
    if($("canvasTableCols")){
    	AdHocTable.theCols = $("canvasTableCols").getElementsByTagName("col");
        if(AdHocTable.theCols){
            return (AdHocTable.theCols.length > 0);
        }
    }
    return false;
}
/*
 * Used to deselect/deactivate all all overlays
 */
AdHocTable.deselectAllSelectedOverlays = function(){
	AdHocTable.deselectAllTableColumns();
	AdHocTable.deselectAllSummaryCells();
	AdHocTable.deselectAllColumnGroupRows();
}
/*
 * Used to remove a selected object using its overlay index
 */
AdHocTable.removeFromSelectObjects = function(overlayIndex){
    var foundObject;
    selObjects.each(function(object){
        if(object.index == overlayIndex){
            foundObject = object;
        }
    });
    selObjects = selObjects.without(foundObject);
};

AdHocTable.State = function(state) {
    adhocDesigner.State.call(this, state);
};
