/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//////////////////////////////////////////////////////////
//Report state
//////////////////////////////////////////////////////////
/*
 * save in a temp location, then when your call returns, launch a new window to view the report
 * the saveTemp method will put the ARU path in the session
 *
 * NOTE: this runs the report in a window named "jr". The first time you run a report it should open a new window,
 * 		but the next time, it will reuse that window.
 * 		There was a bug where if you used the window named "jr", the report would show up in
 * 		the current window but there was no way to get back.
 * 		I`m fixing this by forcing the current window to have a blank name.
 * 		Nothing except this code relies upon window names, but it might be confusing if someone does
 */
adhocDesigner.undo = function() {
    if (localContext.state.modeOnUndo && !localContext.state.modeOnUndo.blank() && (localContext.state.modeOnUndo != localContext.getMode())) {
        adhocDesigner.switchMode(localContext.state.modeOnUndo, "undo");
    } else {
        designerBase.sendRequest('co_undo', [], adhocDesigner.undoAndRedoCallback);
    }
};

adhocDesigner.undoAll = function() {
    if(localContext.state.undoModeNames.length > 0 && localContext.state.undoModeNames[0] !== localContext.getMode()){
        adhocDesigner.switchMode(localContext.state.undoModeNames[0], "undoAll");
    }else{
        designerBase.sendRequest('co_undoAll', [], adhocDesigner.undoAndRedoCallback);
    }
};

adhocDesigner.redo = function() {
    if (localContext.state.modeOnRedo && !localContext.state.modeOnRedo.blank() && (localContext.state.modeOnRedo != localContext.getMode())) {
        adhocDesigner.switchMode(localContext.state.modeOnRedo, "redo");
    } else {
        designerBase.sendRequest('co_redo', [], adhocDesigner.undoAndRedoCallback);
    }
};

adhocDesigner.switchMode = function(requestedMode, undoOrRedo){
    var mode = getTextBeforeUnderscore(requestedMode);
    var params = ["_mode=" + mode];

    if (undoOrRedo) {
        params.push("undoOrRedo=" + undoOrRedo);
    }

    var switchModeCallback = function(state){
        var newMode = state.viewType;
        undoOrRedo && adhocDesigner.selectDisplayModeTab(newMode);
        adhocDesigner.initComponents(newMode);
        adhocDesigner.undoAndRedoCallback(state);
    };

    designerBase.sendRequest('co_switchMode', params, switchModeCallback);
};

adhocDesigner.selectDisplayModeTab = function(mode) {
    jQuery("#displayMode > li").each(function(){
        if (jQuery(this).attr("id").startsWith(mode)) {
            jQuery(this).addClass("selected");
        } else {
            jQuery(this).removeClass("selected");
        }
    });
};

//////////////////////////////////////////////////////////
//Report attributes and options
//////////////////////////////////////////////////////////
adhocDesigner.updateReportTitle = function(currentTitle) {
    //in-case any html remove them
    currentTitle = currentTitle.replace(/<\/?[^>]+(>|$)/g, "");
    if(currentTitle.blank()){
        designerBase.sendRequest('co_setTitle', ['l=_null']);
    }else{
        designerBase.sendRequest('co_setTitle', ['l='+ encodeText(currentTitle)]);
    }
};

adhocDesigner.toggleTitleBar = function() {
    designerBase.sendRequest('co_toggleTitleBar', []);
};

adhocDesigner.setShowDisplayManager = function(show) {
    var callback = function(state){
        //do not need to update anything
        //localContext.standardOpCallback(state);
    };
    designerBase.sendRequest('co_toggleDisplayManager', new Array("name=showDisplayManager", "value=" + show), callback, null);
};

adhocDesigner.toggleAdhocDataSetSize = function(object) {
    var proceed = false;
    var objectId = object.readAttribute("id");

    if(objectId.startsWith("full") && !localContext.state.isShowingFullData){
        proceed = true;
    }else if(objectId.startsWith("sample") && localContext.state.isShowingFullData){
        proceed = true;
    }

    if (proceed) {
        $$('#dataMode > li').each(function(object){
            if($(object).hasClassName("selected")){
                object.removeClassName("selected");
            }
        });
        $(objectId).addClassName("selected");
        var callback = function(state) {
            adhocDesigner.render(state);
            this.checkMaxRowsLimit();
        }.bind(adhocDesigner);
        designerBase.sendRequest('co_toggleAdhocDataSetSize', [], callback);
    }
};

adhocDesigner.tryToKeepServerAlive = function(){
    designerBase.sendRequest('co_tryToKeepServerAlive', [], doNothing);
};

adhocDesigner.setProperty = function(thisName, thisValue, callback) {
    designerBase.sendRequest('co_setProperty', ["name=" + thisName, "value=" + thisValue], callback);
};

adhocDesigner.changeFieldAttributeOrMeasure = function (fieldName, type) {
    designerBase.sendRequest('co_changeFieldAttributeOrMeasure', ['name=' + encodeText(fieldName), 'type=' + type]);
};

adhocDesigner.setFilter = function(filter) {
    designerBase.sendRequest('co_setFilter', ["testFilter="+filter]);
};

adhocDesigner.setSorting = function (sortFields, extra_callback){
    localContext.state.sortFields = sortFields;

    var sortJson = sortFields.toJSON();
    var callback = function(state){
        adhocDesigner.render(state);
        extra_callback();
    };

    designerBase.sendRequest('ta_resort', ['so=' + sortJson], callback);
};

adhocDesigner.pivot = function() {
    localContext.pivot ? localContext.pivot() : designerBase.sendRequest('co_pivot', []);
};

//////////////////////////////////////////////////////////////////////////////////
//Ajax callbacks..
//////////////////////////////////////////////////////////////////////////////////
adhocDesigner.undoAndRedoCallback = function(state) {
    adhocDesigner.updateTrees();
	adHocFilterModule.resetFilterPanel();
    adhocDesigner.render(state);
};

