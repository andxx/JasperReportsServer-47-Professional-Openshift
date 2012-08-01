/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

/**
 * Used to add fields to the canvas
 * @param event
 */
adhocDesigner.addFieldToCanvas = function(){
    if(localContext.getMode() === designerBase.TABLE){
        AdHocTable.addFieldAsColumn();
    }else if(localContext.getMode() === designerBase.CROSSTAB){
        localContext.addFieldAsLastMeasure();
    }else if(localContext.getMode() === designerBase.CHART){
        localContext.addFieldAsMeasure();
    }
};
/**
 * Check if field is numeric
 * @param fieldName
 */
adhocDesigner.checkIfFieldIsNumeric = function(fieldName) {
    var col = adhocDesigner.findFieldByName(fieldName);
    return (col != null) && (col.type == 'Numeric');
};
/**
 * Used to check if a string is a valid number
 * @param number
 */
adhocDesigner.isValidNumericValue = function(number){
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
};
/**
 * Check if selected fields are numeric
 */
adhocDesigner.checkIfAllSelectedAreNumeric = function(){
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
};

adhocDesigner.checkIfFieldIsDateType = function(fieldName){
    var col = adhocDesigner.findFieldByName(fieldName);
    return (col != null) && (col.type == 'Date');
};
/**
 * Check if selected types are date types
 */
adhocDesigner.checkIfSelectedAreDateTypes = function(){
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
};

adhocDesigner.collectFields = function(nodes, includeSubSets, testFn){
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
};
/**
 * Find the field by its name
 * @param fieldName
 */
adhocDesigner.findFieldByName = function(fieldName) {
    var node = null;
    if(localContext.state.allColumns){
        localContext.state.allColumns.each(function(field){
            if(field.name){
                if(field.name == fieldName){
                    node = field;
                    throw $break;
                }
            }
        });
    }

    return node;
};
/**
 * Used to get the name of a field from the selected object
 * @param object
 */
adhocDesigner.getNameForSelected = function(object) {
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
};
/**
 * Get the field name of a selected object
 */
adhocDesigner.getFieldName = function(){
    var so = designerBase.getSelectedObject();
    return so ? this.getNameForSelected(so) : '';
};
/**
 * Find the field index based on the field name
 * @param fieldName
 */
adhocDesigner.getFieldIndexByName = function(fieldName) {
    if(isNotNullORUndefined(localContext.state.allColumns)){
        var size = localContext.state.allColumns.length;
        for (var i = 0; i < size; i++) {
            var f = localContext.state.allColumns[i];
            if (f.name == fieldName) {
                return i;
            }
        }
    }
    return -1;
};
adhocDesigner.moveToDimensions = function () {
    if (selObjects.first()) {
        var nodes = selObjects.clone();
        adhocDesigner.moveToMeasuresOrAttributes(nodes);
        var ids = nodes.collect(function(node) {return node.param.id}).join(",");
        adhocDesigner.changeFieldAttributeOrMeasure(ids, "attribute");
    }
};

adhocDesigner.moveToMeasures = function () {
    if (selObjects.first()) {
        var nodes = selObjects.clone();
        adhocDesigner.moveToMeasuresOrAttributes(nodes);
        var ids = nodes.collect(function(node) {return node.param.id}).join(",");
        adhocDesigner.changeFieldAttributeOrMeasure(ids, "measures");
    }
};

/*
 * method to be called when a a field is selected from the available fields list
 * @param event
 * @param node
 */
adhocDesigner.selectFromAvailableFields = function(event, node) {
    // If method was invoked not through event machinery, then simply add node to selection.
    if (!event) {
        this.addSelectedObject(event, node, false, true);
    }
    var isMultiSelect = this.isMultiSelect(event, designerBase.AVAILABLE_FIELDS_AREA);
    //update select area
    selectionCategory.area = designerBase.AVAILABLE_FIELDS_AREA;
    var isSelected = this.isAlreadySelected(node);
    this.addSelectedObject(event, node, isMultiSelect, isSelected);
    //Event.stop(event); // iPad: Node of the tree stays selected after context menu has been opened.
};

/**
 * Update fields in use.
 * @param fieldName
 */
adhocDesigner.updateFieldsInUse = function(fieldName){
    for(var i = 0; i < fieldName.length; i++){
        localContext.state.fieldsInUse.push(fieldName[i]);
    }
};

/**
 * Check to see if the field is currently in use
 * @param fieldName
 */
adhocDesigner.isInUse = function(fieldName) {
    var inUse = false;
    if (localContext.state.fieldsInUse != null) {
        for (var i = 0; i < localContext.state.fieldsInUse.length; i++) {
            if (localContext.state.fieldsInUse[i] == fieldName) {
                inUse = true;
                break;
            }
        }
    }
    inUse = (inUse || adhocDesigner.hasDependencyOnIt(fieldName));
    return inUse;
};

/**
 * Used to delete a calculated field
 */
adhocDesigner.deleteCalculatedField = function(){
    adhocCalculatedFields.deleteField();
};

/**
 * Used to determine if a selected object is a percent based calculated field
 */
adhocDesigner.isPercentOfParentCalcSelected = function(object) {
    if(!object){
        object = designerBase.getSelectedObject();
    }
    if(object){
        var fieldName = adhocDesigner.getNameForSelected(object);
        return adhocDesigner.isPercentOfParentCalc(fieldName);
    }
    return false;
};
/**
 * Tests to see if field is a percent of parent calc.
 * @param fieldName
 */
adhocDesigner.isPercentOfParentCalc = function(fieldName){
    var field = adhocDesigner.findFieldByName(fieldName);
    if (field != null && field.formulaRef != null) {
        var args = field.formulaRef.args;
        if (args != null && args.length > 0) {
            return args[0]['percentOfParent'] === true;
        }
    }
    return false;
};
/**
 * Check to see if the field has a dependency in another calculated field
 * @param fieldName
 */
adhocDesigner.hasDependencyOnIt = function(fieldName) {
    if (localContext.state.allColumns != null && localContext.state.allColumns.length != null) {
        for (var i = 0; i < localContext.state.allColumns.length; i++) {
            var f = localContext.state.allColumns[i];
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
};
/**
 * Check if we can present the custom field option
 */
adhocDesigner.canCreateCustomFieldOption = function(){
    return (adhocDesigner.checkIfAllSelectedAreNumeric() && !adhocDesigner.isPercentOfParentCalcSelected());
};
/**
 * Used to update a calculated fields css leaf's
 */
adhocDesigner.updateAllFieldLabels = function(){
    if (!isDesignView) {
        return;
    }
    var it = adhocDesigner;
    var trees = [it.dimensionsTree,it.measuresTree];
    _.each(trees,function(tree){
        _.each(it.getAllLeaves(null, tree),function(leaf) {
            if (adhocCalculatedFields.isCustomField(leaf)) {
                var customField = it.findFieldByName(leaf.param.id);
                if (customField) {
                    leaf.name = customField.label;
                    leaf.param.label = customField.label;
                    leaf.param.cssClass = it.isInUse(leaf.param.id) ? 'calculatedField dependency' : 'calculatedField';
                    leaf.refreshStyle();
                }
            }
        });
        tree.renderTree();
    })
};


