/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

adhocDesigner.setDragStartState = function(tree, node, draggable, ev) {
    var pointer = [Event.pointerX(ev), Event.pointerY(ev)];
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
};

adhocDesigner.deSelectAllPressedNavMuttons = function(){
    var navMuttons = $$("UL#navigationOptions li");
    if(navMuttons){
        navMuttons.each(function(mutton){
            buttonManager.out($(mutton), function(mutton) {
                return $(mutton).down(layoutModule.LIST_ITEM_WRAP_PATTERN);
            });
        });
    }
};

adhocDesigner.hideAllDialogsAndMenus = function(){
    //hide menu if showing
    actionModel.hideMenu();
    var functions = Object.values(this.dialogESCFunctions);
    functions.each(function(dialogId){
        var dialog = $(dialogId);
        if(dialog){
            dialogs.popup.hide(dialog)
        }
    }.bind(this));
};

adhocDesigner.initPreventBrowserSelection = function(domObject){
    disableSelectionWithoutCursorStyle($(domObject));
};

adhocDesigner.initEnableBrowserSelection = function(domObject){
    enableSelection($(domObject))
};
/*
 * looks for data added to canvas
 */
adhocDesigner.isNoDataToDisplay = function() {
    if (localContext.getMode() === designerBase.TABLE){
        return true;
    }
};

/*
 * Used to show notification for the user,
 * about truncated data when max rows limit is reached
 */
adhocDesigner.checkMaxRowsLimit =  function (){
    if (localContext.state.hitMaxRows && !this.isNoDataToDisplay()){
        //use full full rows count as a system max row limit if hitMaxRows is true
        var msg = rowLimitMessage.replace("{0}", localContext.state.fullRowsCount);
        dialogs.systemConfirm.show(msg, 5000);
    }
};

adhocDesigner.isOnlyFieldsSelected = function(){
    var detectParentNodes = function(node) {
        return node.hasChilds()
    };
    return this.getSelectedTreeNodes().detect(detectParentNodes) == null;
};

adhocDesigner.showButtonMenuMouseOut = function(object){
    actionModel.hideMenu();
    Event.stopObserving($(object), 'mouseleave', adhocDesigner.showButtonMenuMouseOut);
};

/**
 * Test to see if the edit menu is allowed
 */
adhocDesigner.isEditMenuAllowed = function(){
    if (selObjects.length == 1 && adhocDesigner.checkIfAllSelectedAreNumeric()) {
        var selected = designerBase.getSelectedObject();
        var f = adhocDesigner.findFieldByName(adhocDesigner.getNameForSelected(selected));
        if (f != null) {
            res = f.formulaRef != null;
            if (res) {
                return true;
            }
        }
    }
    return false;
};

adhocDesigner.isSelectFieldsAllowed = function(){
    return (isDomainType);
};

/**
 * Check to see if the delete option is allowed
 */
adhocDesigner.isDeleteAllowed = function() {
    if (selObjects.length != 1) {
        return false;
    }
    var fieldName = designerBase.getSelectedObject() ? designerBase.getSelectedObject().param.id : null;
    var field = adhocDesigner.findFieldByName(fieldName);
    return field != null && field.formulaRef != null && !adhocDesigner.isInUse(fieldName);
};

adhocDesigner.isUsedInRowsOrColumns = function(fieldName) {
    return localContext.state.fieldsInUse && localContext.state.fieldsInUse.find(function(field) {
        return field === fieldName;
    });
};

adhocDesigner.canMoveToDimensions = function() {
    var fieldInUse = selObjects.find(function(obj) {
        return obj.param.id === designerBase.SPACER_NAME ||
            !obj.param.extra.isMeasure ||
            adhocDesigner.isUsedInRowsOrColumns(obj.param.extra.id);
    });

    return !fieldInUse;
};

adhocDesigner.canMoveToMeasures = function() {
    var fieldInUse = selObjects.find(function(obj) {
        return obj.param.id === designerBase.SPACER_NAME ||
            obj.param.extra.isMeasure ||
            adhocDesigner.isUsedInRowsOrColumns(obj.param.extra.id);
    });

    return !fieldInUse;
};

adhocDesigner.getMessage = function(messageId, object) {
    var message = adhocDesigner.messages[messageId];
    return message ? new Template(message).evaluate(object ? object : {}) : "";
};

/**
 * Compile and register underscore template in given context.
 *
 * @param context context where template will be used
 * @param templateVar name of template variable in given context
 * @param templateId id od template scipt tag in DOM
 */
adhocDesigner.registerTemplate = function(context, templateId){
    if (!context || !templateId) {
        throw "Some of required params to register template are missing";
    }

    if (!context[templateId]) {
        //temporary replace default template settings
        var oldSettings = _.templateSettings;
        _.templateSettings = {
            evaluate:/\{\{([\s\S]+?)\}\}/g,
            interpolate:/\{\{=([\s\S]+?)\}\}/g,
            escape:/\{\{-([\s\S]+?)\}\}/g
        };

        context[templateId] = _.template(jQuery("#" + templateId).html());
        _.templateSettings = oldSettings;
    }
};

adhocDesigner.updateTrees = function () {
    if (!isDesignView) {
        return;
    }
    designerBase.sendRequest("co_updateAvailableTree", [], function () {
        adhocDesigner.dimensionsTree.showTree(adhocDesigner._AVAILABLE_TREE_DEPTH);
        adhocDesigner.measuresTree.showTree(adhocDesigner._AVAILABLE_TREE_DEPTH);
    });
};

adhocDesigner.hideOnePanel = function() {
    if(window.orientation === 0){
        var panel;
        var filterPanel = document.getElementById('filters');
        var fieldsPanel = document.getElementById('fields');
        var hasFilters = jQuery('#filter-container').find('div.panel.pane.filter').filter(':visible').length;
        var isMinimized = filterPanel.className.indexOf('minimized') >= 0;
        if(!isMinimized) {
            panel = hasFilters ? fieldsPanel : filterPanel;
            layoutModule.minimize(panel);
        }
    }
}
