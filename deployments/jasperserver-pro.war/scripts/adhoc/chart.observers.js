/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocChart.mouseDownHandler = function(evt){
    var element = evt.element();
    var matched = null;

    if(isIPad()) {
        matched = matchAny(element, ["div#chartBorder"], true);
        matched && $("dragger").removeClassName("hidden");
        evt.preventDefault();
    }

    if(element.identify() == "dragger"){
        this.containerMovePosition = {x : evt.pointerX(), y : evt.pointerY()};
        Event.observe(document.body, isSupportsTouch() ? 'touchmove' : 'mousemove', this.draggerListener);
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
            AdHocChart.deselectAllSelectedOverlays();
            designerBase.addToSelected(selectedObject);
            buttonManager.select(matched);
        }

        isIPad() && $("dragger").addClassName("hidden")
    }

    isIPad() && evt.preventDefault();
};

AdHocChart.mouseUpHandler = function(evt) {
    var element = evt.element();
    var matched =  null;
    var overlayIndex = null;

    if (this.currentlyDragging) {
        //since i know that there is only one mouse move event, stop observing all
        Event.stopObserving(document.body, isSupportsTouch() ? 'touchmove' : 'mousemove', this.draggerListener);
        this.resizeChart();
        this.currentlyDragging = false;
    } else {
        var dragger = $("dragger");
        if(isIPad() && dragger) {
            !matchAny(element, ["div#chartBorder"], true) && dragger.addClassName("hidden");
        }
    }

    matched = matchAny(element, [adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
    if (matched) {
        if (Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA) {
            overlayIndex = matched.readAttribute("data-index");
            AdHocChart.hoverLegendIndex = parseInt(overlayIndex);
        }else{
            AdHocChart.deselectAllSelectedOverlays();
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
        if(isIPad()) AdHocChart.deselectAllSelectedOverlays();
    }
};

AdHocChart.mouseOverHandler = function(evt){
    var element = evt.element();
    var matched = null;

    matched = matchAny(element, ["div#chartBorder"], true);
    if (matched) {
        var sizer = $("dragger");
        sizer.removeClassName("hidden");
    }

    matched = matchAny(element, [AdHocChart.CHART_DRAGGER_PATTERN, adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
    if (matched) {
        if (AdHocChart.draggableChart) {
            AdHocChart.draggableChart.destroy();
        }
        if (matched.match(adhocDesigner.LEGEND_OVERLAY_PATTERN)) {
            var index = $(matched).readAttribute("data-index");
            if (localContext.currentlyDraggingLegend) {
                localContext.currentLegendIndex = index;
            }

            if (localContext.state.inDesignView) {
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
                        if (AdHocChart.draggableChart) {
                            AdHocChart.draggableChart.destroy();
                        }
                    },
                    onEnd: function(obj, evt) {
                        var measureIndex = null;
                        measureIndex = $(obj.element).readAttribute("data-index");
                        $(obj.element).update();
                        localContext.currentlyDraggingLegend = false;
                        if (!localContext.dragginInLegendArea) {
                            AdHocChart.removeMeasure(measureIndex);
                        } else {
                                if (!isNaN(measureIndex) && !isNaN(localContext.currentLegendIndex) && (measureIndex != null) && (localContext.currentLegendIndex != null)) {
                                    AdHocChart.moveMeasure(measureIndex, localContext.currentLegendIndex);
                                }
                        }
                        localContext.currentLegendIndex = null;
                        localContext.dragginInLegendArea = false;
                    },
                    onDrag : function(obj, evt) {
                        var points = Event.pointer(evt);
                        if (AdHocChart.isInLegendArea(points.x, points.y)) {
                            localContext.dragginInLegendArea = true;
                            var legends = $$('#chartBorder .overlay');
                            legends.each(function (element, index) {
                                if (element !== obj.element){
                                    var left = Element.cumulativeOffset(element)[0];
                                    var right = +element.style.width.replace("px", "") + left;
                                    if (left <= points.x && points.x <= right) {
                                        localContext.currentLegendIndex = element.readAttribute("data-index");
                                        buttonManager.over(element);
                                    }
                                    else {
                                        buttonManager.out(element);
                                    }
                                }
                            });
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
};

AdHocChart.mouseOutHandler = function(evt){
    var element = evt.element();
    var matched = null;

    matched = matchAny(element, ["div#chartBorder"], true);
    if (matched) {
        //show dragger
        var sizer = $("dragger");
        sizer.addClassName("hidden");
    }
    //destroy draggable chart
    if (AdHocChart.draggableChart) {
        AdHocChart.draggableChart.destroy();
    }
};

AdHocChart.mouseClickHandler = function(evt) {};

AdHocChart.contextMenuHandler = function(evt) {
    var element = evt.element();

    var proceed = true;

    var matched = matchAny(element, [AdHocChart.CHART_CANVAS_PATTERN, adhocDesigner.LEGEND_OVERLAY_PATTERN], true);
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
            designerBase.unSelectAll();
            AdHocChart.deselectAllSelectedOverlays();
            designerBase.addToSelected(selectedObject);
            buttonManager.select(matched);
            AdHocChart.showChartMenu(evt, selectionCategory.area);
        }
        Event.stop(evt);
    }
};

AdHocChart.lmHandlersMap = {
    // Common methods for both axes
    addItems : function(nodes, pos, axis) {
        this[axis].addItems(nodes, pos);
    },

    group : {
        addItem : function(dim, pos, field) {
            AdHocChart.setGroup(field);
        },
        addItems: AdHocChart.addFieldAsGroup,
        removeItem : function(item, index) {
            AdHocChart.removeGroup(index);
        },
        switchItem: function(i,f,t){
            AdHocChart.switchToGroup(i,f);
        },
        contextMenu : function(event, options) {
            var f = options.extra.name;
            selectedObject = {
                legendName: f,
                index: 0
            };
            designerBase.unSelectAll();
            localContext.deselectAllSelectedOverlays();
            designerBase.addToSelected(selectedObject);
            selectionCategory.area = designerBase.LEGEND_MENU_LEVEL;
            adhocDesigner.showDynamicMenu(options.targetEvent,'displayManagerRow',null,null);
        }
    },
    measures : {
        addItem : function(dim, pos, field) {
            AdHocChart.addFieldAsMeasure(true, pos);
        },
        addItems : function(level, pos) {
            AdHocChart.addFieldAsMeasure(true, pos);
        },
        removeItem : function(item, index) {
            AdHocChart.removeMeasure(index);
        },
        moveItem : function(field, from, to) {
            AdHocChart.moveMeasure(from,to);
        },
        switchItem: function(i,f,t){
            AdHocChart.switchToMeasure(i,f,t);
        },
        contextMenu : function(event, options) {
            var i = options.extra.index;
            var legendItem = AdHocChart.state.legendItems[i];
            selectedObject = {
                id: "legendOverlay_" + i,
                legendName: options.extra.name,
                index: i,
                defaultName: legendItem ? legendItem.defaultName : "",
                userName: legendItem ? legendItem.userName : "",
                chartMeasureId: options.extra.name
            };
            designerBase.unSelectAll();
            AdHocChart.deselectAllSelectedOverlays();
            designerBase.addToSelected(selectedObject);
            selectionCategory.area = designerBase.LEGEND_MENU_LEVEL;
            adhocDesigner.showDynamicMenu(options.targetEvent,'displayManagerColumn');
        }
    }
};

