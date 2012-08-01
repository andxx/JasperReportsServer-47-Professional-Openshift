/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var AdHocChart = function() {
    ///////////////////////////////////////////
    //private constants
    ///////////////////////////////////////////
    this.currentlyDragging = false;
    this.currentlyDraggingLegend = false;
    this.dragginInLegendArea = false;
    this.containerMovePosition = {x : 0, y : 0};
    this.draggableLegend = null;
    this.currentLegendIndex = null;
    this.documentEventSet = null;

    var groupTarget;
    var CHART_ID = "chart";
    var CHART_IMAGE_ID = "chart-image";
    var NO_CHART_DATA = false;
    var BAR_CHART = "1_bar";
    var PIE_CHART = "2_pie";
    var LINE_CHART = "3_line";
    var AREA_CHART = "4_area";
    var SCATTER_CHART = "5_scatter";
    var TIME_SERIES_CHART = "6_timeSeries";
    var CHART_CANVAS_PATTERN = "table#canvasTable tbody td#chart";
    var draggableChart = null;
    var DRAGGABLE_PAPER_SIZE = "content";
    var CONTENT_PAGE_SIZE = "content";
    var legendOverlays = [];
    var CHART_DRAGGER_PATTERN = "div#dragger.sizer";
    var MAX_DRAGGABLE_LEGEND_DELTA = 25; //this is a terrible name.. i am sorry...
    var MIN_CHART_WIDTH = 50;
    var MIN_CHART_HEIGHT = 50;
    var ZOOM_FACTOR = 15;
    var hoverLegendIndex;

    ///////////////////////////////////////////////////////////////
    // 'Interface' methods must be supported by all modes  (Private)
    ///////////////////////////////////////////////////////////////
    this.getMode = function() {
        return designerBase.CHART;
    };

    ///////////////////////////////////////////////////////////////
    // Initialization
    ///////////////////////////////////////////////////////////////
    this.initAll = function() {
        adhocDesigner.initializer('chart');
        if (this.getMode() == designerBase.CHART) {
            oneTimeInit();
            initGlobals();
            initOverlays();
            adhocDesigner.render(true);
        }
    };


    /**
     * called whenever we switch to chart state
     */
    function oneTimeInit(){
        updateConstantState();
    }

    /**
     * setup for all global variables and events
     */
    function initGlobals(){
        editor = null;
        titleCaption = $("titleCaption");
        canvasTable = $("canvasTable");
        updateState();
        NO_CHART_DATA = $('NoDataRow');
        if(localContext.inDesignView){
            adhocDesigner.enableRunAndSave(canSaveReport());
            adhocDesigner.enableCanUndoRedo();
        }
        designerBase.setState();
        designerBase.initAdhocSpecificDesignerBaseVar();

        if(adhocDesigner.removeDroppables){
            adhocDesigner.removeDroppables();
        }
        if (localContext.inDesignView) {
            adhocDesigner.addDroppables();
        }
        chartSpecificEvents();
    }

    /**
     * Creation of legend overlays
     */
    function initOverlays(){
        adhocDesigner.overlayParent = $("chartBorder");
        if ($("chartBorder")) {
            initLegendOverlays();
        }
        document.getElementById('dragger').style.height = 50 + 'px';
        document.getElementById('dragger').style.width = 50 + 'px';
    }

    /**
     * Updating server based variables
     */
    function updateState(){
        evaluateScript('chartState');
        adhocDesigner.updateBaseState();
        designerBase.updateSessionWarning();
    }

    /**
     * Update of constant variables from server
     */
    function updateConstantState(){
        evaluateScript("chartConstantState");
    }

    /**
     * Creating of overlays
     */
    function initLegendOverlays(){
        designerBase.clearOverlaySet(legendOverlays);
        if (localContext.displayLegend && localContext.legendItems) {
            localContext.legendItems.each(function(legend, index) {
                var legendOverlay = designerBase.createDomObject("DIV", "overlay legend button");

                legendOverlay.setStyle({
                    //'left'   : legend.left - $(adhocDesigner.CANVAS_PARENT_ID).cumulativeScrollOffset()[0] + "px",
                    //'top'    : legend.top - $(adhocDesigner.CANVAS_PARENT_ID).cumulativeScrollOffset()[1] + "px",
                	'left'   : legend.left + 'px',
                	'top'    : legend.top + 'px',
                    'width'  : legend.width + "px",
                    'height' : legend.height + "px"
                });
                var legendName = localContext.measureNames[index];
                legendOverlay.writeAttribute("id", "legendOverlay_" + index);
                legendOverlay.writeAttribute("data-legendName", legendName);
                legendOverlay.writeAttribute("data-defaultName", legend.defaultName);
                legendOverlay.writeAttribute("data-userName", legend.userName);
                legendOverlay.writeAttribute("data-index", index);
                legendOverlays.push(legendOverlay);
                adhocDesigner.overlayParent.appendChild(legendOverlay);
            }.bind(this));
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

    this.specificContextMenuHandler = function(event,node) {
        if (localContext.getMode() == designerBase.CHART) {
            var proceed = true;            
            var evt = event.memo.targetEvent;
            var element = evt.element();

            var matched = matchAny(element, [CHART_CANVAS_PATTERN, adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
            if (matched) {
                var selectedObject = null;
                if (matched.hasClassName("legend")) {
                    var legendName = matched.readAttribute("data-legendName");
                    if (legendName !== "data-legendName") {
                        selectedObject = {
                            id : matched.identify(),
                            legendName : legendName,
                            index : matched.readAttribute("data-index"),
                            defaultName : matched.readAttribute("data-defaultName"),
                            userName : matched.readAttribute("data-userName")
                        };
                        selectionCategory.area = designerBase.LEGEND_MENU_LEVEL;
                    } else {
                        proceed = false;
                    }
                } else {
                    selectionCategory.area = designerBase.CHART_LEVEL;
                    selectedObject = matched;
                }

                if (proceed) {
                    if (localContext.draggableLegend) {
                        localContext.draggableLegend.destroy();
                    }
                    //deselect all selected legend overlays
                    designerBase.unSelectAll();
                    deselectAllSelectedOverlays();
                    designerBase.addToSelected(selectedObject);
                    buttonManager.select(matched);
                    showChartMenu(evt, selectionCategory.area);
                }
                Event.stop(evt);
            }

        }
    };

    ///////////////////////////////////////////////////////////////
    // Event Handling
    ///////////////////////////////////////////////////////////////
    /**
     * Initialization of all chart specific events
     */
    function chartSpecificEvents(){
        //mouse over
    	var it = this;
        if ($("chart")) {
            $("chart").observe('mouseover', function(evt) {
                var element = evt.element();
                var matched = null;

                matched = matchAny(element, ["div#chartBorder"], true);
                if (matched) {
                    //show dragger
                    var sizer = $("dragger");
                    sizer.removeClassName("hidden");
                }

                matched = matchAny(element, [CHART_DRAGGER_PATTERN, adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
                if (matched) {
                    if (draggableChart) {
                        draggableChart.destroy();
                    }
                    if (matched.match(adhocDesigner.LEGEND_OVERLAY_PATTERN)) {
                        var index = $(matched).readAttribute("data-index");
                        if (localContext.currentlyDraggingLegend) {
                            localContext.currentLegendIndex = index;
                        }

                        if (localContext.inDesignView) {
                            localContext.draggableLegend = new Draggable(matched.identify(), {
                                ghosting:true,
                                onStart : function(obj, evt) {
                                    Draggables.dragging = designerBase.CHART_LEGEND_AREA;
                                    localContext.currentlyDraggingLegend = true;
                                    localContext.currentLegendIndex = $(obj.element).readAttribute("data-index");
                                    $(obj.element).update($(obj.element).readAttribute("data-defaultname"));
                                    $(obj.element).setStyle({
                                        color : "#000",
                                        'white-space': "nowrap"
                                    });
                                    //destroy draggable chart
                                    if (draggableChart) {
                                        draggableChart.destroy();
                                    }
                                },
                                onEnd: function(obj, evt) {
                                    var measureIndex = null;
                                    measureIndex = $(obj.element).readAttribute("data-index");
                                    $(obj.element).update();
                                    localContext.currentlyDraggingLegend = false;
                                    if (!localContext.dragginInLegendArea) {
                                        removeMeasure(measureIndex);
                                    } else {
                                        if (measureIndex != localContext.currentLegendIndex) {
                                            if (!isNaN(measureIndex) && !isNaN(localContext.currentLegendIndex) && (measureIndex != null) && (localContext.currentLegendIndex != null)) {
                                                moveMeasure(measureIndex, localContext.currentLegendIndex);
                                            }
                                        }
                                    }
                                    localContext.currentLegendIndex = null;
                                    localContext.dragginInLegendArea = false;
                                },
                                onDrag : function(obj, evt) {
                                    var points = Event.pointer(evt);
                                    if (isInLegendArea(points.x, points.y)) {
                                        localContext.dragginInLegendArea = true;
                                        $(obj.element).removeClassName("outside");	
                                    } else {
                                        localContext.dragginInLegendArea = false;
                                        $(obj.element).addClassName("outside");
                                    }
                                }
                            });
                        }
                    }
                }
            });


            //mouse out
            $("chart").observe('mouseout', function(evt) {
                var element = evt.element();
                var matched = null;

                matched = matchAny(element, ["div#chartBorder"], true);
                if (matched) {
                    //show dragger
                    var sizer = $("dragger");
                    sizer.addClassName("hidden");
                }
                //destroy draggable chart
                if (draggableChart) {
                    draggableChart.destroy();
                }
            });
            
            //mouse down
            $("chart").observe(isSupportsTouch() ? 'touchstart': 'mousedown', function(evt) {
                var element = evt.element();
                var matched = null;

                if(isIPad()) {
                    matched = matchAny(element, ["div#chartBorder"], true);
                    matched && $("dragger").removeClassName("hidden");

                    evt.preventDefault();
                }

                matched = matchAny(element, [adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
                if (matched && !isRightClick(evt)) {
                    var proceed = false;
                    var selectedObject = null;
                    if (matched.hasClassName("legend")) {
                        var legendName = matched.readAttribute("data-legendName");
                        if (legendName !== "data-legendName") {
                            selectedObject = {
                                id : matched.identify(),
                                legendName : legendName,
                                index : matched.readAttribute("data-index"),
                                defaultName : matched.readAttribute("data-defaultName"),
                                userName : matched.readAttribute("data-userName")
                            };
                            selectionCategory.area = designerBase.LEGEND_MENU_LEVEL;
                            proceed = true;
                        }
                    }

                    if (proceed) {
                        if (localContext.draggableLegend) {
                            localContext.draggableLegend.destroy();
                        }
                        designerBase.unSelectAll();
                        deselectAllSelectedOverlays();
                        designerBase.addToSelected(selectedObject);
                        buttonManager.select(matched);
                    }

                    isIPad() && $("dragger").addClassName("hidden")
                }

               isIPad() && evt.preventDefault();
            });

            //mouse up
            $("chart").observe(isSupportsTouch() ? 'touchend' : 'mouseup', function(evt) {
                var element = evt.element();
                var matched =  null;
                var overlayIndex = null;

                matched = matchAny(element, [adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
                if (matched) {
                    if (Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA) {
                        overlayIndex = matched.readAttribute("data-index");
                        hoverLegendIndex = parseInt(overlayIndex);
                    }else{
                        deselectAllSelectedOverlays();
                        $(matched).addClassName("selected");
                    }
                    
                    if(isIPad()){
                        if(it.clickid == element.identify()) {
                        	if(evt.timeStamp - it.clicktime < 700) document.fire(layoutModule.ELEMENT_CONTEXTMENU, { targetEvent: evt, node: element});
                        }
            	        it.clicktime = evt.timeStamp;
            	        it.clickid = element.identify();            	
                    }
                } else {
                	if(isIPad()) deselectAllSelectedOverlays();
                }
            });

            /*
             * Chart sizer events
             */
            if(!this.documentEventSet) {
            	
            	this.documentEventSet = 1;
            	
	            Event.observe(document.body, isSupportsTouch() ? 'touchstart' : 'mousedown', function(evt) {
	                var element = evt.element();
	                if(element.identify() == "dragger"){
	                    localContext.containerMovePosition = {x : evt.pointerX(), y : evt.pointerY()};
	                    Event.observe(document.body, isSupportsTouch() ? 'touchmove' : 'mousemove', draggerListener);
	                }
	            }.bind(localContext));
	
	            Event.observe(document.body, isSupportsTouch() ? 'touchend' : 'mouseup', function(evt) {
                    var element = evt.element();
	                if (localContext.currentlyDragging) {
	                    //since i know that there is only one mouse move event, stop observing all
	                    Event.stopObserving(document.body, isSupportsTouch() ? 'touchmove' : 'mousemove', draggerListener);
	                    resizeChart();
	                    localContext.currentlyDragging = false;
	                } else {
                        var dragger = $("dragger");
                        if(isIPad() && dragger) {
                            !matchAny(element, ["div#chartBorder"], true) && dragger.addClassName("hidden");
                        }
                    }
                });
            }

            if(isIPad()) {
                $("chart").observe('gesturestart', function(evt) {
                    var chartBorder = $("chartBorder");

                    if (chartBorder && (evt.scale < 0.99 || evt.scale > 1.01)) {
                        localContext.resizedObject = {
                            element: chartBorder,
                            originalWidth: parseInt(chartBorder.getStyle("width")),
                            originalHeight: parseInt(chartBorder.getStyle("height"))
                        };
                    }
                });

                $("chart").observe('gesturechange', function(evt) {
                    if(localContext.resizedObject) {
                        var width = Math.abs(localContext.resizedObject.originalWidth * evt.scale);
                        var height = Math.abs(localContext.resizedObject.originalHeight * evt.scale);

                        localContext.resizedObject.element.setStyle({
                            width : width + "px",
                            height : height + "px"
                        });
                    }
                });

                $("chart").observe('gestureend', function(evt) {
                    if(localContext.resizedObject) {
                        resizeChart();
                        localContext.resizedObject = undefined;
                    }
                });
            }

            //context menu
            document.observe(layoutModule.ELEMENT_CONTEXTMENU, localContext.specificContextMenuHandler);

            //hide menu on scroll
            Event.observe($("mainTableContainer"), 'scroll', function(evt) {
                //hide menu if showing
                actionModel.hideMenu();
            });
        }
    }

    /**
    * Clear event listeners
    */

    this.removeObservers = function (){
         Event.stopObserving(document, layoutModule.ELEMENT_CONTEXTMENU,localContext.specificContextMenuHandler);
    };

    // define droppables
    adhocDesigner.addDroppables = function(){
        var dropOptions = {
            "mainTableContainer": {
                onDrop: function(){
                    addFieldAsMeasure(true);
                    adhocDesigner.unSelectAvailableTreeNodes();
                    adhocDesigner.unSelectAvailableTreeNodes();
                }
            },
            "filter-container": {
                onDrop: function(){
                    adhocDesigner.addFilterViaDragNDrop();
                    adhocDesigner.unSelectAvailableTreeNodes();
                }
            },
            "defaultValues": {
                //accept: 'visibleFieldsTree'/*'wrap'*/,
                accept: ['draggable', 'wrap'],
                hoverclass: 'dropTarget'
            }
        };

        var getValue = function(id, key){
            return dropOptions[id][key] || dropOptions.defaultValues[key];
        };

        for (var myId in dropOptions) {
            if ((myId !== 'defaultValues') && dropOptions.hasOwnProperty(myId)) {
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

        adhocDesigner.removeDroppables = function(){
            for (var myId in dropOptions) {
                Droppables.remove(myId);
            }
        }
    };

    ///////////////////////////////////////////////////////////////
    // Helper functions and Conditional tests
    ///////////////////////////////////////////////////////////////
    /**
     * Event listener for chart sizer
     */
    var draggerListener = this.draggerListener = function (evt){
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
    
    var canMoveMeasureUp = this.canMoveMeasureUp = function(){
    	var v = false;
    	if(selObjects[0] && (selObjects[0].index < (localContext.measureNames.length-1) )) v = true;
    	return v;
    }
    
    var canMoveMeasureDown = this. canMoveMeasureDown = function(){
    	var v = false;
    	if(selObjects[0] && selObjects[0].index && (selObjects[0].index > 0)) v = true;
    	return v;
    }

    /*
     * Helpers to determine chart type
     */
    function supportsSeries(){
        return localContext.type != PIE_CHART;
    }

    function isPie(){
        return localContext.type == PIE_CHART;
    }

    function isBar(){
        return localContext.type == BAR_CHART;
    }

    function isArea(){
        return localContext.type == AREA_CHART;
    }

    function isLine(){
        return localContext.type == LINE_CHART;
    }

    this.isType = function(aType){
        return localContext.type == aType;
    };


    var isMeasureNumeric = this.isMeasureNumeric = function(index){
        var thisIndex = (arguments.length === 0) ? getCurrentMeasure() : index;
        return localContext.isNumeric[thisIndex];
    };


    this.isSelectedMeasureNumeric = function(){
        return isMeasureNumeric();
    };


    this.isDataType = function(thisType, index){
        var thisIndex = (arguments.length < 2) ? getCurrentMeasure() : index;
        return localContext.dataTypes[thisIndex] == thisType;
    };


    this.isMask = function(thisMask, index){
        var thisIndex = (arguments.length < 2) ? getCurrentMeasure() : index;
        return localContext.masks[thisIndex] == thisMask;
    };


    this.isFunctionSelected = function(functionName, measureIndex){
        measureIndex = measureIndex ? measureIndex : getCurrentMeasure();
        return localContext.summaryFunctions[measureIndex] == functionName;
    };


    var isContentPageSize = this.isContentPageSize = function(){
        return (localContext.paperSize == CONTENT_PAGE_SIZE)
    };


    var isInLegendArea = this.isInLegendArea = function(x, y){
        var extraLegendPadding = 20;
        //get charts offset
        var chartOffset = $("chartBorder").cumulativeOffset();
        var chartScrollOffset = $("chartBorder").cumulativeScrollOffset();
        var combinedOffset = {
            left : (chartOffset[0] + chartScrollOffset[0]),
            top : (chartOffset[1] + chartScrollOffset[1])
        };

        var legendOffset = {
            left : combinedOffset.left + localContext.legendLeft,
            top  : combinedOffset.top + localContext.legendTop
        };

        return ((x < legendOffset.left + localContext.legendWidth + extraLegendPadding)
                && (x >= legendOffset.left - extraLegendPadding)
                && (y < legendOffset.top + localContext.legendHeight + extraLegendPadding)
                && (y >= legendOffset.top - extraLegendPadding));
    };
    ///////////////////////////////////////////////////////////////
    // Chart actions and Action model functions
    ///////////////////////////////////////////////////////////////
    /**
     * Helper to determine if we can save report
     */
    var canSaveReport = this.canSaveReport = function(){
        return (localContext.canSave);
    };
    /**
     * Used to show chart menu
     * @param evt
     * @param menuLevel
     */
    function showChartMenu(evt, menuLevel){
    	if(isIPad()){
    		adhocDesigner.showDynamicMenu(evt, menuLevel,{menuLeft: evt.changedTouches[0].clientX,menuTop:evt.changedTouches[0].clientY-100});
    	} else {
    		adhocDesigner.showDynamicMenu(evt, menuLevel,{menuLeft: evt.clientX,menuTop:evt.clientY-100});
    	}       
    }
    /**
     * Used to get the current measure
     */
    function getCurrentMeasure(){
        if (localContext.numberOfMeasures == 1 || isPie()){
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
    var addFieldAsMeasure = this.addFieldAsMeasure = function(includeSubSets){
        var size;
        var position;
        var fieldList = "";

        if(selObjects.length > 0){
            var selectedNodes = adhocDesigner.getSelectedTreeNodes();

            if(supportsSeries() && localContext.seriesEnabled){
                size = selectedNodes.length;
            }else{
                size = 1;
            }
            //fix for bug 23370, encode each fieldname on client and decode on server
            fieldList = adhocDesigner.collectFields(selectedNodes, includeSubSets).map(function(fieldName){
                return escape(fieldName);
            }).join(",");

            if (supportsSeries()) {
                if(isNotNullORUndefined(hoverLegendIndex) && (hoverLegendIndex > -1)){
                    addAsMeasure(fieldList, hoverLegendIndex);
                }else{
                    addAsLastMeasure(fieldList);
                }
            }
            else {
                replaceMeasure(fieldList); // should be just one name
            }
        }
    };
    /**
     * Used to determine if we can add field as a measure
     */
    var canAddAsMeasure = this.canAddAsMeasure = function(){
        var isMultiSelect = (selObjects.length > 1);
        return !NO_CHART_DATA && ((!localContext.hasMeasures && !isMultiSelect) || (localContext.seriesEnabled && supportsSeries()));
    };

    this.canReplaceMeasure = function() {
        if(selObjects.length == 1){
            var selectedObject =  designerBase.getSelectedObject();
            var isParentNode;
            if(selectedObject){
            	isParentNode = selectedObject.isParent();
            } else {
            	return false;
            }
            return !NO_CHART_DATA && localContext.hasMeasures && (!localContext.seriesEnabled || !supportsSeries()) && !isParentNode;
        }
        return false;
    };

    var canAddAsGroup = this.canAddAsGroup = function(allowReplace){
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
            return !NO_CHART_DATA && (allowReplace || !localContext.hasGroup) && !isParentNode && !adhocDesigner.isPercentOfParentCalcSelected(selectedObject);
        }
        return false;
    };

    var canReplaceGroup = this.canReplaceGroup = function(){
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
            return !NO_CHART_DATA && localContext.hasGroup && !isParentNode && !adhocDesigner.isPercentOfParentCalcSelected(selectedObject);
        }
        return false;
    };

    var addFieldAsGroup = this.addFieldAsGroup = function() {
        var selectedObject =  designerBase.getSelectedObject();
        if (selectedObject) {
            var fieldName = adhocDesigner.getNameForSelected(selectedObject);
            setGroup(fieldName);
        }
    };

    this.functionSelected = function(thisFunction, measureIndex){
        if (!measureIndex) {
            measureIndex = getCurrentMeasure();
        }
        var newMeasureType = getUpdatedMeasureType(thisFunction);
        if (newMeasureType) {
            setSummaryFunctionAndMask(thisFunction, defaultMasks[newMeasureType], measureIndex);
        }
        else {
            setSummaryFunction(thisFunction, measureIndex);
        }
    };

    function getUpdatedMeasureType(thisFunction){
        var newType = localContext.getMeasureType(thisFunction);
        if (newType != localContext.dataTypes[getCurrentMeasure()])
            return newType;
        return null; //no change
    }

    this.getMeasureType = function(thisFunction){
        if (thisFunction == "Count" || thisFunction == "DistinctCount")
            return "int";
        //otherwise use field type
        return localContext.dataTypes[getCurrentMeasure()];
    };

    this.maskSelected = function(thisMask, measureIndex){
        if (!measureIndex) {
            measureIndex = getCurrentMeasure();
        }
        setMask(thisMask, measureIndex);
    };

    this.canSetMask = function(){
        return localContext.dataTypes[getCurrentMeasure()] != 'NaN';
    };

    this.selectedMeasureShowsSummaryOptions = function() {
        var selectedMeasureName = localContext.measureNames[getCurrentMeasure()];
        return !adhocDesigner.isPercentOfParentCalc(selectedMeasureName);
    };

    var deselectAllSelectedOverlays = this.deselectAllSelectedOverlays = function(){
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

    var increaseChartSize = this.increaseChartSize = function(){
        zoomChartSize(ZOOM_FACTOR);
    };

    var decreaseChartSize = this.decreaseChartSize = function(){
        zoomChartSize(ZOOM_FACTOR * -1);
    };
    
    var switchToMeasure = this.switchToMeasure = function(f,i){
    	var ec = function(f,i){
			return function(){addAsMeasure(f,i)};
		}(f,i);
    	this.removeGroup(ec);
    }
    
    var switchToGroup = this.switchToGroup = function(f,i,j){
    	var ec = function(f,i){
			return function(){setGroup(f,i)};
		}(f,i);
    	this.removeMeasure(j,ec);
    }

    ///////////////////////////////////////////////////////////////
    // Ajax calls
    ///////////////////////////////////////////////////////////////

    var addAsMeasure = this.addAsMeasure = function(fieldNames, index){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_insertMeasure', new Array('fs=' + encodeText(fieldNames), 'i=' + index), callback, null);
    }

    function addAsLastMeasure(fieldNames){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_insertMeasureLast', new Array('fs=' + encodeText(fieldNames)),  callback, null);
    }

    function replaceMeasure(fieldName){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_replaceMeasures', new Array('f=' + encodeText(fieldName)),  callback, null);
    }

    var moveMeasure = this.moveMeasure = function(from, to){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_moveMeasure', new Array('f=' + from, 't=' + to), callback, null);
    }
    
    var moveMeasureUp = this.moveMeasureUp = function(){
    	var from = parseInt(selObjects[0].index);
    	var to = from + 1;
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_moveMeasure', new Array('f=' + from, 't=' + to), callback, null);
    }
    
    var moveMeasureDown = this.moveMeasureDown = function(){
    	var from = selObjects[0].index;
    	var to = from - 1;
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_moveMeasure', new Array('f=' + from, 't=' + to), callback, null);
    }

    var setGroup = this.setGroup = function(fieldName){
    	if(selObjects[0]) {
    		if(selObjects[0].parent && selObjects[0].parent.treeId == 'measuresTree') {
    			alert('Error: measures can not be added to groups.');
    			return 0;
    		}   		
    	}
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_setGroup', new Array('g=' + encodeText(fieldName)), callback, null);
    }

    var removeMeasure = this.removeMeasure = function(index,callback_override){
        if (!index && index != 0)
            index = getCurrentMeasure();
        var callback = function(){
            callback_override ? callback_override() : localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_removeMeasure', new Array("i=" + index), callback, null);
    };

    this.removeGroup = function(callback_override){
        var callback = function(){           
            callback_override ? callback_override() : localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_removeGroup', new Array(), callback, null);
    };

    this.changeChartType = function(type){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_changeType', new Array('t=' + type), callback, null);
    };

    this.toggle3D = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggle3D', new Array(), callback, null);
    };

    this.toggleStack = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleStack', new Array(), callback, null);
    };

    this.toggleOrientation = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleChartOrientation', new Array(), callback, null);
    };

    this.togglePoints = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_togglePoints', new Array(), callback, null);
    };

    this.toggleLines = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleLines', new Array(), callback, null);
    };

    this.toggleGradient = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleGradient', new Array(), callback, null);
    };

    this.toggleBackground = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleBackground', new Array(), callback, null);
    };

    this.toggleLegend = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleLegend', new Array(), callback, null);
    };

    this.toggleXAxisLabel = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleXAxisLabel', new Array(), callback, null);
    };

    this.toggleYAxisLabel = function(){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_toggleYAxisLabel', new Array(), callback, null);
    };

    this.updateLegendLabel = function(title, index){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        if(title.blank()){
            title = " ";
        }
        designerBase.sendRequest('ch_setLegendLabel', new Array('l=' + encodeText(title), 'i=' + index), callback, null);
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
    
    function setSummaryFunction(thisFunction, index){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_setSummaryFunction', new Array('f=' + thisFunction, 'i=' + index), callback, null);
    }

    function setSummaryFunctionAndMask(thisFunction, thisMask, index){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_setSummaryFunctionAndMeasureMask', new Array('f=' + thisFunction, 'm=' + encodeText(thisMask), 'i=' + index), callback, null);
    }

    function setMask(thisMask, index){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_setMeasureMask', new Array('m=' + encodeText(thisMask), 'i=' + index), callback, null);
    }

    var resizeChart = this.resizeChart = function(width, height){
        var chartWidth = null;
        var chartHeight = null;
        var chartContainer = $("chartBorder");

        if (chartContainer) {
            chartWidth = isNaN(width) ? parseInt(chartContainer.getStyle("width")) : width;
            chartHeight = isNaN(height) ? parseInt(chartContainer.getStyle("height")) : height;
            if(!isContentPageSize()){
                if(chartWidth >  localContext.availableChartWidth - localContext.chartX){
                    chartWidth =  localContext.availableChartWidth - localContext.chartX
                }

                if(chartHeight > localContext.availableChartHeight - localContext.chartY){
                    chartHeight = localContext.availableChartHeight - localContext.chartY
                }
            }

            //minimum check
            chartWidth = (chartWidth < MIN_CHART_WIDTH) ? MIN_CHART_WIDTH : chartWidth;
            chartHeight = (chartHeight < MIN_CHART_HEIGHT) ? MIN_CHART_HEIGHT : chartHeight;

            var callback = function(){
                localContext.standardChartOpCallback();
            };
            designerBase.sendRequest('ch_resizeChart', new Array('w=' + chartWidth, 'h=' + chartHeight), callback, null);
        }
    };

    var zoomChartSize = this.zoomChartSize = function(zoomFactor){
        var chartWidth = null;
        var chartHeight = null;
        var chartContainer = null;
        var canZoom = true;

        if(!isNaN(zoomFactor)){
            chartContainer = $("chartBorder");
            if(chartContainer){
                chartWidth = parseInt(localContext.chartWidth) + zoomFactor;
                chartHeight = parseInt(localContext.chartHeight) + zoomFactor;
                //make sure we are not out of bounds
                if(!isContentPageSize()){
                    if((chartWidth >  localContext.availableChartWidth - localContext.chartX) || (chartHeight >  localContext.availableChartHeight - localContext.chartY)){
                        canZoom = false;
                    }
                }

                if((chartWidth < MIN_CHART_WIDTH) || (chartHeight < MIN_CHART_HEIGHT)){
                    canZoom = false;
                }

                if(canZoom){
                    var callback = function(){
                        localContext.standardChartOpCallback();
                    };
                    designerBase.sendRequest('ch_zoomChart', new Array('z=' + zoomFactor), callback, null);
                }
            }
        }
    };

    function moveChart(x, y){
        var callback = function(){
            localContext.standardChartOpCallback();
        };
        designerBase.sendRequest('ch_moveChart', new Array('x=' + x, 'y=' + y), callback, null);
    }

    function getChartWidth(){
        return $("chartBorder").getWidth();
    }

    function getChartHeight(){
        return $("chartBorder").getHeight();
    }

    function getHasMargins(){
        return localContext.hasMargins;
    }

    function getNewChartPositionAndMove(){
        var chartContainer = $("chartBorder");
        var left = null;
        var top = null;
        var offset = null;
        var scrollOffset = null;
        var adjust = false;

        if (chartContainer) {
            offset = chartContainer.positionedOffset();
            scrollOffset = chartContainer.cumulativeScrollOffset();
            if (isContentPageSize()) {
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
                if(right > localContext.availableChartWidth){
                    left = localContext.availableChartWidth - getChartWidth();
                    left += scrollOffset[0];
                    adjust = true;
                }else{
                    left = offset[0] + scrollOffset[0];
                }

                if(bottom > localContext.availableChartHeight){
                    top = localContext.availableChartHeight - getChartHeight();
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

    function getTitleHeight(){
        var titleHeight = 0;
        var title = $("titleCaption");

        if(title){
            return title.getHeight();
        }

        return titleHeight;
    }

    function getTitleBottom(){
        var height = getTitleHeight();
        if(height == 0){
            return height;
        }else{
            var offset = $("titleCaption").positionedOffset();
            return height + offset[1];
        }
    }
    
    ///////////////////////////////////////////////////////////////
    // Ajax callbacks
    ///////////////////////////////////////////////////////////////

    this.getCallbacksForPivot = function(){
        localContext.standardChartOpCallback();
    };

    this.standardOpCallback = function() {
        localContext.standardChartOpCallback();
        adhocDesigner.comp.display_manager.update();
    };
    /**
     * Custom field callback
     */
    this.updateCustomFieldCallback = function() {
        this.standardChartOpCallback();
    };

    this.reInitOverlayCallback = function(){
        initOverlays();
    };

    this.standardChartOpCallback = function() {
        initGlobals();
        initOverlays();
        actionModel.hideMenu();
        designerBase.unSelectAll();
        adhocDesigner.render();
        if(localContext.inDesignView) {
            adhocDesigner.updateAllFieldLabels();
        }
        //designerBase.updateMainOverlay('hidden');
    };
};

///////////////////////////////////////////////////
// Finally initialize (this code must come last)
///////////////////////////////////////////////////
localContext = new AdHocChart();
designerBase.superInitAll();
