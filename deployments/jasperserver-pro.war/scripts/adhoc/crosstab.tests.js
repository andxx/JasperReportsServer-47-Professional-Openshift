/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

AdHocCrosstab.canMoveToDimensions  = function() {
    var fieldInUse = selObjects.find(function(obj) {
        return localContext.isInUse(obj.param.extra.id, obj.param.extra.isMeasure);
    });

    return !fieldInUse;
};

AdHocCrosstab.canMoveToMeasures = function() {
    //for now same logic as for move to dimensions
    return AdHocCrosstab.canMoveToDimensions();
};

AdHocCrosstab.canSaveReport = function(){
    if (localContext.isNonOlapMode()) {
        //In non olap mode we only need a measure tu run a report
        return localContext.state.hasMeasures;
    } else {
        //in OLAP mode we need a measure and something in columns to run a report
        return localContext.state.hasMeasures &&
            localContext.state.columnGroups.first() &&
            localContext.state.columnGroups.first().dimensionName !== localContext.NULL_DIMENSION;
    }
};

AdHocCrosstab.isGroupSelected = function(selectedObject){
    var id = selectedObject.id;
    return id.startsWith("rowGroup_") ||  id.startsWith("colGroup_");
};

AdHocCrosstab.isRowGroupSelected = function(selectedObject){
    var id = selectedObject.id;
    return id.startsWith("rowGroup_");
};

AdHocCrosstab.isColumnGroupSelected = function(selectedObject){
    var id = selectedObject.id;
    return id.startsWith("colGroup_");
};

AdHocCrosstab.isCurrentDateType = function(thisType) {
    var group = AdHocCrosstab.getSelectedGroup(adhocDesigner.getSelectedColumnOrGroup());
    if(group){
        return group.categorizerName == thisType;
    }
    return false;
};

AdHocCrosstab.isSelectedMeasureNumeric = function() {
    var object = AdHocCrosstab.getSelectedMeasure();
    if(object){
        var type = localContext.getSuperType(object.type);
        return (type == "int" || type == "dec");
    }
    return false;
};

AdHocCrosstab.isDateType = function(){
    var object = adhocDesigner.getSelectedColumnOrGroup();
    if(object){
        var isGroup = AdHocCrosstab.isGroupSelected(object);
        var group = AdHocCrosstab.getSelectedGroup(object);
        if (group) {
            var canReBucket = group.canReBucket === true;
            var dateDataType = group.type === "date";
            return (isGroup && canReBucket && dateDataType);
        }
    }
    return false;
};

AdHocCrosstab.isSelectedMeasureItemType = function(type) {
    var object = AdHocCrosstab.getSelectedMeasure();
    if(object){
        var selectedType = localContext.getSuperType(object.type);
        return (selectedType === type);
    }
    return false;
};

AdHocCrosstab.isSelectedMeasureMask = function(mask) {
    var object = AdHocCrosstab.getSelectedMeasure();
    if(object){
        return (object.functionMaskOrDefault === mask)
            || (!object.functionMaskOrDefault && mask === defaultMasks[localContext.INTEGER_TYPE_DISPLAY]);
    }
    return false;
};

AdHocCrosstab.isSelectedSummaryFunction = function(sFunc) {
    var object = AdHocCrosstab.getSelectedMeasure();
    if(object){
        return (object.functionOrDefault === sFunc);
    }
    return false;
};

AdHocCrosstab.canSwitchToRow = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    return (localContext.isNonOlapMode() || AdHocCrosstab.state.getDimensionsCount(object.axis) > 1);
};

AdHocCrosstab.canAddSliceFilter = function() {
    var doesSelectionContainNotSliceableObject = selObjects.find(function(obj) {
        return !obj.isSliceable;
    });

    return selObjects.first() && !doesSelectionContainNotSliceableObject;
};

AdHocCrosstab.canMoveUpOrLeft = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = AdHocCrosstab.getSelectedDimensionIndex(object);
    return (index > 0);
};

AdHocCrosstab.canMoveDownOrRight = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    var index = AdHocCrosstab.getSelectedDimensionIndex(object);
    return index < AdHocCrosstab.state.getDimensionsCount(object.axis) - 1;
};

AdHocCrosstab.canMoveMeasureUpOrLeft = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();
    return (object.index > 0);
};

AdHocCrosstab.canMoveMeasureDownOrRight = function() {
    var object = adhocDesigner.getSelectedColumnOrGroup();

    var dimension = object.isMeasure ? adhocDesigner.MEASURES : object.dimension;
    var total =  AdHocCrosstab.state.getLevelsFromDimension(dimension, object.axis).length;

    return object.index < total - 1;
};
/**
 * Whether selected dimension can be added to crosstab
 * either as column or as row
 */
AdHocCrosstab.canAddDimensionAsRowGroup = function() {
    var node = localContext.getSelectedObject();
    if (!node.hasChilds()) {
        node = node.parent;
    }

    if (localContext.isOlapMode()) {
        if (localContext.state.getDimensionsCount('column') === 0) {
            return false;
        }

        var dimension = node.param.extra.id,
            levelsAtColumns = AdHocCrosstab.state.getLevelsFromDimension(dimension, 'column'),
            levelsAtRows = AdHocCrosstab.state.getLevelsFromDimension(dimension, 'row');

        return levelsAtColumns.length === 0 && (levelsAtRows.length < node.getChildCount());
    } else {
        var tree = dynamicTree.trees[node.getTreeId()];
        var leaves = adhocDesigner.getAllLeaves(node, tree);
        var leavesStringArray = adhocDesigner.getAllLeaves(node, tree).collect(function(node) {
            return node.param.extra.id;
        });

        if (leaves[0].param.extra.isMeasure) {
            var measuresInColumns = localContext.state.getFilteredMeasureList('column');
            return measuresInColumns.length === 0;

        } else {
            var allUsedFields = _.pluck(localContext.state.getFilteredList(), 'name');
            return _.difference(leavesStringArray, allUsedFields).length > 0;
        }
    }
};

AdHocCrosstab.canAddDimensionAsColumnGroup = function() {
    var node = localContext.getSelectedObject();
    if (!node.hasChilds()){
        node = node.parent;
    }

    if (localContext.isOlapMode()) {
        var dimension = node.param.extra.id;
        var levelsAtColumns = AdHocCrosstab.state.getLevelsFromDimension(dimension, 'column');
        var levelsAtRows = AdHocCrosstab.state.getLevelsFromDimension(dimension, 'row');

        return levelsAtRows.length === 0 && (levelsAtColumns.length < node.getChildCount());
    } else {
        var tree = dynamicTree.trees[node.getTreeId()];
        var leaves = adhocDesigner.getAllLeaves(node, tree);
        var leavesStringArray = adhocDesigner.getAllLeaves(node, tree).collect(function(node) {
            return node.param.extra.id;
        });

        if (leaves[0].param.extra.isMeasure) {
            var measuresInRows = localContext.state.getFilteredMeasureList('row');
            return measuresInRows.length === 0;

        } else {
            var allUsedFields = _.pluck(localContext.state.getFilteredList(), 'name');
            return _.difference(leavesStringArray, allUsedFields).length > 0;
        }
    }
};

/**
 * Whether selected level can be added to crosstab
 * either as column or as row
 */
AdHocCrosstab.canAddLevelAsRowGroup = function() {
    if (localContext.state.getDimensionsCount('column') === 0 && localContext.isOlapMode()) {
        return false;
    }

    var node = localContext.getSelectedObject();
    var dimensionIds =  localContext.isOlapMode() ? [node.param.extra.dimensionId] :
        adhocDesigner.getAllLeaves(node).map(function(n) {return n.param.extra.dimensionId});

    var levelsAtColumns = dimensionIds.inject([], function(levels, d) {
        return levels.concat(AdHocCrosstab.state.getLevelsFromDimension(d, 'column') || []);
    });
    var levelsAtRows = dimensionIds.inject([], function(levels, d) {
        return levels.concat(AdHocCrosstab.state.getLevelsFromDimension(d, 'row') || []);
    });
    return levelsAtColumns.length === 0 &&
        (levelsAtRows.length === 0 ||
            (localContext.isNonOlapMode() && node.param.extra.isMeasure) ||
            !levelsAtRows.find(function(name) {return node.param.extra.id === name}));
};

AdHocCrosstab.canAddLevelAsColumnGroup = function() {
    var node = localContext.getSelectedObject();
    var dimensionIds =  localContext.isOlapMode() ? [node.param.extra.dimensionId] :
        adhocDesigner.getAllLeaves(node).map(function(n) {return n.param.extra.dimensionId});

    var levelsAtColumns = dimensionIds.inject([], function(levels, d) {
        return levels.concat(AdHocCrosstab.state.getLevelsFromDimension(d, 'column') || []);
    });
    var levelsAtRows = dimensionIds.inject([], function(levels, d) {
        return levels.concat(AdHocCrosstab.state.getLevelsFromDimension(d, 'row') || []);
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
AdHocCrosstab.canAddSiblingLevels = function() {
    //TODO: if all sibling levels already added to crosstab or
    //or no siblings present - return false
    return true;
};

/**
 * Whether selected level can be hidden
 */
AdHocCrosstab.canHideLevel = function() {
    //TODO: add check
    return true;
};

/**
 * Whether selected level can be restored
 * (only for hidden levels)
 */
AdHocCrosstab.canShowLevel = function() {
    //TODO: add check
    return true;
};

AdHocCrosstab.canHideSummariesForColumnGroup = function(){
    return AdHocCrosstab.canHideSummariesForGroup(false);
};


AdHocCrosstab.canHideSummariesForRowGroup = function(){
    return AdHocCrosstab.canHideSummariesForGroup(true);
};


// we can now hide summaries for all groups, now that we deal with collapsed nodes correctly (see bug 24981)
AdHocCrosstab.canHideSummariesForGroup = function(isRowGroup){
   return true;
};

AdHocCrosstab.canAddFilter = function(object, errorMessages) {
    var isMeasure = localContext.isOlapMode() && (isNotNullORUndefined(object.isMeasure)
        ? object.isMeasure
        : (object.param.extra && object.param.extra.isMeasure));
    var isAllLevel = isNotNullORUndefined(object.param)
        ? (object.param.extra && object.param.extra.id == localContext.ALL_LEVEL_NAME)
        : object.level == localContext.ALL_LEVEL_NAME;

    var isDuplicate = localContext.isOlapMode() && localContext._isAddingFilterDuplicate(object);

    //We do not support filters for measures in OLAP-mode.
    if (isMeasure) {
        errorMessages && errorMessages.push(addFilterErrorMessageMeasureAdd);
        return false;
    }
    //We do not support filters for (All) level in 1'st iteration.
    if (isAllLevel) {
        errorMessages && errorMessages.push(addFilterErrorMessageAllLevelAdd);
        return false;
    }
    // Cannot add group of fields as filter.
    if (object.isParent && object.isParent()) {
        errorMessages && errorMessages.push(addFilterErrorMessageGroupAdd);
        return false;
    }
    if (adhocDesigner.isSpacerSelected(object)) {
        errorMessages && errorMessages.push(addFilterErrorMessageSpacerAdd);
        return false;
    }
    if (adhocDesigner.isPercentOfParentCalcSelected(object)) {
        errorMessages && errorMessages.push(addFilterErrorMessagePercentOfParentCalcFieldAdd);
        return false;
    }
    if (adhocDesigner.isConstantSelected(object)) {
        errorMessages && errorMessages.push(addFilterErrorMessageConstantAdd);
        return false;
    }
    if (isDuplicate) {
        errorMessages && errorMessages.push(addFilterErrorMessage);
        return false;
    }

    return true;
};

AdHocCrosstab._isAddingFilterDuplicate = function (filterCandidate) {
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

AdHocCrosstab.getSelectedObject = function() {
    return selObjects.first();
};

AdHocCrosstab._getAvailableFieldsNodeBySelection = function (level, dimension, item) {
    var meta = {};

    if (selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA) {
        if (item.hasChilds()) {
            meta.isMeasure = item.treeId === "measuresTree";
            meta.dimension = meta.isMeasure ? item.treeId : item.param.id;
            meta.uri = localContext.isNonOlapMode() ? item.param.uri : undefined;
            meta.level = null;
        } else {
            meta.isMeasure = !!item.param.extra.isMeasure;
            meta.level = item.param.extra.dimensionId && item.param.id;
            meta.dimension = item.param.extra.dimensionId || item.param.extra.id;
        }
        meta.index = -1;
    } else if (selectionCategory.area == designerBase.ROW_GROUP_MENU_LEVEL
            || selectionCategory.area == designerBase.COLUMN_GROUP_MENU_LEVEL) {

        if (level || dimension) {
            meta.isMeasure = !dimension;
            meta.level = level;
            meta.dimension = meta.isMeasure ? adhocDesigner.MEASURES : dimension;
            meta.index = -1;
        } else if (item.axis) {
            //Display Manager object in selection
            meta = item;
        } else {
            //xtab object in selection
            //TODO get dim and lev from crosstab
            alert("Need a way to get dimension name for clicked level from crosstab");
            return;
        }
    }
    return meta;
};

AdHocCrosstab.getAvailableFieldsNodeBySelection = function(level, dimension) {
    return AdHocCrosstab._getAvailableFieldsNodeBySelection(level, dimension,selObjects.first());
};

AdHocCrosstab.getAvailableFieldsNodesBySelection = function(level, dimension) {
    var metas = [];
    for (var i = 0; i<selObjects.length; i++){
        metas.push(AdHocCrosstab._getAvailableFieldsNodeBySelection(level, dimension,selObjects[i]));
        metas[i].extra = metas[i];
        metas[i].dimensionId = metas[i].dimension;
        metas[i].id = metas[i].level;
    }
    return metas;
};