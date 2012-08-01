/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/**
 * This file should only include functions that are used by both data explorer and dashboard.
 */

//////////////////////////////////////////////////////////////////////////////////////////
//global variables
//////////////////////////////////////////////////////////////////////////////////////////

var theBody;
var fieldsTable;
var savePanel;
var canRunAndSave;
var nullStateValue = "_null";
var multiSelect = false;
var saveOldLabel = '';
var saveOldFolder = '';
var flowExecutionKey;
var notificationButton;
var notification;
var saveAsTree;
var editor;
var windowPopUp;

//////////////////////////////////////////////////////////////////////////////////////////
//Global objects
//////////////////////////////////////////////////////////////////////////////////////////

/**
 *  All actions should be pre-fixed with the controller type
 * eg ta_moveColumn
 * which will be stripped to get the final java method
 * eg moveColumn()
 **/
var controllerMap = {
    'ta':'/adhoc/table.html',
    'cr':'/adhoc/crosstab.html',
    'ch':'/adhoc/chart.html',
    'da':'/dashboard/dashboard.html',
    'st':'/adhoc/status.html', // request log
    'co':'/adhoc/table.html', //common - could go to any controller - ends up in superclass
    '':'/adhoc/table.html?' //default
};


//////////////////////////////////////////////////////////////////////////////////////////////
//generic state (updated in baseState.jsp)
//////////////////////////////////////////////////////////////////////////////////////////////

//key to this client's session attribute values
var clientKey;
var cancelQueryTimer;


function SelectedFormula() {
    this.reset();
}

SelectedFormula.prototype.reset = function() {
    this.formulaId = null;
    this.constant = null;
    this.isEdited = false;
    this.isSwapped = false;
    this.isChanged = false;
};

var selectedFormula = new SelectedFormula();

///////////////////////////////////////////////
// General designer selection functions
///////////////////////////////////////////////
function SelectionCategory() {
    this.area = "";
    this.reset = function() {
        this.area = "";
    }
}

var selectionCategory = new SelectionCategory();
var selObjects = new Array();

var timeoutValue = null;
var TIMEOUT_INTERVAL = null;
var ADHOC_SESSION_TIMEOUT_MESSAGE = null;
var ADHOC_EXIT_MESSAGE = null;
var DASHBOARD_SESSION_TIMEOUT_MESSAGE = null;
var DASHBOARD_EXIT_MESSAGE = null;

var designerBase = {

    //////////////////////////////////////////////////////////////////////////////////////////
    //Global constants
    //////////////////////////////////////////////////////////////////////////////////////////

    AVAILABLE_FIELDS_AREA : "af",
    DASHBOARD_SPECIAL_CONTENT_TREE_AREA : "dsc",
    DASHBOARD_REPO_TREE_AREA : "drp",
    CROSSTAB_SELECT_AREA : "cr",
    TABLE_SELECT_AREA : "tb",
    CHART_SELECT_AREA : "ch",
    TITLE_SELECT_AREA : "co",
    CHART_LEGEND_AREA : "clg",
    REPORT_MENU_LEVEL : "reportLevel",
    FIELD_MENU_LEVEL : "fieldLevel",
    FIELDSET_MENU_LEVEL : "fieldSetLevel",
    COLUMN_LEVEL : "columnLevel",
    GROUP_LEVEL : "groupLevel",
    CHART_LEVEL : "chartLevel",
    SUMMARY_LEVEL : "summaryLevel",
    COLUMN_GROUP_MENU_LEVEL : 'columnGroupLevel',
    ROW_GROUP_MENU_LEVEL : 'rowGroupLevel',
    MEASURE_MENU_LEVEL : 'measureLevel',
    LEGEND_MENU_LEVEL : 'legendItemLevel',
    MEMBER_GROUP_MENU_LEVEL : 'memberGroupCell',
    DASHBOARD_SPECIAL_CONTENT_TREE_LEVEL : 'dashboardSpecialContentTreeLeafLevel',
    DASHBOARD_REPO_TREE_LEVEL : 'dashboardRepoTreeLeafLevel',
    DASHBOARD_CONTENT_FRAME_MENU_LEVEL : 'dashboardContentFrameLevel',
    DASHBOARD_TEXT_FRAME_MENU_LEVEL : 'dashboardTextFrameLevel',
    DASHBOARD_CLICKABLE_FRAME_MENU_LEVEL : 'dashboardClickableFrameLevel',
    DASHBOARD_CONTROL_FRAME_MENU_LEVEL : 'dashboardControlFrameLevel',
    SPACER_NAME : "_spacer",
    DEFAULT_THEME_ID : "default",
    TABLE : "table",
    CHART : "chart",
    CROSSTAB : "crosstab",
    OLAP_CROSSTAB : "olap_crosstab",
    DASHBOARD : "dashboard",
    DASHBOARD_RUNTIME : "dashboardRuntime",
    SAVE_AS_TREE_DOM_ID : "saveAsFoldersTree",
    UNDEFINED_STRING : "undefined",
    CLOBBER : "clobber",
    LABEL_MAX_LEN : 94,
    DESC_MAX_LEN : 249,
    DRAGGABLE_GHOST_HEIGHT : "20px",
    DRAGGABLE_GHOST_WIDTH : "150px",

    /////////////////////////////////////////////////
    // init code for all modes inc. dashboard
    /////////////////////////////////////////////////

    /**
     * Init-all items
     */
    superInitAll : function() {
        theBody = document.body;
        localContext.initAll();
        if(localContext.getMode() !== designerBase.DASHBOARD){
            adhocDesigner && adhocDesigner.initExplorerObjectListeners();
        }
        restoreDefaultCursor();
    },


    /**
     * Update flow key
     */
    updateFlowKey : function() {
        // look for flow key somewhere and update, so it can be used by ajax
        var flowDiv = $("flowId");
        if (flowDiv) {
            flowExecutionKey = flowDiv.getAttribute("value");
        }
    },


    setState : function() {
        var stateSnapshotScript = $("stateSnapshotScript");
        if (stateSnapshotScript != null) {
            window.eval(stateSnapshotScript.text);
            state = eval("(" + stateSnapshot + ")");
            stateSnapshotScript.parentNode.removeChild(stateSnapshotScript);
        }
    },


    getCanRunAndSave : function() {
        return canRunAndSave;
    },


    /**
     * Handle the save request.
     */
    handleSave : function() {
        if (saveLabel) {
            designerBase.save(saveFolder, saveLabel, saveDesc, true);
        } else {
            designerBase.launchSaveDialog();
        }
    },


    /**
     * Handle the save as request.
     */
    handleSaveAs : function() {
        designerBase.launchSaveDialog();
    },


    handleSaveAndGenerate : function() {
        if (saveLabel) {
            designerBase.checkSave(saveFolder, saveLabel, saveDesc, false,
                {reportName: saveLabel + " " + defaultReportSuffix}).then(function() {
                designerBase.launchSaveDialog({forDataView: false, forReport: true});
            });
        } else {
            designerBase.launchSaveDialog({forDataView: true, forReport: true});
        }
    },

    getSelectedObject : function(index){
        if(index && !isNaN(index) && (index < selObjects.length)){
            return selObjects[index];
        }
        return selObjects[0];
    },


    getLastSelectedObject : function(){
        return selObjects[selObjects.length - 1];
    },


    isSelectedNodeAFolder : function(){
        if(selObjects.length != 1){
            return true;
        }
        if(selectionCategory.area === designerBase.AVAILABLE_FIELDS_AREA){
            var node = this.getSelectedObject();
            return (node ? node.isParent() : false);
        }else{
            return false;
        }
    },

    /**
     * Deselect all selected items
     */
    unSelectAll : function() {
        selObjects.clear();
    },


    addToSelected : function(obj) {
        var found = this.isInSelection(obj);
        if (!found) {
            selObjects.push(obj);
        }
    },


    /**
     * This determines if the user is requesting multiselect on the same area
     * as the existing selections
     * @param e
     * @param area
     */
    shouldClearSelections : function(e, area) {
        var ctrl = isMetaHeld(e);
        var shift = isShiftHeld(e);
        area = selectionCategory.area == area;
        return !(area && (ctrl||shift));
    },


    /**
     * Deselect specific item
     * @param obj
     */
    unSelectGiven : function(obj) {
        selObjects = selObjects.without(obj);
    },


    /**
     * Check if item is selected
     * @param obj
     */
    isInSelection : function(obj) {
        for (var i = 0; i < selObjects.length; i++) {
            if(selectionCategory.area === this.COLUMN_LEVEL){
                if (obj.header && selObjects[i].header && (obj.header.getAttribute("data-fieldName") == selObjects[i].header.getAttribute("data-fieldName"))) {
                    return true;
                }
            }else if(selectionCategory.area === this.GROUP_LEVEL){
                if (obj.fieldName === selObjects[i].fieldName) {
                    return true;
                }
            }else if(selectionCategory.area === this.ROW_GROUP_MENU_LEVEL
                    || selectionCategory.area === this.COLUMN_GROUP_MENU_LEVEL
                    || selectionCategory.area === this.LEGEND_MENU_LEVEL
                    || selectionCategory.area === this.MEASURE_MENU_LEVEL){
                if (obj.id === selObjects[i].id) {
                    return true;
                }
            }else{
                if (obj == selObjects[i]) {
                    return true;
                }
            }

        }
        return false;
    },

    isObjectInSelection : function(obj, comparison) {
        for (var i = 0; i < selObjects.length; i++) {
            if(comparison){
                if(obj[comparison] == selObjects[i][comparison]){
                    return true;
                }
            }else{
                if(obj == selObjects[i]){
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Helper method used to reset /clear all existing overlays in a set
     * @param overlaySet
     */
    clearOverlaySet : function(overlaySet){
        if(overlaySet && (overlaySet.length > 0)){
            overlaySet.each(function(overlay){
                var id = $(overlay).identify();
                if($(id)){
                    $(id).remove();
                }
            });
            overlaySet.clear();
        }
    },


    /**
     * Helper method to deselect any overlay type
     * @param overlaySet
     * @param cssClass
     */
    deselectOverlaySet : function(overlaySet, cssClass){
        if(overlaySet && overlaySet.length > 0){
            overlaySet.each(function(overlay){
                $(overlay).removeClassName(cssClass);
            });
        }
    },


    enableSelection : function() {
        if(localContext.getMode() !== designerBase.DASHBOARD){
            adhocDesigner && adhocDesigner.initEnableBrowserSelection($("designer"));
        }
    },

    disableSelection : function() {
        if(localContext.getMode() !== designerBase.DASHBOARD){
            adhocDesigner && adhocDesigner.initPreventBrowserSelection($("designer"));
        }
    },

    createAdhocSaveDialog: function() {
        var designer = this;
        savePanel = new JRS.SaveAsDialog({
                templateMatcher: "#saveDataViewAndReport",
                inputMatchers: {
                    dataViewName: ".dataViewName",
                    dataViewDescription: ".dataViewDescription",
                    reportName: ".reportName",
                    reportDescription: ".reportDescription"
                },
                organizationId: organizationId,
                publicFolderUri: publicFolderUri,
                validator: function(placeToSave) {
                    var messageVariantForFolder = null;
                    var valid = true;

                    if(placeToSave.params.forDataView) {
                        valid = valid && designer.validateSaveNamePresent(placeToSave.dataViewName, "dataView") &&
                            designer.validateDescription(placeToSave.dataViewDescription, "dataView");
                        messageVariantForFolder = "dataView";
                    }

                    if(placeToSave.params.forReport) {
                        valid = valid && designer.validateSaveNamePresent(placeToSave.reportName, "report") &&
                            designer.validateDescription(placeToSave.reportDescription, "report");
                        messageVariantForFolder = "report";

                        if(placeToSave.reportName == placeToSave.dataViewName &&
                            (placeToSave.params.forDataView || placeToSave.folder == saveFolder)) {
                            alert(designerMessages.datasourceOverwrite);
                            valid = false;
                        }
                    }

                    if(placeToSave.params.forDataView && placeToSave.params.forReport) {
                        messageVariantForFolder = "reportAndDataView";
                    }
                    valid = valid && designer.validateSaveFolder(placeToSave, messageVariantForFolder);

                    return valid;
                },

                saveHandler: function(placeToSave) {
                    var dataViewOverwriteOk = !placeToSave.params.forDataView || (saveLabel === placeToSave.dataViewName) && (saveFolder === placeToSave.folder);

                    var addOns = {dataViewOverwriteOk: dataViewOverwriteOk};
                    if(placeToSave.params.forReport) {
                        addOns.reportName = placeToSave.reportName;
                        addOns.reportDescription = placeToSave.reportDescription;
                        addOns.reportFolder = placeToSave.folder;
                    };

                    //save DataView
                    var saveDeferred;
                    if(placeToSave.params.forDataView) {
                        saveDeferred = designer.save(placeToSave.folder, placeToSave.dataViewName, placeToSave.dataViewDescription, false, addOns);
                    } else {
                        saveDeferred = designer.save(null, null, null, false, addOns);
                    }
                    if(placeToSave.params.forDataView) {
                        return saveDeferred.then(function() {
                            saveLabel = placeToSave.dataViewName;
                            saveDesc = placeToSave.dataViewDescription;
                            saveFolder = placeToSave.folder;
                        });
                    } else {
                        return saveDeferred;
                    }
                }
            });
    },

    createDashboardSaveDialog: function() {
        var designer = this;
        savePanel = new JRS.SaveAsDialog({
            templateMatcher: "#saveAs",
            okButtonMatcher: "#saveAsBtnSave",
            cancelButtonMatcher: "#saveAsBtnCancel",
            inputMatchers: {
                resourceName: "#saveAsInputName",
                resourceDescription: "#saveAsInputDescription"
            },
            organizationId: organizationId,
            publicFolderUri: publicFolderUri,
            validator: function(placeToSave) {
                var valid = designer.validateSaveNamePresent(placeToSave.resourceName, "dashboard") &&
                    designer.validateDescription(placeToSave.resourceDescription, "dashboard") &&
                    designer.validateSaveFolder(placeToSave, "dashboard");
                return valid;
            },
            saveHandler: function(placeToSave) {
                var overwriteOk = (saveLabel === placeToSave.resourceName) && (saveFolder === placeToSave.folder);
                //save dashboard
                return designer.save(placeToSave.folder, placeToSave.resourceName, placeToSave.resourceDescription, overwriteOk).then(function() {
                    saveLabel = placeToSave.resourceName;
                    saveDesc = placeToSave.resourceDescription;
                    saveFolder = placeToSave.folder;
                });
            }
        });
    },

    launchSaveAdhocDialog: function(params) {
        if(params === undefined) {
            params = {
                forDataView: true,
                forReport: false
            };
        }
        if(!savePanel) {
            this.createAdhocSaveDialog();
        }

        function updateVisibility(saveAsDialog, params) {
            if(params.forDataView) {
                saveAsDialog.dialogElement.addClass("forDataView"); //needed for folders tree placement
                saveAsDialog.dialogElement.find(".forDataView").removeClass("hidden");
            } else {
                saveAsDialog.dialogElement.removeClass("forDataView");
                saveAsDialog.dialogElement.find(".forDataView").addClass("hidden");
            }
            if(params.forReport) {
                saveAsDialog.dialogElement.addClass("forReport");
                saveAsDialog.dialogElement.find(".forReport").removeClass("hidden");
            } else {
                saveAsDialog.dialogElement.removeClass("forReport");
                saveAsDialog.dialogElement.find(".forReport").addClass("hidden");
            }
            if(params.forDataView && !params.forReport) {
                saveAsDialog.dialogElement.find(".forDataViewOnly").removeClass("hidden");
            } else {
                saveAsDialog.dialogElement.find(".forDataViewOnly").addClass("hidden");
            }
        }

        updateVisibility(savePanel, params);

        var dataViewName = saveLabel || defaultSaveName;
        var placeToSave = {
            dataViewName: dataViewName,
            dataViewDescription: saveDesc,
            reportName: dataViewName + " " + defaultReportSuffix,
            reportDescription: "",
            folder: saveFolder && saveFolder.length > 0 ? saveFolder : "/",
            params: params
        }

        savePanel.open(placeToSave).then(function() {
            adhocDesigner !== undefined && adhocDesigner.initPreventBrowserSelection(savePanel.foldersTree[0]);

            if(params.forDataView) {
                savePanel.dialogElement.find(".dataViewName").focus().select();
            } else if(params.forReport) {
                savePanel.dialogElement.find(".reportName").focus().select();
            }
        });
    },


    launchSaveDashboardDialog: function() {
        if(!savePanel) {
            this.createDashboardSaveDialog();
        }

        var placeToSave = {
                resourceName: saveLabel || defaultSaveName,
                resourceDescription: saveDesc,
                folder: saveFolder && saveFolder.length > 0 ? saveFolder : "/"
            }

        savePanel.open(placeToSave).then(function() {
            savePanel.dialogElement.find("#saveAsInputName").focus().select();
        });
    },

    launchSaveDialog: function(params) {
        if(localContext.getMode() == designerBase.DASHBOARD) {
            this.launchSaveDashboardDialog();
        } else {
            this.launchSaveAdhocDialog(params);
        }

        designerBase.enableSelection();
    },

    launchDependenciesDialog : function(checkSaveModel, saveParams) {
        var deferred = jQuery.Deferred();
        dialogs.dependentResources.show(checkSaveModel.dependentReports, {
            dependenciesBtnSave: function () {
                deferred.resolve();
            },
            dependenciesBtnSaveAs: function () {
                deferred.reject();
                var forReport = saveParams.addOns != null && saveParams.addOns.reportName != null;
                designerBase.launchSaveDialog({forDataView: true, forReport: forReport});
            },
            dependenciesBtnCancel: function () {
                deferred.reject();
            }},
        {
        	canSave: true,
            okOnly: false,
            topMessage: checkSaveModel.topMessage,
            bottomMessage: checkSaveModel.bottomMessage
        });
//        designerBase.enableSelection();
        return deferred;
    },

    selectSaveDirectory : function(){
        saveAsTree.openAndSelectNode(saveFolder);
    },



    okSaveDialog : function() {
        saveOldLabel = "";
        saveOldFolder = "";
        designerBase.hideSaveDialog();
        this._saveConfirmMessage();
    },



    validateSaveNamePresent : function(saveLabel, messageVariant) {
        if (!saveLabel || saveLabel.blank()) {
            alert(designerMessages.emptyName[messageVariant]);
            return false;
        }
        if(saveLabel.length > this.LABEL_MAX_LEN) {
            alert(designerMessages.saveLabelError[messageVariant].replace("{0}", this.LABEL_MAX_LEN));
            return false;
        }
        return true;
    },

    validateDescription : function(saveDesc, messageVariant) {
        if (!saveDesc || saveDesc.blank()) {
            return true;
        }
        if(saveDesc.length > this.DESC_MAX_LEN) {
            alert(designerMessages.saveDescriptionError[messageVariant].replace("{0}", this.DESC_MAX_LEN));
            return false;
        }
        return true;
    },

    validateSaveFolder : function(placeToSave, messageVariant){
        if(placeToSave.folder == null){
            alert(designerMessages.nonSelectedFolder[messageVariant]);
            return false;
        }
        if(!placeToSave.isWritable){
            var msq = designerMessages.selectedFolderIsNotWritable[messageVariant];
            alert(msq.replace("{0}", placeToSave.folder));
            return false;
        }
        return true;
    },




    launchJSOverwriteConfirm : function(msg) {
        if (confirm(msg)) {
            this.overwriteConfirmed();
        } else {
            saveLabel = null;
        }
    },

    overwriteConfirmed : function() {
        this.save(saveFolder, saveLabel, saveDesc, true);
    },


    /**
     * Used to update the session warning message
     * @param event
     */
    updateSessionWarning : function(event){
        //update of session timeout
        if(TIMEOUT_INTERVAL > 0){
            var MILL_PER_MIN = 60000;
            var diff = TIMEOUT_INTERVAL - MILL_PER_MIN;
            var delay = diff > MILL_PER_MIN ? diff :  TIMEOUT_INTERVAL;
            window.clearTimeout(timeoutValue);
            timeoutValue = window.setTimeout(function(){return designerBase.showExpirationDialog()}, delay);
        }
    },


    /**
     * Session notification
     */
    showExpirationDialog : function(){
        var keepAlive = false;
        if(localContext.getMode() !== this.DASHBOARD){
            keepAlive = confirm(ADHOC_SESSION_TIMEOUT_MESSAGE + getSessionExpireTime());
        }else{
            keepAlive = confirm(DASHBOARD_SESSION_TIMEOUT_MESSAGE + getSessionExpireTime());
        }

        //send keep alive request.
        if (keepAlive) {
            if (localContext.getMode() !== designerBase.DASHBOARD) {
                adhocDesigner.tryToKeepServerAlive();
            } else {
                localContext.tryToKeepServerAlive();
            }
        }
    },


    initAdhocSpecificDesignerBaseVar :function(){
        TIMEOUT_INTERVAL = serverTimeoutInterval * 1000; //since intervals are in milli-secs we need to multiply by 1000
        ADHOC_SESSION_TIMEOUT_MESSAGE = adHocSessionExpireCode;
        ADHOC_EXIT_MESSAGE = adHocExitConfirmation;
    },


    /**
     * Method to determine what to do when a person leaves ad hoc.
     */
    confirmAndLeave : function(){
        if(localContext.getMode() === designerBase.DASHBOARD){
            return confirm(DASHBOARD_EXIT_MESSAGE);
        }else{
            if (localContext.state.canUndo && localContext.state.isWritable) {
                return confirm(ADHOC_EXIT_MESSAGE);
            }
        }

        return true;
    },


    ////////////////////////////////////////////////////////
    // ajax infra
    ////////////////////////////////////////////////////////

    //we should fold this one into the infrastructure below?
    sendAjaxActionRequest : function(otherParams,postFillAction, postData) {
        var thisURL = this.getFilterDialogFlowURL(otherParams, postData);
        ajaxTargettedUpdate(thisURL, {
            fillLocation: 'ajaxbuffer',
            callback: postFillAction,
            errorHandler: errorHandler,
            postData: postData
        });

    },

    sendSelectiveAjaxActionRequest : function(otherParams,postFillAction, postData) {
        var thisURL = this.getFilterDialogFlowURL(otherParams, postData);
        ajaxTargettedUpdate(thisURL, {
            fillLocation: 'ajaxbuffer',
            callback: postFillAction,
            errorHandler: errorHandler,
            postData: postData,
            mode: AjaxRequester.prototype.CUMULATIVE_UPDATE
        });
    },


    getFilterDialogFlowURL : function(otherParams, postData) {
        var thisURL = urlContext + "/flow.html?_flowId=adhocAjaxFilterDialogFlow";
        if (otherParams != null) {
            for (var i=0; i < otherParams.length; i++) {
                thisURL += '&' + otherParams[i];
            }
        }
        //add clientKey
        thisURL = thisURL + "&clientKey=" + clientKey;
        return thisURL;
    },

    ////////////////////////////////////////////////////////
    // ajax requests
    ////////////////////////////////////////////////////////

    sendRequestToAjaxBuffer : function(action,otherParams,postFillAction) {
        this.sendRequest(action,otherParams,postFillAction,{"target" :'ajaxbuffer', mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});

    },

    /**
     * Make an ajx request
     * @param {Object} action
     * @param {Object} otherParams
     * @param {Object} postFillAction
     * @param {Object} options : Array containing the following:
     *                 options["target"] container to place response in - defaults to "mainTableContainer"
     *                 options["bPost"]
     *                 options["sourceContainer"]
     *                 options["mode"] - cumulative, selective etc (optional)
     */
    sendRequest : function(action,otherParams,postFillAction,options,customErrorHandler) {
        var bPost = options && options.bPost;
        var target = options && options.target;
        //TODO: designer.base.js is common for adhoc and dashboard so need to
        // move out adhoc specific code out here
        target = target || (isSupportsTouch() ? $('mainTableContainer').down().identify() : 'mainTableContainer');
        var mode = (options && options.mode) || AjaxRequester.prototype.EVAL_JSON;
        var container = options && options.container;
		var hideLoader = options && options.hideLoader;
        
		var actionPrefix = getTextBeforeUnderscore(action);
        var javaAction = getTextAfterUnderscore(action);
        var thisURL = urlContext + controllerMap[actionPrefix];
        /*
        if (localContext.getMode() !== this.DASHBOARD && !action.include(localContext.FETCH_MORE_ROWS)) {
            ajax.cancelRequestsBefore = (new Date()).getTime();
        }
 		*/
        var params = "action=" + javaAction;
        otherParams && otherParams.each(function(s){params += '&' + s;});
        //finally session map key
        params += '&clientKey=' + clientKey;
        if (!bPost) {
            thisURL += '?' + params;
            params = null;
        }

        //TODO move adhoc-related code out from here
        if(localContext.getMode() !== this.DASHBOARD && postFillAction == null) {
            postFillAction = adhocDesigner.render;
        }

        var internalErrorHandler = function(ajaxAgent) {
            var result = errorHandler(ajaxAgent);
            result && customErrorHandler && customErrorHandler(ajaxAgent);
            return result;
        };

        if(isIPad() && action != 'ta_fetchMoreRows') {
            designerBase.updateMainOverlay('');
        }

        if (typeof adhocDesigner !== 'undefined') {
            actionModel && actionModel.hideMenu();
            adhocDesigner && adhocDesigner.unSelectAvailableTreeNodes();
        }
        
        var delayedFn = function(updateURL, ajaxResponseTarget, postResponseCallback, params) {
            return function() {

                var callbackWrapper = function() {
                    clearTimeout(cancelQueryTimer);
                    cancelQueryTimer = null;
                    designerBase.updateMainOverlay('hidden');

                    if (postResponseCallback) {
                        if (typeof(postResponseCallback) == 'string') {
                            eval(postResponseCallback);
                        } else {
                            postResponseCallback.apply(null,arguments);
                        }
                    }
                };

                if (target == designerBase.CLOBBER) {
                    return ajaxClobberredUpdate(
                            updateURL, {
                        callback: callbackWrapper,
                        errorHandler: internalErrorHandler,
                        postData: params
                    });
                } else {
                    return ajaxTargettedUpdate(updateURL,{
                        fillLocation: ajaxResponseTarget,
                        fromLocation: container,
                        callback: callbackWrapper,
                        errorHandler: internalErrorHandler,
                        postData: params,
                        mode:mode,
						hideLoader:hideLoader
                    });
                }
            }
        }(thisURL, target, postFillAction, params);

        setTimeout(delayedFn, 0);
    },

    sendNonReturningRequest : function(action,otherParams,postFillAction,target) {
        var actionPrefix = getTextBeforeUnderscore(action);
        var javaAction = getTextAfterUnderscore(action);
        var thisURL = urlContext + controllerMap[actionPrefix] + "?action=" + javaAction;
        if (otherParams) {
            for (var i = 0; i < otherParams.length; i++) {
                thisURL += '&' + otherParams[i];
            }
        }
        //finally client key
        thisURL += '&clientKey=' + clientKey;
        ajaxNonReturningUpdate(
                thisURL,
        {
            callback: postFillAction,
            errorHandler: errorHandler
        });
    },

    /**
     * Navigate to home page
     */
    redirectToHomePage : function() {
        document.location='flow.html?_flowId=homeFlow';
    },

    ////////////////////////////////////////////////////////
    // sever updates
    ////////////////////////////////////////////////////////
    save : function(folder, name, desc, overwriteOK, addOns) {
        if(localContext.getMode() === designerBase.DASHBOARD){
            return designerBase.doSave(folder, name, desc, overwriteOK);
        } else {
            return this.checkSave(folder, name, desc, overwriteOK, addOns).pipe(function() {
                return designerBase.doSave(folder, name, desc, overwriteOK, addOns);
            });
        }
    },

    createOverwriteHanlder: function(deferred, doSaveArguments) {
        var designer = this;
        return function saveErrorHandler(ajaxAgent) {
            var fileExistsMessage = ajaxAgent.getResponseHeader("fileExistsException");
            if(!fileExistsMessage) {
                deferred.reject(ajaxAgent); //unhandler error
            }
            fileExistsMessage = decodeURIComponent(fileExistsMessage);
            if(confirm(fileExistsMessage.replace(/@@/g, " "))) {
                designer.doSave.apply(designer, doSaveArguments).then(function() {
                    deferred.resolve();
                }, function(err) {
                    deferred.reject(err);
                })
            } else {
                deferred.reject();
            }
        };
    },

    doSave : function(folder, name, desc, overwriteOK, addOns) {
        var designer = this;
        var deferred;
        //disable save button.
        if(localContext.getMode() === designerBase.DASHBOARD){
            deferred = localContext.saveDashboard(folder, name, desc, overwriteOK);
        }else{
            deferred = jQuery.Deferred();
        	adhocDesigner && jQuery('#designer').trigger('report_name_update',[name]);
            var callback = function(state){
                localContext.standardOpCallback(state);
                this._saveConfirmMessage();
                deferred.resolve();
            }.bind(designerBase);

            var saveErrorHandler = designerBase.createOverwriteHanlder(deferred, [folder, name, desc, true, addOns]);
            var requestParams = new Array('allOverwrite=' + overwriteOK);
            if(name != null) {
                requestParams.push('aruLabel=' + encodeText(name));
                requestParams.push('aruDesc=' + encodeText(desc));
                requestParams.push('aruFolder=' + encodeText(folder));
            }
            if(addOns != undefined) {
                requestParams.push('aruOverwrite='+addOns.dataViewOverwriteOk);
                if(addOns.reportName != undefined) {
                    requestParams.push('reportLabel='+encodeText(addOns.reportName));
                    requestParams.push('reportDesc='+encodeText(addOns.reportDescription));
                    requestParams.push('reportFolder='+encodeText(addOns.reportFolder));
                }
            }
            this.sendRequest('co_save', requestParams,  callback, null, saveErrorHandler);
        }
        return deferred;
    },

    //check if there are dependent reports
    checkSave : function(folder, name, desc, overwriteOK, addOns) {
        var designer = this;
        var deferred = jQuery.Deferred();
        var callback = (function(state){
            if (! state.topMessage) {
              deferred.resolve();
            } else {
                designer.launchDependenciesDialog(state, {
                    folder: folder,
                    name: name,
                    desc:desc,
                    overwrite: overwriteOK,
                    addOns: addOns
                }).then(function() {
                        deferred.resolve();
                    }, function() {
                        deferred.reject();
                })};
            }).bind(designerBase);

        var params = new Array('aruFolder=' + encodeText(folder), 'aruLabel=' + encodeText(name));
        this.sendRequest('co_checkSave', params, callback, null);
        return deferred;
    },

    _saveConfirmMessage : function(){
        dialogs.systemConfirm.show(saveConfirmation, 5000);
    },

    ///////////////////////////////////////////////////////////////
    // DOM builders
    ///////////////////////////////////////////////////////////////
    /**
     * Create HTML dom object
     * @param htmlTag
     * @param cssClass
     */
    createDomObject : function(htmlTag, cssClass){
        if(htmlTag){
            return  Builder.node(htmlTag, {className: cssClass});
        }else{
            throw("Please provide a valid tag");
        }
    },

    getContentDimensions: function(components) {
        var components = $A(components);

        var dimensions = components.collect(function(frame) {
            var dims = frame.getDimensions();
            var offset = frame.positionedOffset();

            return { width: dims.width + offset[0], height: dims.height + offset[1]};
        });

        var width = dimensions.collect(function(dimension) { return dimension.width; }).max();
        var height = dimensions.collect(function(dimension) { return dimension.height; }).max();

        return {width: width, height: height};
    },

    /*
     * TODO: check and possibly remove function related to dashboards.
     */
    updateIFrameScrolls: function() {
        /*
        $A($$(layoutModule.SWIPE_SCROLL_PATTERN)).each(function(scrollElement) {
            var id = scrollElement.identify();

            if(id.startsWith("iframeScroll_")) {
                var iframe = scrollElement.down();
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                var timer;
                var contentLoaded = function(e) {
                    timer && clearInterval(timer);

                    var reportContainer = iframeDoc.getElementById("reportContainer");
                    if(reportContainer && reportContainer.clientWidth > 0 && reportContainer.clientHeight > 0) {
                        iframe.setStyle({
                            width: reportContainer.clientWidth + "px",
                            height: reportContainer.clientHeight + "px"
                        });

                        var scroll = layoutModule.scrolls.get(id);
                        scroll && scroll.refresh();
                        setTimeout(function() {
                            scroll && scroll.scrollTo(0, 1, 0, false);
                        }, 1000);
                    }
                };
                timer = setInterval(contentLoaded, 2000);
                iframeDoc.addEventListener('DOMContentLoaded', contentLoaded, false);
            }
        });
        */
    },

    updateMainOverlay: function(className) {
        var el = document.getElementById('mainTableContainerOverlay');
        el && (el.className = className);
    }
};


//returns true for errors/special cases
var errorHandler = function(ajaxAgent) {
    clearTimeout(cancelQueryTimer);
    cancelQueryTimer = null;

    var sessionTimeout = ajaxAgent.getResponseHeader("LoginRequested");

    if (sessionTimeout) {
        document.location = urlContext;
        return true;
    }
    // case of overwrite prompt
    var fileExistsMessage = ajaxAgent.getResponseHeader("fileExistsException");
    /**
     * need to decode message because it has been encoded on server because rfc 2047 states
     * we need to encode header values that contain non-ascii characters
     */
    if (fileExistsMessage) {
        fileExistsMessage = decodeURIComponent(fileExistsMessage);
        //handled by custom handler.
        return true;
    }
    // case of multiple files with same label alert
    var multipleFileExistsMessage = ajaxAgent.getResponseHeader("multipleFileExistException");
    /**
     * need to decode message because it has been encoded on server because rfc 2047 states
     * we need to encode header values that contain non-ascii characters
     */
    if (multipleFileExistsMessage) {
        multipleFileExistsMessage = decodeURIComponent(multipleFileExistsMessage);
        // used as delimiter to replace whitespaces before encoding on server side. Need to replace them
        alert(multipleFileExistsMessage.replace(/@@/g, " "));
        //in this case the response has come back and we need to give the user a chance to re-submit so lets enable
        //the save button
        if ($("saveAsBtnSave")) {
            $("saveAsBtnSave").disabled = false;
        }
        return true;
    }
    // other adhoc error
    var adhocException = ajaxAgent.getResponseHeader("adhocException");
    if (adhocException) {
        alert(adhocException);
        return true;
    }

    // handle JasperServerError
    return baseErrorHandler(ajaxAgent);
};

//todo: temp. remove when dialogs are complete
function showMessageDialog(ajaxError, ajaxErrorHeader){
    alert(ajaxError + "\n" + ajaxErrorHeader);
}

/**
 * Get current time.
 */
function getSessionExpireTime(){
    return function(){
        var minutes;
        var d = new Date();
        var hour = d.getHours() % 12; //non-24 hour format
        if(hour == 0){
            hour = 12;
        }
        var min = d.getMinutes() + 2;

        if(min < 10 || min > 59){
            minutes = "0" + (min % 60);
        }else{
            minutes = min;
        }
        return (" " + hour + ":" +  minutes);
    }();
}


