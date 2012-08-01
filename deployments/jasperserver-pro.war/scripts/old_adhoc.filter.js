/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
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
        var coordinates = {"menuTop": topOffset + this.MENU_PAD};
        actionModel.showDynamicMenu("filterPodMenu", event, toolbarButtonModule.TOOLBAR_MENU_CLASS, coordinates, "adhocActionModel");
        Event.stop(event);
        Event.observe($("menu"), 'mouseleave', function() {
            adHocFilterModule.showButtonMenuMouseOut($('menu'));
        }.bind(this));
    },


    /**
     * Used to hide the menu
     */
    showButtonMenuMouseOut : function(object){
        actionModel.hideMenu();
        Event.stopObserving($(object), 'mouseleave', this.showButtonMenuMouseOut.bind(adHocFilterModule));
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
            var errorSpan = null;
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
                            child = this._createDateButton(podId, true);
                            errorSpan = $(parent).down("span", 1);
                            $(parent).down("label").insertBefore(child, errorSpan);
                        }
                    }else if(newFilterType === "multipleInput"){
                        child = this._createTextInput(podId, true, isDate);
                        $(parent).appendChild(child);
                        if(type === "Date"){
                            $(child).removeClassName("input");
                            $(child).removeClassName("text");
                            $(child).addClassName("picker");
                            child = this._createDateButton(podId, true);
                            errorSpan = $(parent).down("span", 1);
                            $(parent).down("label").insertBefore(child, errorSpan);
                        }
                        child = this._createTextInput(podId, false, isDate);
                        $(parent).appendChild(child);
                        if(type === "Date"){
                            $(child).removeClassName("input");
                            $(child).removeClassName("text");
                            $(child).addClassName("picker");
                            child = this._createDateButton(podId, false);
                            errorSpan = $(parent).down("span", 3);
                            $(parent).down("label", 1).insertBefore(child, errorSpan);
                        }
                    }
                    $(filterPod).setAttribute("data-filterType", newFilterType);
                }
            }
            // populate default values and save the filter
            this.populateValuesAndSave(podId, selectedOperation);
        }
    },

    /**
     *  Filter inputs are populated with default values(max, min or both) and then filter is saved.
     *
     * @param podId
     * @param selectedOperation
     */
    populateValuesAndSave: function(podId, selectedOperation) {
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
        //this is to deal with IE's trouble some nature. It can't fire onchange on select boxes. Because
        //of this we need to attach the event to the dom element using inline scripts.
        $(selectContainer).setAttribute("onchange", "adHocFilterModule.onChangeForSelect(" + "'" + selectContainerId + "'" + ")");
        if(isIE7()) {
            $(selectContainer).setAttribute("onpropertychange", "adHocFilterModule.onChangeForSelect(" + "'" + selectContainerId + "'" + ")");
            $(selectContainer).setAttribute("onkeyup", "adHocFilterModule.onChangeForSelect(" + "'" + selectContainerId + "'" + ")");
        }

        //quick server side ajax request to get list of values..
        this.getFieldValues(podId);
        var label = this._constructLabel();
        $(label).addClassName("select multiple");
        $(label).writeAttribute("title", "Filter Value");
        $(label).writeAttribute("for", selectContainerId);
        $(label).appendChild(this._constructSpan("wrap", "Value:"));
        $(label).appendChild(selectContainer);
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
        //this is to deal with IE's trouble some nature. It can't fire onchange with input and select boxes. Because
        //of this we need to attach the event to the dom element using inline scripts.
        $(dropDown).setAttribute("onchange", "adHocFilterModule.onChangeForSelect(" + "'" + dropDownId + "'" + ")");
        if(isIE7()) {
            $(dropDown).setAttribute("onpropertychange", "adHocFilterModule.onChangeForSelect(" + "'" + dropDownId + "'" + ")");
            $(dropDown).setAttribute("onkeyup", "adHocFilterModule.onChangeForSelect(" + "'" + dropDownId + "'" + ")");
        }
        //quick server side ajax request to get list of values..
        this.getFieldValues(podId);
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
        if(isDate){
            //this is to deal with IE's trouble some nature. It can't fire onchange with input and select boxes. Because
            //of this we need to attach the event to the dom element using inline scripts.
            $(textInput).setAttribute("onchange", "adHocFilterModule.onChangeForDateInput(" + "'" + podId + "'" + ")");
        }
        var label = this._constructLabel();
        $(label).addClassName("input text");
        $(label).appendChild(this._constructSpan("wrap", "Value:"));
        $(label).appendChild(textInput);
        $(label).appendChild(this._constructSpan("message warning", this.ERROR_MESSAGE));
        return label;
    },


    _createDateButton : function(podId, firstLevel){
        var buttonId = null;
        if(firstLevel){
            buttonId = podId + "_filterInput_calendarButton";
        }else{
            buttonId = podId + "_filterInput2_calendarButton";
        }

        var dateControl = document.createElement("button");
        $(dateControl).setAttribute("id", buttonId);
        $(dateControl).setAttribute("type", "button");
        $(dateControl).addClassName("button picker");
        return dateControl;
    },


    constructDateControl : function(buttonId, panelId){
        var inputField = buttonId.split("_calendarButton")[0];
        var params = {'inputField':inputField, 'button':buttonId, 'ifFormat':'%Y-%m-%d',
            'showsTime':false,'tzOffset':-25200000,
            'cache':false,
            'onUpdate': function(){
                return adHocFilterModule.deselectAllCheckBox(panelId)}};
        Calendar.setup(params);
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
            var fieldList = [];

            for(var index = 0; index < selObjects.length; index++){
                var obj = selObjects[index];
                if (this.canAddFilter(obj)){
                    fieldList.push(obj.name);
                }
            }
            return fieldList.join(",");
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

                fieldList += fieldNames.map(function(name){
                    //fix for bug 23370, encode each fieldname on client and decode on server
                    return escape(name)
                }).join(',');
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
        return checkBoxButton && (checkBoxButton.checked);
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
        return ++localContext.numberOfExistingFilters;
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
        for (var i = 0; i < localContext.allColumns.length; i++) {
            var object = localContext.allColumns[i];
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
        for (var i = 0; i < localContext.allColumns.length; i++) {
            var object = localContext.allColumns[i];
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
                    input = $(podId + "_filterInput2").value;
                    if(this.isDataTypeNumeric(dataType)){
                        if(input.length > 0){
                            if(dataType === "Integer"){
                                if (this.isValidNumericValue(input) == true && input.indexOf('.') < 0) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }else{
                                return this.isValidNumericValue(input);
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
     * @param PodId the id of the filter pod.
     */
    getFieldValues : function(PodId) {
        var columnName = $(PodId).readAttribute("data-fieldName");

        var callback = function() {
            localContext.standardOpCallback();
            this.adhocFilterAjaxPostBackForMultiselect(PodId);
        }.bind(adHocFilterModule);
        $('ajaxbuffer').innerHTML = '';
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_getFieldValues', new Array("fieldName=" + encodeText(columnName)), callback, {"target": "ajaxbuffer"});
    },

    /**
     *
     * @param podId
     * @param handler - function, with 2 arguments (min and max) to populate them. Function is executed in context of adHocFilterModule
     */
    getMaxMinValues: function(podId, handler){

        var columnName = $(podId).readAttribute("data-fieldName");

        var callback = function() {
            localContext.standardOpCallback();
            var myAjaxResponse = $("ajaxbuffer");
            var ajaxResponseData = myAjaxResponse.innerHTML;
            var minMaxArray = ajaxResponseData.strip().split("_::_");
            if(handler){
                handler.apply(adHocFilterModule, minMaxArray);
            }
        }.bind(adHocFilterModule);
        $('ajaxbuffer').innerHTML = '';
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_getMaxMinValues', new Array("fieldName=" + encodeText(columnName)), callback, {"target": "ajaxbuffer"});
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

    //HACK to fix bug 22529 - somewhy in IE <script id="adhocFilterState"> tag is not evaluated on AJAX request
    // possibly due to compatibility mode.
    evalScripts: function() {
        var elements = document.getElementsByName("_evalScript");
        for (var i = 0; i < elements.length; i++) {
            globalEval(elements[i].value);
        }

        this.removeEvalScripts(elements);
    },

    //HACK to fix bug 22529
    removeEvalScripts: function(scriptElements) {
        var elements = scriptElements ? scriptElements : document.getElementsByName("_evalScript");

        // Remove evaluated elements so they newer will be evaluated twice.
        $A(elements).clone().each(function(elem) {
            $(elem).remove();
        })
    },

    /**
     * Ajax request for the submission of the filter object
     * @param fieldNames Filter object as a json string
     */
    addAdhocFilter : function(fieldNames){
        localContext.deselectAllSelectedOverlays();

        var isOLAP = localContext.getMode() === designerBase.OLAP_CROSSTAB;

        adHocFilterModule.removeEvalScripts();
        var callback = function() {
            localContext.standardOpCallback();

            //HACK to fix bug 22529
            this.evalScripts();

            //this actually doesnd works for IE because adhocFilterState script doesnt exists somewhy in response
            //see above HACK section
            this.updateFilterPodsState();
            //little hack to enable undo button when we add a new filter. We do this because we do not
            //do a full page refresh
            localContext.canUndo = (localContext.numberOfExistingFilters > 0);
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

        designerBase.sendRequest(action, params, callback, {"target" : this.getTargetContainer().identify()});
    },



    /**
     * Ajax request for editing existing filter
     * @param jsonObj
     * @param filterId
     */
    editAdhocFilter : function(jsonObj, filterId){
        var callback = function() {
            localContext.standardOpCallback();
            adhocDesigner.updateAllFieldLabels();
            this.refreshScroll();
        }.bind(adHocFilterModule);
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_editAdhocFilter', new Array("filterId=" + filterId, "editAdhocFilter=" + jsonObj), callback, {"bPost" : true});
    },



    //Raphael version - Please keep
    /**
     * Ajax request for editing existing filter
     * @param jsonObj
     * @param filterId
     */
    //  editAdhocFilter : function(jsonObj, filterId){
    //      var callback = function(jsonResponse) {
    //          Math.raphaelData = jsonResponse.dataSet;
    //          localContext.getCallbacksForPageResize();
    //          adhocDesigner.updateAllFieldLabels();
    //      }.bind(adHocFilterModule);

    //      if (mainPlot) {
    //          Math.scale = false;
    //          designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_editAdhocFilter', new Array("filterId=" + filterId, "editAdhocFilter=" + jsonObj), callback, {mode:AjaxRequester.prototype.EVAL_JSON});
    //      }
    //  },


    /**
     * Ajax request for deleting an existing filter
     * @param filterId
     */
    deleteAdhocFilter : function(filterId){
        var callback = function() {
            localContext.standardOpCallback();
            this.resetFilterPanel();
            adhocDesigner.updateAllFieldLabels();
        }.bind(adHocFilterModule);
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_deleteAdhocFilter', new Array("filterId=" + filterId), callback, null);
    },


    deleteAllAdhocFilters : function(){
        var callback = function() {
            localContext.standardOpCallback();
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
    resetFilterPanel : function(ignore){
        adHocFilterModule.removeEvalScripts();
        var callback = function() {
            if (!ignore) {
                localContext.standardOpCallback();
            }
            adHocFilterModule.evalScripts();
            adHocFilterModule.refreshScroll();
        };
        designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_generateFilterPanel', new Array("decorate=no"), callback, {'target' : this.getTargetContainer().identify()});
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


    updateFilterPodsState : function(){
        evaluateScript('adhocFilterState');
    },

    ////////////////////////////////////////////////////////////////
    // These methods will be called by the action model
    ////////////////////////////////////////////////////////////////

    /**
     * This function is used to check if the filter can be added for this field
     */
    canAddFilter : function(object){
        if (localContext.canAddFilter) {
            return localContext.canAddFilter(object);
        }

        return (!adhocDesigner.isSpacerSelected(object) && !adhocDesigner.isPercentOfParentCalcSelected(object) && !adhocDesigner.isConstantSelected(object) && !adhocDesigner.isMeasureSelected(object));
    },

    canShowFilterOption : function(){
        var canShow = true;
        for(var i = 0; i < selObjects.length; i++) {
            if(!adHocFilterModule.canAddFilter(selObjects[i])){
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
        if(filterPods && localContext.inDesignView){
            // there is always a Complex Expression pod present, initially hidden. Thus the empty pods list length is 1
            return (filterPods.length > 1);
        }
        return false;
    },

    isRemoveFilterAllowed : function(){
        return (localContext.inDesignView);
    },

    isMinimizeAllFilterPodsAllowed : function(){
        var success = false;
        var filterPods = adHocFilterModule._getFilterPods();
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
        var filterPods = adHocFilterModule._getFilterPods();
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
