/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */
/*
 * Used to return to adhoc start page
 * @param mode
 */
adhocDesigner.goToTopicView = function(mode){
    location.href = 'flow.html?_flowId=adhocFlow&_mode=' + mode +
        '&launchType=' + localContext.state.launchType +
        '&alreadyEditing=true';
};

adhocDesigner.addWorksheet = function(){
    var ws = new worksheet();
    this.worksheets.push(ws);
    return ws;
};

adhocDesigner.cancelAdHoc = function() {
    if (exists(localContext.isDashboard) && localContext.isDashboard) {
        gotoDefaultLocation();
        return;
    }
    if (usingAdhocLauncher&&(usingAdhocLauncher!='')) {
        history.back();
    } else {
        this.redirectToTopicPage();
    }
};

adhocDesigner.cancelTopic = function(isAlreadyEditing) {
    if(isAlreadyEditing){
        history.back();
    }else{
        designerBase.redirectToHomePage();
    }
};

adhocDesigner.enableCanUndoRedo = function(){
    if (exists(toolbarButtonModule)) {
        toolbarButtonModule.setButtonState($('undo'), localContext.state.canUndo);
        toolbarButtonModule.setButtonState($('redo'), localContext.state.canRedo);
        toolbarButtonModule.setButtonState($('undoAll'), localContext.state.canUndo);
    }
};

adhocDesigner.enableRunAndSave = function(isEnabled){
    if (exists(toolbarButtonModule)) {
        toolbarButtonModule.setButtonState($('save'), isEnabled);
        toolbarButtonModule.setButtonState($('presentation'), isEnabled);
        toolbarButtonModule.setButtonState($('export'), isEnabled);
    }
    canRunAndSave = isEnabled;
};

adhocDesigner.canSaveAdhocReport = function(){
    return localContext.canSaveReport();
};

adhocDesigner.toggleDisplayManager = function(){

    if (adhocDesigner.isDisplayManagerVisible()) {
        jQuery("#" + adhocDesigner.DISPLAY_MANAGER_ID).addClass(layoutModule.HIDDEN_CLASS);
        adhocDesigner.setDisplayManagerVisible(false);
    } else {
        jQuery("#" + adhocDesigner.DISPLAY_MANAGER_ID).removeClass(layoutModule.HIDDEN_CLASS);
        adhocDesigner.setDisplayManagerVisible(true);
    }

    jQuery('#designer').trigger('layout_update');
    adhocDesigner.setShowDisplayManager(adhocDesigner.isDisplayManagerVisible());
};

adhocDesigner.isDisplayManagerVisible = function(){
    return localContext.state.showDisplayManager;
};

adhocDesigner.setDisplayManagerVisible = function(visible){
    localContext.state.showDisplayManager = visible;
};


adhocDesigner.exportReport = function(exportFormat) {
    var exportForm = jQuery(adhocDesigner.EXPORT_FORM_PATTERN);
    exportForm.attr("target", "_blank");
    exportForm.find('input[name="exportFormat"]').val(exportFormat);
    exportForm.submit();
};

adhocDesigner.enableXtabPivot = function(canPivot){
    if (exists(toolbarButtonModule)) {
        toolbarButtonModule.setButtonState($('pivot'), canPivot);
    }
};

adhocDesigner.enableSort = function(canSort){
    if (exists(toolbarButtonModule)) {
        toolbarButtonModule.setButtonState($('sort'), canSort);
    }
};
