/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

;(function (jQuery, _, Controls) {

    //module:
    //
    //  controls.dashboard
    //
    //summary:
    //
    //  Override controller and viewmodel to works with dashboard
    //
    //main types:
    //
    // DashboardViewModel - allows to add and draw controls per frames
    // DashboardController - allow to add and remove controls
    //
    //dependencies:
    //
    //
    //  jQuery          - v1.7.1
    //  _,              - underscore.js 1.3.1
    //  Controls        - control.controller


    return _.extend(Controls, {

        DashboardViewModel:Controls.ViewModel.extend({

            /*
             * Draw control into specified decorator
             * @param control control to draw
             * @param decoratorId id of DOM element where to append control
             */
            drawControl:function (control, decoratorId) {
                if (control.visible && decoratorId) {
                    var decorator = jQuery("#" + decoratorId);
                    if (decorator.length > 0) {
                        control.refresh();
                        decorator.append(control.getElem());
                    }
                }
            },

            /* Draw each control per specified decorator
             *  @params decorators - map of control's uri as keys to decoratorId as values
             */

            draw:function (decorators) {
                _.each(this.getControls(), function (control) {
                    var decoratorId = decorators[control.id];
                    this.drawControl(control, decoratorId);
                }, this);
            },

            //Add new control structure

            add: function(attributes){
                if (attributes['structure'] !== undefined){
                    _.each(attributes['structure'], function (controlStructure) {
                        var control = this.createControl(controlStructure);
                        this.drawControl(control, controlStructure.decoratorId);
                    }, this);
                }
            }
        }),

        DashboardController:Controls.Controller.extend({

                initialize:function () {
                    this.detectReportUri();

                    //Strore connection between control and it's decorator
                    this.decorators = {};

                    //Create new viewModel and override it's draw method
                    this.viewModel = new Controls.DashboardViewModel();
                    this.viewModel.initialize();
                },

                detectReportUri:function(){
                    this.reportUri = "/dashboard/designer/" + clientKey;
                    this.dataTransfer.setReportUri(this.reportUri);
                },

                /*
                 * Get decorators bound with current controls
                 * @returns {"control_id": "frameId_control1"}
                 */
                getDecorators:function () {
                    return this.decorators;
                },

                /*
                 * Store connection between control and decorator
                 */
                addDecorator:function (controlId, decoratorId) {
                    if (!this.decorators[controlId]) {
                        this.decorators[controlId] = decoratorId;
                    }
                },

                removeDecoratorByControlId:function (decoratorId) {
                    delete this.decorators[decoratorId];
                },

                /*
                 * Add property decoratorId to each element if it has proper id
                 * @params  [{id:id},{id:id}]
                 */
                expandWithDecorators:function (elements) {
                    var decorators = this.getDecorators();
                    return _.map(elements, function (element) {
                        var decoratorId = decorators[element.id];
                        if (decoratorId) {
                            element.decoratorId = decoratorId;
                            return element;
                        } else {
                            return element
                        }
                    });
                },

                /**
                 * Returns return specified data from controls
                 * @API
                 */
                get:function (attribute) {
                    return this.getViewModel().get(attribute);
                },

                /*
                 * Redraw all controls in the DOM
                 * @API
                 */
                draw:function () {
                    this.getViewModel().draw(this.getDecorators());
                },

                /*
                 * Add set of controls to dashboard by binding it with decorators,
                 * refresh slave dependencies for exist controls
                 * @params  [{controlURI: controlURI, controlFrameId: controlFrameId, selectedValues: selectedValues}]
                 * @API
                 */
                addControls:function (args) {

                    var viewModel = this.getViewModel();
                    var dataTransfer = this.getDataTransfer();

                    //Add decoratorIds for new controls
                    _.each(args, function (initialControlData) {
                        this.addDecorator(initialControlData.controlId, initialControlData.controlFrameId);
                    }, this);

                    //Get all uri's and replace slashes
                    var controlIds = _.union(viewModel.pluck('id'), _.pluck(args, "controlId"));

                    var updateControlsDependencies = _.bind(this._updateControlsDependencies, this, args);

                    var filterOnlyNewlyAdded = _.bind(this._filterResponse, this, args);

                    var addControls = function (response) {
                        viewModel.add({structure:response.structure});
                        viewModel.set({state: response.state}, true);
                    };

                    var selectedData = {};
                    _.each(args, function(initialControlData) {
                        if (initialControlData.controlValue) {
                            selectedData[initialControlData.controlId] = initialControlData.controlValue;
                        }
                    });
                    selectedData = _.extend(viewModel.get('selection'), selectedData);

                    return dataTransfer.fetchControlsStructure(controlIds, selectedData
                    ).then(
                        updateControlsDependencies
                    ).pipe(
                        filterOnlyNewlyAdded
                    ).done(
                        addControls
                    );

                },

                _filterResponse : function(args, response){
                    //Find only newly added controls
                    var newControlsFrameIds = _.pluck(args, "controlId");
                    //Add decorator Ids
                    var filteredStructure = this.expandWithDecorators(response.structure);
                    //leave only newly added
                    filteredStructure = _.filter(filteredStructure, function(controlStructure){
                        return newControlsFrameIds.indexOf(controlStructure.id) >= 0;
                    });

                    return {
                        structure:filteredStructure,
                        state:response.state
                    }

                },

                _updateControlsDependencies:function (args, response) {
                    var structure = response.structure;
                    if (!_.isEmpty(args)) {
                        var newControlsFrameIds = _.pluck(args, "controlId");
                        structure = _.filter(response.structure, function (controlStructure) {
                            return newControlsFrameIds.indexOf(controlStructure.id) === -1;
                        });
                    }
                    _.each(structure, function (controlStructure) {
                        var control = this.viewModel.findControl({id :controlStructure.id});
                        control.masterDependencies = controlStructure.masterDependencies;
                        control.slaveDependencies = controlStructure.slaveDependencies;
                    }, this);
                },


                /*
                 * Remove set of controls from dashboard,
                 * refresh slave dependencies in left controls
                 * @params  [controlId, controlId]
                 * @API
                 */
                removeControls:function (controlIds) {

                    var viewModel = this.getViewModel();
                    var dataTransfer = this.getDataTransfer();

                    _.each(controlIds, _.bind(function (controlId) {
                        var control = viewModel.findControl({id:controlId});
                        this.removeDecoratorByControlId(control.id);
                        viewModel.removeControl(controlId);
                    }, this));

                    //Get controlIds for which to retreive structure
                    var ids = viewModel.pluck('id');

                    //Do not need to update values if there no controls on canvas
                    if (ids.length == 0) {
                        return;
                    }

                    var updateControlsDependencies = _.bind(this._updateControlsDependencies, this, {});

                    return dataTransfer.fetchControlsStructure(ids, viewModel.get("selection")
                    ).then(
                        updateControlsDependencies
                    ).done(function (response) {
                        viewModel.set({state : response.state}, true);
                    });
                }
            }
        )
    });


})(
    jQuery,
    _,
    JRS.Controls
);

