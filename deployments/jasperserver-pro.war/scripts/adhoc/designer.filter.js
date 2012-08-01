/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */


////////////////////////////////////////////////////////////////
// Dynamic Filtering Code.
////////////////////////////////////////////////////////////////

//Object creation
var adHocFilterModule = {

    //constants
    INT : "Integer",
    DOUBLE : "Decimal",
    LONG : "Long",
    BOOLEAN : "Boolean",
    STRING : "String",
    DATE : "Date",
    TIMESTAMP : "Timestamp",
    ERROR_MESSAGE : dynamicFilterInputError,
    AUTO_SUBMIT_TIME : filterAutoSubmitTimer,
    CONTROLLER_PREFIX : "co",  // using the common controller for ajax requests

    //list of operators and their filter type
    filterType : {
        'equals' : "singleSelect",
        'notEqual' : "singleSelect",
        'equals_d' : "singleInput",
        'notEqual_d' : "singleInput",
        'equals_n' : "singleInput",
        'notEqual_n' : "singleInput",
        'in' : "multipleSelect",
        'notin' : "multipleSelect",
        'contains' : "singleInput",
        'notcontains' : "singleInput",
        'startsWith' : "singleInput",
        'notstartsWith' : "singleInput",
        'endsWith' : "singleInput",
        'notendsWith' : "singleInput",
        'greater' : "singleInput",
        'less' : "singleInput",
        'greaterOrEqual' : "singleInput",
        'lessOrEqual' : "singleInput",
        'between' : "multipleInput",
        'notBetween' : "multipleInput",
        'isAnyValue' : "functionSelect"
    },

    selectedFilterPod : null,
    MENU_CLASS : "menu vertical contex",
    DATE_LEN : 10,
    MENU_PAD : 5,

    /**
     * Used to show filter pod menus
     * @param event
     * @param podId
     */
    showFilterMenu : function(event, podId){
        this.selectedFilterPod = podId;
        var mutton = this.getFilterPodMutton(podId);
        var offset = $(mutton).cumulativeOffset();
        var offsetScroll = $(mutton).cumulativeScrollOffset();
        var topOffset = offset["top"] - offsetScroll["top"];
        var coordinates = {"menuTop": topOffset + this.MENU_PAD, "menuLeft": offset[0]};
        actionModel.showDynamicMenu("filterPodMenu", event, toolbarButtonModule.TOOLBAR_MENU_CLASS, coordinates,
            localContext.state.actionmodel);
        Event.stop(event);
    },

    /**
     * This function is used to check options visible status
     */

    isFilterThisPodOptionsVisible : function(){
        var podId = adHocFilterModule.selectedFilterPod;
        return ($(podId).hasClassName("showingOptions") && adHocFilterModule.isFilterThisPodMaximized());

    },

    /**
     * This function is used to check options Hidden status
     */
    isFilterThisPodOptionsHidden : function(){
        var podId = adHocFilterModule.selectedFilterPod;
        return ((!$(podId).hasClassName("showingOptions")) && adHocFilterModule.isFilterThisPodMaximized());

    },

    /**
     * This function is used to hide the control in a filter pod
     * @param podId  the id of the filter pod.
     */
    toggleFilterOperation : function(podId){
        if($(podId)){
            if($(podId).hasClassName("showingOptions")){
                $(podId).removeClassName("showingOptions")
            }else{
                $(podId).addClassName("showingOptions")
            }
        }
    },

    /**
     * Used to add a filter for a particular field.
     */
    addFilterPods : function(){
        var JSONObject = null;
        var success = false;

        if(selectionCategory.area === designerBase.AVAILABLE_FIELDS_AREA){
            JSONObject = this.getListOfSelectedFields();
            if(JSONObject.length > 0){
                success = true;
            }
        }else if(selectionCategory.area === designerBase.LEGEND_MENU_LEVEL){
        	JSONObject = selObjects[0].legendName;
            if(JSONObject.length > 0){
                success = true;
            }
        }else if(selectionCategory.area === designerBase.COLUMN_LEVEL){
            JSONObject = this.getListOfSelectedTableColumns();
            if(JSONObject.length > 0){
                success = true;
            }
        }else if(selectionCategory.area === designerBase.GROUP_LEVEL){
            JSONObject = this.getListOfSelectedTableGroups();
            if(JSONObject.length > 0){
                success = true;
            }
        }else if(selectionCategory.area === designerBase.ROW_GROUP_MENU_LEVEL || selectionCategory.area === designerBase.COLUMN_GROUP_MENU_LEVEL){
            JSONObject = this.getListOfSelectedXtabGroups();
            if(JSONObject.length > 0){
                success = true;
            }
        }

        if(success){
            this.addAdhocFilter(JSONObject)
        }
    },

    /**
     * Used to delete filter pod.
     * @param podId the id of the filter pod
     */
    deleteFilterPod : function(podId){
        var filterPod = $(podId);
        if (filterPod) {
            var editable = $(podId).readAttribute("data-editable");
            $(filterPod).remove();
        }
    },


    /**
     * Used to toggle the filter pod.
     * @param event
     * @param podId
     */
    toggleFilterPod : function(event, podId){
        var filterPod = $(podId);
        if(filterPod){
            if($(filterPod).hasClassName("minimized")){
                $(filterPod).removeClassName("minimized");
            }else{
                $(filterPod).addClassName("minimized");
            }
        }
    },


    /**
     * Used to dynamically change the input controls in a filter pod
     * @param podId the id of the filter pod.
     * @param type The data-type of the filter field
     */
    changeInputType : function(podId, type, newFilterType){
        //cancel any triggered submission
        this.cancelAdhocFilterSubmit();
        var filterPod = $(podId);
        var filterType = $(filterPod).readAttribute("data-filterType");
        var operation = null;
        var selectedOperation = null;

        if (localContext.getMode() === designerBase.OLAP_CROSSTAB) {
            var filterInput = $(podId + "_filterInput");

            if(!isNotNullORUndefined(newFilterType)){
                operation = $(podId + "_filterOps");
                selectedOperation = operation.options[operation.selectedIndex].value;
                newFilterType = this.filterType[selectedOperation];
            }

            if (filterType !== newFilterType) {
                if (newFilterType === "multipleSelect") {
                    $(filterPod).setAttribute("data-filterType", newFilterType);
                    filterInput.setAttribute("multiple", "multiple");
                    filterInput.up("label").addClassName("multiple");
                } else if (newFilterType === "singleSelect") {
                    $(filterPod).setAttribute("data-filterType", newFilterType);
                    filterInput.removeAttribute("multiple");
                    filterInput.up("label").removeClassName("multiple");
                }
            }

            adHocFilterModule.editFilterRequest(podId);
        } else {
            operation = $(podId + "_filterOps");
            selectedOperation = operation.options[operation.selectedIndex].value;
            var isDate = (type === "Date");

            if(!isNotNullORUndefined(newFilterType)){
                newFilterType = this.filterType[selectedOperation];
            }

            if(newFilterType === "multipleSelect" || newFilterType === "functionSelect"){
                this.showAllOption(podId);
            }else{
                this.hideAllOption(podId);
            }

            //get content section
            if(filterType !== newFilterType){
                var child = null;
                var parent = $(podId + "_filterInputContainer");

                if (isNotNullORUndefined($(parent))) {
                    $(parent).childElements().each(
                            function(cnode){
                                Element.remove(cnode);
                            });

                    if (newFilterType === "multipleSelect") {
                        child = this._createMultipleSelect(podId);
                        $(parent).appendChild(child);
                    }else if(newFilterType === "singleSelect"){
                        child = this._createSingleSelect(podId);
                        $(parent).appendChild(child);
                    }else if(newFilterType === "singleInput"){
                        child = this._createTextInput(podId, true, isDate);
                        $(parent).appendChild(child);
                        if(type === "Date"){
                            $(child).removeClassName("input");
                            $(child).removeClassName("text");
                            $(child).addClassName("picker");
                            this.constructDateControl(child);
                        }
                    }else if(newFilterType === "multipleInput"){
                        child = this._createTextInput(podId, true, isDate);
                        $(parent).appendChild(child);
                        if(type === "Date"){
                            $(child).removeClassName("input");
                            $(child).removeClassName("text");
                            $(child).addClassName("picker");
                            this.constructDateControl(child);
                        }
                        child = this._createTextInput(podId, false, isDate);
                        $(parent).appendChild(child);
                        if(type === "Date"){
                            $(child).removeClassName("input");
                            $(child).removeClassName("text");
                            $(child).addClassName("picker");
                            this.constructDateControl(child);
                        }
                    }
                    $(filterPod).setAttribute("data-filterType", newFilterType);
                }
            }
            // populate default values and save the filter
            this.populateValuesAndSave(podId, selectedOperation, type);
        }
    },

    /**
     *  Filter inputs are populated with default values(max, min or both) and then filter is saved.
     *
     * @param podId
     * @param selectedOperation
     */
    populateValuesAndSave: function(podId, selectedOperation, filterType) {
        // Retrieve available values for select items
        if (_.includes(adHocFilterModule.filterType[selectedOperation], 'Select')) {
            var selectElement = jQuery('#' + podId + '_filterInput');
            var oldValues = selectElement.val();
            selectElement.html('');
            this.getFieldValues(podId, function() {
                // Set previously selected value - actual for multiselects
                selectElement.val(oldValues);
                // if filter contains only one value available we should save it
                // Bug #28161 - IC refactoring: Ad Hoc Report - String filter with NULL as the only value in Report is shown as IC of incorrect type(multiselect)
                var size = jQuery('option', selectElement).size();
                if (size === 1) {
                    adHocFilterModule.editFilterRequest(podId);
                }
                else if (size > 7) {
                    jQuery('#'+podId).find('.sizer').removeClass('hidden');
                }
            });
        } else if (_.contains(
            [adHocFilterModule.INT, adHocFilterModule.DOUBLE, adHocFilterModule.LONG, adHocFilterModule.DATE, adHocFilterModule.TIMESTAMP],
            filterType)) { // Case for integral types: Integers, Doubles, Dates, etc

            this.getMaxMinValues(podId, function(min, max) {
                var first, second;
                if (("equals_d" === selectedOperation)
                    || ("equals" === selectedOperation)
                    || ("notEqual" === selectedOperation)
                    || ("notEqual_d" === selectedOperation)
                    || ("greater" === selectedOperation)
                    || ("greaterOrEqual" === selectedOperation)) {
                    first = min;
                } else if (("less" === selectedOperation) || ("lessOrEqual" === selectedOperation)) {
                    first = max;
                } else if (("between" === selectedOperation) || ("notBetween" === selectedOperation)) {
                    first = min;
                    second = max;
                }
                if (first || second) {
                    this.populateMultiInputBoxes(podId, first, second);
                    adHocFilterModule.editFilterRequest(podId);
                }
            });
        } else { // or simply save our filter type change in other cases
            adHocFilterModule.editFilterRequest(podId);
        }
    },


    /**
     * Used to dynamically create the multiselect object
     * @param podId the id of the filter pod.
     */
    _createMultipleSelect : function(podId){
        var selectContainerId = podId + "_filterInput";
        var selectContainer = document.createElement('select');
        $(selectContainer).setAttribute("id", selectContainerId);
        $(selectContainer).setAttribute("multiple", "multiple");
        $(selectContainer).addClassName("multiple");
        $(selectContainer).observe("change", function () {
            adHocFilterModule.onChangeForSelect(selectContainerId)
        });
        var label = this._constructLabel();
        $(label).addClassName("select multiple");
        $(label).writeAttribute("title", "Filter Value");
        $(label).writeAttribute("for", selectContainerId);
        $(label).appendChild(this._constructSpan("wrap", "Value:"));
        $(label).appendChild(selectContainer);
        $(label).appendChild(jQuery('<div class="sizer vertical hidden" style="position:relative;"><span class="ui-icon ui-icon-grip-solid-horizontal"></span> </div>')[0]);
        layoutModule.createSizer(label);

        return label;

    },



    /**
     * Used to create the single select drop-down object
     * @param podId the id of the filter pod.
     */
    _createSingleSelect : function(podId){
        var dropDownId = podId + "_filterInput";
        var dropDown = document.createElement('select');
        $(dropDown).setAttribute("id", dropDownId);
        $(dropDown).addClassName("single-select");
        $(dropDown).observe("change", function () {
            adHocFilterModule.onChangeForSelect(dropDownId)
        });
        var label = this._constructLabel();
        $(label).addClassName("select");
        $(label).writeAttribute("title", "Filter Value");
        $(label).writeAttribute("for", dropDownId);
        $(label).appendChild(this._constructSpan("wrap", "Value:"));
        $(label).appendChild(dropDown);
        return label;
    },

    /**
     * Used to the single input object
     * @param podId the id of the filter pod.
     */
    _createTextInput : function(podId, firstLevel, isDate) {
        var inputId = null;
        if(firstLevel){
            inputId =  podId + "_filterInput";
        }else{
            inputId =  podId + "_filterInput2";
        }
        var textInput = document.createElement('input');
        $(textInput).setAttribute("id", inputId);
        $(textInput).setAttribute("type", "text");
        if (isDate) {
            // jQuery used on purpose, because in this case input became jQuery datepicker
            // and blocks native event, triggering jQuery event instead. Prototype.js will not work here!
            jQuery(textInput).change(function () {
                    adHocFilterModule.onChangeForDateInput(podId)
                }
            );
        }
        var label = this._constructLabel();
        $(label).addClassName("input text");
        $(label).appendChild(this._constructSpan("wrap", "Value:"));
        $(label).appendChild(textInput);
        $(label).appendChild(this._constructSpan("message warning", this.ERROR_MESSAGE));
        return label;
    },

    constructDateControl : function(input){
        jQuery(input).find('input[type="text"]').datepicker({
            showOn:"button",
            buttonText:"",
            dateFormat:"yy-mm-dd",
            changeYear:true,
            changeMonth: true,
            showButtonPanel: true,
            onChangeMonthYear:function (year, month, inst) {
                var newDate = inst.input.datepicker("getDate");
                if (newDate && !(newDate.getFullYear() === year && newDate.getMonth() === month - 1)) {
                    newDate.setFullYear(year);
                    newDate.setMonth(month - 1);
                    inst.input.datepicker("setDate", newDate);
                    adHocFilterModule.onChangeForDateInput(inst.input.parents(".filter").attr("id"));
                }
            },
            beforeShow:jQuery.datepicker.movePickerRelativelyToTriggerIcon
        }).next().addClass('button').addClass('picker');
    },


    _constructSpan : function(cssClass, innerMessage){
        var span = document.createElement("span");
        if (cssClass) {
            $(span).addClassName(cssClass);
        }
        if(innerMessage){
            $(span).innerHTML = innerMessage;
        }
        return span;
    },



    _constructLabel : function(){
        var label = document.createElement("label");
        $(label).addClassName("control");
        return label;
    },


    /**
     * Used to populate multiselect dom objects
     * @param PodId the id of the filter pod.
     * @param ajaxResponseData
     */
    _populateSelectBoxes : function(PodId, ajaxResponseData) {
        var multiselectObj = PodId + "_filterInput";
        var selectBox = $(multiselectObj);
        var isSelected = this.isAllOptionSelected(PodId);

        //add remaining values from DB
        for (var index = 0; index < ajaxResponseData.length; index++) {
            var option = document.createElement('option');
            option.text = this.decode(ajaxResponseData[index]);
            option.value = this.decode(ajaxResponseData[index]);
            option.title = this.decode(ajaxResponseData[index]);

            if(isSelected){
                option.selected = "selected";
            }
            try{
                selectBox.add(option, null);
            }catch(exception){
                selectBox.add(option);
            }
        }
    },


    /**
     * This is a method responsible for sending the dynamic filtering query
     * @param podId the id of the filter pod.
     */
    createJSONFilterRequest : function(podId) {
        if (localContext.getMode() === designerBase.OLAP_CROSSTAB) {
             //This method gets called from editFilterRequest, and the non-OLAP version
             //implements the "isAnyValue()" hack if "All" is checked,
             // or just forms a JSON filter based on the controls.
             //Since we are not using isAnyValue(), just call createGenericJSONFilterObj().
            return this.createGenericJSONFilterObj(podId);
        } else {
            //Hack
            var operation = $(podId + "_filterOps");
            var selectedOperation = operation.options[operation.selectedIndex].value.toLowerCase();
            var useIsAnyForIn = (selectedOperation === "in");
            var useIsAnyForRange = (selectedOperation === "between");

            //check if operation type is "isAnyValue"
            var filterType = null;
            var JSONObj = null;
            var filterPod = $(podId);
            var fieldName = filterPod.readAttribute("data-fieldName");

            var checkBoxButton = $(podId + "_all");

            if(!checkBoxButton.disabled && checkBoxButton.checked && (useIsAnyForIn || useIsAnyForRange)){
                JSONObj = this.createJSONAnyValueFilter(fieldName);
            }else{
                if(selectedOperation === "notin"){
                    filterType = "multipleSelect";
                    //change filter type
                    $(filterPod).setAttribute("data-filterType", filterType);
                }else if(selectedOperation === "notbetween"){
                    filterType = "multipleInput";
                    $(filterPod).setAttribute("data-filterType", filterType);
                }
                JSONObj = this.createGenericJSONFilterObj(podId, filterType);
            }
            return JSONObj;
        }
    },


    /**
     * Used to create a JSON object for the filter request.
     * @param podId the id of the filter pod.
     */
    createGenericJSONFilterObj : function(podId, filterType){
        var filterExprArray = [];
        var dropDown = $(podId + "_filterOps");
        var dataType = $(podId).readAttribute("data-dataType");
        var operation =  dropDown.options[dropDown.selectedIndex].value;
        var fieldName = $(podId).readAttribute("data-fieldName");

        if(!isNotNullORUndefined(filterType)){
            filterType = $(podId).readAttribute("data-filterType");
        }

        var filterExpr = {};
        filterExpr.type = "operator";
        filterExpr.operands = [];
        if(operation.toLowerCase() === "between"){
            filterExpr.name = "in";
        }else if(operation.toLowerCase() === "notbetween"){
            filterExpr.name = "notin";
        }else if(["equals_d", "equals_n"].indexOf(operation.toLowerCase()) >= 0 ){
            filterExpr.name = "equals";
        }else if(["notequal_d", "notequal_n"].indexOf(operation.toLowerCase()) >= 0){
            filterExpr.name = "notEqual";
        }else{
            filterExpr.name = operation;
        }

        //get first operand
        var operand1 = {};
        operand1.type = "variable";
        operand1.name = encodeText(fieldName);

        //get 2nd operand
        var operand2 = this.getFilterValues(podId, filterType, dataType);
        //add to filter expression
        filterExpr.operands.push(operand1);
        filterExpr.operands.push(operand2);

        /**
         * Since we are dealing with only the "AND" operator, we can assume that the combining logical operator
         * will always be an "AND". With this current structure i am hoping it will be easy to add the "OR"
         * operator... finger's crossed..:-)
         */
        //add to array
        filterExprArray.push(filterExpr);
        return Object.toJSON(filterExprArray);
    },


    /**
     * Used to add a new filter to the state
     * @param fieldName name of field we are filtering on
     */
    createJSONAnyValueFilter : function(fieldName) {
        var filterReqObj = [];
        var expr = {};
        expr.type = "operator";
        expr.name = "isAnyValue";
        expr.operands = [];
        //get first operand
        var operand = {};
        operand.type = "variable";
        operand.name = fieldName;

        expr.operands.push(operand);

        filterReqObj.push(expr);
        return Object.toJSON(filterReqObj);

    },

    /**
     * Used to create the JSON expression for the slicing request
     * @param includeOrExclude. Condition used for expression
     */
    createJSONSliceFilter : function(includeOrExclude) {
        var expression = {};
        expression.type = "path_expression";
        expression.includeOrExclude = includeOrExclude;
        expression.pathList = [];

        for(var index = 0; index < selObjects.length; index++){
            //make sure it is not a summary cell
            var object = selObjects[index];
            if(!this.isSummary(object)) {
                expression.axis = (this.getSelectedObjectId(object).substr(0, 3) == "row") ? "row" : "column";
                expression.pathList.push(encodeText(this.getSelectedObjectPath(object)));
            }
        }

        expression.pathList = expression.pathList.uniq(); // Fix for Bug 23012

        return Object.toJSON(expression);
    },


    isSummary : function(object){
        if (object) {
            if (localContext.getMode() === designerBase.CROSSTAB || localContext.getMode() === designerBase.OLAP_CROSSTAB) {
                return object.isSummary === "true";
            } else {
                return object.getAttribute("data-issummaryheader") === "false";
            }
        }
        return false;
    },


    getSelectedObjectPath : function(object) {
        if (localContext.getMode() === designerBase.CROSSTAB || localContext.getMode() === designerBase.OLAP_CROSSTAB) {
            return object.path;
        } else {
            return object.getAttribute("data-path");
        }
    },

    getSelectedObjectId : function(object) {
        if (localContext.getMode() === designerBase.CROSSTAB || localContext.getMode() === designerBase.OLAP_CROSSTAB) {
            return object.id;
        } else {
            return object.getAttribute("id");
        }
    },


    /**
     * Used to create the JSON object for drill through
     * @param rowGroupPath
     * @param colGroupPath
     */
    createJSONDrillThrough : function(rowGroupPath, colGroupPath){
        var expression = {};
        expression.type = "path_expression";
        expression.pathList = [];

        expression.pathList.push(encodeURIComponent(rowGroupPath));
        expression.pathList.push(encodeURIComponent(colGroupPath));

        return Object.toJSON(expression);
    },



    /**
     * Used to get the operand with its filter values
     * @param podId the id of the filter pod.
     * @param filterType type of filter. indicating whether or not it is a single select, multiselect single input etc..
     * @param dataType original data type
     */
    getFilterValues : function(podId, filterType, dataType){
        var operand = {};
        var inputId = podId + "_filterInput";

        if(filterType === "singleSelect" || filterType === "singleInput"){
            var temp = $(inputId).value;
            operand.type = "literal";
            operand.value = this.formatOrEncodeExpr(dataType, temp);
            operand.dataType = dataType;
        }else if(filterType === "multipleSelect"){
            operand.type = "list";
            operand.value = [];
            var multiSelect = $(inputId);
            for(var index = 0; index < multiSelect.length; index++){
                if (multiSelect.options[index].selected) {
                    var literalObj = {};
                    var selectedValue = multiSelect.options[index].value;
                    literalObj.type = "literal";
                    literalObj.value = this.formatOrEncodeExpr(dataType, selectedValue);
                    literalObj.dataType = dataType;
                    operand.value.push(literalObj);
                }
            }

        }else if(filterType === "multipleInput"){
            operand.type = "range";
            operand.start = this.formatOrEncodeExpr(dataType, $(inputId).value);
            operand.end = this.formatOrEncodeExpr(dataType, $(inputId+"2").value);
            operand.dataType = dataType
        }

        return operand;
    },


    ////////////////////////////////////////////////////////////////
    // Helper functions for filtering
    ////////////////////////////////////////////////////////////////


    getListOfSelectedTableGroups : function(){
        var fieldList = [];

        for(var index = 0; index < selObjects.length; index++){
            var obj = selObjects[index];
            if (this.canAddFilter(obj)){
                fieldList.push(obj.fieldName);
            }
        }
        return fieldList.join(",");
    },


    getListOfSelectedXtabGroups : function(){
        if (localContext.getMode() === designerBase.OLAP_CROSSTAB) {
            return selObjects.collect(function(obj) {
                return this.canAddFilter(obj) ?
                    {dimensionId: obj.dimension, id: obj.level} : null;
            }.bind(adHocFilterModule)).compact();
        } else {
            return _.inject(selObjects, function(fieldList, field) {
                if (this.canAddFilter(field)) {
                    fieldList.push(field.name);
                }
                return fieldList;
            }, [], this).join(',');
        }
    },

    getListOfSelectedTableColumns : function(){
        var fieldList = [];

        for(var index = 0; index < selObjects.length; index++){
            var obj = selObjects[index];
            if (this.canAddFilter(obj)){
                fieldList.push($(obj.header).getAttribute("data-fieldName"));
            }
        }

        return fieldList.join(",");
    },

    defaultFieldJSONBuilder: function(node) {
        return {
            dimensionId: node.param.extra.dimensionId,
            id: node.param.extra.id
        }
    },

    getListOfSelectedFields : function(builder){
        var selectedNodes = adhocDesigner.getSelectedTreeNodes();

        if (localContext.getMode() === designerBase.OLAP_CROSSTAB) {
            builder = Object.isFunction(builder) ? builder : adHocFilterModule.defaultFieldJSONBuilder;

            return selectedNodes.collect(function(node) {
                if(node.isParent()){
                    var validatedChilds = node.childs.detect(function(child) {
                        return adHocFilterModule.canAddFilter(child);
                    });

                    return validatedChilds.collect(builder);
                }else{
                    return adHocFilterModule.canAddFilter(node) ? builder(node) : null;
                }
            }).compact().flatten();
        } else {
            var fieldList = "";
            for(var index = 0; index < selectedNodes.length; index++){
                var node = selectedNodes[index];
                var fieldNames = [];
                if(node.isParent()){
                    var nodeChildren = node.childs;
                    for(var j = 0; j < nodeChildren.length; j++){
                        var fieldName = nodeChildren[j].param.id;
                        if (this.canAddFilter(nodeChildren[j])) {
                            fieldNames.push(fieldName);
                        }
                    }
                    if (fieldNames.length === 0) {
                        continue; //nothing to add
                    }

                }else{
                    if (this.canAddFilter(node)) {
                        fieldNames.push(node.param.id);
                    } else {
                        continue; //nothing to add
                    }
                }
                if (fieldList) {
                    fieldList += ",";
                }
                fieldList += fieldNames.join(',');
            }
            return fieldList;
        }
    },

    getFilterPodMutton : function(podId){
        return $(podId).down(".mutton");
    },



    /**
     * Helper method for selecting all option is multiselect
     * @param podId
     */
    selectAllValues : function(podId){
        var multiSelectId = podId + "_filterInput";
        var multiSelect = $(multiSelectId);
        if (multiSelect) {
            for(var index = 0; index < multiSelect.length; index++){
                multiSelect.options[index].selected = true;
            }
        }
    },


    /**
     * Helper function for deselecting all options in multiselect
     * @param podId
     */
    deselectAllValues : function(podId){
        var multiSelectId = podId + "_filterInput";
        var multiSelect = $(multiSelectId);
        if (multiSelect) {
            for(var index = 0; index < multiSelect.length; index++){
                multiSelect.options[index].selected = false;
            }
        }
    },



    /**
     * Helper used to check the all option..
     * @param podId the id of the filter pod.
     */
    selectAllOption : function(podId, dataType){
        var filterPod = null;
        var checkBox = $(podId + "_all");
        var currentFilterType = $(podId).readAttribute("data-filterType");
        var filterType = null;

        if(checkBox == null || typeof checkBox === "undefined") {
            return;
        }

        if (localContext.getMode() === designerBase.OLAP_CROSSTAB) {
            if(checkBox.checked){
                adHocFilterModule.selectAllValues(podId);
                filterPod = $(podId);
                //after we complete we then call the timed submit....
                adHocFilterModule.adhocFilterSubmit(podId);
            }
        } else {
            if(checkBox.checked){
                filterType = "functionSelect";
                if (dataType === this.STRING || dataType === this.BOOLEAN || (this.isDataTypeNumeric(dataType) && currentFilterType === "multipleSelect")) {
                    this.selectAllValues(podId);
                }else if(this.isDataTypeNumeric(dataType) || dataType === this.DATE || dataType === this.TIMESTAMP){
                    this.getMaxMinValues(podId, function(min, max) {
                        this.populateMultiInputBoxes(podId, min, max);
                    });
                }
                //change filter type
                filterPod = $(podId);
                //this is a hack becos we decided to have the all option satisfy both multiselect and ranges in numerics
                //need to think of a cleaner way of doing this... Papanii
                if(this.isDataTypeNumeric(dataType) && currentFilterType === "multipleSelect"){
                    filterPod.writeAttribute("data-filterType", "multipleSelect");
                }else{
                    filterPod.writeAttribute("data-filterType", filterType);
                }

                //after we complete we then call the timed submit....
                this.adhocFilterSubmit(podId);

            }else{
                if (dataType === this.STRING || dataType === this.BOOLEAN || (this.isDataTypeNumeric(dataType) && currentFilterType === "multipleSelect")) {
                    filterType = "multipleSelect";
                    this.deselectAllValues(podId);
                    this.inputNotificationError(podId, filterType);
                }else if(this.isDataTypeNumeric(dataType) || dataType === this.DATE || dataType === this.TIMESTAMP){
                    filterType = "multipleInput";
                }
                //change filter type
                filterPod = $(podId);
                filterPod.writeAttribute("data-filterType", filterType);
            }
        }
    },


    /**
     * Helper used to deselect the all checkbox
     * @param podId the id of the filter pod
     */
    deselectAllCheckBox : function(podId){
        var checkBox = $(podId + "_all");
        if(checkBox){
            checkBox.checked = false;
        }
    },


    /**
     * Helper used to select the all options checkbox
     * @param podId the id of the filter pod
     */
    selectAllCheckBox : function(podId){
        var checkBox = $(podId + "_all");
        if(checkBox){
            checkBox.checked = true;
        }
    },


    hideAllOption : function(podId){
        var allOptionContainer = $(podId + "_allOption");
        if(allOptionContainer){
            this.deselectAllCheckBox(podId);
            allOptionContainer.addClassName("hidden");
        }
    },


    showAllOption : function(podId){
        var allOptionContainer = $(podId + "_allOption");
        if(allOptionContainer && allOptionContainer.hasClassName("hidden")){
            this.deselectAllCheckBox(podId);
            allOptionContainer.removeClassName("hidden");
        }
    },



    /**
     * Helper used to check if all checkbox has been selected
     * @param podId the id of the filter pod
     */
    isAllOptionSelected : function(podId){
        var checkBoxButton = $(podId + "_all");
        return checkBoxButton && checkBoxButton.checked;
    },

    /**
     * Helper used to determine whether or not to un-check the all options check box
     * @param podId the id of the filter pod
     */
    inputExpressionChange : function(podId){
        var checked = this.isAllOptionSelected(podId);
        if(checked){
            var operation = $(podId + "_filterOps");
            var selectedOperation = operation.options[operation.selectedIndex].value;
            var filterType = this.filterType[selectedOperation];
            this.deselectAllCheckBox(podId);
            //change filter type
            var filterPod = $(podId);
            filterPod.setAttribute("data-filterType", filterType);
        }
    },


    /**
     * This function is used to either format or encode expression values
     * @param value the value we are formatting
     * @param dataType the data type of the number
     */
    formatOrEncodeExpr : function(dataType, value){
        var formattedExpr = null;
        if(dataType === this.DOUBLE){
            formattedExpr = value.replace(",", ".");
        }else{
            var temp = value;
            temp.toUpperCase();
            if(temp == "[NULL]"){
                formattedExpr = value;
            }else{
                formattedExpr = encodeText(value);
            }
        }
        return formattedExpr;
    },


    /**
     * Helper function to deal with different types of decimal points.
     * @param value  The value we are formatting..
     * @param dataType data ype we are dealing witn
     */
    formatNumericValue : function(value, dataType){
        if(dataType === this.LONG || dataType === this.INT){
            value = value.replace(",", "");
            value = value.replace(".", "");
            return value;

        }else if(dataType === this.DOUBLE){
            if(decimalSeparator === "."){
                value = value.replace(",", "");
            }else if(decimalSeparator === ","){
                value = value.replace(".", "");
            }
            //now convert decimals to "." since JAVA deals with "."
            value = value.replace(decimalSeparator, ".");
            return value;
        }else{
            return value;
        }
    },



    /**
     * This method returns the unique id prior to incrementing.
     */
    getUniqueId : function() {
        return ++localContext.state.numberOfExistingFilters;
    },


    /**
     * This function is used to decode <, & and > in strings
     * @param str String we are decoding
     */
    decode : function(str){
        str= str.replace(/\&amp;/g,'&');
        str= str.replace(/\&lt;/g,'<');
        str= str.replace(/\&gt;/g,'>');
        return str;
    },


    /**
     * Helper function used to populate input fields with values.
     * Values are populated if input is empty. Already entered value isn't overwritten.
     *
     * @param podId
     * @param first
     * @param second
     */
    populateMultiInputBoxes : function(podId, first, second) {
        //update text boxes
        if (first) {
            var input1 = $(podId + "_filterInput");
            if (input1 && !input1.value) {
                input1.value = first;
            }
        }
        if (second) {
            var input2 = $(podId + "_filterInput2");
            if (input2 && !input2.value) {
                input2.value = second;
            }
        }
    },



    /**
     * Used to get the dataType for a particular field.
     * @param fieldName
     */
    getFieldDataType : function(fieldName){
        var dataType = null;
        for (var i = 0; i < localContext.state.allColumns.length; i++) {
            var object = localContext.state.allColumns[i];
            if(object.name === fieldName){
                dataType = object.type;
                break;
            }
        }
        return dataType;
    },

    /**
     * Used to get the display label for a particular field
     * @param fieldName
     */
    getFieldDisplayLabel : function(fieldName){
        var label = null;
        for (var i = 0; i < localContext.state.allColumns.length; i++) {
            var object = localContext.state.allColumns[i];
            if(object.name === fieldName){
                label = object.label;
                break;
            }
        }
        return label;
    },


    /**
     * Helper used to determine if input is a valid number
     * @param number number we are validating
     */
    isValidNumericValue : function(number){
        var numberOfDecimalsPoints = 0;
        var numberOfMinusSigns = 0;
        var indexOfDecimal = -1;
        var valid = false;

        for(var index = 0; index < number.length; index++){
            var character = number.charAt(index);
            if(character == "-" && index != 0){
                return false;
            }
            if(isNaN(character) && (character === "," || character === ".")){
                numberOfDecimalsPoints++;
                indexOfDecimal = index;
            }
        }

        valid = !(numberOfDecimalsPoints > 1);
        if((indexOfDecimal > -1) && valid){
            return (indexOfDecimal < (number.length - 1));
        }else{
            return valid;
        }
    },


    checkValidInput : function(evt, dataType, currentValue){
        var character = null;
        var element = evt.element();
        if(dataType === this.INT || dataType === this.LONG){
                character = this.getKeyCharFromEvt(evt);
                if(character == "-"){
                    return true;
                }
            return verifyIsDigitInput(evt);
        }else if(dataType === this.DOUBLE){
                character = this.getKeyCharFromEvt(evt);
                if(character == "-"){
                    return true;
                }
            if(verifyIsInputNumericDecimalSeparator(evt)){
                return (numberOfDecimals(element.value) < 1);
            }else{
                return verifyIsDigitInput(evt);
            }
        }else{
            return true;
        }
    },



    getKeyCharFromEvt : function(evt){
        evt = getEvent(evt);
        var keyPad = evt.keyCode ? evt.keyCode : evt.which;
        return String.fromCharCode(keyPad);
    },


    getKeyCodeFromEvt : function(evt){
        evt = getEvent(evt);
        var keyPad = evt.keyCode ? evt.keyCode : evt.which;
        return keyPad;
    },


    isDataTypeNumeric : function(dataType){
        return (dataType === this.DOUBLE || dataType === this.LONG || dataType === this.INT);
    },


    /**
     * Helper used to get the group number for a particular col or row group.
     * The number of / is equal to the group number - 1.
     * @param path
     */
    getGroupNumberFromPath : function(path){
        var regex = new RegExp("/", "g");
        return ((path.match(regex).length) - 1);
    },

    /**
     * Used to send a delete filter request
     * @param podId the id of the filter pod
     */
    deleteFilterRequest : function(podId) {
        var filterId = $(podId).readAttribute("data-filterId");

        //delete dom object
        this.deleteFilterPod(podId);
        //send request to delete from server
        this.deleteAdhocFilter(filterId);
    },



    /**
     * Used to send a edit filter request
     * @param podId the id of the filter pod
     */
    editFilterRequest : function(podId) {
        var filterType = $(podId).readAttribute("data-filterType");
        var filterId = $(podId).readAttribute("data-filterId");

        if(this.checkInputs(podId)){
            var jsonObj = this.createJSONFilterRequest(podId);
            this.editAdhocFilter(jsonObj, filterId);
        }
        else{
            this.inputNotificationError(podId, filterType);

        }
    },


    inputNotificationError : function(podId, filterType){
        var label = null;
        var input = $(podId + "_filterInput");
        if(input){
            label = input.up("label");
            if(label){
                $(label).addClassName("error");
            }

            if(filterType === "multipleInput"){
                label = $(label).next("label");
                if(label){
                    $(label).addClassName("error");
                }
            }
        }
    },


    removeInputNotificationError : function(podId, filterType){
        var label = null;
        var input = $(podId + "_filterInput");
        if(input){
            label = input.up("label");
            if(label && $(label).hasClassName("error")){
                $(label).removeClassName("error");
            }

            if(filterType === "multipleInput"){
                label = $(label).next("label");
                if(label && $(label).hasClassName("error")){
                    $(label).removeClassName("error");
                }
            }
        }
    },


    //auto submit filter after waiting a set period of time
    adhocFilterSubmit : function(podId){
        autoSubmitMonitor.run(podId);
    },


    //cancel auto-submit
    cancelAdhocFilterSubmit : function(){
        autoSubmitMonitor.cancel();
    },


    /**
     * Used to check inputs before sending...
     *
     * @param podId
     */
    checkInputs : function(podId){
        var valid = false;
        var filterPod = $(podId);
        var filterType = filterPod.readAttribute("data-filterType");
        var dataType = filterPod.readAttribute("data-dataType");
        var dateRegex = new RegExp(/\d{4}-\d{2}-\d{2}/);

        if(filterType === "multipleSelect" || filterType === "singleSelect"){
            valid = this.isAllOptionSelected(podId);
            if(!valid){
                var selectedIndex = this.findIndexOfSelectOption(podId);
                if(selectedIndex > -1){
                    valid  = true;
                    return valid;
                }
            }
            return valid;
        }else if(filterType === "functionSelect"){
            valid = this.isAllOptionSelected(podId);
            return valid;
        }else if (filterType === "singleInput" || filterType === "multipleInput"){
            //first input
            var input = $(podId + "_filterInput").value;
            if(this.isDataTypeNumeric(dataType)){
                if(input.length > 0){
                    if(dataType === "Integer"){
                        if (this.isValidNumericValue(input) == true && input.indexOf('.') < 0) {
                            valid = true;
                        } else {
                            valid = false;
                        }
                    }else{
                        valid = this.isValidNumericValue(input);
                    }
                } else {
                    return false;
                }
            }else if (dataType === "Date"){
                valid = (dateRegex.test(input) && input.length == this.DATE_LEN);
            }else{
                //only dates and numbers can have multiple input. Hence simply return true.
                return true;
            }

            //only get here with multiple input
            if (filterType === "multipleInput"){
                if(valid){
                    var firstInput = input;
                    input = $(podId + "_filterInput2").value;
                    if(this.isDataTypeNumeric(dataType)){
                        if(input.length > 0){
                            if(dataType === "Integer"){
                                if (this.isValidNumericValue(input) == true && input.indexOf('.') < 0) {
                                    return parseInt(firstInput)<parseInt(input);
                                } else {
                                    return false;
                                }
                            }else{
                                return this.isValidNumericValue(input) && parseFloat(firstInput)<parseFloat(input);
                            }
                        }else{
                            return false;
                        }

                    }else if (dataType === "Date"){
                        return (dateRegex.test(input) && input.length == this.DATE_LEN);
                    }else{
                        //shouldn't get here
                        throw("This should not have happened!!");
                    }

                }else{
                    return false;
                }
            }
            //simply return here..
            return valid;
        }
    },


    /**
     * Helps find index if item is selected
     * @param podId
     */
    findIndexOfSelectOption : function(podId){
        var multiselect = $(podId + "_filterInput" );
        var index = -1;
        for(var i = 0; i < multiselect.length; i++){
            if(multiselect.options[i].selected){
                index = i;
                break;
            }
        }
        return index;
    },

    ////////////////////////////////////////////////////////////////
    // Server updates for filtering
    ////////////////////////////////////////////////////////////////
    /**
     * Ajax request for requesting the field values for a particular column.
     * @param podId the id of the filter pod.
     */
    getFieldValues : function(podId, callback) {
        var columnName = $(podId).readAttribute("data-fieldName");

        var callbackFn = function() {
            this.adhocFilterAjaxPostBackForMultiselect(podId);
            callback && callback(podId);
        }.bind(adHocFilterModule);
        $('ajaxbuffer').innerHTML = '';
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_getFieldValues', ["fieldName=" + encodeText(columnName)], callbackFn, {"target": "ajaxbuffer", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    /**
     *
     * @param podId
     * @param handler - function, with 2 arguments (min and max) to populate them. Function is executed in context of adHocFilterModule
     */
    getMaxMinValues: function(podId, handler){
        var columnName = $(podId).readAttribute("data-fieldName");

        var callback = function() {
            var minMaxArray = $("ajaxbuffer").innerHTML.strip().split("_::_");
            handler && handler.apply(adHocFilterModule, minMaxArray);
        };
        $('ajaxbuffer').innerHTML = '';
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_getMaxMinValues', ["fieldName=" + encodeText(columnName)], callback, {"target": "ajaxbuffer", mode : AjaxRequester.prototype.TARGETTED_REPLACE_UPDATE});
    },

    getTargetContainer: function() {
        var container = $("filter-container");
        var element = container.hasClassName(layoutModule.SWIPE_SCROLL_PATTERN) ?
            container.down(layoutModule.SCROLL_WRAPPER_PATTERN) : container;
        return element ? element : container;
    },

    refreshScroll: function(){
        if (isIPad()) {
            var filterPanelElement = $("filter-container");
            new TouchController(filterPanelElement.down('ul'), filterPanelElement);
        }
    },

    /**
     * Ajax request for the submission of the filter object
     * @param fieldNames Filter object as a json string
     */
    addAdhocFilter : function(fieldNames){
        localContext.deselectAllSelectedOverlays();

        var isOLAP = localContext.getMode() === designerBase.OLAP_CROSSTAB;

        var callback = function(state) {
            //localContext.standardOpCallback();
            this.render(state, this.getTargetContainer());
            localContext.state.update(state);
            //little hack to enable undo button when we add a new filter. We do this because we do not
            //do a full page refresh
            localContext.state.canUndo = localContext.state.numberOfExistingFilters > 0;
            adhocDesigner.enableCanUndoRedo();

            //fieldsInUse not used in OLAP mode yet.
            !isOLAP && adhocDesigner.updateFieldsInUse(fieldNames.split(","));

            adhocDesigner.updateAllFieldLabels();
            layoutModule.maximize($('filters'),true);
            this.refreshScroll();
        }.bind(adHocFilterModule);

        if (isOLAP) {
            var action = adHocFilterModule.CONTROLLER_PREFIX + "_addOLAPFilter";
            var params =  new Array('dim=' + encodeText(fieldNames[0].dimensionId), 'child=' + encodeText(fieldNames[0].id));
        } else {
            action = adHocFilterModule.CONTROLLER_PREFIX + '_addAdhocFilter';
            params = new Array("addAdhocFilterFields=" + encodeText(fieldNames));
        }

        designerBase.sendRequest(action, params, callback, null);
    },

    render: function (state, container) {
        if (state && !_.isEmpty(state)) {
            adhocDesigner.registerTemplate(adHocFilterModule, "filterPodTemplate");
            jQuery(container).html(adHocFilterModule.filterPodTemplate(state));
            if (isIPad()) {
                var filterPanelElement = $("filter-container");
                new TouchController(filterPanelElement.down('ul'), filterPanelElement);
            }
            jQuery(container).find('.filter[data-datatype="Date"]').each(function(index, filter){
                jQuery(filter).find('.picker').each(function(index, element){
                    adHocFilterModule.constructDateControl(element);
                });
            });
            jQuery(container).find('.filter .control.select.multiple').each(function (index, control) {
                if (jQuery(control).find('option').length > 7) {
                    jQuery(control).find('.sizer').removeClass('hidden');
                    layoutModule.createSizer(control);
                }
            });
        }
    },

    refreshScroll: function(){
        if (isIPad()) {
            var filterPanelElement = $("filter-container");
            new TouchController(filterPanelElement.down('ul'), filterPanelElement);
        }
    },

    /**
     * Ajax request for editing existing filter
     * @param jsonObj
     * @param filterId
     */
    editAdhocFilter : function(jsonObj, filterId){
        var callback = function(state) {
            localContext.standardOpCallback(state);
            adhocDesigner.updateAllFieldLabels();
            this.refreshScroll();
        }.bind(adHocFilterModule);
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_editAdhocFilter', new Array("filterId=" + filterId, "editAdhocFilter=" + jsonObj), callback, {bPost :true});
    },

    /**
     * Ajax request for deleting an existing filter
     * @param filterId
     */
    deleteAdhocFilter : function(filterId){
        var callback = function(state) {
            localContext.standardOpCallback(state);
            this.resetFilterPanel();
            adhocDesigner.updateAllFieldLabels();
        }.bind(adHocFilterModule);
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_deleteAdhocFilter', new Array("filterId=" + filterId), callback, null);
    },


    deleteAllAdhocFilters : function(){
        var callback = function(state) {
            localContext.standardOpCallback(state);
            this.resetFilterPanel();
            adhocDesigner.updateAllFieldLabels();

        }.bind(adHocFilterModule);
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_deleteAllAdhocFilters', null, callback, null);
    },


    toggleAdhocFilterPod : function(filterId){
        this.refreshScroll();
        designerBase.sendNonReturningRequest(adHocFilterModule.CONTROLLER_PREFIX + '_toggleFilterPodState', new Array("filterId=" + filterId), null, null);
    },


    minimizeAllAdhocFilterPods : function(){
        this.refreshScroll();
        designerBase.sendNonReturningRequest(adHocFilterModule.CONTROLLER_PREFIX + '_minimizeAllAdhocFilterPods', null, null, null);
    },


    maximizeAllAdhocFilterPods : function(){
        this.refreshScroll();
        designerBase.sendNonReturningRequest(adHocFilterModule.CONTROLLER_PREFIX + '_maximizeAllAdhocFilterPods', null, null, null);
    },


    /**
     * Used to reset filter
     */
    resetFilterPanel : function(){
        var callback = function(state) {
            adHocFilterModule.render(state, adHocFilterModule.getTargetContainer());
        };
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_generateFilterPanel', ["decorate=no"], callback);
    },


    /**
     * This is the method responsible for populating select boxes
     * @param PodId the id of the filter pod
     */
    adhocFilterAjaxPostBackForMultiselect : function(PodId) {
        var myAjaxResponse = $("ajaxbuffer");
        var ajaxResponseData = eval('(' + myAjaxResponse.innerHTML + ')');
        this._populateSelectBoxes(PodId, ajaxResponseData);
    },


    /**
     * This function is used for populating the min max values in the input boxes
     * @param PodId the id of the filter pod
     */
    adhocFilterAjaxPostBackForMaxMin : function(PodId){
        var myAjaxResponse = $("ajaxbuffer");
        var ajaxResponseData = myAjaxResponse.innerHTML;
        var minMaxArray = ajaxResponseData.strip().split("_::_");
        var min = minMaxArray[0];
        var max = minMaxArray[1];

        this.populateMultiInputBoxes(PodId, min, max);
    },


    isFilterPodMaximized : function(podId){
        if($(podId)){
            return !($(podId).hasClassName("minimized"));
        } else{
            return false;
        }
    },

    ////////////////////////////////////////////////////////////////
    // These methods will be called by the action model
    ////////////////////////////////////////////////////////////////

    /**
     * This function is used to check if the filter can be added for this field
     */
    canAddFilter : function(object, errorMessages){
        if (localContext.canAddFilter) {
            return localContext.canAddFilter(object, errorMessages);
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
        if (adhocDesigner.isMeasureSelected(object)) {
            errorMessages && errorMessages.push(addFilterErrorMessageMeasureAdd);
            return false;
        }

        return true;
    },

    canShowFilterOption : function(errorMessages){
        var canShow = true;
        for(var i = 0; i < selObjects.length; i++) {
            if(!adHocFilterModule.canAddFilter(selObjects[i], errorMessages)){
                canShow =  false;
                break;
            }
        }
        return canShow;
    },

    addFilter : function(){
        adHocFilterModule.addFilterPods();
    },

    removeFilter : function(confirmed){
        var podId = adHocFilterModule.selectedFilterPod;
        if (confirmed || !adHocFilterModule.isUsed(podId)) {
            adHocFilterModule.deleteFilterRequest(podId);
        } else {
            dialogs.popup.show($(adHocFilterModule.COMPLEX_FILTER_REMOVE_CONFIRM));
        }
    },


    minimizeAllPods : function(){
        var filterPods = adHocFilterModule._getFilterPods();
        if(filterPods){
            filterPods.each(function(object){
                var pod = object.down(FILTER_PANE_PATTERN);
                if(pod && (!$(pod).hasClassName("minimized"))){
                    $(pod).addClassName("minimized");
                }
            });
            adHocFilterModule.minimizeAllAdhocFilterPods();
        }
    },


    maximizeAllPods : function(){
        var filterPods = adHocFilterModule._getFilterPods();
        if(filterPods){
            filterPods.each(function(object){
                var pod = object.down(FILTER_PANE_PATTERN);
                if(pod && ($(pod).hasClassName("minimized"))){
                    $(pod).removeClassName("minimized");
                }
            });
            adHocFilterModule.maximizeAllAdhocFilterPods();
        }
    },

    isRemoveAllFilterAllowed : function(){
        var filterPods = adHocFilterModule._getFilterPods();
        if(filterPods && localContext.state.inDesignView){
            // there is always a Complex Expression pod present, initially hidden. Thus the empty pods list length is 1
            return (filterPods.length > 1);
        }
        return false;
    },

    isRemoveFilterAllowed : function(){
        return (localContext.state.inDesignView);
    },

    isMinimizeAllFilterPodsAllowed : function(){
        var success = false;
        var filterPods = adHocFilterModule._getFilterPodsWithoutComplexFilterPod();
        if(filterPods){
            filterPods.each(function(object){
                var pod = object.down(FILTER_PANE_PATTERN);
                if(pod && (!$(pod).hasClassName("minimized")) && (!$(pod).hasClassName("hidden"))){   // there is always a Complex Expression pod present. It is excluded from the condition via 'hidden' class
                    success = true;
                }
            });
        }
        return success;
    },

    isMaximizeAllFilterPodsAllowed : function(){
        var success = false;
        var filterPods = adHocFilterModule._getFilterPodsWithoutComplexFilterPod();
        if(filterPods){
            filterPods.each(function(object){
                var pod = object.down(FILTER_PANE_PATTERN);
                if(pod && ($(pod).hasClassName("minimized"))){
                    success =  true;
                }
            });
        }
        return success;
    },




    _getFilterPods : function(){
        var filterPanel = $("filter-container");
        if(filterPanel){
            var filterListContainer = filterPanel.down("ul");
            return filterListContainer.childElements();

        }
        return null;
    },

    _getFilterPodsWithoutComplexFilterPod : function(){
        var pods = adHocFilterModule._getFilterPods();
        return pods ? _.filter(pods, function(pod) {
            return jQuery(pod).children("div.filter").attr("id") !== adHocFilterModule.COMPLEX_FILTERS_POD_ID
        }) : pods;
    },

    toggleFilterCondition : function(){
        var podId = adHocFilterModule.selectedFilterPod;
        adHocFilterModule.toggleFilterOperation(podId);
    },


    isFilterThisPodMaximized : function(){
        var minimizable = false;
        var podId = adHocFilterModule.selectedFilterPod;
        if($(podId).hasAttribute("data-editable")){
            minimizable = ($(podId).readAttribute("data-editable") == "true");
        }
        return (adHocFilterModule.isFilterPodMaximized(podId) && minimizable);
    }

};

/**
 * Busy monitor object for auto submit.
 */
var autoSubmitMonitor = new BusyMonitor(adHocFilterModule.AUTO_SUBMIT_TIME, adHocFilterModule.editFilterRequest.bind(adHocFilterModule));
