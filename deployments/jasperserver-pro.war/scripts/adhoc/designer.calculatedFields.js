/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////////////////////////////////////
// Calculated fields  Code.
////////////////////////////////////////////////////////////////
/**
 * This object is for mapping the formula maps to particular sections in adhoc
 * af = "available fields"
 * t = "table"
 * tg = "table group"
 */

var FormulaMenuHandlerMap = {
    'af' : {
        'addField' : function(){
            var fid = selectedFormula.formulaId;
            var args = adhocCalculatedFields.prepareParametersForAddCalcField();
            adhocCalculatedFields.createCalculatedField(fid, args);
        },
        'deleteField' : function(){
            var selectedObject = designerBase.getSelectedObject();
            var fieldName = adhocDesigner.getNameForSelected(selectedObject);
            if (!adhocDesigner.isInUse(fieldName)) {
                adhocCalculatedFields.deleteCalculatedField(fieldName, selectedObject);
            }
            else {
                throw(adhocCalculatedFields.ERROR_CODE_1);
            }
        },
        'updateField' : function(){
            var selectedObject = adhocCalculatedFields.fields[0];
            var fid = selectedFormula.formulaId;
            var fieldName = adhocDesigner.getNameForSelected(selectedObject);
            var args = adhocCalculatedFields.prepareParametersForUpdateField();

            if (adhocDesigner.isInUse(fieldName)) {
                localContext.updateCalcFieldAndView(fieldName, fid, args);
            } else {
                adhocCalculatedFields.updateCalculatedField(fieldName, fid, args);
            }
        }
    },

    'columnLevel' : {
        'addField' : function(){
            var fid = selectedFormula.formulaId;
            var args = adhocCalculatedFields.prepareParametersForAddCalcField();
            adhocCalculatedFields.createCalculatedField(fid, args);
        },
        'updateField' : function(){
            var selectedObject = adhocCalculatedFields.fields[0];
            var fid = selectedFormula.formulaId;
            var fieldName = adhocDesigner.getNameForSelected(selectedObject);
            var args = adhocCalculatedFields.prepareParametersForUpdateField();

            if (adhocDesigner.isInUse(fieldName)) {
                localContext.updateCalcFieldAndView(fieldName, fid, args);
            } else {
                adhocCalculatedFields.updateCalculatedField(fieldName, fid, args);
            }
        }
    },

    'tg' : {}
};

var adhocCalculatedFields = {
    currentField : null,
    currentFormula : null,
    currentInputValue : null,
    currentFieldNames : null,
    numericFirst : false,
    visible : false,
    calcType : null,
    createCustom : true,
    fieldName : "[field name]",
    dialog : null,
    submitBtn : $("createCalcField"),
    cancelBtn : $("cancelCalcField"),
    CALCULATION_TYPE_DATE : "twoDates",
    CALCULATION_TYPE_MULTIPLE_NUMS : "multipleNumbers",
    CALCULATION_TYPE_SINGLE_NUM : "singleField",
    CALCULATION_TYPE_TWO_NUMS : "twoNumbers",
    fields : [],
    ERROR_CODE_1 : calculatedFieldErrorCode1,
    ERROR_CODE_2 : calculatedFieldErrorCode2,
    ERROR_CODE_3 : calculatedFieldErrorCode3,
    ERROR_CODE_4 : calculatedFieldErrorCode4,
    ERROR_CODE_5 : calculatedFieldErrorCode5,
    ERROR_CODE_6 : calculatedFieldErrorCode6,
    ERROR_CODE_7 : calculatedFieldErrorCode7,
    ERROR_CODE_8 : calculatedFieldErrorCode8,

    //object containing all possible calculation types
    CALCULATION_OPTIONS : {
        "ADH_404_ADD_NUM" : "singleField",
        "ADH_408_SUBTRACT_NUM" : "singleField",
        "ADH_409_MULTIPLY_BY_NUM" : "singleField",
        "ADH_410_DIVIDE_BY_NUM" : "singleField",
        "ADH_406_ROUND" : "singleField",
        "ADH_406_RANK" : "singleField",
        "ADH_406_PERCENT" : "singleField",
        "ADH_406_PERCENT_OF_ROW_PARENT" : "singleField",
        "ADH_406_PERCENT_OF_COLUMN_PARENT" : "singleField",
        "ADH_421_DATEDIFF_SECS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_MINS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_HOURS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_DAYS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_WEEKS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_MONTHS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_QUARTERS_UNIT" : "twoDates",
        "ADH_421_DATEDIFF_YEARS_UNIT" : "twoDates",
        "ADH_405_ADD_ALL" : "multipleNumbers",
        "ADH_415_MULTIPLY_ALL" : "multipleNumbers",
        "ADH_405_ADD" : "twoNumbers",
        "ADH_411_SUBTRACT" : "twoNumbers",
        "ADH_412_MULTIPLY" : "twoNumbers",
        "ADH_413_DIVIDE" : "twoNumbers"
    },

    /**
     * Object representing the types of calculation options
     * @param edit
     */
    CALCULATION_REQUEST_PARAMS : {
        "singleField" : "Basic@@Number@@OneAndConstant",
        "twoNumbers" : "Basic@@Number@@Two",
        "multipleNumbers" : "Basic@@Number@@Many",
        "twoDates" : "Special@@Date@@Two"
    },

    /**
     * This is responsible for launching the calculated fields dialog based on the datatype and the number of fields chosen
     * to create the custom field. Note you can only create calculated fields on dates and numeric types
     * @param edit  This indicates whether or not we are editing an existing custom field
     */
    launchDialog : function(edit){
        this.dialog = $("calculatedField");
        //check the number of items selected..
        if (selObjects.length > 0) {
            this.fields = selObjects.clone();
            this.createCustom = edit ? false : true;
            if (selObjects.length == 2) {
                //take first and check if numeric
                var fieldName0 = adhocDesigner.getNameForSelected(selObjects[0]);
                var fieldName1 = adhocDesigner.getNameForSelected(selObjects[1]);

                fieldName0 =  this.getDisplayLabelByFieldName(fieldName0);
                fieldName1 =  this.getDisplayLabelByFieldName(fieldName1);
                this.currentFieldNames = fieldName0 + "@@" + fieldName1;

                var isNumeric = adhocDesigner.checkIfFieldIsNumeric(adhocDesigner.getNameForSelected(selObjects[0]));
                if(isNumeric){
                    this.calcType = this.CALCULATION_TYPE_TWO_NUMS;
                } else{
                    this.calcType = this.CALCULATION_TYPE_DATE;
                }

            } else if (selObjects.length > 2) {
                //has to be multiple numbers
                this.calcType = this.CALCULATION_TYPE_MULTIPLE_NUMS;
            } else{
                this.currentFieldNames = null;
                var fieldName = adhocDesigner.getNameForSelected(selObjects[0]);
                this.currentFieldNames = this.getDisplayLabelByFieldName(fieldName);

                if(!this.createCustom){
                    if(!this.isCustomFieldByFieldName(fieldName)){
                        throw(this.ERROR_CODE_2);
                    }
                    var name = null;
                    var field = this.currentField =  adhocDesigner.findFieldByName(fieldName);
                    var formula = this.currentFormula = field.formulaRef.formulaId;
                    var calcType = this.CALCULATION_OPTIONS[formula];
                    if (calcType) {
                        this.calcType = calcType;
                    }
                    //figure out right order and save.
                    if(this.calcType == this.CALCULATION_TYPE_SINGLE_NUM){
                        if (field.formulaRef.args.length == 1) {
                            if (isNotNullORUndefined(field.formulaRef.args[0].fieldRef)) {
                                name = field.formulaRef.args[0].fieldRef;
                                this.currentFieldNames = this.getDisplayLabelByFieldName(name);

                            } else {
                                throw(this.ERROR_CODE_3);
                            }
                        } else {
                            if (!isNotNullORUndefined(field.formulaRef.args[0].fieldRef)) {
                                this.numericFirst = true;
                                name = field.formulaRef.args[1].fieldRef;
                                this.currentFieldNames = this.getDisplayLabelByFieldName(name);
                            }else{
                                name = field.formulaRef.args[0].fieldRef;
                                this.currentFieldNames = this.getDisplayLabelByFieldName(name); 
                            }
                        }
                    }else if(this.calcType == this.CALCULATION_TYPE_TWO_NUMS){
                        var field0Label = this.getDisplayLabelByFieldName(field.formulaRef.args[0].fieldRef);
                        var field1Label = this.getDisplayLabelByFieldName(field.formulaRef.args[1].fieldRef);
                        this.currentFieldNames =  field0Label + "@@" + field1Label;
                    }

                }else{
                    this.calcType = this.CALCULATION_TYPE_SINGLE_NUM;
                }
            }
            this._prepareCalculatedFieldProcessing();
        }else{
            throw(this.ERROR_CODE_4);
        }
    },


    /**
     * Called after the initial pre processing is complete.
     */
    _launchDialogCallBack : function(){
        //designerBase.updateMainOverlay('hidden');
        this._updateButton(this.createCustom);
        this.dialog.addClassName(this.calcType);
        dialogs.popup.show(this.dialog);
        this.visible = true;
        //select first radio button in dialog
        this._preSelectFirstRadioBtn();

        if(!this.createCustom){
            this.updatingExistingCustomField(this.currentFieldNames, this.currentField, this.currentFormula);
        }
    },


    /**
     * This updates the submit button to either an update button or a create button.
     * @param createCustom indicates whether we are creating a new field or updating an existing one
     */
    _updateButton : function(createCustom){
        if(createCustom){
            $("updateCalcField").addClassName("hidden");
            $("createCalcField").removeClassName("hidden");
        }else{
            $("createCalcField").addClassName("hidden");
            $("updateCalcField").removeClassName("hidden");
        }
    },

    /**
     * Hides the dialog. It clears out any data and resets the formula settings.
     */
    hideDialog : function(){
        this.dialog.setAttribute("style", "");
        dialogs.popup.hide(this.dialog);
        //reset
        [this.CALCULATION_TYPE_TWO_NUMS,
            this.CALCULATION_TYPE_DATE,
            this.CALCULATION_TYPE_MULTIPLE_NUMS].each(function(item){
            if(this.dialog.hasClassName(item)){
                this.dialog.removeClassName(item);
            }
        }.bind(this));

        //calc type reset
        selectedFormula.reset();
        this._resetDialog();
        this.calcType = null;
        this.numericFirst = false;
        this.currentField = null;
        this.currentFormula = null;
        this.currentFieldNames = null;
        this.currentInputValue = null;
        this.visible = false;
    },

    /**
     * Get all radio buttons that are on a calculated fields dialog
     */
    _getAllRadioBtnsInGroup : function(){
        return $$("input[type=radio][name='functions']");
    },

    /**
     * This deselects all options and clears out all input boxes
     */
    _resetDialog : function(){
        //deselect all radio buttons
        var options = this._getAllRadioBtnsInGroup();
        var size = options.length;

        for(var i = 0; i < size; i++){
            options[i].checked = false;
            //if radio has corresponding input clean it out
            var id = $(options[i]).identify();
            var input = $(id + ".input");
            if(input){
                input.value = "";
            }
        }

        //remove swap class
        if($("calculatedField")){
            $("calculatedField").removeClassName("swap");
        }
    },

    /**
     * This is used to clear all text input boxes in the dialog
     */
    _clearOutInputs : function(){
        var options = this._getAllRadioBtnsInGroup();
        var size = options.length;

        for(var i = 0; i < size; i++){
            //if radio has corresponding input clean it out
            var id = $(options[i]).identify();
            var input = $(id + ".input");
            if(input){
                input.value = "";
            }
        }
    },


    _clearOutInputsExcept : function(inputId){
        var options = this._getAllRadioBtnsInGroup();
        var size = options.length;

        for(var i = 0; i < size; i++){
            //if radio has corresponding input clean it out
            var id = $(options[i]).identify();
            var input = $(id + ".input");
            if(input && (input.identify() != inputId )){
                input.value = "";
            }
        }
    },

    _preSelectFirstRadioBtn : function(){
        var options = this._getAllRadioBtnsInGroup();
        if(options && (options.length > 0)){
            options[0].checked = true;
        }
    },

    /**
     * This initializes all the events for the dialog.
     */
    initialize : function(){
        if($("calculatedField")){

            //mouse up observation
            $("calculatedField").observe('mouseup', function(evt){
                var element = evt.element();
                var matched = null;

                //cancel creation of calculated field
                matched = matchAny(element, ["#cancelCalcField.button"], true);
                if(matched){
                    this.hideDialog();
                }

                //for calculated fields submission
                matched = matchAny(element, ["#createCalcField.button", "#updateCalcField.button"], true);
                if(matched){
                    var proceed = this._processCalculatedField();
                    if(proceed){
                        this.hideDialog();
                    }
                }

                //for swapping
                matched = matchAny(element, ["#swap.button"], true);
                if(matched){
                    if(this.dialog.hasClassName("swap")){
                        this.dialog.removeClassName("swap");
                        selectedFormula.isSwapped = false;
                    }else{
                        this.dialog.addClassName("swap");
                        selectedFormula.isSwapped = true;
                    }
                }
            }.bind(this));


            //keypress observation
            $("calculatedField").observe('keypress', function(evt){
                var element = evt.element();
                var code = evt.keyCode ? evt.keyCode : evt.which;

                if(code == Event.KEY_ESC){
                    if(this.visible){
                        this.hideDialog();
                    }

                    Event.stop(evt);
                }

                //suppress on enter event
                if(code == Event.KEY_RETURN){
                    //do nothing. Stop propagation
                    Event.stop(evt);
                }
                //ensure only numeric numbers including decimals
                if(element.match("input")){
                    var currentValue = $(element).value;
                    var proceed = adHocFilterModule.checkValidInput(evt, "Decimal", currentValue);
                    if(!proceed){
                        Event.stop(evt);
                    }
                }

            }.bind(this));

            //key up event. save user input
            $("calculatedField").observe('keyup', function(evt){
                var element = evt.element();
                if(element.match("input")){
                    this.currentInputValue = element.value;
                    Event.stop(evt);
                }
            }.bind(this));

            //click observation.
            //We want to capture the click and stop it otherwise we get the weird flow.html page
            $("calculatedField").observe('click', function(evt){
                var element = evt.element();
                var matched = null;

                matched = matchAny(element, ["#cancelCalcField.button", "#createCalcField.button", "#updateCalcField.button", "#swap.button"], true);
                if(matched){
                    Event.stop(evt);
                }

                //we want to copy the input value from one input box to the next if we change a option.
                //for example, if a user had orderId + 5 and then chose the multiplication option, it should automatically
                //carry the 5 so that the expression becomes orderId * 5.
                if(element.match("input")){
                    var textInput = null;
                    var inputId = element.identify();
                    var type = element.readAttribute("type");

                    if(type){
                        if (type === "radio") {
                            textInput = $(inputId + ".input");
                            this._clearOutInputs();
                            if (textInput) {
                                textInput.value = (this.currentInputValue) ? this.currentInputValue : "" ;
                            }
                        } else if(type === "text") {
                            if(inputId){
                                this._clearOutInputsExcept(inputId);
                                var radio = inputId.replace(/.input$/, "");
                                if(radio && !$(radio).checked){
                                    $(radio).checked = true;
                                    $(inputId).value = (this.currentInputValue) ? this.currentInputValue : "";

                                }
                            }
                        }
                    }
                }

            }.bind(this));
        }
    },

    _getParentForCalculated: function (field) {
        if(!field || !field.formulaRef || !field.formulaRef.args || field.formulaRef.args.length < 1) {
            return null;
        }
        var firstField = field.formulaRef.args[0];
        if(!firstField.fieldRef) {
            return null;
        }
        var firstFieldInTree = adhocDesigner.dimensionsTree.findNodeById(firstField.fieldRef);
        if(!firstFieldInTree) {
            return null;
        }
        return firstFieldInTree.parent;
    },

/**
     * This add the new field to the available field to the available fields tree.
     * @param name The name of the field we are adding.
     */
    _addToAvailableFields : function(name){
        //Calc field is always numeric so it should be added to measures tree
        var tree = adhocDesigner.measuresTree;


        if(tree){
            var parent;
            var field = adhocDesigner.findFieldByName(name);
            var nodeUri = null;
            var order = adhocDesigner.getFieldIndexByName(name);

            if(this.fields.length > 0 && (selectionCategory.area == designerBase.AVAILABLE_FIELDS_AREA)){ //field created from tree
                parent = this.fields[0].parent;
                nodeUri = parent.param.uri + "/" + field.name;
            }else{ //field created immediately from table or so - without tree.
                parent = this._getParentForCalculated(field);
                if(parent != null) {
                    nodeUri = parent.param.uri + "/" + field.name;
                } else {
                    parent = tree.rootNode;
                    nodeUri = "/" + field.name;
                }
            }

            var nodeLabel = field.label;
            var nodeId = field.name;
            var metaNode = {
                id:nodeId,
                label:nodeLabel,
                type:'com.jaspersoft.jasperserver.api.metadata.common.domain.NewNode',
                uri:nodeUri,
                extra:{
                    id: nodeId,
                    //Calculated field is always numeric and thus will be added to measures tree
                    //so set extra params accordingly
                    dimensionId: adhocDesigner.MEASURES,
                    isMeasure: true,
                    dataType:field.type,
                    formulaRef:field.formulaRef
                },
                order:order,
                cssClass: 'calculatedField'
            };

            //create new node
            var newNode = tree.processNode(metaNode);
            newNode.isloaded = true;
            newNode.editable = false;
            parent.addChild(newNode);
            newNode.refreshStyle();

            //If calc filed was created for field from dimensions tree - move it
            //to measures tree
            if (adhocDesigner.DIMENSIONS_TREE_DOM_ID === newNode.getTreeId()) {
                adhocDesigner.moveToMeasuresOrAttributes(newNode);
            }
            
            jQuery.event.trigger('add_field',[field.name,field.label]);
        }
    },


    /**
     * This is used to remove a node from the available fields
     * @param node
     */
    _removeFromAvailableFields : function(node){
        if (node) {
            if(node.parent){
                var parentNode = node.parent;
                var isMeasure = node.param.extra.isMeasure;

                parentNode.removeChild(node);
                if (parentNode.childs.length == 0 && !isMeasure && parentNode.parent) {
                    parentNode.parent.removeChild(parentNode);
                }
            }else{
                throw(this.ERROR_CODE_5);
            }
        }
    },


    /**
     * Used to test if the field is a calculated field or not.
     * @param node
     */
    isCustomField : function(node){
        return (node.param && node.param.extra && node.param.extra.formulaRef);
    },

    /**
     * Used to test if the field is a calculated field or not.
     * @param fieldName
     */
    isCustomFieldByFieldName : function(fieldName){
        var field = adhocDesigner.findFieldByName(fieldName);
        return isNotNullORUndefined(field.formulaRef);
    },


    /**
     * This is a helper used to get the display label name of a field. If non-exists, we return the fieldName
     * @param fieldName
     */
    getDisplayLabelByFieldName : function(fieldName){
        var field = adhocDesigner.findFieldByName(fieldName);
        if(isNotNullORUndefined(field.label)){
            return field.label;
        }else{
            return fieldName;
        }
    },


    /**
     * This does the actual processing of either creating or updating a calculated field
     */
    _processCalculatedField : function(){
        var option = this._getSelectedCalcOption();
        if(option){
            this._setFormulaProperties(option);
            var isValid = true;
            if(this.calcType == this.CALCULATION_TYPE_SINGLE_NUM){
                option = this._getSelectedCalcOption();
                var input = $(option).identify() + ".input";
                if($(input)){
                    isValid = ValidationModule.validate([
                        {
                            validator: adhocDesigner.isValidNumericValue,
                            element: $(input)
                        }
                    ]);
                }
            }
            if(isValid){
                if(this.createCustom){
                    this.createField();
                }else{
                    this.updateField();
                }
            }
            return isValid;
        }
    },


    /**
     * Used to create a field.
     */
    createField : function(){
        var handler = null;
        var areaMap = FormulaMenuHandlerMap[selectionCategory.area];
        if (areaMap != null) {
            handler = areaMap['addField'];
        }
        if (handler != null) {
            handler();
        } else {
            throw(this.ERROR_CODE_6);
        }
    },


    /**
     * Used to delete a field
     */
    deleteField : function(){
        var handler = null;
        var areaMap = FormulaMenuHandlerMap[selectionCategory.area];
        if (areaMap != null) {
            handler = areaMap['deleteField'];
        }
        if (handler != null) {
            handler();
        } else {
            throw(this.ERROR_CODE_7);
        }
    },


    /**
     * Used to update a field
     */
    updateField : function() {

        var handler = null;
        var areaMap = FormulaMenuHandlerMap[selectionCategory.area];
        if (areaMap != null) {
            handler = areaMap['updateField'];
        }
        if (handler != null) {
            handler();
        } else {
            throw(this.ERROR_CODE_8);
        }
    },


    /**
     * This is used to when we are updating an exciting calculated field. It updates the dialog with the required data
     * @param fieldName
     * @param field
     * @param formula
     */
    updatingExistingCustomField : function(fieldName, field, formula){
        if(!this.createCustom){
            var radioButton = $(formula);
            if(radioButton){
                radioButton.checked = true;
            }

            //now check if we have input
            var hasInputValue = false;
            var inputValue = null;
            var ref = field.formulaRef;
            var refArgsSize = ref.args.length;
            for(var index = 0; index < refArgsSize; index++){
                var obj = ref.args[index];
                if(obj && obj.type && (obj.type == "Numeric") && obj.value){
                    this.currentInputValue = inputValue = obj.value;
                    hasInputValue = true;
                    break;
                }
            }

            if(hasInputValue){
                var inputBox = $(formula + ".input");
                if(inputBox){
                    inputBox.value = inputValue;
                }
            }
        }

        //check if in use, if so remove percent options
        if(adhocDesigner.isInUse(field.name)){
            var options = this._getAllRadioBtnsInGroup();
            var i;
            for(i = options.length-1; i >= 0; i--){
                var optionId = options[i].identify();
                if(optionId.startsWith("ADH_406_PERCENT")){
                    var leaf = $(optionId).up("li.leaf");
                    if(leaf){
                        leaf.remove();
                    }
                }
            }
        }
    },


    /**
     * This simply gets the selected radio button.
     */
    _getSelectedCalcOption : function(){
        var selectedOption = null;
        var options = this._getAllRadioBtnsInGroup();
        var size = options.length;
        for(var i = 0; i < size; i++){
            if(options[i].checked){
                selectedOption = options[i];
                break;
            }
        }
        return selectedOption;
    },


    /**
     * This set the formula properties when creating a calculated field
     * @param selectedOption
     */
    _setFormulaProperties : function(selectedOption){
        var optionId = $(selectedOption).identify();
        var input = null;
        var action = "." + optionId.split(".")[optionId.split('.').length-1];

        selectedFormula.formulaId = optionId.replace(action, "");
        selectedFormula.isChanged = true;
        selectedFormula.act = action;
        selectedFormula.isEdited = !this.createCustom;
        if(this.calcType == this.CALCULATION_TYPE_SINGLE_NUM){
            input = $(optionId + ".input");
            if(input){
                selectedFormula.constant = input.value;
            }

        }
    },


    /**
     * This finds a formula based on the formula id
     * @param formulaId
     */
    findFormulaById : function(formulaId) {
        if (isNotNullORUndefined(formulaInfo)) {
            var size = formulaInfo.length;
            for (var i = 0; i < size; i++) {
                var f = formulaInfo[i];
                if (f.id == formulaId) {
                    return f;
                }
            }
        }
        return null;
    },


    /**
     * This prepares the parameters to be used in the creation calculated field
     */
    prepareParametersForAddCalcField : function() {
        var fid = selectedFormula.formulaId;
        var formula = this.findFormulaById(fid);
        var args = [];
        // add names of adhocCalculatedFields.fields to arg list
        for (var i = 0; i < this.fields.length; i++) {
            var fieldName = adhocDesigner.getNameForSelected(this.fields[i]);
            args.push(fieldName);
        }
        // add constant
        if (this.fields.length == 1 && ((formula.mask & 0x02) > 0) && selectedFormula.constant) {
            args.push(selectedFormula.constant);
        }
        // swap args if requested
        if (selectedFormula.isSwapped && args.length == 2) {
            args.reverse();
        }
        // return pipe separated string
        return args.join('|');
    },



    /**
     * This prepares the parameters to be used in the update of an existing calculated field
     */
    prepareParametersForUpdateField : function() {
        var fid = selectedFormula.formulaId;
        var selectedObject = this.fields[0];
        var fieldName = adhocDesigner.getNameForSelected(selectedObject);
        var args = [];
        var fieldRef;

        var field = adhocDesigner.findFieldByName(fieldName);
        var formula =  this.findFormulaById(fid);

        // 1 field
        if ((formula.mask & 0x01) > 0) {
            fieldRef = (field.formulaRef.args[0].fieldRef != null) ? field.formulaRef.args[0].fieldRef : field.formulaRef.args[1].fieldRef;
            args.push(fieldRef);
            // field + constant
        } else if (selectedFormula.constant && ((formula.mask & 0x02) > 0)) {
            fieldRef = (field.formulaRef.args[0].fieldRef != null) ? field.formulaRef.args[0].fieldRef : field.formulaRef.args[1].fieldRef;
            args.push(fieldRef);
            args.push(selectedFormula.constant);
            // two or more fields
        } else {
            for (var i = 0; i < field.formulaRef.args.length; i++) {
                if (field.formulaRef.args[i]) {
                    var fname = field.formulaRef.args[i].fieldRef;
                    args.push(fname);
                }
            }
        }
        // swap if requested
        if ((!this.numericFirst && selectedFormula.isSwapped) || (this.numericFirst && !selectedFormula.isSwapped) && args.length == 2) {
            args.reverse();
        }
        // return pipe separated string
        return args.join('|');
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Ajax callbacks..
    //////////////////////////////////////////////////////////////////////////////////

    _updateLocalContextFromState: function(state) {
       localContext.state.allColumns = state.allColumns;
       localContext.state.canRedo = state.canRedo;
       localContext.state.canUndo = state.canUndo;
    },
    /**
     * Callback for calculated field creation
     */
    createCalculatedFieldCallback : function(state){
        var oldSize = localContext.state.allColumns.length;
        var newCalculatedField = state.newCalcFieldName;

        this._updateLocalContextFromState(state);

        if(localContext.state.allColumns.length > oldSize){
            var customField = adhocDesigner.findFieldByName(newCalculatedField);
            if(selectionCategory.area === designerBase.COLUMN_LEVEL){
                localContext.addThisFieldAsColumn(customField.name);
            }
            this._addToAvailableFields(customField.name);
            adhocDesigner.updateAllFieldLabels();
        }
    },
    /**
     * Callback for the deletion of a calculated field
     */
    deleteCustomFieldCallback : function(fieldName, nodeToDelete, state){
        var oldSize = localContext.state.allColumns.length;

        this._updateLocalContextFromState(state);

        if((localContext.state.allColumns.length < oldSize) && nodeToDelete){
            this._removeFromAvailableFields(nodeToDelete);
            adhocDesigner.updateAllFieldLabels();
        }
    },
    /**
     * Callback for the update of a calculated field
     */
    updateCalculatedFieldCallback : function(state){
        this._updateLocalContextFromState(state);
        adhocDesigner.updateAllFieldLabels();
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // Ajax calls..
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Used to send calculated field creation request to the server.
     * @param formulaId The formula we wish to use
     * @param argumentList The arguments for the formula
     */
    createCalculatedField : function(formulaId, argumentList){
        var callback = function(state){
            this.createCalculatedFieldCallback(state);
            adhocDesigner.enableCanUndoRedo();
        }.bind(adhocCalculatedFields);

        designerBase.sendRequest('co_addField', new Array("formula=" + formulaId, "args=" + argumentList), callback, null);
    },
    /**
     * Used to send calculated field deletion request to the server.
     * @param fieldName The name of the field we wish to delete
     */
    deleteCalculatedField : function(fieldName, nodeToDelete){
        var callback = function(state){
            this.deleteCustomFieldCallback(fieldName, nodeToDelete, state);
            adhocDesigner.enableCanUndoRedo();
        }.bind(adhocCalculatedFields);

        designerBase.sendRequest('co_deleteField', new Array("fieldName=" + fieldName), callback);
    },
    /**
     * Used to send calculated field update request to the server.
     * @param fieldName the name of field we wish to update
     * @param formulaId the formula we wish to use
     * @param argList the args for the formula
     */
    updateCalculatedField : function(fieldName, formulaId, argList){
        var callback = function(state){
            this.updateCalculatedFieldCallback(state);
            adhocDesigner.enableCanUndoRedo();
        }.bind(adhocCalculatedFields);

        designerBase.sendRequest('co_updateField', new Array("fieldName=" + fieldName, "formula=" + formulaId, "args=" + argList), callback);
    },

    render: function (state, container) {
        if (state && !_.isEmpty(state)) {
            adhocDesigner.registerTemplate(adhocCalculatedFields, "calcFieldsTemplate");
            jQuery(container).html(adhocCalculatedFields.calcFieldsTemplate(state));
        }
    },

    /**
     * Used to send request to server to prepare the calculated field dialog
     */
    _prepareCalculatedFieldProcessing : function(){
        var callback = function(state){
            this.render(state, "#calculatedFields-container");
            this._launchDialogCallBack();
        }.bind(adhocCalculatedFields);

        var param = this.CALCULATION_REQUEST_PARAMS[adhocCalculatedFields.calcType];
        if(param){
            designerBase.sendRequest('co_setFormulaMap', new Array("params=" + param,
                    "calcType=" + this.calcType,
                    "fieldNames=" + encodeText(this.currentFieldNames),
                    "numericFirst=" + this.numericFirst), callback, null);
        }
    }
};
