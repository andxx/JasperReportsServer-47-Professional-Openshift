/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocTable.mouseDownHandler = function(evt){};

AdHocTable.mouseUpHandler = function(evt){
    var it = this;
    if(Draggables.dragging == designerBase.COLUMN_LEVEL ||
        Draggables.dragging == designerBase.GROUP_LEVEL || TouchController.element_scrolled) {
        //re-ordering columns / groups
        return;
    }

    var element = isSupportsTouch() ? getTouchedElement(evt) : evt.element();
    var matched =  null;
    var overlayIndex = null;
    var overlayId = null;
    /*
     * Fire this if we have just finished dragging. This also sets the position where the new field will be placed
     */
    if(Draggables.dragging == 'dimensionsTree' || Draggables.dragging == 'measuresTree'){
        matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
        if(matched){
            overlayId = element.identify();
            overlayIndex = overlayIndex ? overlayIndex : AdHocTable.digitRegex.exec(overlayId)[0];
            isSupportsTouch() || (AdHocTable.hoverColumn = overlayIndex);
            AdHocTable.deactivateVisualDropCue(evt, overlayIndex);
            if(AdHocTable.isHoverGreaterThan50Percent(evt, overlayIndex)){
                AdHocTable.hoverColumn++;
            }
        }
        matched = matchAny(element, [adhocDesigner.COLUMN_SIZER_PATTERN], true);
        if(matched){
            overlayId = element.identify();
            overlayIndex = parseInt(AdHocTable.digitRegex.exec(overlayId)[0]);
            AdHocTable.hoverColumn = overlayIndex + 1;
            AdHocTable.deactivateVisualDropCue(evt, overlayIndex);
        }
    }

    if(!isSupportsTouch() || !TouchController.element_scrolled){
        /**
         * Column
         */
        matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
        if(matched && !isRightClick(evt)){
            overlayId = element.identify();
            var overlayIndex = AdHocTable.digitRegex.exec(overlayId)[0];
            var colHeader = localContext._getTableHeaders()[overlayIndex];
            var headerObj = {};
            headerObj.header = colHeader;
            headerObj.index = overlayIndex;
            localContext.selectTableColumn(evt, headerObj);
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
                localContext.selectGroup(evt, groupObj);
            }
        }
        /**
         * Summary
         */
        if(element.match(adhocDesigner.SUMMARY_OVERLAY_PATTERN) && !isRightClick(evt)){
            overlayId = element.identify();
            localContext.selectGrandRowCell(evt, AdHocTable.digitRegex.exec(overlayId)[0]);
        }
    }
};

AdHocTable.mouseOutHandler = function(evt){
    var overlayId;
    var overlayIndex;
    var element = evt.targetElement ? evt.targetElement : evt.element();
    /*
     * Column overlay hovering
     */
    var matched = matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true);
    if(matched){
        element.removeClassName("over");
        //check to see if we are performing a mouse out whiles dragging a available field across the table canvas
        if (Draggables.dragging && !Draggables.activeDraggable.element.hasClassName('columnSizer')) {
            overlayId = element.identify();
            overlayIndex = parseInt(AdHocTable.digitRegex.exec(overlayId)[0]);
            AdHocTable.deactivateVisualDropCue(evt, overlayIndex);
            AdHocTable.deactivateVisualDropCue(evt, overlayIndex - 1);
        }
    }
    /*
     * Summary or column groups
     */
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

AdHocTable.mouseOverHandler = function(evt){
    var element = evt.targetElement ? evt.targetElement : evt.element();

    var draggingCaresAboutGroups = Draggables.dragging == designerBase.GROUP_LEVEL;

    AdHocTable.updateColumnWhileDrag(evt, element, function(overlayIndex, hoverGreaterThan50Percent) {
        AdHocTable.deactivateVisualDropCue(evt, hoverGreaterThan50Percent ? overlayIndex - 1 : overlayIndex);
        AdHocTable.activateVisualDropCue(evt, hoverGreaterThan50Percent ? overlayIndex : overlayIndex - 1);
    });

    if(Draggables.dragging != designerBase.AVAILABLE_FIELDS_AREA && !AdHocTable.draggingColumnSizer) {
        matched = matchAny(element, [adhocDesigner.SUMMARY_OVERLAY_PATTERN, adhocDesigner.GROUP_OVERLAY_PATTERN,'th.label'], true);

        if(matched){ //Bug fix 25106 & 25198.
            var jo = jQuery(matched);
            var ci = jo.attr('data-index');
            if(jo.get(0).tagName.toLowerCase() == 'th' && ci) {
                jQuery('#columnOverlay_' + ci).addClass('over');
            } else {
                matched.addClassName("over");
            }
        }
        if (draggingCaresAboutGroups) {
            AdHocTable.draggingMoveOverGroupIndex =
                element.match(adhocDesigner.GROUP_OVERLAY_PATTERN) ? element.getAttribute('data-index') : -1;
        }
        AdHocTable.resizeColumnWhenSizerDrag(element);
    }
};

AdHocTable.mouseClickHandler = function(evt){};

AdHocTable.contextMenuHandler = function(evt){
    var element = evt.element();
    var id = element.identify();

    if (matchAny(element, [adhocDesigner.COLUMN_OVERLAY_PATTERN], true)) {
        var overlayIndex = AdHocTable.digitRegex.exec(id)[0];
        var colHeader = localContext._getTableHeaders()[overlayIndex];
        var headerObj = {};
        headerObj.header = colHeader;
        headerObj.index = overlayIndex;

        if (!designerBase.isInSelection(headerObj)) {
            localContext.selectTableColumn(evt, headerObj);
        }
        adhocDesigner.showDynamicMenu(evt, designerBase.COLUMN_LEVEL);
    }
    if (element.match(adhocDesigner.SUMMARY_OVERLAY_PATTERN)) {
        overlayIndex = AdHocTable.digitRegex.exec(id)[0];
        var summaryCells = $("grandSummaryRow").cells;
        var summaryCell = summaryCells[overlayIndex];

        if (!designerBase.isInSelection(summaryCell)) {
            localContext.selectGrandRowCell(evt, AdHocTable.digitRegex.exec(id)[0]);
        }
        adhocDesigner.showDynamicMenu(evt, designerBase.SUMMARY_LEVEL);
    }
    if (element.match(adhocDesigner.GROUP_OVERLAY_PATTERN)) {
        if (element) {
            var groupObj = {
                id : id,
                fieldName : element.readAttribute("data-fieldName"),
                mask : element.readAttribute("data-mask"),
                dataType : element.readAttribute("data-dataType"),
                index : element.readAttribute("data-index"),
                label : element.readAttribute("data-label")
            };

            if (!designerBase.isInSelection(groupObj)) {
                localContext.selectGroup(evt, groupObj);
            }
            adhocDesigner.showDynamicMenu(evt, designerBase.GROUP_LEVEL);
        }
    }
};

AdHocTable.initKeyEvents = function(){
    function cameFromDialog(event) {
        return event.target.up(".dialog") != null;
    }
    document.stopObserving('key:up');
    document.observe('key:up', function(event){
        if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
            //column
            var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
            var object = adhocDesigner.getSelectedColumnOrGroup();
            if (object && designerBase.isInSelection(object) && AdHocTable.canMoveGroupUp()) {
                AdHocTable.moveGroupUp(function() {
                    object.index --;
                    localContext.selectGroup(evt, object);
                });
            }
        }
    });
    document.stopObserving('key:down');
    document.observe('key:down', function(event){
        if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
            //column
            var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
            var object = adhocDesigner.getSelectedColumnOrGroup();
            if (object && designerBase.isInSelection(object) && AdHocTable.canMoveGroupDown()) {
                AdHocTable.moveGroupDown(function() {
                    object.index ++;
                    localContext.selectGroup(evt, object);
                });
            }
        }
    });
    document.stopObserving('key:right');
    document.observe('key:right', function(event){
        if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
            //column
            var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
            var object = adhocDesigner.getSelectedColumnOrGroup();
            if (object && designerBase.isInSelection(object) && AdHocTable.canMoveColumnsRight()) {
                AdHocTable.moveColumnRight(function() {
                    AdHocTable.updateSelectedIndexes(1);
                    localContext.selectTableColumn(evt, object);
                });
            }
        }
    });
    document.stopObserving('key:left');
    document.observe('key:left', function(event){
        if (localContext.getMode() == designerBase.TABLE && !cameFromDialog(event)) {
            //column
            var evt = Object.clone(event.memo.targetEvent); //IE: cloning fixed IE issue
            var object = adhocDesigner.getSelectedColumnOrGroup();
            if (object && designerBase.isInSelection(object) && AdHocTable.canMoveColumnsLeft()) {
                AdHocTable.moveColumnLeft(function() {
                    AdHocTable.updateSelectedIndexes(-1);
                    localContext.selectTableColumn(evt, object);
                });
            }
        }
    });
} ;

AdHocTable.lmHandlersMap = {
    // Common methods for both axes
    addItems : function(nodes, pos, axis) {
        this[axis].addItems(_.pluck(nodes, 'id').join(','), pos);
    },

    group : {
        addItem : function(dim, pos, field) {
            AdHocTable.addFieldAsGroup(field, pos);
        },
        addItems : AdHocTable.addFieldAsGroup,
        removeItem : function(item, index) {
            AdHocTable.removeGroup(index);
        },
        moveItem : function(field, from, to) {
            AdHocTable.moveGroup(from, to);
        },
        switchItem : function(field, from, to) {
            AdHocTable.switchToGroup(field, from, to);
        },
        contextMenu : function(event, options) {
            var groupEl = jQuery('.overlay.group[data-fieldName="' + options.extra.name + '"]');
            localContext.selectGroup(options.targetEvent, {
                id: groupEl.attr("id"),
                fieldName: groupEl.attr("data-fieldName"),
                mask: groupEl.attr("data-mask"),
                dataType: groupEl.attr("data-dataType"),
                index: groupEl.attr("data-index"),
                label: groupEl.attr("data-label")
            });
            adhocDesigner.showDynamicMenu(options.targetEvent, 'displayManagerRow', null,null);
        }
    },
    column : {
        addItem : function(dim, pos, field) {
            AdHocTable.addFieldAsColumnAtPosition(field, pos);
        },
        addItems : AdHocTable.addFieldAsColumnAtPosition,
        removeItem : function(item, index) {
            AdHocTable.removeColumn(index);
        },
        moveItem : function(field, from, to) {
            AdHocTable.moveColumn(from, to, null, true);
        },
        switchItem : function(field, from, to) {
            AdHocTable.switchToColumn(field, from, to);
        },
        contextMenu : function(event, options) {
            var extra = options.extra;
            var o = localContext._getTableHeaders()[extra.index];
            localContext.selectTableColumn(options.targetEvent,{header:o,index:extra.index,ftype:(extra.isMeasure ? 'measure' : 'dimension')});
            adhocDesigner.showDynamicMenu(options.targetEvent,'displayManagerColumn',null,null);

        }
    }
};
