/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var worksheet = function (mode) {
    this.title = 'Worksheet';
    this.mode = mode;
    this.fields = null;
    this.dimensions = null;
    this.measures = null;

    this.grid = {
        state:{},
        mode:mode,
        actionmodel:null
    };

    this.chart = {
        state:{},
        actionmodel:null
    };

    this.defferedCallback = jQuery.Deferred();

    return this;
};

worksheet.onLoadCallback = function(state) {
    adhocDesigner.currentWorksheet.defferedCallback.resolve(state);
    adhocDesigner.render(state);
};

worksheet.ajaxActionPrefix = {
    table:'co',
    crosstab:'cr',
    olap_crosstab:'cr',
    chart: 'ch'
};

worksheet.prototype.load = function() {
    designerBase.sendRequest(worksheet.ajaxActionPrefix[this.mode] + "_loadState", [], worksheet.onLoadCallback);
};

worksheet.prototype.setMode = function(mode) {
    this.mode = mode
};

worksheet.prototype.setActionModel = function(actionmodel){
    this.mode == 'chart' ? this.chart.actionmodel = actionmodel : this.grid.actionmodel = actionmodel;
};

