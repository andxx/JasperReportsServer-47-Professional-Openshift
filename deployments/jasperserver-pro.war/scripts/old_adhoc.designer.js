/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

//declaration and default value (this may be updated by each mode context (eg table, chart etc.)
var localContext = window;
var requestLogEnabled = false;
var adhocSessionButton;
var adhocSessionDialog;
var TIMEOUT_INTERVAL = serverTimeoutInterval * 1000; //since intervals are in milli-secs we need to multiply by 1000
var ADHOC_SESSION_TIMEOUT_MESSAGE = adHocSessionExpireCode;
var ADHOC_EXIT_MESSAGE = adHocExitConfirmation;

var adhocDesigner = {
	comp: {
		header_title: null,
		display_manager: null
	},

    //member variables
    _leafSelectedFired : false,
    availableTree : null,
    showDisplayManager: true,
    isDesignViewMode: true,

    //For OLAP mode
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
    ACTION_MODEL_TAG : "adhocActionModel",
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
    CANVAS_METADATA_ID : "canvasMetadata",

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
        sort : "sortDialog",
        reentrant : "selectFields",
        themes: "selectPalette",
        editLabel: "editLabel"
        //        inputControls : ""
    },


    adhocThemeHash : {
        basic : "default",
        olive : "olive",
        corporate : "corporate",
        pastel : "pastel",
        fall : "fall",
        professional : "professional",
        forest : "forest",
        slate : "slate",
        ocean : "ocean",
        wine : "wine"
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Initialization
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Initializer method
     */
    initializer : function(mode){
    	this.current_mode = mode;
        JRS.vars.current_flow = 'adhoc';
        var mainPanelID = localContext.MAIN_PANEL_ID ? localContext.MAIN_PANEL_ID : 'canvas';
        if($('fields')) {
            layoutModule.resizeOnClient('fields', mainPanelID, 'filters');
        } else {
            layoutModule.resizeOnClient('filters', mainPanelID);
        }
        this.initComponents();
        this.initAvailableFields();
        //prevent browser selection
        $("errorPageContent") ?
                this.initEnableBrowserSelection($("designer")) : this.initPreventBrowserSelection($("designer"));
        //this.initEnableBrowserSelection($("saveAs"));
        adhocControls.initialize.bind(adhocControls)();

        if(isIPad()){
        	var wrapper = document.getElementById(this.current_mode == 'crosstab' ? 'canvasMetadata' : 'canvasTable').parentNode;
            this._touchController = new TouchController(wrapper,wrapper.parentNode,{
            	useParent: true,
            	absolute: true
            });
        }

        $(layoutModule.PAGE_BODY_ID).observe(isSupportsTouch() ? 'touchstart' : 'click', function(event) {       	
        	if(event.touches) {
        		!isRightClick(event) && event.touches.length == 1 && actionModel.hideMenu();
        	} else {
        		!isRightClick(event) && actionModel.hideMenu();
        	}
        });
    },

    initPreventBrowserSelection : function(domObject){
        disableSelectionWithoutCursorStyle($(domObject));
//        var currentStyle = null;
//        var object = $(domObject);
//        if(object){
//            if(isIE()){
//                //object.onselectstart = function(){return false;}
//                $(object).attachEvent('onselectstart', function (e) {
//					var tagName = e.srcElement.tagName;
//					if (tagName != "INPUT" && tagName != "TEXTAREA") { e.returnValue = false; }
//					});
//            } else if(isWebKitEngine()){
//                currentStyle = object.readAttribute("style");
//                if(!currentStyle || !currentStyle.include("webkit-user-select:none")){
//                    currentStyle = currentStyle ? currentStyle + ";-webkit-user-select:none" : "-webkit-user-select:none";
//                    object.writeAttribute("style", currentStyle);
//                }
//            }else if(isMozilla()){
//                currentStyle = object.readAttribute("style");
//                if(!currentStyle || !currentStyle.include("moz-user-select:-moz-none")){
//                    currentStyle = currentStyle ? currentStyle + ";-moz-user-select:-moz-none" : "-moz-user-select:-moz-none";
//                    object.writeAttribute("style", currentStyle);
//                }
//            }
//        }
    },

    initEnableBrowserSelection : function(domObject){
        enableSelection($(domObject))
    },

    initNothingToDisplayPane : function(){
        var nothingToDisplay = $('nothingToDisplay');
        nothingToDisplay.removeClassName(layoutModule.HIDDEN_CLASS);
        adhocCenterElement(nothingToDisplay, {horz: true, vert: true});
    },

    /**
     * Used to generate the available fields list as a tree
     */
    getAvailableFieldsTree : function(id, providerId){
        function AvailableTreeNode(options) {
            dynamicTree.TreeNode.call(this, options);

            this.Types = {
                Folder : new dynamicTree.TreeNode.Type('ItemGroupType')
            };
            this.nodeHeaderTemplateDomId = "list_responsive_collapsible_folders:folders";
        }

        AvailableTreeNode.prototype = deepClone(dynamicTree.TreeNode.prototype);

        AvailableTreeNode.addMethod('refreshStyle', function(element) {
            if (!element) {
                element = this._getElement();
                if (!element) {
                    return;
                }
            }

            dynamicTree.TreeNode.prototype.refreshStyle.call(this, element);

            // Check if item is a calculated field
            var field = adhocDesigner.findFieldByName(this.param.id);

            if (field && field.formulaRef) {
                element.addClassName('calculatedField');
            } else {
                element.removeClassName('calculatedField');
            }
        });

        return new dynamicTree.TreeSupport(id, {
            providerId: providerId,
            rootUri: '/',
            showRoot: false,
            resetStatesOnShow: false,
            nodeClass: AvailableTreeNode,
            templateDomId: "list_responsive_collapsible_folders",
            dragPattern: isIPad() ? undefined : '.draggable',
            treeErrorHandlerFn: function() {},
            selectOnMousedown: !isIPad(),
            regionID: id ? id : designerBase.AVAILABLE_FIELDS_AREA
        });
    },

    initTreeEvents: function(tree) {
        ///////////////////////////////////////////////////////////////////////////////////
        // mouse events
        ///////////////////////////////////////////////////////////////////////////////////

        tree.observe('leaf:dblclick', function(event) {
            var evt = event.memo.targetEvent;
            this.addFieldToCanvas(evt);
            this.unSelectAvailableTreeNodes();
        }.bind(this));


        tree.observe('leaf:selected', function(event) {
            var node = event.memo.node;
            var evt = event.memo.targetEvent;
            adhocDesigner.getDifferrentTree(tree)._deselectAllNodes();
            adhocDesigner.selectFromAvailableFields(evt, node);
        }.bind(this));


        tree.observe('node:selected', function(event) {
            var node = event.memo.node;
            var evt = event.memo.targetEvent;
            adhocDesigner.getDifferrentTree(tree)._deselectAllNodes();
            //add to selection
            adhocDesigner.selectFromAvailableFields(evt, node);
        }.bind(this));

        tree.observe('leaf:unselected', function(event){
            var node = event.memo.node;
            this.removeSelectedObject(node);
        }.bind(this));

        tree.observe('node:unselected', function(event){
            var node = event.memo.node;
            this.removeSelectedObject(node);
        }.bind(this));


        tree.observe('items:unselected', function(event){
            designerBase.unSelectAll();
        }.bind(this));


        tree.observe('node:dblclick', function(event){
            //update cookie info.
            this._availableTreeLastOpened = event.memo.node.param.uri;
            new JSCookie(this._cookieName, this._availableTreeLastOpened, this._cookieTime);
        }.bind(this));


        tree.observe('node:dblclick', function(event){
            this._availableTreeLastOpened = event.memo.node.param.uri;
            new JSCookie(this._cookieName, this._availableTreeLastOpened, this._cookieTime);
        }.bind(this));

        tree.observe('node:click', function(event){
            //update cookie info.
            this._availableTreeLastOpened = event.memo.node.param.uri;
            new JSCookie(this._cookieName, this._availableTreeLastOpened, this._cookieTime);
        }.bind(this));

        tree.observe('tree:loaded', function(event) {
            tree.openAndSelectNode(this._availableTreeLastOpened, function(){
                this.updateAllFieldLabels();
            }.bind(this));
        }.bind(this));

        ///////////////////////////////////////////////////////////////////////////////////
        // key events
        ///////////////////////////////////////////////////////////////////////////////////

        tree.observe('key:contextMenu', function(event) {
            var node = event.memo.node;
            var nodePosition = getBoxOffsets(node, true);
            adhocDesigner.showDynamicMenu(
                    event,
                    designerBase.FIELD_MENU_LEVEL,
            {menuLeft: nodePosition[0] + 100,
                menuTop: nodePosition[1] + 20} //TODO: use constants for offsets
                    );
            Event.stop(event);
        });

        tree.observe('key:escape', function(event) {
            adhocDesigner.hideAllDialogsAndMenus();
            Event.stop(event);
        });
    },

    getNodeByEvent: function(event) {
        return this.measuresTree.getTreeNodeByEvent(event)
            || this.dimensionsTree.getTreeNodeByEvent(event);
    },

    commonContextMenuHandler : function(event) {
        if (localContext.isCrosstabMode && localContext.isCrosstabMode()) {
            //crosstab implements it`s own tree menu handler instead of char and table
            localContext.crosstabTreeMenuHandler(event);
        } else {
            var matched = null;
            var node = event.memo.node;
            var evt = event.memo.targetEvent;

            matched = matchAny(node, adhocDesigner.TREE_NODE_AND_LEAF_PATTERN, true);
            if (matched) {
                node = this.getNodeByEvent(event.memo.targetEvent);
                if (!this.isSelectedNode(node)) {
                    this.selectFromAvailableFields(evt, node);
                }
                if (adhocDesigner.isOnlyFieldsSelected()) {
                    this.showDynamicMenu(evt, designerBase.FIELD_MENU_LEVEL, null);
                } else {
                    this.showDynamicMenu(evt, designerBase.FIELDSET_MENU_LEVEL, null);
                }
            }
        }
    },

    getCommonContextMenuObserver : function (){
        if (!this.commonContextMenuObserver){
           //safe reference on bounded function
           this.commonContextMenuObserver = this.commonContextMenuHandler.bind(this);
        }
        return this.commonContextMenuObserver;
    },


    initCommonEvents: function() {
        //capture context menu event
        document.observe(layoutModule.ELEMENT_CONTEXTMENU, this.getCommonContextMenuObserver());

        //capture click events here
        Event.observe(document.body, isIPad() ? 'touchend' : 'click', function(event) {
            var element =  event.element();

            var availableFieldsArea = this.AVAILABLE_FIELDS_PATTERN;
            var canvasArea = this.CANVAS_PATTERN;
            var menuArea = this.MENU_PATTERN;

            var matched = matchAny(element, this.AVAILABLE_FIELDS_PATTERN, true);
            if (!matched) {
                designerBase.visuallyDeselectAllTreeNodes();
            }

            matched = matchAny(element, [canvasArea, this.COLUMN_OVERLAY_PATTERN, 'li.meazure', 'li.dimenzion',
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
                this.GROUP_OVERLAY_PATTERN, menuArea], true);
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

        }.bind(adhocDesigner));
    },

    customizeTree: function(tree) {
        var nodeUri = new JSCookie(this._cookieName).value;
        this._availableTreeLastOpened = nodeUri && nodeUri.length > 0 ? nodeUri : "/";
        tree.DEFAULT_TREE_CLASS_NAME = "responsive fields";
        tree.multiSelectEnabled = true;
    },

    customizeTreeForIPad: function(tree) {
        if (isIPad()) {
//            var defaultSetDragStartState = tree.setDragStartState;
//            tree.setDragStartState = function(node, draggable, event) {
//                defaultSetDragStartState.call(availableTree, node, draggable, event);
//                actionModel.hideMenu();
//                $('frame').insert(draggable.element);
//            };

            var treeElement = $(tree.getId());
            new TouchController(treeElement, treeElement.up());
        }
    },

    customizeDimensionsTree: function(dimensionsTree) {
        this.customizeTree(dimensionsTree);
    },

    customizeMeasuresTree: function(measuresTree) {
        this.customizeTree(measuresTree);
    },

    /**
     * Used to initialize available fields list
     */
    initAvailableFields : function(){

        if ($(adhocDesigner.DIMENSIONS_TREE_DOM_ID)) {
            var dimensionsTree =
                this.getAvailableFieldsTree(
                    this.DIMENSIONS_TREE_DOM_ID,
                    this.DIMENSIONS_TREE_PROVIDER_ID);

            if(this.current_mode == 'table' || this.current_mode == 'chart') {
                this.customizeDimensionsTree(dimensionsTree);
            }

            localContext.customizeDimensionsTree
                ? localContext.customizeDimensionsTree(dimensionsTree)
                : this.customizeDimensionsTree(dimensionsTree);

            this.customizeTreeForIPad(dimensionsTree);

            localContext.initTreeEvents
                ? localContext.initTreeEvents(dimensionsTree)
                : this.initTreeEvents(dimensionsTree);

            adhocDesigner.showAvailableTree(dimensionsTree);

           this.dimensionsTree = dimensionsTree;
        }

        if ($(adhocDesigner.MEASURES_TREE_DOM_ID)) {
            var measuresTree = adhocDesigner.getAvailableFieldsTree(adhocDesigner.MEASURES_TREE_DOM_ID, adhocDesigner.MEASURES_TREE_PROVIDER_ID);

            if(this.current_mode == 'table' || this.current_mode == 'chart') {
                this.customizeMeasuresTree(measuresTree);
            }

            localContext.customizeMeasuresTree
                ? localContext.customizeMeasuresTree(measuresTree)
                : this.customizeMeasuresTree(measuresTree);

            this.customizeTreeForIPad(measuresTree);

            localContext.initTreeEvents
                ? localContext.initTreeEvents(measuresTree)
                : this.initTreeEvents(measuresTree);

            adhocDesigner.showAvailableTree(measuresTree);

           this.measuresTree = measuresTree;
        }

        localContext.initCommonEvents
            ? localContext.initCommonEvents()
            : this.initCommonEvents();
    },

    showAvailableTree : function(tree){
        tree.showTree(this._AVAILABLE_TREE_DEPTH);
    },

    /**
     * Initialize Adhoc Designer components
     */
    initComponents: function(){
    	var it = this;
    	document.getElementById('canvas') ? adhocDesigner.comp.header_title = jQuery('#canvas > div.content > div.header > div.title') : 
    		adhocDesigner.comp.header_title = jQuery('#OLAP > div.content > div.header > div.title');
    	if(saveLabel.length && saveLabel.length > 0) {
    		adhocDesigner.comp.header_title.html(saveLabel);
    	}
    	if(this.current_mode == 'table') {
    		adhocDesigner.comp.display_manager = new AdhocDisplayManager({
    			id: this.DISPLAY_MANAGER_ID,
    			accept_only:{rows:['dimension','dimenzion']},
    			onDropColFn: {
    				colgroup: localContext.moveColumn,
    				rowgroup: localContext.switchToColumn,
    				dimension: localContext.addFieldAsColumnAtPosition,
    				measure: localContext.addFieldAsColumnAtPosition
    			},
    			onRemColFn: localContext.removeColumn,
    			onRightClickColFn: function(e,fname,i,ftype) {
    				/*
    				 * o is PrototypeJS extended html element.
    				 */
    				var o = localContext._getTableHeaders()[i];
    				localContext.selectTableColumn(e,{header:o,index:i,ftype:ftype});
    				adhocDesigner.showDynamicMenu(e,'displayManagerColumn',null,null);               	
    			},
    			onDropRowFn: {
    				colgroup: function(fname,i,j,ftype){
    					if(ftype == 'dimension') {
    						localContext.switchToGroup(fname,i,j);
    					} else {
    						dialogs.systemConfirm.show('Error: measures can not be added to groups.', 5000);
    					}
    				},
    				rowgroup: localContext.moveGroup,
    				dimension: localContext.addFieldAsGroup,
    				measure: function(){
    					dialogs.systemConfirm.show('Error: measures can not be added to groups.', 5000);
    				}
    			},
    			onRemRowFn: localContext.removeGroup,
    			onRightClickRowFn: function(e,f,i) {
    				var id = 'columnGroupOverlay_' + f;
    				var o = document.getElementById(id);
    				var jo = jQuery(o);  				
	                localContext.selectGroup(e, {
                        id: id,
                        fieldName: jo.attr("data-fieldName"),
                        mask: jo.attr("data-mask"),
                        dataType: jo.attr("data-dataType"),
                        index: jo.attr("data-index"),
                        label: jo.attr("data-label")
                    });
    				adhocDesigner.showDynamicMenu(e,'displayManagerRow',null,null);               				
    			}
    		});
    	}
    	
    	if(this.current_mode == 'chart') {
    		adhocDesigner.comp.display_manager = new AdhocDisplayManager({
    			id: this.DISPLAY_MANAGER_ID,
    			duplicate_allowed:[true,false],
    			accept_only:{rows:['dimension','dimenzion']},
    			only_one_row_item: true,
    			onDropColFn: {
    				colgroup: localContext.moveMeasure,
    				rowgroup: function(f,i){   					
						localContext.switchToMeasure(f,i);
    				},
    				dimension: localContext.addFieldAsMeasure ,
    				measure: localContext.addFieldAsMeasure
    			},
    			onRemColFn: localContext.removeMeasure,
    			onRightClickColFn: function(e,f,i) {
                    var legendItem = localContext.legendItems[i];
                    selectedObject = {
                        id: "legendOverlay_" + i,
                        legendName: localContext.chartFns[f],
                        index: i,
                        defaultName: legendItem.defaultName,
                        userName: legendItem.userName,
                        chartMeasureId: localContext.chartFns[f]
                    };
                    designerBase.unSelectAll();
                    localContext.deselectAllSelectedOverlays();
                    designerBase.addToSelected(selectedObject);       
                    selectionCategory.area = designerBase.LEGEND_MENU_LEVEL;
                    adhocDesigner.showDynamicMenu(e,'displayManagerColumn');
    			},
    			onDropRowFn: {
    				colgroup: function(f,i,j,ftype){
    					if(ftype == 'dimension') {
    						var m;
    						for(m=0;m<localContext.legendItems.length;m++) {
    							if(localContext.legendItems[m]['defaultName'] == f) {
    								localContext.switchToGroup(localContext.measureNames[m],i,j);
    							}
    						}    					
    					} else {
    						dialogs.systemConfirm.show('Error: measures can not be added to groups.', 5000);
    					}
    				},
    				rowgroup: doNothing,
    				dimension: localContext.setGroup,
    				measure: function(){
    					dialogs.systemConfirm.show('Error: measures can not be added to groups.', 5000);
    				}
    			},
    			onRemRowFn: localContext.removeGroup,
    			onRightClickRowFn: function(e,f,i) {
                    selectedObject = {
                        legendName: f,
                        index: 0
                    };
                    designerBase.unSelectAll();
                    localContext.deselectAllSelectedOverlays();
                    designerBase.addToSelected(selectedObject);       
                    selectionCategory.area = designerBase.LEGEND_MENU_LEVEL;
                    adhocDesigner.showDynamicMenu(e,'displayManagerRow',null,null);
    			}
    		});
    	}

        if (this.isDesignViewMode && !this.showDisplayManager && this.isDisplayManagerVisible()) {
            $(adhocDesigner.DISPLAY_MANAGER_ID).hide();
        }

    	if(this.current_mode == 'crosstab') {
    		jQuery('#OLAP').removeClass('showingSubHeader');
    	}
    	/**
    	 * Custom UI related events
    	 */
    	jQuery('#designer').bind({
    		'layout_update': function(){
    			var cc = jQuery('#adhocCanvasContainer');
    			var hd = cc.prev();
	    		var off = cc.css('margin-top');
	    		off = off.substring(0,off.indexOf('px'));
	    		var hh = hd.height() - 35; 
	        	var top = hh - off;
	        	jQuery('#mainTableContainer').css('top',top+'px');
    		},
    		'report_name_update': function(e,n){
    			adhocDesigner.comp.header_title.html(n);
    		}
    	})    	
    	isIPad() &&layoutModule.minimize(document.getElementById('filters'), true);
    },
    /**
     * Render adhoc designer components. i.e. after an ajax call.
     */
    render: function(onInit){    	
    	if(this.current_mode == 'table') {
    		onInit ?
    			this.comp.display_manager.update([localContext.columns,localContext.groups],[localContext.allColumns,localContext.allColumns]):
    			this.comp.display_manager.render([localContext.columns,localContext.groups],[localContext.allColumns,localContext.allColumns]);
    	}
    	if(this.current_mode == 'chart') {
            onInit ?
            	this.comp.display_manager.update([localContext.chartMeasures,localContext.hasGroup ? localContext.fieldsInUse.splice(0,1) : []],[localContext.chartItems,localContext.allColumns],localContext.chartFns):
    			this.comp.display_manager.render([localContext.chartMeasures,localContext.hasGroup ? localContext.fieldsInUse.splice(0,1) : []],[localContext.chartItems,localContext.allColumns],localContext.chartFns);
    	}
    	if(this.current_mode == 'crosstab') {
    		jQuery('#OLAP').removeClass('showingSubHeader');
    	}
    	jQuery('#designer').trigger('layout_update');
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Event handling
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Method used to init handlers for specific buttons and tabs.
     */
    initExplorerObjectListeners : function(evt){
        //initialize sample data switcher
        $$('#dataMode > li').each(function(object){
            Event.observe($(object), 'mouseup', function(evt) {
                this.toggleAdhocDataSetSize($(object));
            }.bind(this));
        }.bind(this));

        //init of switch mode
        $$("#displayMode > li").each(function(object){
            Event.observe($(object), 'mouseup', function(evt){
                var currentMode = localContext.getMode();
                var mode = $(object).identify();
                var re = /\w+/;
                mode = re.exec(mode);
                if(currentMode !== mode){
                    this.switchMode(mode[0], null);
                }
            }.bind(this));
        }.bind(this));

        Event.observe($('mainTableContainer'),'scroll', function(evt) {
            if(localContext.getMode() === designerBase.TABLE){
                localContext.tableScrolled();
            }
            actionModel.hideMenu();
        });

        if(isIPad()) {
            Event.observe($('mainTableContainer'),'touchmove', function(evt) {
                if(localContext.getMode() === designerBase.TABLE){
                    localContext.tableScrolled();
                }
            }.bind(this));
        }

        //need to do this check because preview mode doesn't have available fields
        if (localContext.inDesignView) {
            Event.observe($('availableFieldsMutton'), 'mouseover', function(evt) {
                this.showAvailableFieldsMenu(evt);
            }.bind(this));
        }

        //init of filter panel menu
        Event.observe($('filterPanelMutton'), 'mouseover', function(evt){
            this.showFilterPanelMenu(evt);
        }.bind(this));

        var editTitleTrigger = isIPad() ? 'touchend' : 'mousedown';
        $('mainTableContainer').stopObserving(editTitleTrigger, adhocDesigner.adhocTitleEdit.bind(this));
        $('mainTableContainer').observe(editTitleTrigger, adhocDesigner.adhocTitleEdit.bind(this));
      
        $('mainTableContainer').observe('touchend',function(e){
            var element = e.element();
            if(localContext.clickid == element.identify() && !adhocDesigner.isResizing() &&
                e.timeStamp - localContext.clicktime < 700) {
                    document.fire(layoutModule.ELEMENT_CONTEXTMENU, { targetEvent: e, node: element});
            }
            localContext.clicktime = e.timeStamp;
            localContext.clickid = element.identify();
        });
        
        document.stopObserving('mouseup', adhocDesigner.deSelectAllPressedNavMuttons);
        document.observe('mouseup', adhocDesigner.deSelectAllPressedNavMuttons);

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
            if (localContext.canUndo && !buttonManager.isDisabled($("undo"))) {
                this.undo();
            }
            Event.stop(event.memo.targetEvent);
        }.bind(this));

        document.stopObserving('key:redo').observe('key:redo' , function(event) {
            //hide menu if showing
            actionModel.hideMenu();
            //nasty hack for now. Will come back to it.. Promise
            if (localContext.canRedo && !buttonManager.isDisabled($("redo"))) {
                this.redo();
            }
            Event.stop(event.memo.targetEvent);
        }.bind(this));

        document.stopObserving('key:escape').observe('key:escape' , function(event) {
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

        //toolbar & calculated fields init
        toolbarButtonModule.initialize(adhocDesigner.toolbarActionMap, $("adhocToolbar"));
        adhocCalculatedFields.initialize();

        //need to do this check because preview mode doesn't have available fields
        if (localContext.inDesignView) { //sort init
            adhocSort.initialize();
            //re-entrant init
            adhocReentrance.initialize();
            //todo: move this to adhoc sort?
            adhocSort.observe('sort:sort', function(event) {
                this.setSorting(event.memo.fields, function() {
                    event.memo.hide && adhocSort.hideDialog();
                });
            }.bind(this));
        }
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

    adhocTitleEdit : function(evt){
        var element = evt.element();
        if (element.identify() === 'titleCaption'){
            if(!isNotNullORUndefined(editor)){
                this.editReportTitle(evt);
                Event.stop(evt);
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // General actions
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Used to get info from baseState variables
     */
    updateBaseState : function(){
        evaluateScript('baseState');
        evaluateScript('designerVariables');
        evaluateScript('adhocFilterState');
    },
    
    /**
     * Used to get ajax buffer info
     */
    updateBaseStateFromAjaxBuffer : function() {
        var baseState = $("baseStateAjaxBuffer");
        if (baseState) {
            window.eval.call(window, baseState.text);
        }
    },

    hideAllDialogsAndMenus : function(){
        //hide menu if showing
        actionModel.hideMenu();
        var functions = Object.values(this.dialogESCFunctions);
        functions.each(function(dialogId){
            var dialog = $(dialogId);
            if(dialog){
                dialogs.popup.hide(dialog)
            }
        }.bind(this));
    },
    
    toggleDisplayManager: function(){
    	jQuery('#'+adhocDesigner.DISPLAY_MANAGER_ID).toggle();
    	jQuery('#designer').trigger('layout_update');
        adhocDesigner.showDisplayManager = !adhocDesigner.showDisplayManager;
    },

    isDisplayManagerVisible: function(){
    	return jQuery('#'+adhocDesigner.DISPLAY_MANAGER_ID).is(":visible");
    },
    
   /**
    * used to show notification for the user,
    * about truncated data when max rows limit is reached
    */
    checkMaxRowsLimit :  function (){
        if (localContext.hitMaxRows && !this.isNoDataToDisplay()){
            //use full full rows count as a system max row limit if hitMaxRows is true
            var msg = rowLimitMessage.replace("{0}", localContext.fullRowsCount);
            dialogs.systemConfirm.show(msg, 5000);
        }
    },

    /**
    * looks for data added to canvas
    */
    isNoDataToDisplay : function() {
        if (localContext.getMode() === designerBase.TABLE){
            return (canvasTable.rows.length - 1) === 0;
        }
    },

    /**
     * used to show dynamic menu based on context
     * @param event
     * @param updateContextActionModel optional method which
     *  will be called to have ability to change context action model
     */
    showDynamicMenu : function(event, contextLevel, coordinates, updateContextActionModel){
        this.updateMenuPrerequisite(contextLevel);
        actionModel.showDynamicMenu(contextLevel, event, null, coordinates, adhocDesigner.ACTION_MODEL_TAG, updateContextActionModel);
        document.body.observe('click', adhocDesigner.DynamicMenuOnclick);
    },

    //click event handler on menu
    DynamicMenuOnclick : function(event){
        if (!isIPad() && !macOSKeyboardRightClick(event)) {
            actionModel.hideMenu();
            Event.stopObserving(document.body, 'click', adhocDesigner.DynamicMenuOnclick);
        }
    },
    
    /**
     * Used to update context of menu
     */
    updateMenuPrerequisite : function(contextLevel){
        //in case we are dealing with multi-select get last item
        var position = selObjects.length;
        if (position > 0) {
            var selected = selObjects[position - 1];
            if(selected && selected.menuLevel) selected.menuLevel = contextLevel;
        }
    },
    
    /**
     * method to be called when a a field is selected from the available fields list
     * @param event
     * @param node
     */
    selectFromAvailableFields : function(event, node) {
        // If method was invoked not throgh event machinery, then simply add node to selection.
        if (!event) {
            this.addSelectedObject(event, node, false, true);
        }
        var isMultiSelect = this.isMultiSelect(event, designerBase.AVAILABLE_FIELDS_AREA);
        //update select area
        selectionCategory.area = designerBase.AVAILABLE_FIELDS_AREA;
        var isSelected = this.isAlreadySelected(node);
        this.addSelectedObject(event, node, isMultiSelect, isSelected);
        //Event.stop(event); // iPad: Node of the tree stays selected after context menu has been opened.
    },
    
    /**
     * Method used to add items to the selObjects array
     * @param object
     */
    addSelectedObject : function(event, object, isMultiSelect, isSelected){
        if(isSelected){
            if(isMultiSelect){
                this.removeSelectedObject(object);
            }else{
                if(selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA){
                    designerBase.unSelectAll();
                    designerBase.addToSelected(object);
                }
            }
        }else{
            if(!isMultiSelect){
                designerBase.unSelectAll();
            }
            designerBase.addToSelected(object);
        }
    },
    
    /**
     * deselect all tree nodes
     * @param event
     */
    unSelectAvailableTreeNodes : function(event){
        if(selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA){
            designerBase.unSelectAll();
        }

        [this.availableTree, this.measuresTree, this.dimensionsTree]
            .each(function(tree) {
            tree && tree._deselectAllNodes();
        });

        actionModel.hideMenu();
    },
    
    /**
     * Removes all items from the selObjects array and adds the object to it
     * @param object the item we want to select
     */
    selectSingleObject : function(object){
        designerBase.unSelectAll();
        designerBase.addToSelected(object);
    },
    
    /**
     * Helper to delete items from selObjects array
     * @param obj
     */
    deselectSelectedObject : function(obj){
        this.removeSelectedObject(obj);
    },
    
    /**
     * Helper to remove item
     * @param obj
     */
    removeSelectedObject : function(obj){
        designerBase.unSelectGiven(obj);
    },
    
    /**
     * Called when the report itself is selected
     */
    selectReport : function() {
        designerBase.unSelectAll();
        this.activateReportSelectionObject();
    },
    
    /**
     * Select title section and set the selection area
     */
    activateReportSelectionObject : function() {
        this.selectSingleObject(titleBar);
        //update select area
        selectionCategory.area = designerBase.TITLE_SELECT_AREA;
    },
    
    /**
     * Select item header to be edited
     * @param element
     * @param type
     */
    editDataHeader : function(element, type, action){
        var currentText = null;
        var dialogInput = null;
        var submitFunction = null;
        var submitBtn = null;
        var cancelBtn = null;
        var index = null;
        var edited = null;
        var dialog = $("editLabel");
        var width = 100; //hard code for now

        var postEdit = function() {
            adhocDesigner.initPreventBrowserSelection($("designer"))
        };

        this.initEnableBrowserSelection($("designer"));

        if(type === "title"){
            editor = new InPlaceEditor(element);
            editor.makeEditable({
                'onMouseup': adhocDesigner.returnToNormalReportTitle,
                'onTab': adhocDesigner.returnToNormalReportTitle,
                'onEnter': adhocDesigner.returnToNormalReportTitle,
                'onEsc'  : adhocDesigner.revertToBackHeaderTitle
            });
            jQuery('#mainTableContainer').scrollLeft(0);
        }else{
            if (dialog) {
                cancelBtn = dialog.down("button#cancelEditBtn");
                submitBtn = dialog.down("button#editLabelBtn");
                if (type === "legend") {
                    var selectedLegend = designerBase.getSelectedObject();
                    if (selectedLegend) {
                        index = selectedLegend.index;
                        currentText = selectedLegend.userName;

                        dialogInput = dialog.down("input#editLabelInput");
                        if (dialogInput) {
                            dialogInput.value = currentText.strip();
                            submitFunction = function() {
                                edited = dialogInput.value;
                                //in-case any html remove them
                                edited = edited.replace(/<\/?[^>]+(>|$)|["]/g, "");
                                localContext.updateLegendLabel(edited, index);
                            };
                        }
                    }
                }else if(type === "column"){
                    var selectedColumn = adhocDesigner.getSelectedColumnOrGroup();
                    var add_title = jQuery('#add_title').html();
                    var edit_title = jQuery('#edit_title').html();
                    action == 'add' ? jQuery('div.title',dialog).html(add_title) : jQuery('div.title',dialog).html(edit_title);
                    if(selectedColumn){
                        currentText = getInnerText(selectedColumn.header);
                        width = $(selectedColumn.header).getWidth();
                        index = selectedColumn.index;

                        dialogInput = dialog.down("input#editLabelInput");
                        if(dialogInput){
                            dialogInput.value = currentText.strip();
                            submitFunction = function() {
                                edited = dialogInput.value;
                                //in-case any html remove them
                                edited = edited.replace(/<\/?[^>]+(>|$)|["]/g, "");
                                localContext.updateColumnHeaderRequest(edited, index, width);
                            };
                        }

                    }
                }else if(type === "tableGroup"){
                    var selectedGroup = adhocDesigner.getSelectedColumnOrGroup();
                    if(selectedGroup){
                        var groupIndex = selectedGroup.index;
                        currentText = selectedGroup.label;

                        dialogInput = dialog.down("input#editLabelInput");
                        if(dialogInput){
                            dialogInput.value = currentText.strip();
                            submitFunction = function() {
                                edited = dialogInput.value;
                                //in-case any html remove them
                                edited = edited.replace(/<\/?[^>]+(>|$)|["]/g, "");
                                localContext.updateGroupLabel(edited, groupIndex);
                            };
                        }
                    }
                }
                //shared by all
                if (dialogInput) {
                    $(cancelBtn).observe("click", function(evt) {
                        $(submitBtn).stopObserving('click');
                        postEdit();
                        dialogs.popup.hide(dialog);
                        Event.stop(evt);
                    });

                    $(submitBtn).observe("click", function(evt){
                        submitFunction();
                        postEdit();
                        $(submitBtn).stopObserving('click');
                        dialogs.popup.hide(dialog);
                        Event.stop(evt);
                    });

                    $(dialogInput).observe("key:enter", function(evt){
                        submitFunction();
                        postEdit();
                        $(submitBtn).stopObserving('click');
                        $(dialogInput).stopObserving('key:enter');
                        dialogs.popup.hide(dialog);
                        Event.stop(evt);
                    });


                    $(dialogInput).observe("keypress", function(evt){
                        evt = (evt) ? evt : window.event;
                        /**
                         * Stop special characters
                         * < : 60
                         * > : 62
                         * & : 38
                         * = : 61
                         */
                        if (type === "legend") {
                            if (evt.keyCode == 62 || evt.keyCode == 60 || evt.keyCode == 38 || evt.keyCode == 61 ||
                                    evt.charCode == 62 || evt.charCode == 60 || evt.charCode == 38 || evt.charCode == 61) {
                                //                                console.log(String.fromCharCode(evt.charCode));
                                //                                console.log(evt.keyCode);
                                Event.stop(evt);
                            }
                        }
                    });

                    dialogs.popup.show(dialog, true);

                    var DELAY_COMPONENT_AVALIABLE = 500;
                    var focusDialog = function(){
                        dialogInput.focus();
                        dialogInput.select();
                    };
                    if (isIE8()){
                        setTimeout(focusDialog, DELAY_COMPONENT_AVALIABLE);
                    }else{
                        focusDialog();
                    }
                }
            }
        }
    },
    /**
     * Used to edit the report title
     */
    editReportTitle : function(evt) {
        this.editDataHeader(titleCaption, "title");

    },

    /**
     * Used to revert from input to regular span
     */
    returnToNormalReportTitle : function(evt) {
        evt = (evt) ? evt : window.event;
        if(evt.keyCode == Event.KEY_ESC){
            adhocDesigner.revertToBackHeaderTitle();
        }else{
            if(editor){
                editor.makeNonEditable(true);
                var title = editor.elem.innerHTML;
                editor = null;
                adhocDesigner.updateReportTitle(title);
                adhocDesigner.initPreventBrowserSelection($("designer"));
            }
        }
    },

    /**
     * header revert
     */
    revertToBackHeaderTitle : function() {
        if (editor) {
            editor.revertEdit();
            editor = null;
            adhocDesigner.initPreventBrowserSelection($("designer"));
        }
    },


    editLegendLabel : function(){
        if(selObjects.length == 1){
            var selectedMeasure = designerBase.getSelectedObject();
            var selectedMeasureDiv = $(selectedMeasure.id);
            if(selectedMeasureDiv){
                adhocDesigner.editDataHeader(selectedMeasureDiv, "legend");
            }
        }

    },


    selectAndEditLabel : function(index){
        var selectedObject = null;
        var overlayObject = $("legendOverlay_" + index);
        if(overlayObject){
            selectedObject = {
                id : overlayObject.identify(),
                legendName : overlayObject.readAttribute("data-legendName"),
                index : overlayObject.readAttribute("data-index"),
                defaultName : overlayObject.readAttribute("data-defaultName"),
                userName : overlayObject.readAttribute("data-userName")
            };

            //deselect all selected legend overlays
            designerBase.unSelectAll();
            localContext.deselectAllSelectedOverlays();
            designerBase.addToSelected(selectedObject);
            buttonManager.select(overlayObject);
            adhocDesigner.editLegendLabel();
        }
    },

    /**
     * Add label to deleted column
     */
    addColumnLabel : function(){
        if(selObjects.length == 1){
            var selectedColumn = designerBase.getSelectedObject();
            var headerCell = selectedColumn.header;
            if(headerCell.hasClassName("deletedHeader")){
                adhocDesigner.editDataHeader(headerCell, "column", "add");
            }
        }
    },

    /**
     * Used to edit column label
     */
    editColumnLabel : function(){
        if(selObjects.length == 1){
            var selectedColumn = designerBase.getSelectedObject();
            var headerCell = selectedColumn.header;
            adhocDesigner.editDataHeader(headerCell, "column", "edit");
        }
    },

    /**
     * Delete column header
     */
    deleteColumnLabel : function(){
        if(selObjects.length == 1){
            var selectedColumn = designerBase.getSelectedObject();
            var headerCell = selectedColumn.header;
            if(!headerCell.hasClassName("deletedHeader")){
                headerCell.addClassName("deletedHeader");
                headerCell.innerHTML = headerCell.readAttribute("data-fieldName");
            }
            localContext.removeColumnHeaderRequest();
        }
    },

    deleteGroupLabel : function(){
        localContext.removeGroupLabel();
    },

    addGroupLabel : function(){
        localContext.editGroupLabel();
    },

    editGroupLabel : function(){
        localContext.editGroupLabel();
    },

    /**
     * Used to get the report orientation
     */
    getOrientation : function() {
        return $(adhocDesigner.CANVAS_METADATA_ID).getAttribute("data-orientation");
    },

    /**
     * Used to test orientation equality
     * @param thisValue
     */
    orientationEquals : function(thisValue) {
        return (adhocDesigner.getOrientation() == thisValue);
    },

    /**
     * Used to get paper size
     */
    getPaperSize : function() {
        return $(adhocDesigner.CANVAS_METADATA_ID).getAttribute("data-size");
    },

    /**
     * Used to test for paper size equality
     * @param thisValue
     */
    paperSizeEquals : function(thisValue) {
        return adhocDesigner.getPaperSize() == thisValue;
    },

    /**
     * Used to set paper size for report
     * @param size
     * @param event
     */
    paperSizeSelected : function(size, event) {
        adhocDesigner.setPaperSize(size);
        designerBase.unSelectAll(event);
    },

    togglePagePropsRoller : function() {
        selectionObject.pagePropsRollDown = !selectionObject.pagePropsRollDown;
    },

    setFieldValuesOnColumnSelection : function() {

    },

    setFieldValuesOnGroupSelection : function() {

    },

    /**
     * Used to edit report orientation
     * @param orientation
     * @param event
     */
    orientationSelected : function(orientation, event) {
        adhocDesigner.setPageOrientation(orientation);
        designerBase.unSelectAll();
    },

    /**
     * Used to enable undo/redo buttons
     */
    enableCanUndoRedo : function(){
        if (exists(toolbarButtonModule) && localContext.inDesignView) {
            toolbarButtonModule.setButtonState($('undo'), localContext.canUndo);
            toolbarButtonModule.setButtonState($('redo'), localContext.canRedo);
            toolbarButtonModule.setButtonState($('undoAll'), localContext.canUndo);
        }
    },

    /**
     * Used to enable export and save buttons
     * @param isEnabled
     */
    enableRunAndSave : function(isEnabled){
        if (exists(toolbarButtonModule) && localContext.inDesignView) {
            toolbarButtonModule.setButtonState($('save'), isEnabled);
            toolbarButtonModule.setButtonState($('execute'), isEnabled);
        }
        canRunAndSave = isEnabled;
    },

    /**
     * Used to load js files dynamically..
     * @param mode
     */
    loadJSFilesFor : function(mode) {
        var scriptLibraries = scriptLibrayMap[mode];
        loadJSFiles(scriptLibraries);
    },

    /**
     * Used to load js files dynamically
     */
    loadCurrentJSFiles : function(){
        loadJSFiles(localContext.viewSpecificJSFiles);
    },

    /**
     * Used to load css files dynamically
     */
    loadCurrentCSSFiles : function(){
        loadCSSFiles(localContext.viewSpecificCSSFiles, true);
    },

    /**
     * Used to unload css files
     */
    unloadCurrentCSSFiles : function(){
        unloadCSSFiles(localContext.viewSpecificCSSFiles);
    },

    /**
     * Used to add fields to the canvas
     * @param event
     */
    addFieldToCanvas : function(event){
        if(localContext.getMode() === designerBase.TABLE){
            localContext.addFieldAsColumn();
        }else if(localContext.getMode() === designerBase.CROSSTAB){
            localContext.addFieldAsLastMeasure();
        }else if(localContext.getMode() === designerBase.CHART){
            localContext.addFieldAsMeasure();
        }
    },

    /**
     * Used to get the selected nodes name
     */
    getNameForSelectedTreeNode : function() {
    	var so = designerBase.getSelectedObject();
        return so ? so.param.id : '';
    },

    getSelectedColumnOrGroup : function(){
        return selObjects[0];
    },

    /**
     * Used to get the name of a field from the selected object
     * @param object
     */
    getNameForSelected : function(object) {
        if(selectionCategory.area === designerBase.AVAILABLE_FIELDS_AREA){
            return object ? object.param.id : '';
        }else if(object.chartMeasureId){
            return object.chartMeasureId;
        }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
            return object.header.getAttribute('data-fieldName');
        }else if(selectionCategory.area === designerBase.GROUP_LEVEL){
            return object.fieldName;
        }else if(selectionCategory.area === designerBase.ROW_GROUP_MENU_LEVEL || selectionCategory.area === designerBase.COLUMN_GROUP_MENU_LEVEL){
            return object.name;
        }else if(selectionCategory.area === designerBase.SUMMARY_LEVEL) {
            return object.readAttribute('data-fieldName');
        }else if(selectionCategory.area === designerBase.LEGEND_MENU_LEVEL) {
            return object.legendName;
        }
    },

    /**
     * Gets selected nodes from available tree
     */
    getSelectedTreeNodes : function(){
        return adhocDesigner.dimensionsTree.selectedNodes.length > 0
            ? adhocDesigner.dimensionsTree.selectedNodes
            : adhocDesigner.measuresTree.selectedNodes;
    },

    /**
     * Get the field name of a selected object
     */
    getFieldName : function(){
        var so = designerBase.getSelectedObject();
        return so ? this.getNameForSelected(so) : '';
    },

    launchDialogMenu : function(){
        adhocControls.launchDialog();
    },

    /**
     * Find the field by its name
     * @param fieldName
     */
    findFieldByName : function(fieldName) {
        var node = null;
        if(localContext.allColumns){
            localContext.allColumns.each(function(field){
                if(field.name){
                    if(field.name == fieldName){
                        node = field;
                        throw $break;
                    }
                }
            });
        }

        return node;
    },

    /**
     * Find the field index based on the field name
     * @param fieldName
     */
    getFieldIndexByName : function(fieldName) {
        if(isNotNullORUndefined(localContext.allColumns)){
            var size = localContext.allColumns.length;
            for (var i = 0; i < size; i++) {
                var f = localContext.allColumns[i];
                if (f.name == fieldName) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * Get all leaves of a node
     * @param node
     */
    getAllLeaves : function(node, tree){
        var leaves = arguments[2] || [];
        if(!node){
            if(!tree){
                return leaves;
            }
            node = tree.getRootNode();
            if (!node) return leaves;
        }
        
        if (!node.hasChilds()) {
            leaves.push(node);
            return  leaves;
        }
        for (var i = 0; i < node.childs.length; i++) {
            this.getAllLeaves(node.childs[i], null, leaves);
        }
        return leaves;
    },

    getFirstLeaf : function(node) {
        if (!node) return null;
        var leaf = node;
        if (!node.childs || node.childs.length === 0) {
            return leaf;
        }
        for (var i = 0; i < node.childs.length; i++) {
            leaf = this.getFirstLeaf(node.childs[i]);
            if (leaf) {
                return leaf;
            }
        }
    },

    /**
     * Get all the folders in the available fields tree
     * @param node
     */
    getAllAvailableFolders : function(node) {
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
    },

    collectFields: function(nodes, includeSubSets, testFn){
        var fieldNames = [];
        for(var index = 0; index < nodes.length; index++){
            var node = nodes[index];
            if(node.isParent() && includeSubSets){
                fieldNames = fieldNames.concat(this.collectFields(node.childs, includeSubSets, testFn));
            }else{
                if (testFn) {
                    testFn(node.param.id) && fieldNames.push(node.param.id);
                } else {
                    fieldNames.push(node.param.id);
                }
            }
        }

        return fieldNames;
    },

    /**
     * Used to launch the create calculated field dialog
     */
    createCalculatedField : function(){
        adhocCalculatedFields.launchDialog();
    },

    /**
     * Used to launch the update calculated field dialog
     */
    editCalculatedField : function(){
        adhocCalculatedFields.launchDialog(true);
    },

    /**
     * Used to delete a calculated field
     */
    deleteCalculatedField : function(){
        adhocCalculatedFields.deleteField();
    },

    /**
     * Used to launch the sort dialog
     */
    sort : function(){
        adhocSort.launchDialog();
    },

    /**
     * Used to change adhoc theme
     */
    showAdhocThemePane : function(){
        var themePane = $("selectPalette");
        dialogs.popup.show(themePane);
        //little hack, hehehe
        $(themePane).setStyle({"zIndex": 2000});
        adhocDesigner.observeThemeEvents();
    },

    observeThemeEvents : function(){
        Event.observe($("themeDialogClose"), "click", function(event){
            adhocDesigner.closeApplyAdhocTheme();
            Event.stop(event);
        });


        Event.observe($("selectPalette"), "mouseup", function(event){
            var themeParent = $$("#selectPalette ul.list.palette")[0];
            if(themeParent){
                adhocDesigner.applyAdhocTheme(event, themeParent);
            }
        });
    },

    /**
     * Stop observing events for save dialog
     */
    stopObservingThemeEvents : function(){
        Event.stopObserving($("themeDialogClose"), 'click', adhocDesigner.applyAdhocTheme);
    },

    applyAdhocTheme : function(evt, themeParent){
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
    },

    closeApplyAdhocTheme : function(){
        adhocDesigner.hideAdhocThemePane();
    },

    hideAdhocThemePane : function(){
        var themePane = $("selectPalette");
        adhocDesigner.stopObservingThemeEvents();
        dialogs.popup.hide(themePane);
    },

    showAvailableFieldsMenu : function(event){
        actionModel.showDynamicMenu("availableFieldsMenu", event, null, null, this.ACTION_MODEL_TAG);
        //clone the position and modify the menu position.
        $("menu").clonePosition($('availableFieldsMutton'), {"setWidth" : false, "setHeight": false, "offsetTop" : 5});
        Event.stop(event);
        //commented due to #21341
        //$('frame').stopObserving('mouseover').observe('mouseover', function(event) {
            //this.showButtonMenuMouseOut($('frame'));
        //}.bind(this));
        Event.observe($('menu'), 'mouseleave', function() {
            this.showButtonMenuMouseOut($('menu'));
        }.bind(this));
    },

    /**
     * Used to show the menu for a filter pod
     * @param event
     */
    showFilterPanelMenu : function(event){
        var offset = $('filterPanelMutton').cumulativeOffset();
        var offsetScroll = $('filterPanelMutton').cumulativeScrollOffset();
        var topOffset = offset["top"] - offsetScroll["top"];
        var coordinates = {"menuTop": topOffset + 5};
        actionModel.showDynamicMenu("filterPanelMenu", event, toolbarButtonModule.TOOLBAR_MENU_CLASS, coordinates, this.ACTION_MODEL_TAG);
        Event.stop(event);
        Event.observe($('menu'), 'mouseleave', function() {
            this.showButtonMenuMouseOut($('menu'));
        }.bind(this));
    },

    showButtonMenuMouseOut : function(object){
        actionModel.hideMenu();
        Event.stopObserving($(object), 'mouseleave', adhocDesigner.showButtonMenuMouseOut);
    },

    /**
     * Used to update a calculated fields css leaf's
     */
    updateAllFieldLabels : function(){

        var updateLabels = function(tree) {
            var leaves = this.getAllLeaves(null, tree);
            leaves.each(function(leaf) {
                var isCustomField = adhocCalculatedFields.isCustomField(leaf);
                if (isCustomField) {
                    var customField = this.findFieldByName(leaf.param.id);
                    if (customField) {
                        leaf.name = customField.label;
                        leaf.param.label = customField.label;
                        if (this.isInUse(leaf.param.id)) {
                            leaf.param.cssClass = 'calculatedField dependency';
                        } else {
                            leaf.param.cssClass = 'calculatedField';
                        }
                        leaf.refreshStyle();
                    }
                }
            }.bind(adhocDesigner));

            tree.renderTree();
        }.bind(this);

        $(this.DIMENSIONS_TREE_DOM_ID) && this.dimensionsTree && updateLabels(this.dimensionsTree);
        $(this.MEASURES_TREE_DOM_ID) && this.measuresTree && updateLabels(this.measuresTree);
    },

    /**
     * Used to resize a table column
     * @param evt
     * @param selectArea
     */
    resizeColumn : function(sizerElement, selectArea, index){
        if(selectArea === designerBase.TABLE_SELECT_AREA){
            localContext.tableColumnResize(sizerElement, index);
        }
    },

    reInitFilterEvents : function(){
        evaluateScript('calendar');
        adHocFilterModule.initialize();
    },

    /**
     * Method to enable switch mode
     * @param requestedMode
     * @param undoOrRedo
     */
    switchMode : function(requestedMode, undoOrRedo){
        var mode = getTextBeforeUnderscore(requestedMode);
        var newLoc = 'flow.html?_flowId=adhocFlow' +
                '&_eventId=switchMode' +
                '&_mode=' +
                mode +
                '&_flowExecutionKey=' +
                flowExecutionKey;
        //remove common event listeners for all designer modes
        adhocDesigner.removeObservers();

        if (!localContext.inDesignView) {
            newLoc += "&viewReport=true";
        }

        if (undoOrRedo) {
            newLoc += "&undoOrRedo=" + undoOrRedo;
        }else{
            //remove specific listeners for current designer mode
            localContext.removeObservers();
        }

        var switchModeCallback = function(){
            //need to use global variable here
            //because viewType probably can be checked before
            //baseState of localContext is actually initialized
            window.viewType = mode;
			primaryNavModule.initializeNavigation();
            this.updateBaseState();
            this.loadCurrentJSFiles();
            layoutModule.initialize();
            this.reInitFilterEvents();
            layoutModule.fixNavigation();
        }.bind(this);

        //make request
        ajaxClobberredUpdate(newLoc, { callback: switchModeCallback});
    },

    /**
     * Used to check if a string is a valid number
     * @param number
     */
    isValidNumericValue : function(number){
        var numberOfDecimalsPoints = 0;
        var indexOfDecimal = -1;
        var isValid = false;

        if (number.length > 0) {
            for (var index = 0; index < number.length; index++) {
                var character = number.charAt(index);
                if (isNaN(character) && (character === "," || character === ".")) {
                    numberOfDecimalsPoints++;
                    indexOfDecimal = index;
                }
            }

            isValid = !(numberOfDecimalsPoints > 1);
            if ((indexOfDecimal > -1) && isValid) {
                isValid = (indexOfDecimal < (number.length - 1));
            }
        }

        return {
            isValid: isValid,
            errorMessage: adHocFilterModule.ERROR_MESSAGE
        };
    },

    moveToDimensions: function () {
        if (selObjects.first()) {
            var nodes = selObjects.clone();
            adhocDesigner.moveToMeasuresOrAttributes(nodes);
            var ids = nodes.collect(function(node) {return node.param.id}).join(",");
            adhocDesigner.changeFieldAttributeOrMeasure(ids, "attribute");
        }
    },

    moveToMeasures: function () {
        if (selObjects.first()) {
            var nodes = selObjects.clone();
            adhocDesigner.moveToMeasuresOrAttributes(nodes);
            var ids = nodes.collect(function(node) {return node.param.id}).join(",");
            adhocDesigner.changeFieldAttributeOrMeasure(ids, "measures");
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Conditional tests
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Check to see if the currently selected node is selected
     * @param object item we are checking
     */
    isSelectedNode : function(node){
        if (!node || !node.getTreeId) {
            return null;
        }

        var tree = dynamicTree.trees[node.getTreeId()];
        return tree.isNodeSelected(node);
    },

    /**
     * Helper to check if item is already selected
     * @param obj
     */
    isAlreadySelected : function(obj){
        return designerBase.isInSelection(obj);
    },

    /**
     * Used to determine if clicked was meant to be for multiselect
     * @param event
     * @param area
     */
    isMultiSelect : function(event, area){
        var metaKey = isMetaHeld(event);
        var shiftKey = isShiftHeld(event);
        var section = selectionCategory.area == area;

        if(selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA){
            return (section && (metaKey || shiftKey));
        }else{
            return (section && metaKey);
        }
    },

    /**
     * Used to determine if a node is a leaf or not
     */
    isSelectedTreeNodeAFolder : function(){ 
    	var so = designerBase.getSelectedObject();
    	return so ? so.hasChilds() : true;
    	/**
    	 * Returning true on null to satisfy calling function: canAddAsGroup.
    	 */
    },

    /**
     * Used to determine if all selected nodes are leafs
     */
    isOnlyFieldsSelected : function(){

        var detectParentNodes = function(node) {
            return node.hasChilds()
        };

        return this.getSelectedTreeNodes().detect(detectParentNodes) == null;
    },

    /**
     * Used to determine if a selected object is a percent based calculated field
     */
    isPercentOfParentCalcSelected : function(object) {
        if(!object){
            object = designerBase.getSelectedObject();
        }
        if(object){
            var fieldName = adhocDesigner.getNameForSelected(object);
            return adhocDesigner.isPercentOfParentCalc(fieldName);
        }
        return false;
    },


    /**
     * Tests to see if field is a percent of parent calc.
     * @param fieldName
     */
    isPercentOfParentCalc : function(fieldName){
        var field = adhocDesigner.findFieldByName(fieldName);
        if (field != null && field.formulaRef != null) {
            var args = field.formulaRef.args;
            if (args != null && args.length > 0) {
                return args[0]['percentOfParent']==='true';
            }
        }
        return false;
    },



    /**
     * Used to determine if a single field is selected
     */
    isSingleFieldSelected : function(){
        return (designerBase.getSelectedObject().length == 1);
    },




    /**
     * Check if field is used as a column
     * @param name
     */
    isInColumns : function(name) {
        for (var i = 0; i < columns.length; i ++) {
            if (name == columns[i]) {
                return true;
            }
        }

        return false;
    },


    /**
     * Check if field is used as a group
     * @param name
     */
    isInGroups : function(name) {
        for (var i = 0; i < groups.length; i ++) {
            if (name == groups[i]) {
                return true;
            }
        }

        return false;
    },


    /**
     * Test to see if the edit menu is allowed
     */
    isEditMenuAllowed : function(){
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
    },



    /**
     * Check if selected fields are numeric
     */
    checkIfAllSelectedAreNumeric : function(){
        var fieldName = null;
        var selected = null;

        for (var index = 0; index < selObjects.length; index++){
            selected = selObjects[index];
            if(selected){
                if(selectionCategory.area === designerBase.AVAILABLE_FIELDS_AREA){
                    fieldName = selected.param.id;
                }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
                    fieldName = selected.header.getAttribute('data-fieldName');
                }else{
                    //must be table group, crosstab or chart//todo work in progress
                }
                if (!adhocDesigner.checkIfFieldIsNumeric(fieldName)) {
                    return false;
                }	
            }
        }
        return true;
    },





    /**
     * Check if field is numeric
     * @param fieldName
     */
    checkIfFieldIsNumeric : function(fieldName) {
        var col = adhocDesigner.findFieldByName(fieldName);
        return (col != null) && (col.type == 'Numeric');
    },



    /**
     * Check to see if the field is currently in use
     * @param fieldName
     */
    isInUse : function(fieldName) {
        var inUse = false;
        if (localContext.fieldsInUse != null) {
            for (var i = 0; i < localContext.fieldsInUse.length; i++) {
                if (localContext.fieldsInUse[i] == fieldName) {
                    inUse = true;
                    break;
                }
            }
        }
        inUse = (inUse || adhocDesigner.hasDependencyOnIt(fieldName));
        return inUse;
    },

    isUsedInRowsOrColumns: function(fieldName) {
        return localContext.fieldsInUse && localContext.fieldsInUse.find(function(field) {
            return field === fieldName;
        });
    },

    /**
     * Update fields in use.
     * @param fieldName
     */
    updateFieldsInUse : function(fieldName){
        for(var i = 0; i < fieldName.length; i++){
            localContext.fieldsInUse.push(fieldName[i]);
        }
    },



    /**
     * Check to see if the field has a dependency in another calculated field
     * @param fieldName
     */
    hasDependencyOnIt : function(fieldName) {
        if (localContext.allColumns != null && localContext.allColumns.length != null) {
            for (var i = 0; i < localContext.allColumns.length; i++) {
                var f = localContext.allColumns[i];
                if (f.formulaRef != null) {
                    var args = f.formulaRef.args;
                    if (args != null && args.length > 0) {
                        for (var j = 0; j < args.length; j++) {
                            //TODO IE8: shouldn't have to do first check but IE8 seems to add extra array length from JSON
                            if (args[j] && (args[j].fieldRef == fieldName)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    },


    /**
     * Check to see if field is used as a group
     * @param fieldName
     */
    isUsedAsGroup : function(fieldName) {
        var inUse = false;
        if (localContext.groups != null) {
            for (var i = 0; i < localContext.groups.length; i++) {
                if (localContext.groups[i] == fieldName) {
                    inUse = true;
                    break;
                }
            }
        }
        return inUse;
    },


    /**
     * Check to see if the delete option is allowed
     */
    isDeleteAllowed : function() {
        if (selObjects.length != 1) {
            return false;
        }
        var fieldName = designerBase.getSelectedObject() ? designerBase.getSelectedObject().param.id : null;
        var field = adhocDesigner.findFieldByName(fieldName);
        return field != null && field.formulaRef != null && !adhocDesigner.isInUse(fieldName);
    },


    /**
     * Check if the field is date type
     * @param fieldName
     */
    checkIfFieldIsDateType : function(fieldName){
        var col = adhocDesigner.findFieldByName(fieldName);
        return (col != null) && (col.type == 'Date');
    },


    /**
     * Check if selected types are date types
     */
    checkIfSelectedAreDateTypes : function(){
        if(selObjects.length == 2){
            var field1 = null;
            var field2 = null;
            var obj1 = null;
            var obj2 = null;
            if(selectionCategory.area === designerBase.AVAILABLE_FIELDS_AREA){
                obj1 = selObjects[0];
                obj2 = selObjects[1];
                field1 = obj1.param.id;
                field2 = obj2.param.id;
            }else if (selectionCategory.area === designerBase.COLUMN_LEVEL){
                obj1 = selObjects[0];
                obj2 = selObjects[1];
                field1 = obj1.header.getAttribute('data-fieldName');
                field2 = obj2.header.getAttribute('data-fieldName');
            }else{
                //crosstab or chart //todo get from overlay.
            }

            return (adhocDesigner.checkIfFieldIsDateType(field1) && adhocDesigner.checkIfFieldIsDateType(field2));
        }else{
            return false;
        }
    },


    /**
     * Test to see if the spacer is in the current selection
     */
    hasSpacerInSelection : function() {
        for (var i = 0; i < selObjects.length; i++) {
            if (adhocDesigner.getNameForSelected(selObjects[i]) === designerBase.SPACER_NAME) {
                return true;
            }
        }
        return false;
    },



    /**
     * Test to see if the current selected object is a spacer
     * @param obj
     */
    isSpacerSelected : function(obj){
        if(obj){
            return (adhocDesigner.getNameForSelected(obj) === designerBase.SPACER_NAME);
        }else{
            return (adhocDesigner.getNameForSelected(selObjects[0]) === designerBase.SPACER_NAME);
        }
    },

    /**
     * Test to see if the current selected object is a constant field
     * @param obj
     */
    isConstantSelected : function(obj){
        if(obj){
            return (adhocDesigner.getNameForSelected(obj).startsWith(constantFieldsLevel + "."));
        }else{
            return (adhocDesigner.getNameForSelected(obj).startsWith(constantFieldsLevel + "."));
        }
    },

    /**
     * Test to see if the current selected object is a constant field
     * @param obj
     */
    isMeasureSelected : function(obj){
        if(obj && obj.menuLevel){
            return obj.menuLevel.startsWith(this.OLAP_MEASURES_TREE);
        }else{
            return false;
        }
    },

    /**
     * Check to see if we have a group object selected
     */
    hasGroupInSelection : function() {
        for (var i = 0; i < selObjects.length; i++) {
            if (adhocDesigner.isUsedAsGroup(adhocDesigner.getNameForSelected(selObjects[i]))) {
                return true;
            }
        }
        return false;
    },


    /**
     * Check if we can present the custom field option
     */
    canCreateCustomFieldOption : function(){
        return (adhocDesigner.checkIfAllSelectedAreNumeric() && !adhocDesigner.isPercentOfParentCalcSelected());
    },



    isSelectFieldsAllowed : function(){
        return (isDomainType);
    },


    canSaveAdhocReport : function(){
        return localContext.canSaveReport();
    },


    canMoveToDimensions: function() {
        var fieldInUse = selObjects.find(function(obj) {
            return obj.param.id === designerBase.SPACER_NAME ||
                !obj.param.extra.isMeasure ||
                adhocDesigner.isUsedInRowsOrColumns(obj.param.extra.id);
        });

        return !fieldInUse;
    },

    canMoveToMeasures: function() {
        var fieldInUse = selObjects.find(function(obj) {
            return obj.param.id === designerBase.SPACER_NAME ||
                obj.param.extra.isMeasure ||
                adhocDesigner.isUsedInRowsOrColumns(obj.param.extra.id);
        });

        return !fieldInUse;
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Ajax calls..
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Used to update the available fields tree in the explorer
     */
    updateAvailableTree : function() {
        var callback = function() {
            //reset trees to nothing.
            this.resetTreeToNothing(this.DIMENSIONS_TREE_DOM_ID);
            this.resetTreeToNothing(this.MEASURES_TREE_DOM_ID);
            this.removeObservers();

            this.updateBaseStateFromAjaxBuffer();
            if (localContext.inDesignView) {
                this.initAvailableFields(true);
            }
        }.bind(this);

        designerBase.sendRequest("co_updateAvailableTree", [], callback, {'target':"ajaxbuffer", 'bpost' :true});
    },

    /**
       * Clear event listeners
    */

    removeObservers : function (){
        Event.stopObserving(document,layoutModule.ELEMENT_CONTEXTMENU, this.getCommonContextMenuObserver());
    },

    updateReportTitle : function(currentTitle) {
        //in-case any html remove them
        currentTitle = currentTitle.replace(/<\/?[^>]+(>|$)/g, "");
        if(currentTitle.blank()){
            adhocDesigner.setReportTitleToNull();
        }else{
            var encTitle = encodeText(currentTitle);
            var callback = function(){
                localContext.standardOpCallback();
            };
            designerBase.sendRequest('co_setTitle', new Array('l='+encTitle),callback, null);
        }
    },

    setReportTitleToNull : function() {
        var callback = function(){
            localContext.standardOpCallback();
        };
        designerBase.sendRequest('co_setTitle',new Array('l=_null'), callback, null);
    },



    toggleTitleBar : function() {
        var callback = function(){
            localContext.standardOpCallback();
        };
        designerBase.sendRequest('co_toggleTitleBar', new Array(), callback, null);
    },



    // set a property on the ad hoc state
    setProperty : function(thisName, thisValue, callback) {
        designerBase.sendRequest('co_setProperty', new Array("name=" + thisName, "value=" + thisValue), callback, null);
    },



    setPageOrientation : function(orientation) {
        var callback = function(){
            localContext.standardOpCallback();
        };
        designerBase.sendRequest('co_setPageOrientation', new Array("o="+orientation), callback, null);
    },



    setFilter : function(filter) {
        var callback = function(){
            localContext.standardOpCallback();
        };
        designerBase.sendRequest('co_setFilter', new Array("testFilter="+filter), callback, null);
    },



    setPaperSize : function(size) {
        var callback = function(){
            localContext.standardOpCallback();
        };
        designerBase.sendRequest('co_setPaperSize', new Array("s="+size), callback, null);
    },



    pivot : function() {
        if (localContext.pivot) {
            localContext.pivot();
            return;
        }

        var callback = function(){
            localContext.getCallbacksForPivot();
        };
        designerBase.sendRequest('co_pivot', new Array(), callback, null);
    },



    undo : function() {
        if (localContext.modeOnUndo && !localContext.modeOnUndo.blank() && (localContext.modeOnUndo != localContext.getMode())) {
            adhocDesigner.switchMode(localContext.modeOnUndo, "undo");
        } else {
            var callback = function(){
                localContext.undoAndRedoCallback ? localContext.undoAndRedoCallback() : this.undoAndRedoCallback();
            }.bind(adhocDesigner);
            designerBase.sendRequest('co_undo', new Array(), callback, null);
        }
    },



    redo : function() {
        if (localContext.modeOnRedo && !localContext.modeOnRedo.blank() && (localContext.modeOnRedo != localContext.getMode())) {
            adhocDesigner.switchMode(localContext.modeOnRedo, "redo");
        } else {
            var callback = function(){
                localContext.undoAndRedoCallback ? localContext.undoAndRedoCallback() : this.undoAndRedoCallback();
            }.bind(adhocDesigner);
            designerBase.sendRequest('co_redo', new Array(), callback, null);
        }
    },



    undoAll : function() {
        if(localContext.undoModeNames[0] !== localContext.getMode()){
            adhocDesigner.switchMode(localContext.undoModeNames[0], "undoAll");
        }else{
            var callback = function(){
                localContext.undoAndRedoCallback ? localContext.undoAndRedoCallback() : this.undoAndRedoCallback();
            }.bind(adhocDesigner);
            designerBase.sendRequest('co_undoAll', new Array(), callback, null);
        }
    },



    toggleAdhocDataSetSize : function(object) {
        var proceed = false;
        var objectId = object.readAttribute("id");

        if(objectId.startsWith("full") && !localContext.isShowingFullData){
            proceed = true;
        }else if(objectId.startsWith("sample") && localContext.isShowingFullData){
            proceed = true;
        }

        if (proceed) {
            this.toggleAdhocDataSetSizeLabel(objectId);
            var callback = function() {
                localContext.standardOpCallback();
                this.checkMaxRowsLimit();
            }.bind(adhocDesigner);
            designerBase.sendRequest('co_toggleAdhocDataSetSize', new Array(), callback, null);
        }
    },


    tryToKeepServerAlive : function(){
        var callback = function(){
            localContext.standardOpCallback();
        };
        designerBase.sendRequest('co_tryToKeepServerAlive', [], callback, null);
    },



    setSorting: function (sortFields, callback){
        localContext.sortFields = sortFields;

        var sortJson = sortFields.toJSON();
        var callbacks = function(){
            localContext.standardTableOpCallback();
            callback();
        };
        designerBase.sendRequest('ta_resort', new Array('so=' + sortJson), callbacks, null);
    },


    toggleAdhocTheme : function(){
        if(localContext.getMode() == designerBase.CHART){
            var callback = function(){
                localContext.standardChartOpCallback();
            };
            designerBase.sendRequest('co_setTheme', new Array('t=' + selectedThemeId), callback, null);
        }else{
            designerBase.sendNonReturningRequest('co_setTheme', new Array('t=' + selectedThemeId), null, null);
            //            localContext.reInitOverlayCallback();
        }
    },

    changeFieldAttributeOrMeasure: function (fieldName, type) {
        var callback = function(){        	
            localContext.standardOpCallback();
        };

        designerBase.sendRequest('co_changeFieldAttributeOrMeasure', new Array('name=' + encodeText(fieldName), 'type=' + type), callback, null);
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Ajax callbacks..
    //////////////////////////////////////////////////////////////////////////////////


    // update available tree also (re-entrance)
    undoAndRedoCallback : function() {
        this.updateAvailableTree();
        adHocFilterModule.resetFilterPanel();
        adHocFilterModule.updateFilterPodsState();
        localContext.standardOpCallback();
        this.updateAdhocDataSize();
    },

    updateAdhocDataSize : function(){
        if (localContext.getMode() != designerBase.CHART && localContext.getMode() != designerBase.OLAP_CROSSTAB) {
            if (localContext.isShowingFullData) {
                $("full-data").addClassName("selected");
                $("sample-data").removeClassName("selected");
            } else {
                $("full-data").removeClassName("selected");
                $("sample-data").addClassName("selected");
            }
        }
    },


    ///////////////////////////////////////////////////////////////////////////////////
    // Toolbar actions
    //////////////////////////////////////////////////////////////////////////////////

    /**
     * Used to go to presentation mode
     */
    goToPresentationView  : function(evt){
        adhocDesigner.isDesignViewMode = false;
        //disable button so subsequent clicks don't work
        buttonManager.disable($("presentation"));
        var currentURL = document.location.href;
        // fix for #22861.
        if(currentURL.charAt(currentURL.length-1) == "#" ) {
            currentURL = currentURL.substring(0, currentURL.length-1);
        }
        //purge any old view report param
        var viewReportParamRegex = new RegExp("&viewReport=[^&]+");
        var viewReportParam = currentURL.match(viewReportParamRegex) || (currentURL.include("&viewReport=") ? "&viewReport=" : null);
        if (viewReportParam) {
            currentURL = currentURL.replace(viewReportParam, '');
        }
        var paramString = "viewReport=true&fromDesigner=true";
        //post (url might be long)

        //clean listeners
        adhocDesigner.removeObservers();
        localContext.removeObservers();

        var callbacks = function(){
            this.updateBaseState();
            this.loadCurrentCSSFiles();
            this.loadCurrentJSFiles();
            initModule.pageInit();
            this.reInitFilterEvents();
            this.checkMaxRowsLimit();
        }.bind(adhocDesigner);
        ajaxClobberredUpdate(currentURL, {callback:callbacks, postData: paramString});
    },


    /**
     * Used to go to Design mode
     */
    goToDesignView : function(evt){
        adhocDesigner.isDesignViewMode = true;
        //disable button so subsequent clicks don't work
        buttonManager.disable($("explorer"));
        var currentURL = document.location.href;
        // fix for #22861.
        if(currentURL.charAt(currentURL.length-1) == "#" ) {
            currentURL = currentURL.substring(0, currentURL.length-1);
        }
        var newLoc = currentURL.replace("&viewReport=true","");

        //clean listeners
        adhocDesigner.removeObservers();
        localContext.removeObservers();

        var callbacks = function(){
            this.updateBaseState();
            this.loadCurrentCSSFiles();
            this.loadCurrentJSFiles();
            initModule.pageInit();
            this.reInitFilterEvents();
        }.bind(adhocDesigner);
        //post (url might be long)
        ajaxClobberredUpdate(newLoc, {callback:callbacks, postData:AjaxRequester.prototype.DUMMY_POST_PARAM});
    },


    // save in a temp location, then when your call returns, launch a new window to view the report
    // the saveTemp method will put the ARU path in the session
    // NOTE: this runs the report in a window named "jr". The first time you run a report it should open a new window,
    // but the next time, it will reuse that window.
    // There was a bug where if you used the window named "jr", the report would show up in
    // the current window but there was no way to get back.
    // I`m fixing this by forcing the current window to have a blank name.
    // Nothing except this code relies upon window names, but it might be confusing if someone does
    saveAndRun : function() {    	
        windowPopUp = window.open("", "jr");      
        buttonManager.disable($("execute"));
        
        var callback = function() {
            localContext.standardOpCallback();
            adhocDesigner.updateBaseState();            
            windowPopUp.location  = 'flow.html?_flowId=viewAdhocReportFlow&clientKey=' + clientKey + "&reportUnit=" + localContext.tempAruName + "&noReturn=true";                       
            /*
            var executedReport = function(){
                windowPopUp = window.open(flowUrl, "jr");              
            };
            setTimeout(executedReport, 20);
            */
        };
        designerBase.sendRequest('co_saveTemp', new Array(), callback, null);
    },

    /**
     * Used to return to adhoc start page
     * @param mode
     */
    goToTopicView : function(mode){
        location.href = 'flow.html?_flowId=adhocFlow&_mode=' + mode +
                '&launchType=' + localContext.launchType +
                '&alreadyEditing=true';
    },

    /**
     * Used to launch re-entrance dialog
     */
    selectFields : function(){
        adhocReentrance.launchDialog();
    },


    /**
     * Used to toggle between sample and full data size
     * @param objectId
     */
    toggleAdhocDataSetSizeLabel : function(objectId){
        $$('#dataMode > li').each(function(object){
            if($(object).hasClassName("selected")){
                object.removeClassName("selected");
            }
        });
        $(objectId).addClassName("selected");
    },


    cancelAdHoc : function() {
        if (exists(localContext.isDashboard) && localContext.isDashboard) {
            gotoDefaultLocation();
            return;
        }
        if (usingAdhocLauncher&&(usingAdhocLauncher!='')) {
            history.back();
        } else {
            this.redirectToTopicPage();
        }
    },

    cancelTopic : function(isAlreadyEditing) {
        if(isAlreadyEditing){
            history.back();
        }else{
            designerBase.redirectToHomePage();
        }
    },




    addFilterViaDragNDrop : function(){
        if(adHocFilterModule.canShowFilterOption()){
            adHocFilterModule.addFilterPods(false);
        }else{
            adhocDesigner._cannotAddFilterMessage();
        }
    },


    /**
     * system confirm for already added clickable frame
     */
    _cannotAddFilterMessage : function(){
        dialogs.systemConfirm.show(addFilterErrorMessage, 5000);
    },


    generalDesignerCallback : function(){
        localContext.initAll();
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Utility methods
    //////////////////////////////////////////////////////////////////////////////////

     // if measures tree passed
     // dimensions tree will be returned
     // else - measures tree
    getDifferrentTree: function(tree) {
        if (!tree) {
            return null
        }

        if (tree == adhocDesigner.dimensionsTree) {
            return adhocDesigner.measuresTree;
        } else if (tree == adhocDesigner.measuresTree) {
            return adhocDesigner.dimensionsTree;
        }

        return null;
    },

    resetTreeToNothing: function(treeId) {
        if ($(treeId)) {
            var children = $(treeId).childElements();
            children.each(function(object){object.remove();});
        }
    },

    resetScroll: function() {
        this._touchController && this._touchController.reset();
    },

    isResizing: function() {
        return isNotNullORUndefined(localContext.resizedObject);
    },

    ///////////////////////////////////////////////////////////
    // Utilities for copying nodes from one tree to another
    ///////////////////////////////////////////////////////////

    metaNodeBuilder: function(node, isMeasure) {
        var metaNode = {
            id: node.param.id,
            label: node.name,
            type: node.param.type,
            uri: node.param.uri,
            order: node.orderNumber
        };

        if (node.param.extra) {
            var extra = Object.extend({}, node.param.extra);
            metaNode.extra =  Object.extend(extra, {
                id: node.param.id,
                isMeasure: isMeasure,
                dimensionId: isMeasure ? adhocDesigner.MEASURES : node.param.id
            })
        }

        return metaNode;
    },

    markNodeAsLoaded: function (node) {
        node.isloaded = true;
        if (node.isParent()) {
            node.childs.each(function(child) {
                adhocDesigner.markNodeAsLoaded(child);
            })
        }
    },

     mergeToDestTree: function (node, existingParent) {
        if (!existingParent) {
            return;
        }

        var tree = dynamicTree.trees[existingParent.getTreeId()];

        var existingNode = tree.findNodeChildByMetaName(existingParent, node.param.id);

        if (existingNode != null) {
            if (node.hasChilds()) {
                node.childs.each(function(child) {
                    adhocDesigner.mergeToDestTree(child, existingNode);
                });
            }
        } else {
            adhocDesigner.markNodeAsLoaded(node);
            existingParent.addChild(node);
        }
    },

    copyParentStructure: function(sourceNode, destTree) {
        if (sourceNode && destTree) {

            var sourceTree = dynamicTree.trees[sourceNode.getTreeId()];
            var isMeasure = (destTree === adhocDesigner.measuresTree);

            var metanodeBuilder = localContext.metaNodeBuilder ? localContext.metaNodeBuilder : adhocDesigner.metaNodeBuilder;
            var destNode = destTree.processNode(metanodeBuilder(sourceNode, isMeasure));

            var sourceNodeParent = sourceNode.parent;
            var destParent = null;

            while (sourceNodeParent && sourceNodeParent != sourceTree.getRootNode()) {
                destParent = destTree.processNode(metanodeBuilder(sourceNodeParent, isMeasure));
                destParent.addChild(destNode);
                destNode = destParent;
                sourceNodeParent = sourceNodeParent.parent;
            }

            return destNode;
        }
    },

    moveToMeasuresOrAttributes: function(node){
        if (!node) {
            return;
        }

        var nodes = Object.isArray(node) ? node : [node];
        node = nodes.first();

        var srcTree = dynamicTree.trees[node.getTreeId()];
        var destTree = adhocDesigner.getDifferrentTree(srcTree);

        nodes.each(function(node) {
            var copiedNodeStructure = adhocDesigner.copyParentStructure(node, destTree);
            adhocDesigner.mergeToDestTree(copiedNodeStructure, destTree.getRootNode());

            var nodeParent = node;
            while (nodeParent != srcTree.getRootNode() && nodeParent.childs.length == 0) {
                var parent = nodeParent.parent;
                parent.removeChild(nodeParent);
                nodeParent = parent;
            }
        });


        destTree.resortTree();
        destTree.renderTree();
        destTree.openAndSelectNode(node.param.uri);
    }
};

