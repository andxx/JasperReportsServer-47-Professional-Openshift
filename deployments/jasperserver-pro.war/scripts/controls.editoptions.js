/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

JRS.EditOptions = function (jQuery, _, Controls) {

    return  Controls.Base.extend({

        constructor:function (formSelector, reportUri) {
            this.controlsController = new Controls.Controller();
            this.viewModel = this.controlsController.getViewModel();
            jQuery(document).ready(_.bind(function(){
                this.initialize(formSelector, reportUri);
            },this));
        },

        initialize : function(formSelector, reportOptionUri){
            this.controlsController.initialize({reportUri:reportOptionUri});
            // Observe Edit Report Options Page
            var form = jQuery(formSelector);
            form.on("click", "button#done", _.bind(this.handleClick, this, form[0], "save"));
            form.on("click", "button#cancel", _.bind(this.handleClick, this, form[0], "cancel"));
        },

        handleClick:function (form, eventId, event) {
            event.preventDefault();
            form.method = "post";
            form._eventId.value = eventId;
            if(eventId == "cancel"){
                form.submit();
            }else if (eventId == "save"){
                this.controlsController.validate().then(_.bind(function (areControlsValid){
                    areControlsValid && this.submitForm(form)
                },this));
            }
        },

        submitForm:function (form) {
            var postData = this.viewModel.get('selection');
            if (postData) addDataToForm(form, postData);
            form.submit();
        }
    });

}(
    jQuery,
    _,
    JRS.Controls
);


(function(jQuery, _, EditOptions,  Report){
    try{
        new EditOptions("#reportOptionsForm", Report.reportOptionsURI);
    }catch(error){
        //TODO: add logging
    }

})(
    jQuery,
    _,
    JRS.EditOptions,
    Report
);
