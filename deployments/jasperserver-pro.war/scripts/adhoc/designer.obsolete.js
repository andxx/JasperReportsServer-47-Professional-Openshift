/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

adhocDesigner.saveAndRun = function() {
    windowPopUp = window.open("", "jr");
    buttonManager.disable($("execute"));

    var callback = function(state) {
        adhocDesigner.render(state);
        windowPopUp.location  = 'flow.html?_flowId=viewAdhocReportFlow&clientKey=' + clientKey + "&reportUnit=" + localContext.state.tempAruName + "&noReturn=true";
    };
    designerBase.sendRequest('co_saveTemp', [], callback);
};

adhocDesigner.applyAdhocTheme = function(evt, themeParent){
    var matched = null;
    var element = evt.element();
    var newThemeId = null;
    if(themeParent){
        var themeChoices = themeParent.childElements();
        matched = matchAny(element, ["li.button"], true);
        if(matched){
            newThemeId = matched.identify();
            themeChoices.each(function(theme){
                buttonManager.unSelect(theme);
            });
            //select new one
            buttonManager.select(matched);
        }

        if(newThemeId !== selectedThemeId){
            selectedThemeId = newThemeId;
            if($(this.CANVAS_PARENT_ID) && selectedThemeId){
                $(this.CANVAS_PARENT_ID).writeAttribute("class", newThemeId);
                this.toggleAdhocTheme();
            }
        }
    }
};

/**
 * Used to edit report orientation
 * @param orientation
 */
adhocDesigner.orientationSelected = function(orientation) {
    adhocDesigner.setPageOrientation(orientation);
    designerBase.unSelectAll();
};
/**
 * Used to get the report orientation
 */
adhocDesigner.getOrientation = function() {
    return localContext.state.pageOrientation;
};

/**
 * Used to test orientation equality
 * @param thisValue
 */
adhocDesigner.orientationEquals = function(thisValue) {
    return (adhocDesigner.getOrientation() == thisValue);
};

/**
 * Used to get paper size
 */
adhocDesigner.getPaperSize = function() {
    return localContext.state.paperSize;
};

/**
 * Used to test for paper size equality
 * @param thisValue
 */
adhocDesigner.paperSizeEquals = function(thisValue) {
    return adhocDesigner.getPaperSize() == thisValue;
};

/**
 * Used to set paper size for report
 * @param size
 * @param event
 */
adhocDesigner.paperSizeSelected = function(size, event) {
    adhocDesigner.setPaperSize(size);
    designerBase.unSelectAll(event);
};

/*
 * Used to go to Design mode
 */
adhocDesigner.goToDesignView = function() {
    var params = document.location.href.parseQuery();
    delete params['_flowId'];
    delete params['viewReport'];
    delete params['fromDesigner'];
    primaryNavModule.setNewLocation('designer', Object.toQueryString(params));
};

/*
 * Used to go to presentation mode
 */
adhocDesigner.goToPresentationView  = function() {
    var params = document.location.href.parseQuery();
    delete params['_flowId'];
    params['viewReport'] = true;
    params['fromDesigner'] = true;
    primaryNavModule.setNewLocation('designer', Object.toQueryString(params));
};

/**
 * Get all the folders in the available fields tree
 * @param node
 */
adhocDesigner.getAllAvailableFolders = function(node) {
    var result = new Array();

    if (!node) {
        if (!this.availableTree) {
            return result;
        }
        node = this.availableTree.rootNode;
        result.push(node);
    }

    if (node.param.type === this.FOLDER_TYPE) {
        for (var i = 0; i < node.childs.length; i ++) {
            var child = node.childs[i];

            if (child.param.type === this.FOLDER_TYPE) {
                result.push(child);
                result = result.concat(this.getAllAvailableFolders(child));
            }
        }
    }
    return result;
};

adhocDesigner.togglePagePropsRoller = function() {
    selectionObject.pagePropsRollDown = !selectionObject.pagePropsRollDown;
};

adhocDesigner.setFieldValuesOnColumnSelection = function() {

};

adhocDesigner.setFieldValuesOnGroupSelection = function() {

};
/*
 * Called when the report itself is selected
 */
adhocDesigner.selectReport = function() {
    designerBase.unSelectAll();
    this.activateReportSelectionObject();
};
/*
 * Select title section and set the selection area
 */
adhocDesigner.activateReportSelectionObject = function() {
    this.selectSingleObject(titleBar);
    selectionCategory.area = designerBase.TITLE_SELECT_AREA;
};
/**
 * Used to determine if a single field is selected
 */
adhocDesigner.isSingleFieldSelected = function(){
    return (designerBase.getSelectedObject().length == 1);
};
/**
 * Check if field is used as a column
 * @param name
 */
adhocDesigner.isInColumns = function(name) {
    for (var i = 0; i < localContext.state.columns.length; i ++) {
        if (name == localContext.state.columns[i]) {
            return true;
        }
    }
    return false;
};
/**
 * Check if field is used as a group
 * @param name
 */
adhocDesigner.isInGroups = function(name) {
    for (var i = 0; i < localContext.state.groups.length; i ++) {
        if (name == localContext.state.groups[i]) {
            return true;
        }
    }
    return false;
};

adhocDesigner.setPageOrientation = function(orientation) {
    designerBase.sendRequest('co_setPageOrientation', ["o="+orientation]);
};
adhocDesigner.setPaperSize = function(size) {
    designerBase.sendRequest('co_setPaperSize', ["s="+size]);
};
