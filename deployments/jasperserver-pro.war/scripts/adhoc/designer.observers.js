/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

adhocDesigner.observePointerEvents = function(){
    document.observe(layoutModule.ELEMENT_CONTEXTMENU, adhocDesigner.contextMenuHandler);
    /*
     * Initialize sample data switcher and switch mode links
     */
    $$('#dataMode > li').each(function(object){
        Event.observe($(object), 'mouseup', function() {
            this.toggleAdhocDataSetSize($(object));
        }.bind(this));
    }.bind(this));
    $$("#displayMode > li").each(function(object){
        Event.observe($(object), 'mouseup', function(){
            var currentMode = localContext.getMode();
            var mode = $(object).identify();
            var re = /\w+/;
            mode = re.exec(mode);
            if(currentMode !== mode){
                this.switchMode(mode[0], null);
            }
        }.bind(this));
    }.bind(this));

    Event.observe(document.body, isSupportsTouch() ? 'touchend' : 'click', function(event) {
        var element =  event.element();

        if (!matchAny(element, ['li.node','li.leaf','ul#' + adhocDesigner.MEASURES_TREE_DOM_ID, 'ul#' + adhocDesigner.DIMENSIONS_TREE_DOM_ID], true)) {
            this.unSelectAvailableTreeNodes();

            if(isSupportsTouch()){
                if(localContext.clickid == element.identify() && event.timeStamp - localContext.clicktime < 700) {
                    event.isEmulatedRightClick = true;
                    document.fire(layoutModule.ELEMENT_CONTEXTMENU, {targetEvent: event, node: element});
                }
                localContext.clicktime = event.timeStamp;
                localContext.clickid = element.identify();
            }
        }

        var matched = matchAny(element, [this.CANVAS_PATTERN, layoutModule.MENU_LIST_PATTERN, this.COLUMN_OVERLAY_PATTERN,
            this.SUMMARY_OVERLAY_PATTERN,
            this.ROW_GROUP_OVERLAY_PATTERN,
            this.COLUMN_GROUP_OVERLAY_PATTERN,
            this.ROW_GROUP_OVERLAY_PATTERN,
            this.COLUMN_GROUP_OVERLAY_PATTERN,
            this.XTAB_MEASURE_HEADER_OVERLAY_PATTERN,
            this.XTAB_MEASURE_OVERLAY_PATTERN,
            this.XTAB_GROUP_HEADER_PATTERN,
            this.ROW_GROUP_MEMBER_PATTERN,
            this.COLUMN_GROUP_MEMBER_PATTERN,
            this.XTAB_GROUP_HEADER_OVERLAY_PATTERN,
            this.GROUP_OVERLAY_PATTERN, this.MENU_PATTERN], true);

        if (!matched) {
            if (localContext.getMode() === designerBase.CROSSTAB) {
                crossTabMultiSelect && crossTabMultiSelect.deselectAllGroupMembers();
            }
            if (localContext.getMode() === designerBase.TABLE
                || localContext.getMode() === designerBase.CROSSTAB
                || localContext.getMode() === designerBase.CHART) {
                localContext.deselectAllSelectedOverlays();
            }
        }

        (!isRightClick(event) && !event.isEmulatedRightClick && !matched) && actionModel.hideMenu();

    }.bind(adhocDesigner));
};

adhocDesigner.observeKeyEvents = function keys(){
    document.stopObserving('key:save').observe('key:save' , function(event) {
        //hide menu if showing
        actionModel.hideMenu();
        if(localContext.canSaveReport()){
            designerBase.handleSave();
        }
        Event.stop(event.memo.targetEvent);
    }.bind(this));

    document.stopObserving('key:undo').observe('key:undo' , function(event) {
        //hide menu if showing
        actionModel.hideMenu();
        //nasty hack for now. Will come back to it.. Promise
        if (localContext.state.canUndo && !buttonManager.isDisabled($("undo"))) {
            this.undo();
        }
        Event.stop(event.memo.targetEvent);
    }.bind(this));

    document.stopObserving('key:redo').observe('key:redo' , function(event) {
        //hide menu if showing
        actionModel.hideMenu();
        //nasty hack for now. Will come back to it.. Promise
        if (localContext.state.canRedo && !buttonManager.isDisabled($("redo"))) {
            this.redo();
        }
        Event.stop(event.memo.targetEvent);
    }.bind(this));

    document.stopObserving('key:escape').observe('key:escape' , function() {
        //hide menu if showing
        actionModel.hideMenu();
        var functions = Object.values(this.dialogESCFunctions);
        functions.each(function(dialogId){
            var dialog = $(dialogId);
            if(dialog){
                dialogs.popup.hide(dialog)
            }
        }.bind(this));

        //if in chart the stopObserving for drag listener is not invoked, this is our only hope :-)
        if(localContext.getMode() == designerBase.CHART){
            if (localContext.currentlyDragging) {
                Event.stopObserving(document.body, 'mousemove');
                localContext.resizeChart();
                localContext.currentlyDragging = false;
            }
        }
    }.bind(this));
};

adhocDesigner.observeCustomEvents = function custom(){
    jQuery('#designer').bind({
    	'layout_update': function(){
    		var cc = jQuery('#adhocCanvasContainer');
    		var hd = cc.prev();
    		var off = parseInt(cc.css('margin-top')) || 0;
    		var hh = hd.height() - 100;
        	var top = hh - off;
            cc.css('top',top+'px');
    	},
    	'report_name_update': function(e,n){
    		adhocDesigner.ui.header_title.html(n);
    	}
    });
    jQuery(window).resize(function () {
        // code copied on purpose - higher performance
        var cc = jQuery('#adhocCanvasContainer');
        if (cc.length) {
            var hd = cc.prev();
            var off = parseInt(cc.css('margin-top')) || 0;
            var hh = hd.height() - 100;
            var top = hh - off;
            cc.css('top', top + 'px');
        }
    });

};

adhocDesigner.observeTableContainerEvents = function(){
    $('mainTableContainer').observe(isSupportsTouch() ? 'touchstart':'mousedown', function(e){localContext.mouseDownHandler(e)});
    $('mainTableContainer').observe(isSupportsTouch() ? 'touchend':'mouseup', function(e){
        localContext.mouseUpHandler(e);
        //adhocDesigner.deSelectAllPressedNavMuttons();
        adhocDesigner.adhocTitleEdit.call(this, e);
    }.bind(this));
    $('mainTableContainer').observe("mouseover", function(e){localContext.mouseOverHandler(e)});
    $('mainTableContainer').observe("mouseout", function(e){localContext.mouseOutHandler(e)});
    $('mainTableContainer').observe("click", function(e){localContext.mouseClickHandler(e)});

    Event.observe($('mainTableContainer'), isSupportsTouch() ? 'touchmove':'scroll', function() {
        if(localContext.getMode() === designerBase.TABLE){
            localContext.tableScrolled();
        }
        actionModel.hideMenu();
    });
};

adhocDesigner.observeTreeEvents = function(tree,otherTree){
    tree.observe('leaf:dblclick', function(event) {
        if(this.isCrosstabMode) {
            var xt = AdHocCrosstab;
            if(tree.dragClasses == 'dimension') {
                if (xt.canAddLevelAsRowGroup()) {
                    xt.appendDimensionToRowAxisWithLevel();
                } else if (xt.canAddLevelAsColumnGroup()) {
                    xt.appendDimensionToColumnAxisWithLevel();
                }
            } else {
                if (xt.canAddLevelAsColumnGroup()) {
                    xt.appendMeasureToColumn();
                } else if (xt.canAddLevelAsRowGroup()) {
                    xt.appendMeasureToRow();
                }
            }
        } else {
            var evt = event.memo.targetEvent;
            this.addFieldToCanvas(evt);
        }
    }.bind(this));
    
    tree.observe('leaf:selected', function(event) {
        var node = event.memo.node;
        var evt = event.memo.targetEvent;
        otherTree._deselectAllNodes();
        this.selectFromAvailableFields(evt, node);
    }.bind(this));

    tree.observe('node:selected', function(event) {
        var node = event.memo.node;
        var evt = event.memo.targetEvent;
        otherTree._deselectAllNodes();
        this.selectFromAvailableFields(evt, node);
    }.bind(this));

    tree.observe('leaf:unselected', function(event){
        var node = event.memo.node;
        this.isCrosstabMode ? crossTabMultiSelect.removeSelectedObject(node) : this.removeSelectedObject(node);
    }.bind(this));

    tree.observe('node:unselected', function(event){
        var node = event.memo.node;
        this.isCrosstabMode ? crossTabMultiSelect.removeSelectedObject(node) : this.removeSelectedObject(node);
    }.bind(this));

    tree.observe('items:unselected', function(){
        designerBase.unSelectAll();
    }.bind(this));

    tree.observe('node:dblclick', function(event){
        //update cookie info.
        this._availableTreeLastOpened = event.memo.node.param.uri;
        new JSCookie(this._cookieName, this._availableTreeLastOpened, this._cookieTime);
    }.bind(this));

    tree.observe('node:click', function(event){
        //update cookie info.
        this._availableTreeLastOpened = event.memo.node.param.uri;
        new JSCookie(this._cookieName, this._availableTreeLastOpened, this._cookieTime);
    }.bind(this));

    tree.observe('tree:loaded', function() {
        tree.openAndSelectNode(this._availableTreeLastOpened, function(){
            this.updateAllFieldLabels();
        }.bind(this));
    }.bind(this));
    /*
     * Key events
     */
    tree.observe('key:contextMenu', function(event) {
        var node = event.memo.node;
        var nodePosition = getBoxOffsets(node, true);
        adhocDesigner.showDynamicMenu(event, designerBase.FIELD_MENU_LEVEL, {
            menuLeft: nodePosition[0] + 100,
            menuTop: nodePosition[1] + 20
        }); //TODO: use constants for offsets
        Event.stop(event);
    });
};

adhocDesigner.observeDisplayManagerEvents = function() {
    // Unbind all existing events
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:addItem');
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:addItems');
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:removeItem');
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:moveItem');
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:measureReorder');
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:switchItem');
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).unbind('lm:contextMenu');

    // Bind Layout Manager events
    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:addItem', function(event, options) {
        // Merge with defaults
        options = _.extend({index : -1, levelIndex : -1}, options);
        localContext.lmHandlersMap[options.axis].addItem(options.dimension, options.index, options.level, options.levelIndex, options.isMeasure, options.uri);
    });

    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:removeItem', function(event, options) {
        localContext.lmHandlersMap[options.axis].removeItem(options.item, options.index);
    });

    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:addItems', function(event, options) {
        localContext.lmHandlersMap.addItems(options.levels, options.index, options.axis);
    });

    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:moveItem', function(event, options) {
        localContext.lmHandlersMap[options.axis].moveItem(options.item, options.from, options.to);
    });

    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:switchItem', function(event, options) {
        localContext.lmHandlersMap[options.axis].switchItem(options.item, options.from, options.to);
    });

    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:measureReorder', function(event, options) {
        localContext.lmHandlersMap.measureReorder(options.measure, options.to);
    });

    jQuery('#' + adhocDesigner.DISPLAY_MANAGER_ID).bind('lm:contextMenu', function(event, options) {
        localContext.lmHandlersMap[options.extra.axis].contextMenu(event, options);
    });
};

window.addEventListener && window.addEventListener('orientationchange',function(e){
    adhocDesigner.hideOnePanel();
});





