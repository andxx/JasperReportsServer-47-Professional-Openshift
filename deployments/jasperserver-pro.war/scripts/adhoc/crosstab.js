/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

var AdHocCrosstab = {
    DRILL_THROUGH_PATTERN: "tbody#detailRows tr td.value span",
    ROW_GROUP_MEMBER_PATTERN: "tbody#detailRows tr td.member",
    COLUMN_GROUP_MEMBER_PATTERN: "thead#headerAxis th.member",
    GROUP_LEVEL_PATTERN: "thead#headerAxis tr th.level",
    MEASURE_PATTERN: "table#canvasTable .measure",
    GROUP_MEMBER_DISCLOSURE_PATTERN: ".olap span.button.disclosure",
    GROUP_LEVEL_DISCLOSURE_PATTERN: "th.level span.button.disclosure",
    MEASURE_SORT_ICON_PATTERN: [
        ".olap .measure .icon.descending",
        ".olap .measure .icon.ascending",
        ".olap .measure .icon.natural"
    ],
    MEASURE_LABEL_PATTERN: "#measureLabel.label.measure UL.measures LI.leaf a span.xm",
    XTAB_LABEL_PATTERN: "th.label.group",

    ROW_GROUP_OVERFLOW_PATTERN: "td.rowOverflow",
    COLGROUP_GROUP_OVERFLOW_PATTERN: "th.colOverflow",

    COLGROUP_PLACEHOLDER: "th#columnGroupsPlaceHolder",
    ROW_GROUP_PLACEHOLDER: "td#rowGroupsPlaceHolder",
    MEASURES_PLACEHOLDER: "td#measuresPlaceHolder",
    TREE_CONTEXT_MENU_PATTERN: [
        'ul#dimensionsTree li.leaf .button',
        'ul#dimensionsTree li.node .button',
        'ul#measuresTree li.leaf .button',
        'ul#measuresTree li.node .button'],

    // Display Manager constants
    SHOWING_DISPLAY_MANAGER_CLASS: "showingDisplayManager",
    OLAP_COLUMNS_ID: "olap_columns",
    OLAP_ROWS_ID: "olap_rows",
    DM_AXIS_LIST_PATTERN: 'ul.tokens.sortable',

    OLAP_MEASURES_LEVEL_NAME: "MeasuresLevel",
    NULL_DIMENSION: "NULL Dimension",

    // actionModel context ids
    CUBE_CONTEXT: 'availableFieldsMenu',
    DIMENSION_TREE_DIMENSION_CONTEXT: "dimensionsTree_dimension",
    DIMENSION_TREE_LEVEL_CONTEXT: "dimensionsTree_level",
    MEASURE_TREE_GROUP_CONTEXT: "measuresTree_group",
    MEASURE_TREE_CONTEXT : "measuresTree",
    DISPLAY_MANAGER_ROW_CONTEXT : "displayManagerRow",
    DISPLAY_MANAGER_COLUMN_CONTEXT : "displayManagerColumn",
    MEASURES_DIMENSION_ROW_MENU_CONTEXT : "measuresDimensionInRows",
    MEASURES_DIMENSION_COLUMN_MENU_CONTEXT : "measuresDimensionInColumns",
    MEASURE_ROW_MENU_CONTEXT : "measureRow",
    MEASURE_COLUMN_MENU_CONTEXT : "measureColumn",

    ENDS_WITH_A_NUMBER_REGEX: new RegExp("\\d+$"),
    ALL_LEVEL_NAME: "(All)",

    crosstabMode: null, //CROSSTAB or OLAP_CROSSTAB

    ///////////////////////////////////////////
    //Type conversation constants
    ///////////////////////////////////////////

    INTEGER_JAVA_TYPES: ["java.lang.Byte", "java.lang.Integer", "java.lang.Short", "java.lang.Long", "java.math.BigInteger"],
    DECIMAL_JAVA_TYPES: ["java.lang.Float", "java.lang.Double", "java.math.BigDecimal", "java.lang.Number"],
    DATE_JAVA_TYPES: ["java.sql.Timestamp", "java.sql.Time", "java.sql.Date", "java.util.Date"],
    BOOLEAN_JAVA_TYPES: ["java.lang.Boolean"],

    DATE_TYPE_DISPLAY: "date",
    INTEGER_TYPE_DISPLAY: "int",
    DECIMAL_TYPE_DISPLAY: "dec",
    BOOLEAN_TYPE_DISPLAY: "bool",
    NOT_A_NUMBER_TYPE_DISPLAY: "NaN",

    ///////////////////////////////////////////
    //global constants
    ///////////////////////////////////////////

    MEASURE: "measure",
    ROW_GROUP_MEMBER: "rgMember",
    COLUMN_GROUP_MEMBER: "cgMember",
    ROW_GROUP_PREFIX: "rowGroup",

    HACK_PADDING: 1,
    VISUAL_CUE_HACK_PADDING: 2,
    TRUNCATED_LABEL_LEN: 100,
    requestsInProgress: 0,
    DROP_TARGET_CLASS: "dropTarget",
    draggingMoveOverIndex: -1,
    currentlyDraggingIndex: -1,

    getMessage: function(messageId, object) {
        var message = this.state.crosstabState.messages[messageId];
        return message ? new Template(message).evaluate(object ? object : {}) : "";
    },

    getMode: function() {
        if (!this.crosstabMode) {
            this.crosstabMode = localContext.state.viewType;
        }
        return this.crosstabMode;
    },
    
    setMode: function(mode) {
        this.crosstabMode = mode;
    },
    
    reset: function(){
        adhocDesigner.resetState.call(this);
    },

    update: function(state) {
        adhocDesigner.updateState.call(this, state);
        return this;
    },

    render: function() {
        var state = this.state;
        var crosstab = state.crosstab;

        var isDataPresent = crosstab.queryStatus === 'OK';

        jQuery('#nothingToDisplayMessage').html(adhocDesigner.getMessage(crosstab.queryStatusMessagePrefix + crosstab.queryStatus));
        adhocDesigner.ui.canvas.html(this[this.crosstabMode + 'Template'](state));
        adhocDesigner.setNothingToDisplayVisibility(!isDataPresent);

        adhocDesigner.enableXtabPivot(this.isPivotAllowed());

        return isDataPresent;
    },

    isPivotAllowed: function() {
        //For OLAP mode disable pivot if nothing in rows
        return this.state.getDimensionsCount('row') > 0 ||
        (localContext.isNonOlapMode() ? this.state.getDimensionsCount('column') > 0 : false);
    },

    initAll: function(){
        new Truncator($$(AdHocCrosstab.MEASURE_LABEL_PATTERN), AdHocCrosstab.TRUNCATED_LABEL_LEN);
        new Truncator($$(AdHocCrosstab.XTAB_LABEL_PATTERN), AdHocCrosstab.TRUNCATED_LABEL_LEN);
    },
    
    isOlapMode: function() {
        return this.getMode() === designerBase.OLAP_CROSSTAB;
    },

    isNonOlapMode: function() {
        return this.getMode() === designerBase.CROSSTAB;
    }
};

AdHocCrosstab.State = function(state) {
    adhocDesigner.State.call(this, state);
};

AdHocCrosstab.State.prototype = {
    getDimensions : function(axis) {
        return axis ? this.crosstabState[axis + 'Groups'] : _.chain(this.crosstabState).filter(function(val, key) {
            return key.search(/Groups$/) >= 0;
        }).flatten().value();
    },

    getDimensionsCount : function(axis) {
        return this.getDimensions(axis).length;
    },

    getLevelsFromDimension : function(dim, axis) {
        var axisModel = this.getDimensions(axis);
        dim = _.find(axisModel, function(d) {
            return d.name === dim;
        });

        return dim ?
            _.chain(dim.levels).filter(function(level) { // return only visible levels
                return level.visible;
            }).map(function(level) {                    // retrieve all members from levels
                return level.members ? level.members : level
            }).flatten().filter(function(member) {      // filter out spacers
                return !member.isSpacer;
            }).pluck('name').value()     :
            [];
    },

    getLevelObject : function(levelName, dimName, axisName) {
        var axisModel = this.getDimensions(axisName);
        function findByName(array, name) {
            return _.find(array, function(item) {
                return item.name == name;
            })
        };
        var dim = findByName(axisModel, dimName);
        if(!dim) {
            return null;
        }
        var level = findByName(dim.levels, levelName);
        return level;
    },

    getFilteredList : function(a, p) {
        var axis = a || null, props = p || {};
        if (arguments.length === 1 && _.isObject(a)) {
            props = a;
            axis = null;
        }
        // add mandatory values to property map
        props.visible = true;
        return _.chain(this.getDimensions(axis)).pluck('levels').flatten().
            map(function(level) {
                return level.members ? level.members : level;
            }).flatten().filter(function(level) {
                return _.all(props, function(prop, key) {
                    return level[key] === undefined ||  level[key] === prop;
                });
            }).value();
    },

    getFilteredMeasureList : function(a, p) {
        var axis = a || null, props = p || {};
        if (arguments.length === 1 && _.isObject(a)) {
            props = a;
            axis = null;
        }
        return this.getFilteredList(axis, _.extend(props, {measure : true, measuresLevel : true}));
    }
};