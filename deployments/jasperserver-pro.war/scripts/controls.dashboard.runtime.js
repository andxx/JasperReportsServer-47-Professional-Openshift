/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

;(function (jQuery, _, Controls) {


    //module:
    //
    //  controls.dashboard.runtime
    //
    //summary:
    //
    //  Override controller and viewmodel to works with dashboard runtime
    //
    //main types:
    //
    // DashboardRuntimeViewModel - customize layout of controls
    // DashboardRuntimeController - allow to work with dashboard runtime state
    //
    //dependencies:
    //
    //
    //  jQuery          - v1.7.1
    //  _,              - underscore.js 1.3.1
    //  Controls        - control.controller
    //  clientKey       - id of dashboard state

    return _.extend(Controls,{

        DashboardRuntimeViewModel:Controls.ViewModel.extend({

            /*
             * Put controls to existing frames
             */

            draw:function () {
                _.each(this.getControls(), function (control) {
                    if (control.visible) {
                        var selectorTemplate = "div[data-inputControlName='{0}']";
                        var frameOverlaySelector = selectorTemplate.replace('{0}', control.id);
                        jQuery(frameOverlaySelector).after(control.getElem());
                    }
                });
            }
        }),

        DashboardRuntimeController:Controls.Controller.extend({

            detectReportUri:function () {
                this.reportUri = "/dashboard/viewer/" + clientKey;
                this.dataTransfer.setReportUri(this.reportUri);
            },

            initialize:function (args) {
                this.detectReportUri();

                var viewModel = new Controls.DashboardRuntimeViewModel();

                viewModel.initialize();

                this.viewModel = viewModel;

                return this.dataTransfer.fetchControlsStructure([], args.initialValues).done(function(response){
                    viewModel.set(response, true);
                });
            }
        })
    });

})(
    jQuery,
    _,
    JRS.Controls
);

