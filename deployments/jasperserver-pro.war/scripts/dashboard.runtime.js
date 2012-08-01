/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var localContext = {
    PRINT_DIALOG_TIMEOUT : 3000,
    /*
     * frame types
     */
    CONTROL_FRAME : "controlFrame",
    CONTENT_FRAME : "contentFrame",
    TEXT_FRAME : "textFrame",
    CLICKABLE_FRAME : "clickableFrame",
    CONTAINER_ID_STUB : "Container",
    /*
     * prefix
     */
    CONTROL_PREFIX : "input_",
    HIDDEN_PARAM_PREFIX : "hidden_",
    CONTENT_FRAME_PREFIX : "contentFrame_",
    timers : [],
    buttonIdToAction : {},
    VIEW_DOM_ID : "dashboardViewer",
    NOTHING_SUBSTITUTE: "~NOTHING~",
    /*
     * patterns
     */
    CONTENT_FRAME_PATTERN : "div.componentContainer.iframe",
    CONTROL_BUTTON_PATTERN : "div.componentContainer.control.actionButton>button.action",
    FLOATING_BUTTON_PATTERN : "div.floatingMenu button.button",
    controlsController: new JRS.Controls.DashboardRuntimeController(),

    getMode : function(){
        return designerBase.DASHBOARD_RUNTIME;
    },

    //Event handling
    initDashboardViewEvents : function(){
        
    	$(this.VIEW_DOM_ID).observe("mouseover", function(event){
            var matched = null;
            var element = event.element();

            if(!isIPad()){
            	matched = matchAny(element, [this.CONTENT_FRAME_PATTERN], true);
                if(matched && (!window.frameElement || window.frameElement.id == "outerFrame")){
                    matched.addClassName("over");
                }	
            }
        }.bind(this));


        $(this.VIEW_DOM_ID).observe("mouseout", function(event){
            var matched = null;
            var element = event.element();

            matched = matchAny(element, [this.CONTENT_FRAME_PATTERN], true);
            if(matched && (!window.frameElement || window.frameElement.id == "outerFrame")){
                matched.removeClassName("over");
            }
        }.bind(this));

        $(this.VIEW_DOM_ID).observe("click", function(event){
            var matched = null;
            var regex = null;
            var regexMatch = null;
            var element = event.element();

            matched = matchAny(element, [this.CONTROL_BUTTON_PATTERN], true);
            if(matched){
                regex = /[A-Za-z]+$/;
                var buttonId = matched.identify();
                regexMatch = regex.exec(buttonId)[0];
                if(regexMatch){
                    this.buttonIdToAction[regexMatch]();
                }
            }

            matched = matchAny(element,  [this.FLOATING_BUTTON_PATTERN], true);
            if(matched){
                regex = /[A-Za-z]+_\d+$/;
                var id = matched.identify();
                regexMatch = regex.exec(id)[0];

                if (regexMatch) {
                    if (id.startsWith("refresh_")) {
                        var overlayContainer = $("containerOverlay_" + regexMatch);
                        if(overlayContainer){
                            var isCustom = overlayContainer.getAttribute("data-isCustom");
                            this.refreshIFrame(regexMatch);
                        }

                    } else if (id.startsWith("open_")) {
                        this._getDrillThroughSource(regexMatch);
                    }
                }
            }
        }.bind(this));
        
        if(isIPad()){
			document.getElementById('dashboardViewerFrame').addEventListener('touchstart', function(e) {
    			if(TouchController.proxy) {
    				TouchController.proxy.onTouchStart(e);
    			}
    		}, false);
    		document.getElementById('dashboardViewerFrame').addEventListener('touchmove', function(e) {     			
    			if(TouchController.proxy && e.touches.length == 1) {
    				TouchController.proxy.onTouchMove(e);
    			}
    			e.preventDefault();
    		}, false);
        }
    },


    initButtonIdToActionFunctions : function(){
        this.buttonIdToAction = {
            'submit' : _.bind(this.submitInputControlParams, this),
            'reset' : _.bind(this.resetInputControlParams, this),
            'print' : _.bind(this.printDashboard,this)
        };

    },

    /**
     * Used to init all frame source parameters
     * @param updateParameters
     */
    _initAllFrameSources : function(updateParameters){
        if(updateParameters){
            //updating params will also set IFRAME source
            //if submit button or params are default then don`t apply input controls on load
            //(just hidden params, if any)
            var hasSubmit = this._hasSubmitButton() ? true : false;
            this._updateIFrameSRCParams(!paramsChanged);
        }else{
            contentFrames.each(function(frame){
                var iFrame = $(this.CONTENT_FRAME_PREFIX + frame.frameName);
                iFrame.src = frame.src;
            }.bind(this));
        }
    },

    ///////////////////////////////////////////////////////////////
    // Runtime actions
    ///////////////////////////////////////////////////////////////
    /**
     * Used to load the dashboard
     */
    loadDashboard : function(){
        if (this._isPrintableWindow()) {
            this._hideInputControls();
            this._hideControlButtons();
            this._updateIFrameSRCParams(true);
        } else {
            if (controlFrames.length > 0) {

                this.controlsController.initialize({
                    initialValues: this.getInitialControlValues(true)
                }).always(
                    _.bind(this._initAllFrameSources, this, true)
                );

                JRS.Controls.listen({
                    "viewmodel:values:changed": _.bind(function () {
                        !this._hasSubmitButton() && this.submitInputControlParams();
                    }, this)
                });

            } else {
                this._initAllFrameSources(true);
            }
        }
        this.initDashboardViewEvents();
        this.initButtonIdToActionFunctions();   
        
        if(isIPad()) {
        	var pe = document.getElementById('dashboardViewerFrame');
        	if(window.parent.jQuery('#outerFrame').length > 0) {
        		pe = window.parent.jQuery('#outerFrame').parent().parent().get(0);
        	}
        	this._touchController = new TouchController(document.getElementById('dashboardFrameParent'), pe,{
        		translate3d: false,
        		debug: false
        	});     
        	TouchController.proxy = this._touchController;   
        }
    },

    getInitialControlValues: function (includeHiddenParams) {
        var initialValues = {};
        _.each(controlFrames, _.bind(function (frame) {
            initialValues[frame.paramName] = frame.paramValue;
        }, this));

        return includeHiddenParams ? _.extend(initialValues, this.getHiddenParamValuesForControls()) : initialValues;
    },

    getHiddenParamValuesForControls: function() {
        var values = {};

        if (hiddenParams.length > 0) {
            _.each(controlFrames, _.bind(function (frame) {
                var hiddenParamsValuesForControl = this.getHiddenParamValue(frame.paramName);
                if (hiddenParamsValuesForControl) {
                    values[frame.paramName] = hiddenParamsValuesForControl;
                }
            }, this));
        }

        return values;
    },

    getHiddenParamValue: function(paramName) {
        var value = [];
        _.each(hiddenParams, function (hiddenParam) {
            if (hiddenParam.paramName === paramName) {
                value.push(hiddenParam.paramValue);
            }
        });

        return value.length > 0 ? value : null;
    },

    /**
     * used to set refresh timer
     * @param frameName
     * @param autoRefresh
     */
    setRefreshTimer : function(frameName, autoRefresh) {
        var milliSecs = this._convertFromMinToMilliSecs(autoRefresh);
        this.timers[frameName] = setInterval("localContext.refreshIFrame('" + frameName + "')", milliSecs);
    },
    /**
     * Used to refresh and iframe
     * @param frameName
     */
    refreshIFrame : function(frameName){
        var frame = $(this.CONTENT_FRAME_PREFIX + frameName);
        if(frame){
            try {
                this._showFrameLoadingImage(frame);
                frame.contentWindow.location.reload(true);
            } catch(e) {
                //dealing with refreshing custom url iFrames
                //This will throw an exception if url is not in the same domain as parent window
            }
        }
    },

    ///////////////////////////////////////////////////////////////
    // Helper functions
    ///////////////////////////////////////////////////////////////

    /**
     * Used to convert mins to mills
     * @param minutes
     */
    _convertFromMinToMilliSecs : function(minutes){
        return parseInt(minutes) * 60000;
    },



    /**
     * Used to drill to source report
     * @param frameName
     */
    _getDrillThroughSource : function(frameName){
        var iFrame = this._getIFrameByName(frameName);
        if(iFrame){
            var newWindowSrc = iFrame.src;
            newWindowSrc = newWindowSrc.replace("&viewAsDashboardFrame=true","");
            launchNewWindow(newWindowSrc);
        }
    },



    /**
     * Used to get iframe by name
     * @param frameName
     */
    _getIFrameByName : function(frameName){
        var iFrameId =  this.CONTENT_FRAME + "_" + frameName;
        return $(iFrameId);
    },



    /**
     * Used to get control frame by name
     * @param frameName
     */
    _getControlFrameObjectByName : function(frameName){
        var frameObj = null;
        controlFrames.each(function(frame){
            if(frame.frameName === frameName){
                frameObj = frame;
                throw $break;
            }
        });
        return frameObj;
    },


    _getControlFrameObjectByParamName : function(paramName){
        var frameObj = null;
        controlFrames.each(function(frame){
            if(frame.paramName === paramName){
                frameObj = frame;
                throw $break;
            }
        });
        return frameObj;
    },


    _getFrameContainerByName : function(frameType, frameName){
        var containerId = frameType + localContext.CONTAINER_ID_STUB + "_" + frameName;
        return $(containerId);
    },


    /**
     * Used to get selected values from control frame
     * @param frame
     */
    _getSelectedValuesForControlFrame : function(frame){
        return this.controlsController.getViewModel().get('selection')[frame.paramName];
    },



    /**
     * Used to set selected values for control frames
     * @param controlFrame
     * @param value
     */
    _setSelectedValuesForControlFrame : function(controlFrame, value){
        var size = null;
        var index = null;
        var option = null;
        var inputType = null;
        var control = null;
        var dataType = controlFrame.dataType;

        var controls = document.getElementsByName(this.CONTROL_PREFIX + controlFrame.paramName);
        if (controls.length > 0) {
            inputType = controls[0].type;
        } else {
            control = document.getElementById(this.CONTROL_PREFIX + controlFrame.paramName);
            inputType = control.type;
        }
        if (controls.length == 1) {
            control = controls[0];
        }

        if (inputType) {
            if (inputType === "text") {
                if(dataType === "Date"){
                    var date = new Date();
                    date.setTime(getDateFromFormat(value, staticDatePattern, true));
                    control.value = formatDate(date, localDateFormat);
                }else if(dataType === "Timestamp"){
                    var date = new Date();
                    date.setTime(getDateFromFormat(value, staticDatePattern, true));
                    control.value = formatDate(date, localDateTimeFormat);
                } else {
                    control.value = value;
                }
            } else if (inputType === "select-one") {
                size = control.options.length;
                for (index = 0; index < size; index++) {
                    option = control.options[index];
                    if (option.value === value) {
                        control.selectedIndex = index;
                    }
                }
            } else if (inputType === "select-multiple") {
                size = control.options.length;
                var values = value.split("@@");
                for (index = 0; index < size; index++) {
                    option = control.options[index];
                    if (values.include(option.value)) {
                        option.selected = true;
                    } else {
                        option.selected = false;
                    }
                }

            } else if (inputType === "checkbox" || inputType === "radio") {
                //check boxes and radio
                var valueArray = value.split('@@');
                for (var i = 0; i < controls.length; i++) {
                    var checked = false;
                    for (var j = 0; j < valueArray.length; j++) {
                        //check string versions
                        var value1 = String(valueArray[j]);
                        var value2 = String(controls[i].value);
                        if (value1 === value2) {
                            checked = true;
                            break;

                        }
                    }

                    if (checked) {
                        controls[i].checked = "checked";
                    } else {
                        controls[i].checked = "";
                    }
                }
            } else {
                throw("[_setSelectedValuesForControlFrame]: unknown control type!!");
            }
        }

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
     * Used to update iframe src
     * @param skipInputControls
     */
    _updateIFrameSRCParams : function(skipInputControls){
        var parameterName = null;
        var parameterValue = null;
        var nextSymbol = null;

        contentFrames.each(function(frame){
            var frameName = frame.frameName;
            var iFrame = this._getIFrameByName(frameName);
            var parameterString = "";
            this._showFrameLoadingImage(iFrame);
            
            if(!isIPad())
            	document.getElementById('contentFrameContainer_'+frameName).style.backgroundImage = 'url(themes/default/images/wait_animation_large.gif)';
            
            iFrame = this._getIFrameByName(frameName);
            iFrame.className = 'hidden';
            
            if(!skipInputControls){
                controlFrames.each(function(control){
                    parameterName = frame[control.paramName];
                    if(parameterName){
                        var unformattedValue = this._getSelectedValuesForControlFrame(control);
                        parameterValue = this._formatParamValue(parameterName, unformattedValue);
                        nextSymbol = getSymbolToAppendNextParam(frame.src + parameterString);

                        parameterString = parameterString + nextSymbol + parameterValue;
                    }
                }.bind(this))
            }

            //now deal with hidden parameters
            hiddenParams.each(function(hiddenParameter) {
                //check for mapping, if non exists use unmapped name
                parameterName = (frame[hiddenParameter.paramName]) ? frame[hiddenParameter.paramName] : hiddenParameter.paramName;

                //Try to find control for given hidden parmeter
                var controlForHiddenParam = _.find(controlFrames, function (controlFrame) {
                    return controlFrame.paramName === hiddenParameter.paramName;
                });

                // Only add hidden value if no control exists for hidden parameter
                // (in other case value should be already added above)
                // or if input controls are skipped
                if (parameterName && (!controlForHiddenParam || skipInputControls)) {
                    parameterValue = this._formatParamValue(parameterName, [hiddenParameter.paramValue]);
                    //add all hidden parameters to the frame src. Multiple parameter values are allowed (see #23364)
                    parameterString = parameterString + getSymbolToAppendNextParam(frame.src + parameterString) + parameterValue;
                }
            }.bind(this));            
            //set iFrame source
            iFrame.src = frame.src +  parameterString;
            
        }.bind(this));
    },

    _buildHiddenParamsURL : function(){
        var url = "";
        controlFrames.each(function(frame){
            var unformattedValue = this._getSelectedValuesForControlFrame(frame);
            url = url + "&" + this._formatParamValue(this.HIDDEN_PARAM_PREFIX + frame.paramName, unformattedValue);
        }.bind(this));

        //now deal with hidden parameters
        hiddenParams.each(function(hiddenParameter) {
            var controlForHiddenParam = _.find(controlFrames, function (controlFrame) {
                return controlFrame.paramName === hiddenParameter.paramName;
            });

            if (!controlForHiddenParam) {
                url = url + "&" + this._formatParamValue(this.HIDDEN_PARAM_PREFIX + hiddenParameter.paramName, [hiddenParameter.paramValue]);
            }
        }.bind(this));

        return url;
    },

    submitInputControlParams : function(){
        this._updateIFrameSRCParams(false);
    },

    resetInputControlParams: function(){
        this.controlsController.updateControlsValues(this.getInitialControlValues(false));
    },

    printDashboard : function(){
        var regExp = new RegExp("(&)?" + this.HIDDEN_PARAM_PREFIX + "[^=]+=([^&]+)?", "g");
        var url = document.location.toString().replace(regExp, "");

        window.open(url + "&JSprint=true&viewAsDashboardFrame=true" + this._buildHiddenParamsURL(), "PrintPreview");
    },


    _hideControlButtons : function(){
        var buttonPrint = this._hasPrintButton();
        var buttonReset = this._hasResetButton();
        var buttonSubmit = this._hasSubmitButton();

        if(buttonPrint){
            buttonPrint.addClassName("hidden");
        }
        if(buttonReset){
            buttonReset.addClassName("hidden");
        }
        if(buttonSubmit){
            buttonSubmit.addClassName("hidden");
        }
    },

    _hideInputControls : function(){
        controlFrames.each(function(frame){
            var frameContainer = this._getFrameContainerByName(localContext.CONTROL_FRAME, frame.frameName);
            frameContainer.addClassName("hidden");
        }.bind(this))
    },


    _showPrintButton : function(){
        if(this._hasPrintButton()){
            $("button_print").removeClassName("hidden");
        }
    },


    _updateIFrameLoadingStatus : function(overlayId){
        var iFrameId = null;
        var overlay = $(overlayId);
        if(overlay){
            iFrameId = this._getIFrameIDFromOverlay(overlay);
            if($(iFrameId)){
                $(iFrameId).setAttribute("data-iframeLoaded", "complete");
                //var parent = $(overlayId).up("DIV");
                var parent = Element.up($(overlayId),"DIV");

                //Element.setStyle($(parent), {backgroundImage : 'none'});
                
                var ide = document.getElementById(iFrameId);
                if(ide && ide.getAttribute('src')){
                	if(ide.getAttribute('src').indexOf('http') == 0 || ide.getAttribute('src').indexOf('_flowId=dashboardRuntimeFlow') > 0) {
                		document.getElementById(iFrameId).className = '';
                	}
                }
                
                Element.show($(iFrameId));
                
                this._updateScroll();

                $(iFrameId).
                    observe("touchstart", cancelEventAndPreventDefault).
                    observe("touchmove", cancelEventAndPreventDefault).
                    observe("touchend", cancelEventAndPreventDefault).
                    observe("orientationchange", cancelEventAndPreventDefault);
            }
        }
    },

    _updateScroll : function(){
        var scrollElement = $("dashboardFrameParent");
        if(scrollElement) {
            var components = $$(".iframe, .control");
            var dimensions = designerBase.getContentDimensions(components);

            scrollElement.setStyle({
                width: dimensions.width + "px",
                height: (dimensions.height + 25)+ "px"
            });
        }
        //designerBase.updateIFrameScrolls();
    },


    _showFrameLoadingImage : function(contentFrame){
        var parent = $(contentFrame).up("DIV");
        if($(parent)){
            $(parent).setStyle({backgroundImage : ''});
            $(contentFrame).hide();
        }
    },


    /**
     * Used to get the iFrame id
     * @param overlay
     */
    _getIFrameIDFromOverlay : function(overlay){
        if(overlay){
            return $(overlay).getAttribute("data-iFrameID");
        }
        return null;
    },



    ///////////////////////////////////////////////////////////////
    // Conditional functions
    ///////////////////////////////////////////////////////////////

    /**
     * Is the window printable
     */
    _isPrintableWindow : function(){
    	return (document.location.href.indexOf("&JSprint=true") > -1);
    },



    /**
     * Are we doing xsite scripting. Is src param updatable
     * @param srcLocation
     */
    _isIFrameSrcUpdateable : function(srcLocation){
        return (!srcLocation || srcLocation.indexOf('blank.htm') > -1);
    },


    /**
     * Does the canvas have a submit button
     */
    _hasSubmitButton : function(){
        return $("button_submit");
    },



    /**
     * Does the canvas have a print button
     */
    _hasPrintButton : function(){
        return $("button_print");
    },



    /**
     * Does the canvas have a reset button
     */
    _hasResetButton : function(){
        return $("button_reset");
    }



};

document.observe('dom:loaded', function(){ return localContext.loadDashboard()});
