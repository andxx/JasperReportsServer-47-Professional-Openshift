/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var AdHocCrosstab = function() {
    ///////////////////////////////////////////////////
    // Private variables...
    ///////////////////////////////////////////////////

//    this.DRILL_THROUGH_PATTERN = "tbody#detailRows tr td.value.summary a.wrap";
    this.DRILL_THROUGH_PATTERN = "tbody#detailRows tr td.value span";
    this.ROW_GROUP_MEMBER_PATTERN = "tbody#detailRows tr td.member";
    this.COLUMN_GROUP_MEMBER_PATTERN = "thead#headerAxis th.member";
    this.GROUP_LEVEL_PATTERN = "thead#headerAxis tr th.level";
    this.MEASURE_PATTERN = "table#canvasTable .measure";
    this.GROUP_MEMBER_DISCLOSURE_PATTERN = ".olap span.button.disclosure";
    this.GROUP_LEVEL_DISCLOSURE_PATTERN = "th.level span.button.disclosure";
    this.MEASURE_SORT_ICON_PATTERN = [
        ".olap .measure .icon.descending",
        ".olap .measure .icon.ascending",
        ".olap .measure .icon.natural"
    ];
    this.MEASURE_LABEL_PATTERN = "#measureLabel.label.measure UL.measures LI.leaf a span.xm";
    this.XTAB_LABEL_PATTERN ="th.label.group";

    this.ROW_GROUP_OVERFLOW_PATTERN = "td.rowOverflow";
    this.COLGROUP_GROUP_OVERFLOW_PATTERN = "th.colOverflow";

    this.COLGROUP_PLACEHOLDER = "th#columnGroupsPlaceHolder";
    this.ROW_GROUP_PLACEHOLDER = "td#rowGroupsPlaceHolder";
    this.MEASURES_PLACEHOLDER = "td#measuresPlaceHolder";
    this.TREE_CONTEXT_MENU_PATTERN = [
        'ul#dimensionsTree li.leaf .button',
        'ul#dimensionsTree li.node .button',
        'ul#measuresTree li.leaf .button',
        'ul#measuresTree li.node .button'];

    // Display Manager constants
    this.DISPLAY_MANAGER_PANEL_ID = "displayManagerPanel";
    this.SHOWING_DISPLAY_MANAGER_CLASS = "showingDisplayManager";
    this.MAIN_PANEL_ID = "OLAP";
    this.OLAP_COLUMNS_ID = "olap_columns";
    this.OLAP_ROWS_ID = "olap_rows";
    this.DM_AXIS_LIST_PATTERN = 'ul.tokens.sortable';

    this.OLAP_MEASURES_LEVEL_NAME = "MeasuresLevel";
    this.NULL_DIMENSION = "NULL Dimension";

    // actionModel context ids
    this.CUBE_CONTEXT = 'availableFieldsMenu';
    this.DIMENSION_TREE_DIMENSION_CONTEXT = "dimensionsTree_dimension";
    this.DIMENSION_TREE_LEVEL_CONTEXT = "dimensionsTree_level";
    this.MEASURE_TREE_GROUP_CONTEXT = "measuresTree_group";
    this.MEASURE_TREE_CONTEXT = "measuresTree";
    this.DISPLAY_MANAGER_ROW_CONTEXT = "displayManagerRow";
    this.DISPLAY_MANAGER_COLUMN_CONTEXT = "displayManagerColumn";
    this.MEASURES_DIMENSION_ROW_MENU_CONTEXT = "measuresDimensionInRows";
    this.MEASURES_DIMENSION_COLUMN_MENU_CONTEXT = "measuresDimensionInColumns";
    this.MEASURE_ROW_MENU_CONTEXT = "measureRow";
    this.MEASURE_COLUMN_MENU_CONTEXT = "measureColumn";

    this.ENDS_WITH_A_NUMBER_REGEX = new RegExp("\\d+$");
    this.ALL_LEVEL_NAME = "(All)";

    this.crosstabMode = null; //CROSSTAB or OLAP_CROSSTAB

    ///////////////////////////////////////////
    //Type conversation constants
    ///////////////////////////////////////////

    this.INTEGER_JAVA_TYPES = ["java.lang.Byte", "java.lang.Integer", "java.lang.Short", "java.lang.Long", "java.math.BigInteger"];
    this.DECIMAL_JAVA_TYPES = ["java.lang.Float", "java.lang.Double", "java.math.BigDecimal", "java.lang.Number"];
    this.DATE_JAVA_TYPES = ["java.sql.Timestamp", "java.sql.Time", "java.sql.Date", "java.util.Date"];
    this.BOOLEAN_JAVA_TYPES = ["java.lang.Boolean"];

    this.DATE_TYPE_DISPLAY = "date";
    this.INTEGER_TYPE_DISPLAY = "int";
    this.DECIMAL_TYPE_DISPLAY = "dec";
    this.BOOLEAN_TYPE_DISPLAY = "bool";
    this.NOT_A_NUMBER_TYPE_DISPLAY = "NaN";

    ///////////////////////////////////////////
    //global constants
    ///////////////////////////////////////////

    var MEASURE="measure";
    var ROW_GROUP_MEMBER="rgMember";
    var COLUMN_GROUP_MEMBER="cgMember";
    var ROW_GROUP_PREFIX = "rowGroup";
    //constants
    var HACK_PADDING = 1;
    var VISUAL_CUE_HACK_PADDING = 2;
    var TRUNCATED_LABEL_LEN = 100;
    var requestsInProgress = 0;
    var DROP_TARGET_CLASS = "dropTarget";
    var draggingMoveOverIndex = -1;
    var currentlyDraggingIndex = -1;


    this.getMessage = function(messageId, object) {
        var message = crosstabState.messages[messageId];
        return message ? new Template(message).evaluate(object ? object : {}) : "";
    };

    ///////////////////////////////////////////////////////////////
    // Get the mode. Each mode has its own implementation
    ///////////////////////////////////////////////////////////////

    this.getMode = function() {
        // At very first call crosstabMode will be not set
        // Need to initialize it from global viewType var
        if (!this.crosstabMode) {
            this.crosstabMode = window.viewType;
        }

        return this.crosstabMode;
    };

    ///////////////////////////////////////////////////////////////
    // Initialization
    ///////////////////////////////////////////////////////////////

    this.isOlapMode = function() {
        return this.getMode() === designerBase.OLAP_CROSSTAB;
    };

    this.isNonOlapMode = function() {
        return this.getMode() === designerBase.CROSSTAB;
    };

    this.isCrosstabMode = function() {
        return localContext.isOlapMode() || localContext.isNonOlapMode();
    };

    /**
     * Called to init all major components
     */
    this.initAll = function() {
        adhocDesigner.initializer('crosstab');
        if (localContext.isCrosstabMode()) {
            oneTimeInit();
            initGlobals();
            initDisplayManager();
            adhocDesigner.render();
        }
    };

    /**
     * Called once when we enter the crosstab
     */
    function oneTimeInit(){
        updateConstantState();
        crosstabSpecificEvents();
    }

    function truncateMeasureLabels(){
        new Truncator($$(localContext.MEASURE_LABEL_PATTERN), TRUNCATED_LABEL_LEN);
        new Truncator($$(localContext.XTAB_LABEL_PATTERN), TRUNCATED_LABEL_LEN);
    }

    /**
     * Global variables
     */
    function initGlobals(){
        editor = null;
        titleCaption = $("titleCaption");
        canvasTable = $("canvasTable");
        updateState();
        designerBase.initAdhocSpecificDesignerBaseVar();
        adHocFilterModule.CONTROLLER_PREFIX = "cr";   // using the olap-specific controller for ajax requests
        if (localContext.inDesignView) {
            adhocDesigner.enableRunAndSave(canSaveReport());
            adhocDesigner.enableCanUndoRedo();

            if (crosstabState.showDisplayManager) {
                $(localContext.DISPLAY_MANAGER_PANEL_ID).removeClassName(layoutModule.HIDDEN_CLASS);
//                $(localContext.MAIN_PANEL_ID).addClassName(localContext.SHOWING_DISPLAY_MANAGER_CLASS);
            } else {
                $(localContext.DISPLAY_MANAGER_PANEL_ID).addClassName(layoutModule.HIDDEN_CLASS);
//                $(localContext.MAIN_PANEL_ID).removeClassName(localContext.SHOWING_DISPLAY_MANAGER_CLASS);
            }
        } else {
            if (titleCaption && titleCaption.innerHTML == localContext.getMessage('defaultCaptionTitle')) {
                titleCaption.addClassName(layoutModule.HIDDEN_CLASS);
            }
        }

        //For OLAP mode disable pivot if nothing in rows
        enableXtabPivot(crosstabState.rowGroups.length > 0 ||
            (localContext.isNonOlapMode() ? crosstabState.columnGroups.length > 0 : false));

        //drop zone init
        if(adhocDesigner.removeDroppables){
            adhocDesigner.removeDroppables();
        }
        if (localContext.inDesignView) {
            adhocDesigner.addDroppables();
        }
        truncateMeasureLabels();
        if(crosstabState.queryStatus != 'OK'){
            var nothingToDisplay = $('nothingToDisplay');
            if (nothingToDisplay) {
                nothingToDisplay.removeClassName(layoutModule.HIDDEN_CLASS);
                adhocCenterElement(nothingToDisplay, {horz: true, vert: true});
            }
        }
        designerBase.updateFlowKey();
    }

    function updateState() {
        evaluateScript('crosstabState');
        adhocDesigner.updateBaseState();
        designerBase.updateSessionWarning();
    }

    function updateConstantState() {
        evaluateScript("crosstabConstantState");
    }

    // Measures and Dimensions tree events handling
    this.initTreeEvents = function(tree) {
        tree.observe('leaf:selected', function(event) {
            var node = event.memo.node;
            var evt = event.memo.targetEvent;
            adhocDesigner.getDifferrentTree(tree)._deselectAllNodes();
            adhocDesigner.selectFromAvailableFields(evt, node);
        }.bind(localContext));


        tree.observe('node:selected', function(event) {
            var node = event.memo.node;
            var evt = event.memo.targetEvent;
            adhocDesigner.getDifferrentTree(tree)._deselectAllNodes();
            //add to selection
            if (evt) {
                adhocDesigner.selectFromAvailableFields(evt, node);
            }
        }.bind(localContext));


        tree.observe('leaf:unselected', function(event){
            var node = event.memo.node;
            crossTabMultiSelect.removeSelectedObject(node);
        }.bind(localContext));


        tree.observe('node:unselected', function(event){
            var node = event.memo.node;
            crossTabMultiSelect.removeSelectedObject(node);
        }.bind(localContext));


        tree.observe('items:unselected', function(event){
            designerBase.unSelectAll();
        }.bind(localContext));


//        tree.observe('tree:loaded', function(event) {
//            localContext.displayManager.addDimensionTree(tree);
//        });
    };

    this.customizeDimensionsTree = function(dimensionsTree) {
        //disable multiselect for OLAP-mode
        dimensionsTree.multiSelectEnabled = localContext.isOlapMode() ? false : true;
        dimensionsTree.dragClasses = 'dimension';
        dimensionsTree.setDragStartState = function(node, draggable, event){
            setDragStartState(dimensionsTree, node, draggable, event);

            selectionCategory.area = designerBase.AVAILABLE_FIELDS_AREA;
            localContext.canAddFilter(node) && draggable.element.addClassName("supportsFilter");
        };

        dimensionsTree.observe('leaf:dblclick', function(event) {
            if (this.canAddLevelAsRowGroup()) {
                appendDimensionToRowAxisWithLevel();
            } else if (this.canAddLevelAsRowGroup()) {
                appendDimensionToColumnAxisWithLevel();
            }
        }.bind(localContext));
    };

    this.customizeMeasuresTree = function(measuresTree) {
        //disable multiselect for OLAP-mode
        measuresTree.multiSelectEnabled = localContext.isOlapMode() ? false : true;
        measuresTree.dragClasses = 'measure';
        measuresTree.setDragStartState = function(node, draggable, event) {
            setDragStartState(measuresTree, node, draggable, event);

            selectionCategory.area = designerBase.AVAILABLE_FIELDS_AREA;
            localContext.canAddFilter(node) && draggable.element.addClassName("supportsFilter");
        };

        measuresTree.observe('leaf:dblclick', function(event) {
            if (this.canAddLevelAsColumnGroup()) {
                appendMeasureToColumn();
            } else if (this.canAddLevelAsRowGroup()) {
                appendMeasureToRow();
            }
        }.bind(localContext));
    };

    this.initCommonEvents = function() {
        initCommonTreeEvents();
        initTreeContextMenu();
    };

    function setDragStartState(tree, node, draggable, event) {
        var pointer = [Event.pointerX(event), Event.pointerY(event)];
        var oldDraggable = draggable.element;
        var el = draggable.element = new Element('LI').update(oldDraggable.innerHTML);
        el.classNames().set(oldDraggable.classNames());
        el.setStyle({'z-index' : oldDraggable.getStyle('z-index')});
        el.hide();

        oldDraggable.parentNode.appendChild(el);
        Element.clonePosition(el, oldDraggable);
        Position.absolutize(el);
        oldDraggable.remove();

        dynamicTree.Tree.prototype.setDragStartState.apply(tree, Array.prototype.slice.call(arguments, 1));

        draggable.draw(pointer);
        el.show();
    }

    function initCommonTreeEvents() {
        Event.observe(document.body, 'click', function(event) {
            if (!matchAny(event.element(), ['li.node','li.leaf','ul#' + adhocDesigner.MEASURES_TREE_DOM_ID, 'ul#' + adhocDesigner.DIMENSIONS_TREE_DOM_ID], true)) {
                adhocDesigner.unSelectAvailableTreeNodes();
            }
        });
    }

    function initTreeContextMenu() {
        //capture context menu event
        document.observe(layoutModule.ELEMENT_CONTEXTMENU, adhocDesigner.getCommonContextMenuObserver());

        //need to do this check because preview mode doesn't have available fields
        if ($(adhocDesigner.DIMENSIONS_TREE_DOM_ID)) {
            Event.observe($('availableFieldsMutton'), 'mouseover', function(event) {
                adhocDesigner.showAvailableFieldsMenu(event);
            }.bind(this));
        }
    }

    //////////////////////
    // Display Manager
    //////////////////////
    function initDisplayManager() {
        if (!$(localContext.DISPLAY_MANAGER_PANEL_ID)) return;

        //If displayManager  doesn't exists - create it
        //if exists - just reinitialize it
        if (!localContext.displayManager) {
            localContext.displayManager = new DisplayManager({
                rowGroups : crosstabState.rowGroups,
                columnGroups : crosstabState.columnGroups,
                columnsElementId : localContext.OLAP_COLUMNS_ID,
                rowsElementId : localContext.OLAP_ROWS_ID,
                mode : window.viewType
            });
        } else {
            localContext.displayManager.reInitialize({
                rows: crosstabState.rowGroups, columns: crosstabState.columnGroups
            });
        }
        observeDisplayManagerEvents();
    }

    function observeDisplayManagerEvents() {
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:addLevelToRowWithDimension");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:addLevelToColumnWithDimension");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:addToRow");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:addToColumn");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:addMeasureToRow");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:addMeasureToColumn");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:removeFromRow");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:removeFromRow");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:removeFromRow");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:removeFromColumn");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:removeMeasure");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:moveDimension");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:moveMeasure");
        $(localContext.DISPLAY_MANAGER_PANEL_ID).stopObserving("dm:contextMenu");

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:addLevelToRowWithDimension", function(event) {
            insertDimensionInRowAxisWithLevel(event.memo.dimension, event.memo.level, event.memo.index);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:addLevelToColumnWithDimension", function(event) {
            insertDimensionInColumnAxisWithLevel(event.memo.dimension, event.memo.level, event.memo.index);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:addToRow", function(event) {
            showRowLevel(event.memo.dimension, event.memo.level);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:addToColumn", function(event) {
            showColumnLevel(event.memo.dimension, event.memo.level);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:addMeasureToRow", function(event) {
            insertDimensionInRowAxisWithLevel(event.memo.dimension, event.memo.level, event.memo.index, event.memo.measureIndex);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:addMeasureToColumn", function(event) {
            insertDimensionInColumnAxisWithLevel(event.memo.dimension, event.memo.level, event.memo.index, event.memo.measureIndex);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:removeFromRow", function(event) {
            hideRowLevel(event.memo.dimension, event.memo.level);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:removeFromColumn", function(event) {
            hideColumnLevel(event.memo.dimension, event.memo.level);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:removeMeasure", function(event) {
            removeMeasure(event.memo.index);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:moveDimension", function(event) {
            moveDimension(event.memo.dimension, event.memo.axis, event.memo.index);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:moveMeasure", function(event) {
            moveMeasure(event.memo.from, event.memo.to);
        });

        $(localContext.DISPLAY_MANAGER_PANEL_ID).observe("dm:contextMenu", function(event) {
            //This is done to make filters functionality works
            event.memo.levelMeta.name = event.memo.levelMeta.level;

            if (event.memo.levelMeta.axis == "column") {
                selectFromDisplayManager(event.memo.targetEvent, event.memo.levelMeta, designerBase.COLUMN_GROUP_MENU_LEVEL);
                showDisplayManagerColumnMenu(event.memo.targetEvent);
            } else if (event.memo.levelMeta.axis == "row") {
                selectFromDisplayManager(event.memo.targetEvent, event.memo.levelMeta, designerBase.ROW_GROUP_MENU_LEVEL);
                showDisplayManagerRowMenu(event.memo.targetEvent);
            }
        });
    }

    /**
     * method to be called when a a level is selected from the display manager by right click
     */
    function selectFromDisplayManager(event, node, area) {
        designerBase.unSelectAll();
        var isMultiSelect = adhocDesigner.isMultiSelect(event, area);
        //update select area
        selectionCategory.area = area;
        var isSelected = adhocDesigner.isAlreadySelected(node);
        adhocDesigner.addSelectedObject(event, node, isMultiSelect, isSelected);
        Event.stop(event);
    }


    ///////////////////////////////////////////////////////////////
    // Event Handling
    ///////////////////////////////////////////////////////////////


    // define droppables
    adhocDesigner.addDroppables = function(){
        var dropOptions = {
            "filter-container": {
                accept: 'supportsFilter',/*'wrap'*/
                onDrop: function(){
                    actionModel.hideMenu();
                    adhocDesigner.addFilterViaDragNDrop();
                    adhocDesigner.unSelectAvailableTreeNodes();
                }
            },
            "defaultValues": {
                accept: ['draggable', 'wrap'],
                hoverclass: 'dropTarget'
            }
        };

        var getValue = function(id, key){
            //if(id == "mainTableContainer"){
            //    return "";
            //}
            return dropOptions[id][key] || dropOptions.defaultValues[key];
        };

        for (var myId in dropOptions) {
            if ((myId !== 'defaultValues') && dropOptions.hasOwnProperty(myId)) {
                Droppables.add(myId, {
                    accept: getValue(myId, "accept"),// ['draggable', 'wrap'],
                    hoverclass: getValue(myId, "hoverclass"),
                    onDrop: function(myId){
                        return function(dragged, dropped, evt){
                            this[myId].onDrop(dragged, dropped, evt);
                        }.bind(dropOptions)
                    }(myId)
                });
            }
        }

        adhocDesigner.removeDroppables = function(){
            for (var myId in dropOptions) {
                Droppables.remove(myId);
            }
        }
    };


    function crosstabSpecificEvents(){
        $('frame').stopObserving("mouseover", localContext.crosstabMouseOverHandler);
        $('frame').observe("mouseover", localContext.crosstabMouseOverHandler);

        $('frame').stopObserving("mouseup", localContext.crosstabMouseUpHandler);
        $('frame').observe("mouseup", localContext.crosstabMouseUpHandler);

        $('frame').stopObserving("mouseout", localContext.crosstabMouseOutHandler);
        $('frame').observe("mouseout", localContext.crosstabMouseOutHandler);

        $('frame').stopObserving("click", localContext.crosstabMouseClickHandler);
        $('frame').observe("click", localContext.crosstabMouseClickHandler);

        //context menu
        document.observe(layoutModule.ELEMENT_CONTEXTMENU, localContext.specificContextMenuHandler);

        document.observe('key:up', localContext.crosstabKeyUpHandler);
        document.observe('key:down', localContext.crosstabKeyDownHandler);
        document.observe('key:right', localContext.crosstabKeyRightHandler);
        document.observe('key:left', localContext.crosstabKeyLeftHandler);

        document.observe('drag:mousedown', localContext.crosstabDragMouseDownHandler);
    }

    /**
      * Clear event listeners
      */

    this.removeObservers = function () {
        var displayManager = localContext.displayManager,
            contextMenuEventId = layoutModule.ELEMENT_CONTEXTMENU;

        Event.stopObserving(document, contextMenuEventId, localContext.specificContextMenuHandler);
        if (displayManager) {
            //TODO: look in display manager for context menu usage, it seems that it`s unnecessary in crosstab
            Event.stopObserving(document, contextMenuEventId, displayManager.contextMenuHandler);
        }
    };



    this.crosstabDragMouseDownHandler = function(event){
        actionModel.hideMenu();
    };


    this.crosstabTreeMenuHandler = function(event) {
        var matched = null;
        var node = event.memo.node;
        var evt = event.memo.targetEvent;

        matched = matchAny(node, localContext.TREE_CONTEXT_MENU_PATTERN, true);
        if (matched) {
            node = adhocDesigner.dimensionsTree.getTreeNodeByEvent(event.memo.targetEvent);
            var tree = adhocDesigner.dimensionsTree;
            var contextName = localContext.DIMENSION_TREE_LEVEL_CONTEXT;
            if (!node) {
                node = adhocDesigner.measuresTree.getTreeNodeByEvent(event.memo.targetEvent);
                tree = adhocDesigner.measuresTree;
                contextName = node.isParent() ? localContext.MEASURE_TREE_GROUP_CONTEXT : localContext.MEASURE_TREE_CONTEXT;
            } else {
                node.isParent() && (contextName = localContext.DIMENSION_TREE_DIMENSION_CONTEXT);
            }

            if (!adhocDesigner.isSelectedNode(node)) {
                adhocDesigner.selectFromAvailableFields(evt, node);
            }
            adhocDesigner.showDynamicMenu(evt, contextName, null);
        }
    };


    this.specificContextMenuHandler = function(event){
        if (localContext.isCrosstabMode()) {
            var id;
            var name;
            var mask;
            var index;
            var display;
            var groupObj;
            var dataType;
            var sFunction;
            var overlayId;
            var isRowGroup;
            var canReBucket;
            var currentBucket;
            var overlayObject;
            var isShowingSummary;
            var evt = event.memo.targetEvent;
            var element = evt.element();

            if (matchAny(element, [localContext.COLUMN_GROUP_MEMBER_PATTERN, localContext.ROW_GROUP_MEMBER_PATTERN], true)) {
                if ($(element)) {
                    groupObj = {
                        id : element.identify(),
                        path : element.readAttribute("data-path"),
                        value : element.readAttribute("data-fieldValue"),
                        isSummary : element.readAttribute("data-isSummaryHeader"),
                        expandable: element.readAttribute("data-expanable") === 'true'
                    };

                    if (!designerBase.isObjectInSelection(groupObj, "id")) {
                        crossTabMultiSelect.selectXtabGroupMember(element, evt);
                    }
                    showGroupMemberMenu(evt);
                }
            }

            if (matchAny(element, [localContext.MEASURE_PATTERN], false)) {
                while ($(element).hasClassName("dummy")) {
                    element = element.nextSiblings()[0];
                }

                id = element.identify();
                index = parseInt(localContext.ENDS_WITH_A_NUMBER_REGEX.exec(id)[0]);
                isRowGroup = id.startsWith("rowGroup");
                var axisId = isRowGroup ? localContext.OLAP_ROWS_ID : localContext.OLAP_COLUMNS_ID;
                var measuresCount = localContext.measures.length;
                var levelIndex = index % measuresCount;
                name = localContext.measures[levelIndex].name;

                if ($(element)) {
                    groupObj = {
                        id: (isRowGroup ? "rowGroup_" : "colGroup_") + index,
                        name: name, //for filters
                        level: name,
                        dimension: adhocDesigner.MEASURES,
                        expandable: element.readAttribute("data-expanable") === 'true',
                        axis: isRowGroup ? 'row' : 'column',
                        isMeasure: true,
                        levelIndex: levelIndex
                    };

                    if (!designerBase.isObjectInSelection(groupObj, "id")) {
                        crossTabMultiSelect.selectXtabGroupLabel(groupObj);
                    }

                    var isMeasuresDimension =
                        element.readAttribute("data-dimension") === adhocDesigner.MEASURES &&
                        element.readAttribute("data-level") === (localContext.isOlapMode()
                            ? localContext.OLAP_MEASURES_LEVEL_NAME
                            : adhocDesigner.MEASURES);

                    if (isMeasuresDimension) {
                        isRowGroup ? showMeasuresDimensionRowMenu(evt) : showMeasuresDimensionColumnMenu(evt);
                    } else {
                        isRowGroup ? showMeasureRowMenu(evt) : showMeasureColumnMenu(evt);
                    }
                }
            }

            if (matchAny(element, [localContext.GROUP_LEVEL_PATTERN], false)) {
                while ($(element).hasClassName("dummy")) {
                    element = element.nextSiblings()[0];
                }

                id = element.identify();
                index = parseInt(localContext.ENDS_WITH_A_NUMBER_REGEX.exec(id)[0]);
                isRowGroup = id.startsWith("rowGroup");

                if ($(element)) {
                    groupObj = {
                        id: (isRowGroup ? "rowGroup_" : "colGroup_") + index,
                        name: element.readAttribute("data-level"), //for filters
                        level: element.readAttribute("data-level"),
                        dimension: element.readAttribute("data-dimension"),
                        expandable: element.readAttribute("data-expanable") === 'true',
                        axis: isRowGroup ? 'row' : 'column',
                        isMeasure: (element.readAttribute("data-dimension") === adhocDesigner.MEASURES),
                        groupIndex: index
                    };

                    if (!groupObj.isMeasure && !(groupObj.dimension === localContext.NULL_DIMENSION)) {
                        if (!designerBase.isObjectInSelection(groupObj, "id")) {
                            crossTabMultiSelect.selectXtabGroupLabel(groupObj);
                        }

                        isRowGroup ? showRowGroupMenu(evt) : showColumnGroupMenu(evt);
                    }
                }
            }
        }
    };


    this.crosstabMouseClickHandler = function(evt){
        var anchor = null;
        var element = evt.element();
        var regex = new RegExp('\\d+', 'g');

        if(element.match(localContext.DRILL_THROUGH_PATTERN)){
            //deselect all selected cells
            crossTabMultiSelect.deselectAllGroupMembers();

            // getting out of the <span> container
            element = element.parentNode;

            if ($(element)) {
                anchor = element.identify();
                //do this in design mode only
                if (localContext.inDesignView) {
                    if (anchor.startsWith("measureBucketDrill_")) {
                        var rowPathIndex = regex.exec(anchor)[0];
                        var columnPathIndex = regex.exec(anchor)[0];
                        if (!localContext.isOlapMode()) {
                            localContext.drill(rowPathIndex, columnPathIndex);
                        } else {
                            localContext.drillOLAP(rowPathIndex, columnPathIndex);
                        }
                        return;
                    }
                }
            }
        }

        if(matchAny(element, localContext.MEASURE_SORT_ICON_PATTERN, false)) {
            var id = element.up().identify();
            var index = parseInt(localContext.ENDS_WITH_A_NUMBER_REGEX.exec(id)[0]);
            var isRowGroup = id.startsWith("rowGroup");
            var axisId = isRowGroup ? localContext.OLAP_ROWS_ID : localContext.OLAP_COLUMNS_ID;
            var measuresCount = localContext.displayManager.getLevelsFromDimension(adhocDesigner.MEASURES, axisId).length;


            if (localContext.inDesignView && localContext.isNonOlapMode()) {
                localContext.sortControlClicked(index % measuresCount);
                Event.stop(evt);
            }
        }
    };


    this.crosstabMouseOutHandler = function(evt){
        var element = evt.element();
        var overlayId;
        var index;
        var matched;
        var visualCue;
        var overlayObject;
        var isRowGroup;
        var isColGroup;
        var regex = new RegExp("\\d+$");
        var regez = new RegExp(/\B\d+\B/);

        if (Draggables.dragging != designerBase.AVAILABLE_FIELDS_AREA) {
            return;
        }

    };


    this.crosstabMouseUpHandler = function(evt){
        var id;
        var name;
        var mask;
        var index;
        var display;
        var groupObj;
        var dataType;
        var overlayId;
        var sFunction;
        var canReBucket;
        var currentBucket;
        var overlayObject;
        var isShowingSummary;
        var element = evt.element();
        var regex = new RegExp("\\d+$");

        if (Draggables.dragging != designerBase.AVAILABLE_FIELDS_AREA) {
            if (matchAny(element, [localContext.GROUP_LEVEL_DISCLOSURE_PATTERN], false)) {
                var parent = element.up();
                if ($(parent)) {
                    var dimension = $(parent).readAttribute("data-dimension");
                    var level = $(parent).readAttribute("data-level");
                    var collapsed = $(element).hasClassName('closed');
                    if (collapsed) {
                        expandLevel(dimension, level);
                    } else {
                        collapseLevel(dimension, level);
                    }
                }

                return;
            }

            if (matchAny(element, [localContext.GROUP_MEMBER_DISCLOSURE_PATTERN], false)) {
                parent = element.up();

                if ($(parent)) {
                    id = parent.identify();
                    var isRowGroup = id.startsWith("rowGroup_");
                    var regez = new RegExp(/\B\d+\B/);
                    index = regez.exec(id)[0];
                    var path = $(parent).readAttribute("data-path");
                    if (isRowGroup) {
                        localContext.toggleExpandCollapseForRow(path, index);
                    } else {
                        localContext.toggleExpandCollapseForColumn(path, index);
                    }
                }

                return;
            }

            matched = matchAny(element, [localContext.COLUMN_GROUP_MEMBER_PATTERN, localContext.ROW_GROUP_MEMBER_PATTERN], true);
            if (matched && !isRightClick(evt)) {
                deselectAllSelectedOverlays();
                crossTabMultiSelect.selectXtabGroupMember(matched, evt);
            }


            matched = matchAny(element,  [localContext.ROW_GROUP_OVERFLOW_PATTERN, localContext.COLGROUP_GROUP_OVERFLOW_PATTERN], true);
            if(matched){
                if($(matched).hasClassName("colOverflow")){
                    var canShowMoreColumns = $(matched).readAttribute("data-canShowMore");
                    if (canShowMoreColumns === "true") {
                        retrieveOverflowColumnGroups();
                    }
                }else{
                    retrieveOverflowRowGroups();
                }
            }
        }

    };



    this.crosstabMouseOverHandler = function(evt){
    };


    ///////////////////////////////////////////////////////////////
    // Type conversation helper functions
    ///////////////////////////////////////////////////////////////

    this.isIntegerType = function(type) {
        return localContext.INTEGER_JAVA_TYPES.indexOf(type) >= 0;
    };

    this.isDecimalType = function(type) {
        return localContext.DECIMAL_JAVA_TYPES.indexOf(type) >= 0;
    };

    this.isDateType = function(type) {
        return localContext.DATE_JAVA_TYPES.indexOf(type) >= 0;
    };

    this.isBooleanType = function(type) {
        return localContext.BOOLEAN_JAVA_TYPES.indexOf(type) >= 0;
    };

    this.getSuperType = function(type) {
        if (localContext.isIntegerType(type)) {
            return localContext.INTEGER_TYPE_DISPLAY;
        } else if (localContext.isDecimalType(type)) {
            return localContext.DECIMAL_TYPE_DISPLAY;
        } else  if (localContext.isDateType(type)) {
            return localContext.DATE_TYPE_DISPLAY;
        } else {
            return localContext.NOT_A_NUMBER_TYPE_DISPLAY;
        }
    };

    ///////////////////////////////////////////////////////////////
    // Helper functions
    ///////////////////////////////////////////////////////////////

    //Returns flat string array with names of fields in columns
    this.getFlatListOfUsedFields = function(inColumns) {
        return crosstabState[inColumns ? 'columnGroups' : 'rowGroups'].collect(function(group) {
            return group.levels.collect(function(level) {
                return level.name !== adhocDesigner.MEASURES ? level.name : level.members.collect(function(member) {
                    return member.name;
                })
            });
        }).flatten();
    };

    //Returns flat string array with names of measures in columns
    this.getFlatListOfUsedMeasures = function(inColumns) {
        var measuresGroup = crosstabState[inColumns ? 'columnGroups' : 'rowGroups'].find(function(group) {
            return group.name === adhocDesigner.MEASURES;
        });

        if (measuresGroup) {
            return measuresGroup.levels[0].members.collect(function(member) {
                return member.name;
            });
        } else {
            return [];
        }
    };

    // these are called in other modules, so even though we don't use overlays, leave them stubbed out
    var deselectAllSelectedOverlays = this.deselectAllSelectedOverlays = function(){
    };

    function deselectAllColumnGroupOverlays(){
    }

    function deselectAllRowGroupOverlays(){
    }

    function deselectAllMeasureOverlays(){
    }


    function removeFromSelectObjects(overlayId){
        var foundObject;
        selObjects.each(function(object){
            if(object.id == overlayId){
                foundObject = object;
            }
        });
        selObjects = selObjects.without(foundObject);
    }


    function getSelectedDimensionIndex(selectedObject){
        if(selectedObject && localContext.displayManager){
            var axis = selectedObject.axis === "row" ? localContext.OLAP_ROWS_ID : localContext.OLAP_COLUMNS_ID;
            var dimension = selectedObject.isMeasure ? adhocDesigner.MEASURES : selectedObject.dimension;
            return localContext.displayManager.getDimensions(axis).indexOf(dimension);
        }

        return -1;
    }

    function getSelectedMeasure(){
        if(selObjects && selObjects.length > 0){
            var object = selObjects[0];
            if(object.isMeasure){
                return localContext.measures[object.levelIndex];
            }
        }
        return null;
    }

    function getSelectedGroup(object){
        if (!object) {
            return null;
        }

        return object.axis === "row"
            ? localContext.rowGroups[object.groupIndex]
            : localContext.columnGroups[object.groupIndex];
    }

    function getMeasureTypeByFunction(thisFunction){
        var object = getSelectedMeasure();
        if(object){
            var type = localContext.getSuperType(object.type);
            if(thisFunction === "Average"){
                return "dec";
            }else if(thisFunction === "Count" ||thisFunction ==="DistinctCount"){
                return "int";
            }else{
                return type;
            }
        }
        return null;
    }

    /**
     * Fills "Add levels" menu items with dynamic values - all sibling levels
     */
    this.updateContextMenuWithSiblingLevels = function(contextName, contextActionModel) {
        if (!localContext.displayManager) {
            return contextActionModel;
        }

        var menuToUpdate = contextActionModel.find(function(item) {
            return item.clientTest === "canAddSiblingLevels";
        });

        if (!menuToUpdate) {
            return contextActionModel;
        }

        var siblingLevels = null;
        var rootNode = null;
        var action = null;

        if (!selObjects.first().isMeasure) {
            if (localContext.isOlapMode()) {
                rootNode = adhocDesigner.dimensionsTree.getRootNode().childs.find(function(node) {
                    return node.param.extra.id === selObjects.first().dimension;
                });

                action = selObjects.first().axis === "row" ? "appendDimensionToRowAxisWithLevel" : "appendDimensionToColumnAxisWithLevel";
            } else {
                //In nonOLAP mode there is only one level for any dimension
                selObjects.first().levelIndex = 0;
                return contextActionModel;
            }
        } else {
            rootNode = adhocDesigner.measuresTree.getRootNode();
            action = selObjects.first().axis === "row" ? "appendMeasureToRow" : "appendMeasureToColumn";
        }

        if (selObjects.first().allLevels === undefined) {
            var metadata = selObjects.first();
            var axis = metadata.axis == "column" ? localContext.OLAP_COLUMNS_ID : localContext.OLAP_ROWS_ID;
            metadata.allLevels = localContext.displayManager.getLevelsFromDimension(selObjects.first().dimension, axis);
            metadata.levelIndex = metadata.allLevels.indexOf(metadata.level);
        }

        if (selObjects.first().allLevels) {
            if (localContext.isOlapMode()) {
                siblingLevels = rootNode.childs.findAll(function(node) {
                    return !selObjects.first().allLevels.include(node.param.extra.id);
                });
            } else {
                siblingLevels = adhocDesigner.getAllLeaves(rootNode, adhocDesigner.measuresTree)
                    .findAll(function(node) {
                        return !selObjects.first().allLevels.include(node.param.extra.id);
                    });
            }
        }

        if (!siblingLevels || siblingLevels.length == 0) {
            return contextActionModel;
        }

        menuToUpdate.text = localContext.getMessage(selObjects.first().isMeasure ? 'addMeasures' : 'addLevels');
        menuToUpdate.children = siblingLevels.collect(function(node) {
            return actionModel.createMenuElement("optionAction", {
                text: node.name,
                action: action,
                actionArgs: selObjects.first().isMeasure ? [node.param.extra.id] : [{id: node.param.extra.id, groupId: node.param.extra.dimensionId, isMeasure: false}]
            });
        });

        return contextActionModel;
    };

    ///////////////////////////////////////////////////////////////
    // Crosstab actions
    ///////////////////////////////////////////////////////////////

    function showRowGroupMenu(evt){
        adhocDesigner.showDynamicMenu(evt, designerBase.ROW_GROUP_MENU_LEVEL, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showColumnGroupMenu(evt){
        adhocDesigner.showDynamicMenu(evt, designerBase.COLUMN_GROUP_MENU_LEVEL, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showMeasuresDimensionRowMenu(evt){
        adhocDesigner.showDynamicMenu(evt, localContext.MEASURES_DIMENSION_ROW_MENU_CONTEXT, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showMeasuresDimensionColumnMenu(evt){
        adhocDesigner.showDynamicMenu(evt, localContext.MEASURES_DIMENSION_COLUMN_MENU_CONTEXT, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showMeasureRowMenu(evt){
        adhocDesigner.showDynamicMenu(evt, localContext.MEASURE_ROW_MENU_CONTEXT, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showMeasureColumnMenu(evt){
        adhocDesigner.showDynamicMenu(evt, localContext.MEASURE_COLUMN_MENU_CONTEXT, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showDisplayManagerColumnMenu(evt){
        adhocDesigner.showDynamicMenu(evt, localContext.DISPLAY_MANAGER_COLUMN_CONTEXT, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    function showDisplayManagerRowMenu(evt){
        adhocDesigner.showDynamicMenu(evt, localContext.DISPLAY_MANAGER_ROW_CONTEXT, null,
            localContext.updateContextMenuWithSiblingLevels);
    }

    //function showMeasureMenu(evt){
    //    adhocDesigner.showDynamicMenu(evt, designerBase.MEASURE_MENU_LEVEL);
    //}


    function showGroupMemberMenu(evt){
        adhocDesigner.showDynamicMenu(evt, designerBase.MEMBER_GROUP_MENU_LEVEL);
    }


    function enableXtabPivot(canPivot){
        if (exists(toolbarButtonModule)) {
            toolbarButtonModule.setButtonState($('pivot'), canPivot);
        }
    }

    function addFieldToXtab(dragged, dropped, evt) {
        var dropSection = evt.element();

        if(!dropSection){
            return;
        }

        var dropSectionAxis = matchMeOrUp(dropSection, localContext.DM_AXIS_LIST_PATTERN);
        if (!dropSectionAxis) {
            return;
        }

        var dropSectionAxisId = $(dropSectionAxis).identify();
        if(dropSectionAxisId.startsWith(localContext.OLAP_COLUMNS_ID)){
            appendDimensionToColumnAxisWithLevel();
        }else if(dropSectionAxisId.startsWith(localContext.OLAP_ROWS_ID)){
            appendDimensionToRowAxisWithLevel();
        }
    }

    function processFieldAsColumnGroup(element, regex, xIndex){
        var index = xIndex;
        var position = null;
        var elementId = element.identify();
        if(elementId.startsWith("colGroupHeaderRow_") || elementId.startsWith("colGroupHeader_")){
            try {
                position = regex.exec(elementId)[0];
                index = parseInt(position) + 1;
            } catch(e) {
                //unexpected error.
            }
        }
        addFieldAsColumnGroup(index);
    }

    function processFieldAsMeasure(element, regex, xIndex){
        var index = xIndex;
        var position = null;
        var elementId = element.identify();
        if(elementId.startsWith("measureHeader_")){
            try {
                position = regex.exec(elementId)[0];
                index = parseInt(position) + 1;
            } catch(e) {
                //unexpected error.
            }
        }else if (element.nodeName == "A" || element.nodeName == "LI"){
            if(element.nodeName == "A" ){
                element = element.up("li.leaf");
            }
            if(element){
                index = $(element).previousSiblings().length;
            }
        }
        addFieldAsMeasure(index, true);
    }


    function processFieldAsRowGroup(element, regex, xIndex){
        var index = xIndex;
        var position = null;
        var elementId = element.identify();
        if(elementId.startsWith("rowGroup_") || elementId.startsWith("rowGroupHeader_")){
            try {
                position = regex.exec(elementId)[0];
                index = parseInt(position) + 1;
            } catch(e) {
                //unexpected error.
            }
        }
        addFieldAsRowGroup(index);
    }

    var moveRowGroupLeft = this.moveRowGroupLeft = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var fromGroup = getSelectedDimensionIndex(object);
        var toGroup = fromGroup-1;
        moveRowGroup(fromGroup, toGroup, customCallback);
    };


    var moveRowGroupRight = this.moveRowGroupRight = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var fromGroup = getSelectedDimensionIndex(object);
        var toGroup=fromGroup + 1;
        moveRowGroup(fromGroup, toGroup, customCallback);
    };

    var moveColumnGroupLeft = this.moveColumnGroupLeft = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var fromGroup = getSelectedDimensionIndex(object);
        var toGroup = fromGroup-1;
        moveColumnGroup(fromGroup, toGroup, customCallback);
    };


    var moveColumnGroupRight = this.moveColumnGroupRight = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var fromGroup = getSelectedDimensionIndex(object);
        var toGroup=fromGroup + 1;
        moveColumnGroup(fromGroup, toGroup, customCallback);
    };


    var moveMeasureLeft = this.moveMeasureLeft = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        moveMeasure(object.levelIndex, object.levelIndex - 1);
    };

    var moveMeasureRight = this.moveMeasureRight = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        moveMeasure(object.levelIndex, object.levelIndex + 1);
    };

    var moveRowGroupOnDrag = this.moveRowGroupOnDrag = function(){
        draggingMoveOverIndex = parseInt(draggingMoveOverIndex);
        currentlyDraggingIndex = parseInt(currentlyDraggingIndex);

        if (currentlyDraggingIndex != draggingMoveOverIndex) {
            if (currentlyDraggingIndex >= 0 && draggingMoveOverIndex >= 0) {
                moveRowGroup(currentlyDraggingIndex, draggingMoveOverIndex);
            } else if (draggingMoveOverIndex == -1) {
                removeRowGroup(currentlyDraggingIndex);
            }
        }
    };

    var hideLevel = this.hideLevel = function(customCallback) {
        var dimAndLevel = getDimensionWithLevelFromSelection();
        if(selectionCategory.area === designerBase.COLUMN_GROUP_MENU_LEVEL){
            hideColumnLevel(dimAndLevel.dimension, dimAndLevel.level);
        } else if(selectionCategory.area === designerBase.ROW_GROUP_MENU_LEVEL){
            hideRowLevel(dimAndLevel.dimension, dimAndLevel.level);
        }
    };

    var showLevel = this.showLevel = function(customCallback) {
        var dimAndLevel = getDimensionWithLevelFromSelection();
        if(selectionCategory.area === designerBase.COLUMN_GROUP_MENU_LEVEL){
            showColumnLevel(dimAndLevel.dimension, dimAndLevel.level);
        } else if(selectionCategory.area === designerBase.ROW_GROUP_MENU_LEVEL){
            showRowLevel(dimAndLevel.dimension, dimAndLevel.level);
        }
    };

    var moveColumnGroupDown = this.moveColumnGroupDown = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var fromGroup = getSelectedDimensionIndex(object);
        var toGroup=fromGroup + 1;
        moveColumnGroup(fromGroup, toGroup, customCallback);
    };


    var moveColumnGroupUp = this.moveColumnGroupUp = function(customCallback) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var fromGroup = getSelectedDimensionIndex(object);
        var toGroup=fromGroup - 1;
        moveColumnGroup(fromGroup, toGroup, customCallback);
    };



    var moveColumnGroupOnDrag = this.moveColumnGroupOnDrag = function(){
        draggingMoveOverIndex = parseInt(draggingMoveOverIndex);
        currentlyDraggingIndex = parseInt(currentlyDraggingIndex);

        if (currentlyDraggingIndex != draggingMoveOverIndex) {
            if (currentlyDraggingIndex >= 0 && draggingMoveOverIndex >= 0) {
                moveColumnGroup(currentlyDraggingIndex, draggingMoveOverIndex);
            } else if (draggingMoveOverIndex == -1) {
                removeColumnGroup(currentlyDraggingIndex);
            }
        }
    };

    var moveMeasureOnDrag = this.moveMeasureOnDrag = function(){
        draggingMoveOverIndex = parseInt(draggingMoveOverIndex);
        currentlyDraggingIndex = parseInt(currentlyDraggingIndex);

        if (currentlyDraggingIndex != draggingMoveOverIndex) {
            if (currentlyDraggingIndex >= 0 && draggingMoveOverIndex >= 0) {
                moveMeasure(currentlyDraggingIndex, draggingMoveOverIndex);
            } else if (draggingMoveOverIndex == -1) {
                removeMeasure(currentlyDraggingIndex);
            }
        }
    };

    function retrieveOverflowRowGroups(){
        var proceed = confirm(localContext.overflowConfirmMessage);
        if(proceed){
            getOverflowRowGroups();
        }
    }


    function retrieveOverflowColumnGroups(){
        var proceed = confirm(localContext.overflowConfirmMessage);
        if(proceed){
            getOverflowColumnGroups();
        }
    }


    this.selectMeasureMask = function(mask){
        var object = getSelectedMeasure();
        if(object){
            var index = selObjects.first().levelIndex;
            setMask(mask, index);
        }
    };


    this.selectFunction = function(newFunction) {
        var object = getSelectedMeasure();
        if(object){
            var index = selObjects.first().levelIndex;
            var type = localContext.getSuperType(object.type);
            var newType = getMeasureTypeByFunction(newFunction);
            if(type !== newType){
                setSummaryFunctionAndMask(newFunction, defaultMasks[newType], index);
            }else{
                setSummaryFunction(newFunction, index);
            }
        }
    };


    this.selectedMeasureShowsSummaryOptions = function() {
        var object = getSelectedMeasure();
        if(object){
            return !adhocDesigner.isPercentOfParentCalc(object.name);
        }
        return false;

    };


    this.selectedMeasureShowsNumericSummaryOptions = function() {
        return (localContext.selectedMeasureShowsSummaryOptions() && localContext.isSelectedMeasureNumeric());
    };

    var setCatForColumnGroup = this.setCatForColumnGroup = function(catName) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if(object && isColumnGroupSelected(object)){
            setCategoryForColumnGroup(catName, object.groupIndex);
        }
    };


    var setCatForRowGroup = this.setCatForRowGroup = function(catName) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if(object && isRowGroupSelected(object)){
            setCategoryForRowGroup(catName, object.groupIndex);
        }
    };

    ///////////////////////////////////////////////////////////////
    // Conditional tests
    ///////////////////////////////////////////////////////////////
    var canMoveToDimensions = this.canMoveToDimensions  = function() {
        var fieldInUse = selObjects.find(function(obj) {
            return localContext.isInUse(obj.param.extra.id, obj.param.extra.isMeasure);
        });

        return !fieldInUse;
    };

    var canMoveToMeasures = this.canMoveToMeasures = function() {
        //for now same logic as for move to dimensions
        return canMoveToDimensions();
    };

    var canSaveReport = this.canSaveReport = function(){
        if (localContext.isNonOlapMode()) {
            //In non olap mode we only need a measure tu run a report
            return localContext.hasMeasures;
        } else {
            //in OLAP mode we need a measure and something in columns to run a report
            return localContext.hasMeasures &&
                localContext.columnGroups.first() &&
                localContext.columnGroups.first().dimensionName !== localContext.NULL_DIMENSION;
        }
    };


    function isGroupSelected(selectedObject){
        var id = selectedObject.id;
        return id.startsWith("rowGroup_") ||  id.startsWith("colGroup_");
    }

    function isRowGroupSelected(selectedObject){
        var id = selectedObject.id;
        return id.startsWith("rowGroup_");
    }

    function isColumnGroupSelected(selectedObject){
        var id = selectedObject.id;
        return id.startsWith("colGroup_");
    }

    this.isCurrentDateType = function(thisType) {
        var group = getSelectedGroup(adhocDesigner.getSelectedColumnOrGroup());
        if(group){
            return group.categorizerName == thisType;
        }
        return false;
    };


    this.isSelectedMeasureNumeric = function() {
        var object = getSelectedMeasure();
        if(object){
            var type = localContext.getSuperType(object.type);
            return (type == "int" || type == "dec");
        }
        return false;
    };



    this.isDateType = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        if(object){
            var isGroup = isGroupSelected(object);
            var group = getSelectedGroup(object);
            if (group) {
                var canReBucket = group.canReBucket === true;
                var dateDataType = group.type === "date";
                return (isGroup && canReBucket && dateDataType);
            }
        }
        return false;
    };

    this.isSelectedMeasureItemType = function(type) {
        var object = getSelectedMeasure();
        if(object){
            var selectedType = localContext.getSuperType(object.type);
            return (selectedType === type);
        }
        return false;
    };


    this.isSelectedMeasureMask = function(mask) {
        var object = getSelectedMeasure();
        if(object){
            return (object.functionMaskOrDefault === mask)
                || (!object.functionMaskOrDefault && mask === defaultMasks[localContext.INTEGER_TYPE_DISPLAY]);
        }
        return false;
    };


    this.isSelectedSummaryFunction = function(sFunc) {
        var object = getSelectedMeasure();
        if(object){
            return (object.functionOrDefault === sFunc);
        }
        return false;
    };

    this.canSwitchToRow = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var axisId = object.axis === "row" ? localContext.OLAP_ROWS_ID : localContext.OLAP_COLUMNS_ID;
        return (localContext.isNonOlapMode() || localContext.displayManager.getDimensionsCount(axisId) > 1);
    };

    this.canAddSliceFilter = function() {
        var doesSelectionContainNotSliceableObject = selObjects.find(function(obj) {
            return !obj.isSliceable;
        });

        return selObjects.first() && !doesSelectionContainNotSliceableObject;
    };

    this.canMoveUpOrLeft = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = getSelectedDimensionIndex(object);
        return (index > 0);
    };

    this.canMoveDownOrRight = function() {
        if (!localContext.displayManager) {
            return false;
        }

        var max = -1;
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = getSelectedDimensionIndex(object);
        var axisId = object.axis === "row" ? localContext.OLAP_ROWS_ID : localContext.OLAP_COLUMNS_ID;
        return index < localContext.displayManager.getDimensionsCount(axisId) - 1;
    };

    this.canMoveMeasureUpOrLeft = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        return (object.levelIndex > 0);
    };

    this.canMoveMeasureDownOrRight = function() {
        if (!localContext.displayManager) {
            return false;
        }

        var max = -1;
        var object = adhocDesigner.getSelectedColumnOrGroup();

        var axis = object.axis === "row" ? localContext.OLAP_ROWS_ID : localContext.OLAP_COLUMNS_ID;
        var dimension = object.isMeasure ? adhocDesigner.MEASURES : object.dimension;
        var total =  localContext.displayManager.getLevelsFromDimension(dimension, axis).length;

        return object.levelIndex < total - 1;
    };

    /**
     * Whether selected dimension can be added to crosstab
     * either as column or as row
     */
    this.canAddDimensionAsRowGroup = function() {
        var node = localContext.getAvailableFieldsNodeBySelection().first();
        if (!node.childs || node.childs.length == 0){
            node = node.parent;
        }

        if (localContext.isOlapMode()) {
            var dimensions = localContext.displayManager.getDimensions(localContext.OLAP_COLUMNS_ID);
            if ((!dimensions || dimensions.length == 0) && localContext.isOlapMode()) {
                return false;
            }

            var dimension = node.param.extra.id;
            var levelsAtColumns = localContext.displayManager.getLevelsFromDimension(dimension, localContext.OLAP_COLUMNS_ID);
            var levelsAtRows = localContext.displayManager.getLevelsFromDimension(dimension, localContext.OLAP_ROWS_ID);

            return !levelsAtColumns && (!levelsAtRows || levelsAtRows.length < node.childs.length);
        } else {
            var tree = dynamicTree.trees[node.getTreeId()];
            var leaves = adhocDesigner.getAllLeaves(node, tree);
            var leavesStringArray = adhocDesigner.getAllLeaves(node, tree).collect(function(node) {
                return node.param.extra.id;
            });

            if (leaves.first().param.extra.isMeasure) {
                var measuresInColumns = localContext.getFlatListOfUsedMeasures(true);
                //var measuresInRows = localContext.getFlatListOfUsedMeasures(false);
                return !measuresInColumns.first(); //|| leavesStringArray.without.apply(leavesStringArray, measuresInRows).length > 0

            } else {
                var allUsedFields = localContext.getFlatListOfUsedFields(true).concat(localContext.getFlatListOfUsedFields(false));
                return leavesStringArray.without.apply(leavesStringArray, allUsedFields).length > 0;
            }
        }
    };

    this.canAddDimensionAsColumnGroup = function() {
        var node = localContext.getAvailableFieldsNodeBySelection().first();
        if (!node.childs || node.childs.length == 0){
            node = node.parent;
        }

        if (localContext.isOlapMode()) {
            var dimension = node.param.extra.id;
            var levelsAtColumns = localContext.displayManager.getLevelsFromDimension(dimension, localContext.OLAP_COLUMNS_ID);
            var levelsAtRows = localContext.displayManager.getLevelsFromDimension(dimension, localContext.OLAP_ROWS_ID);

            return !levelsAtRows && (!levelsAtColumns || levelsAtColumns.length < node.childs.length);
        } else {
            var tree = dynamicTree.trees[node.getTreeId()];
            var leaves = adhocDesigner.getAllLeaves(node, tree);
            var leavesStringArray = adhocDesigner.getAllLeaves(node, tree).collect(function(node) {
                return node.param.extra.id;
            });

            if (leaves.first().param.extra.isMeasure) {
                //var measuresInColumns = localContext.getFlatListOfUsedMeasures(true);
                var measuresInRows = localContext.getFlatListOfUsedMeasures(false);
                return !measuresInRows.first(); //|| leavesStringArray.without.apply(leavesStringArray, measuresInColumns).length > 0

            } else {
                var allUsedFields = localContext.getFlatListOfUsedFields(true).concat(localContext.getFlatListOfUsedFields(false));
                return leavesStringArray.without.apply(leavesStringArray, allUsedFields).length > 0;
            }
        }
    };

    /**
     * Whether selected level can be added to crosstab
     * either as column or as row
     */
    this.canAddLevelAsRowGroup = function() {
        var dm = localContext.displayManager;
        var dimensions = dm.getDimensions(localContext.OLAP_COLUMNS_ID);
        if ((!dimensions || dimensions.length == 0) && localContext.isOlapMode()) {
            return false;
        }

        var node = localContext.getAvailableFieldsNodeBySelection().first();
        var dimensionIds =  localContext.isOlapMode() ? [node.param.extra.dimensionId] :
            adhocDesigner.getAllLeaves(node).map(function(n) {return n.param.extra.dimensionId});

        var levelsAtColumns = dimensionIds.inject([], function(levels, d) {
            return levels.concat(dm.getLevelsFromDimension(d, localContext.OLAP_COLUMNS_ID) || []);
        });
        var levelsAtRows = dimensionIds.inject([], function(levels, d) {
            return levels.concat(dm.getLevelsFromDimension(d, localContext.OLAP_ROWS_ID) || []);
        });
        return levelsAtColumns.length === 0 &&
            (levelsAtRows.length === 0 ||
                (localContext.isNonOlapMode() && node.param.extra.isMeasure) ||
                !levelsAtRows.find(function(name) {return node.param.extra.id === name}));
    };

    this.canAddLevelAsColumnGroup = function() {
        var dm = localContext.displayManager;
        var node = localContext.getAvailableFieldsNodeBySelection().first();
        var dimensionIds =  localContext.isOlapMode() ? [node.param.extra.dimensionId] :
            adhocDesigner.getAllLeaves(node).map(function(n) {return n.param.extra.dimensionId});

        var levelsAtColumns = dimensionIds.inject([], function(levels, d) {
            return levels.concat(dm.getLevelsFromDimension(d, localContext.OLAP_COLUMNS_ID) || []);
        });
        var levelsAtRows = dimensionIds.inject([], function(levels, d) {
            return levels.concat(dm.getLevelsFromDimension(d, localContext.OLAP_ROWS_ID) || []);
        });

        return levelsAtRows.length === 0 &&
            (levelsAtColumns.length === 0 ||
                (localContext.isNonOlapMode() && node.param.extra.isMeasure) ||
                !levelsAtColumns.find(function(name) {return node.param.extra.id === name}));
    };

    /**
     * Whether exists siblings for this level
     * which are not added to crosstab
     */
    var canAddSiblingLevels = this.canAddSiblingLevels = function() {
        //TODO: if all sibling levels already added to crosstab or
        //or no siblings present - retur false
        return true;
    };

    /**
     * Whether selected level can be hidden
     */
    var canHideLevel = this.canHideLevel = function() {
        //TODO: add check
        return true;
    };

    /**
     * Whether selected level can be restored
     * (only for hidden levels)
     */
    var canShowLevel = this.canShowLevel = function() {
        //TODO: add check
        return true;
    };

    function canHideSummariesForColumnGroup(){
        return canHideSummariesForGroup(false);
    }


    function canHideSummariesForRowGroup(){
        return canHideSummariesForGroup(true);
    }


    // we can now hide summaries for all groups, now that we deal with collapsed nodes correctly (see bug 24981)
    function canHideSummariesForGroup(isRowGroup){
       return true;
    }

    this.canAddFilter = function(object) {
        var isMeasure = localContext.isOlapMode() && (isNotNullORUndefined(object.isMeasure)
            ? object.isMeasure
            : (object.param.extra && object.param.extra.isMeasure));
        var isAllLevel = isNotNullORUndefined(object.param)
            ? (object.param.extra && object.param.extra.id == localContext.ALL_LEVEL_NAME)
            : object.level == localContext.ALL_LEVEL_NAME;

        var isDuplicate = localContext.isOlapMode() && localContext._isAddingFilterDuplicate(object); 

        return (!isMeasure //We do not support filters for measures in OLAP-mode.
                && !isAllLevel  //We do not support filters for (All) level in 1'st iteration.
                && !adhocDesigner.isSpacerSelected(object)
                && !adhocDesigner.isPercentOfParentCalcSelected(object)
                && !adhocDesigner.isConstantSelected(object)
                && !(object.isParent && object.isParent()))
                && !isDuplicate;
    };

    this._isAddingFilterDuplicate = function (filterCandidate) {
        var isDuplicate = false;
        var filterCandidateName;

        if (filterCandidate.param) {
            filterCandidateName = "[" + filterCandidate.param.extra.dimensionId + "].[" + filterCandidate.param.extra.id + "]";
        } else {
            filterCandidateName = "[" + filterCandidate.dimension + "].[" + filterCandidate.level + "]";
        }
        var filterPods = adHocFilterModule._getFilterPods();
        if (filterPods) {
            filterPods.each(function(object){
                var pod = object.down(FILTER_PANE_PATTERN);
                if (pod && (pod.readAttribute("data-fieldName") == filterCandidateName)) {
                    isDuplicate = true;
                    throw $break;
                }
            });
        }
        return isDuplicate;
    };

    this.getSelectedObject = function() {
        return selObjects.first();
    };

    this.getAvailableFieldsNodeBySelection = function(level, dimension) {
        var item = selObjects.first();

        if (selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA) {
            return selObjects.clone();
        } else if (selectionCategory.area == designerBase.ROW_GROUP_MENU_LEVEL
                || selectionCategory.area == designerBase.COLUMN_GROUP_MENU_LEVEL) {

            var isMeasure;
            var levelName;
            var dimensionName;

            if (!!level && !!dimension) {
                isMeasure = false;
                levelName = level;
                dimensionName = dimension;
            } else if (!!level) {
                isMeasure = true;
                levelName = level;
            } else if (item.axis) {
                //Display Manager object in selection
                isMeasure = item.isMeasure;
                levelName = item.level;
                dimensionName = item.dimension;
            } else {
                //xtab object in selection
                //TODO get dim and lev from crosstab
                alert("Need a way to get dimension name for clicked level from crosstab");
                //return {dimension: "", level: item.name, isMeasure: false};
                return;
            }

            var result = [];

            if (localContext.isOlapMode()) {
                var rootNode = isMeasure
                        ? adhocDesigner.measuresTree.getRootNode()
                        : adhocDesigner.dimensionsTree.getRootNode().childs.find(function(node) {
                            return node.param.extra.id === dimensionName;
                            });

                if (Object.isArray(levelName)) {
                    levelName.each(function(name) {
                        result.push(rootNode.childs.find(function(node) {
                            return node.param.extra.id === name;
                        }));
                    });
                } else {
                    result.push(rootNode.childs.find(function(node) {
                        return node.param.extra.id === levelName;
                    }));
                }
            } else {

                var tree = isMeasure
                    ? adhocDesigner.measuresTree
                    : adhocDesigner.dimensionsTree;

                var findNode = function (id) {
                    var node;

                    $H(dynamicTree.nodes).each(function(pair) {
                        if (pair.value.getTreeId() === tree.id && pair.value.param.id === id) {
                            node = pair.value;
                            throw $break;
                        }
                    });

                    return node;
                };

                if (Object.isArray(levelName)) {
                    levelName.each(function(name) {
                        result.push(findNode(name));
                    });
                } else {
                    result.push(findNode(levelName));
                }
            }

            return result;
        }
    };

    ///////////////////////////////////////////////////////////////
    // Action model functions
    ///////////////////////////////////////////////////////////////
    

    var appendDimensionToRowAxisWithLevel = this.appendDimensionToRowAxisWithLevel = function(level){
        var node = level
            ? localContext.getAvailableFieldsNodeBySelection(level.id, level.groupId).first()
            : localContext.getAvailableFieldsNodeBySelection().first();
        localContext.displayManager.addLevelToRow(node);
    };

    var appendDimensionToColumnAxisWithLevel = this.appendDimensionToColumnAxisWithLevel = function(level){
        var node = level
            ? localContext.getAvailableFieldsNodeBySelection(level.id, level.groupId).first()
            : localContext.getAvailableFieldsNodeBySelection().first();
        localContext.displayManager.addLevelToColumn(node);
    };

    var appendMeasureToRow = this.appendMeasureToRow = function(name) {
        var node = name
            ? localContext.getAvailableFieldsNodeBySelection(name).first()
            : localContext.getAvailableFieldsNodeBySelection().first();
        localContext.displayManager.addLevelToRow(node);
    };

    var appendMeasureToColumn = this.appendMeasureToColumn = function(name) {
        var node = name
            ? localContext.getAvailableFieldsNodeBySelection(name).first()
            : localContext.getAvailableFieldsNodeBySelection().first();
        localContext.displayManager.addLevelToColumn(node);
    };

    var removeLevelFromRow = this.removeLevelFromRow = function() {
        var metadata = localContext.getSelectedObject();
        localContext.displayManager.removeLevelFromRowByIndex(metadata.levelIndex, metadata.dimension);
    };

    var removeLevelFromColumn = this.removeLevelFromColumn = function() {
        var metadata = localContext.getSelectedObject();
        localContext.displayManager.removeLevelFromColumnByIndex(metadata.levelIndex, metadata.dimension);
    };

    this.showDisplayManager = function() {
        localContext.setShowDisplayManager(true);
    };

    this.hideDisplayManager = function() {
        localContext.setShowDisplayManager(false);
    };

    this.isDisplayManagerVisible = function() {
        return crosstabState.showDisplayManager;
    };

    this.pivot = function() {
        pivot();
    };

    this.selectedGroupCanShowSummary = function(){
        var group = getSelectedGroup(adhocDesigner.getSelectedColumnOrGroup()),
            parentGroup = getGroupParent(group);
        if (!parentGroup){
            return !selectedGroupHasSummary();
        }else{
            return parentGroup.expanded === true && !selectedGroupHasSummary();
        }
    };

    this.selectedColumnGroupCanHideSummary = function(){
        var canHideSummary = canHideSummariesForColumnGroup(),
            group = getSelectedGroup(adhocDesigner.getSelectedColumnOrGroup()),
            parentGroup = getGroupParent(group);
        if(canHideSummary){
            if (!parentGroup){
                return selectedGroupHasSummary();
            }else{
                return parentGroup.expanded === true && selectedGroupHasSummary();
            }
        }
        return false;
    };

    this.selectedRowGroupCanHideSummary = function(){
        var canHideSummary = canHideSummariesForRowGroup();
        if(canHideSummary){
            return selectedGroupHasSummary();
        }
        return false;
    };

    function getGroupParent(group) {

        var parentIndex = -1,
            parent;

        localContext.columnGroups.detect(function(el, i) {
            if (el.name === group.name) {
                parentIndex = i - 1;
                return parentIndex;
            }
        });

        if (parentIndex >= 0) {
            parent =  localContext.columnGroups[parentIndex];
        }
        return parent;
    }


    function selectedGroupHasSummary(){
        var group = getSelectedGroup(adhocDesigner.getSelectedColumnOrGroup());
        if(group){
            return group.isShowingSummary === true;
        }
        return false;
    }

    this.selectedRowGroupIsCollapsible = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        return object && object.expandable;
    };

    this.selectedColumnGroupIsCollapsible = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        return object && object.expandable;
    };

    this.expandLevel = function() {
        var selectedObject = adhocDesigner.getSelectedColumnOrGroup();
        expandLevel(selectedObject.dimension, selectedObject.level);
    }

    this.collapseLevel = function() {
        var selectedObject = adhocDesigner.getSelectedColumnOrGroup();
        collapseLevel(selectedObject.dimension, selectedObject.level);
    }

    ///////////////////////////////////////////////////////////////
    // Ajax calls (OLAP)
    ///////////////////////////////////////////////////////////////

    /**
     * Add an unused dimension to axis with a specific level shown
     * @param dimName
     * @param level
     * @param axis
     * @param position
     * @param measurePosition
     */
    function insertDimensionInAxisWithChild(dimName, axis, position, level, measurePosition) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        var params = new Array('dim=' + encodeText(dimName), 'axis=' + axis, 'pos=' + position);
        if (typeof measurePosition != 'undefined') {
        	params.push('measure_pos=' + measurePosition);
        }
        if (isNotNullORUndefined(level)) {
        	params.push('child=' + encodeText(level));
        }
        designerBase.sendRequest('cr_insertDimensionInAxisWithChild', params, callback, {bPost : true});
    }

    function insertDimensionInRowAxisWithLevel(dimName, level, position, measurePosition) {
    	insertDimensionInAxisWithChild(dimName, 'row', position, level, measurePosition);
    }

    function insertDimensionInColumnAxisWithLevel(dimName, level, position, measurePosition) {
    	insertDimensionInAxisWithChild(dimName, 'column', position, level, measurePosition);
    }

    function insertDimensionInRowAxisWithAllLevels(dimName, position) {
    	insertDimensionInAxisWithChild(dimName, 'row', position);
    }

    function insertDimensionInColumnAxisWithAllLevels(dimName, position) {
    	insertDimensionInAxisWithChild(dimName, 'column', position);
    }

    /**
     * move dimension to a new location
     * @param dimName name of a dimension already in an axis
     * @param axis new axis
     * @param position new position
     */
    function moveDimension(dimName, axis, position) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_moveDimension', new Array('dim=' + encodeText(dimName), 'axis=' + axis, 'pos=' + position), callback, null);
    }

    /**
     * remove dimension
     * @param axis axis
     * @param position position
     */
    function removeDimension(axis, position) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_removeDimension', new Array('axis=' + axis, 'pos=' + position), callback, null);
    }

    /**
     * Show a row level
     * @param fieldName
     * @param position
     */
    function showRowLevel(dimName, level) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_showRowLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(level)), callback, null);
    }

    /**
     * Hide a row level
     * @param fieldName
     * @param position
     */
    function hideRowLevel(dimName, level) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_hideRowLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(level)), callback, null);
    }

    /**
     * Show a column level
     * @param fieldName
     * @param position
     */
    function showColumnLevel(dimName, level) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_showColumnLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(level)), callback, null);
    }

    /**
     * Hide a column level
     * @param fieldName
     * @param position
     */
    function hideColumnLevel(dimName, level) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_hideColumnLevel', new Array('f=' + encodeText(dimName), 'level=' + encodeText(level)), callback, null);
    }

    function pivot() {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
            adhocDesigner.resetScroll();
        };
        designerBase.sendRequest('cr_pivot', new Array(), callback, null);
    }

    /**
     * just insert the measure; if no measures dim, add it to end of column axis
     */
    function insertMeasure(measure, position, axis) {
        var callback = function() {
            localContext.standardCrosstabOpCallback();
        };
        var args = ['measure=' + encodeURIComponent(measure)];
        if (!Object.isUndefined(position)) {
        	args.push('pos=' + position);
        }
        if (!Object.isUndefined(axis)) {
        	args.push('axis=' + axis);
        }
        designerBase.sendRequest('cr_insertMeasure', args, callback, null);
    }

    function moveMeasure(from, to) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_moveMeasure', new Array('f='+from,'t='+to), callback, null);
    }

    function removeMeasure(index) {
        if (!Object.isNumber(index)){
            var object = adhocDesigner.getSelectedColumnOrGroup();
            index = object.levelIndex;
        }

        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_removeMeasure', new Array('i='+index), callback, null);
    }

    /**
     * Sends a request to expand a level
     * @param dimension
     * @param level
     */
    function expandLevel(dimension, level) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };

        designerBase.sendRequest('cr_expandLevel', new Array('f=' + encodeText(dimension), 'level=' + encodeText(level)), callback, null);
    }

    /**
     * Sends a request to collapse a level
     * @param dimension
     * @param level
     */
    function collapseLevel(dimension, level) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };

        designerBase.sendRequest('cr_collapseLevel', new Array('f=' + encodeText(dimension), 'level=' + encodeText(level)), callback, null);
    }

    ///////////////////////////////////////////////////////////////
    // Ajax calls (from xtab)
    ///////////////////////////////////////////////////////////////

    /**
     * Sends a request to add a field as a column group
     * @param fieldName
     * @param position
     */
    function insertColumnGroup(fieldName,position) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        if (canAddAsGroup()) {
            designerBase.sendRequest('cr_insertColumnGroup', new Array('f=' + encodeText(fieldName), 'i=' + position), callback, null);
        }
    }


    /**
     * Sends a request to add a field as a row group
     * @param fieldName
     * @param position
     */
    function insertRowGroup(fieldName,position) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        if (canAddAsGroup()) {
            designerBase.sendRequest('cr_insertRowGroup', new Array('f=' + encodeText(fieldName), 'i=' + position), callback, null);
        }
    }

    var removeColumnGroup = this.removeColumnGroup = function(index) {
        if (!index) {
            var object = adhocDesigner.getSelectedColumnOrGroup();
            index = getSelectedDimensionIndex(object);
        }
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_removeColumnGroup', new Array('i='+index), callback, null);
    };



    var removeRowGroup = this.removeRowGroup = function(index) {
        if (!index){
            var object = adhocDesigner.getSelectedColumnOrGroup();
            index = getSelectedDimensionIndex(object);
        }
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_removeRowGroup', new Array('i='+index), callback, null);
    };




    function moveRowGroup(from, to, customCallback) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
            customCallback && customCallback();
        };
        designerBase.sendRequest('cr_moveRowGroup', new Array('f='+from,'t='+to), callback, null);
    }


    function moveColumnGroup(from, to, customCallback) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
            customCallback && customCallback();
        };
        designerBase.sendRequest('cr_moveColumnGroup', new Array('f='+from,'t='+to), callback, null);
    }

    this.toggleExpandCollapseForColumn = function(nodePath, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_toggleExpandCollapseForColumn', new Array('nodePath=' + encodeText(nodePath), 'i=' + index ),callback, null);
    };


    this.toggleExpandCollapseForRow = function(nodePath, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_toggleExpandCollapseForRow', new Array('nodePath=' + encodeText(nodePath), 'i=' + index), callback, null);
    };


    this.switchToRowGroup = function(ind) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = isNotNullORUndefined(ind) ? ind : getSelectedDimensionIndex(object);
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_switchToRowGroup', new Array('i=' + index),callback, null);
    };



    this.switchToColumnGroup = function(ind) {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = isNotNullORUndefined(ind) ? ind : getSelectedDimensionIndex(object);
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_switchToColumnGroup', new Array('i=' + index), callback, null);
    };



    this.deleteRowGroupSummary = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = getSelectedDimensionIndex(object);
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setIncludeAllOnRows', new Array('pos=' + index, 'value=false'), callback, null);
    };


    this.addRowGroupSummary = function() {
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = getSelectedDimensionIndex(object);
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setIncludeAllOnRows', new Array('pos=' + index, 'value=true'), callback, null);
    };


    this.deleteColumnGroupSummary = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = getSelectedDimensionIndex(object);
        var callback = function(){
            localContext.standardCrosstabOpCallback(false, false, false);
        };
        designerBase.sendRequest('cr_setIncludeAllOnColumns', new Array('pos='+index, 'value=false'), callback, null);
    };


    this.addColumnGroupSummary = function(){
        var object = adhocDesigner.getSelectedColumnOrGroup();
        var index = getSelectedDimensionIndex(object);
        var callback = function(){
            localContext.standardCrosstabOpCallback(false, false, false);
        };
        designerBase.sendRequest('cr_setIncludeAllOnColumns', new Array('pos='+index, 'value=true'), callback, null);
    };


    this.sortControlClicked = function(measureIndex) {
        //this condition prevents sending multiple requests at once
        if (requestsInProgress < 1) {
            requestsInProgress++;
            var callback = function() {
                requestsInProgress--;
                localContext.standardCrosstabOpCallback(false, false, false);
            };
            designerBase.sendRequest('cr_sortControlClicked', new Array('i=' + measureIndex), callback, null);
        }
    };

    /**
     * Used to update a calculated field and the canvas view
     */
    var updateCalcFieldAndView = this.updateCalcFieldAndView = function(fieldName, formulaId, argList){
        var callback = function(){
            localContext.updateCustomFieldCallback();
            localContext.standardCrosstabOpCallback();
            adhocDesigner.updateAllFieldLabels();
            if(adhocDesigner.isInUse(fieldName)){
                designerBase.sendRequest("co_generateFilterPanel", new Array("decorate=no"), null, {"target" : "filter-container"});
            }
        };
        designerBase.sendRequest("co_updateFieldAndView", new Array("fieldName=" + encodeText(fieldName), "formula=" + formulaId, "args=" + argList), callback, null);
    };


    function setCategoryForRowGroup(catName, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setRowGroupCategorizer', new Array('cat='+encodeText(catName),'i='+index), callback, null);
    }


    function setCategoryForColumnGroup(catName, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setColumnGroupCategorizer', new Array('cat='+encodeText(catName),'i='+index), callback, null);
    }


    function setMask(thisMask, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setDataMask', new Array('m=' + encodeText(thisMask), 'i=' + index), callback, null);
    }


    function setSummaryFunction(thisFunction, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setSummaryFunction', new Array('f=' + thisFunction, 'i=' + index), callback, null);
    }


    function setSummaryFunctionAndMask(thisFunction, thisMask, index) {
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setSummaryFunctionAndDataMask', new Array('f='+ thisFunction,'m='+ encodeText(thisMask),'i='+ index), callback, null);
    }

    function getOverflowRowGroups(){
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_showInUnsafeRowMode', [], callback, null);

    }


    function getOverflowColumnGroups(){
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_showInUnsafeColumnMode', [], callback, null);

    }

    this.getDrillUrl = function() {
        var baseURL = removeTrailingPound(document.location.href); //in case href added #

        var topicRegex = new RegExp("&realm=[^&]+");
        var topicParam = baseURL.match(topicRegex);
        var flowRegex = new RegExp("&_flowExecutionKey=[^&]+");
        var flowParam = baseURL.match(flowRegex);
        var eventIdRegex = new RegExp("&_eventId=[^&]+");
        var eventIdParam = baseURL.match(eventIdRegex);

        var url = 'flow.html?_flowId=adhocFlow' +
                        (topicParam ? topicParam : '') +
                        flowParam +
                        eventIdParam +
                        '&reportType=table' +
                        '&usePreparedState=true' +
                        '&clientKey=' + Math.floor(Math.random()*9999999999999); //ensure new client session
        return url;
    };

    this.drill = function(rowGroupPathIndex, colGroupPathIndex) {
//        var element = getTouchedElement(evt);
        if(isIPad()) JRS.vars.win = window.open();

//        var callback = function() {
//            localContext.standardOpCallback();
//            if(isIPad()) {
//                JRS.vars.win.location = localContext.getDrillUrl();
//            } else {
//                window.name = "";
//                runPopup = window.open(localContext.getDrillUrl(), "drillTable");
//                runPopup.focus();
//            }
//        };


        var callback = function(json) {
//            localContext.standardOpCallback();
            if (json.success) {
                var windowPopper = function(){
                    if(isIPad()) {
                        JRS.vars.win.location = localContext.getDrillUrl();
                    } else {
                        window.name = "";
                        runPopup = window.open(localContext.getDrillUrl(), "drillTable");
                        runPopup.focus();
                    }
                };
                setTimeout(windowPopper,0);
            }
        };

        localContext.allowDrill = true;

        var jsonObject = adHocFilterModule.createJSONDrillThrough(
                localContext.rowNodeList[rowGroupPathIndex], localContext.columnNodeList[colGroupPathIndex]);

        (!isIPad() || !JRS.vars.element_scrolled) && designerBase.sendRequest('cr_prepareDrillTableState',
            new Array("drillThroughAdhocFilter=" + jsonObject), callback, {'mode':AjaxRequester.prototype.EVAL_JSON});
        return false;
    };

    this.getDrillOlapUrl = function(tempARUName) {
        return 'flow.html?_flowId=viewAdhocReportFlow&clientKey=' + clientKey + "&reportUnit=" + tempARUName + "&noReturn=true&decorate=no";
    };

    this.drillOLAP = function(rowGroupPathIndex, colGroupPathIndex) {
        var callback = function(json) {
            if (json.tempARUName) {
                localContext.tempARUName = json.tempARUName;
                if(isIPad()) {
//                    JRS.vars.win.location = localContext.getDrillOlapUrl(json.tempARUName);
                } else {
                    windowPopUp = window.open("", "jr");
                    windowPopUp.location = localContext.getDrillOlapUrl(json.tempARUName);
                }
            } else {
                // do nothing. Seems like there's some error. Standard alert should pop-up
            }
        };

        localContext.allowDrill = true;

        var jsonObject = adHocFilterModule.createJSONDrillThrough(
                localContext.rowNodeList[rowGroupPathIndex], localContext.columnNodeList[colGroupPathIndex]);

        (!isIPad() || !JRS.vars.element_scrolled) && designerBase.sendRequest('cr_prepareDrillTableStateOLAP',
            new Array("drillThroughAdhocFilter=" + jsonObject), callback, {'mode':AjaxRequester.prototype.EVAL_JSON});
        return false;
    };


    ///////////////////////////////////////////////////////////////
    // Ajax calls (toolbar)
    ///////////////////////////////////////////////////////////////

    var getIsHideEmptyRows = this.getIsHideEmptyRows = function() {
        return crosstabState.hideEmptyRows;
    };

    var hideEmptyRowsEquals = this.hideEmptyRowsEquals =  function(thisValue) {
        return localContext.getIsHideEmptyRows() === thisValue;
    };

    var setHideEmptyRows = this.setHideEmptyRows = function() {

        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setProperty', new Array("name=hideEmptyRows", "value=true"),callback, null);
    };


    //function setUnhideEmptyRows() {
    var setUnhideEmptyRows = this.setUnhideEmptyRows = function() {
        //alert("THORICK  adhoc.olap.crosstab.js  setUnhideEmptyRows called");
        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_setProperty', new Array("name=hideEmptyRows", "value=false"),callback, null);
    };

    var setShowDisplayManager = this.setShowDisplayManager = function(show) {

        var callback = function(){
            localContext.standardCrosstabOpCallback();
        };
        designerBase.sendRequest('cr_showDisplayManager', new Array("name=showDisplayManager", "value=" + show), callback, null);
    };

    ///////////////////////////////////////////////////////////////
    // Ajax callbacks
    ///////////////////////////////////////////////////////////////


    /**
     * Standard callback
     */
    this.standardOpCallback = function() {
        localContext.standardCrosstabOpCallback();
    };


    this.getCallbacksForPivot = function(){
        localContext.standardOpCallback();
    };

    /**
     * Operations callbacks
     */

    // update available tree also (re-entrance)
    this.undoAndRedoCallback = function() {
        adhocDesigner.undoAndRedoCallback();
        localContext.standardCrosstabOpCallback();
    },


    /**
     * Custom field callback
     */
    this.updateCustomFieldCallback = function() {
        this.standardCrosstabOpCallback();
    };


    this.reInitOverlayCallback = function(){
    };


    /**
     * Standard table callback
     */
    this.standardCrosstabOpCallback = function() {
        initGlobals();
        designerBase.unSelectAll();
        adhocDesigner.unSelectAvailableTreeNodes();
        adhocDesigner.render();
        localContext.displayManager
        && localContext.displayManager.reInitialize({
            rows: crosstabState.rowGroups,
            columns: crosstabState.columnGroups
        });
    };

};

///////////////////////////////////////////////////
// Finally initialize (this code must come last)
///////////////////////////////////////////////////

window.localContext = new AdHocCrosstab();
designerBase.superInitAll();
