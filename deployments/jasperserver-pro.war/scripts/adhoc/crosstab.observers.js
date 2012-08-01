/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocCrosstab.mouseDownHandler = function(evt){};

AdHocCrosstab.mouseUpHandler = function(evt){
    var it = AdHocCrosstab;
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
                    AdHocCrosstab.expandLevel(dimension, level);
                } else {
                    AdHocCrosstab.collapseLevel(dimension, level);
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
            AdHocCrosstab.deselectAllSelectedOverlays();
            crossTabMultiSelect.selectXtabGroupMember(matched, evt);
        }


        matched = matchAny(element,  [localContext.ROW_GROUP_OVERFLOW_PATTERN, localContext.COLGROUP_GROUP_OVERFLOW_PATTERN], true);
        if(matched){
            if($(matched).hasClassName("colOverflow")){
                var canShowMoreColumns = $(matched).readAttribute("data-canShowMore");
                if (canShowMoreColumns === "true") {
                    AdHocCrosstab.retrieveOverflowColumnGroups();
                }
            }else{
                AdHocCrosstab.retrieveOverflowRowGroups();
            }
        }
    }
};

AdHocCrosstab.mouseOverHandler = function(evt){};

AdHocCrosstab.mouseOutHandler = function(evt){};

AdHocCrosstab.mouseClickHandler = function(evt){
    var anchor = null;
    var element = evt.element();
    var regex = new RegExp('\\d+', 'g');

    if(element.match(AdHocCrosstab.DRILL_THROUGH_PATTERN)){
        crossTabMultiSelect.deselectAllGroupMembers();
        element = element.parentNode;

        if ($(element)) {
            anchor = element.identify();
            if (localContext.state.inDesignView) {
                if (anchor.startsWith("measureBucketDrill_")) {
                    var rowPathIndex = regex.exec(anchor)[0];
                    var columnPathIndex = regex.exec(anchor)[0];
                    if (!AdHocCrosstab.isOlapMode()) {
                        AdHocCrosstab.drill(rowPathIndex, columnPathIndex);
                    } else {
                        AdHocCrosstab.drillOLAP(rowPathIndex, columnPathIndex);
                    }
                    return;
                }
                //  Let the user know why their Drill Through Click is not responding
                if (anchor.startsWith("measureBucketNoDrillParentChild_")) {
                    dialogs.systemConfirm.show(adhocDesigner.getMessage("ADH_1213_DRILLTHROUGH_NOT_SUPPORTED_PARENT_CHILD", 15000));
                }
            }
        }
    }

    if(matchAny(element, localContext.MEASURE_SORT_ICON_PATTERN, false)) {
        var id = element.up().identify();
        var index = parseInt(localContext.ENDS_WITH_A_NUMBER_REGEX.exec(id)[0]);
        var isRowGroup = id.startsWith("rowGroup");
        // TODO: remove hardcoded axes names
        var measuresCount = AdHocCrosstab.state.getLevelsFromDimension(adhocDesigner.MEASURES, isRowGroup ? 'row' : 'column').length;

        if (localContext.state.inDesignView && localContext.isNonOlapMode()) {
            localContext.sortControlClicked(index % measuresCount);
            Event.stop(evt);
        }
    }
};

AdHocCrosstab.treeMenuHandler = function(event) {
    var matched = null;
    var node = event.memo.node;
    var evt = event.memo.targetEvent;

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
};

AdHocCrosstab.contextMenuHandler = function(evt) {
    var element = evt.element();
    var id = element.identify();

    var index;
    var groupObj;
    var isRowGroup;

    if (matchAny(element, [AdHocCrosstab.COLUMN_GROUP_MEMBER_PATTERN, AdHocCrosstab.ROW_GROUP_MEMBER_PATTERN], true)) {
        //Members

        if ($(element)) {
            groupObj = {
                id : id,
                path : element.readAttribute("data-path"),
                value : element.readAttribute("data-fieldValue"),
                isSummary : element.readAttribute("data-isSummaryHeader"),
                expandable: element.readAttribute("data-expanable") === 'true'
            };

            if (!designerBase.isObjectInSelection(groupObj, "id")) {
                crossTabMultiSelect.selectXtabGroupMember(element, evt);
            }
            AdHocCrosstab.showGroupMemberMenu(evt);
        }
    } else if (matchAny(element, [AdHocCrosstab.GROUP_LEVEL_PATTERN], false)) {
        //Groups

        while ($(element).hasClassName("dummy")) {
            element = element.nextSiblings()[0];
        }

        id = element.identify();
        isRowGroup = id.startsWith("rowGroup");
        var dimension = element.readAttribute("data-dimension");
        index = parseInt(AdHocCrosstab.ENDS_WITH_A_NUMBER_REGEX.exec(id)[0]);

        if ($(element)) {
            groupObj = {
                id: (isRowGroup ? "rowGroup_" : "colGroup_") + index,
                name: element.readAttribute("data-level"), //for filters
                level: element.readAttribute("data-level"),
                dimension: dimension,
                expandable: element.readAttribute("data-expanable") === 'true',
                axis: isRowGroup ? 'row' : 'column',
                isMeasure: (dimension === adhocDesigner.MEASURES),
                groupIndex: index
            };

            if (groupObj.dimension !== AdHocCrosstab.NULL_DIMENSION) {
                if (!(designerBase.isObjectInSelection(groupObj, "id") && designerBase.isObjectInSelection(groupObj, "groupIndex"))) {
                    crossTabMultiSelect.selectXtabGroupLabel(groupObj);
                }

                if (groupObj.isMeasure) {
                    isRowGroup ? AdHocCrosstab.showMeasuresDimensionRowMenu(evt) : AdHocCrosstab.showMeasuresDimensionColumnMenu(evt);
                } else {
                    isRowGroup ? AdHocCrosstab.showRowGroupMenu(evt) : AdHocCrosstab.showColumnGroupMenu(evt);
                }
            }
        }
    } else if (matchAny(element, [AdHocCrosstab.MEASURE_PATTERN], false)) {
        //Measures

        while ($(element).hasClassName("dummy")) {
            element = element.nextSiblings()[0];
        }

        index = parseInt(AdHocCrosstab.ENDS_WITH_A_NUMBER_REGEX.exec(id)[0]);
        isRowGroup = id.startsWith("rowGroup");
        var measuresCount = AdHocCrosstab.state.measures.length;
        var levelIndex = index % measuresCount;
        var name = AdHocCrosstab.state.measures[levelIndex].name;

        if ($(element)) {
            groupObj = {
                id: (isRowGroup ? "rowGroup_" : "colGroup_") + index,
                name: name, //for filters
                level: name,
                dimension: adhocDesigner.MEASURES,
                expandable: element.readAttribute("data-expanable") === 'true',
                axis: isRowGroup ? 'row' : 'column',
                isMeasure: true,
                index: levelIndex
            };

            if (!(designerBase.isObjectInSelection(groupObj, "id") && designerBase.isObjectInSelection(groupObj, "index"))) {
                crossTabMultiSelect.selectXtabGroupLabel(groupObj);
            }

            isRowGroup ? AdHocCrosstab.showMeasureRowMenu(evt) : AdHocCrosstab.showMeasureColumnMenu(evt);
        }
    }
};

AdHocCrosstab.lmHandlersMap = {
    // Common methods for both axes
    addItems : function(nodes, pos, axis) {
        var dims = nodes[0].extra.isMeasure ? nodes[0].extra.dimensionId :
            _.map(nodes, function(n) {return n.extra.dimensionId;}).join(',');
        AdHocCrosstab.insertDimensionInAxisWithChild(dims, axis, pos, _.pluck(nodes, 'id').join(','));
    },
    measureReorder : function(measure, to) {
        AdHocCrosstab.moveMeasure(measure, to);
    },

    column : {
        addItem : function(dim, pos, level, levelPos, isMeasure, uri) {
            AdHocCrosstab.insertDimensionInAxisWithChild(dim, 'column', pos, level, levelPos, isMeasure, uri);
        },
        removeItem : function(item, index) {
            if (item.isMeasure) {
                AdHocCrosstab.removeMeasure(index);
            } else {
                AdHocCrosstab.hideColumnLevel(item.dimension, item.level);
            }
        },
        moveItem : function(dim, from, to) {
            AdHocCrosstab.moveDimension(dim, 'column', to);
        },
        switchItem : function(dim, from, to) {
            AdHocCrosstab.moveDimension(dim, 'column', to);
        },
        contextMenu : function(event, options) {
            AdHocCrosstab.selectFromDisplayManager(options.targetEvent, options.extra, designerBase.COLUMN_GROUP_MENU_LEVEL);
            AdHocCrosstab.showDisplayManagerColumnMenu(options.targetEvent);
        }
    },
    row : {
        addItem : function(dim, pos, level, levelPos, isMeasure, uri) {
            AdHocCrosstab.insertDimensionInAxisWithChild(dim, 'row', pos, level, levelPos, isMeasure, uri);
        },
        removeItem : function(item, index) {
            if (item.isMeasure) {
                AdHocCrosstab.removeMeasure(index);
            } else {
                AdHocCrosstab.hideRowLevel(item.dimension, item.level);
            }
        },
        moveItem : function(dim, from, to) {
            AdHocCrosstab.moveDimension(dim, 'row', to);
        },
        switchItem : function(dim, from, to) {
            AdHocCrosstab.moveDimension(dim, 'row', to);
        },
        contextMenu : function(event, options) {
            AdHocCrosstab.selectFromDisplayManager(options.targetEvent, options.extra, designerBase.ROW_GROUP_MENU_LEVEL);
            AdHocCrosstab.showDisplayManagerRowMenu(options.targetEvent);

        }
    }
};

AdHocCrosstab.crosstabTreeMenuHandler = function(event) {
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

/**
 * method to be called when a level is selected from the display manager by right click
 */
AdHocCrosstab.selectFromDisplayManager = function(event, node, area) {
    designerBase.unSelectAll();
    var isMultiSelect = adhocDesigner.isMultiSelect(event, area);
    //update select area
    selectionCategory.area = area;
    var isSelected = adhocDesigner.isAlreadySelected(node);
    adhocDesigner.addSelectedObject(event, node, isMultiSelect, isSelected);
    Event.stop(event);
};
