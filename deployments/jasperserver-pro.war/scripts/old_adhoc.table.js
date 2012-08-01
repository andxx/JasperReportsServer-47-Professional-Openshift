
/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var AdHocTable = function(){
    ///////////////////////////////////////////////////
    // Private variables...
    ///////////////////////////////////////////////////
    this.FETCH_MORE_ROWS = "fetchMoreRows";

    var ALMOST_IN_VIEW_OFFSET = 100;
    var groupTarget;
    var columnHeaderRow;
    var summaryRow;
    var fetchingRows = false;
    var existingRowCount;
    var theRows;
    var theCols;
    var lastRow;
    var groupOverlays = [];
    var columnResizers = [];
    var columnOverlays = [];
    var summaryOverlays = [];
    var groupLabelOverlays = [];
    var groupLabelFooterOverlays = [];
    var MINIMUM_COL_WIDTH = 0;
    var hoverColumn;
    var draggingColumnSizer = false;
    var draggingColumnOverlay = false;
    var draggingGroupOverlay = false;
    var draggingMoveOverColumnIndex = -1;
    var draggingMoveOverGroupIndex = -1;	
    var DEFAULT_GROUP_LABEL_OVERLAY_LEN = 200;
	var digitRegex = /\d+/;	

    ///////////////////////////////////////////////////////////////
    // 'Interface' methods must be supported by all modes  (Private)
    ///////////////////////////////////////////////////////////////
    /**
     * Get the current mode
     */
    this.getMode = function() {
        return designerBase.TABLE;
    };
    ///////////////////////////////////////////////////////////////
    // Initialization
    ///////////////////////////////////////////////////////////////
    /**
     * Called to init all major components
     */
    this.initAll = function() {
        adhocDesigner.initializer('table');
        if (this.getMode() == designerBase.TABLE) {
            oneTimeInit();
            initGlobals();
            initOverlays();
            adhocDesigner.render(true);
            if(adhocDesigner._touchController){
            	isIPad() && adhocDesigner._touchController.addPadding('canvasTable',{right:200});
            }   
        }
    };
    /**
     * Called once when we enter the table
     */
    function oneTimeInit(){
        columnHeaderRow = $("columnHeaderRow");
        tableSpecificEvents();
    }
    /**
     * Global variables
     */
    function initGlobals(){
        editor = null;
        titleCaption = $("titleCaption");
        canvasTable = $("canvasTable");
        updateState();
        designerBase.initAdhocSpecificDesignerBaseVar();
        theRows = canvasTable.rows;
        existingRowCount = theRows.length;
        if (localContext.inDesignView) {
            adhocDesigner.enableRunAndSave(canSaveReport());
            adhocDesigner.enableCanUndoRedo();
        }
        localContext.endOfFile = false;
        //drop zone init
        if(adhocDesigner.removeDroppables){
            adhocDesigner.removeDroppables();
        }
        if (localContext.inDesignView) {
            adhocDesigner.addDroppables();
        }
        //for full data view
        if (shouldFetchMoreRows()) {
            fetchMoreRows();
        }
        initRowDependentDimensions();

        if(localContext.columns.length == 0 && localContext.groups.length == 0){
            adhocDesigner.initNothingToDisplayPane();
        }
        designerBase.updateFlowKey();
    }
    /**
     * Used to init the all overlays
     */
    function initOverlays(){
    	//adhocDesigner.overlayParent = $("mainTableContainer");
        adhocDesigner.overlayParent = isSupportsTouch() ? $("mainTableContainer").down() : $("mainTableContainer");
        initColumnOverlays();
        initColumnResizers();
        initGroupLabelOverlays();
        initGroupOverlays();
        initSummaryOverlay();
    }

    function initRowDependentDimensions(){
        lastRow = theRows.length - 1;
        if (theRows[lastRow].id == "NoDataRow") {
            lastRow = lastRow - 1;
        }
        columnHeaderRow = $("columnHeaderRow");
        summaryRow = $("summaryRow");
    }

    /**
     * Used to add new rows to the table
     */
    function initNewRows(){
        localContext.endOfFile = $("endOfFileRow") || (existingRowCount == theRows.length);
        theRows = canvasTable.rows;
        window.status = "total rows = " + theRows.length;

        if (shouldFetchMoreRows()) {
            setTimeout("fetchMoreRows()", 100);
            return;
        }
        initRowDependentDimensions();
        initOverlays();
        existingRowCount = theRows.length;
        fetchingRows = false;
    }

    /**
     * Used to init all column overlays
     */
    function initColumnOverlays(){
        var columnHeaders = columnHeaderRow.cells;
        var count = columnHeaders.length;
        designerBase.clearOverlaySet(columnOverlays);

        for(var index = 0; index < count; index++){
            var columnHeader = columnHeaders[index];
            var columnOverlay = designerBase.createDomObject("DIV", "overlay col");
            columnOverlay.writeAttribute("id", "columnOverlay_" + index);
            //weird behavior in FF. Seems it does not take the caption height into consideration
            // extracted code to getTableTop() and getTableHeight() due to #21656
            //var tableTop = Prototype.Browser.Gecko ? ($("canvasTable").offsetTop + "px") : ($("canvasTable").offsetTop + $("titleCaption").getHeight() + "px");
            //var tableHeight = Prototype.Browser.Gecko ? ($("canvasTable").offsetHeight + "px") : ($("canvasTable").offsetHeight - $("titleCaption").getHeight() + "px");
            var tableTop = getTableTop();
            var tableHeight = getTableHeight();
            var columnLeft = ($(columnHeader).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0]) + "px";
            var columnWidth = columnHeader.offsetWidth + "px";

            columnOverlay.setStyle({
                'left': columnLeft,
                'width': columnWidth,
                'top' : tableTop,
                'height' : tableHeight
            });
            columnOverlays[index] = columnOverlay;
            adhocDesigner.overlayParent.appendChild(columnOverlay);
        }
    }

    function getTableTop() {
        var tableTop;
        var offsetTop = $("canvasTable").offsetTop;
        if (Prototype.Browser.Gecko || !$("titleCaption")) {
            tableTop = offsetTop + "px";
        } else {
            tableTop = offsetTop + $("titleCaption").getHeight() + "px";
        }
        return tableTop;
    }

    function getTableHeight() {
        var tableHeight;
        var offsetHeight = $("canvasTable").offsetHeight;
        if (Prototype.Browser.Gecko || !$("titleCaption")) {
            tableHeight = offsetHeight + "px";
        } else {
            tableHeight = offsetHeight - $("titleCaption").getHeight() + "px";
        }
        return tableHeight;
    }
    /**
     * Used to init a column group overlay
     */
    function initGroupOverlays(){
        var spanWidth;
        //purge all existing overlays
        designerBase.clearOverlaySet(groupOverlays);
        var rows = $$("tr.placeholder.member.labels");
        var numberOfGroups = localContext.groups.length;
        var columnHeaders = columnHeaderRow.cells;
        var count = columnHeaders.length;
        var isColsPresent = (count > 0);
        var containerPadding = parseInt($("mainTableContainer").getStyle("paddingLeft"));
//        if(Prototype.Browser.Gecko){ //Bug 21752
            spanWidth = isColsPresent ? $("canvasTable").getWidth() - containerPadding : DEFAULT_GROUP_LABEL_OVERLAY_LEN;
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
            groupOverlay.writeAttribute("id", "columnGroupOverlay_" + fieldName);
            groupOverlay.writeAttribute("data-fieldName", fieldName);
            groupOverlay.writeAttribute("data-dataType", object.readAttribute("data-type"));
            groupOverlay.writeAttribute("data-mask", object.readAttribute("data-mask"));
            groupOverlay.writeAttribute("data-index", object.readAttribute("data-index"));
            groupOverlay.writeAttribute("data-label", object.readAttribute("data-label"));
            groupOverlays.push(groupOverlay);
            adhocDesigner.overlayParent.appendChild(groupOverlay);
        });
    }
    /**
     * Used to init all group labels
     */
    function initGroupLabelOverlays(){
        var spanWidth;
        designerBase.clearOverlaySet(groupLabelOverlays);
        var columnHeaders = columnHeaderRow.cells;
        var count = columnHeaders.length;
        var isColsPresent = (count > 0);
        var groupLabels = $$("tr.placeholder.member.labels");
        var groupSummariesLabels = $$("tr.memberSummaries");
        //since they are the same labels concat and iterate over joined array
        var groups = groupLabels.concat(groupSummariesLabels);
        var containerPadding = parseInt($("mainTableContainer").getStyle("paddingLeft"));
//        if(Prototype.Browser.Gecko){ //Bug 21752
            spanWidth = isColsPresent ? $("canvasTable").getWidth() - containerPadding : DEFAULT_GROUP_LABEL_OVERLAY_LEN;
//        }else{
//            spanWidth = $("canvasTable").getWidth() - containerPadding;
//        }
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
            groupLabelOverlays.push(spanOverlay);
            if(label.blank()){
                $(spanOverlay).innerHTML = "<span>" + label + "</span>" + value;
            }else{
                $(spanOverlay).innerHTML = "<span>" + label + " : </span>" + value;
            }

            adhocDesigner.overlayParent.appendChild(spanOverlay);
        });
    }
    /**
     * Used to init all summary overlays
     */
    function initSummaryOverlay(){
        designerBase.clearOverlaySet(summaryOverlays);
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
                summaryOverlays[index] = summaryOverlay;
                adhocDesigner.overlayParent.appendChild(summaryOverlay);
            }
        }
    }
    /**
     * Used to init all column resizers
     */
    function initColumnResizers(){
        var miniHack = 3;
        var columnHeaders = columnHeaderRow.cells;
        designerBase.clearOverlaySet(columnResizers);

        for(var index = 0; index < columnHeaders.length; index++){
            var columnHeader = columnHeaders[index];
            var columnOverlaySizer = designerBase.createDomObject("DIV", "columnSizer");
            columnOverlaySizer.writeAttribute("id", "columnSizer_" + index);
            //weird behavior in FF. Seems it does not take the caption height into consideration
            // extracted code to getTableTop() and getTableHeight() due to #21656
            //var tableTop = Prototype.Browser.Gecko ? ($("canvasTable").offsetTop + "px") : ($("canvasTable").offsetTop + $("titleCaption").getHeight() + "px");
            //var tableHeight = Prototype.Browser.Gecko ? ($("canvasTable").offsetHeight + "px") : ($("canvasTable").offsetHeight - $("titleCaption").getHeight() + "px");
            var tableTop = getTableTop();
            var tableHeight = getTableHeight();
            var tempLeft = ($(columnHeader).cumulativeOffset()[0] - $("mainTableContainer").cumulativeOffset()[0] - miniHack);
            var columnLeft = tempLeft + columnHeader.offsetWidth + "px";

            columnOverlaySizer.setStyle({
                'left': columnLeft,
                'top' : tableTop,
                'height' : tableHeight
            });
            columnResizers[index] = columnOverlaySizer;
            adhocDesigner.overlayParent.appendChild(columnOverlaySizer);
        }
    }
    
    ///////////////////////////////////////////////////////////////
    // Tree customization
    ///////////////////////////////////////////////////////////////  
    
    this.customizeDimensionsTree = function(dimensionsTree) {
        dimensionsTree.dragClasses = 'dimension';
        dimensionsTree.setDragStartState = function(node, draggable, event){
            setDragStartState(dimensionsTree, node, draggable, event);
        };
    };

    this.customizeMeasuresTree = function(measuresTree) {
        measuresTree.dragClasses = 'measure';
        measuresTree.setDragStartState = setDragStartState.curry(measuresTree);
    };
    
    function setDragStartState(tree, node, draggable, event) {
        var pointer = [Event.pointerX(event), Event.pointerY(event)];
        var oldDraggable = draggable.element;
        var el = draggable.element = new Element('LI').update(oldDraggable.innerHTML);
        el.classNames().set(oldDraggable.classNames());
        
        el.writeAttribute('fieldname',adhocDesigner.getFieldName());
        el.setStyle({'z-index' : oldDraggable.getStyle('z-index')});
        el.hide();

        oldDraggable.parentNode.appendChild(el);
        Element.clonePosition(el, oldDraggable);
        Position.absolutize(el);
        oldDraggable.remove();

        dynamicTree.Tree.prototype.setDragStartState.apply(tree, Array.prototype.slice.call(arguments, 1));

        draggable.draw(pointer);
        el.show();
    }

    ///////////////////////////////////////////////////////////////
    // Event Handling
    ///////////////////////////////////////////////////////////////

    this.tableMouseOutHandler = function(evt){
        var overlayId;
        var overlayIndex;
        var element = evt.targetElement ? evt.targetElement : evt.element();
        
        //column overlay hovering
        var matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
        if(matched){
            element.removeClassName("over");
            //check to see if we are performing a mouse out whiles dragging a available field across the table canvas
            //if(Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA){ //Fix for bug 23850
                overlayId = element.identify();
                overlayIndex = parseInt(digitRegex.exec(overlayId)[0]);
                deactivateVisualDropCue(evt, overlayIndex);
                deactivateVisualDropCue(evt, overlayIndex - 1);
            //}
        }
        //summary or column groups
        matched = matchAny(element, [adhocDesigner.SUMMARY_OVERLAY_PATTERN, adhocDesigner.GROUP_OVERLAY_PATTERN], true);
        if(matched){
            element.removeClassName("over");
        }

        if (element.match('#designer .columnSizer')){
            theBody.style.cursor = "default";
            if (adhocDesigner.overlayDraggedColumn) {
                adhocDesigner.overlayDraggedColumn.destroy();
            }
        }
    };

    this.tableMouseOverHandler = function(evt){
        var element = evt.targetElement ? evt.targetElement : evt.element();

        var draggingCaresAboutGroups = Draggables.dragging == designerBase.GROUP_LEVEL;

        updateColumnWhileDrag(evt, element, function(overlayIndex, hoverGreaterThan50Percent) {
            deactivateVisualDropCue(evt, hoverGreaterThan50Percent ? overlayIndex - 1 : overlayIndex);
            activateVisualDropCue(evt, hoverGreaterThan50Percent ? overlayIndex : overlayIndex - 1);
        });
        
        if(Draggables.dragging != designerBase.AVAILABLE_FIELDS_AREA && !draggingColumnSizer) {
            matched = matchAny(element, [adhocDesigner.SUMMARY_OVERLAY_PATTERN, adhocDesigner.GROUP_OVERLAY_PATTERN,'th.label'], true);
            /*
             * Bug fix 25106 & 25198.
             */
            if(matched){    
            	var jo = jQuery(matched);
	            var ci = jo.attr('data-index');
	        	if(jo.get(0).tagName.toLowerCase() == 'th' && ci) {
	        		jQuery('#columnOverlay_' + ci).addClass('over');
	        	} else {
	        		matched.addClassName("over");
	        	}
        	}
            if (draggingCaresAboutGroups) {
                draggingMoveOverGroupIndex =
                    element.match(adhocDesigner.GROUP_OVERLAY_PATTERN) ? element.getAttribute('data-index') : -1;
            }
        }

        resizeColumnWhenSizerDrag(element); 
    };


    this.specificContextMenuHandler = function(event){
        if (localContext.getMode() == designerBase.TABLE) {
            var evt = event.memo.targetEvent;
            var element = evt.element();
            //column
            var matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
            if (matched) {
                var overlayId = element.identify();
				var overlayIndex = digitRegex.exec(overlayId)[0];
                var colHeader = _getTableHeaders()[overlayIndex];
                var headerObj = {};
                headerObj.header = colHeader;
                headerObj.index = overlayIndex;

                if (!designerBase.isInSelection(headerObj)) {
                    selectTableColumn(evt, headerObj);
                }
                showColumnMenu(evt);
            }
            //summary
            if (element.match(adhocDesigner.SUMMARY_OVERLAY_PATTERN)) {
                overlayId = element.identify();
                var summaryCells = $("grandSummaryRow").cells;
                var summaryCell = summaryCells[overlayIndex];

                if (!designerBase.isInSelection(summaryCell)) {
                    selectGrandRowCell(evt, digitRegex.exec(overlayId)[0]);
                }
                showSummaryMenu(evt);
            }
            //column group
            if (element.match(adhocDesigner.GROUP_OVERLAY_PATTERN)) {
                if (element) {               	
                    var groupObj = {
                        id : element.identify(),
                        fieldName : element.readAttribute("data-fieldName"),
                        mask : element.readAttribute("data-mask"),
                        dataType : element.readAttribute("data-dataType"),
                        index : element.readAttribute("data-index"),
                        label : element.readAttribute("data-label")
                    };
                    designerBase.unSelectAll();
                    selectGroup(evt, groupObj);
                    showGroupMenu(evt);
                }
            }
        }
    };

    /**
     * Event delegation for table mode
     */
    function tableSpecificEvents(){
    	var it = this;
        //init observer for draggable header
        //localContext.tableTouchMoveHandler && $('frame').observe("touchmove", localContext.tableTouchMoveHandler);
        $('frame').observe("mouseover", localContext.tableMouseOverHandler);
        $('frame').observe("mouseout", localContext.tableMouseOutHandler);
        $('frame').observe(isSupportsTouch() ? "touchend" : "mouseup" ,function(evt){
        	
			if(Draggables.dragging == designerBase.COLUMN_LEVEL || 
			   Draggables.dragging == designerBase.GROUP_LEVEL || TouchController.element_scrolled) {
				//re-ordering columns / groups
				return;
			}
			
            var element = isSupportsTouch() ? getTouchedElement(evt) : evt.element();
            var matched =  null;
            var overlayIndex = null;
            var overlayId = null;
            var regex =  null;

            /**
             * Fire this if we have just finished dragging. This also sets the position where the new field will be placed
             */
            //if(Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA){       
            if(Draggables.dragging == 'dimensionsTree' || Draggables.dragging == 'measuresTree'){       
                matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
                if(matched){
                    overlayId = element.identify();
                    overlayIndex = overlayIndex ? overlayIndex : digitRegex.exec(overlayId)[0];
                    isSupportsTouch() || (hoverColumn = overlayIndex);
                    deactivateVisualDropCue(evt, overlayIndex);
                    if(isHoverGreaterThan50Percent(evt, overlayIndex)){
                        hoverColumn++;
                    }
                }
                matched = matchAny(element, [adhocDesigner.COLUMN_SIZER_PATTERN], true);
                if(matched){
                    overlayId = element.identify();
                    overlayIndex = parseInt(digitRegex.exec(overlayId)[0]);
                    hoverColumn = overlayIndex + 1;
                    deactivateVisualDropCue(evt, overlayIndex);
                }
            }
            
            if(!isIPad() || !TouchController.element_scrolled){
            	/**
            	 * Column
            	 */
	            matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
	            if(matched && !isRightClick(evt)){
	                overlayId = element.identify();
					var overlayIndex = digitRegex.exec(overlayId)[0];
	                var colHeader = _getTableHeaders()[overlayIndex];
	                var headerObj = {};
	                headerObj.header = colHeader;
	                headerObj.index = overlayIndex;
	                selectTableColumn(evt, headerObj);
	            }	
	            /**
	             * Column groups
	             */
	            if(element.match(adhocDesigner.GROUP_OVERLAY_PATTERN) && !isRightClick(evt)){
	                if (element) {	                
	                    var groupObj = {
	                        id : element.identify(),
	                        fieldName : element.readAttribute("data-fieldName"),
	                        mask : element.readAttribute("data-mask"),
	                        dataType : element.readAttribute("data-dataType"),
	                        index : element.readAttribute("data-index"),
	                        label : element.readAttribute("data-label")
	                    };
	                    selectGroup(evt, groupObj);
	                }
	            }	
	            /**
	             * Summary
	             */
	            if(element.match(adhocDesigner.SUMMARY_OVERLAY_PATTERN) && !isRightClick(evt)){
	                overlayId = element.identify();
	                selectGrandRowCell(evt, digitRegex.exec(overlayId)[0]);
	            }
	            
	            if(it.clickid == element.identify()) {
	            	if(!evt.treeEvent && evt.timeStamp - it.clicktime < 700) document.fire(layoutModule.ELEMENT_CONTEXTMENU, { targetEvent: evt, node: element});
	            }
		        it.clicktime = evt.timeStamp;
		        it.clickid = element.identify();		        
            }
        });        
        /**
         * Capture context menu event
         */
        document.observe(layoutModule.ELEMENT_CONTEXTMENU, localContext.specificContextMenuHandler);
        /**
         * Capture key events
         */
        document.observe('key:up', function(event){
            if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
                //column
                var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
                var object = adhocDesigner.getSelectedColumnOrGroup();
                if (isNotNullORUndefined(object) && localContext.canMoveGroupUp()) {
                    moveGroupUp(function() {
                        object.index --;
                        selectGroup(evt, object);
                    });
                }
            }
        });
        document.observe('key:down', function(event){
            if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
                //column
                var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
                var object = adhocDesigner.getSelectedColumnOrGroup();
                if (isNotNullORUndefined(object) && localContext.canMoveGroupDown()) {
                    moveGroupDown(function() {
                        object.index ++;
                        selectGroup(evt, object);
                    });
                }
            }
        });
        document.observe('key:right', function(event){
            if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
                //column
                var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
                var object = adhocDesigner.getSelectedColumnOrGroup();
                if (object && localContext.canMoveColumnsRight()) {
                    moveColumnRight(function() {
                        object.index ++;
                        selectTableColumn(evt, object);
                    });
                }
            }
        });
        document.observe('key:left', function(event){
            if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
                //column
                var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
                var object = adhocDesigner.getSelectedColumnOrGroup();
                if (object && localContext.canMoveColumnsLeft()) {
                    moveColumnLeft(function() {
                        object.index --;
                        selectTableColumn(evt, object);
                    });
                }
            }
        });

        function cameFromDialog(event) {
            return event.target.up(".dialog") != undefined;
        }

        if(isIPad()) {

            $("frame").observe('gesturestart', function(evt) {
                var element = evt.element();
                var matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);

                if (matched && (evt.scale < 0.99 || evt.scale > 1.01)){
                    var overlayId = element.identify();
                    var overlayIndex = digitRegex.exec(overlayId)[0];
                    var sizer = $('columnSizer_' + overlayIndex);

                    localContext.resizedObject = {
                        sizer: sizer,
                        originalLeft: parseInt(sizer.getStyle("left"))
                    };

                    activateColumnSizer(sizer);
//                    console.log("gesturestart : " + evt.scale);
                }
            });

            $("frame").observe('gesturechange', function(evt) {
//                console.log("gesturechange : " + evt.scale);
                if(localContext.resizedObject) {

                    var left = Math.abs(localContext.resizedObject.originalLeft * evt.scale);

                    localContext.resizedObject.sizer.setStyle({
                        left : left + "px"
                    });
                }
            });

            $("frame").observe('gestureend', function(evt) {
                if(localContext.resizedObject) {
                    var sizerObject = localContext.resizedObject.sizer;
                    var id = $(sizerObject).readAttribute("id");

                    adhocDesigner.resizeColumn(sizerObject, designerBase.TABLE_SELECT_AREA, digitRegex.exec(id)[0]);

                    deactivateColumnSizer(sizerObject);

                    localContext.resizedObject = undefined;
                }
            });
        }
    }

    /**
     * Clear event listeners
     */

    this.removeObservers = function (){
         Event.stopObserving(document, layoutModule.ELEMENT_CONTEXTMENU,localContext.specificContextMenuHandler);
    };

    ///////////////////////////////////
    // DnD
    ///////////////////////////////////
    function updateColumnWhileDrag(evt, element, onHover) {
        //var draggingCaresAboutColumns = Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA || Draggables.dragging == designerBase.COLUMN_LEVEL;
        var draggingCaresAboutColumns = Draggables.dragging == 'dimensionsTree' || 
                                        Draggables.dragging == 'measuresTree' || 
                                        Draggables.dragging == designerBase.COLUMN_LEVEL;
        
        var overlayId;
        var overlayIndex;
        var overColumn = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN, adhocDesigner.COLUMN_SIZER_PATTERN]);
        if(overColumn){
            if (draggingCaresAboutColumns) {
                /*
                 * Show column sizer overlay to show position of new column
                 */
                overlayId = element.identify();
                overlayIndex = digitRegex.exec(overlayId)[0];
                draggingMoveOverColumnIndex = overlayIndex;
                var isHovered = true;
                /*
                 * Fix for bug 23850
                 */
                //if (Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA) {
                if(Draggables.dragging == 'dimensionsTree' || Draggables.dragging == 'measuresTree'){
                    isHovered = isHoverGreaterThan50Percent(evt, overlayIndex);
                }
                onHover(parseInt(overlayIndex), isHovered);

            } else if (!draggingColumnSizer && element.match(adhocDesigner.COLUMN_OVERLAY_PATTERN)) {
                element.addClassName("over");
            }
        }

        if (draggingCaresAboutColumns && !overColumn &&  !element.match(adhocDesigner.COLUMN_SIZER_PATTERN)) {
            draggingMoveOverColumnIndex = -1; //dragging outside columns
        }
    }

    function resizeColumnWhenSizerDrag(element) {
        if (element.match('#designer .columnSizer')){
            //change cursor type
            var elemId = element.readAttribute("id");
            theBody.style.cursor = "col-resize";
            //then we make draggable
            var selectionArea = designerBase.TABLE_SELECT_AREA;
            adhocDesigner.overlayDraggedColumn = new Draggable(elemId, {
                constraint: 'horizontal',
                onStart : function(){
                    draggingColumnSizer = true;
                    activateColumnSizer(elemId);
                },
                onEnd: function(obj, evt){
                    var draggableObject = obj.element;
                    var id = $(draggableObject).readAttribute("id");
                    deactivateColumnSizer(elemId);
                    adhocDesigner.resizeColumn(evt.element(), selectionArea, digitRegex.exec(id)[0]);
                    draggingColumnSizer = false;
                }
            });
        }
    }

    /*
     * Define droppables
     */
    adhocDesigner.addDroppables = function(){
        var dropOptions = {
            "filter-container" : {
                onDrop: function(){
                    adhocDesigner.addFilterViaDragNDrop();
                    adhocDesigner.unSelectAvailableTreeNodes();
                }
            },
            "mainTableContainer" : {
                onDrop: function(){
                    addFieldAsColumn(true);
                    adhocDesigner.unSelectAvailableTreeNodes();
                }
            },
            "canvasTableFrame" : {
                onDrop: function(){
                    addFieldAsColumn(true);
                    adhocDesigner.unSelectAvailableTreeNodes();
                }
            },
            "defaultValues": {
                //accept: "visibleFieldsTree"/*"wrap"*/,
                accept: ['draggable', 'wrap'],
                hoverclass: "dropTarget"
            }
        };

        var getValue = function(id, key){
            return dropOptions[id][key] || dropOptions.defaultValues[key];
        };

        for (var myId in dropOptions) {   	
            if ((myId !== "defaultValues") && dropOptions.hasOwnProperty(myId)) {
            	if(document.getElementById(myId)) {
                    Droppables.add(myId, {
                        accept: getValue(myId, "accept"),
                        hoverclass: getValue(myId, "hoverclass"),
                        onDrop: function(myId){
                            return function(){
                                this[myId].onDrop(null);
                            }.bind(dropOptions)
                        }(myId)
                    });	
            	}
            }
        }
        //used to remove droppable objects
        adhocDesigner.removeDroppables = function(){
            for (var myId in dropOptions) {
                Droppables.remove(myId);
            }
        }
    };

    ///////////////////////////////////////////////////////////////
    // Helper functions
    ///////////////////////////////////////////////////////////////

    /**
     * Used to update the state after ajax call
     */
    function updateState(){
        evaluateScript("tableState");
        adhocDesigner.updateBaseState();
        designerBase.updateSessionWarning();
    }

    function activateVisualDropCue(evt, index){
        var sizer = $("columnSizer_" + index);
        activateColumnSizer(sizer);
    }

    function deactivateVisualDropCue(evt, index){
        var sizer = $("columnSizer_" + index);
        deactivateColumnSizer(sizer);
    }
    /*
     * Temp function for now to simulate column mouse over
     */
    function activateColumnSizer(sizer){
        if(sizer){
            $(sizer).addClassName("over");
        }
    }
    /*
     * Temp function for now to simulate column mouse out
     */
    function deactivateColumnSizer(sizer){
        if(sizer){
            $(sizer).removeClassName("over");
        }
    }

    /**
     * Used to select a column
     * @param evt
     * @param headerObj
     */
    var selectTableColumn = this.selectTableColumn = function(evt, headerObj){  
        /*
         * deselect all rows and summaries
         */
        deselectAllSummaryCells();
        deselectAllColumnGroupRows();

        var isMultiSelect = adhocDesigner.isMultiSelect(evt, designerBase.COLUMN_LEVEL);
        var isSelected = adhocDesigner.isAlreadySelected(headerObj);
        
        var overlayIndex = headerObj.index;
        var overlayObject = "columnOverlay_" + overlayIndex;

        if (!$(overlayObject)) {
            initOverlays();
        }
        if(isSelected){
            if(isMultiSelect){
                if($(overlayObject)){
                    $(overlayObject).removeClassName("selected").removeClassName("over");
                    removeFromSelectObjects(overlayIndex);
                }
            }else{
            	!isIPad() && deselectAllTableColumns();
                $(overlayObject).addClassName("selected");
                adhocDesigner.addSelectedObject(evt, headerObj, isMultiSelect, isSelected);
                selectionCategory.area = designerBase.COLUMN_LEVEL;
                !isIPad() && createDraggableColumn($(overlayObject).identify());
                
            }
        }else{
            if(!isMultiSelect){
                columnOverlays.each(function(overlay){
                    $(overlay).removeClassName("selected").removeClassName("over");
                });
            }
            
            if($(overlayObject)){
                $(overlayObject).addClassName("selected");
            }
            adhocDesigner.addSelectedObject(evt, headerObj, isMultiSelect, isSelected);
            selectionCategory.area = designerBase.COLUMN_LEVEL;
            !isIPad() && createDraggableColumn($(overlayObject).identify());
        }
    }

    function createDraggableColumn(columnId){
        return new Draggable(columnId, {
            mouseOffset: true,
            scroll: 'mainTableContainer',

            onStart : function(obj, evt){
                if (!selObjects.length) {return}
				Draggables.dragging = designerBase.COLUMN_LEVEL;
				$(obj.element).addClassName(layoutModule.DRAGGING_CLASS);
                draggingColumnOverlay = true;
				var numberOfSelections = selObjects.length;
				$(obj.element).update((numberOfSelections-1) ? 
					numberOfSelections + " " + itemsSelectedSuffix : 
					selObjects[0].header.getAttribute("data-label"));
            },

            onEnd : function(obj, evt){
                Draggables.dragging = null;
                draggingColumnOverlay = false;
                var overlayId = $(obj.element).identify();
                var draggingIndex = digitRegex.exec(overlayId)[0];
                if (draggingMoveOverColumnIndex == -1) {
					removeColumn();
                }else if (draggingIndex != draggingMoveOverColumnIndex) {
					var indexFunction = draggingIndex < draggingMoveOverColumnIndex ? [].max : [].min;
					var fromIndex = indexFunction.call(selObjects, function(obj) {return obj.index});
                    moveColumnOnDrag(fromIndex, draggingMoveOverColumnIndex);
				} else {	
                    initOverlays(); //recreate dragged overlays
                }
                draggingMoveOverColumnIndex = -1;
            }
        });
    }

    function createDraggableGroup(groupId){
        return new Draggable(groupId, {
            constraint : 'vertical',
            ghosting: true,
            mouseOffset: true,

            onStart : function(obj, evt){
                if (!selObjects.length) {return}				
                Draggables.dragging = designerBase.GROUP_LEVEL;
				$(obj.element).addClassName(layoutModule.DRAGGING_CLASS);				
                draggingGroupOverlay = true;
				$(obj.element).update(selObjects[0].label);				
            },

            onEnd : function(obj, evt){
                Draggables.dragging = null;
                draggingGroupOverlay = false;
                var overlayIndex = selObjects[0].index;
                if (draggingMoveOverGroupIndex == -1) {
					removeGroup();
                }else if (overlayIndex != draggingMoveOverGroupIndex) {
                    moveGroup(overlayIndex, draggingMoveOverGroupIndex);
				} else {	
                    initOverlays(); //recreate dragged overlays
                }
                draggingMoveOverGroupIndex = -1;
            }
        });
    }

    function moveColumnOnDrag(overlayIndex, draggingMoveOverColumnIndex){
        moveColumn(overlayIndex, draggingMoveOverColumnIndex);
    }
	
    function moveGroupOnDrag(overlayIndex, draggingMoveOverGroupIndex){
        moveGroup(overlayIndex, draggingMoveOverGroupIndex);
    }	

    /**
     * Used to select a group
     * @param evt
     * @param rowObject
     */
    var selectGroup = this.selectGroup = function(evt, rowObject){
        var overlayId = rowObject.id;
        var overlayIndex  = rowObject.index;
        var isMultiSelect = adhocDesigner.isMultiSelect(evt, designerBase.GROUP_LEVEL);
        selectionCategory.area = designerBase.GROUP_LEVEL;
        var isSelected = adhocDesigner.isAlreadySelected(rowObject);
        
        if(isSelected){
            deselectAllColumnGroupRows();
            if($(overlayId)){
                $(overlayId).addClassName("selected");
            }
            adhocDesigner.addSelectedObject(evt, rowObject, isMultiSelect, isSelected);
        }else{
            deselectAllColumnGroupRows();
            deselectAllTableColumns();
            deselectAllSummaryCells();

            if($(overlayId)){
                $(overlayId).addClassName("selected");
                !isIPad() && createDraggableGroup(overlayId);
            }
            adhocDesigner.addSelectedObject(evt, rowObject, isMultiSelect, isSelected)
        }
    }

    /**
     * Used to select a single summary cell
     * @param evt
     * @param overlayIndex
     */
    function selectGrandRowCell(evt, overlayIndex){
        //deselect all table and rows
        deselectAllTableColumns();
        deselectAllColumnGroupRows();

        selectionCategory.area = designerBase.SUMMARY_LEVEL;
        var summaryCells = $("grandSummaryRow").cells;
        var cell = summaryCells[overlayIndex];
        var summaryCellOverlay = "grandSummaryOverlay_" + overlayIndex;

        var isSelected = adhocDesigner.isAlreadySelected(cell);

        if(!isSelected){
            deselectAllSummaryCells();
            if($(summaryCellOverlay)){
                $(summaryCellOverlay).addClassName("selected");
            }
            adhocDesigner.addSelectedObject(evt, cell, false, isSelected);
        }
    }

    /**
     * Used to deselect a table column
     * @param evt
     * @param overlayIndex
     */
    function deselectTableColumn(evt, overlayIndex){
        var headerObj = {};
        var overlayObject = "columnOverlay_" + overlayIndex;

        if($(overlayObject)){
            $(overlayObject).removeClassName("selected");
            $(overlayObject).removeClassName("over");
            headerObj.header = _getTableHeaders()[overlayIndex];
            headerObj.index = overlayIndex;
            removeFromSelectObjects(headerObj.index);
        }
    }

    /**
     * Used to remove a selected object using its overlay index
     * @param overlayIndex
     */
    function removeFromSelectObjects(overlayIndex){
    	var p;
        var foundObject;
        selObjects.each(function(object){
        	if(object.header){
                if(object.index == overlayIndex && object.header.tagName.toLowerCase() == 'th'){
                    foundObject = object;
                }	
        	}
        });
        selObjects = selObjects.without(foundObject);
    }

    /**
     * Used to deselect/deactivate all all overlays
     */
    var deselectAllSelectedOverlays = this.deselectAllSelectedOverlays = function(){
        deselectAllTableColumns();
        deselectAllSummaryCells();
        deselectAllColumnGroupRows();
    };


    /**
     * Used to select a column in table mode
     * @param evt
     * @param element
     */
    var deselectAllTableColumns = this.deselectAllTableColumns = function(){
        var headers = _getTableHeaders();
        var size = headers.length;
        for(var index = 0; index < size; index++){
            deselectTableColumn(null, index);
        }
    };

    /**
     * Used to deselect all grand summary cells
     */
    function deselectAllSummaryCells(){
        designerBase.deselectOverlaySet(summaryOverlays, "selected");
    }

    /**
     * Used to deselect all column group rows
     */
    function deselectAllColumnGroupRows(){
        designerBase.deselectOverlaySet(groupOverlays, "selected");
        designerBase.deselectOverlaySet(groupOverlays, "pressed");
        selObjects.each(function(object){
            if(object.fieldName){
            	 selObjects = selObjects.without(object);
            }
        });       
    }

    /**
     * This indicates if we have hovered across more that 50% of a cell.
     * @param evt the event object
     * @param index the index of the cell we are investigating
     */
    function isHoverGreaterThan50Percent(evt, index){
        var col = theCols[index];
        if(col){
            var width = 0;
            /**
             * //todo: show to Angus
             * I am putting this here so we can learn from it. I guess after i have shown it to Angus we can remove it.
             * The problem is for some reason, in webkit browsers, the colgroup objects do not respond to the .getWidth
             * or .offsetWidth. These simply return 0. To get around that, i simple go to the column headers and figure out
             * the width there. i think that is a good enough solution for all browsers but i did this simply for educational
             * purposes.
             */
            if(isWebKitEngine()){
                var header = _getTableHeaders()[index];
                width = header.getWidth();
                //for testing.
                col = header;
            }else{
                width = col.getWidth();
            }

            var offset = $(col).cumulativeOffset();
            var scrollOffset = col.cumulativeScrollOffset();
            var totalOffset = offset[0] + scrollOffset[0];
            var xPointer = evt.pointerX();
            var coveredCellSpace = xPointer - totalOffset;
            return (((coveredCellSpace / width) * 100) >= 50);
        }
        return false;
    }

    /**
     * Used to get the a columns resizer object
     * @param evt
     */
    function getSelectedResizer(evt){
        var element = evt.element();
        var id = $(element).readAttribute("id");
        return digitRegex.exec(id)[0];
    }

    /**
     * Used to calculate the new column width
     * @param evt
     */
    function getNewColumnWidth (element, index){
        var dragger = element;
        var headerCell = _getTableHeaders()[index];
        //left of dragger - left of cell == new width of cell/column
        var leftOfDragger =  $(dragger).cumulativeOffset()[0] + dragger.cumulativeScrollOffset()[0];
        var leftOfCellHeader = $(headerCell).cumulativeOffset()[0] + headerCell.cumulativeScrollOffset()[0];
        var newWidth = leftOfDragger - leftOfCellHeader;
        return Math.max(newWidth, MINIMUM_COL_WIDTH);
    }

    ///////////////////////////////////////////////////////////////
    // Conditional tests
    ///////////////////////////////////////////////////////////////

    var canSaveReport = this.canSaveReport = function(){
        if($("canvasTableCols")){
            theCols = $("canvasTableCols").getElementsByTagName("col");
            if(theCols){
                return (theCols.length > 0);
            }
        }
        return false;
    };
    /**
     * Used to test if we can add a column header
     */
    this.canAddColumnHeaderToSelected = function(){
        return selectedHasNoColumnHeader() && !adhocDesigner.hasSpacerInSelection();
    };


    /**
     * Used to test if we can edit a column header
     */
    this.canEditColumnHeaderForSelected = function(){
        return !selectedHasNoColumnHeader() && !adhocDesigner.hasSpacerInSelection();
    };


    this.canAddGroupLabelToSelected = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if (object) {
            var label = object.label;
            return label.blank();
        }
        return false;
    };


    this.canSwitchToGroup = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        return object && object.ftype === "dimension";
    };

    /**
     * Helper method to check if we have selected the spacer
     * @param fieldName
     */
    function isSpacer(fieldName){
        return fieldName == designerBase.SPACER_NAME;
    }


    /**
     * public - also used internally
     */
    var canAddAsGroup = this.canAddAsGroup = function() {
    	if(selObjects[0]){
    		if(selObjects[0].parent.treeId == 'measuresTree') return false;
    	}
        return !(adhocDesigner.hasSpacerInSelection() ||
                adhocDesigner.multiSelect ||
                adhocDesigner.isSelectedTreeNodeAFolder() ||
                adhocDesigner.isPercentOfParentCalcSelected());
    };

    this.canAddAsColumn = function() {
        //check if already added
        for(var i=0; i<selObjects.length; i++) {
            var fieldName = selObjects[i].param.id;
            var elements = jQuery('#olap_columns > li[fieldname="'+fieldName+'"]');
            if(elements.length > 0) return false;
        }

        return true;
    }

    /**
     * check to see if the selected object has be used in sorting.
     */
    var selectedFieldUsedForSorting =  this.selectedFieldUsedForSorting = function() {
        var selectedObject = designerBase.getSelectedObject();
        var fieldName = adhocDesigner.getNameForSelected(selectedObject);
        return usedInSorting(fieldName);
    };


    /**
     * Test to see if the field can be used for sorting.
     */
    var selectedFieldCouldBeUsedForSorting = this.selectedFieldCouldBeUsedForSorting = function() {
        return !(adhocDesigner.hasSpacerInSelection() ||
                adhocDesigner.hasGroupInSelection() ||
                selectedFieldUsedForSorting() ||
                designerBase.isSelectedNodeAFolder());
    };


    /**
     * Test to see if the column is being used for sorting
     */
    var selectedColumnUsedForSorting = this.selectedColumnUsedForSorting = function(){
        if(!localContext.inDesignView){
            return false;
        }
        return selObjects.any(function(column){
            return usedInSorting(column.header.readAttribute("data-fieldName"));
        });
    };


    this.selectedColumnCouldBeUsedForSorting = function(){
        if(!localContext.inDesignView){
            return false;
        }
        return !selectedColumnUsedForSorting() && !adhocDesigner.hasSpacerInSelection();
    };


    /**
     * Test to see if we can add a summary to the selected column
     */
    this.selectedColumnCanAddSummary = function(){
        return !adhocDesigner.hasSpacerInSelection() && !selectedColumnHasSummary();
    };


    /**
     * Test to see if we can add a column mask
     */
    this.canColumnSetMask = function() {
        return (getSelectedColumnType() != adhocDesigner.NaN);
    };

    /**
     * Check to see if the column type is equal to the type passed
     */
    var isSelectedColumnType = this.isSelectedColumnType = function(type){
        return getSelectedColumnType() == type;
    };


    var isSelectedMeasureNumeric = this.isSelectedMeasureNumeric = function(){
        return isSelectedColumnType("int") || isSelectedColumnType("dec");
    };



    /**
     * Used to get the current mask for the selected column
     */
    var getMaskForSelectedColumn = this.getMaskForSelectedColumn = function(){
        return adhocDesigner.getSelectedColumnOrGroup().header.getAttribute("data-mask");
    };


    var getMaskForSelectedGroup = this.getMaskForSelectedGroup = function(){
        if(selectionCategory.area === designerBase.GROUP_LEVEL){
            if(selObjects.length > 0){
                var object = selObjects[0];
                return object.mask;
            }
        }
        return null;
    };

    /**
     * Test to see if the selected mask is equal to the mask passed
     * @param mask
     */
    this.isColumnMaskSelected = function(mask){
        return getMaskForSelectedColumn() === mask.unescapeHTML();
    };


    this.isGroupMaskSelected = function(mask){
        return getMaskForSelectedGroup() == mask.unescapeHTML();
    };

    this.canGroupSetMask = function(){
        return getSelectedGroupType() != adhocDesigner.NaN;
    };


    /**
     * Used to test if the column has a selected summary
     */
    var selectedColumnHasSummary = this.selectedColumnHasSummary = function(){
        if(selObjects.length != 1){
            return false;
        }else{
            var selectedObject = designerBase.getSelectedObject();
            var fieldName = null;
            if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
                var overlayId = selectedObject.identify();
                var colHeader = _getTableHeaders()[digitRegex.exec(overlayId)[0]];
                fieldName = colHeader.readAttribute("data-fieldName");
            }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
                fieldName = selectedObject.header.readAttribute("data-fieldName");
            }else{
                return false;
            }
            var index = localContext.summarizedFields.indexOf(fieldName);
            return (index >= 0);
        }
    };


    this.isSelectedSummaryFunction = function(thisFunction){
        var cell = getSelectedSummaryCell();
        if(cell){
            return $(cell).readAttribute("data-name") === thisFunction;
        }else{
            return false;
        }
    };


    this.isSelectedGroupType = function(type){
        return getSelectedGroupType() === type;
    };


    function getSelectedGroupType(){
        if(selectionCategory.area === designerBase.GROUP_LEVEL){
            if(selObjects.length > 0){
                var object = selObjects[0];
                return object.dataType;
            }
        }
        return adhocDesigner.NaN;
    }


    this.selectedColumnShowsSummaryOptions = function(){
        return selectedColumnHasSummary() && selectedMeasureShowsSummaryOptions();
    };

    function selectedMeasureShowsSummaryOptions(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if(object){
            var summaryIndex = $(object).readAttribute("data-summaryIndex");
            var name = localContext.columns[parseInt(summaryIndex)];
            return !adhocDesigner.isPercentOfParentCalc(name);
        }
        return false;
    }

    this.functionSelected = function(thisFunction){
        if(selObjects.length > 0){
            var selectedObject = designerBase.getSelectedObject();
            var index = null;

            if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
                var overlayId = selectedObject.identify();
                index = digitRegex.exec(overlayId)[0];
            } else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
                index = selectedObject.index;
            }
            setSummaryFunction(thisFunction, index);
        }
    };

    /**
     * Test to see if we can move the column left
     */
    this.canMoveColumnsLeft = function(){
        return getLeftMostPositionFromSelectedColumns() > 0;
    };

    /**
     * Used to test if we can move the column right
     */
    this.canMoveColumnsRight = function(){
        return getRightMostPositionFromSelectedColumns() < (_getTableHeaders().length - 1);
    };

    this.canMoveGroupUp = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        return object && (object.index) > 0;
    };

    /**
     * public
     */
    this.canMoveGroupDown = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var numberOfGroups = localContext.groups.length;
        return object && (object.index) < (numberOfGroups - 1);
    };

    /**
     * Test to see if we can add the field as a column
     * @param fieldName
     */
    var canAddFieldAsColumn = this.canAddFieldAsColumn = function(fieldName) {
        if (isSpacer(fieldName)) {         //spacers are always welcome
            return true;
        }
        //field already exists?
        for (var i = 0; i < localContext.columns.length; i++) {
            if (localContext.columns[i] == fieldName) {
                return false;
            }
        }
        return true;
    }

    /**
     * Test to see if we are currently getting more rows
     */
    function isFetchingRows() {
        return fetchingRows;
    }

    /**
     * Test to see if we are fetching more rows
     */
    function shouldFetchMoreRows() {
        return ((hasColumns() || hasGroups())
                && (localContext.isShowingFullData && !localContext.endOfFile)
                && (theRows.length < ROW_SIZE_TO_TRIGGER_SCROLLBAR));
    }

    /**
     * Test to see if we have any columns on the table
     */
    function hasColumns(){
        var hasCols = false;
        theCols = $("canvasTableCols").getElementsByTagName("col");
        if(theCols){
            hasCols = (theCols.length > 0);
        }
        return hasCols;
    }

    /**
     * Test to see if we have any groups on the table.
     */
    function hasGroups(){
        return localContext.groups.length > 0;
    }
    
    /**
     * Used to test if a field is being used in sorting.
     * @param fieldName
     */
    function usedInSorting(fieldName){
        if (localContext.sortFields != null) {
            var sfs = localContext.sortFields;
            for (var i = 0; i < sfs.length; i++) {
                if (sfs[i].name == fieldName) {
                    return true;
                }
            }
        }
        return false;
    }
    
    ///////////////////////////////////////////////////////////////
    // Table actions
    ///////////////////////////////////////////////////////////////

    /**
     * Used to show a menu
     * @param evt
     */
    function showColumnMenu(evt){
        adhocDesigner.showDynamicMenu(evt, designerBase.COLUMN_LEVEL);
    }

    function showSummaryMenu(evt){
        adhocDesigner.showDynamicMenu(evt, designerBase.SUMMARY_LEVEL);
    }

    function showGroupMenu(evt){
        adhocDesigner.showDynamicMenu(evt, designerBase.GROUP_LEVEL);
    }
    /**
     * Add a field from the available tree to the canvas.
     */
    var addFieldAsColumn = this.addFieldAsColumn = function(includeSubSets){
        var selectedNodes = adhocDesigner.getSelectedTreeNodes();

        var fieldList = adhocDesigner.collectFields(selectedNodes, includeSubSets, canAddFieldAsColumn).join(",");
        var position = (hoverColumn > -1) ? hoverColumn : columnHeaderRow.cells.length;
        
        addFieldAsColumnAtPosition(fieldList, position);
    };

    var addThisFieldAsColumn = this.addThisFieldAsColumn = function(fieldName){
        var position = columnHeaderRow.cells.length;
        addFieldAsColumnAtPosition(fieldName, position);
    };

    /**
     * Used to remove a column header
     */
    this.removeColumnHeaderRequest = function(){
        var column = adhocDesigner.getSelectedColumnOrGroup();
        if(column){
            setColumnHeaderToNull(column.index);
        }
    };

    /**
     * Used to set the column mask
     * @param theMask
     */
    this.columnMaskSelected = function(theMask){
        var column = adhocDesigner.getSelectedColumnOrGroup();
        if(column){
            setMask(theMask, column.index);
        }
    };

    this.groupMaskSelected = function(theMask){
        var group = adhocDesigner.getSelectedColumnOrGroup();
        var index = group.index;
        if(group){
            setGroupMask(theMask, index);
        }
    };

    /**
     * Used to test if the current column has no header
     */
    function selectedHasNoColumnHeader(){
        var headerObj = adhocDesigner.getSelectedColumnOrGroup();
        return (headerObj.header.hasClassName("deletedHeader"));
    }

    /**
     * Used to get all table headers
     */
    var _getTableHeaders = this._getTableHeaders = function(){
        return $$("tr#columnHeaderRow.labels.column th.label");
    }

    /**
     * Used to edit group label
     */
    var editGroupLabel = this.editGroupLabel = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if(object){
            var groupIndex = object.index;
            var span = $$(adhocDesigner.GROUP_LABEL_SPAN_PATTERN)[groupIndex];
            adhocDesigner.editDataHeader(span.down(), "tableGroup");
        } else {
        	alert('Warning: no object selected.');
        }
    };

    /**
     * Used to remove group label.
     */
    var removeGroupLabel = this.removeGroupLabel = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if (object) {
            var groupIndex = object.index;
            setGroupLabelToNull(groupIndex);
        }
    };

    function getSelectedSummaryCell(){
        if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
            return selObjects[0];
        }else{
            return null;
        }

    }

    /**
     * Used to get the datatype for the column
     */
    function getSelectedColumnType(){
        if(selObjects.length != 0){
            var object = adhocDesigner.getSelectedColumnOrGroup();
            if(selectionCategory.area === designerBase.SUMMARY_LEVEL){
                var overlayId = object.identify();
                var colHeader = _getTableHeaders()[digitRegex.exec(overlayId)[0]];
                return  colHeader.readAttribute("data-type");
            }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
                return  object.header.readAttribute("data-type");
            }else{
                return adhocDesigner.NaN;
            }
        }else{
            return adhocDesigner.NaN;
        }
    }

    /**
     * Used to get the left position of the selected object
     */
    function getLeftMostPositionFromSelectedColumns(){
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
    }

    /**
     * Used to get the right most position of the selected column
     */
    function getRightMostPositionFromSelectedColumns(){
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
    }

    /**
     * Used to move a column left
     */
    var moveColumnLeft = this.moveColumnLeft = function(customCallback) {
        var fromIndex = getLeftMostPositionFromSelectedColumns();
        var toIndex = fromIndex - 1;
        moveColumn(fromIndex, toIndex, customCallback);
    };

    /**
     * Used to move a column right
     */
    var moveColumnRight = this.moveColumnRight = function(customCallback) {
        var fromIndex = getLeftMostPositionFromSelectedColumns();
        var toIndex = fromIndex + 1;
        moveColumn(fromIndex, toIndex, customCallback);
    };

    /**
     * Used to launch sorting dialog
     * @param event
     */
    this.launchSortingDialogForColumn = function(event){
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
    
    var switchToGroup = this.switchToGroup = function(f,i,j){
    	var ec;
    	if(f){
    		ec = function(f,i){
    			return function(){addFieldAsGroup(f,i)};
    		}(f,i);
    		removeColumn(j,ec);
    	} else {   	
    		if(selObjects[0]) {
        		var ftype = selObjects[0].ftype;
        		if(ftype == 'dimension'){
            		var fname = jQuery(selObjects[0].header).attr('data-fieldname');
            		ec = function(f,i){
            			return function(){addFieldAsGroup(f,i)};
            		}(fname,-1); 
            		removeColumn(selObjects[0].index,ec);	
        		}
    		} else{
    			alert('Error: no object selected.');
    		}
    	}
    }
    
    var switchToColumn = this.switchToColumn = function(f,i,j){
    	var ec;
    	if(f){
    		ec = function(f,i){
    			return function(){addFieldAsColumnAtPosition(f,i)};
    		}(f,i);
    		removeGroup(j,ec);
    	}  else {
    		ec = function(f,i){
    			return function(){addFieldAsColumnAtPosition(f,i)};
    		}(selObjects[0].fieldName,columnHeaderRow.cells.length);
    		removeGroup(selObjects[0].index,ec);    		
    	}
    }

    ///////////////////////////////////////////////////////////////
    // Ajax calls
    ///////////////////////////////////////////////////////////////
    /**
     * Used to add a field as a group
     */
    var addFieldAsGroup = this.addFieldAsGroup = function(_fieldname,_index) {
    	var index = (typeof _index === 'number') ? _index : -1;
    	if(index > localContext.groups.length) index = localContext.groups.length;

        var callback = function(){
            localContext.standardTableOpCallback();
        };

        var fieldName = null;
        if(typeof _fieldname == 'object' && _fieldname.length > 0) {
            fieldName = _fieldname.join(',');
        } else {
            fieldName = _fieldname ? _fieldname : adhocDesigner.collectFields(adhocDesigner.getSelectedTreeNodes(), true).join(",");
        }
        if(fieldName!==null) {
            designerBase.sendRequest("ta_insertGroup",
                new Array("f=" + encodeText(fieldName), "i=" + index),
                callback, {});
        }
    };

    /**
     * Add a field at a specific location.
     * @param fieldName
     * @param position
     */
    var addFieldAsColumnAtPosition = this.addFieldAsColumnAtPosition = function(fieldName, position){
        if (!canAddFieldAsColumn(fieldName)) {
            return;
        }
        designerBase.visuallyDeselectAllTreeNodes();
        var isNoDataBefore = adhocDesigner.isNoDataToDisplay();
        var callback = function(){
            hoverColumn = -1;
            localContext.standardTableOpCallback();
            if (isNoDataBefore && !adhocDesigner.isNoDataToDisplay()){
                adhocDesigner.checkMaxRowsLimit();
            }
        };
        designerBase.sendRequest("ta_insertColumn", new Array("f=" + encodeText(fieldName), "i=" + position), callback, {"bPost" : true});
    }

    /**
     * Used to resize a table column
     */
    var tableColumnResize = this.tableColumnResize = function(sizerElement, index){
        var newWidth = getNewColumnWidth(sizerElement, index);
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_resizeColumn", new Array("i=" + index, "w=" + newWidth), callback, null);
    };

    var moveGroupUp = this.moveGroupUp = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if (object) {
            var fromGroup = parseInt(object.index);
            var toGroup = fromGroup - 1;
            moveGroup(fromGroup, toGroup, customCallback);
        }
    };

    var moveGroupDown = this.moveGroupDown = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if (object) {
            var fromGroup = parseInt(object.index);
            var toGroup = fromGroup + 1;
            moveGroup(fromGroup, toGroup, customCallback);
        }
    };

    var removeGroup = this.removeGroup = function(_index,callback_override){
    	var index = parseInt(_index);
    	var object;
        var callback = function(){
        	callback_override ? callback_override() : localContext.standardTableOpCallback();
        };
    	if(!isNaN(index)) {
    		designerBase.sendRequest("ta_removeGroup",new Array("i=" + index), callback, null);
    	} else {
            object = adhocDesigner.getSelectedColumnOrGroup();
            if(object){
                index = object.index;
                designerBase.sendRequest("ta_removeGroup",new Array("i=" + index), callback, null);
            }    		
    	}
    };

    var moveGroup = this.moveGroup = function(fromGroup, toGroup, customCallback){
        var callback = function(){
            localContext.standardTableOpCallback();
            customCallback && customCallback();
        };
        designerBase.sendRequest("ta_moveGroup", new Array("i1=" + (fromGroup), "i2=" + (toGroup)), callback, null);
    }

    var updateGroupLabel =  this.updateGroupLabel = function(label, groupIndex){
        if (!label || label.blank()) {
            setGroupLabelToNull(groupIndex);
            return;
        }
        var callback = function() {
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_setGroupLabel", new Array("g=" + groupIndex, "l=" + encodeText(label)), callback, null);
    };

    var setGroupLabelToNull = this.setGroupLabelToNull = function(groupIndex){
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_setGroupLabel", new Array("g=" + groupIndex, "l=_null"), callback, null);
    };

    /**
     * Used to move a column
     * @param fromIndex
     * @param toIndex
     */
    var moveColumn = this.moveColumn = function(fromIndex, toIndex, customCallback, single){
    	var indices;
        var indexes = [];
        var offset = (toIndex - fromIndex);
        if(single) {
        	indices = fromIndex;
        } else{
            for (var index = 0; index < selObjects.length; index++) {
                var headerObj = selObjects[index];
                indexes.push(headerObj.index);
            }        	
            indices = indexes.join(",");
        }
        var callback = function(){
        	customCallback && customCallback();
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_moveColumn", new Array("indexes=" + indices, "offset=" + offset), callback, null);
    }

    /**
     * Used to remove a column for the canvas
     */
    var removeColumn = this.removeColumn = function(_index,callback_override) {
    	var indices;
    	if(typeof _index === 'number'){
    		indices = _index;
    	} else {
            var indexes = [];
            for(var index = 0; index < selObjects.length; index++){
                var headerObj = selObjects[index];
                indexes.push(headerObj.index);
            }
            indices = indexes.join(',');
    	}
        var callback = function(){           
        	callback_override ? callback_override() : localContext.standardTableOpCallback();;
        };
        designerBase.sendRequest("ta_removeColumn",new Array("indexes=" + indices), callback, null);
    };

    /**
     * Used to set a column header to null
     * @param colIndex
     */
    function setColumnHeaderToNull(colIndex){
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_setColumnHeader", new Array("i=" + colIndex, "l=_null", "w=-1"), callback, null);
    }

    /**
     * Used to update a column header
     */
    var updateColumnHeaderRequest =  this.updateColumnHeaderRequest = function(text, index, width){
        var callback = function() {
            localContext.standardTableOpCallback();
        };
        if (text.length == 0) {
            localContext.removeColumnHeaderRequest();
        } else {
            designerBase.sendRequest("ta_setColumnHeader", new Array("i=" + index, "l=" + encodeText(text), "w=" + width), callback, null);
        }

    };

    /**
     * Used to update a calculated field and the canvas view
     */
    var updateCalcFieldAndView = this.updateCalcFieldAndView = function(fieldName, formulaId, argList){
        var callback = function(){
            localContext.updateCustomFieldCallback();
            localContext.standardOpCallback();
            adhocDesigner.updateAllFieldLabels();
            if(adhocDesigner.isInUse(fieldName)){
                designerBase.sendRequest("co_generateFilterPanel", new Array("decorate=no"), null, {"target" : "filter-container"});
            }
        };
        designerBase.sendRequest("co_updateFieldAndView", new Array("fieldName=" + encodeText(fieldName), "formula=" + formulaId, "args=" + argList), callback, null);
    };

    /**
     * Used to send the mask request to the server
     * @param thisMask
     * @param colIndex
     */
    function setMask(thisMask, colIndex){
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_setColumnMask", new Array("m=" + encodeText(thisMask), "i=" + colIndex), callback, null);
    }

    function setGroupMask(thisMask, grIndex){
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_setGroupMask", new Array("m=" + encodeText(thisMask), "i=" + grIndex), callback, null);
    }

    var toggleTableDetails = this.toggleTableDetails = function(){
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest('ta_toggleDetails', new Array(), callback, null);
    };

    this.addDefaultColumnSummary = function(){
        var summaryFunction;
        var selectedColumnIndex = null;
        var object = adhocDesigner.getSelectedColumnOrGroup();

        if (object) {
            if (selectionCategory.area === designerBase.SUMMARY_LEVEL) {
                var overlayId = object.identify();
                selectedColumnIndex = digitRegex.exec(overlayId)[0];
            } else if (selectionCategory.area === designerBase.COLUMN_LEVEL) {
                selectedColumnIndex = object.index;
            }

            if (isSelectedMeasureNumeric(columnHeaderRow.cells[adhocDesigner.getSelectedColumnOrGroup()])) {
                summaryFunction = adhocDesigner.DEFAULT_SUMMARY_NUM_FUNC;
            }
            else {
                summaryFunction = adhocDesigner.DEFAULT_SUMMARY_NONNUM_FUNC;
            }
            var callback = function() {
                localContext.standardTableOpCallback();
            };
            designerBase.sendRequest("ta_setColumnSummaryFunction", new Array("f=" + summaryFunction, "sf=" + "_schema", "i=" + selectedColumnIndex), callback, null);
        }
    };

    this.removeColumnSummary = function(){
        var index = null;
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if (object) {
            if (selectionCategory.area === designerBase.SUMMARY_LEVEL) {
                var overlayId = object.identify();
                index = digitRegex.exec(overlayId)[0];
            } else if (selectionCategory.area === designerBase.COLUMN_LEVEL) {
                index = object.index;
            }
            var callback = function() {
                localContext.standardTableOpCallback();

            };
            designerBase.sendRequest("ta_setColumnSummaryFunction",  new Array("f=_null", "i=" + index), callback, null);
        }
    };

    function setSummaryFunction(thisFunction, colIndex){
        var callback = function(){
            localContext.standardTableOpCallback();
        };
        designerBase.sendRequest("ta_setColumnSummaryFunction", new Array("f=" + thisFunction, "i=" + colIndex), callback, null);
    }

    /**
     * Used to execute fetching more rows
     */
    function fetchMoreRows(){
        fetchingRows = true;
        var callback = function(){
            initNewRows();
        };
        var extra = {'target' : "canvasTable", 'mode' : AjaxRequester.prototype.ROW_COPY_UPDATE};
        designerBase.sendRequest("ta_" + localContext.FETCH_MORE_ROWS, [], callback, extra);
    }

    /**
     * Test to fetch more rows
     */
    this.tableScrolled = function() {
        if ((localContext.getMode() === designerBase.TABLE) && localContext.isShowingFullData
                && !localContext.endOfFile  && !isFetchingRows()) {

            var scrolledToBottom = isIPad() ?
                adhocDesigner._touchController.isBottom() : isAlmostInView(theRows[lastRow],ALMOST_IN_VIEW_OFFSET);
            scrolledToBottom && fetchMoreRows();
        }
    };

    ///////////////////////////////////////////////////////////////
    // Ajax callbacks
    ///////////////////////////////////////////////////////////////
    /**
     * Standard callback
     */
    this.standardOpCallback = function() {
        localContext.standardTableOpCallback();
        adhocDesigner.comp.display_manager.update();
    };
    /**
     * Custom field callback
     */
    this.updateCustomFieldCallback = function() {
        this.standardTableOpCallback();
    };
    /**
     * pivot callback
     */
    this.getCallbacksForPivot = function(){
        localContext.standardOpCallback();
    };
    /**
     * Standard table callback
     */
    this.standardTableOpCallback = function() {
        initGlobals();
        initOverlays();
        designerBase.visuallyDeselectAllTreeNodes();
        deselectAllTableColumns();
        deselectAllColumnGroupRows();
        adhocDesigner.render();
        if(localContext.inDesignView) {
            adhocDesigner.updateAllFieldLabels();
        }
        //designerBase.updateMainOverlay('hidden');
        isIPad() && adhocDesigner._touchController.addPadding('canvasTable',{right:200});
    };

    this.reInitOverlayCallback = function(){
        initOverlays();
    };
};

///////////////////////////////////////////////////
// Finally initialize (this code must come last)
///////////////////////////////////////////////////
localContext = new AdHocTable();
designerBase.superInitAll();
