/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocTable.createDraggableColumn = function(columnId){
    return new Draggable(columnId, {
        mouseOffset: true,
        scroll: 'mainTableContainer',

        onStart : function(obj, evt){
            if (!selObjects.length) {return}
			Draggables.dragging = designerBase.COLUMN_LEVEL;
			$(obj.element).addClassName(layoutModule.DRAGGING_CLASS);
			AdHocTable.draggingColumnOverlay = true;
			var numberOfSelections = selObjects.length;
			$(obj.element).update((numberOfSelections-1) ? 
				numberOfSelections + " " + itemsSelectedSuffix : 
				selObjects[0].header.getAttribute("data-label"));
        },

        onEnd : function(obj, evt){
            Draggables.dragging = null;
            AdHocTable.draggingColumnOverlay = false;
            var overlayId = $(obj.element).identify();
            var draggingIndex = AdHocTable.digitRegex.exec(overlayId)[0];
            if (AdHocTable.draggingMoveOverColumnIndex == -1) {
                isDesignView && AdHocTable.removeColumn();
            }else if (draggingIndex != AdHocTable.draggingMoveOverColumnIndex) {
				var indexFunction = draggingIndex < AdHocTable.draggingMoveOverColumnIndex ? [].max : [].min;
				var fromIndex = indexFunction.call(selObjects, function(obj) {return obj.index});
                localContext.moveColumn(fromIndex, AdHocTable.draggingMoveOverColumnIndex);
			} else {
                AdHocTable.initOverlays();
            }
            AdHocTable.draggingMoveOverColumnIndex = -1;
        }
    });
};

AdHocTable.createDraggableGroup = function(groupId){
    return new Draggable(groupId, {
        constraint : 'vertical',
        ghosting: true,
        mouseOffset: true,

        onStart : function(obj, evt){
            if (!selObjects.length) {return}				
            Draggables.dragging = designerBase.GROUP_LEVEL;
			$(obj.element).addClassName(layoutModule.DRAGGING_CLASS);				
			AdHocTable.draggingGroupOverlay = true;
			$(obj.element).update(selObjects[0].label);				
        },

        onEnd : function(obj, evt){
            Draggables.dragging = null;
            AdHocTable.draggingGroupOverlay = false;
            var overlayIndex = selObjects[0].index;
            if (AdHocTable.draggingMoveOverGroupIndex == -1) {
                isDesignView && AdHocTable.removeGroup();
            }else if (overlayIndex != AdHocTable.draggingMoveOverGroupIndex) {
            	localContext.moveGroup(overlayIndex, AdHocTable.draggingMoveOverGroupIndex);
			} else {
                AdHocTable.initOverlays(); //recreate dragged overlays
            }
            AdHocTable.draggingMoveOverGroupIndex = -1;
        }
    });
};
/*
function moveColumnOnDrag(overlayIndex, AdHocTable.draggingMoveOverColumnIndex){
    moveColumn(overlayIndex, AdHocTable.draggingMoveOverColumnIndex);
}

function moveGroupOnDrag(overlayIndex, AdHocTable.draggingMoveOverGroupIndex){
    moveGroup(overlayIndex, AdHocTable.draggingMoveOverGroupIndex);
}	
*/

AdHocTable.updateColumnWhileDrag = function(evt, element, onHover) {
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
            overlayIndex = AdHocTable.digitRegex.exec(overlayId)[0];
            AdHocTable.draggingMoveOverColumnIndex = overlayIndex;
            var isHovered = true;
            /*
             * Fix for bug 23850
             */
            //if (Draggables.dragging == designerBase.AVAILABLE_FIELDS_AREA) {
            if(Draggables.dragging == 'dimensionsTree' || Draggables.dragging == 'measuresTree'){
                isHovered = AdHocTable.isHoverGreaterThan50Percent(evt, overlayIndex);
            }
            onHover(parseInt(overlayIndex), isHovered);

        } else if (!AdHocTable.draggingColumnSizer && element.match(adhocDesigner.COLUMN_OVERLAY_PATTERN)) {
            element.addClassName("over");
        }
    }

    if (draggingCaresAboutColumns && !overColumn &&  !element.match(adhocDesigner.COLUMN_SIZER_PATTERN)) {
        AdHocTable.draggingMoveOverColumnIndex = -1; //dragging outside columns
    }
};
/*
 * This indicates if we have hovered across more that 50% of a cell.
 */
AdHocTable.isHoverGreaterThan50Percent = function(evt, index){
    var col = AdHocTable.theCols[index];
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
            var header = localContext._getTableHeaders()[index];
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
};

AdHocTable.activateVisualDropCue = function(evt, index){
    var sizer = $("columnSizer_" + index);
    AdHocTable.activateColumnSizer(sizer);
};

AdHocTable.deactivateVisualDropCue = function(evt, index){
    var sizer = $("columnSizer_" + index);
    AdHocTable.deactivateColumnSizer(sizer);
};

AdHocTable.activateColumnSizer = function(sizer){
    if(sizer){
        $(sizer).addClassName("over");
    }
};

AdHocTable.deactivateColumnSizer = function(sizer){
    if(sizer){
        $(sizer).removeClassName("over");
    }
};
