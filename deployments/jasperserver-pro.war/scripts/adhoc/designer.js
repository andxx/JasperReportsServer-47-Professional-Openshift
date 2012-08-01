/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

JRS.vars.current_flow = 'adhoc';

var localContext = window;
var theBody = document.body;
var requestLogEnabled = false;
var adhocSessionButton;
var adhocSessionDialog;
var TIMEOUT_INTERVAL = serverTimeoutInterval * 1000; //since intervals are in milli-secs we need to multiply by 1000
var ADHOC_SESSION_TIMEOUT_MESSAGE = adHocSessionExpireCode;
var ADHOC_EXIT_MESSAGE = adHocExitConfirmation;

var adhocDesigner = {
	worksheets: [],
    currentWorksheet: null,

	ui: {
        header_title: null,
        display_manager: null,
        canvas: null,
        dataMode: null
	},

    //member variables
    _leafSelectedFired : false,

    dimensionsTree : null,
    measuresTree : null,

    _availableTreeLastOpened : null,
    _AVAILABLE_TREE_DEPTH : 10,
    _cookieName : "lastNodeUri",
    _cookieTime : 3,
    FOLDER_TYPE : "ItemGroupType",
    multiSelect : false,

    //Name of measures dimension and measures level
    MEASURES : "Measures",

    //For OLAP mode
    DIMENSIONS_TREE_DOM_ID : "dimensionsTree",
    DIMENSIONS_TREE_PROVIDER_ID : "dimensionsTreeDataProvider",
    MEASURES_TREE_DOM_ID : "measuresTree",
    MEASURES_TREE_PROVIDER_ID : "measuresTreeDataProvider",

    TREE_NODE_AND_LEAF_PATTERN:
        ['ul#visibleFieldsTree li.leaf', 'ul#visibleFieldsTree li.node',
         'ul#dimensionsTree li.leaf', 'ul#dimensionsTree li.node', 'ul#measuresTree li.node'],

    CANVAS_ID : "canvasTable",
    CANVAS_PARENT_ID : "mainTableContainer",
    CANVAS_PANEL_ID : "canvas",
    OLAP_MEASURES_TREE: "measuresTree",
    DISPLAY_MANAGER_ID: "displayManagerPanel",
    overlayParent : null,
    overlayDraggedColumn : null,
    initialDragXposition : null,
    NaN : "NaN",
    removeDroppables : null,
    addDroppables : null,
    DEFAULT_SUMMARY_NUM_FUNC : "Sum",
    DEFAULT_SUMMARY_NONNUM_FUNC : "DistinctCount",
    //patterns
    //table patterns
    COLUMN_OVERLAY_PATTERN : "div.overlay.col",
    GROUP_OVERLAY_PATTERN : "div.overlay.group",
    SUMMARY_OVERLAY_PATTERN : "div.overlay.summary",
    GROUP_LABEL_SPAN_PATTERN : "span.labelOverlay.label",
    COLUMN_SIZER_PATTERN : "div.columnSizer",

    ROW_OVERLAY_PATTERN : "div.rowOverlay",
    ROW_GROUP_OVERLAY_PATTERN : "div.rowGroupOverlay",
    COLUMN_GROUP_OVERLAY_PATTERN : "div.columnGroupOverlay",
    MEASURE_OVERLAY_PATTERN : "div.measureOverlay",

    XTAB_GROUP_HEADER_PATTERN : "th.label.group",
    XTAB_GROUP_OVERLAY_PATTERN : "div.overlay.xtab.gr",
    XTAB_GROUP_HEADER_OVERLAY_PATTERN : "div.overlay.xtab.header",

    XTAB_MEASURE_OVERLAY_PATTERN : "div.overlay.xtab.m",
    XTAB_MEASURE_HEADER_OVERLAY_PATTERN : "div.overlay.xtab.measure",

    ROW_GROUP_MEMBER_PATTERN : "tbody#detailRows tr td.label.member",
    COLUMN_GROUP_MEMBER_PATTERN : "thead#headerAxis th.label.member",
    LEGEND_OVERLAY_PATTERN : "div.legend.overlay",

    AVAILABLE_FIELDS_PATTERN : ["ul#visibleFieldsTree", "ul#dimensionsTree", "ul#measuresTree"],
    CANVAS_PATTERN : "table#canvasTable",
    MENU_PATTERN : "div#menu",
    CANVAS_PARENT_PATTERN : "div#mainTableContainer",
    EXPORT_FORM_PATTERN : "#exportActionForm",

    //action array
    toolbarActionMap : {
        presentation : "adhocDesigner.goToPresentationView",
        explorer : "adhocDesigner.goToDesignView",
        execute : "adhocDesigner.saveAndRun",
        undo : "adhocDesigner.undo",
        redo : "adhocDesigner.redo",
        undoAll : "adhocDesigner.undoAll",
        pivot : "adhocDesigner.pivot",
        sort : "adhocDesigner.sort",
        controls : "adhocDesigner.launchDialogMenu",
        styles : "adhocDesigner.showAdhocThemePane"
    },

    dialogESCFunctions : {
        save : "saveAs",
        saveDataViewAndReport : "saveDataViewAndReport",
        sort : "sortDialog",
        reentrant : "selectFields",
        editLabel: "editLabel"
    },

    contextMap: {
        table : AdHocTable,
        crosstab : AdHocCrosstab,
        olap_crosstab : AdHocCrosstab,
        chart : AdHocChart
    },
    /*
     * Todo: Should be refactored inline
     */
    getSelectedColumnOrGroup: function(){
        return selObjects[0];
    },
    generalDesignerCallback: function(){
        localContext.initAll();
        adhocDesigner.updateTrees();
    },
    run: function(mode){
        // Setup Web Help
        webHelpModule.setCurrentContext(mode.indexOf('olap') >= 0 ? "analysis" : "ad_hoc");
        // Init UI elements
        this.ui.dataMode = jQuery('#dataMode');
        this.ui.canvas = isSupportsTouch() ? jQuery('#mainTableContainer > .scrollWrapper') : jQuery('#mainTableContainer');
        this.ui.header_title = jQuery('#canvas > div.content > div.header > div.title');
        /*
         * Events
         */
        this.observePointerEvents();
        this.observeKeyEvents();
        this.observeCustomEvents();
        this.observeTableContainerEvents();
        /*
         * DnD
         */
        this.initDroppables();
        /*
         * Worksheet
         */
        this.currentWorksheet = this.addWorksheet(mode);
        // Initialize Mode dependent Ad Hoc Designer components
        this.initComponents(mode);
        this.currentWorksheet.load();
        /*
         * UI
         */
        toolbarButtonModule.initialize(this.toolbarActionMap, $("adhocToolbar"));

        _.extend(this, {
            selectFields: function(){
                adhocReentrance.launchDialog();
            },
            launchDialogMenu: function(){
                adhocControls.launchDialog();
            },
            sort: function(){
                adhocSort.launchDialog();
            },
            createCalculatedField: function(){
                adhocCalculatedFields.launchDialog();
            },
            editCalculatedField: function(){
                adhocCalculatedFields.launchDialog(true);
            }
        });

        if(isSupportsTouch()){
            var wrapper = jQuery("#mainTableContainer > .scrollWrapper").get(0);
            this._touchController = new TouchController(wrapper,wrapper.parentNode,{
                useParent: true,
                absolute: true,
                scrollbars: true
            });
        }

        var mainPanelID = adhocDesigner.CANVAS_PANEL_ID;
        if($('fields')) {
            layoutModule.resizeOnClient('fields', mainPanelID, 'filters');
        } else {
            layoutModule.resizeOnClient('filters', mainPanelID);
        }
        /*
         * TODO: make this UI update happen in CSS using media queries.
         */
        isIPad() && layoutModule.minimize(document.getElementById('filters'), true);

        this.initTitle();
        this.initFieldsPanel(true);
        this.initFiltersPanel(true);
        this.initDialogs();
        typeof window.orientation !== 'undefined' && window.orientation === 0 && this.hideOnePanel();
        /*
         * Error on load?
         */
        $("errorPageContent") ? adhocDesigner.initEnableBrowserSelection($("designer")) : adhocDesigner.initPreventBrowserSelection($("designer"));
    },
    initComponents: function(mode){
        // Init Crosstab mode variables
        this.isCrosstabMode = mode.indexOf('crosstab') >= 0;
        adHocFilterModule.CONTROLLER_PREFIX = this.isCrosstabMode ? "cr" : "co";
        // Set up local context variable
        localContext = this.contextMap[mode];
        localContext.setMode && localContext.setMode(mode);
        localContext.reset();
        // Setup Current worksheet
        adhocDesigner.currentWorksheet.setMode(mode);
        // Register Report Template
        adhocDesigner.registerTemplate(localContext, mode + "Template");
        // Init Layout Manager instance
        this.initLayoutManager(mode);
        // Update Data Mode panel appearance
        mode == 'chart' ? this.ui.dataMode.hide() : this.ui.dataMode.show();
        // Prepare axes labels
        jQuery('#columns').children().eq(0).html(layoutManagerLabels.column[mode]);
        jQuery('#rows').children().eq(0).html(layoutManagerLabels.row[mode]);
    },
    render: function(state){
        toolbarButtonModule.setActionModel(state.actionmodel);
        adhocDesigner.currentWorksheet.setActionModel(state.actionmodel);

        adhocDesigner.ui.canvas.empty();
        adhocDesigner.updateCanvasClasses(adhocDesigner.isCrosstabMode);
        var isDataRendered = localContext.update(state).render();

        if (isDesignView) {  //save and undo buttons are disabled in report display view
            adhocDesigner.enableCanUndoRedo();
            adhocDesigner.enableRunAndSave(localContext.canSaveReport());
        }

        if(isDataRendered) {
            editor = null;
            designerBase.initAdhocSpecificDesignerBaseVar();
            designerBase.setState();
            designerBase.updateSessionWarning();
            designerBase.updateFlowKey();
            localContext.initAll();
            designerBase.unSelectAll();
        }

        if (isDesignView && adhocDesigner.isDisplayManagerVisible()) {
            jQuery("#" + adhocDesigner.DISPLAY_MANAGER_ID).removeClass(layoutModule.HIDDEN_CLASS);
        }

        adhocDesigner.updateModeLabelSelection(localContext.state.viewType);
        adhocDesigner.updateDataMode(localContext.state.isShowingFullData);
        adhocDesigner.ui.display_manager.render(
            state.columns ?    { column : state.columns, group : state.groups } :
            state.chartItems ? { measures: state.chartItems, group: state.group } :
                               { column : state.crosstabState.columnGroups, row : state.crosstabState.rowGroups});

        jQuery('#designer').trigger('layout_update');
        adhocDesigner.updateAllFieldLabels();
        adhocDesigner.resetScroll();

        //save and undo buttons are disabled in report display view
        if (isDesignView) {
            adhocDesigner.enableRunAndSave(localContext.canSaveReport());
        }
        adhocDesigner.enableSort(state.viewType == 'table');
    },
    resetState: function() {
        this.state = new localContext.State({});
    },
    updateState: function(state) {
        this.state = new localContext.State(state);
    },
    updateDataMode : function(isFullData) {
        jQuery('#full-data')[isFullData ? 'addClass' : 'removeClass']('selected');
        jQuery('#sample-data')[isFullData ? 'removeClass' : 'addClass']('selected');
    },
    updateModeLabelSelection : function(mode) {
        var menuOptions = {
            '#table-mode' : designerBase.TABLE === mode,
            '#chart-mode' : designerBase.CHART === mode,
            '#crosstab-mode' : _.include(mode, designerBase.CROSSTAB)
        };
        _.each(menuOptions, function(visible, id) {
            jQuery(id)[visible ? 'addClass' : 'removeClass']('selected');
        });
    },
    setNothingToDisplayVisibility : function(visible) {
        if(visible) {
            jQuery('#titleCaption').css('min-width','400px');
            jQuery('#nothingToDisplay').removeClass(layoutModule.HIDDEN_CLASS);
            centerElement($('nothingToDisplay'), {horz: true, vert: true});
            /*
             * TODO: put layout positioning code into layout related code. Should be handled through media CSS queries.
             */
            if (isIPad()) {
                var elem = $('nothingToDisplay');
                var theWidth = parseInt(elem.getStyle('width'));
                var theBufferedWidth = theWidth + getBufferWidth(elem, true);
                var e = jQuery('#displayManager');
                var parentWidth = e ? e.width() : elem.up(1).getWidth();

                elem.style.marginLeft = (theWidth/2) + 'px';
                elem.style.left = '0%';

                elem.style.position = 'relative';
                elem.style.minWidth = '300px';
            }
        } else {
            jQuery('#titleCaption').css('min-width','');
            jQuery('#nothingToDisplay').addClass(layoutModule.HIDDEN_CLASS);
        }
    },
    updateCanvasClasses : function (isCrosstabMode) {
        jQuery('#' + adhocDesigner.CANVAS_PANEL_ID)[(isCrosstabMode ? 'add' : 'remove') + 'Class']('showingSubHeader OLAP');
    },
    resetScroll: function() {
        if (adhocDesigner._touchController) {
            adhocDesigner._touchController.reset();
            adhocDesigner._touchController.addPadding('canvasTable',{right:200});
        }
    }
};

adhocDesigner.State = function(state) {
    _.extend(this, state);

    this.update = function(newState) {
        _.extend(this, newState);
    };
};