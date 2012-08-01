/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////////////////////////////////////
// Dashboard Code.
////////////////////////////////////////////////////////////////

var localContext = {

    messages :{},
    //private member variables
    DASHBOARD_DOM_ID : "dashboardDesigner",
    DASHBOARD_TREE_CONTAINER_ID : "dashboardFolderContainer",
    repoTree : null,
    specialContentTree : null,
    standardControlNode : null,
    CUSTOM_URL_CANCEL_BTN_PATTERN : "button#customURLCancel",
    CUSTOM_URL_OK_BTN_PATTERN : "button#customURLOk",
    CUSTOM_URL_NO_PARAMS_CLS : "noParams",
    SPECIAL_TREE_DOM_ID : "dashboardSpecialContentTree",
    SPECIAL_TREE_LEAF_PATTERN : "ul#dashboardSpecialContentTree",
    REPO_TREE_LEAF_PATTERN : "ul#dashboardRepoTree",
    REPO_TREE_DOM_ID : "dashboardRepoTree",
    REPOSITORY_TREE_PROVIDER : "dashboardRepositoryTreeFoldersProvider",
    TREE_FOLDER_TYPE_CLASS : "com.jaspersoft.jasperserver.api.metadata.common.domain.Folder",
    TREE_NODE_TYPE_CLASS : "com.jaspersoft.jasperserver.api.metadata.common.domain.NewNode",
    TREE_NODE_CONTROL_TYPE : "controlFrameType",
    ACTION_MODEL_TAG : "dashboardActionModel",
    CUSTOM_URL_DOM_ID : "customURL",
    CUSTOM_URL_INPUT_DOM_ID : "customURLInput",
    currentCustomFrame : null,
    customURLDialog : {
        isEditMode : false,
        isVisible : false
    },
    currentEditingTextFrame : null,
    currentHoveredOverlay : null,
    contextLevels : {
        context : "dashboardDashboardLevel",
        content : "dashboardContentFrameLevel",
        control : "dashboardControlFrameLevel",
        text : "dashboardTextFrameLevel",
        clickable : "dashboardClickableFrameLevel",
        repo : "dashboardRepoTreeLeafLevel",
        special : "dashboardSpecialContentTreeLeafLevel"
    },
    typeToView : {
        'com.jaspersoft.ji.adhoc.AdhocReportUnit' : 'viewAdhocReportFlow&viewAsDashboardFrame=true&reportUnit=',
        'com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.ReportUnit' : 'viewReportFlow&viewAsDashboardFrame=true&reportUnit=',
        'com.jaspersoft.ji.adhoc.DashboardResource' : 'dashboardRuntimeFlow&viewAsDashboardFrame=true&dashboardResource='
    },
    frameTypes : [],
    framesByType : [],
    controlTypes : ['singleReport', 'multiReport', 'other'],
    nextFrameSrc : null,
    unansweredAddRequests : 0,
    regexForBeginningNums : new RegExp("^\\d+"),
    regexForEndingNums : new RegExp("\\d+$"),
    regexForFrameName : new RegExp("\\_[A-Za-z]+$"),
    fontSizeTester : null,
    //ids and stub constants
    ALL_CONTENT_PARENT_DOM_ID : "dashboardFrameParent",
    CONTENT_FRAME_DOM_ID : "contentFrameTemplate",
    CONTAINER_ID_STUB : "Container",
    //frame types
    CONTROL_FRAME : "controlFrame",
    CONTENT_FRAME : "contentFrame",
    TEXT_FRAME : "textFrame",
    CLICKABLE_FRAME : "clickableFrame",
    CUSTOM_RESOURCE_TYPE : "customResourceType",
    //patterns
    CONTENT_FRAME_PATTERN : "div.componentContainer.iframe",
    CONTENT_FRAME_OVERLAY_PATTERN : "div.componentContainer.iframe>.overlay.button",

    CONTROL_FRAME_PATTERN : "div.componentContainer.control",
    CONTROL_FRAME_OVERLAY_PATTERN : "div.componentContainer.control>.overlay.button",

    CLICKABLE_FRAME_PATTERN : "div.componentContainer.actionButton",
    CLICKABLE_FRAME_OVERLAY_PATTERN : "div.componentContainer.actionButton>.overlay.button",

    TEXT_FRAME_PATTERN : "div.componentContainer.displayText",
    TEXT_FRAME_OVERLAY_PATTERN : "div.componentContainer.displayText>.overlay.button",
    EDITABLE_TEXT_PATTERN : "div.displayText>.read",
    EDITING_TEXT_PATTERN : "div.displayText>input.edit",

    CUSTOM_URL_INPUTCONTROLS_PATTERN : "#customURL div.control.fillParent > div.content div.body",

    TITLE_PATTERN : "#dashboardDesigner #title",
    DELETED_TITLE_CSS : "deletedTitle",
    SCROLL_ENABLED : "yes",

    SIZER_PATTERN : "div.sizer",
    DROP_ZONE : "dashboardDropZone",
    REAL_DROP_ZONE : "DZone",
    dragStartCoordinates: {left : null, top : null},
    draggableFrame: null,
    justDragged: false,
    selectedFrameOverlays : [],
    //prefixes
    OVERLAY_PREFIX : "containerOverlay_",
    NODE_CLICKABLE_PREFIX : "button",
    PARAM_MAPPER_CHECKBOX_PREFIX : "paramMapperCheckbox_",
    PARAM_MAPPER_INPUT_PREFIX : "paramMapperInput_",
    CONTROL_PREFIX : "input_",
    patternToId : {
        'this.CONTENT_FRAME_PATTERN' : "contentFrameContainer_",
        'this.CONTROL_FRAME_PATTERN' : "controlFrameContainer_",
        'this.CLICKABLE_FRAME_PATTERN' : "clickableFrameContainer_",
        'this.TEXT_FRAME_PATTERN' : "textFrameContainer_"
    },
    patternToAddAction : {},
    buttonIdToAction : {},
    toolbarActionMap : {},
    marqueeMovePosition : {x : 0, y : 0},
    marqueeStartPosition : {x : 0, y : 0},
    draggingMarquee : false,
    boundHandlerMethod : null,
    titleEditing : false,
    adjustingFontSize : false,
    //CONTROL_FRAME_DEFAULT_WIDTH : 100,
    RUN_URL_PREFIX : "flow.html?_flowId=dashboardRuntimeFlow&runTempDashboard=true&clientKey=",
    rightCoordinates : [],
    bottomCoordinates : [],
    shouldReplace : false,
    replacingFrameName : null,
    hackPadding : 2,
    collectionOfOpenDialogs :[],
    dialogESCFunctions : {},
    controlsController : new JRS.Controls.DashboardController(),

    getMode : function(){
        return designerBase.DASHBOARD;
    },

    ///////////////////////////////////////////////////////////////
    // Initialization functions
    ///////////////////////////////////////////////////////////////

    initAll : function(){
        layoutModule.resizeOnClient('folders', 'canvas');
        webHelpModule.setCurrentContext("dashboard");

        this._updateAllStates();
        this.initRepoTree();
        this.initSpecialContentTree();
        this._updateInputControlsNodes();
        this.oneTimeInit();
        this._setDashboardDropZone();
        this._createDashboardScroll();
        this.dashboardSpecificEvents();
        this._updateScroll();
    },

    /**
     * Called once when first loading the page or during a page refresh
     */
    oneTimeInit : function(){
        this._updateConstantState();
        this.initDashboardGeneralEvents();
        this.initFrameTypes();
        this.initPatternToActionFunctions();
        this.initPreventBrowserSelection($("dashboardDesigner"));
        this.initControlsController();
    },

    _getAllControlsInformation: function() {
        return _.map(localContext.controlFrames, function(controlFrame) {
            return this._getControlInformation(controlFrame);
        }, this);
    },

    _getControlInformation: function(controlFrame) {
        var controlFrameId = "controlFrameContainer_" + controlFrame.name;
        return {controlId: controlFrame.paramName, controlFrameId: controlFrameId, controlValue: controlFrame.paramValue};
    },

    initControlsController: function() {
        this.controlsController.initialize();

        JRS.Controls.listen({
            "viewmodel:values:changed":_.bind(function () {
                var selectedData = this.controlsController.getViewModel().get("selection");
                this.updateInputControlParams(selectedData);
            }, this)
        });

        var controlsInformation = this._getAllControlsInformation();
        var updateFrames = _.bind(function() {
            if (this.controlFrames.length > 0) {
                this._updateAllIFramesSRCParam();
            }
        }, this);
        if (!controlsInformation || controlsInformation.length == 0) {
            updateFrames && updateFrames();
        }else{
            this.controlsController.addControls(controlsInformation).always(updateFrames);
        }
    },

    initPreventBrowserSelection : function(domObject){
        var currentStyle = null;
        var object = $(domObject);
        if(object){
            if(isIE()){
                //$(object).onselectstart = function(){return false;}
                $(object).attachEvent('onselectstart', function (e) {
					var tagName = e.srcElement.tagName;
					if (tagName != "INPUT" && tagName != "TEXTAREA") { e.returnValue = false; }
					});
            } else if(isWebKitEngine()){
                currentStyle = $(object).readAttribute("style");
                if(!currentStyle.include("webkit-user-select:none")){
                    currentStyle += ";-webkit-user-select:none";
                    $(object).writeAttribute("style", currentStyle);
                }
            }else if(isMozilla()){
                currentStyle = object.readAttribute("style");
                if(!currentStyle.include("moz-user-select:-moz-none")){
                    currentStyle += ";-moz-user-select:-moz-none";
                    $(object).writeAttribute("style", currentStyle);
                }
            }
        }
    },

    /**
     * Initialize all frame types
     */
    initFrameTypes : function(){
        this.frameTypes.push(localContext.CONTENT_FRAME, localContext.CONTROL_FRAME, localContext.TEXT_FRAME, localContext.CLICKABLE_FRAME);
    },

    /**
     * Init array to store frames by type
     */
    initFramesByType : function(){
        this.framesByType[localContext.CONTENT_FRAME] = localContext.contentFrames;
        this.framesByType[localContext.CONTROL_FRAME] = localContext.controlFrames;
        this.framesByType[localContext.TEXT_FRAME] = localContext.textFrames;
        this.framesByType[localContext.CLICKABLE_FRAME] = localContext.clickableFrames;
    },

    /**
     * Used to store actions to be performed based on frame pattern
     */
    initPatternToActionFunctions : function(){

        this.patternToAddAction = {
            'this.CONTENT_FRAME_OVERLAY_PATTERN' : this.addContentFrameToSelection,
            'this.CONTROL_FRAME_OVERLAY_PATTERN' : this.addControlFrameToSelection,
            'this.CLICKABLE_FRAME_OVERLAY_PATTERN' : this.addClickableFrameToSelection,
            'this.TEXT_FRAME_OVERLAY_PATTERN' : this.addTextFrameToSelection
        };

        this.buttonIdToAction = {
            'submit' : this.updateInputControlParams.bind(this),
            'reset' : this.resetInputControlParams.bind(this),
            'print' : this.printDashboard.bind(this)
        };


        this.toolbarActionMap = {
            presentation: this.runDashboard.bind(this),
            undo : this.undo.bind(this),
            redo : this.redo.bind(this)
        };


        this.dialogESCFunctions = {
            save : designerBase.cancelSaveDialog,
            customUrl : this._cancelCustomURLPrompt.bind(this)
        };
    },

    hideAllDialogsAndMenus : function(){
        //hide menu if showing
        actionModel.hideMenu();
        var functions = Object.values(this.dialogESCFunctions);
        functions.each(function(executable){
            executable();
        }.bind(this));
    },

    enablePreviewAndSave : function(){
        if(localContext.contentFrames.length || localContext.textFrames.length){
            if($("presentation")){
                buttonManager.enable($("presentation"));
            }
            if($("save")){
                buttonManager.enable($("save"));
            }
        }else{
            if($("presentation")){
                buttonManager.disable($("presentation"));
            }
            if($("save")){
                buttonManager.disable($("save"));
            }
        }
    },

    /**
     * This initializes the repository tree
     */
    initRepoTree : function(){
        this.repoTree = this.getRepositoryTree();
        this.repoTree.showTree(1);
    },

    /**
     * this initializes the client side special content tree
     */
    initSpecialContentTree : function(){
        this.specialContentTree = this.getSpecialContentTree();
        this.specialContentTree.renderTree();
    },

    /**
     * Update to designer base variables
     */
    initDesignBaseVars : function(){
        //Overriding designer base variables
        //since intervals are in milli-secs we need to multiply by 1000
        TIMEOUT_INTERVAL = serverTimeoutInterval * 1000;
        DASHBOARD_SESSION_TIMEOUT_MESSAGE = dashBoardSessionExpireCode;
        DASHBOARD_EXIT_MESSAGE = dashBoardExitConfirmation;
        toolbarButtonModule.ACTION_MODEL_TAG = "dashboardActionModel";
    },

    /**
     * Update the src attribute for either all or a single IFrame
     * @param frameName
     */
    _updateAllIFramesSRCParam : function(frameName){
        if(frameName){
            var contentFrame = this._getContentFrameByName(frameName);
            this._updateIFramesSRCParam(contentFrame);
        }else{
            localContext.contentFrames.each(function(contentFrame){
                this._updateIFramesSRCParam(contentFrame);
            }.bind(this));
        }
    },

    /**
     * Update src attribute for IFrame
     */
    _updateIFramesSRCParam : function(contentFrame){
        var queryString = "";
        var frameName = null;
        var iFrame = null;
        var contextPath = null;
        var rootSRC = null;
        var fid_parm = null;
        
        if (contentFrame) {
            frameName = contentFrame.name;
            iFrame = this._getIFrameByName(frameName);

            contextPath = (contentFrame.resourceType == localContext.CUSTOM_RESOURCE_TYPE) ? "" : localContext.URL_CONTEXT_PATH;
            (contextPath == '' && contentFrame.uri == '') ? fid_parm = '' : fid_parm = '&fid=contentFrame_' + frameName;
            rootSRC = removeTrailingSlash(contextPath + contentFrame.source + contentFrame.uri + fid_parm);
            
            //update all input control params
            queryString = "";

            localContext.controlFrames.each(function(controlFrame) {
                var paramName = contentFrame[controlFrame.paramName];
                if (paramName) {
                    var valueAsArray = this._getSelectedValuesForControlFrame(controlFrame);
                    var paramValue = this._formatParamValue(paramName, valueAsArray);
                    var nextParamSymbol = getSymbolToAppendNextParam(rootSRC + queryString);

                    queryString = queryString + nextParamSymbol + paramValue;
                }
            }.bind(this));
            if (!isIPad()) {
                document.getElementById('contentFrameContainer_'+frameName).style.backgroundImage = 'url(themes/default/images/wait_animation_large.gif)';
            }
            iFrame.className = 'hidden';
            iFrame.writeAttribute("src", rootSRC + queryString);
        }
    },

    /**
     * Used to get selected values from control frame
     * @param frame
     */
    _getSelectedValuesForControlFrame : function(frame){
        return this.controlsController.getViewModel().get("selection")[frame.paramName];
    },

    /**
     * update the dashboard state received from the server
     */
    _updateState : function(){
        evaluateScript('dashboardDesignerState');
        this.initFramesByType();
        this.initDesignBaseVars();
        this._updateTitleClass(localContext.titleShowing);
        this.fontSizeTester = $("fontSizeTester");
        designerBase.updateSessionWarning();
        this.enablePreviewAndSave();
    },

    _updateScroll : function(){
        if(this.scroll) {
            var scrollWrapper = this.scroll.wrapper.down();
            var resolution = $("sizeGuide").getDimensions();

            scrollWrapper.setStyle({
                width : (resolution.width + 40) + "px",
                height : (resolution.height + 40) + "px"
            });

            this.scroll.refresh();
        }

        designerBase.updateIFrameScrolls();
    },

    /**
     * Update the base state
     */
    _updateBaseState : function(){
        evaluateScript('baseState');
    },

    /**
     * One time eval of dashboard constant state
     */
    _updateConstantState : function(){
        evaluateScript('dashboardDesignerConstantState');
    },

    /**
     * Wrapper method to invoke all state related methods
     */
    _updateAllStates : function(){
        this._updateState();
        this._updateBaseState();
        this._updateConstantState();
    },

    /**
     * Init the canvas drop zone
     */
    _setDashboardDropZone :function(){
        var realDZone = $(this.DROP_ZONE).up("div.content");
        var realDZoneID = "realDropZone";
        $(realDZone).writeAttribute("id", realDZoneID);
        //reset drop zone
        Droppables.remove(realDZoneID);
        Droppables.add(realDZoneID, {accept: ['componentContainer', 'iframe', 'wrap'], onDrop: localContext.dragNDropOfFrameObject});
    },

    /**
     * Init the canvas scroll
     */
    _createDashboardScroll :function(){
        if(isSupportsTouch()) {
            this.scroll = layoutModule.createScroller($(this.DROP_ZONE));
        }
    },

    ///////////////////////////////////////////////////////////////
    // Tree creation
    ///////////////////////////////////////////////////////////////

    /**
     * Gets the repo tree from the server
     */
    getRepositoryTree : function(){
        var repoTree = dynamicTree.createRepositoryTree(this.REPO_TREE_DOM_ID, {
            providerId: this.REPOSITORY_TREE_PROVIDER,
            rootUri: '/',
            organizationId: organizationId,
            publicFolderUri: publicFolderUri,
            urlGetNode: 'flow.html?_flowId=adhocTreeFlow&method=getNode',
            urlGetChildren: 'flow.html?_flowId=adhocTreeFlow&method=getChildren',
            dragPattern: '.leaf>.draggable',
            selectOnMousedown: !isIPad(),
            regionID: designerBase.DASHBOARD_REPO_TREE_LEVEL,
            treeErrorHandlerFn: function() {alert("error loading tree");}
        });

        return repoTree;
    },

    /**
     * Builds teh special content tree
     */
    getSpecialContentTree : function(){
        function SpecialContentTreeNode(options) {
            dynamicTree.TreeNode.call(this, options);

            this.Types = {
                Folder : new dynamicTree.TreeNode.Type('com.jaspersoft.jasperserver.api.metadata.common.domain.Folder'),
                NewNode : new dynamicTree.TreeNode.Type('com.jaspersoft.jasperserver.api.metadata.common.domain.NewNode')
            };
            this.nodeHeaderTemplateDomId = "list_responsive_collapsible_folders_specialContent:leaf";
        }

        SpecialContentTreeNode.prototype = deepClone(dynamicTree.TreeNode.prototype);

        var specialContentTree = new dynamicTree.TreeSupport(this.SPECIAL_TREE_DOM_ID, {
            bShowRoot: false,
            providerId: "",
            dragPattern: '.leaf>.draggable',
            nodeClass: SpecialContentTreeNode,
            selectOnMousedown: !isIPad(),
            regionID: designerBase.DASHBOARD_SPECIAL_CONTENT_TREE_LEVEL,
            templateDomId: "list_responsive_collapsible_folders_specialContent"
        });

        //root node
        var rootNode = {
            id: 'root',
            label: "Dashbaord Root",
            type: this.TREE_FOLDER_TYPE_CLASS,
            uri:'/'
        };

        var root = specialContentTree.processNode(rootNode);
        specialContentTree.setRootNode(root);
        specialContentTree.sortNodes = false;
        root.isloaded = true;
        root.editable = false;

        //add special content to root.
        var metaNode = {
            id: 'fakeRoot',
            label: localContext.SPECIAL_CONTENT_LABEL,
            type: this.TREE_FOLDER_TYPE_CLASS,
            uri:'/special_content',
            cssClass: 'specialContent'
        };

        var specialContentRoot = specialContentTree.processNode(metaNode);
        var parent = specialContentTree.getRootNode();
        specialContentRoot.isloaded = true;
        specialContentRoot.editable = false;
        parent.addChild(specialContentRoot);

        //now process all dependents
        var directDescendants = this.getCustomControlNodes().concat(this.getControlFolderNodes());
        this.appendChildNodeToParent(specialContentTree, specialContentRoot, directDescendants);
        //now process all standard controls
        directDescendants = this.getStandardControlNodes();
        this.appendChildNodeToParent(specialContentTree, this.standardControlNode, directDescendants);
        return specialContentTree;
    },

    _checkIfDraggingFromTree : function(){
        return (Draggables.dragging == designerBase.DASHBOARD_SPECIAL_CONTENT_TREE_LEVEL ||  Draggables.dragging == designerBase.DASHBOARD_REPO_TREE_LEVEL);
    },

    /**
     * Appends direct descendants to parent node
     * @param tree
     * @param parent
     * @param directDescendants
     */
    appendChildNodeToParent : function(tree, parent, directDescendants){
        var length = directDescendants.length;

        for(var index = 0; index < length; index++){
            var nodeObj = tree.processNode(directDescendants[index]);
            nodeObj.isloaded = true;
            nodeObj.editable = false;
            if(directDescendants[index].id == "otherCtlsFolder"){
                this.standardControlNode = nodeObj;
            }
            parent.addChild(nodeObj);
        }
    },

    /**
     * Creates the nodes for custom controls
     */
    getCustomControlNodes : function(){
        var controlNodeArray = [];

        //custom url node
        var customUrlNode = {
            id : 'custom_URL',
            uri: '/special_content/custom_URL',
            type: this.TREE_NODE_TYPE_CLASS,
            label: localContext.CUSTOM_URL_LABEL
        };

        //custom text node
        var textNode = {
            id : 'free_text',
            uri: '/special_content/free_text',
            type: this.TREE_NODE_TYPE_CLASS,
            label: localContext.FREE_TEXT
        };

        controlNodeArray.push(customUrlNode, textNode);
        return controlNodeArray;
    },

    /**
     * Creates the nodes for control folders
     */
    getControlFolderNodes : function(){
        var controlNodeArray = [];

        //single
        var singleFolderNode = {
            id : 'srCtlsFolder',
            children : [],
            uri: '/special_content/srCtlsFolder',
            type: this.TREE_FOLDER_TYPE_CLASS,
            label: localContext.SINGLE_REPORT_CONTROL_LABEL
        };

        //multiple
        var multipleFolderNode = {
            id : 'mrCtlsFolder',
            children : [],
            uri: '/special_content/mrCtlsFolder',
            type: this.TREE_FOLDER_TYPE_CLASS,
            label: localContext.MULTIPLE_REPORT_CONTROL_LABEL
        };

        //standard
        var standardFolderNode = {
            id : 'otherCtlsFolder',
            children : [],
            uri: '/special_content/otherCtlsFolder',
            type: this.TREE_FOLDER_TYPE_CLASS,
            label: localContext.STANDARD_REPORT_CONTROL_LABEL
        };

        controlNodeArray.push(singleFolderNode, multipleFolderNode, standardFolderNode);
        return controlNodeArray;
    },

    /**
     * Creates the nodes for all standard nodes
     */
    getStandardControlNodes : function(){
        var controlNodeArray = [];

        var submitNode = {
            id : 'button_submit',
            children : null,
            uri: '/special_content/otherCtlsFolder/button_submit',
            type: this.TREE_NODE_TYPE_CLASS,
            extra: "submit",
            label: localContext.SUBMIT_BUTTON_LABEL
        };

        var resetNode = {
            id : 'button_reset',
            children : null,
            uri: '/special_content/otherCtlsFolder/button_reset',
            type: this.TREE_NODE_TYPE_CLASS,
            extra: "reset",
            label: localContext.RESET_BUTTON_LABEL
        };

        var printNode = {
            id : 'button_print',
            children : null,
            uri: '/special_content/otherCtlsFolder/button_print',
            type: this.TREE_NODE_TYPE_CLASS,
            extra: "print",
            label: localContext.PRINT_BUTTON_LABEL
        };

        var textNode = {
            id : 'text_label',
            children : null,
            uri: '/special_content/otherCtlsFolder/text_label',
            type: this.TREE_NODE_TYPE_CLASS,
            label: localContext.TEXT_LABEL
        };

        controlNodeArray.push(submitNode, resetNode, printNode, textNode);
        return controlNodeArray;
    },

    /**
     * Helper method to get the real root node
     */
    _getSpecialContentTreeRoot : function(){
        if(this.specialContentTree.getRootNode()){
            return this.specialContentTree.getRootNode().getFirstChild();
        }
        return null;
    },

    /**
     * Helper used to update input control folders
     */
    _updateInputControlsNodes : function(){
        var controlNodeArray = [];
        var rootNode = this._getSpecialContentTreeRoot();

        if (rootNode) {
            //update single controls
            var singleControlNode = this.specialContentTree.findNodeChildByMetaName(rootNode, "srCtlsFolder");
            singleControlNode.resetChilds();

            localContext.controls.singleReport.each(function(control, index) {
                var metaNode = {
                    id : 'sr_' + index,
                    label : control.label,
                    uri: '/special_content/srCtlsFolder/sr_' + index,
                    type: localContext.TREE_NODE_CONTROL_TYPE,
                    extra : control.name
                };
                controlNodeArray.push(metaNode);
            });
            this.appendChildNodeToParent(this.specialContentTree, singleControlNode, controlNodeArray);

            //update multi controls
            controlNodeArray.clear();
            var multiControlNode = this.specialContentTree.findNodeChildByMetaName(rootNode, "mrCtlsFolder");
            multiControlNode.resetChilds();

            localContext.controls.multiReport.each(function(control, index) {
                var metaNode = {
                    id : 'mr_' + index,
                    label : control.label,
                    uri: '/special_content/mrCtlsFolder/mr_' + index,
                    type: localContext.TREE_NODE_CONTROL_TYPE,
                    extra : control.name
                };
                controlNodeArray.push(metaNode);
            });
            this.appendChildNodeToParent(this.specialContentTree, multiControlNode, controlNodeArray);

        }
        this.specialContentTree.renderTree();
    },

    ///////////////////////////////////////////////////////////////
    // Event handling
    ///////////////////////////////////////////////////////////////

    /**
     * Used to init all dashboard general events.
     */
    initDashboardGeneralEvents : function(){
        if(!isSupportsTouch()) {
            /**
             * Override for dahsboard to include IE7
             * @param {Object} evt
             */
            $("dashboardCanvasArea").observe('mouseover', function(evt){
                var element = evt.element();
                matchMeOrUp(element,layoutModule.BUTTON_PATTERN) &&
                    !relatedTargetInElementSubtree(evt,element) &&
                    buttonManager.over(element);
                Event.stop(evt);
            });

            /**
             * Override for dahsboard to include IE7
             * @param {Object} evt
             */
            $("dashboardCanvasArea").observe('mouseout', function(evt){
                var element = evt.element();
                matchMeOrUp(element,layoutModule.BUTTON_PATTERN) &&
                    !relatedTargetInElementSubtree(evt,element) &&
                    buttonManager.out(element);
                Event.stop(evt);
            });
        }

        document.observe(layoutModule.ELEMENT_CONTEXTMENU, function(event){
            var matched = null;
            var proceed = true;
            var contextLevel = null;
            var element = event.memo.node;
            var evt = event.memo.targetEvent;

            matched = matchAny(element, [this.SPECIAL_TREE_LEAF_PATTERN, this.REPO_TREE_LEAF_PATTERN], true);
            if(matched){
                var isRepo = matchAny(element, [this.REPO_TREE_LEAF_PATTERN], true);
                var tree = isRepo ? this.repoTree : this.specialContentTree;
                contextLevel = isRepo ? "repo" : "special";
                element = tree.getTreeNodeByEvent(event.memo.targetEvent);
                if(tree.isNodeSelected(element)){
                    if(!designerBase.isInSelection(element)){
                        this._addTreeLeafToSelection(element, isRepo);
                    }else{
                        var context = this.contextLevels[contextLevel];
                        this.showDynamicMenu(evt, context, null);
                        return;
                    }
                }
            }

            matched = matchAny(element, [this.CONTENT_FRAME_OVERLAY_PATTERN,
                this.CONTROL_FRAME_OVERLAY_PATTERN,
                this.CLICKABLE_FRAME_OVERLAY_PATTERN,
                this.TEXT_FRAME_OVERLAY_PATTERN], false);

            if(matchAny(matched, [this.CONTENT_FRAME_OVERLAY_PATTERN], false)){
                proceed = this._isIFrameContentLoaded(matched);
            }

            if(matched && proceed){
                var menuLevel = null;
                var pattern = null;

                if(element.match(this.CONTENT_FRAME_OVERLAY_PATTERN)){
                    menuLevel = designerBase.DASHBOARD_CONTENT_FRAME_MENU_LEVEL;
                    pattern = "this.CONTENT_FRAME_OVERLAY_PATTERN";
                }else if(element.match(this.CLICKABLE_FRAME_OVERLAY_PATTERN)){
                    menuLevel = designerBase.DASHBOARD_CLICKABLE_FRAME_MENU_LEVEL;
                    pattern = "this.CLICKABLE_FRAME_OVERLAY_PATTERN";
                }else if(element.match(this.TEXT_FRAME_OVERLAY_PATTERN)){
                    menuLevel = designerBase.DASHBOARD_TEXT_FRAME_MENU_LEVEL;
                    pattern = "this.TEXT_FRAME_OVERLAY_PATTERN";
                }else if(element.match(this.CONTROL_FRAME_OVERLAY_PATTERN)){
                    menuLevel = designerBase.DASHBOARD_CONTROL_FRAME_MENU_LEVEL;
                    pattern = "this.CONTROL_FRAME_OVERLAY_PATTERN";
                }else{
                    throw("unknown pattern!")
                }

                if(!designerBase.isObjectInSelection(element, "id")){
                    this.patternToAddAction[pattern].apply(this, [element, event]);
                }
                this.showDynamicMenu(evt, menuLevel , null);
            }
        }.bind(this));

        document.observe('key:delete' , function(event) {
            if (!this.customURLDialog.isVisible) {
                //hide menu if showing
                actionModel.hideMenu();
                this.deleteSelectedFrames();
            }
        }.bind(this));

        document.observe('key:enter' , function(event) {
            var element = event.memo.node;
            var matched = matchAny(element, ["input.edit"], true);

            //hide menu if showing
            actionModel.hideMenu();
            if(matched){
                this._deselectAllSelectedDashboardFrames();
                Event.stop(event.memo.targetEvent);
            }
        }.bind(this));

        document.observe('key:selectAll' , function(event) {
            //hide menu if showing
            actionModel.hideMenu();
            this._deselectAllSelectedDashboardFrames();
            this._selectAllDashboardFrameObjects(event.memo.targetEvent);
            Event.stop(event.memo.targetEvent);
        }.bind(this));

        document.observe('key:save' , function(event) {
            //hide menu if showing
            actionModel.hideMenu();
            if(this.canSaveDashboard()){
                this._deselectAllSelectedDashboardFrames();
                designerBase.handleSave();
                Event.stop(event.memo.targetEvent);
            }
        }.bind(this));

        document.observe('key:escape' , function(event) {
            var matched = null;
            var element = null;
            var parent = null;
            //hide menu if showing
            this.hideAllDialogsAndMenus();

            if(this.draggingMarquee){
                Event.stopObserving(document.body, 'mousemove');
                this._deleteMarquee();
                this.draggingMarquee = false;
            }

            element = event.element();
            matched = element.match(this.EDITING_TEXT_PATTERN);
            if(matched){
                var div = $(element).previousSiblings()[0];
                element.value = $(div).innerHTML;
                parent = $(element).up("DIV.editMode");
                $(parent).removeClassName("editMode");
            }

        }.bind(this));

        document.observe('keydown', function(event){
            var coord = null;
            var element = null;

            if (this.selectedFrameOverlays.length > 0 && !this.customURLDialog.isVisible) {
                coord = this._getNewFrameCoordinates(event);
                this._moveFramesByKeys(coord);
            }

            //capture for tab pressed when editing free text or text label
            if(event.keyCode == Event.KEY_TAB && !this.titleEditing){
                element = event.element();
                if(element.nodeName == "INPUT" && $(element).hasClassName("edit")){
                    var parent = $(element).up("DIV");
                    if($(parent) && $(parent).hasClassName("editMode")){
                        this._deselectAllSelectedDashboardFrames();
                    }
                }
            }

            if(this.titleEditing){
                if (event.keyCode == Event.KEY_ESC) {
                    this._revertToBackHeaderTitle();
                }

                if(event.keyCode == Event.KEY_TAB){
                    this._revertDashboardTitleFromEditMode(event);
                }
            }

        }.bind(this));

        document.observe('keyup', function(event){
            if(this.selectedFrameOverlays.length > 0 && !this.customURLDialog.isVisible){
                if(event.keyCode == Event.KEY_LEFT || event.keyCode == Event.KEY_RIGHT ||
                        event.keyCode == Event.KEY_UP || event.keyCode == Event.KEY_DOWN){
                    this.notifyServerMoveFrames();
                }
            }
        }.bind(this));

        document.observe('dragger:sizer', function(event){
            this.adjustingFontSize = false;
            var adjustedFrames = null;
            var evt = event.memo.targetEvent;
            var element = event.memo.element;
            var parentContainer = $(element).up("DIV");

            if(parentContainer){
                if( $(parentContainer).hasClassName("free")){
                    adjustedFrames = this._adjustFontForSelectedTextFrames();
                    this.adjustingFontSize = true;
                    this.notifyServerResizeFrames(this.adjustingFontSize, adjustedFrames);
                    this._deselectAllSelectedDashboardFrames();
                }

                if(parentContainer.match(this.CONTROL_FRAME_PATTERN)){
                    this._updateAllSelectedControlFrameCoordinates();
                }

                if(parentContainer.match(this.CONTENT_FRAME_PATTERN)){
                    this._updateAllSelectedContentFrameCoordinates();
                }
            }
        }.bind(this));

        $("customURL").observe("click", function(event){
            var matched = null;
            var element = event.element();

            matched = matchAny(element, [this.CUSTOM_URL_CANCEL_BTN_PATTERN, this.CUSTOM_URL_OK_BTN_PATTERN], true);
            if(matched){
                var buttonId = $(matched).identify();
                if(buttonId.endsWith("Cancel")){
                    //delete frame if in creation mode not edit mode
                    if (this.currentCustomFrame && !this.customURLDialog.isEditMode) {
                        $(this.currentCustomFrame).remove();
                    }
                    this._hideCustomURLPrompt();
                }else{
                    if(!$("customURLInput").value.blank()){
                        $(this.currentCustomFrame).removeClassName("hidden");
                        this._processCustomURLPromptInput();
                    }else{
                        this._invalidCustomURLError();
                    }
                }
                Event.stop(event);
            }
        }.bind(this));

        $("customURL").observe("key:enter", function(event){
            if(!$("customURLInput").value.blank()){
                $(this.currentCustomFrame).removeClassName("hidden");
                this._processCustomURLPromptInput();
            }else{
                this._invalidCustomURLError();
            }
        }.bind(this));

        $(this.DASHBOARD_DOM_ID).observe("mouseover", function(event){
            var matched = null;
            var element = event.element();

            matched = matchAny(element, [this.CONTENT_FRAME_OVERLAY_PATTERN, this.CONTENT_FRAME_PATTERN], true);
            if(matched){
                if(this._checkIfDraggingFromTree()){
                    var containerId = null;
                    if(matched.match(this.CONTENT_FRAME_OVERLAY_PATTERN)){
                        containerId = matched.identify();
                    }else{
                        containerId = $(matched).down("DIV.overlay").identify();
                    }
                    Effect.Pulsate(containerId, { pulses: 5, duration: 2.0 });
                }
            }
        }.bind(this));

        $(this.DROP_ZONE).observe(isSupportsTouch() ? 'touchstart' : 'mousedown', function(event){
            var element = event.element();

            if(element.match(this.TITLE_PATTERN)){
                this._deselectAllSelectedDashboardFrames();
                this.editDashboardTitle();
                Event.stop(event);
            }

            var matched = matchAny(element, [this.EDITABLE_TEXT_PATTERN], true);
            if(matched){
                this._deselectAllSelectedDashboardFrames();
            }
        }.bind(this));

        $("dashboardCanvasArea").observe(isSupportsTouch() ? 'touchstart' : 'mousedown', function(event){
            var matched = null;
            var element = getTouchedElement(event);

            matched = matchAny(element, [this.CONTENT_FRAME_PATTERN, this.CONTROL_FRAME_PATTERN], true);
            if(!matched){
                this._deselectAllSelectedDashboardFrames();
                
                if (event.touches && event.touches.length == 1) {
                    isSupportsTouch() && this._deleteMarquee();
                } else {
                    this._createMarquee(event);
                    this.marqueeMovePosition = {x : event.pointerX(), y : event.pointerY()};
                    this.marqueeStartPosition = {x : event.pointerX(), y : event.pointerY()};
                    //listen for event move
                    this.boundHandlerMethod = this._moveListener.bind(this);
                    Event.observe(document.body, 'mousemove', this.boundHandlerMethod);                	
                }
            }
            //hide menu if showing
            actionModel.hideMenu();
            //event.preventDefault();
        }.bind(this));

        Event.observe(document.body, isSupportsTouch() ? 'touchend' : 'mouseup', function(event){
            if (this.boundHandlerMethod) {
                Event.stopObserving(document.body, 'mousemove', this.boundHandlerMethod);
                this._caughtByMarquee(event);
                this._deleteMarquee();
                this.boundHandlerMethod = null;
            }
        }.bind(this));

        $(this.DROP_ZONE).observe(isSupportsTouch() ? 'touchend' : 'mouseup', function(event){
            var matched = null;
            var element = event.element();

            if (!isRightClick(event) && !this.draggingMarquee) {
                if (this._checkIfDraggingFromTree()) {
                    matched = matchAny(element, [this.CONTENT_FRAME_OVERLAY_PATTERN, this.CONTENT_FRAME_PATTERN], true);
                    if(matched){
                        this.shouldReplace = true;
                        var overlay = null;
                        if(matched.match(this.CONTENT_FRAME_PATTERN)){
                            overlay = $(matched).down("DIV.overlay");
                        }else{
                            overlay = matched;
                        }
                        if(overlay){
                            this.replacingFrameName = $(overlay).readAttribute("data-frameName");
                        }
                    }
                } else {
                    if (element.match(this.CONTENT_FRAME_OVERLAY_PATTERN)) {
                        this.addContentFrameToSelection(element, event);
                    } else if (element.match(this.CLICKABLE_FRAME_OVERLAY_PATTERN)) {
                        this.addClickableFrameToSelection(element, event);
                    } else if (element.match(this.TEXT_FRAME_OVERLAY_PATTERN)) {
                        this.addTextFrameToSelection(element, event);
                    } else if (element.match(this.CONTROL_FRAME_OVERLAY_PATTERN)) {
                        this.addControlFrameToSelection(element, event);
                    }

                    if (element.match(this.CONTENT_FRAME_PATTERN)) {
                        var overlayObject = $(element).down("DIV.overlay.button");
                        if ($(overlayObject)) {
                            this.addContentFrameToSelection(overlayObject, event);
                        }
                    }

                    matched = matchAny(element, [this.EDITABLE_TEXT_PATTERN], true);
                    if (matched) {
                        var parent = $(matched).up("DIV");
                        if (parent && !$(parent).hasClassName("editMode")) {
                            this.currentEditingTextFrame = $(parent);
                            this.currentEditingTextFrame.addClassName("editMode");
                            this.currentEditingTextFrame.down("input.edit").focus();
                            this.currentEditingTextFrame.down("input.edit").select();
                        }
                    }

                }
            }

        }.bind(this));

        $(this.DROP_ZONE).observe('click', function(event){
            var matched = null;
            var element = event.element();

            matched = matchAny(element, ["div.componentContainer.control.actionButton>button.action"], true);
            if(matched){
                var buttonId = matched.identify();
                var regex = /[A-Za-z]+$/;
                var regexMatch = regex.exec(buttonId)[0];
                if(regexMatch){
                    this.buttonIdToAction[regexMatch]();
                    event.stop();
                }
            }
        }.bind(this));

        Event.observe($(this.DROP_ZONE),'scroll', function(evt) {
            //hide menu if showing
            actionModel.hideMenu();
            this._setDashboardDropZone();
        }.bind(this));

        Event.observe($(this.DASHBOARD_TREE_CONTAINER_ID),'scroll', function(evt) {
            //hide menu if showing
            actionModel.hideMenu();
        }.bind(this));

        document.stopObserving(isSupportsTouch() ? 'touchend' : 'mouseup', localContext.deSelectAllPressedNavMuttons);
        document.observe(isSupportsTouch() ? 'touchend' : 'mouseup', localContext.deSelectAllPressedNavMuttons);
    },

    /**
     * Init events for dashboard tree objects
     */
    initDashboardTreeEvents : function(){
        var trees = [this.specialContentTree, this.repoTree];
        for(var index = 0; index < trees.length; index++){
            trees[index].observe('leaf:mousedown', function(event) {
                var node = event.memo.node;
                var element = event.element();
                var isRepo = matchAny(element, [this.REPO_TREE_LEAF_PATTERN], true);
                var tree = this._getOtherTreeObject(element, isRepo);
                //tree._deselectAllNodes();
                this._deselectAllSelectedDashboardFrames();
                this._addTreeLeafToSelection(node, isRepo);
            }.bind(this));

            trees[index].observe('leaf.drag:mousedown', function(event) {
                var evt = event.memo.targetEvent;
                var node = event.memo.node;
                var element = event.element();
                var isRepo = matchAny(element, [this.REPO_TREE_LEAF_PATTERN], true);
                var tree = this._getOtherTreeObject(element, isRepo);
                //tree._deselectAllNodes();
                this._deselectAllSelectedDashboardFrames();
                this._addTreeLeafToSelection(node, isRepo);
            }.bind(this));

            trees[index].observe('leaf:dblclick', function(event) {
                var evt = event.memo.targetEvent;
                var node = event.memo.node;
                var element = event.element();
                var isRepo = matchAny(element, [this.REPO_TREE_LEAF_PATTERN], true);
                var tree = this._getOtherTreeObject(element, isRepo);
                this.quickAddOfFrameObject(evt, node);
                tree._deselectAllNodes();
                this._deselectAllSelectedDashboardFrames();
            }.bind(this));

            trees[index].observe('node:mousedown', function(event){
                var element = event.element();
                var isRepo = matchAny(element, [this.REPO_TREE_LEAF_PATTERN], true);
                var tree = this._getOtherTreeObject(element, isRepo);
                tree._deselectAllNodes();
                this._deselectAllSelectedDashboardFrames();
            }.bind(this));


            trees[index].observe('node.drag:mousedown', function(event){
                var element = event.element();
                var isRepo = matchAny(element, [this.REPO_TREE_LEAF_PATTERN], true);
                var tree = this._getOtherTreeObject(element, isRepo);
                tree._deselectAllNodes();
                this._deselectAllSelectedDashboardFrames();
            }.bind(this));
        }

    },

    ///////////////////////////////////////////////////////////////
    // Conditional functions
    ///////////////////////////////////////////////////////////////

    /**
     * Check to see if title is showing
     */
    isTitleShowing : function(){
        return localContext.titleShowing;
    },

    /**
     * are we performing a multiselect
     * @param event
     * @param area
     */
    isMultiSelect : function(event, area){
        var metaKey = isMetaHeld(event);
        var section = selectionCategory.area == area;
        return (section && metaKey);
    },

    /**
     * have we selected multiple content frames
     */
    multipleContentFramesSelected : function(){
        var count = 0;
        var multiple = false;
        this.selectedFrameOverlays.each(function(frame){
            var frameType = $(frame).readAttribute("data-frameType");
            if(frameType === this.CONTENT_FRAME){
                if(++count > 1){
                    multiple = true;
                    throw $break;
                }
            }
        }.bind(this));
        return multiple;
    },

    onlyContentFramesSelected : function(){
        var success =  true;
        this.selectedFrameOverlays.each(function(frame){
            var frameType = $(frame).readAttribute("data-frameType");
            if(frameType != this.CONTENT_FRAME){
                success = false;
                throw $break;
            }
        }.bind(this));
        return success;
    },

    singleContentFrameSelected : function(){
        if(localContext.singleFrameSelected()){
            var selectedFrame =  localContext.selectedFrameOverlays[0];
            var frameType = $(selectedFrame).readAttribute("data-frameType");
            return (frameType === this.CONTENT_FRAME);

        }
        return false;
    },

    /**
     * Have we selected multiple frames
     */
    multipleFramesSelected : function(){
        return (localContext.selectedFrameOverlays.length > 1);
    },

    singleFrameSelected : function(){
        return (localContext.selectedFrameOverlays.length == 1);
    },

    /**
     * Check if we have selected a content frame
     */
    contentFramesSelected : function(){
        var count = 0;
        var multiple = false;
        this.selectedFrameOverlays.each(function(frame){
            var frameType = $(frame).readAttribute("data-frameType");
            if(frameType === this.CONTENT_FRAME){
                if(++count > 0){
                    multiple = true;
                    throw $break;
                }
            }
        }.bind(this));
        return multiple;
    },

    /**
     * Can we edit this frame
     */
    canEditCustomFrame : function(){
        if(localContext.singleFrameSelected()){
            var selectedFrame = localContext._getLastSelectedOverlayFrame();
            if(selectedFrame && $(selectedFrame).hasAttribute("data-isCustom")){
                var value = $(selectedFrame).readAttribute("data-isCustom");
                return (value === "true");
            }
        }
        return false;
    },

    /**
     * Can we hide the scroll bars on this frame
     */
    canHideScrollBars : function(){
        return (localContext.singleContentFrameSelected() && !localContext._checkIfAnySelectedFrameHasOverflowOff());
    },

    /**
     * Can we show the scroll bars on this frame
     */
    canShowScrollBars : function(){
        return (localContext.singleContentFrameSelected() && localContext._checkIfAnySelectedFrameHasOverflowOff());

    },

    /**
     * Can we hide all the scroll bars on all selected frames
     */
    canHideAllScrollBars : function(){
        return (localContext.multipleContentFramesSelected() && !localContext._checkIfAnySelectedFrameHasOverflowOff());
    },

    /**
     * Can we show all
     */
    canShowAllScrollBars : function(){
        return (localContext.multipleContentFramesSelected() && localContext._checkIfAnySelectedFrameHasOverflowOff());
    },

    canShowRefreshOptions : function(){
        return localContext.onlyContentFramesSelected();
    },

    /**
     * Check to see if scroll bars are present on iframe
     * @param iFrame
     */
    isScrollBarsPresent : function(iFrame){
        if($(iFrame)){
            //iFrame with custom frame should be processed in different way because of security restrictions
            var isCustomFrame = this._isCustomFrame(iFrame, this._getIFrameNameFromIFrame);
            var iFrameObj = isCustomFrame ? iFrame : getIFrameDocument(document.getElementById(iFrame)).body;
            var style = isWebKitEngine() ? "overflow-x" : "overflow";
            var overflow = $(iFrameObj).getStyle(style);
            return (overflow === "scroll");
        }

        return false;
    },

    /**
     * Check if a node is a custom url node type
     */
    _isCustomURLNode : function(node){
        if(node && node.name){
            return (node.name === localContext.CUSTOM_URL_LABEL);
        }
        return false;
    },

    /**
     * Check if node is a text node
     * @param node
     */
    _isFreeTextNode : function(node){
        if(node && node.name){
            return (node.name === localContext.FREE_TEXT);
        }
        return false;
    },

    /**
     * Check if node is a text label node
     * @param node
     */
    _isTextLabelNode : function(node){
        if(node && node.name){
            return (node.name === localContext.TEXT_LABEL);
        }
        return false;
    },

    _isClickableNode : function(node){
        if(node && node.param){
            return startsWith(node.param.id, localContext.NODE_CLICKABLE_PREFIX);
        }
        return false;
    },

    /**
     * Check if frame is a content frame
     * @param overlay
     */
    _isContentFrame : function(overlay){
        if(overlay && overlay.frameType){
            return (overlay.frameType === localContext.CONTENT_FRAME);
        }
        return false;
    },

    /**
     * Helper to determine if a node is a control node
     * @param node
     */
    _isControlNode : function(node){
        if(node && node.param){
            return (node.param.type === localContext.TREE_NODE_CONTROL_TYPE);
        }
    },

    /**
     * Used to determine which view we are in
     */
    isInFixedSizeMode : function(){
        return localContext.isFixedSizing;
    },

    isInProportionalSizeMode : function(){
        return !localContext.isFixedSizing;
    },

    /**
     * Used to determine if a submit button is present on the canvas
     */
    _hasSubmitButton : function(){
        return $("button_submit");
    },

    /**
     * Used to determine if a print button is present on the canvas
     */
    _hasPrintButton : function(){
        return $("button_print");
    },

    /**
     * Used to determine if a reset button is present on the canvas
     */
    _hasResetButton : function(){
        return $("button_reset");
    },

    isNonContentFrameSelected : function(){
        var isNonContentFrame = false;
        localContext.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var frameType = $(overlay).readAttribute("data-frameType");
                var isCustomFrame = $(overlay).readAttribute("data-isCustom");

                if (frameType !== this.CONTENT_FRAME || isCustomFrame === "true") {
                    isNonContentFrame = true;
                    throw $break;
                }
            }
        }.bind(localContext));
        return isNonContentFrame;
    },

    isCurrentRefreshOption : function(option){
        var found = false;
        var selectedFrame = localContext.selectedFrameOverlays.last();
        if(selectedFrame){
            var frameName = $(selectedFrame).readAttribute("data-frameName");
            var frameType = $(selectedFrame).readAttribute("data-frameType");
            if(frameType === localContext.CONTENT_FRAME){
                var frame = localContext._getContentFrameByName(frameName);
                if(frame){
                    return (parseFloat(option) === parseFloat(frame.autoRefresh));
                }
            }
        }
        return found;
    },

    canSaveDashboard : function(){
        var canSave = false;
        localContext.frameTypes.each(function(frameType){
            var collection = localContext.framesByType[frameType];
            if(collection.length > 0){
                canSave = true;
                throw $break;
            }
        });

        return canSave;
    },

    dashboardHasTitle : function(showInEditMode){
        return !localContext._isDashboardTitleDeleted(showInEditMode);
    },

    _isIFrameContentLoaded : function(overlay){
        var iFrameId = this._getIFrameIDFromOverlay(overlay);
        var iFrame = $(iFrameId);
        var isCustom = $(overlay).hasAttribute("data-iscustom") ? $(overlay).readAttribute("data-iscustom") : false;
        //if it is custom
        if(isCustom === "true"){
            if(isIE()){
                return ($(iFrame).document.readyState === "complete");
            }else{
                if(iFrame){
                    var loaded = $(iFrame).readAttribute("data-iframeLoaed");
                    return (loaded == "complete");
                }else{
                    return false;
                }
            }
        }else{
            //if non custom
            if(iFrame){
                if($(iFrame).contentDocument){
                    //this is to solve a specific ff 3.5 issue. 3.5 doesn't have the readyState property so we revert
                    //back to the behavior in JS 3.7. i.e. we don't care :-)
                    if(this._testIfFireFox3_5()){
                        return true;    
                    }else{
                        return ($(iFrame).contentDocument.readyState === "complete");
                    }
                }else{
                    return ($(iFrame).document.readyState === "complete");
                }
            }else{
                return false;
            }
        }
    },

    _testIfFireFox3_5 : function(){
        return navigator.userAgent.toLowerCase().include("firefox/3.5")
    },

    _updateIFrameLoadingStatus : function(overlayId, isScrolling){
        var iFrameId = null;
        var overlay = $(overlayId);
        if(overlay){
            iFrameId = this._getIFrameIDFromOverlay(overlay);
            if($(iFrameId)){
                $(iFrameId).writeAttribute("data-iframeLoaed", "complete");
                var parent = $(overlayId).up("DIV");
                
				/* 
				 * Commenting out line below. Hiding loading icon from report.runtime.js 
				 * so that loading icon disappears when report 
				 * content has been loaded inside iframe. 
				 */
                //$(parent).setStyle({backgroundImage : 'none'});
                
                var ide = document.getElementById(iFrameId);
                if(ide && ide.getAttribute('src')){
                	if(ide.getAttribute('src').indexOf('http') == 0 || ide.getAttribute('src').indexOf('_flowId=dashboardRuntimeFlow') > 0) {
                		document.getElementById(iFrameId).className = '';
                	}
                }

                this.toggleScrollBarsOnClient(iFrameId, isScrolling === localContext.SCROLL_ENABLED);
                this._updateScroll();
            }
        }
    },

    ///////////////////////////////////////////////////////////////
    // Helper functions
    ///////////////////////////////////////////////////////////////

    _getNewFrameCoordinates : function(event){
        var coord = null;
        var increment = localContext.gridSize;
        if(isMetaHeld(event)){
            increment = 1;
        }
        if(event.keyCode == Event.KEY_LEFT){
            coord = {left : -increment};
            Event.stop(event);
        }
        if(event.keyCode == Event.KEY_RIGHT){
            coord = {left : increment};
            Event.stop(event);
        }
        if(event.keyCode == Event.KEY_UP){
            coord = {top : -increment};
            Event.stop(event);
        }
        if(event.keyCode == Event.KEY_DOWN){
            coord = {top : increment};
            Event.stop(event);
        }
        return coord;
    },

    /**
     * Used to create marquee object
     * @param event
     */
    _createMarquee : function(event){
        var left = event.pointerX();
        var top = event.pointerY();
        var marquee = Builder.node('div', {id : "dragmarquee", className : "dragmarquee", style: "left:" + left + "px; top:" + top + "px"});
        $(this.DASHBOARD_DOM_ID).appendChild(marquee);
    },

    /**
     * Used to delete marquee object
     */
    _deleteMarquee : function (){
        this.draggingMarquee = false;
        if($("dragmarquee")){
            $("dragmarquee").remove();
        }
    },

    /**
     * Mover listener for marquee
     * @param event
     */
    _moveListener : function(event){
        var dragmarquee = $('dragmarquee');
        if (dragmarquee) {
        	
            if(event.changedTouches && event.changedTouches.length > 1) {
                this._deleteMarquee();
            } else {
                this.draggingMarquee = true;
                var moved = {
                    x : (event.pointerX() - this.marqueeMovePosition.x),
                    y : (event.pointerY() - this.marqueeMovePosition.y)
                };

                var width = Math.abs(moved.x);
                var height = Math.abs(moved.y);

                if(moved.x >= 0){
                    dragmarquee.setStyle({
                        width : width + 'px'
                    });
                }else{
                    dragmarquee.setStyle({
                        left : event.pointerX()  + 'px',
                        width : width + 'px'
                    });
                }

                if(moved.y >= 0){
                    dragmarquee.setStyle({
                        height :  height + 'px'
                    });
                }else{
                    dragmarquee.setStyle({
                        top : event.pointerY() + 'px',
                        height :  height + 'px'
                    });

                }
            }
        }
    },

    /**
     * Helper to determine if object wa caught by marquee
     * @param event
     */
    _caughtByMarquee : function(event){
        var selectionMarquee = $("dragmarquee");
        var capturedFrames = [];
        if (selectionMarquee) {
            var activeOverlays = $$("div#dashboardDropZone div.overlay.button");
            var dropZoneOffset = $(this.DROP_ZONE).cumulativeOffset();
            var dropZoneScrollOffset = $(this.DROP_ZONE).cumulativeScrollOffset();
            //marquee
            var marqueeOffset = $(selectionMarquee).cumulativeOffset();
            var marqueeScrollOffset = $(selectionMarquee).cumulativeScrollOffset();
            var marqueeDimensions = $(selectionMarquee).getDimensions();

            var marqueeLeft = parseInt(marqueeOffset[0]) -  parseInt(dropZoneOffset[0]) + parseInt(dropZoneScrollOffset[0]) - parseInt(marqueeScrollOffset[0]);
            var marqueeTop = parseInt(marqueeOffset[1]) -  parseInt(dropZoneOffset[1]) + parseInt(dropZoneScrollOffset[1]) - parseInt(marqueeScrollOffset[1]);
            var marqueeWidth = parseInt(marqueeDimensions.width);
            var marqueeHeight = parseInt(marqueeDimensions.height);
            var marqueeRight = marqueeLeft + ((isNaN(marqueeWidth)) ? 0 : marqueeWidth);
            var marqueeBottom = marqueeTop + ((isNaN(marqueeHeight)) ? 0 : marqueeHeight);

            activeOverlays.each(function(overlay) {
                var frameType = $(overlay).readAttribute("data-frametype");
                var frameName = $(overlay).readAttribute("data-frameName");
                var frame = this._getFrameByNameAndType(frameType, frameName);

                //frame
                if (frame) {
                    var frameLeft = parseInt(frame["left"]);
                    var frameTop = parseInt(frame["top"]);
                    var frameRight = frameLeft + parseInt(frame["width"]);
                    var frameBottom = frameTop + parseInt(frame["height"]);

                    var overlapping = boxesOverlap(
                            marqueeLeft,
                            marqueeTop,
                            marqueeRight,
                            marqueeBottom,
                            frameLeft,
                            frameTop,
                            frameRight,
                            frameBottom);

                    if (overlapping) {
                        var captured = {
                            overlay : overlay,
                            type : frameType
                        };
                        capturedFrames.push(captured);
                    }
                }
            }.bind(this));
        }
        this._batchSelection(capturedFrames, event);
    },

    /**
     * Used to select items caught by marquee
     * @param capturedFrames
     * @param event
     */
    _batchSelection : function(capturedFrames, event){
        var menuLevel = null;

        capturedFrames.each(function(frame){
            var frameType = frame.type;
            var overlay = frame.overlay;

            if (frameType) {
                if (frameType.startsWith("content")) {
                    menuLevel = this.contextLevels["content"];
                } else if (frameType.startsWith("clickable")) {
                    menuLevel = this.contextLevels["clickable"];
                } else if (frameType.startsWith("text")) {
                    menuLevel = this.contextLevels["text"];
                } else if (frameType.startsWith("control")) {
                    menuLevel = this.contextLevels["control"];
                }
                this._addFrameToSelection(overlay, menuLevel, event, true);
            }

        }.bind(localContext))


    },

    /**
     * Gets  a tree object
     * @param element
     * @param isRepo
     */
    _getOtherTreeObject : function(element, isRepo){
        return isRepo ? this.specialContentTree : this.repoTree;
    },

    /**
     * Adding a node to the selected list
     * @param node
     * @param isRepo
     */
    _addTreeLeafToSelection : function(node, isRepo){
        selectionCategory.area = isRepo ? designerBase.DASHBOARD_REPO_TREE_AREA : designerBase.DASHBOARD_SPECIAL_CONTENT_TREE_AREA;
        designerBase.unSelectAll();
        designerBase.addToSelected(node);
    },

    dashboardSpecificEvents :  function(){
        this.initDashboardTreeEvents();
        toolbarButtonModule.initialize(this.toolbarActionMap);
    },

    updateMenuPrerequisites : function(contextLevel){
        var selected = selObjects.last();
        selected.menuLevel = contextLevel;
    },

    showDynamicMenu : function(event, contextLevel, coordinates){
        this.updateMenuPrerequisites(contextLevel);
        actionModel.showDynamicMenu(contextLevel, event, null, coordinates, this.ACTION_MODEL_TAG);
        document.body.observe(isSupportsTouch() ? 'touchend' : 'click', this.dynamicMenuOnClick);

    },

    dynamicMenuOnClick : function(event){
        if(!macOSKeyboardRightClick(event)) {
            actionModel.hideMenu();
            Event.stopObserving(document.body, isSupportsTouch() ? 'touchend' : 'click', this.dynamicMenuOnClick);
        }
    },

    /**
     * Toggle scroll bars on iframe
     * @param iFrame
     * @param show
     */
    toggleScrollBarsOnClient : function(iFrame, show){
        if(iFrame){
            //iFrame with custom frame should be processed in different way because of security restrictions
            var isCustomFrame = this._isCustomFrame(iFrame, this._getIFrameNameFromIFrame);

            var iFrameObj = isCustomFrame ? iFrame : getIFrameDocument(document.getElementById(iFrame)).body;

            var scroll = show ? 'scroll' : 'hidden';
            var scrolling = show ? 'yes' : 'no';

            var style = isWebKitEngine() ? {"overflow-x" : scroll, "overflow-y" : scroll} : {"overflow" : scroll};

            !isIE7() && jQuery('#'+iFrame).attr('scrolling', scrolling);
            $(iFrameObj).setStyle(style);
        }
    },

    /**
     * Add a selected content frame to a selection
     * @param frameOverlay
     * @param event
     */
    addContentFrameToSelection : function(frameOverlay, event){
        this._addFrameToSelection(frameOverlay, designerBase.DASHBOARD_CONTENT_FRAME_MENU_LEVEL, event);
    },

    /**
     * Function to add control frame to selection list
     * @param frameOverlay
     * @param event
     */
    addControlFrameToSelection : function(frameOverlay, event){
        this._addFrameToSelection(frameOverlay, designerBase.DASHBOARD_CONTROL_FRAME_MENU_LEVEL, event);
    },

    /**
     * Function to add text frame to selection list
     * @param frameOverlay
     * @param event
     */
    addTextFrameToSelection : function(frameOverlay, event){
        this._addFrameToSelection(frameOverlay, designerBase.DASHBOARD_TEXT_FRAME_MENU_LEVEL, event);
    },

    /**
     * Function to add clickable frame to selection list
     * @param frameOverlay
     * @param event
     */
    addClickableFrameToSelection : function(frameOverlay, event){
        this._addFrameToSelection(frameOverlay, designerBase.DASHBOARD_CLICKABLE_FRAME_MENU_LEVEL, event);
    },

    /**
     * Generic method to add frame to selection list
     * @param frameOverlay
     * @param menuLevel
     * @param event
     */
    _addFrameToSelection : function(frameOverlay, menuLevel, event, skipMultiSelectCheck){
        var parentIdPrefix = null;
        var pattern = null;
        var parentId = null;
        var skip = false;
        var sizeable = false;

        this._deselectAllTreeNodes();

        if (isMetaHeld(event)) {
            skip = true;
        } else {
            if (skipMultiSelectCheck) {
                skip = skipMultiSelectCheck;
            } else {
                skip = false;
            }
        }


        if(!skip){
            var isMultiSelect = this.isMultiSelect(event, menuLevel);
            if(!isMultiSelect && !this.justDragged){
                this._deselectAllSelectedDashboardFrames();
                this.justDragged = false;
            }
        }

        var parentFrame = $(frameOverlay).up("DIV");
        var alreadySelected = designerBase.isObjectInSelection(frameOverlay, "id");


        if(!alreadySelected) {
            if (parentFrame) {
                parentId = $(parentFrame).identify();
                $(parentFrame).addClassName("selected");

                designerBase.addToSelected(frameOverlay);
                this.selectedFrameOverlays.push(frameOverlay);
                selectionCategory.area = menuLevel;

                //create draggable
                if (parentFrame.match(this.CONTENT_FRAME_PATTERN)) {
                    parentIdPrefix = this.patternToId['this.CONTENT_FRAME_PATTERN'];
                    pattern = this.CONTENT_FRAME_PATTERN;
                    sizeable = true;
                } else if (parentFrame.match(this.CLICKABLE_FRAME_PATTERN)) {
                    parentIdPrefix = this.patternToId['this.CLICKABLE_FRAME_PATTERN'];
                    pattern = this.CLICKABLE_FRAME_PATTERN;
                    sizeable = false;
                } else if (parentFrame.match(this.TEXT_FRAME_PATTERN)) {
                    parentIdPrefix = this.patternToId['this.TEXT_FRAME_PATTERN'];
                    pattern = this.TEXT_FRAME_PATTERN;
                    sizeable = true;
                } else if (parentFrame.match(this.CONTROL_FRAME_PATTERN)) {
                    parentIdPrefix = this.patternToId['this.CONTROL_FRAME_PATTERN'];
                    pattern = this.CONTROL_FRAME_PATTERN;
                    sizeable = true;
                } else {
                    throw("unknown pattern...")
                }
                //now make draggable
                this.draggableFrame = new Draggable(parentId, {revert : "failure",
                    onStart : function() {
                        this._setStartCoordinates(pattern, frameOverlay);
                    }.bind(this),
                    onDrag : function() {
                        this.moveFrames(parentIdPrefix, frameOverlay);
                    }.bind(this),
                    onEnd : function() {
                        this.notifyServerMoveFrames();
                    }.bind(this)
                });

                //now create sizer
                if (sizeable) {
                    layoutModule.createSizer(parentFrame);
                }

            }
        }else{
            if (isMetaHeld(event)) {
                this._deselectedSelectedDashboardFrames([frameOverlay]);
            }
        }

    },

    /**
     * Used to destroy dragger after use
     */
    _destroyDraggableFrame : function(){
        if(this.draggableFrame){
            this.draggableFrame.destroy();
        }
    },

    /**
     * Used to check for overflow settings
     */
    _checkIfAnySelectedFrameHasOverflowOff : function(){
        if(this.selectedFrameOverlays){
            var found = false;
            var overflowValue = null;
            var style = isWebKitEngine() ? "overflow-x" : "overflow";

            this.selectedFrameOverlays.each(function(object){
                //iFrame with custom frame should be processed in different way because of security restrictions
                var isCustomFrame = this._isCustomFrame(object, this._getIFrameNameFromOverlay);

                var iFrameId = this._getIFrameIDFromOverlay(object);
                if(iFrameId){
                    var iFrameObj = isCustomFrame ? iFrameId : getIFrameDocument(document.getElementById(iFrameId)).body;

                    overflowValue = $(iFrameObj).getStyle(style);

                    if(overflowValue === "hidden"){
                        found = true;
                        throw $break;
                    }
                }
            }.bind(this));
        }
        return found;
    },

    /**
     * Used to get the iFrame id
     * @param overlay
     */
    _getIFrameIDFromOverlay : function(overlay){
        if(overlay){
            return $(overlay).readAttribute("data-iFrameID");
        }
        return null;
    },

    _getIFrameNameFromOverlay : function(overlay){
        if(overlay){
            return $(overlay).readAttribute("data-frameName");
        }

        return null;
    },

    _getIFrameNameFromIFrame : function(iFrame){
        if(iFrame){
            return $(iFrame).readAttribute("id").substr(localContext.CONTENT_FRAME.length + 1);
        }

        return null;
    },

    _isCustomFrame: function(frameObject, frameNameResolver) {
        var frameName = frameNameResolver(frameObject);

        var contentFrame = _.find(localContext.contentFrames, function(frame) {
            return frame.name === frameName;
        });

        return contentFrame.resourceType === localContext.CUSTOM_RESOURCE_TYPE;
    },

    /**
     * Used to get iframe object from parent container
     * @param container
     */
    _getIFrameFromContainer : function(container){
        if(container){
            return $(container).down("IFRAME");
        }
        return null;
    },

    /**
     * Used to get iframe from frame name
     * @param frameName
     */
    _getIFrameByName : function(frameName){
        var iFrameId =  this.CONTENT_FRAME + "_" + frameName;
        return $(iFrameId);
    },

    /**
     * Helper used to select the last frame selected
     */
    _getLastSelectedOverlayFrame : function(){
        return this.selectedFrameOverlays.last();
    },

    /**
     * Gets the content frame by name
     * @param frameName
     */
    _getContentFrameByName : function(frameName){
        var size = localContext.contentFrames.length;
        for(var index = 0; index < size; index++){
            if(localContext.contentFrames[index]['name'] === frameName){
                return localContext.contentFrames[index];
            }
        }
        return null;
    },

    /**
     * Used to get frame object by name and type
     * @param type
     * @param frameName
     */
    _getFrameByNameAndType : function(type, frameName){
        var frameObj = null;
        var frameCollection = localContext.framesByType[type];
        if(frameCollection){
            frameCollection.each(function(frame){
                if(frame.name === frameName){
                    frameObj = frame;
                    throw $break;
                }
            });
        }
        return frameObj;
    },

    /**
     * Helper used to get dom frame by frame name and type
     * @param frameType
     * @param frameName
     */
    _getFrameContainerByName : function(frameType, frameName){
        var containerId = frameType + localContext.CONTAINER_ID_STUB + "_" + frameName;
        return $(containerId);
    },

    /**
     * Remove a deselected object from the selection list
     * @param obj
     */
    _removeFromSelectionObjects : function(obj){
        selObjects = selObjects.without(obj);
    },

    /**
     * deselect all selected content frames
     */
    _deselectAllSelectedDashboardFrames : function(){
        this.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var parentFrame = $(overlay).up("DIV");
                if(parentFrame){
                    $(parentFrame).removeClassName("selected");
                    //delete all draggables..
                    Draggables.drags.each(function(obj){
                        if(obj.element == parentFrame){
                            obj.destroy();
                        }
                    }.bind(this));
                }

            }
        }.bind(this));

        this.selectedFrameOverlays.clear();
        designerBase.unSelectAll();
        this._revertFrameInEditMode();
    },

    deSelectAllPressedNavMuttons : function(){
        var navMuttons = $$("UL#navigationOptions li");
        if(navMuttons){
            navMuttons.each(function(mutton){
                buttonManager.out($(mutton), function(mutton) {
                    return $(mutton).down(layoutModule.LIST_ITEM_WRAP_PATTERN);
                });
            });
        }
    },

    /**
     * Change a text frame in edit mode back to read only
     */
    _revertFrameInEditMode : function(){
        var encodedText = null;
        if(this.currentEditingTextFrame){
            var overlay = $(this.currentEditingTextFrame).down(".overlay");
            if (overlay) {
                var frameName = $(overlay).readAttribute("data-frameName");
                var frame = this._getFrameByNameAndType(localContext.TEXT_FRAME, frameName);
                var oldText = $(this.currentEditingTextFrame).down(".read");
                var replacementText = $(this.currentEditingTextFrame).down("INPUT.edit");

                if (oldText && replacementText) {
                    var modifiedText = $(replacementText).value;
                    //need to encode text
                    // convert " to '
                    modifiedText = modifiedText.replace(/"/g,'\'');
                    // clear XSS vulnerability
                    modifiedText = modifiedText.stripScripts();
                    $(oldText).update(modifiedText);
                    var fontSize = $(this.currentEditingTextFrame).getStyle("fontSize");
                    var newFrameWidth = this._getTextFrameMinimumWidthByLabel(frame, modifiedText, fontSize);
                    $(this.currentEditingTextFrame).setStyle({
                        width : newFrameWidth + "px"
                    });
                    $(this.currentEditingTextFrame).removeClassName("editMode");
                    //now send to server
                    this.notifyServerUpdateText(frameName, modifiedText, newFrameWidth);
                }
            }
        }

        this.currentEditingTextFrame = null;
    },

    /**
     *
     * @param frames
     */
    _deselectedSelectedDashboardFrames : function(frames){
        var itemToRemove = null;
        frames.each(function(frame){
            this.selectedFrameOverlays.each(function(overlay){
                if($(overlay).readAttribute("data-frameName") === $(frame).readAttribute("data-frameName")){
                    var parentFrame = $(overlay).up("DIV");
                    if(parentFrame){
                        $(parentFrame).removeClassName("selected");
                        //delete all draggables..
                        Draggables.drags.each(function(obj){
                            if(obj.element == parentFrame){
                                obj.destroy();
                            }
                        }.bind(this));
                    }
                    itemToRemove = overlay;
                    throw $break;
                }
            }.bind(this));
            this.selectedFrameOverlays = this.selectedFrameOverlays.without(itemToRemove);
            designerBase.unSelectGiven(itemToRemove);
        }.bind(this));
    },

    /**
     * Select all frames on dashboard
     * @param event
     */
    _selectAllDashboardFrameObjects : function(event){
        localContext.frameTypes.each(function(frameType){
            var collection = localContext.framesByType[frameType];
            collection.each(function(frame){
                var container = this._getFrameContainerByName(frameType, frame.name);
                if(container){
                    var overlay = $(container).down("DIV.overlay");
                    if(overlay){
                        if(frameType === this.CONTROL_FRAME){
                            this.addControlFrameToSelection(overlay, event);
                        }else if(frameType == this.CONTENT_FRAME){
                            this.addContentFrameToSelection(overlay, event);
                        }else if(frameType == this.TEXT_FRAME){
                            this.addTextFrameToSelection(overlay, event);
                        }else if(frameType == this.CLICKABLE_FRAME){
                            this.addClickableFrameToSelection(overlay, event);
                        }
                    }
                }

            }.bind(this));
        }.bind(this));
    },

    /**
     * Deselect all tree nodes on both trees.
     */
    _deselectAllTreeNodes : function(){
        this.repoTree._deselectAllNodes();
        this.specialContentTree._deselectAllNodes();
    },

    /**
     * Set source for a iframe
     */
    _setSourceForFrame : function(){
        var reportType = this._getCurrentReportType();
        this.nextFrameSrc= "/flow.html?_flowId=" + this.typeToView[reportType];
    },

    /**
     * increment unanswered add requests
     */
    _incrementUnansweredAddRequests : function(){
        this.unansweredAddRequests++;
    },

    /**
     * decrement unanswered requests
     */
    _decrementUnansweredAddRequests : function(){
        this.unansweredAddRequests--;
    },

    /**
     * Get current report path
     */
    _getCurrentReportPath : function(){
        var selectedNode = designerBase.getSelectedObject();
        if(selectedNode && selectedNode.param){
            return selectedNode.param.uri;
        }
        return null;
    },

    /**
     * get current report type
     */
    _getCurrentReportType : function(){
        var selectedNode = designerBase.getSelectedObject();
        if(selectedNode && selectedNode.param){
            return selectedNode.param.type;
        }
        return null;
    },

    /**
     * Get the current report name
     */
    _getCurrentReportName : function(){
        var selectedNode = designerBase.getSelectedObject();
        if(selectedNode){
            return selectedNode.name;
        }
        return null;
    },

    /**
     * Get the parent id prefix
     */
    _getContainerPrefix : function(pattern){
        return this.patternToId[pattern];
    },

    /**
     * Get coordinate before drag
     */
    _setStartCoordinates : function(pattern, matched){
        var selectedFrame = null;
        if(matched){
            selectedFrame = matched;
        }else{
            selectedFrame = this._getLastSelectedOverlayFrame();
        }
        if(selectedFrame){
            var parentFrame = $(selectedFrame).up(pattern);
            if(parentFrame){
                var left = parentFrame.offsetLeft;
                var top = parentFrame.offsetTop;
                this.dragStartCoordinates = {left: left, top: top};
            }
        }
    },

    /**
     * move current selected frames
     */
    moveFrames : function(prefix, matched){
        var selectedFrame = null;
        if(matched){
            selectedFrame = matched;
        }else{
            selectedFrame = this._getLastSelectedOverlayFrame();
        }

        if (selectedFrame) {
            var selectedFrameName = $(selectedFrame).readAttribute("data-frameName");
            var coordinates = this._calculateDragDelta(prefix, selectedFrameName);
            var size = this.selectedFrameOverlays.length;

            for (var index = 0; index < size; index++) {
                var contentFrameName = this.selectedFrameOverlays[index].readAttribute("data-frameName");
                if (contentFrameName !== selectedFrameName) {
                    var contentFrameId = prefix + contentFrameName;
                    var parent = this.selectedFrameOverlays[index].up("DIV");
                    if (parent) {
                        contentFrameId = $(parent).identify();
                        this._moveFrame(contentFrameId, coordinates);
                    }
                }
            }
        }
        //update justDragged flag
        this.justDragged = true;
    },

    /**
     * Move a single frame
     * @param contentFrameId
     * @param coordinateDelta
     */
    _moveFrame : function(contentFrameId, coordinateDelta){
        if($(contentFrameId)){
            var currentLeft = $(contentFrameId).offsetLeft;
            var currentTop = $(contentFrameId).offsetTop;

            $(contentFrameId).setStyle({
                'left' :  currentLeft - coordinateDelta.deltaLeft + "px",
                'top' :  currentTop - coordinateDelta.deltaTop + "px"
            });
        }
    },

    _moveFramesByKeys : function(coord){
        if(this.selectedFrameOverlays.length > 0){
            this.selectedFrameOverlays.each(function(frame){
                var parent = $(frame).up("DIV");
                if(parent && coord){
                    if(coord.left){
                        var currentLeft = $(parent).offsetLeft;
                        var leftCoordinate = this._getValidCoord(coord.left, currentLeft);
                        $(parent).setStyle({
                            left : leftCoordinate + "px"
                        });
                    } else if(coord.top){
                        var currentTop = $(parent).offsetTop;
                        var topCoordinate = this._getValidCoord(coord.top, currentTop);
                        $(parent).setStyle({
                            top : topCoordinate + "px"
                        });
                    }
                }
            }.bind(this));
        }
    },

    _getValidCoord : function(changeCoord, currentCoord){
        var coord = changeCoord + currentCoord;
        if(coord < 0){
            return 0;
        }else{
            return coord;
        }
    },

    /**
     * Calculate delta in drag so we can move other selected frames
     * @param prefix
     * @param selectedFrameName
     */
    _calculateDragDelta : function(prefix, selectedFrameName){
        var deltaCoordinates = {deltaLeft: 0, deltaTop : 0};
        var frameContainerId = prefix + selectedFrameName;
        if($(frameContainerId)){
            var currentLeft = $(frameContainerId).offsetLeft;
            var currentTop = $(frameContainerId).offsetTop;
            var deltaLeft = this.dragStartCoordinates.left - currentLeft;
            var deltaTop  = this.dragStartCoordinates.top - currentTop;
            deltaCoordinates = {deltaLeft: deltaLeft, deltaTop : deltaTop};
            //now update new start position
            this.dragStartCoordinates = {left: currentLeft, top: currentTop};
        }
        return deltaCoordinates;

    },

    /**
     * Store old position of element.
     */
    _getNewFramePositions : function(){
        var coordinateInfo = [];
        this.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var name = $(overlay).readAttribute("data-frameName");
                var parentContainer = $(overlay).up("DIV");
                if (parentContainer) {
                    var left = $(parentContainer).offsetLeft;
                    var top = $(parentContainer).offsetTop;
                    var object = {
                        frameName : name,
                        frameLeft : left,
                        frameTop : top
                    };
                    coordinateInfo.push(object);
                }
            }
        });

        return coordinateInfo;
    },

    /**
     * Used to get frame properties
     */
    _getNewFrameProperties : function(){
        var properties = [];
        this.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var name = $(overlay).readAttribute("data-frameName");
                var parentContainer = $(overlay).up("DIV");
                if (parentContainer) {
                    var width = $(parentContainer).offsetWidth;
                    var height = $(parentContainer).offsetHeight;
                    var object = {
                        frameName : name,
                        frameWidth : width,
                        frameHeight : height,
                        frameFontSize : -1
                    };
                    properties.push(object);
                }
            }
        });

        return properties;

    },

    /**
     * Used to select all control frames
     */
    _getAllSelectedControlFrames : function(){
        var controlFrames = [];
        this.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var name = $(overlay).readAttribute("data-frameName");
                var frameType = $(overlay).readAttribute("data-frameType");

                if (frameType === this.CONTROL_FRAME) {
                    var parentContainer = $(overlay).up("DIV");
                    if (parentContainer) {
                        var width = $(parentContainer).offsetWidth;
                        var height = $(parentContainer).offsetHeight;
                        var object = {
                            frameName : name,
                            frameWidth : width,
                            frameHeight : height,
                            frameFontSize : -1
                        };
                        controlFrames.push(object);
                    }
                }
            }
        }.bind(this));

        return controlFrames;

    },

    /**
     * Used to select all control frames
     */
    _getAllSelectedContentFrames : function(){
        var contentFrames = [];
        this.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var name = $(overlay).readAttribute("data-frameName");
                var frameType = $(overlay).readAttribute("data-frameType");

                if (frameType === this.CONTENT_FRAME) {
                    var parentContainer = $(overlay).up("DIV");
                    if (parentContainer) {
                        var width = $(parentContainer).offsetWidth;
                        var height = $(parentContainer).offsetHeight;
                        var object = {
                            frameName : name,
                            frameWidth : width,
                            frameHeight : height,
                            frameFontSize : -1
                        };
                        contentFrames.push(object);
                    }
                }
            }
        }.bind(this));

        return contentFrames;
    },

    _getAllResizeableFrame : function(){
        var resizedFrames = [];
        localContext.frameTypes.each(function(frameType){
            var frameCollection = localContext.framesByType[frameType];
            frameCollection.each(function(frame){
                if(frame.resizeable && frameType !== localContext.CONTROL_FRAME){
                    var container = this._getFrameContainerByName(frameType, frame.name);
                    if(container){
                        var width = container.offsetWidth;
                        var height = container.offsetHeight;
                        var fontSize = null;
                        if(frameType == localContext.TEXT_FRAME){
                            fontSize =  parseInt(container.getStyle("fontSize"));
                        }else{
                            fontSize = -1;
                        }
                        var object = {
                            frameName : frame.name,
                            frameWidth : width,
                            frameHeight : height,
                            frameFontSize : -1
                        };
                        resizedFrames.push(object);
                    }
                }
            }.bind(this));
        }.bind(this));

        return resizedFrames;
    },

    /**
     * Shows custom url dialog
     */
    _showCustomURLPrompt : function(isEditMode){
        if ($(this.CUSTOM_URL_DOM_ID)) {
            var frameName = null;
            var contentFrame = null;
            this.customURLDialog.isEditMode = isEditMode;
            this.customURLDialog.isVisible = true;
            if(isEditMode){
                var selectedFrame = this._getLastSelectedOverlayFrame();
                if (selectedFrame) {
                    frameName = $(selectedFrame).readAttribute("data-frameName");
                    if (frameName) {
                        contentFrame = this._getContentFrameByName(frameName);
                        $(this.CUSTOM_URL_INPUT_DOM_ID).value = contentFrame.source;
                    }
                }
            }else{
                var overlay = localContext.currentCustomFrame.down("div.overlay");
                frameName = $(overlay).readAttribute("data-frameName");
                contentFrame = this._getContentFrameByName(contentFrame);
                $(this.CUSTOM_URL_INPUT_DOM_ID).value = "";
            }
            this._prepareCustomURLPromptControls(contentFrame);
            dialogs.popup.show($(this.CUSTOM_URL_DOM_ID), true);
            $(this.CUSTOM_URL_INPUT_DOM_ID).focus();
            //enable user selection
            //this.initEnableBrowserSelection($(this.CUSTOM_URL_DOM_ID));
        }
    },

    /**
     * Hide custom url dialog
     */
    _hideCustomURLPrompt : function(){
        if($(this.CUSTOM_URL_DOM_ID)){
            dialogs.popup.hide($(this.CUSTOM_URL_DOM_ID));
            this.customURLDialog.isVisible = false;
            $(this.CUSTOM_URL_DOM_ID).addClassName(this.CUSTOM_URL_NO_PARAMS_CLS);
            this._removeCustomURLPromptControls();
        }
    },

    _cancelCustomURLPrompt : function(){
        //delete frame if in creation mode not edit mode
        if (this.currentCustomFrame && !$(this.currentCustomFrame).hasClassName("hidden") && !this.customURLDialog.isEditMode) {
            $(this.currentCustomFrame).remove();
        }
        this._hideCustomURLPrompt();
    },

    /**
     * used to create input control choices for create custom frame.
     * @param frame
     */
    _prepareCustomURLPromptControls : function(frame){
        if (localContext.controlFrames.length > 0) {
            var controlsContainer = $$(this.CUSTOM_URL_INPUTCONTROLS_PATTERN)[0];
            var listContainer = $("inputControls_option_list").cloneNode(false);
            var containerHeader = $("inputControls_option_list:header").cloneNode(true);
            $(listContainer).appendChild(containerHeader);
            //now get each control
            localContext.controlFrames.each(function(control, index){
                var controlParam = control.paramName;
                var controlContainer = $("inputControls_option_list:control").cloneNode(true);
                //update id
                $(controlContainer).writeAttribute("id", $(controlContainer).identify() + index);
                //set up check box
                var checkboxDiv = $(controlContainer).down(".one .checkBox");
                var checkboxLabel = $(controlContainer).down(".one #label_for_param_1");
                var checkboxInput = $(controlContainer).down(".one #parameter_1");
                $(checkboxDiv).writeAttribute("for", localContext.PARAM_MAPPER_CHECKBOX_PREFIX + controlParam);
                $(checkboxLabel).update(control.label);
                $(checkboxInput).writeAttribute("id", localContext.PARAM_MAPPER_CHECKBOX_PREFIX + controlParam);
                checkboxInput.checked = frame ? frame[controlParam] : "";
                //set up input box
                var inputLabel = $(controlContainer).down(".two #label_for_param_1_value");
                var inputBox = $(controlContainer).down(".two #parameter_1_value");
                $(inputLabel).writeAttribute("for", localContext.PARAM_MAPPER_INPUT_PREFIX + controlParam);
                $(inputBox).writeAttribute("id", localContext.PARAM_MAPPER_INPUT_PREFIX + controlParam);
                inputBox.value = (checkboxInput.checked) ? this._getParameterMappingValue(frame, controlParam) : controlParam;
                $(listContainer).appendChild(controlContainer);
            }.bind(this));

            if(localContext.controlFrames.length > 0){
                $(this.CUSTOM_URL_DOM_ID).removeClassName(this.CUSTOM_URL_NO_PARAMS_CLS);
            }
            //append all to parent
            $(controlsContainer).appendChild(listContainer);
        }
    },

    /**
     * Used to get parameter values for a content frame
     * @param contentFrame
     * @param parameter
     */
    _getParameterMappingValue : function(contentFrame, parameter){
        if(!contentFrame || !contentFrame[parameter]){
            return parameter;
        }else{
            return contentFrame[parameter];
        }
    },

    /**
     * Used to remove dome object input controls from custom url prompt
     */
    _removeCustomURLPromptControls : function(){
        if (localContext.controlFrames.length > 0) {
            var controlsContainer = $$(this.CUSTOM_URL_INPUTCONTROLS_PATTERN)[0];
            if (controlsContainer) {
                controlsContainer.childElements().each(function(node) {
                    $(node).remove();
                });
            }
        }
    },

    /**
     * Process custom url prompt
     */
    _processCustomURLPromptInput : function(){
        var parameterMap = [];
        var newSrcURL = $(this.CUSTOM_URL_INPUT_DOM_ID).value;
        if(!newSrcURL && newSrcURL.blank()){
            this._hideCustomURLPrompt();
            return;
        }

        var customURLIFrame = this._getIFrameFromContainer(this.currentCustomFrame);
        if (customURLIFrame) {
            var regex = /[A-Za-z]+_\d+$/;
            var customURLIFrameId = customURLIFrame.identify();
            var frameName = regex.exec(customURLIFrameId)[0];
            customURLIFrame.src = checkURLProtocol(newSrcURL, true);
            //parameter mappings
            localContext.controlFrames.each(function(obj){
                var paramName = obj.paramName;
                var checkBox = $(this.PARAM_MAPPER_CHECKBOX_PREFIX + paramName);
                if(checkBox.checked){
                    var inputBox = $(this.PARAM_MAPPER_INPUT_PREFIX + paramName);
                    if(inputBox){
                        var paramValue = paramName + "@@" + inputBox.value;
                        parameterMap.push(paramValue);
                    }
                }
            }.bind(this));
            this._hideCustomURLPrompt();
            //update custom url tool-tip
            if(customURLIFrame){
                var parentContainer = $(customURLIFrame).up("DIV");
                if(parentContainer){
                    $(parentContainer).writeAttribute("title", customURLIFrame.src);
                }
            }
            this.notifyServerUpdateCustomContentFrame(frameName, customURLIFrame.src, parameterMap);
        }
    },

    /**
     * Used to get frame id for clickable frame
     * @param node
     */
    _getClickableFrameId : function(node){
        if(node && node.param){
            return node.param.extra;
        }
        return null;
    },

    /**
     * Used to reSync frames if need be.
     */
    _reSyncFramesIfRequired : function(){
        if(localContext.resyncRequired){
            this._reSyncFrames(!localContext.isFixedSizing)
        }
    },

    /**
     * Used to reSync all frames if we are using proportional sizing
     */
    _reSyncFramesIfProportionalSizingActive : function(){
        if(!localContext.isFixedSizing){
            this._reSyncFrames(true);
        }
    },

    /**
     * Used to adjust frames that overlap each other.
     * @param adjustSizes
     */
    _reSyncFrames : function(adjustSizes){
        var extraPadding = 5;
        var adjustedFrames = [];

        localContext.frameTypes.each(function(frameType){
            var frameCollection = localContext.framesByType[frameType];
            if(frameCollection){
                frameCollection.each(function(frame){
                    var frameContainer = this._getFrameContainerByName(frameType, frame.name);
                    var left = parseInt(frame['left']);
                    var top = parseInt(frame['top']);
                    if(frameType === localContext.CONTENT_FRAME){
                        top += extraPadding;
                    }
                    if (frameContainer) { //move
                        moveTo(frameContainer, left, top, null);

                        //adjust font containers
                        if (adjustSizes) {
                            $(frameContainer).setStyle({
                                width : parseInt(frame['width']) + "px",
                                height : parseInt(frame['height']) + "px"
                            });
                            if (frame.fontResizes || !frame.resizable) {
                                var adjustedFrame = {
                                    frameName : frame.name,
                                    frameWidth : parseInt(frame['width']),
                                    frameHeight : parseInt(frame['height'])
                                };
                                if (frameType === localContext.TEXT_FRAME) {
                                    adjustedFrame.frameFontSize = this._getFontSizeForTextFrame(frameType, adjustedFrame.frameName, adjustedFrame.frameWidth, adjustedFrame.frameHeight);
                                } else {
                                    adjustedFrame.frameFontSize = -1;
                                }
                                adjustedFrames.push(adjustedFrame);
                            }
                        }
                    }

                }.bind(localContext));
            }
        }.bind(localContext));
        //send request to server
        this.notifyServerResizeFrames(true, adjustedFrames);
    },

    /**
     * Used to update control frame widths
     * @param reRenderControls
     */
    _updateNewControlFrameWidth : function(callback){
        var adjustedFrames = [];
        var frame = localContext.controlFrames.last();
        var frameContainer = this._getFrameContainerByName(localContext.CONTROL_FRAME, frame.name);

        if (frame && frameContainer) {
            var adjustedFrame = {
                frameName : frame.name,
                frameWidth : frameContainer.clientWidth,
                frameHeight : frame.height,
                frameFontSize : -1
            };
            adjustedFrames.push(adjustedFrame);
            this.notifyServerResizeFrames(false, adjustedFrames, false, callback);
        } else {
            callback && callback();
        }
    },

    /**
     * Used to set the new width of  frame based on its font
     * @param reRenderControls
     */
    _setNewTextFrameMinimumWidth : function(){
        var adjustedFrames = [];
        var frame = localContext.textFrames.last();

        if (frame) {
            var adjustedFrame = {
                frameName : frame.name,
                frameHeight : frame.height,
                frameFontSize : frame.fontSize,
                frameWidth : this._getTextFrameMinimumWidth(frame)
            };
            adjustedFrames.push(adjustedFrame);
            this.notifyServerResizeFrames(true, adjustedFrames);
        }
    },

    /**
     * Helper used to get the text frame's min width
     * @param frame
     */
    _getTextFrameMinimumWidth : function(frame){
        if (this.fontSizeTester) {
            $(this.fontSizeTester).setStyle({
                fontSize : frame.fontSize  + "px"
            });

            var textValue = frame.textLabel;
            textValue = this._replaceAllSpaces(textValue, "&nbsp;");
            $(this.fontSizeTester).update(textValue);
            return (this.fontSizeTester.offsetWidth + this.hackPadding);
        }else{
            throw("font size tester is not available!!!");
        }
    },

    _getTextFrameMinimumWidthByLabel : function(frame, label, fontSize){
        if (this.fontSizeTester) {

            if(fontSize){
                $(this.fontSizeTester).setStyle({
                    fontSize : fontSize
                });
            }else{
                $(this.fontSizeTester).setStyle({
                    fontSize : frame.fontSize + "px"
                });
            }


            label = this._replaceAllSpaces(label, "&nbsp;");
            $(this.fontSizeTester).update(label);
            return (this.fontSizeTester.offsetWidth + this.hackPadding);
        }else{
            throw("font size tester is not available!!!");
        }
    },

    /**
     * Used to get the font size of a text frame container
     * @param type
     * @param frameName
     * @param currentWidth
     * @param currentHeight
     */
    _getFontSizeForTextFrame : function(type, frameName, currentWidth, currentHeight){
        var frame = this._getFrameByNameAndType(type, frameName);
        var frameFontSize = frame.fontSize;

        if (this.fontSizeTester) {
            if (frame && frame.fontResizes) {
                var label = frame.textLabel;
                $(this.fontSizeTester).setStyle({
                    fontSize : frameFontSize + "px"
                });
                label = this._replaceAllSpaces(label, "&nbsp;");
                $(this.fontSizeTester).update(label);
                var fontTesterWidth = (this.fontSizeTester.offsetWidth + this.hackPadding);
                var fontTesterHeight = this.fontSizeTester.offsetHeight;

                if(fontTesterWidth > currentWidth || fontTesterHeight > currentHeight){
                    while(this.fontSizeTester.offsetWidth > currentWidth || this.fontSizeTester.offsetHeight > currentHeight){
                        $(this.fontSizeTester).setStyle({
                            fontSize : (frameFontSize--) + "px"
                        });
                    }
                }else{
                    while(this.fontSizeTester.offsetWidth < currentWidth && this.fontSizeTester.offsetHeight < currentHeight){
                        $(this.fontSizeTester).setStyle({
                            fontSize : (frameFontSize++) + "px"
                        });
                    }
                }
            }

            if (!this.isInFixedSizeMode()) {
                frameFontSize = Math.min(frame.maxFontSize, frameFontSize);
            }
        }else{
            throw("font size tester is not available!!!");
        }

        return frameFontSize;
    },

    /**
     * Helper used to clean up fontTests styles
     */
    _resetFontSizeTester : function(){
        $(this.fontSizeTester).writeAttribute("style", "");
    },

    /**
     * Helper used to adjust selected font frames
     */
    _adjustFontForSelectedTextFrames : function(){
        var adjustedFrames = [];
        this.selectedFrameOverlays.each(function(frame){
            var frameName = frame.readAttribute("data-frameName");
            var frameType = frame.readAttribute("data-frametype");
            if (frameType == this.TEXT_FRAME) {
                var frameContainer = frame.up("DIV");

                if (frameContainer) {
                    var adjusted = {
                        frameName : frameName,
                        frameHeight : parseInt($(frameContainer).getHeight()),
                        frameWidth : parseInt($(frameContainer).getWidth())
                    };
                    adjusted.frameFontSize = this._getFontSizeForTextFrame(localContext.TEXT_FRAME, adjusted.frameName, adjusted.frameWidth, adjusted.frameHeight);
                    adjustedFrames.push(adjusted);
                }
            }
        }.bind(this));
        if(adjustedFrames.length > 0){
            return adjustedFrames;
        }else{
            return null;
        }
    },

    /**
     * system confirm for already added clickable frame
     */
    _clickableControlAlreadyAdded : function(){
        dialogs.systemConfirm.show(localContext.messages["buttonAlreadyAdded"], 5000);
    },

    /**
     * system confirm for already added input control frame
     */
    _inputControlAlreadyAdded : function(){
        dialogs.systemConfirm.show("Control already added!", 5000);
    },

    /**
     * system confirm for invalid url
     */
    _invalidCustomURLError : function(){
        dialogs.systemConfirm.show("Please provide a valid URL!", 5000);
    },

    /**
     * Helper method used to format parameter values
     * @param nameString
     * @param valuesArray an array of values like ["USA", "Canada"]
     */
    _formatParamValue : function(nameString, valuesArray){
        var formatted = "";
        var base = nameString + "=";
        for (var i = 0; i < valuesArray.length; i++) {
            formatted += (base + encodeURIComponent(valuesArray[i]));
            if (i < valuesArray.length - 1) {
                formatted += '&';
            }
        }
        return formatted;
    },

    /**
     * Helper method used to replace
     * @param string
     * @param replace
     */
    _replaceAllSpaces : function(string, replace){
        var regex = /\s+/g;
        return string.replace(regex, replace);
    },

    /**
     * Helper method used to determine if a single frame has been selected
     */
    singleOverlaySelected : function(){
        return (localContext.selectedFrameOverlays.length == 1);
    },

    /**
     * Used to convert text frame from readonly to editable
     */
    setTextFrameAsEditable : function(){
        if(localContext.singleOverlaySelected()){
            var selectedOverlay = localContext.selectedFrameOverlays[0];
            var parent = $(selectedOverlay).up("DIV");
            if(parent && $(parent).hasClassName("displayText") && !$(parent).hasClassName("editMode")){
                localContext._deselectAllSelectedDashboardFrames();

                localContext.currentEditingTextFrame = $(parent);
                localContext.currentEditingTextFrame.addClassName("editMode");
                $(parent).down("input.edit").select();
                setTimeout(function() {
                    $(parent).down("input.edit").focus();
                }, 500);
            }
        }
    },

    /**
     * Used to delete dashboard title
     */
    removeDashboardTitle : function(){
        var dashboardTitle = $("title");

        if(dashboardTitle){
            $(dashboardTitle).update(localContext.NO_DASHBOARD_TITLE_TEXT);
            localContext.notifyServerDeleteTitle();
        }
    },

    /**
     * Used to edit dashboard title
     */
    editDashboardTitle : function(){
        var title = $("title");
        if(title){
            localContext.titleEditing = true;
            localContext._deselectAllSelectedDashboardFrames();
            editor = new InPlaceEditor(title);
            editor.makeEditable({
                'onMouseup': localContext._revertDashboardTitleFromEditMode,
                'onEnter': localContext._revertDashboardTitleFromEditMode,
                'onTab': localContext._revertDashboardTitleFromEditMode,
                'onEsc': localContext._revertToBackHeaderTitle
            });
        }else{
            throw("no title object!!")
        }
    },

    /**
     * Used to revert dashboard title edit mode to readonly
     * @param evt
     */
    _revertDashboardTitleFromEditMode : function(evt){
        evt = (evt) ? evt : window.event;
        if(evt.keyCode == Event.KEY_ESC){
            localContext._revertToBackHeaderTitle();
        }else{
            if (editor) {
                editor.makeNonEditable(localContext.titleEditing);
                editor = null;
                localContext.notifyServerUpdateTitle();
            }
        }
        localContext.titleEditing = false;
    },

    /**
     * Revert title helper method
     */
    _revertToBackHeaderTitle : function() {
        if (editor) {
            editor.revertEdit();
            editor = null;
        }
        localContext.titleEditing = false;
    },

    /**
     * Revert title helper method
     * @param titlePresent
     */
    _updateTitleClass : function(titlePresent){
        var title = $("title");
        if(title){
            if(titlePresent){
                $("title").removeClassName(this.DELETED_TITLE_CSS);
            }else{
                $("title").addClassName(this.DELETED_TITLE_CSS);
                $("title").update(localContext.NO_DASHBOARD_TITLE_TEXT);
            }
        }
    },

    /**
     * Helper method to determine if title has been deleted
     */
    _isDashboardTitleDeleted : function(showInEditMode){
        var dashboardTitle = $("title");
        var dashboardTitleInput = $("titleInput");
        if(editor && dashboardTitleInput){
            return (showInEditMode != "true");
        }else{
            if(dashboardTitle){
                return (getInnerText(dashboardTitle).blank() || getInnerText(dashboardTitle) === localContext.NO_DASHBOARD_TITLE_TEXT)
            }else{
                return true;
            }
        }
    },

    _purgeDeletedInputControlTextFrames : function(){
        var textFramesToPurge = [];
        localContext.textFrames.each(function(textFrame, index){
            var inputControlRefName = textFrame.inputControlRef;
            if(inputControlRefName != "null"){
                var found = false;
                this.controlTypes.each(function(controlType){
                    localContext.controls[controlType].each(function(control){
                        if(control.name === inputControlRefName){
                            found = true;
                            throw $break;
                        }
                    }.bind(this));
                    if(found){
                        throw $break;
                    }
                }.bind(this));
                if(!found){
                    textFramesToPurge.push(textFrame.name);
                }
            }
        }.bind(this));

        //purge text frames
        textFramesToPurge.each(function(name){
            var dom = $("textFrameContainer_" + name);
            if(dom){
                $(dom).remove();
            }
        }.bind(this));
        //send request
        if(textFramesToPurge.length > 0){
            this.notifyServerDeleteFrames(textFramesToPurge);
        }
    },

    /**
     * Helper used to determine if input control already exists
     * @param frameName
     */
    _controlFrameAlreadyAdded : function(frameName){
        return _.find(localContext.controlFrames, function(frame){
                return frame.paramName === frameName;
        });
    },

    /**
     * Set global constants controlClicked and controlClickedControlType
     * for making dashboard update control frame when it just added
     */
    _setLastControlClicked : function() {
        var frame = localContext.controlFrames.last();
        if (frame) {
            var frameContainer = this._getFrameContainerByName(localContext.CONTROL_FRAME, frame.name);
            if(frameContainer) {
                var overlay = $(frameContainer).down(".overlay");
                if(overlay){
                    controlClicked = $(overlay).readAttribute("data-inputControlName");
                    controlClickedControlType = $(overlay).readAttribute("data-controlType");
                }
            }
        }
    },

    /**
     * Helper used to update all control frames
     */
    _updateAllSelectedControlFrameCoordinates : function(){
        //update any controls and content frames that have been updated
        var controlFrames = this._getAllSelectedControlFrames();
        if(controlFrames.length > 0){
            this.notifyServerResizeFrames(true, controlFrames);
        }
    },

    /**
     * Helper used to update all control frames
     */
    _updateAllSelectedContentFrameCoordinates : function(){
        //update any controls and content frames that have been updated
        var contentFrames = this._getAllSelectedContentFrames();
        if(contentFrames.length > 0){
            this.notifyServerResizeFrames(false, contentFrames);
        }
    },

    ///////////////////////////////////////////////////////////////
    // toolbar functions
    ///////////////////////////////////////////////////////////////

    /**
     * Client side test to check screen size.
     * @param width
     * @param height
     */
    checkScreenSize : function(width, height){
        return (screen.width < width || screen.height < height);
    },

    _changeScreenSizeForFixedMode : function(){
        $("sizeGuide").removeClassName("proportional");
        $("sizeGuide").setStyle({
            width : localContext.layoutWidth + "px",
            height : localContext.layoutHeight + "px"
        });

        this._updateScroll();
        $("guideLabel").update(localContext.layoutWidth + " x " + localContext.layoutHeight);
    },

    _changeScreenSizeForProportionalMode : function(){
        $("sizeGuide").writeAttribute("style", "");
        $("sizeGuide").addClassName("proportional");
        $("guideLabel").update();
    },

    _calculateSizeConversionFactor : function(){
        var largestRight = null;
        var largestBottom = null;
        var dropZoneWidth = null;
        var dropZoneHeight = null;
        var widthFactor = null;
        var heightFactor = null;
        var sizeFactor = null;
        var hackPadding = 20;
        //reset clear
        localContext.rightCoordinates.clear();
        localContext.bottomCoordinates.clear();

        localContext.frameTypes.each(function(frameType){
            var frameCollection = localContext.framesByType[frameType];
            this._getRightAndBottomCords(frameCollection);
        }.bind(this));

        largestRight = Math.max.apply(null, localContext.rightCoordinates);
        largestBottom = Math.max.apply(null, localContext.bottomCoordinates);
        dropZoneWidth = parseInt($("dashboardDropZone").getStyle("width")) - hackPadding;
        dropZoneHeight = parseInt($("dashboardDropZone").getStyle("height")) - hackPadding;

        widthFactor = dropZoneWidth / largestRight;
        heightFactor = dropZoneHeight / largestBottom;
        sizeFactor = Math.min(widthFactor, heightFactor);
        this.notifyServerUpdateSizeConversionFactor(sizeFactor);
        return sizeFactor;
    },

    _calculateGrowthFactorForProportionalRuntime : function(){
        var hackPadding = 20;
        var growthFactor = null;
        var dropZoneWidth = null;
        var dropZoneHeight = null;

        var dimensions = $("dashboardCanvasArea").getDimensions();
        dropZoneWidth = dimensions.width;
        dropZoneHeight = dimensions.height;
        growthFactor = dropZoneWidth + "_" + dropZoneHeight;
        return growthFactor;
    },

    _getRightAndBottomCords : function(collection){
        collection.each(function(frame){
            var right = frame.left + frame.width;
            var bottom = frame.top + frame.height;
            localContext.rightCoordinates.push(right);
            localContext.bottomCoordinates.push(bottom);
        }.bind(this));
    },

    /**
     * Send request to change the canvas size
     * @param canvasSize Size of the new canvas
     */
    requestSizeGuideChange : function(canvasSize){
        if(canvasSize){
            var width = localContext.regexForBeginningNums.exec(canvasSize)[0];
            var height = localContext.regexForEndingNums.exec(canvasSize)[0];
            var proceed = true;

            if(localContext.checkScreenSize(width, height)){
                proceed = confirm(localContext.RESOLUTION_MESSAGE);
            }
            if(proceed){
                //send size change to server
                localContext.notifyServerSetLayoutSize(canvasSize);
            }
        }
    },

    _checkIfClickableControlAlreadyExists : function(controlID){
        var found = false;
        localContext.clickableControlIDs.each(function(id){
            if(id === controlID){
                found = true;
                throw $break;
            }
        });
        return found;
    },

    /**
     * Check if the layout size chosen is not the same as what we already have.
     * @param option
     */
    checkLayoutSize : function(option){
        return (option == localContext.layoutSize)
    },

    /**
     * Undo last action
     */
    undo : function(){
        alert("not implemented");
    },

    /**
     * redo last undone action
     */
    redo : function(){
        alert("not implemented");
    },

    ///////////////////////////////////////////////////////////////
    // Dashboard Action functions
    ///////////////////////////////////////////////////////////////
    /**
     * Quick add when user db clicks on node.
     */
    quickAddOfFrameObject : function(event, node){
        if(node){
            if(this._isCustomURLNode(node)){
                this.addCustomURLFrame();
            }else if(this._isTextLabelNode(node)){
                this.addTextLabelFrame();
            }else if(this._isFreeTextNode(node)){
                this.addFreeTextLabelFrame();
            }else if(this._isClickableNode(node)){
                this.addClickableFrame(node);
            }else if(this._isControlNode(node)){
                this.addControlFrame(node);
            }else{
                this.addContentFrame(event);
            }
        }
    },

    quickAddOfFrameObjectByEvent : function(event){
        if(localContext.specialContentTree){
            var node = localContext.specialContentTree.getTreeNodeByEvent(event);
            localContext.quickAddOfFrameObject(event, node);
        }
    },

    dragNDropOfFrameObject : function(dragged, dropped, event){
        if(localContext.specialContentTree && localContext.repoTree){
            var node = null;
            var selCount = localContext.specialContentTree.selectedNodes.length;

            if(selCount == 1){
                node = localContext.specialContentTree.selectedNodes[0];
                localContext._updateDragNDropCoordinates(event);
                localContext.quickAddOfFrameObject(event, node);
                localContext.specialContentTree._deselectAllNodes();
            }else{
                selCount = localContext.repoTree.selectedNodes.length;
                if(selCount == 1){
                    node = localContext.repoTree.selectedNodes[0];
                    localContext._updateDragNDropCoordinates(event);
                    localContext.quickAddOfFrameObject(event, node);
                }
            }
        }
    },

    _updateDragNDropCoordinates : function(event){
        var dropZoneOffset = $(this.DROP_ZONE).cumulativeOffset();
        var dropZoneScrollOffset = $(this.DROP_ZONE).cumulativeScrollOffset();

        var touch = event.changedTouches ? event.changedTouches[0] : undefined;
        var x = touch ? touch.pageX : event.pointerX();
        var y = touch ? touch.pageY : event.pointerY();
        localContext.nextControlFrameLeft = x - dropZoneOffset[0] + dropZoneScrollOffset[0];
        localContext.nextControlFrameTop = y - dropZoneOffset[1] + dropZoneScrollOffset[1];
        localContext.nextContentFrameLeft = x - dropZoneOffset[0] + dropZoneScrollOffset[0];
        localContext.nextContentFrameTop = y - dropZoneOffset[1] + dropZoneScrollOffset[1];
    },

    /**
     * Add a content frame to the canvas
     */
    addContentFrame : function(event){	
        var type = localContext._getCurrentReportType();
        var uri = localContext._getCurrentReportPath();
        var name = localContext._getCurrentReportName();

        if(type != null && uri != null && name != null ) {
            //pending request so exit.
            if(localContext.unansweredAddRequests > 0){
                return;
            }
            //update frame source
            localContext._setSourceForFrame();
            if (this.shouldReplace && this.replacingFrameName) {
                var currentPath = localContext._getCurrentReportPath();
                var iFrame = this._getIFrameByName(this.replacingFrameName);
                if (iFrame) {
                    $(iFrame).writeAttribute("src", urlContext + localContext.nextFrameSrc + currentPath);
                    //update tool-tip
                    var parentContainer = iFrame.up("DIV");
                    if (parentContainer) {
                        $(parentContainer).writeAttribute("title", currentPath)
                    }
                    localContext.notifyServerReplaceFrame(this.replacingFrameName);
                }
            } else {
                localContext._createDomForFrame(false);
                var coordinates = {
                    left : localContext.nextContentFrameLeft,
                    top : localContext.nextContentFrameTop,
                    width : localContext.nextContentFrameWidth,
                    height : localContext.nextContentFrameHeight
                };
                localContext.notifyServerAddContentFrame(coordinates, event);
            }        	
        }
    },

    addControlFrame : function(node){
        if (node && node.param) {
            var nodeName = node.param.extra;
            if(nodeName){
                if(!this._controlFrameAlreadyAdded(nodeName)){
                    this.notifyServerAddControlFrame(nodeName);
                }else{
                    this._inputControlAlreadyAdded();
                }
            }
        }
    },

    addCustomURLFrame : function(){
        //pending request so exit.
        if(localContext.unansweredAddRequests > 0){
            return;
        }
        //create frame
        localContext.currentCustomFrame = localContext._createDomForFrame(true);
        localContext._showCustomURLPrompt(false);
    },

    addClickableFrame : function(node){
        var clickableId = this._getClickableFrameId(node);

        if(clickableId){
            //check if id already exists before sending request
            if(this._checkIfClickableControlAlreadyExists(clickableId)){
                this._clickableControlAlreadyAdded();
            }else{
                this.notifyServerAddClickableFrame(clickableId);
            }
        }
    },

    addTextLabelFrame : function(){
        this.notifyServerAddTextLabelFrame();
    },

    addFreeTextLabelFrame : function(){
        this.notifyServerAddFreeTextLabelFrame();
    },

    editCustomURLFrame : function(){
        var selectedFrame = localContext._getLastSelectedOverlayFrame();
        if (selectedFrame) {
            var frameName = $(selectedFrame).readAttribute("data-frameName");
            var frameType = $(selectedFrame).readAttribute("data-frameType");
            var isCustom = $(selectedFrame).readAttribute("data-isCustom");
            if(frameType === localContext.CONTENT_FRAME && isCustom){
                var iFrameID = $(selectedFrame).readAttribute("data-iFrameID");
                localContext.currentCustomFrame = $("contentFrameContainer_" + frameName);
                if(localContext.currentCustomFrame){
                    localContext._showCustomURLPrompt(true);
                }
            }
        }
    },

    /**
     * This is a helper method that creates the dom for the content frame.
     * @param isCustom
     */
    _createDomForFrame : function(isCustom){
        var newContentFrame = $(localContext.CONTENT_FRAME_DOM_ID).cloneNode(true);
        $(newContentFrame).writeAttribute("id", localContext.CONTENT_FRAME + localContext.CONTAINER_ID_STUB + "_" + localContext.nextContentFrameName);

        $(newContentFrame).setStyle({
            left : localContext.nextContentFrameLeft + "px",
            top : localContext.nextContentFrameTop +  "px",
            width : localContext.nextContentFrameWidth + "px",
            height : localContext.nextContentFrameHeight + "px"
        });
        
        var newIFrame =  newContentFrame.down("IFRAME");
        var fid = localContext.CONTENT_FRAME + '_' + localContext.nextContentFrameName
        $(newIFrame).writeAttribute("id", fid);

        var overlayId = localContext.OVERLAY_PREFIX + localContext.nextContentFrameName;
        $(newIFrame).observe("load",function(){
        	localContext._updateIFrameLoadingStatus(overlayId, localContext.SCROLL_ENABLED);
        });
        if(!isCustom){
        	$(newIFrame).writeAttribute("src", urlContext + localContext.nextFrameSrc + localContext._getCurrentReportPath() + '&fid=' + fid);
            $(newContentFrame).writeAttribute("title", localContext._getCurrentReportPath());
        }
        //hide frame
        if (isCustom) {
            $(newContentFrame).addClassName("hidden");
        }
        
        $(localContext.ALL_CONTENT_PARENT_DOM_ID).appendChild(newContentFrame);
        localContext.updateAttributesForContentFrameOverlay(newContentFrame, isCustom);

        return newContentFrame;
    },

    /**
     * Update frame attributes
     * @param frame
     */
    updateAttributesForContentFrameOverlay : function(frame, isCustom){
        if(frame && ($(frame).identify() !== "contentFrameTemplate")){
            var regex = /[A-Za-z]+_\d+$/;
            var frameName = regex.exec($(frame).identify())[0];
            var overlay = $(frame).down("DIV.overlay.button");
            if($(overlay)){
                $(overlay).writeAttribute("id", localContext.OVERLAY_PREFIX + frameName);
                $(overlay).writeAttribute("data-frameType", localContext.CONTENT_FRAME);
                $(overlay).writeAttribute("data-frameName", frameName);
                $(overlay).writeAttribute("data-iFrameID", localContext.CONTENT_FRAME + '_' + frameName);
                $(overlay).writeAttribute("data-isCustom", isCustom.toString());
            }
        }
    },

    /**
     * Used to delete frame from Document Object Model
     * @param frameOverlay div.overlay which contains frame to delete
     * @return true if frame was removed from DOM and false in other case
     */
    _deleteFrameOverlayFromDOM : function(frameOverlay){
        if (!frameOverlay) {
            return false;
        }

        var parentContainer = $(frameOverlay).up("DIV");
        if ($(parentContainer)) {
            //delete dom objects
            $(parentContainer).remove();
            return true;
        }

        return false;
    },

    /**
     * Used t delete a selected frame.
     */
    deleteSelectedFrames : function(){
        var selectedFrameNamesToDelete = [];

        localContext.selectedFrameOverlays.each(function(selectedFrame){
            if (selectedFrame) {
                var frameName = $(selectedFrame).readAttribute("data-frameName");
                if (localContext._deleteFrameOverlayFromDOM(selectedFrame)) {
                    selectedFrameNamesToDelete.push(frameName);
                }
            }
        });

        if (selectedFrameNamesToDelete.length > 0) {
            localContext.notifyServerDeleteFrames(selectedFrameNamesToDelete)
        }
    },

    /**
     * toggle scroll bars for IFrame
     */
    toggleSelectedFrameScrollBars: function(){
        var selectedFrame = localContext._getLastSelectedOverlayFrame();
        if (selectedFrame) {
            var frameType = $(selectedFrame).readAttribute("data-frameType");
            var frameName = $(selectedFrame).readAttribute("data-frameName");
            if(frameType === localContext.CONTENT_FRAME){
                var iFrameID = localContext._getIFrameIDFromOverlay(selectedFrame);
                var scrollBarState = localContext.isScrollBarsPresent(iFrameID);
                localContext.toggleScrollBarsOnClient(iFrameID, !scrollBarState);
                localContext.notifyServerToggleContentFrameScrollBars(frameName);
            }
        }

    },

    /**
     * Used to toggle all selected iFrame scrollbars
     * @param show
     */
    toggleAllSelectedFrameScrollBars : function(show){
        var selectedIFrameNamesToToggle = [];
        show = (show === "true");
        localContext.selectedFrameOverlays.each(function(frame){
            var frameType = $(frame).readAttribute("data-frameType");
            var frameName = $(frame).readAttribute("data-frameName");
            if(frameType === localContext.CONTENT_FRAME){
                var iFrameID = localContext._getIFrameIDFromOverlay(frame);
                selectedIFrameNamesToToggle.push(frameName);
                localContext.toggleScrollBarsOnClient(iFrameID, show);
            }
        });
        if(selectedIFrameNamesToToggle.length > 0){
            localContext.notifyServerToggleAllContentFramesScrollBars(selectedIFrameNamesToToggle, show);
        }

    },

    /**
     * Refresh a iframe.
     */
    refreshIFrame : function(){
        var refreshableFrame = false;
        var selectedFrame = localContext._getLastSelectedOverlayFrame();
        var iFrameName = localContext._getIFrameIDFromOverlay(selectedFrame);
        var isCustom  = $(selectedFrame).readAttribute("data-isCustom");

        refreshableFrame = (isCustom === "false");
        if(iFrameName && refreshableFrame){
            try {
                $(iFrameName).contentWindow.location.reload(true);
            } catch(e) {
                throw ("unable to refresh iframe");
            }
        }
    },

    /**
     * Update when a user changes input control values.
     */
    updateInputControlParams : function(selectedValues){
        if (selectedValues && this._hasSubmitButton()) {
            //this means we have a submit button but didn't click it. If we have a submit button
            //short circuit the the on change event.
            return;
        } else if (!selectedValues) {
            selectedValues = this.controlsController.get("selection");
        }

        this.notifyServerUpdateControlValues(selectedValues);
    },

    sizeSelectedFrameToContent : function(){
        var contentFrames = [];
        var sizeToContentPadding = 2;
        localContext.selectedFrameOverlays.each(function(overlay){
            if(overlay){
                var width = null;
                var height = null;
                var name = $(overlay).readAttribute("data-frameName");
                var frameType = $(overlay).readAttribute("data-frameType");
                var isCustom = $(overlay).readAttribute("data-isCustom");

                if (frameType === this.CONTENT_FRAME && isCustom === "false") {
                    var parentContainer = $(overlay).up("DIV");
                    if (parentContainer) {
                        var iFrame = this._getIFrameFromContainer(parentContainer);
                        var contentFrame = this._getContentFrameByName(name);

                        try {
                            if(contentFrame){
                                if(contentFrame.reportWidth > 0) {
                                    width = contentFrame.reportWidth + sizeToContentPadding;
                                    height = contentFrame.reportHeight + sizeToContentPadding;
                                } else {
                                    width = localContext.layoutWidth
                                    height = localContext.layoutHeight;
                                }
                            }else if(iFrame.contentDocument){
                                width = iFrame.contentDocument.body.scrollWidth;
                                height = iFrame.contentDocument.body.scrollHeight;
                            }else{
                                width = iFrame.Document.body.scrollWidth;
                                height = iFrame.Document.body.scrollHeight;
                            }

                            var object = {
                                frameName : name,
                                frameWidth : width,
                                frameHeight : height,
                                frameFontSize : -1
                            };
                            //resize on canvas
                            $(parentContainer).setStyle({
                                width: width + "px",
                                height: height + "px"
                            });
                            contentFrames.push(object);
                        } catch(e) {
                            throw("[sizeSelectedFrameToContent]: possible crosssite scripting");
                        }

                    }
                }
            }

        }.bind(localContext));

        if (contentFrames.length > 0) {
            localContext.notifyServerResizeFrames(false, contentFrames, true);
        }
    },

    resetInputControlParams : function(){
        this.controlsController.reset();
    },

    saveDashboard : function(folder, name, desc, overwriteOK){
        return this.notifyServerSaveDashboard(folder, name, desc, overwriteOK);
    },

    printDashboard : function(){
        dialogs.systemConfirm.show(this.messages.dashboardOptionMessage, 5000);
    },

    runDashboard : function(){
        if (!buttonManager.isDisabled($("presentation"))) {
            //disable and then enable after a few secs
            buttonManager.disable($("presentation"));
            window.setTimeout(function() {
                buttonManager.enable($("presentation"));
            }, 5000);
            this.requestServerToRunDashboard();
        }
    },

    setAutoRefresh : function(refreshInterval){
        var contentFrames = [];
        var selectedContentFrames = localContext._getAllSelectedContentFrames();
        selectedContentFrames.each(function(frame){
            var contentFrame = {
                name : frame.frameName,
                interval : refreshInterval
            };
            contentFrames.push(contentFrame);
        });

        localContext.notifyServerSetAutoRefresh(contentFrames);
    },

    ///////////////////////////////////////////////////////////////
    // Ajax functions
    ///////////////////////////////////////////////////////////////
    requestServerToRunDashboard : function(){
        localContext.allowPreview = isIPad();
        var dashboardUrl = this.getPreviewUrl();
        var callback = function(){
            this._updateState();
            if(isIPad()) {
                var me = document.createEvent("MouseEvents");
                    me.initMouseEvent('click', true, true, window,
                    1, // detail / mouse click count
                    1,
                    1,
                    1,
                    1,
                    false, false, false, false, // key modifiers
                    0, // primary mouse button
                    null  // related target not used for dblclick event
                );
//                $("presentation").dispatchEvent(me);
                $("presentation").up().dispatchEvent(me);
            } else {
                var dashboardWindow = window.open(dashboardUrl, "");
                if(dashboardWindow && dashboardWindow.focus){
                    dashboardWindow.focus();
                    return false;
                }
            }
        }.bind(localContext);
        designerBase.sendRequest('da_saveTempDashboard', [], callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    getPreviewUrl: function() {
        return this.RUN_URL_PREFIX + clientKey;
    },

    /**
     * Notify server on layout change
     * @param size
     */
    notifyServerSetLayoutSize : function(size) {
        var callback = function(){
            this._updateState();
            this._changeScreenSizeForFixedMode();
        }.bind(localContext);
        designerBase.sendRequest('da_setLayoutSize', new Array('size=' + size), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    /**
     * Notify server on add content frame
     * @param options
     */
    notifyServerAddContentFrame : function(options, event){
        this._incrementUnansweredAddRequests();
        var frameName = localContext.nextContentFrameName;
        var overlay = "containerOverlay_" +  frameName;
        var eventCopy = Object.clone(event);
        var callback = function() {
            localContext._updateState();
            localContext._updateAllIFramesSRCParam(frameName);
            localContext._reSyncFramesIfRequired();
            localContext._updateInputControlsNodes();
            localContext.shouldReplace = false;
            localContext.replacingFrameName = null;
            localContext.addContentFrameToSelection($(overlay), eventCopy);
            localContext.controlsController.draw();
            localContext._decrementUnansweredAddRequests();
            localContext._updateScroll();
        };

        var errorHandler = function() {
            localContext._decrementUnansweredAddRequests();

            var delayedFn = function() {
                if (localContext._deleteFrameOverlayFromDOM($(overlay))) {
                    localContext.notifyServerDeleteFrames([frameName]);
                }
            };

            setTimeout(delayedFn, 0);
        };

        var type = this._getCurrentReportType();
        var uri = this._getCurrentReportPath();
        var name = this._getCurrentReportName();

        designerBase.sendRequest(
                'da_addContentFrame',
                new Array(
                        'type=' + encodeText(type),
                        'resourceName=' + encodeText(name),
                        'src=' + encodeText(localContext.nextFrameSrc),
                        'uri=' + encodeText(uri),
                        'left=' + options.left,
                        'top=' + options.top,
                        'width=' + options.width,
                        'height=' + options.height),
                callback,
                {target: "dashboardControlsPlaceHolder", hideLoader: true, mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE},
                errorHandler);
    },

    notifyServerReplaceFrame : function(frameName){
        var callback = function(){
            this._updateState();
            this._updateInputControlsNodes();
            this.shouldReplace = false;
            this.replacingFrameName = null;
            this.controlsController.draw();
        }.bind(localContext);

        designerBase.sendRequest('da_replaceFrame', new Array(
                'uri=' + encodeText(localContext._getCurrentReportPath()),
                'name=' + encodeText(frameName)),
                callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});

    },

    /**
     * Add control frame to dashboard
     */
    notifyServerAddControlFrame : function(controlName){
        this._incrementUnansweredAddRequests();

        var callback = function(){
            this._updateState();
            this.controlsController.draw();
            var controlsInformation = [this._getControlInformation(_.last(localContext.controlFrames))];
            var updateFrames = _.bind(function() {
                this._updateNewControlFrameWidth(_.bind(this._setNewTextFrameMinimumWidth, this));
                this._reSyncFramesIfRequired();
                this._decrementUnansweredAddRequests();
                this._setLastControlClicked();
            }, this);
            if (!controlsInformation || controlsInformation.length == 0) {
                updateFrames && updateFrames();
            }else{
                this.controlsController.addControls(controlsInformation).always(updateFrames);
            }
        }.bind(localContext);

        designerBase.sendRequest('da_addControlFrame', new Array(
                'name=' + controlName,
                'left='+ localContext.nextControlFrameLeft,
                'top='+ localContext.nextControlFrameTop,
                'width=0', /*pick up default value on server - for backward compat with 3.7 */
                'height='+ localContext.nextControlFrameHeight), callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});

    },

    /**
     * Notify server when adding a custom frame
     * @param frameName
     * @param url
     * @param parameterMap
     */
    notifyServerUpdateCustomContentFrame : function(frameName, url, parameterMap){
        this._incrementUnansweredAddRequests();

        var parameterMapping = "";
        var size = parameterMap.length;
        parameterMap.each(function(param, index){
            parameterMapping += param;
            if(index < size - 1){
                parameterMapping += "**";
            }
        });


        var callback = function(){
            this._updateState();
            this._reSyncFramesIfRequired();
            if(parameterMapping.length > 0){
                this._updateAllIFramesSRCParam(frameName);
            }
            this._decrementUnansweredAddRequests();
            this.controlsController.draw();
        }.bind(localContext);

        designerBase.sendRequest('da_updateCustomContentFrame', new Array(
                'frameName=' + frameName,
                'src=' + encodeText(url),
                'paramMappingsString=' + encodeText(parameterMapping),
                'left='+ this.currentCustomFrame.offsetLeft,
                'top='+ this.currentCustomFrame.offsetTop,
                'width='+ this.currentCustomFrame.offsetWidth,
                'height='+ this.currentCustomFrame.offsetHeight), callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    /**
     * Notify server on delete frames
     * @param names
     */
    notifyServerDeleteFrames : function(names){
        this._incrementUnansweredAddRequests();
        var framesToDelete = names.join("**");
        var callback = function(){
            this._updateState();
            this._purgeDeletedInputControlTextFrames();
            this._updateInputControlsNodes();
            var allControlIds = this.controlsController.getViewModel().pluck('id');
            var controlsFramesIds = _.pluck(localContext.controlFrames, "paramName");
            var controlIds = _.difference(allControlIds, controlsFramesIds);
            if (controlIds && controlIds.length > 0) {
                this.controlsController.removeControls(controlIds);
            }
            this.controlsController.draw();
            this._decrementUnansweredAddRequests();
        }.bind(localContext);
        designerBase.sendRequest("da_deleteFrames", new Array("names=" + framesToDelete), callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    /**
     * Notify server on move frames
     */
    notifyServerMoveFrames : function(){
        this._incrementUnansweredAddRequests();
        var framesAndCoordinates = this._getNewFramePositions();
        var numOfFrames = framesAndCoordinates.length;
        var queryParams = "";

        framesAndCoordinates.each(function(positionData, index){
            queryParams += positionData.frameName + "@@" +  positionData.frameLeft + "@@" + positionData.frameTop;
            if(index < numOfFrames - 1){
                queryParams += "**";
            }
        });

        var callback = function(){
            this._updateState();
            this._reSyncFramesIfRequired();
            this.justDragged = false;
            this._decrementUnansweredAddRequests();

        }.bind(localContext);
        designerBase.sendRequest("da_moveFrames", new Array("paramString=" + queryParams), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});

    },

    /**
     * Notify server on frame resize
     * @param renderControls
     */
    notifyServerResizeFrames : function(renderControls, optionalFrameObjects, sizeToContent, callback){
        this._incrementUnansweredAddRequests();
        var queryParams = "";
        var frameOptions = null;

        if(optionalFrameObjects){
            frameOptions = optionalFrameObjects
        }else{
            frameOptions = this._getNewFrameProperties();
        }

        var numOfOptions = frameOptions.length;
        frameOptions.each(function(option, index){
            queryParams += option.frameName + "@@" + option.frameWidth + "@@" + option.frameHeight + "@@" + option.frameFontSize;
            if(index < numOfOptions - 1){
                queryParams += "**";
            }

        });

        var internalCallback = function(){
            this._updateState();
            this._reSyncFramesIfRequired();
            this.adjustingFontSize = false;
            this._decrementUnansweredAddRequests();
            if(sizeToContent){
                this.toggleAllSelectedFrameScrollBars(false);
            }
            if (renderControls) {
                /* Re-initialize controls after they were re-rendered */
                this.controlsController.draw();
            }
            callback && callback();
        }.bind(localContext);

        designerBase.sendRequest(renderControls ? 'da_resizeFramesAndRenderControls' : 'da_resizeFrames',
                new Array("paramString=" + queryParams), internalCallback,
                {target: renderControls ? "dashboardControlsPlaceHolder" : "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    //could be multiple frames so marshall into one string with separators
    //so we only need one request
    // <name1>@@<interval1>**<name2>@@<interval2>** etc.
    notifyServerSetAutoRefresh : function(contentFrames){
        var queryParams = "";
        var numOfOptions = contentFrames.length;
        contentFrames.each(function(option, index){
            queryParams += option.name + "@@" + option.interval;
            if(index < numOfOptions - 1){
                queryParams += "**";
            }
        });

        var callback = function(){
            this._updateState();
        }.bind(localContext);

        designerBase.sendRequest("da_setAutoRefresh", new Array("paramString=" + queryParams), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerToggleContentFrameScrollBars : function(contentFrameName){
        var callback = function(){
            this._updateState();
        }.bind(localContext);

        designerBase.sendRequest("da_toggleScrollBars", new Array("names=" + contentFrameName), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerToggleAllContentFramesScrollBars : function(contentFrameNames, toggleOption){
        var queryParams = "";
        var numOfOptions = contentFrameNames.length;

        var callback = function(){
            this._updateState();
        }.bind(localContext);

        contentFrameNames.each(function(name, index){
            queryParams += name;
            if(index < numOfOptions - 1){
                queryParams += "**";
            }
        });

        designerBase.sendRequest("da_setScrollBars", new Array("names=" + queryParams, "showScrollBars=" + toggleOption), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerAddClickableFrame : function(clickableId){
        this._incrementUnansweredAddRequests();

        var callback = function() {
            this._updateState();
            this._deselectAllSelectedDashboardFrames();
            this._reSyncFramesIfRequired();
            this._decrementUnansweredAddRequests();
            this.controlsController.draw();
        }.bind(localContext);

        designerBase.sendRequest("da_addButtonFrame", new Array(
                'left=' + localContext.nextControlFrameLeft,
                'top=' + localContext.nextControlFrameTop,
                'width=' + localContext.nextControlFrameWidth,
                'height=' + localContext.nextControlFrameHeight,
                'id=' + clickableId),
                callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});

    },

    notifyServerAddTextLabelFrame : function(){
        this._incrementUnansweredAddRequests();

        var callback = function() {
            this._updateState();
            this._deselectAllSelectedDashboardFrames();
            this._reSyncFramesIfRequired();
            this._decrementUnansweredAddRequests();
            this.controlsController.draw();
        }.bind(localContext);

        designerBase.sendRequest("da_addTextLabelFrame", new Array(
                'label=' + encodeText(localContext.TEXT_LABEL),
                'left='+ localContext.nextControlFrameLeft,
                'top=' + localContext.nextControlFrameTop,
                'width=' + localContext.nextControlFrameWidth,
                'height=' + localContext.nextControlFrameHeight), callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerAddFreeTextLabelFrame : function(){
        this._incrementUnansweredAddRequests();

        var callback = function() {
            this._updateState();
            this._deselectAllSelectedDashboardFrames();
            this._reSyncFramesIfRequired();
            this._decrementUnansweredAddRequests();
            this.controlsController.draw();
        }.bind(localContext);

        designerBase.sendRequest("da_addFreeTextFrame", new Array(
                'label=' + encodeText(localContext.FREE_TEXT),
                'left='+ localContext.nextControlFrameLeft,
                'top=' + localContext.nextControlFrameTop,
                'width=' + localContext.nextControlFrameWidth,
                'height=' + localContext.nextControlFrameHeight), callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerSaveDashboard : function(folder, name, desc, overwriteOK){
        var deferred = jQuery.Deferred();
        var callback = function(){
            designerBase._saveConfirmMessage();
            this._updateState();
            deferred.resolve();
        }.bind(localContext);

        var saveErrorHandler = designerBase.createOverwriteHanlder(deferred, [folder, name, desc, true]);
        designerBase.sendRequest("da_save", new Array(
                'dbFolder=' + encodeText(folder),
                'dbLabel=' + encodeText(name),
                'dbDesc=' + encodeText(desc),
                'aruOverwrite=' + overwriteOK), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE},
                saveErrorHandler);
        return deferred;
    },

    notifyServerUpdateControlValues : function(controlValues){
        var paramValues = [];
        _.map(controlValues, _.bind(function(value, key) {
            paramValues.push(this._formatParamValue(key, value));
        }, this));

        var internalCallback = function(){
            this._updateState();
            this._reSyncFramesIfRequired();
            this._updateAllIFramesSRCParam();
        }.bind(this);

        designerBase.sendRequest("da_updateControlValues", paramValues, internalCallback,
            {bPost:true, target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerUpdateText : function(frameName, modifiedText, width){
        var callback = function(){
            this._updateState();
            this._reSyncFramesIfRequired();
            this.controlsController.draw();
        }.bind(this);
        designerBase.sendRequest("da_setTextLabel", new Array(
                'name=' + encodeText(frameName),
                'label=' + encodeText(modifiedText),
                'width=' + encodeText(width)), callback, {target: "dashboardControlsPlaceHolder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerReset : function(left, top){
        var callback = function(){
            this._updateState();
            this._reSyncFrames(false);
            this._updateInputControlsNodes();
            this._updateAllIFramesSRCParam();
        }.bind(this);
        designerBase.sendRequest("da_reset", new Array('layoutLeft=' + left,'layoutTop=' + top), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerDeleteTitle : function(){
        var callback = function(){
            this._updateState();
        }.bind(this);
        designerBase.sendRequest('da_setTitle', new Array('title=_null'), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    notifyServerUpdateTitle : function(){
        if ($("title")) {
            var dashboardTitle = getInnerText($("title"));
            if (localContext._isDashboardTitleDeleted()) {
                dashboardTitle = "_null";
                $("title").update(localContext.NO_DASHBOARD_TITLE_TEXT);
            }

            var callback = function() {
                this._updateState();
            }.bind(this);
            designerBase.sendRequest('da_setTitle', new Array('title=' + encodeText(dashboardTitle)), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
        }
    },

    notifyServerConvertToProportionalMode : function(){
        var sizeFactor = localContext._calculateSizeConversionFactor();
        var growthFactor = localContext._calculateGrowthFactorForProportionalRuntime();
        var callback = function(){
            this._updateState();
            this._reSyncFrames(true);
            this._changeScreenSizeForProportionalMode();
        }.bind(localContext);

        if(!isNaN(sizeFactor)){
            designerBase.sendRequest('da_convertToProportionalMode', new Array('conversionFactor=' + sizeFactor, 'growthFactor=' + growthFactor), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
        }
    },

    notifyServerConvertToFixedMode : function(){
        var sizeFactor = localContext.conversionFactor;
        var callback = function(){
            this._updateState();
            this._reSyncFrames(true);
            this._changeScreenSizeForFixedMode();
        }.bind(localContext);

        if(!isNaN(sizeFactor)){
            //never been set which means we started in proportional mode
            if(sizeFactor <= 0){
                sizeFactor = 1;
            }
            designerBase.sendRequest('da_convertToFixedMode', new Array('conversionFactor=' + sizeFactor), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
        }
    },

    notifyServerUpdateSizeConversionFactor : function(conversion){
        var callback = function(){
            this._updateState();
        }.bind(localContext);
        if(conversion && !isNaN(conversion)){
            designerBase.sendRequest('da_setConversionFactor', new Array('conversionFactor=' + conversion), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
        }
    },

    notifyServerUpdateGrowthFactor : function(growthFactor){
        var callback = function(){
            this._updateState();
        }.bind(localContext);
        if(growthFactor && !isNaN(growthFactor)){
            designerBase.sendRequest('da_setGrowthFactor', new Array('growthFactor=' + growthFactor), callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
        }
    },

    /**
     * Ping server to keep session alive
     */
    tryToKeepServerAlive : function(){
        var callback = function(){
            this._updateState();
        }.bind(this);
        designerBase.sendRequest('da_tryToKeepServerAlive', [], callback, {target: "dashboardStatePlaceholder", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    }
};

document.observe('dom:loaded', function(){ return designerBase.superInitAll()});
