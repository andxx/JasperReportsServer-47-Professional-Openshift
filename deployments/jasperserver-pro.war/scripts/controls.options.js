/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 *
 * Unless you have purchased  a commercial license agreement from Jaspersoft,
 * the following license terms  apply:
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License  as
 * published by the Free Software Foundation, either version 3 of  the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero  General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public  License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @author inesterenko
 */

;
(function ($, _, Controls, ControlsBase) {

//module:
//
//  controls.options
//
//summary:
//
//  Provide report options widget
//
//main types:
//
// ReportOptions widget
//
//dependencies:
//
//  $          - v1.7.1
//  _,              - underscore.js 1.3.1
//  Controls        - controls.core

    function errorHandler(err) {
        if (err.status >= 500) {
            showErrorPopup(err);
            return;
        }
        if (err.getResponseHeader("JasperServerError")) {
            if (!err.getResponseHeader("SuppressError")) {
                showErrorPopup(err);
            }
        }
    }

    var reportOptionUrlTemplate = "rest_v2/reports{{reportUnitURI}}/options";

    function fetchReportOptions(reportUri, callback, errorHandler) {
        var url = Controls.TemplateEngine.renderUrl(reportOptionUrlTemplate, {
            reportUnitURI:reportUri
        });
        return $.ajax({
            type:"GET",
            url:url,
            success:function (response) {
                callback(response.reportOptionsSummary);
            },
            error:errorHandler,
            dataType:"json",
            cache: false
        });

    }

    var createReportOptionUrlTemplate = "rest_v2/reports{{reportUnitURI}}/options?label={{label}}&overwrite={{overwrite}}";

    function createReportOptions(reportUri, label, data, overwrite, callback, errorHandler) {
        var url = Controls.TemplateEngine.renderUrl(createReportOptionUrlTemplate, {
            reportUnitURI:reportUri,
            label:encodeURI(label),
            overwrite:overwrite
        });

        return  $.ajax({
            type:"POST",
            url:url,
            processData:false,
//          TODO: implicit dependency on Prototype library
            data:Object.toJSON(data),
            success:function (response) {
                callback(response);
            },
            error:errorHandler,
            contentType:"application/json",
            dataType:"json"
        });

    }


    function createDefaultOption(reportUri) {
        return {
            id:"",
            uri:reportUri,
            label:ControlsBase.CONTROL_DEFAULT_OPTION_TEXT
        };
    }

    function prependWithDefaultOption (defaultOption,options) {

        var isAnySelected = _.find(options, function(val) {
            return val.selected === true;
        }) !== undefined;

        if (!isAnySelected) {
            defaultOption.selected = true;
        }

        return _.union([defaultOption], options);
    }

    return _.extend(Controls, {

        ReportOptions: Controls.BaseControl.extend({

            title:"",
            label:ControlsBase.CONTROL_OPTIONS_TEXT,
            type:"reportOptions",

            update:function (reportOptions) {
                var select = this.getElem().find('select');
                var template = this.getTemplateSection('data');
                select.empty();
                Controls.Utils.setInnerHtml(select[0],template, {data:reportOptions});
            },

            bindCustomEventListeners:function () {
                var elem = this.getElem();

                elem && elem.on('change', "select", _.bind(function (evt) {
                    var optionId = jQuery(evt.target).val();
                    var selectedOption = this.find({id: optionId});
                    this.set({selection:selectedOption});
                }, this));
            },

            fireControlSelectionChangeEvent : function(){
                var selectedOption = this.get('selection');
                jQuery(document).trigger(Controls.REPORT_OPTIONS_SELECTION_CHANGE, selectedOption);
            },

            set: function(attributes, preventNotification){
                if (attributes["selection"] !== undefined){
                    var selectedOptionId = attributes["selection"].id;
                    this["selection"] = this.find({id:selectedOptionId});
                    this.update(_.map(this.values, function(val){
                        if (selectedOptionId === val.id){
                            val.selected = true;
                        }else{
                            delete val.selected;
                        }
                        return val;
                    }));
                    !preventNotification && this.fireControlSelectionChangeEvent();
                }else{
                    Controls.ReportOptions.__super__["set"].apply(this, arguments);
                }
            },

            fetch:function (reportUri, reportOptionUri) {
                var defaultOption = createDefaultOption(reportUri);
                this.set({defaultOption: defaultOption});
                return fetchReportOptions(reportUri, _.bind(function (options) {
                    var values = _.map(options, function (opt) {
                        if (reportOptionUri && reportOptionUri == opt.uri) {
                            opt.selected = true;
                        }
                        return opt;
                    });

                    values = prependWithDefaultOption(defaultOption, values);
                    this.set({values:values});
                }, this), errorHandler);
            },

            reset : function(preventNotification){
                this.set({selection : this.get("defaultOption")}, preventNotification);
            },

            add:function (reportUri,optionLabel, selectedData, overwrite) {
                var callback = _.bind(function (newOption) {
                    var updatedValues;
                    newOption.selected = true;

                    var values = this.get('values');
                    var selectedOption = _.find(values, function (val) {
                        return val.selected;
                    });
                    if (selectedOption) {
                        delete selectedOption.selected;
                    }
                    if (values) {
                        updatedValues = _.union(values, [newOption]);
                    } else {
                        updatedValues = [newOption];
                    }

                    if (!values || _.isEmpty(values)){
                        updatedValues = prependWithDefaultOption(this.get("defaultOption"), updatedValues);
                    }
                    if (!overwrite){
                        this.set({values:updatedValues});
                    }else{
                        this.set({selection:newOption}, true);
                    }
                }, this);
                return createReportOptions(reportUri, optionLabel, selectedData, overwrite, callback, errorHandler).fail(_.bind(function(response){
                    try {
                        var errorResponse = jQuery.parseJSON(response.responseText);
                        var errorMessage = Controls.TemplateEngine.render(
                            errorResponse.message,
                            errorResponse.parameters,
                            Controls.TemplateEngine.STD_PLACEHOLDERS
                        );
                        this.set({error: errorMessage});
                    } catch (e) {
                        // In this scenario security error is handled earlier, in errorHandler, so we can ignore exception here.
                        // Comment this because it will not work in IE, but can be uncommented for debug purpose.
                        // console.error("Can't parse server response: %s", "controls.core", response.responseText);
                    }
                }, this));
            }
        }),

        REPORT_OPTIONS_SELECTION_CHANGE : "reportoptions:selection:changed"
    });
})(
    jQuery,
    _,
    JRS.Controls,
    ControlsBase
);
