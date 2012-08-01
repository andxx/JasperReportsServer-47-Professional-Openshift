/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var adhocControls = {};

adhocControls = {
    CONTROLS_LOCATION: 'filtersMainTableICCell',
    filterSaveAsCheckbox: null,
    controlsController : new JRS.Controls.Controller(),
    hideDialog : null,

    initialize : function(state){
        if (hasVisibleInputControls !== 'true' || ! $(ControlsBase.INPUT_CONTROLS_DIALOG)) {
            return;
        }

        var optionsContainerSelector = "#" + ControlsBase.INPUT_CONTROLS_FORM + " .sub.header";
        if (jQuery("#" + ControlsBase.INPUT_CONTROLS_DIALOG).length > 0) {
            optionsContainerSelector = "#" + ControlsBase.INPUT_CONTROLS_DIALOG + " .sub.header";
        }

        this.viewModel = this.controlsController.getViewModel();
        this.viewModel.reloadContainer();

        var controlsArgs = {
            reportUri : Report.reportUnitURI,
            preSelectedData: state.adhocParameters,
            fetchStructuresOnlyForPreSelectedData: true
        };

        this.controlsController.initialize(controlsArgs).always(function() {
            var viewModel = adhocControls.controlsController.getViewModel();
            if (!viewModel.areAllControlsValid()) {
                adhocControls.launchDialog();
            } else {
                adhocControls.forceFiltersFromControls(true);
            }
            adhocControls.lastSelection = viewModel.get('selection');
        });

        JRS.Controls.listen({
            "viewmodel:selection:changed":function(){
                adhocControls.selectionChanged = true;
        }});

        this.filterSaveAsCheckbox =  jQuery("#filterssaveasdefault");

        if (this.filterSaveAsCheckbox.length == 0){
            throw Error("Can't find filter save as default");
        }
        
        var dialogButtonActions = {
            'button#ok': this.applyFilters.curry(true),
            'button#cancel': this.cancel,
            'button#reset': this.reset,
            'button#apply': this.applyFilters.curry(false)
        };
       	this._dialog = new ControlDialog(dialogButtonActions);
    },

    reset : function(){
        adhocControls.controlsController.reset();
        adhocControls.selectionChanged = true;
    },

    forceFiltersFromControls:function (checkOnChangedSelection) {
        var selectedData = adhocControls.viewModel.get('selection');

        if (checkOnChangedSelection){
            var isSelectionChanged = JRS.Controls.ViewModel.isSelectionChanged(adhocControls.lastSelection, selectedData);
            if (!isSelectionChanged) return;
        }

        var extraParams;
        if (adhocControls.filterSaveAsCheckbox.is(":checked")) {
            extraParams = {"filterssaveasdefault":"on"};
        }

        adhocControls.forceFilterAction(ControlsBase.buildSelectedDataUri(selectedData, extraParams));
        adhocControls.lastSelection = selectedData;
    },

    applyFilters: function(closeDialog) {
        adhocControls.hideDialog = closeDialog;
        if (adhocControls.selectionChanged){
            adhocControls.controlsController.validate()
                .then(function (areControlsValid) {
                    if (areControlsValid) {
                        adhocControls.forceFiltersFromControls();
                        adhocControls.selectionChanged = false;
                    }
                }
            );
        }else if (adhocControls.viewModel.areAllControlsValid()){
            closeDialog && adhocControls.closeDialog();
        }

    },

    launchDialog : function() {
        if (hasVisibleInputControls !== 'true') return;
        adhocControls._dialog.show();
        adhocControls.setFocusOnFirstInputControl();
    },

    cancel : function(){
        adhocControls.closeDialog();
        adhocControls.controlsController.update(adhocControls.lastSelection);
    },

    closeDialog : function(){
            adhocControls._dialog.hide();
    },

    leaveAdhoc: function() {
        document.location = buildActionUrl({_flowId:'homeFlow'});
    },

    refreshAdhocDesigner: function() {
        
        var callback = function(state) {
            localContext.standardOpCallback(state);
            adHocFilterModule.resetFilterPanel();
        };

        designerBase.sendRequest("co_getReport", new Array("decorate=no"), callback, {"bPost" : true});
    },

    requestFilterAction: function(callback, action, opts, postData) {
        var urlData = {_flowId: 'adhocAjaxFilterDialogFlow', clientKey: clientKey, decorate: 'no'};
        urlData[action] = 'true';

        var url = buildActionUrl(urlData);

        var options =  Object.extend({
            postData: postData,
            callback: callback,
            mode: AjaxRequester.prototype.EVAL_JSON,
            errorHandler: baseErrorHandler
        }, opts);

        ajaxTargettedUpdate(url, options);
    },

    setFilters: function(callback) {
        adhocControls.requestFilterAction(callback, 'setFilters');
    },

    forceFilterAction:function (postData) {
        adhocControls.requestFilterAction(function (ajax) {
            if (ajax === 'success') {
                adhocControls.refreshAdhocDesigner();
                adhocControls.hideDialog && adhocControls.closeDialog();
            }
        }, 'setFilters', null, postData);
    },

    setFocusOnFirstInputControl: function() {
        if (typeof firstInputControlName != 'undefined' && firstInputControlName) {
            var inputOrSelect = $(firstInputControlName);
            if (inputOrSelect) {
                inputOrSelect.focus();
            }
        }
    }
    
};
