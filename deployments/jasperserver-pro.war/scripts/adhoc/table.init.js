/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocTable.initOverlays = function(){
    AdHocTable.initColumnOverlays();
    AdHocTable.initColumnResizers();
    AdHocTable.initGroupLabelOverlays();
    AdHocTable.initGroupOverlays();
    AdHocTable.initSummaryOverlay();
}

AdHocTable.initRowDependentDimensions = function(){
    AdHocTable.lastRow = AdHocTable.theRows.length - 1;
    if (AdHocTable.theRows[AdHocTable.lastRow].id == "NoDataRow") {
        AdHocTable.lastRow = AdHocTable.lastRow - 1;
    }
    AdHocTable.columnHeaderRow = $("columnHeaderRow");
}

AdHocTable.initNewRows = function(){
    AdHocTable.state.endOfFile = $("endOfFileRow") || (AdHocTable.existingRowCount == AdHocTable.theRows.length);
    AdHocTable.theRows = $('canvasTable').rows;
    window.status = "total rows = " + AdHocTable.theRows.length;

    if (this.shouldFetchMoreRows()) {
        setTimeout("localContext.fetchMoreRows()", 100);
        return;
    }

    AdHocTable.initRowDependentDimensions();
    AdHocTable.initOverlays();

    AdHocTable.existingRowCount = AdHocTable.theRows.length;
    AdHocTable.fetchingRows = false;
}

AdHocTable.initColumnResizers = function(){
    var miniHack = 3;
    var columnHeaders = AdHocTable.columnHeaderRow.cells;
    designerBase.clearOverlaySet(AdHocTable.columnResizers);

    for(var index = 0; index < columnHeaders.length; index++){
        var columnHeader = columnHeaders[index];
        var columnOverlaySizer = designerBase.createDomObject("DIV", "columnSizer");
        columnOverlaySizer.writeAttribute("id", "columnSizer_" + index);
        //weird behavior in FF. Seems it does not take the caption height into consideration
        // extracted code to getTableTop() and getTableHeight() due to #21656
        //var tableTop = Prototype.Browser.Gecko ? ($("canvasTable").offsetTop + "px") : ($("canvasTable").offsetTop + $("titleCaption").getHeight() + "px");
        //var tableHeight = Prototype.Browser.Gecko ? ($("canvasTable").offsetHeight + "px") : ($("canvasTable").offsetHeight - $("titleCaption").getHeight() + "px");
        var tableTop = this.getTableTop();
        var tableHeight = this.getTableHeight();
        var tempLeft = ($(columnHeader).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0] - miniHack);
        var columnLeft = tempLeft + columnHeader.offsetWidth + "px";

        columnOverlaySizer.setStyle({
            'left': columnLeft,
            'top' : tableTop,
            'height' : tableHeight
        });
        AdHocTable.columnResizers[index] = columnOverlaySizer;
        adhocDesigner.overlayParent.appendChild(columnOverlaySizer);
    }
}

AdHocTable.initColumnOverlays = function(){
    var columnHeaders = AdHocTable.columnHeaderRow.cells;
    var count = columnHeaders.length;
    designerBase.clearOverlaySet(AdHocTable.columnOverlays);

    for(var index = 0; index < count; index++){
        var columnHeader = columnHeaders[index];
        var columnOverlay = designerBase.createDomObject("DIV", "overlay col");
        columnOverlay.writeAttribute("id", "columnOverlay_" + index);
        //weird behavior in FF. Seems it does not take the caption height into consideration
        // extracted code to getTableTop() and getTableHeight() due to #21656
        //var tableTop = Prototype.Browser.Gecko ? ($("canvasTable").offsetTop + "px") : ($("canvasTable").offsetTop + $("titleCaption").getHeight() + "px");
        //var tableHeight = Prototype.Browser.Gecko ? ($("canvasTable").offsetHeight + "px") : ($("canvasTable").offsetHeight - $("titleCaption").getHeight() + "px");
        var tableTop = this.getTableTop();
        var tableHeight = this.getTableHeight();
        var columnLeft = ($(columnHeader).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0]) + "px";
        var columnWidth = columnHeader.offsetWidth + "px";

        columnOverlay.setStyle({
            'left': columnLeft,
            'width': columnWidth,
            'top' : tableTop,
            'height' : tableHeight
        });
        AdHocTable.columnOverlays[index] = columnOverlay;
        adhocDesigner.overlayParent.appendChild(columnOverlay);
    }
}

AdHocTable.initGroupOverlays = function(){
    var spanWidth;
    //purge all existing overlays
    designerBase.clearOverlaySet(AdHocTable.groupOverlays);
    var rows = $$("tr.placeholder.member.labels");
    var numberOfGroups = localContext.state.groups.length;
    var columnHeaders = AdHocTable.columnHeaderRow.cells;
    var count = columnHeaders.length;
    var isColsPresent = (count > 0);
    var containerPadding = parseInt($("mainTableContainer").getStyle("paddingLeft"));

//        if(Prototype.Browser.Gecko){ //Bug 21752
    spanWidth = isColsPresent ? $("canvasTable").getWidth() - containerPadding : AdHocTable.DEFAULT_GROUP_LABEL_OVERLAY_LEN;
//        }else{
//            spanWidth = $("canvasTable").getWidth() - containerPadding;
//        }

    var groups = rows.splice(0, numberOfGroups);

    groups.each(function(object){
        var groupOverlay = designerBase.createDomObject("DIV", "overlay group button");

        groupOverlay.setStyle({
            'left': ($(object).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0]) + "px",
            'top' :  $(object).offsetTop + $("canvasTable").offsetTop + "px",
            'width': spanWidth + "px",
            'height' : $(object).offsetHeight + "px"
        });

        var fieldName = object.readAttribute("data-fieldName");
        groupOverlay.writeAttribute("id", _.uniqueId("columnGroupOverlay_"));
        groupOverlay.writeAttribute("data-fieldName", fieldName);
        groupOverlay.writeAttribute("data-dataType", object.readAttribute("data-type"));
        groupOverlay.writeAttribute("data-mask", object.readAttribute("data-mask"));
        groupOverlay.writeAttribute("data-index", object.readAttribute("data-index"));
        groupOverlay.writeAttribute("data-label", object.readAttribute("data-label"));
        AdHocTable.groupOverlays.push(groupOverlay);
        adhocDesigner.overlayParent.appendChild(groupOverlay);
    });
}

AdHocTable.initGroupLabelOverlays = function(){
    var spanWidth;
    designerBase.clearOverlaySet(AdHocTable.groupLabelOverlays);
    var columnHeaders = AdHocTable.columnHeaderRow.cells;
    var count = columnHeaders.length;
    var isColsPresent = (count > 0);
    var groupLabels = $$("tr.placeholder.member.labels");
    var groupSummariesLabels = $$("tr.memberSummaries");
    //since they are the same labels concat and iterate over joined array
    var groups = groupLabels.concat(groupSummariesLabels);
    var containerPadding = parseInt($("mainTableContainer").getStyle("paddingLeft"));
    !isColsPresent && jQuery('tr.placeholder.member.labels').addClass('noColumn');

    spanWidth = isColsPresent ? $("canvasTable").getWidth() - containerPadding : AdHocTable.DEFAULT_GROUP_LABEL_OVERLAY_LEN;

    groups.each(function(object){
        var spanOverlay = designerBase.createDomObject("SPAN", "labelOverlay");
        spanOverlay.addClassName("group member label");

        spanOverlay.setStyle({
            'left' : ($(object).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0]) + "px",
            'top' : $(object).offsetTop + $("canvasTable").offsetTop + "px",
            'width' : spanWidth + "px"
        });

        var value = $(object).readAttribute("data-value");
        var label = $(object).readAttribute("data-label");
        spanOverlay.writeAttribute("data-index", $(object).readAttribute("data-index"));
        spanOverlay.writeAttribute("data-label", $(object).readAttribute("data-label"));
        spanOverlay.writeAttribute("data-fieldName", $(object).readAttribute("data-fieldName"));
        AdHocTable.groupLabelOverlays.push(spanOverlay);
        if(label.blank()){
            $(spanOverlay).innerHTML = "<span>" + label + "</span>" + value;
        }else{
            $(spanOverlay).innerHTML = "<span>" + label + " : </span>" + value;
        }

        adhocDesigner.overlayParent.appendChild(spanOverlay);
    });
}

AdHocTable.initSummaryOverlay = function(){
    designerBase.clearOverlaySet(AdHocTable.summaryOverlays);
    if ($("grandSummaryRow")) {
        var summaryCells = $("grandSummaryRow").cells;
        var count = summaryCells.length;

        for(var index = 0; index < count; index++){
            var summaryCell = summaryCells[index];
            var summaryCellIndex = $(summaryCell).cellIndex;

            var summaryOverlay = designerBase.createDomObject("DIV", "overlay summary button");
            summaryOverlay.writeAttribute("id", "grandSummaryOverlay_" + summaryCellIndex);
            summaryOverlay.writeAttribute("data-summaryIndex", summaryCellIndex);
            summaryOverlay.setStyle({
                'left': ($(summaryCell).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0])  + "px",
                'width': ($(summaryCell).offsetWidth - 2) + "px",
                'top' :  ($(summaryCell).offsetTop + $("canvasTable").offsetTop )+ "px",
                'height' : $(summaryCell).offsetHeight + "px"
            });
            AdHocTable.summaryOverlays[index] = summaryOverlay;
            adhocDesigner.overlayParent.appendChild(summaryOverlay);
        }
    }
}

