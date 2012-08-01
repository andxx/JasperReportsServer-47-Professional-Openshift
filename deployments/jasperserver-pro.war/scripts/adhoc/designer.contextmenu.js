/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/*
 * used to show dynamic menu based on context
 * @param event
 * @param updateContextActionModel optional method which
 *  will be called to have ability to change context action model
 */
adhocDesigner.showDynamicMenu = function(event, contextLevel, coordinates, updateContextActionModel){
    //in case we are dealing with multi-select get last item
    var position = selObjects.length;
    if (position > 0) {
        var selected = selObjects[position - 1];
        if(selected && selected.menuLevel) selected.menuLevel = contextLevel;
    }
    //actionModel.showDynamicMenu(contextLevel, event, null, coordinates, adhocDesigner.ACTION_MODEL_TAG, updateContextActionModel);
    localContext.getMode() == 'chart' ?
        actionModel.showDynamicMenu(contextLevel, event, null, coordinates, this.currentWorksheet.chart.actionmodel, updateContextActionModel) :
        actionModel.showDynamicMenu(contextLevel, event, null, coordinates, this.currentWorksheet.grid.actionmodel, updateContextActionModel);

    //document.body.observe('click', adhocDesigner.DynamicMenuOnclick);
};

adhocDesigner.DynamicMenuOnclick = function(event){
    if (!isIPad() && !macOSKeyboardRightClick(event)) {
        actionModel.hideMenu();
        Event.stopObserving(document.body, 'click', adhocDesigner.DynamicMenuOnclick);
    }
};

adhocDesigner.contextMenuHandler = function(event) {
    var matched = null;
    var node = event.memo.node;
    var evt = event.memo.targetEvent;
    /*
     * Tree
     */
    if (adhocDesigner.isCrosstabMode) {
        matched = matchAny(node, localContext.TREE_CONTEXT_MENU_PATTERN, true);
        if (matched) {
            localContext.crosstabTreeMenuHandler(event);
            return;
        }
    } else {
        matched = matchAny(node, adhocDesigner.TREE_NODE_AND_LEAF_PATTERN, true);
        if (matched) {
            node = adhocDesigner.getNodeByEvent(event.memo.targetEvent);
            if (!adhocDesigner.isSelectedNode(node)) {
                adhocDesigner.selectFromAvailableFields(evt, node);
            }
            if (adhocDesigner.isOnlyFieldsSelected()) {
                adhocDesigner.showDynamicMenu(evt, designerBase.FIELD_MENU_LEVEL, null);
            } else {
                adhocDesigner.showDynamicMenu(evt, designerBase.FIELDSET_MENU_LEVEL, null);
            }
            return;
        }
    }
    localContext.contextMenuHandler(evt);
};

