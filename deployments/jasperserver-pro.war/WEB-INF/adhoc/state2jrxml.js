/*
 * Copyright (C) 2005 - 2011 doJaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */
// State2JRXML
//
// Converts the state of the Ad Hoc editor to a JRXML file

// Commons Logging logger
var logger = Packages.org.apache.commons.logging.LogFactory.getLog("com.jaspersoft.ji.adhoc.service.state2jrxml");

// Prefixed to final string in the main method.
var xmlheader = '<?xml version="1.0" encoding="UTF-8"?>\n';

// Distance to indent each level of grouping labels
// TODO: NEEDS TO BE in CONFIG
var GROUP_INDENT = 0;//10;

var DETAIL_BAND_HEIGHT = 20;

// minimum group label size that we will try to display on group footer (see getGroupFooter() for more info)
var MIN_GROUP_LABEL_WIDTH = 100;

// xtab dims
//deprecated var XTAB_MEASURE_HEIGHT = 12;
//deprecated var XTAB_MIN_CELL_HEIGHT = 20;
//deprecated var XTAB_CELL_HEIGHT_FUDGE_FACTOR = 4;
var XTAB_ROW_HEADER_WIDTH = 125;
var XTAB_CELL_WIDTH = 100;
var XTAB_CELL_HEIGHT = 20;

// this doesn't work as advertised, so let's turn it off
var STRETCH_WITH_OVERFLOW = "true";

// internal constants
var SUMMARY_PREFIX = 's_';
var SUMMARY_MIDFIX = '_s_';

var PERCENT_TOTAL = "percent";
var PERCENT_ROW = "percentOfRowParent";
var PERCENT_COLUMN = "percentOfColumnParent";


var titleHeight;
// width of content
var contentWidth=0;
// height of content (for xtab only)
var contentHeight;
// height of a regular header band (not title)
var standardHeaderBandHeight

// cell height for xtabs
var xtabCellHeight;
// col header height (for now, same as cell height)
var xtabColumnHeaderHeight;
// measure height for xtabs
var xtabMeasureHeight;

// chart tags
var chartTypeTags = new Array();
var chartPlotTags = new Array();

// map types that are not allowed in textFieldExpression
var textFieldTypeMap = new Array();

// use this to get query and map fields and agg methods
var dataStrategy;

// debug ts
var startTime = new Date();

// save JR xml namespace to apply to our elements
var jrNS;
/*
 * init globals
 */
function init(state) {
    // compute content height
    contentHeight = state.pageHeight - (2 * state.verticalMargin);
    titleHeight = state.getTitleHeight();
    if (state.forTable()) {
        // init content width (sum of all column sizes)
        contentWidth = 0;
        for (var i = 0; i < state.getColumns().size(); i++) {
            var col = state.getColumns().get(i);
            contentWidth += col.width;
        }
        standardHeaderBandHeight = state.getStandardHeaderBandHeight();
    } else if (state.forCrosstab()) {
        contentWidth = state.getContentWidth();
        /* deprecated
        xtabCellHeight = XTAB_MEASURE_HEIGHT * state.getValidMeasureCount() + XTAB_CELL_HEIGHT_FUDGE_FACTOR;
        if (xtabCellHeight < XTAB_MIN_CELL_HEIGHT) {
            xtabCellHeight = XTAB_MIN_CELL_HEIGHT;
        }
        // make col header height same size as cell height
        xtabColumnHeaderHeight = xtabCellHeight;
        */
        xtabCellHeight = XTAB_CELL_HEIGHT;
        xtabColumnHeaderHeight = XTAB_CELL_HEIGHT;
        if (state.getValidMeasureCount() > 0)
        {
            xtabMeasureHeight = parseInt(XTAB_CELL_HEIGHT / state.getValidMeasureCount());
        }
        else
        {
            xtabMeasureHeight = XTAB_CELL_HEIGHT;
        }
    }
    if (state.printsChart()) {
      //build up tag names
      chartTypeTags["pie"] = 'pie3DChart';
      chartTypeTags["bar"] = 'bar3DChart';
      chartTypeTags["barStacked"] = 'stackedBar3DChart';
      chartTypeTags["pieFlat"] = 'pieChart';
      chartTypeTags["barFlat"] = 'barChart';
      chartTypeTags["barFlatStacked"] = 'stackedBarChart';
      chartTypeTags["line"] = 'lineChart';
      chartTypeTags["area"] = 'areaChart';
      chartTypeTags["areaStacked"] = 'stackedAreaChart';
      chartTypeTags["scatter"] = 'scatterChart';
      chartTypeTags["timeSeries"] = 'timeSeriesChart';
      //and plot names
      chartPlotTags["pie"] = 'pie3DPlot';
      chartPlotTags["pieFlat"] = 'piePlot';
      chartPlotTags["bar"] = 'bar3DPlot';
      chartPlotTags["barStacked"] = 'bar3DPlot';
      chartPlotTags["barFlat"] = 'barPlot';
      chartPlotTags["barFlatStacked"] = 'barPlot';
      chartPlotTags["line"] = 'linePlot';
      chartPlotTags["area"] = 'areaPlot';
      chartPlotTags["areaStacked"] = 'areaPlot';
      chartPlotTags["scatter"] = 'scatterPlot';
      chartPlotTags["timeSeries"] = 'timeSeriesPlot';
    }
    //finally make sure page is at least as wide as designated width
    contentWidth = Math.max(state.getContentWidth(),contentWidth);

    // set up text field type map
    // if you get errors like this, add something to the map:
    // org.xml.sax.SAXParseException: Attribute "class" with value "java.sql.Date" must have a value from the list
    // "java.lang.Boolean java.lang.Byte java.util.Date java.sql.Timestamp java.sql.Time java.lang.Double java.lang.Float java.lang.Integer java.lang.Long java.lang.Short java.math.BigDecimal java.lang.Number java.lang.String ".
    textFieldTypeMap["java.sql.Date"] = "java.util.Date";
}

// all page stuff calculated in the state now
function getReport(state) {
    var jasperReport = <jasperReport
         xmlns="http://jasperreports.sourceforge.net/jasperreports"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd"
         name="test"
         columnCount="1"
         printOrder="Vertical"
         orientation={ state.pageOrientation }
         pageWidth={ state.getPageWidthForJRXML()  }
         pageHeight={ state.getPageHeightForJRXML() }
         columnWidth={state.getContentWidth()}
         columnSpacing="0"
         leftMargin={state.horizontalMargin}
         rightMargin={state.horizontalMargin}
         topMargin={state.verticalMargin}
         bottomMargin={state.verticalMargin}
         whenNoDataType="NoPages"
         isTitleNewPage="false"
         isSummaryNewPage="false"/>;

    if (state.hasBaseResourceBundle()) {
         jasperReport.@resourceBundle=state.getBaseResourceBundle();
    }

    jasperReport.@isIgnorePagination = (state.forCrosstab() && state.isActualSize());

    return jasperReport;
}

function getAdHocProperties(state)
{
    var props = <property name="com.jaspersoft.ji.adhoc" value="1"/>;
    props += <property name="com.jaspersoft.ji.adhoc.preferredDataStrategy" value={dataStrategy.name}/>;
    props += <property name="net.sf.jasperreports.export.pdf.tagged" value="true"/>;
    props += <property name="net.sf.jasperreports.export.pdf.tag.language" value="EN-US"/>;
    if (state.printsChart()) {
        props += <property name="net.sf.jasperreports.export.xls.ignore.graphics" value="false"/>
        props += <property name="net.sf.jasperreports.export.xls.remove.empty.space.between.columns" value="false"/>
        props += <property name="net.sf.jasperreports.charts.theme" value="default"/>
    }
    return props;
}
// get a box that Laura uses a lot to implement styles
function invisibox() {
    return <box><pen lineWidth="0" lineColor="#000000"/></box>;
}

// get a field ref expression
function getFieldRef(name) {
    return '$F{' + name + '}';
}

// Get a field expression for a column or measure that will be used in an
// aggregate calculation. It's usually the same as getFieldRef(), but in the
// case of average calc, where the field might be Integer but average might be
// double, we need to turn it into a double.

function getColumnFieldExpression(col) {
	return getFieldExpression(
		dataStrategy.getAggregateFieldName(col),
		dataStrategy.getAggregateFunction(col),
		col.getType(),
		col.getFunctionType());
}

function endsWith(text, suffix) {
	
	if (text.endsWith) {
		// text is a java.lang.String
		return text.endsWith(suffix);
	}
	
	// text is a JavaScript string
	return text.length >= suffix.length
		&& text.substring(text.length - suffix.length) == suffix;
}

function getFieldExpression(fieldName, aggFunction, fieldType, functionType) {
    var expr = getFieldRef(fieldName);
    
    if (fieldType == functionType || endsWith(aggFunction, "Count")) {
        return expr;
    }else if (functionType == "java.lang.Double") {
        return "Double.valueOf(" + expr + ".doubleValue())";
    }else if (functionType == "java.lang.Integer") {
            return "Integer.valueOf(" + expr + ".intValue())";
    }else if (functionType == "java.lang.Short") {
        return "Short.valueOf(" + expr + ".shortValue())";
    }else{
        // some other case we didn't think of
        return expr;
    }
}


// get a variable reference expression
function getVariableRef(name) {
    return '$V{' + name + '}';
}

function getGroupVariableName(group, column) {
	return getGroupFieldVariableName(group, column.getUniqueName(), 
		dataStrategy.getAggregateFunction(column));
}

function getGroupFieldVariableName(group, fieldName, aggFunction) {
    return group.getName() + SUMMARY_MIDFIX 
    	+ aggFunction + "_" 
    	+ fieldName;
}

/**
 * Use this to create a Java string expression in the JRXML which could possibly be null.
 * @param object
 * @return
 */
function getJavaStringOrNull(object) {
	return object == null ? "null" : '"' + object + '"';
}

function mapTextExpressionType(type) {
    var mapped = textFieldTypeMap[type];
    return mapped ? mapped : type;
}

function getTitleBand(state) {
    var chartState;
    var bandHeight = titleHeight;
    var style;
    var width = state.getTitleWidthForJRXML();

    if (state.forTable()) {
      style = "Title";
    }
    else if (state.forCrosstab()) {
      style = "CrosstabTitle";
    }
    if (state.printsChart()) {
      chartState = state.getChartState();
      style = "ChartReportTitle";
      bandHeight += chartState.getOffsetY()+chartState.getChartHeight()+chartState.getVerticalChartPadding();
      width += chartState.getHorizontalChartPadding();
    }

    var ret = <title>
            <band height={bandHeight} splitType="Stretch">
            </band>
        </title>;

    if (state.hasTitle()) {
        ret.band.* +=
            <staticText>
                <reportElement
                    style={style}
                    x="0"
                    y="0"
                    width={width}
                    height={titleHeight}
                    key="staticText"/>
                <textElement textAlignment="Center">
                </textElement>
                <text> { state.getTitle() } </text>
            </staticText>
    }

    return ret;
}

// get group and its expression
function getGroup(name, expr) {
    return <group name={ name } minHeightToStartNewPage="60">
        <groupExpression>{ expr }</groupExpression>
        </group>;
}

/*   need to concatenate the group label with the current group value to get
     the text field. The problem is that this has to be a string because of the
     label, but then you can't use a pattern. You can't use two textfields because
     you don't know where to position the second one.
*/
function getGroupLabelTextField(group) {
    // this is the Java expression to call the formatter method
    // you may have to look at it for awhile before it sinks in
    // the resulting Java snippet in the JRXML will be something like this:
    // com.jaspersoft.ji.adhoc.service.AdhocEngineServiceImpl.getInstance().formatValue($F{whoozit}, "0,000.00", "java.lang.Double", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})

    var expr = 'com.jaspersoft.ji.adhoc.service.AdhocEngineServiceImpl.getInstance().formatValue(' +
                getFieldRef(group.getName()) +
                ', ' + getJavaStringOrNull(group.getMask()) + ',"' + group.getType() +
                '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

    // if there's a label, add Java code to prepend it
    if (group.hasLabel()) {
        expr = group.getLabelExpressionForJRXML(true) + ' + ": " + ' + expr;
    }

    // now slam it into the JRXML
    return <textFieldExpression class="java.lang.String">{expr}</textFieldExpression>;
}

function getGroupHeader(state, group, level) {
    // calc offset based on level of header
    var offset = GROUP_INDENT * (level+1);
    var style = 'Group' + Math.min(3, level + 1) + 'Header'
    var ret = <groupHeader>
            <band height={standardHeaderBandHeight} splitType={getBandSplitType(state)}>
                <frame>
                    <reportElement
                        style={style}
                        x="0"
                        y="0"
                        width={ contentWidth }
                        height={standardHeaderBandHeight}>
                        <property name="net.sf.jasperreports.export.pdf.tag.tr" value="full"/>
                        <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
                    </reportElement>
                    <textField isBlankWhenNull="true" evaluationTime="Group" evaluationGroup={ group.getName() } bookmarkLevel="1">
                        <reportElement
                            style={style}
                            mode="Transparent"
                            x={ offset }
                            y="0"
                            width={ contentWidth - offset }
                            height={standardHeaderBandHeight}/>
                        <textElement/>
                        { getGroupLabelTextField(group) }
                    </textField>
                </frame>
            </band>
        </groupHeader>;
    //ret.band.frame.reportElement += invisibox();
    ret.band.frame.textField.reportElement += invisibox();
    return ret;
}

/*
 * put together group footer from label & summaries
 */
function getGroupFooter(state, group, level) {
    var offset = GROUP_INDENT * (level+1);
    var style = 'Group' + Math.min(3, level + 1) + 'Footer'
    var ret = <groupFooter>
        <band height={standardHeaderBandHeight} splitType={getBandSplitType(state)}>
            <frame>
                <reportElement
                    style={style}
                    x="0"
                    y="0"
                    width={ contentWidth }
                    height={standardHeaderBandHeight}>
                    <property name="net.sf.jasperreports.export.pdf.tag.tr" value="full"/>
                </reportElement>
            </frame>
        </band>
    </groupFooter>;
    // group label has to fit in the space to the left of the first column that has a summary.
    // if there isn't enough space, don't print the group label
    var groupLabelWidth = getFirstSummaryOffset(state, group, level) - offset;
    if (groupLabelWidth >= MIN_GROUP_LABEL_WIDTH || !state.getShowTableDetails()) {
        var txtFld = <textField isStretchWithOverflow={STRETCH_WITH_OVERFLOW} isBlankWhenNull="true" evaluationTime="Now" >
                                <reportElement
                                    style={ style }
                                    x={ offset }
                                    y="0"
                                    width={ groupLabelWidth }
                                    height={standardHeaderBandHeight}
                                    stretchType="RelativeToBandHeight">
                                    <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
                                </reportElement>
                                <textElement/>
                                { getGroupLabelTextField(group) }
                            </textField>;
        txtFld.reportElement += invisibox();
        ret.band.frame.* += txtFld;
    }
    ret.band.frame.* += getGroupFooterSummaries(state, group, level, style);
    return ret;
}

/*
 * The actual value of group. e.g., Rome
 */
function getGroupFooterValue(state, group, level, style) {
    var offset = GROUP_INDENT * level;
    var ret = <textField isStretchWithOverflow={STRETCH_WITH_OVERFLOW} isBlankWhenNull="true" evaluationTime="Now" >
            <reportElement
                style={style}
                x={offset}
                y="0"
                width={ getFirstSummaryOffset(state, group, level) - offset }
                height={standardHeaderBandHeight}
                stretchType="RelativeToBandHeight">
                <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
            </reportElement>
            { getGroupLabelTextField(group) }
        </textField>;
    ret.reportElement += invisibox();
    return ret;
}

function isAverageSQL(column) {
    return (dataStrategy.isDoGroupQuery() && (dataStrategy.getAggregateFunction(column).equals("Average")));
}

/*
 * Generates the actual list of summary values (referencing the
 * summary variables) for each group.
 */
function getGroupFooterSummaries(state, group, level, style) {
    var summaries = new XMLList();

    var x = 0;
    for (var j = 0; j < state.getColumns().size(); j++) {
        var column = state.getColumns().get(j);

        if (column.getFunction() != null) {
            // show the summary function
            
            var colDetail = getDetailField(x, column);

            var evaluationTime = "Now";
            var expression;

            var field = null;
            if (!isAverageSQL(column)) {
                field = dataStrategy.getAggregatedField(column);
            }
            if ((field != null) && isPercent(field)) {
            	var baseField = field.getFormulaRef().getArguments().get(0);
            	var baseVarField = getVarFieldName(baseField, "Sum");
            	var operation = field.getFormulaRef().getOperatorName();
            	if (operation == PERCENT_COLUMN) {
            		// 100%
	            	expression = getHundredPercentExpression();
            	} else if (operation == PERCENT_TOTAL || level == 0) {
            		evaluationTime = "Auto";
            		expression = getPercentExpression(
            			getVariableRef(getGroupFieldVariableName(group, baseVarField, "Sum")),
            			getVariableRef(getFieldSummaryVariableName(baseVarField, "Sum")));
            	} else if (operation == PERCENT_ROW) {
            		evaluationTime = "Auto";
            		var groups = state.getGroups();
            		var outerGroup = groups.get(level - 1);
            		expression = getPercentExpression(
            			getVariableRef(getGroupFieldVariableName(group, baseVarField, "Sum")),
            			getVariableRef(getGroupFieldVariableName(outerGroup, baseVarField, "Sum")));
            	}
            } else {
            	expression = getVariableRef(getGroupVariableName(group, column));
            }
            
            var summary = <textField
                    isStretchWithOverflow={STRETCH_WITH_OVERFLOW}
                    isBlankWhenNull="true"
                    evaluationTime={evaluationTime} >
                    <reportElement
                        style={style}
                        x={x}
                        y="0"
                        width={column.getWidth()}
                        height={standardHeaderBandHeight}
                        stretchType="RelativeToBandHeight">
                        <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
                    </reportElement>
                    <textElement textAlignment={column.alignment}/>
                    <textFieldExpression class={mapTextExpressionType(column.getFunctionType())}>{ expression }</textFieldExpression>
                </textField>;
            summary.reportElement += invisibox();
            if (column.getFunctionMask() != null) {
                summary.@pattern = column.getFunctionMask();
            }
            summaries += summary;
        }
        x = x + column.getWidth();
    }
    return summaries;
}

function getFirstSummaryOffset(state, group, level) {
    var x = 0;
    for (var j = 0; j < state.getColumns().size(); j++) {
        var column = state.getColumns().get(j);

        if (column.getFunction() != null) {
            return (x <= 0) ? column.getWidth() : x;
        }
        x = x + column.getWidth();
    }
    return x;
}

function isSpacer (col) {
    return col.type == "_spacer";
}

function getColumnSummaryVariableName(column) {
	return getFieldSummaryVariableName(column.getUniqueName(), 
		dataStrategy.getAggregateFunction(column));
}

function getFieldSummaryVariableName(fieldName, functionName) {
	return SUMMARY_PREFIX 
		+ functionName + "_" 
		+ fieldName;
}

function divideExpression(calcField, expr1, expr2, resultType) {
	return "AdhocReportUtils.calculateFieldFormula(\""
		+ Packages.net.sf.jasperreports.engine.util.JRStringUtil.escapeJavaStringLiteral(calcField) 
		+ "\", new Object[]{" + expr1 + ", " + expr2 + "}, "
		+ resultType + ".class)"; 
}

function divideVarsExpression(calcField, var1, var2, resultType) {
	return divideExpression(calcField, 
		"$V{" + var1 + "}", "$V{" + var2 + "}",
		resultType); 
}

/*
 * Inserts the variables and expressions that are used to
 * perform the aggregate calculations. These variables
 * are then referenced in the group and report summary
 * bands.
 *
 * Also creates the inner row count used to perform alternate row styling.
 */
function addSummaryVariables ( report, state) {
    var columns  = state.getColumns();

    // work out the inner group
    var innerGroupName = "REPORT";
    if (state.getGroups().size() > 0) {
        innerGroupName = state.getGroups().get(state.getGroups().size()-1).getName();
    }

    report.* += <variable name="InnerRowCount"
                class="java.lang.Integer"
                    resetType="None" calculation="Nothing">
                    <variableExpression>{getVariableRef(innerGroupName + "_COUNT")}</variableExpression>
                </variable>;

    // Loop over all the columns that have summaries
    for (var i = 0; i < columns.size(); i++) {
        var column = columns.get(i);
        if (column.getFunction() != null && !isPercentColumn(column)) {
	        addColumnSummaryVariables(report, state, column);
        }
    }
    
	// add sum variables for all percentage fields
	// TODO only do this for columns in the report?
	for (var i = 0; i < dataStrategy.fieldList.size(); i++) {
		var field = dataStrategy.fieldList.get(i);
		if (isPercent(field)) {
			var func = field.getFormulaRef().getOperatorName();
			if (func == "percent" || func == "percentOfRowParent") {
				var formulaArgs = field.getFormulaRef().getArguments();
				var baseField = formulaArgs.get(0);
				// percent is always from sum
				addAggregateFieldCalculation(report, state, baseField, "Sum", true);
			}
		}
	}
}

function addFieldAggFirstSummaryVariables(report, state, 
		fieldName, varFieldName, aggFunction, functionType) {
	var field = dataStrategy.getFieldForName(fieldName);
	var formula = field.getFormulaRef();
	var formulaArgs = formula.getArguments();
	var field1 = formulaArgs.get(0);
	var field2 = formulaArgs.get(1);
	
	var varFieldName1 = addAggregateFieldCalculation(
		report, state, field1, aggFunction);
	var varFieldName2 = addAggregateFieldCalculation(
		report, state, field2, aggFunction);
	
	var sumVarName = getFieldSummaryVariableName(varFieldName, aggFunction);
	
	default xml namespace = jrNS;
	if (report.variable.(@name == sumVarName).length() >= 1) {
		// already added
		return;
	}
	
	// create a summary variable by dividing the two summary vars
	report.* += <variable
	    name={ sumVarName }
		class={ functionType }
		resetType="Report">
			<variableExpression>{ divideVarsExpression(
				field.getName(),
				getFieldSummaryVariableName(varFieldName1, aggFunction),
				getFieldSummaryVariableName(varFieldName2, aggFunction),
				functionType) }</variableExpression>
		</variable>;

	// for each column with a summary, create a group summary expression
	var groups = state.getGroups();
	for (var g = 0; g < groups.size(); g++) {
		var group = groups.get(g);
		report.* += <variable
    		name={ getGroupFieldVariableName(group, varFieldName, aggFunction) }
    		class={ functionType }
    		resetType="Group"
    		resetGroup={ group.getName() }>
        		<variableExpression>{ divideVarsExpression(
					field.getName(),
					getGroupFieldVariableName(group, varFieldName1, aggFunction),
					getGroupFieldVariableName(group, varFieldName2, aggFunction),
					functionType) }</variableExpression>
    		</variable>;
	}
}

function addAggregateFieldCalculation(report, state, field, aggFunction, forceAggregation) {
	var varFieldName;
	var column = dataStrategy.getColumnForField(field.getName());
	if (column != null
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		// the field is present in the report and has the same summary func
		// adding the column variables (if not yet added)
		addColumnSummaryVariables(report, state, column, forceAggregation);
		
		varFieldName = column.getUniqueName();
	} else {
		// we don't have the field in the report
		// TODO use a unique name for the field?
		var fieldNames = new Array();
        fieldNames[0] = field.getName();
		addFieldSummaryVariables(report, state, 
			fieldNames, field.getName(), aggFunction, field.getType(),
			dataStrategy.getFieldAggregationType(field, aggFunction),
			forceAggregation);
			
		varFieldName = field.getName();
	}
	return varFieldName;
}

function addColumnSummaryVariables(report, state, column, forceAggregation) {
    addFieldSummaryVariables(report, state, 
    	dataStrategy.getAggregateFieldNames(column),
    	column.getUniqueName(),
    	dataStrategy.getAggregateFunction(column),
    	column.getType(),
    	column.getFunctionType(), 
    	forceAggregation);
}

function addFieldSummaryVariables(report, state, fieldNames, varFieldName,
		aggFunction, fieldType, functionType, forceAggregation) {
	var sumVarName = getFieldSummaryVariableName(varFieldName, aggFunction);
	
	default xml namespace = jrNS;
	if (report.variable.(@name == sumVarName).length() >= 1) {
		// already added
		return;
	}
    if (dataStrategy.isDoGroupQuery() && (aggFunction.equals("Average"))) {
        addFieldAverageAggregateVariables(report, state, fieldNames, varFieldName,
			fieldType, functionType);
    } else 	if (forceAggregation || !dataStrategy.isAggregateFirstFieldCalculation(fieldNames[0], aggFunction)) {
		addFieldAggregateVariables(report, state, fieldNames[0], varFieldName,
			aggFunction, fieldType, functionType);
	} else {
		addFieldAggFirstSummaryVariables(report, state, 
			fieldNames[0], varFieldName, aggFunction, functionType);
	}
}

function addFieldAverageAggregateVariables(report, state, fieldNames, varFieldName,
		fieldType, functionType) {
    var sumVarNames = new Array();
    sumVarNames[0] = getFieldSummaryVariableName(varFieldName, "Sum");
    sumVarNames[1] = getFieldSummaryVariableName(varFieldName, "Count");
    var fieldExpressions = new Array();
    fieldExpressions[0] = getFieldExpression(fieldNames[0], "Average", fieldType, functionType);
    fieldExpressions[1] = getFieldExpression(fieldNames[1], "Average", fieldType, functionType);

    for (var i = 0; i < fieldNames.length; i++) {
        report.* += <variable
            name={ sumVarNames[i] }
            class={ functionType }
            resetType="Report"
            calculation={ "Sum" }>
            <variableExpression>{ fieldExpressions[i] }</variableExpression>
        </variable>;
    }
    var sumVarName = getFieldSummaryVariableName(varFieldName, "Average");
    var fieldExpression = "(" + getVariableRef(sumVarNames[0]) + " / " + getVariableRef(sumVarNames[1]) + ")";

    // create a summary variable for the column
    report.* += <variable
        name={ sumVarName }
        class={ functionType }
        resetType="Report">
        <variableExpression>{ fieldExpression }</variableExpression>
    </variable>;

    // for each column with a summary, create a group summary expression
    var groups = state.getGroups();
    for (var g = 0; g < groups.size(); g++) {
        var group = groups.get(g);

        var sumGroupVarNames = new Array();
        sumGroupVarNames[0] = getGroupFieldVariableName(group, varFieldName, "Sum");
        sumGroupVarNames[1] = getGroupFieldVariableName(group, varFieldName, "Count");

        for (var i = 0; i < fieldNames.length; i++) {
            report.* += <variable
                name={ sumGroupVarNames[i] }
                class={ functionType }
                resetType="Group"
                resetGroup={ group.getName() }
                calculation={ "Sum" }>
                <variableExpression>{ fieldExpressions[i] }</variableExpression>
            </variable>;
        }
        var groupFieldExpression = "(" + getVariableRef(sumGroupVarNames[0]) + " / " + getVariableRef(sumGroupVarNames[1]) + ")";
        report.* += <variable
            name={ getGroupFieldVariableName(group, varFieldName, "Average") }
            class={ functionType }
            resetType="Group"
            resetGroup={ group.getName() }>
                <variableExpression>{ groupFieldExpression }</variableExpression>
            </variable>;
    }
}

function addFieldAggregateVariables(report, state, fieldName, varFieldName, 
		aggFunction, fieldType, functionType) {
	var sumVarName = getFieldSummaryVariableName(varFieldName, aggFunction);
	
	var fieldExpression = getFieldExpression(
		fieldName, aggFunction, fieldType, functionType);
	
    // create a summary variable for the column
    report.* += <variable
        name={ sumVarName }
        class={ functionType }
        resetType="Report"
        calculation={ aggFunction }>
        <variableExpression>{ fieldExpression }</variableExpression>
    </variable>;

    // for each column with a summary, create a group summary expression
    var groups = state.getGroups();
    for (var g = 0; g < groups.size(); g++) {
        var group = groups.get(g);
        report.* += <variable
            name={ getGroupFieldVariableName(group, varFieldName, aggFunction) }
            class={ functionType }
            resetType="Group"
            resetGroup={ group.getName() }
            calculation={ aggFunction }>
                <variableExpression>{ fieldExpression }</variableExpression>
            </variable>;
    }
}

function addTitle(report, state) {
    if (state.hasTitle() || state.printsChart()) {
        report.appendChild(getTitleBand(state));
    }
}

function getColumnHeaderSection() {
    var ret = <columnHeader>
            <band height={standardHeaderBandHeight} splitType="Stretch">
                <frame>
                    <reportElement
                        style="ColumnHeaderFooter"
                        x="0"
                        y="0"
                        width={contentWidth}
                        height={standardHeaderBandHeight}>
                        <property name="net.sf.jasperreports.export.pdf.tag.table" value="start"/>
                        <property name="net.sf.jasperreports.export.pdf.tag.tr" value="full"/>
                    </reportElement>
                </frame>
            </band>
        </columnHeader>;
    //ret.band.frame.reportElement += invisibox();
    return ret;
}

function getColumnHeader(col, x, label, width) {
    if (isSpacer(col) || ! col.hasLabel()) {
        label = "";
    }
    var ret =
      <textField isBlankWhenNull="true" isStretchWithOverflow="true">
        <reportElement
            style="ColumnHeaderFooter"
            mode="Transparent"
            x={x}
            y="0"
            width={width}
            height={standardHeaderBandHeight}>
            <property name="net.sf.jasperreports.export.pdf.tag.th" value="full"/>
        </reportElement>
        <textElement textAlignment={col.alignment}/>
        <textFieldExpression>{label}</textFieldExpression>
      </textField>;

    ret.reportElement += invisibox();
    return ret;
}

function addColumnHeader(report, state) {
    var myColHeader = getColumnHeaderSection();
    var band = myColHeader.band;
    var x = 0;
    for (var i = 0; i < state.getColumns().size(); i++) {
        var col = state.getColumns().get(i);
        band.frame.appendChild(getColumnHeader(col, x, col.getLabelExpressionForJRXML(true), col.width));
        x += col.width;
    }
    //finally - if any remaining width add a blank header
    if (contentWidth>x) {
        band.frame.appendChild(getColumnHeader(col, x, '""', contentWidth-x));
    }
    report.appendChild(myColHeader);
}

function addColumnFooter(report, state) {
    var myColFooter = <columnFooter>
            <band height="0" splitType="Stretch">
                <frame>
                    <reportElement
                        x="0"
                        y="0"
                        width={contentWidth}
                        height="0">
                        <property name="net.sf.jasperreports.export.pdf.tag.table" value="end"/>
                    </reportElement>
                </frame>
            </band>
        </columnFooter>;
    report.appendChild(myColFooter);
}

/*
 * Top level function for adding the grouping section. Calls
 * many sub-functions to help it.
 */
function addGroups(report, state) {
    var lastGroup = state.getLastGroup();
    for (var i = 0; i < state.getGroups().size(); i++) {
        var group = state.getGroups().get(i);
        var groupElem = getGroup(group.getName(), getFieldRef(group.getName()));
        if (state.getShowTableDetails() || group != lastGroup) {
            groupElem.appendChild(getGroupHeader(state, group, i));
        }
        groupElem.appendChild(getGroupFooter(state, group, i));
        report.appendChild(groupElem);
    }
}

function getDetail(state) {
    var ret = <detail>
            <band height={DETAIL_BAND_HEIGHT} splitType={getBandSplitType(state)}>
                <frame>
                    <reportElement
                        style="Details"
                        x="0"
                        y="0"
                        width={contentWidth}
                        height="20">
                        <property name="net.sf.jasperreports.export.pdf.tag.tr" value="full"/>
                    </reportElement>
                </frame>
            </band>
        </detail>;
    //ret.band.frame.reportElement += invisibox();
    return ret;
}

function getBandSplitType(state) {
	return state.allowBandSplit ? "Stretch" : "Prevent";
}

function getDetailField(x, column) {
    var ret = <textField
        isStretchWithOverflow={STRETCH_WITH_OVERFLOW}
        isBlankWhenNull="true"
        evaluationTime="Now"
        hyperlinkType="None"
        hyperlinkTarget="Self">
        <reportElement
            x={x}
            y="0"
        width={column.getWidth()}
            height={DETAIL_BAND_HEIGHT}
            key="textField">
            <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
        </reportElement>
        <textElement textAlignment={column.getAlignment()}/>
    </textField>;
    if (column.getMask() != null) {
        ret.@pattern = column.getMask();
    }
    ret.reportElement += invisibox();
    return ret;
}

function getVarFieldName(field, aggFunction) {
	var varFieldName;
	var column = dataStrategy.getColumnForField(field.getName());
	if (column != null 
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		varFieldName = column.getUniqueName();
	} else {
		varFieldName = field.getName();
	}
	return varFieldName;
}

/*
 * Add the details section which actually has data inside the
 * inner most group level (if present)
 */
function addDetail(report, state) {
    var myDetail = getDetail(state);
    var band = myDetail.band;
    var x = 0;
    for (var i = 0; i < state.getColumns().size(); i++) {
        var col = state.getColumns().get(i);
        if (! isSpacer(col)) {
            var colDetail = getDetailField(x, col);
            var field = dataStrategy.getFieldForName(col.getName());
            
            var expression;
            if (isPercent(field)) {
            	var baseField = field.getFormulaRef().getArguments().get(0);
            	var baseVarField = getVarFieldName(baseField, "Sum");
            	var operation = field.getFormulaRef().getOperatorName();
            	if (operation == PERCENT_COLUMN) {
            		// 100%
	            	expression = getHundredPercentExpression();
            	} else if (operation == PERCENT_TOTAL || state.getGroups().isEmpty()) {
            		colDetail.@evaluationTime = "Auto";
            		expression = getPercentExpression(
            			getFieldRef(baseField.getName()),
            			getVariableRef(getFieldSummaryVariableName(baseVarField, "Sum")));
            	} else if (operation == PERCENT_ROW) {
            		colDetail.@evaluationTime = "Auto";
            		var groups = state.getGroups();
            		var innerGroup = groups.get(groups.size() - 1);
            		expression = getPercentExpression(
            			getFieldRef(baseField.getName()),
            			getVariableRef(getGroupFieldVariableName(innerGroup, baseVarField, "Sum")));
            	}
            } else {
            	expression = getFieldRef(col.getName());
            }
            colDetail.appendChild(
                <textFieldExpression class={mapTextExpressionType(col.getType())}>{ expression }</textFieldExpression>);
            band.frame.appendChild(colDetail);
        }
        x += col.width;
    }
    report.appendChild(myDetail);
}

function getPercentExpression(val, total) {
	return "AdhocReportUtils.calculatePercentage(" + val + ", " + total + ")";
}

function getHundredPercentExpression() {
	return "new Double(100d)";
}

/* The report-level summaries that appear at the bottom of the table (not inside groups) */
function addTablesSummaries(report, state) {
    var totalLabelWidth = 0;
    var x = 0;

    // get the summaries for each column
    var summaries = new XMLList();
    for (var i = 0; i < state.getColumns().size(); i++) {
        var column = state.getColumns().get(i);
        if (column.getFunction() != null) {
            // when you hit first summary column, figure out how much room it leaves for total label
            if (totalLabelWidth == 0) {
                totalLabelWidth = (x + column.getWidth())  - GROUP_INDENT;
            }
            
            var expression;
            if (isPercentColumn(column)) {
            	// 100%
	            expression = getHundredPercentExpression();
            } else {
            	expression = getVariableRef(getColumnSummaryVariableName(column));
            }
            
            var summary = <textField
                isStretchWithOverflow={STRETCH_WITH_OVERFLOW}
                isBlankWhenNull="true"
                evaluationTime="Now">
                    <reportElement
                        style="TableSummaries"
                        x={x}
                        y="0"
                        width={column.getWidth()}
                        height={standardHeaderBandHeight}
                        key="textField"
                        stretchType="RelativeToBandHeight">
                        <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
                    </reportElement>
                    <textElement textAlignment={column.getAlignment()}/>
                    <textFieldExpression class={column.getFunctionType()}>{expression}</textFieldExpression>
                </textField>;
                summary.reportElement += invisibox();
            if (column.getFunctionMask() != null) {
                summary.@pattern = column.getFunctionMask();
            }
            summaries += summary;
        }
        x = x + column.getWidth();
    }

    // make the whole summary band
    // NOTE: totals label was arbitrary width...really needs to go only up to first summary
    var summaryText = state.getSummaryRowTitle();
    var summaryBand = <summary>
            <band height={standardHeaderBandHeight} splitType="Stretch">
                <frame>
                    <reportElement
                        style="TableSummaries"
                        x="0"
                        y="0"
                        width={ contentWidth }
                        height={standardHeaderBandHeight}
                        key="frame-3">
                        <property name="net.sf.jasperreports.export.pdf.tag.tr" value="full"/>
                    </reportElement>
                    <staticText>
                        <reportElement
                            style="TableSummaries"
                            x="0"
                            y="0"
                            width={totalLabelWidth}
                            height={standardHeaderBandHeight}
                            key="staticText-1"
                            stretchType="RelativeToBandHeight">
                        <property name="net.sf.jasperreports.export.pdf.tag.td" value="full"/>
                        </reportElement>
                        <text> {summaryText} </text>
                    </staticText>
                    {summaries}
                </frame>
            </band>
        </summary>;
    //summaryBand.band.frame.reportElement += invisibox();
    summaryBand.band.frame.staticText.reportElement += invisibox();
    report.appendChild(summaryBand);
}

/**
 * for whatever reason you have to go through this kind of gyration to get a properly escaped string
 * it's not sufficient to call "new XML('<![CDATA[' + text + ']]>')"
 * @param elementName 
 * @param text
 * @return
 */
function cdataElement(elementName, text) {
    return new XML('<' + elementName + '><![CDATA[' + text + ']]></' + elementName + '>');
}

function addParameter(report, state) {

    var params = new java.util.ArrayList(state.reportParameters.values());
    for (var i = 0; i < params.size(); i++) {
        var adhocParam = params.get(i);
        var param = adhocParam.parameter;

        var name = param.name;
        var prompt = (param.forPrompting == true) ? "true" : "false";
        var cls = param.valueClassName;

        var dflt = (state.isSaveParamsAsDefault()) ? adhocParam.getExpression() : ((param.defaultValueExpression != null) ? param.defaultValueExpression.text : null);

        var paramTag = <parameter name={name} isForPrompting={prompt} class={cls} />;
        if (dflt != null) {
            paramTag.appendChild(cdataElement('defaultValueExpression', dflt));
        }

        report.appendChild(paramTag);
    }

}

////////////////////////////////////////////
// Crosstab-specific functions
////////////////////////////////////////////

// create the crosstab element in a band under the summary

function addCrosstab(report, state) {
    var xtabHeight = contentHeight;
    if (state.hasTitle()) {
        xtabHeight -= titleHeight;
    }
    // note: the crosstabHeaderCell is currently not used; it's the box above the row headers & to the left of the col headers
    // we could put something in here but at this time we don't.
    report.appendChild( <summary>
                            <band height={xtabHeight}>
                                <crosstab>
                                    <reportElement x="0" y="0" width={state.getPageWidthForJRXML()} height={xtabHeight}/>
                                    <crosstabParameter name="CrosstabRowGroupsCount" class="java.lang.Integer">
                                        <parameterValueExpression>new Integer({state.getCrosstabState().getRowGroups().size()})</parameterValueExpression>
                                    </crosstabParameter>
                                    <crosstabParameter name="CrosstabColumnGroupsCount" class="java.lang.Integer">
                                        <parameterValueExpression>new Integer({state.getCrosstabState().getColumnGroups().size()})</parameterValueExpression>
                                    </crosstabParameter>
                                    <crosstabHeaderCell>
                                        <cellContents mode="Transparent" style="CrosstabHeader">
                                            <box padding="0"/>
                                        </cellContents>
                                    </crosstabHeaderCell>
                                </crosstab>
                            </band>
                        </summary>);

    report.summary.band.crosstab.@ignoreWidth = state.isActualSize();

    return report.summary.band.crosstab;
}

// add the crosstab row and column groups

function addCrosstabGroups(xtab, state) {
	var orderByInfo = getCrosstabOrderByInfo(state);
    for (var i = 0; i < state.getCrosstabState().getRowGroups().size(); i++) {
        var rowGroup = state.getCrosstabState().getRowGroups().get(i);
        // get styles
        var style = "Row" + ((i == state.getCrosstabState().getRowGroups().size() - 1) ? "Inner" : (i == 0 ? "MostOuter" : "Outer"));
        // create element
        var groupDef = getCrosstabGroup(rowGroup, true, orderByInfo, style);
        xtab.appendChild(groupDef);
    }
    for (var i = 0; i < state.getCrosstabState().getColumnGroups().size(); i++) {
        var columnGroup = state.getCrosstabState().getColumnGroups().get(i);
        // get styles
        var style = "Column" + ((i == state.getCrosstabState().getColumnGroups().size() - 1) ? "Inner" : (i == 0 ? "MostOuter" : "Outer"));
        // create element
        var groupDef = getCrosstabGroup(columnGroup, false, orderByInfo, style);
        xtab.appendChild(groupDef);
    }
}

function getCrosstabOrderByInfo(state) {
	var sortFields = state.getSortFields();
	var orderByExpression;
	var ascending;
	if (sortFields.isEmpty()) {
		orderByExpression = null;
	} else {
		if (sortFields.size() > 1) {
			logger.warn("More than one sort field for crosstab, using the first");
		}
		
		var sortField = sortFields.get(0);
		ascending = sortField.isAscending();
		
		var fieldName = sortField.getFieldName();
		var measure = dataStrategy.getColumnForField(fieldName);
		if (measure == null) {
			logger.warn("Field " + fieldName + " not found as measure, not sorting");
		} else  if (!isAverageSQL(measure) ) {
            var field = dataStrategy.getAggregatedField(measure);
        }
	    if ((field != null) && isPercent(field)) {
			var baseField = field.getFormulaRef().getArguments().get(0);
			var baseVarField = getVarFieldName(baseField, "Sum");
			var baseMeasureName = getFieldMeasureName(baseVarField, "Sum");
			// using the base field for sorting
			orderByExpression = getVariableRef(baseMeasureName);
		} else {
			orderByExpression = getMeasureExpression(measure);
		}
	}
	
	if (orderByExpression == null) {
		return null;
	}
	
	return {orderByExpression: orderByExpression, ascending: ascending};
}

// create one crosstab group (row or column)
// row & col groups are pretty much the same but element names are different

// TODO map datarator bucketing to JR
// JR buckets values by evaluating the bucket expression, and then it has to derive a label from that
// datarator has a whole categorizer framework for doing this...but in order for JR to come up with
// same results we may have to expose the categorizer framework

// it might go something like this...
// <bucketExpression class="java.lang.Integer">$P{bucketer}.getBucketNumber("Country", $V{REPORT_COUNT})<bucketExpression>
// the first param is the field name and will get plugged in by this script
// but this depends on passing in a param which exposes the bucketing
// Alternatively, have the datarator result set just return bucket numbers and labels, so both the
// bucketExpression and header cell contents come right from the fields
//


function getCrosstabGroup(stateGroup, isRow, orderInfo, style) {
    var group;
    var bucket;
    var header;
    var totalHeader;
    // adapter is the thing that spits out the right expressions for different bucketing methods
    // this stuff will be obsoleted by the unrolled dds
    // since we changed the way categorizers are stored, we have to replicate lookup
    var catFac = dataStrategy.adhocEngine.categorizerFactory;
    var cat;
    if (stateGroup.categorizerName == null) {
		cat = catFac.getDefaultCategorizer(stateGroup.type);
	} else {
		cat = catFac.getCategorizer(stateGroup.type, stateGroup.categorizerName);
	}
    var adapter = cat.getJRAdapter(stateGroup.getName(), stateGroup.getType(), stateGroup.getUniqueName());
    var hasTotals = stateGroup.isIncludeAll();
    // get names of stuff right
    // set name of group to the name of the adhoc field

    if (isRow) {
        group = <rowGroup name={stateGroup.getUniqueName()} width={XTAB_ROW_HEADER_WIDTH} headerPosition="Top"/>;
        header = <crosstabRowHeader/>;
        if (hasTotals) {
            totalHeader = <crosstabTotalRowHeader/>;
            group.@totalPosition = "End";
        }
    } else {
        group = <columnGroup name={stateGroup.getUniqueName()} height={xtabColumnHeaderHeight} headerPosition="Left"/>;
        header = <crosstabColumnHeader/>;
        if (hasTotals) {
            totalHeader = <crosstabTotalColumnHeader/>;
            group.@totalPosition = "End";
        }
    }

    // set up bucketing
    bucket = <bucket>
                <bucketExpression class={adapter.bucketExpressionClass}>{adapter.bucketExpression}</bucketExpression>
             </bucket>;
    
    // apend order info if any
    if (orderInfo != null) {
    	bucket.@order = orderInfo.ascending ? "Ascending" : "Descending";
    	bucket.appendChild(<orderByExpression>{orderInfo.orderByExpression}</orderByExpression>);
    }
    
    // if the field is type Number, which has come up with MDX queries, we need to provide
    // a comparator since Number doesn't implement Comparable for some reason
    if (adapter.bucketExpressionClass == "java.lang.Number") {
        bucket.appendChild(<comparatorExpression>new com.jaspersoft.commons.datarator.jr.NumberComparator()</comparatorExpression>);
    }
    // figure out the dimensions
    var width = isRow ? XTAB_ROW_HEADER_WIDTH : XTAB_CELL_WIDTH;
    var height = XTAB_CELL_HEIGHT;//isRow ? xtabCellHeight : xtabColumnHeaderHeight;

    // append cell contents to header
    // get text from the variable with the same name as the group...this works when you bucket by value
    // what about bucket by range?

    header.appendChild(<cellContents style={style}>
            <box padding="0"/>
            <textField isBlankWhenNull="true" isStretchWithOverflow="true">
                <reportElement x="0" y="0" width={width} height={height} style={style} mode="Transparent"/>
                <box>
                    <pen lineWidth="0"/>
                </box>
                <textFieldExpression class={adapter.headerExpressionClass}>{adapter.headerExpression}</textFieldExpression>
            </textField>
        </cellContents>);

    // set mask from categorizer if present
    var mask = stateGroup.getMask();
    if (mask != null) {
        header.cellContents.textField.@pattern = mask;
    }

    var totalStyle = style + "Total";
    // append cell contents to total header
    if (totalHeader) {
        totalHeader.appendChild(<cellContents style={totalStyle}>
                <box padding="0"/>
                <textField isStretchWithOverflow="true">
                    <reportElement x="0" y="0" width={width} height={height} style={totalStyle} mode="Transparent"/>
                    <box>
                        <pen lineWidth="0"/>
                    </box>
                    <textFieldExpression class="java.lang.String">"Totals"</textFieldExpression>
                </textField>
            </cellContents>);
//                    <textFieldExpression class="java.lang.String">{stateGroup.getLabelExpressionForJRXML(true) + ' + " Totals"'}</textFieldExpression>
//                </textField>
//            </cellContents>);
    }

    group.* += bucket;
    group.* += header;
    if (totalHeader) {
        group.* += totalHeader;
    }
    return group;
}

function addMeasures(xtab, state) {
    for (var i = 0; i < state.getMeasures().size(); i++) {
        var measure = state.getMeasure(i);
        if (state.isValidMeasure(measure)) {
            var field = null;
            if (!isAverageSQL(measure) ) {
                field = dataStrategy.getAggregatedField(measure);
            }
            if ((field != null) && isPercent(field)) {
				var baseField = field.getFormulaRef().getArguments().get(0);
				addAggregatedMeasure(xtab, baseField, "Sum", true);
        	} else {
        		addMeasure(xtab, measure);
        	}
        }
    }
}

function getMeasureName(measure) {
	return getFieldMeasureName(measure.getUniqueName(), 
		dataStrategy.getAggregateFunction(measure));
}

function getFieldMeasureName(fieldName, aggFunction) {
	return aggFunction + "_" + fieldName;
}

function addAggregatedMeasure(xtab, field, aggFunction, forceAggregation) {
	var column = dataStrategy.getColumnForField(field.getName());
	if (column != null 
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		// the field is present as xtab measure and has the same summary func
		// adding the measure (if not yet added)
	    addAggregatedFieldMeasure(xtab,  
    		dataStrategy.getAggregateFieldNames(column),
    		column.getUniqueName(),
    		dataStrategy.getAggregateFunction(column),
    		column.getType(),
    		column.getFunctionType(),
    		forceAggregation);
	} else {
		// we don't have the field as measure in the xtab
		// TODO use a unique name for the field?
        var fields = new Array();
        fields[0] = field.getName();
		addAggregatedFieldMeasure(xtab,  
			fields, field.getName(), aggFunction, field.getType(),
			dataStrategy.getFieldAggregationType(field, aggFunction),
			forceAggregation);
	}
}

function addMeasure(xtab, measure) {
	addAggregatedFieldMeasure(xtab, 
		dataStrategy.getAggregateFieldNames(measure), measure.getUniqueName(),
		dataStrategy.getAggregateFunction(measure),
		measure.getType(), measure.getFunctionType());
}

function addAggregatedFieldMeasure(xtab, fieldNames, varFieldName,
		aggFunction, fieldType, functionType, forceAggregation) {
	if (dataStrategy.isDoGroupQuery() && (aggFunction.equals("Average"))) {
        addAverageAggregatedFieldMeasure(xtab, fieldNames, varFieldName, fieldType, functionType);
    } else if (forceAggregation || !dataStrategy.isAggregateFirstFieldCalculation(fieldNames[0], aggFunction)) {
		default xml namespace = jrNS;
		var measureName = getFieldMeasureName(varFieldName, aggFunction);
		if (xtab.measure.(@name == measureName).length() >= 1) {
			// already added
			return;
		}
	
		xtab.appendChild(
			<measure name={measureName} class={functionType} calculation={aggFunction}>
				<measureExpression>{getFieldExpression(fieldNames[0], aggFunction, fieldType, functionType)}</measureExpression>
			</measure>);
	} else {
		addAggFirstMeasures(xtab, fieldNames[0], aggFunction);
	}
}

function addAverageAggregatedFieldMeasure(xtab, fieldNames, varFieldName, fieldType, functionType) {
   		default xml namespace = jrNS;
		var measureName = getFieldMeasureName(varFieldName, "Average");
		if (xtab.measure.(@name == measureName).length() >= 1) {
			// already added
			return;
		}

        var measureNames = new Array();
        measureNames[0] = getFieldMeasureName(varFieldName, "Sum");
        measureNames[1] = getFieldMeasureName(varFieldName, "Count");

        for (i = 0; i < fieldNames.length; i++) {
           if (xtab.measure.(@name == measureNames[i]).length() >= 1) continue;
           xtab.appendChild(
			    <measure name={measureNames[i]} class={functionType} calculation={ "Sum" }>
				    <measureExpression>{getFieldExpression(fieldNames[i], "Average", fieldType, functionType)}</measureExpression>
			    </measure>);
        }
}

function addAggFirstMeasures(xtab, fieldName, aggFunction) {
	var formula = dataStrategy.getFieldForName(fieldName).getFormulaRef();
	var formulaArgs = formula.getArguments();
	var field1 = formulaArgs.get(0);
	var field2 = formulaArgs.get(1);
	
	addAggregatedMeasure(xtab, field1, aggFunction);
	addAggregatedMeasure(xtab, field2, aggFunction);
}

// Each cell declaration has a row group and a column group, both of which are optional
// To cover all possible combinations, we need to create declarations for all permutations of:
// each row group summary as well as no row group summary
// each column group summary as well as no column group summary

// We need to have two loop levels
// 1. loop through row groups + null
// 2. loop through column groups + null
// Also, if we are not including summaries for a group, leave out the corresponding cells

function addCrosstabCells(xtab, state) {
    for (var i = 0; i < state.getCrosstabState().getRowGroups().size(); i++) {
        if (state.getCrosstabState().getRowGroups().get(i).isIncludeAll()) {
            addCrosstabCellsForRowGroup(xtab, state, i);
        }
    }
    addCrosstabCellsForRowGroup(xtab, state, -1);
}

function addCrosstabCellsForRowGroup(xtab, state, rowGroupNumber) {
    for (var i = 0; i < state.getCrosstabState().getColumnGroups().size(); i++) {
        if (state.getCrosstabState().getColumnGroups().get(i).isIncludeAll()) {
            xtab.appendChild(getCrosstabCell(state, rowGroupNumber, i));
        }
    }
    xtab.appendChild(getCrosstabCell(state, rowGroupNumber, -1));
}

// if both zero, use grand total
// if only one of row/col is summary, then use corresponding style
// if both summary, take lowest number style
// there are only two xtab styles so we need to use % func
function getCrosstabCellStyle(state, rowGroup, colGroup) {
    return "Row" + (rowGroup < 0 ? "Detail" : ((rowGroup == state.getCrosstabState().getRowGroups().size() - 1) ? "Inner" : "Outer")) 
        + "Column" + (colGroup < 0 ? "Detail" : ((colGroup == state.getCrosstabState().getColumnGroups().size() - 1) ? "Inner" : "Outer"));
}

// get a xtab cell for some combination of row/column summaries
// iterate through measures to add contents
function getCrosstabCell(state, stateRowGroup, stateColumnGroup) {
    var style = getCrosstabCellStyle(state, stateRowGroup, stateColumnGroup);
    var cell = <crosstabCell width={XTAB_CELL_WIDTH} height={xtabCellHeight}>
                    <cellContents style={style}>
                        <box padding="0"/>
                    </cellContents>
               </crosstabCell>;
    // set row/col total group if non null
    if (stateRowGroup >= 0) {
        cell.@rowTotalGroup = state.getCrosstabState().getRowGroups().get(stateRowGroup).getUniqueName();
    }
    if (stateColumnGroup >= 0) {
        cell.@columnTotalGroup = state.getCrosstabState().getColumnGroups().get(stateColumnGroup).getUniqueName();
    }
    var validMeasureCount = -1;
    for (var i = 0; i < state.getMeasures().size(); i++) {
        var measure = state.getMeasure(i);
        if (state.isValidMeasure(measure)) {
            validMeasureCount++;
            var y = validMeasureCount * xtabMeasureHeight;
            var field = <textField isStretchWithOverflow="true" isBlankWhenNull="true">
                            <reportElement style={style} mode="Transparent" x="0" y={y} width={XTAB_CELL_WIDTH} height={xtabMeasureHeight}/>
                            <box>
                                <pen lineWidth="0"/>
                            </box>
                            <textFieldExpression class={measure.functionType}>{ 
                            	getMeasureValueExpression(state, stateRowGroup, stateColumnGroup, measure)
                            }</textFieldExpression>
                        </textField>;
            if (validMeasureCount > 0) {
            	field.reportElement.@positionType = "Float";
                field.box.@topPadding = 0;
            }
            if (measure.getFunctionMask() != null) {
                field.@pattern = measure.getFunctionMask();
            }
            cell.cellContents.* += field;
        }
    }
    return cell;
}

function getMeasureValueExpression(state, stateRowGroup, stateColumnGroup, measure) {

    var field = null;
    if (!isAverageSQL(measure) ) {
        field = dataStrategy.getAggregatedField(measure);
    }
    if ((field != null) && isPercent(field)) {
		var baseField = field.getFormulaRef().getArguments().get(0);
		var baseVarField = getVarFieldName(baseField, "Sum");
		var measureName = getFieldMeasureName(baseVarField, "Sum");
		var operation = field.getFormulaRef().getOperatorName();
		var rowGroups = state.getCrosstabState().getRowGroups();
		var colGroups = state.getCrosstabState().getColumnGroups();
		if (operation == PERCENT_COLUMN) {
			if (stateColumnGroup == 0) {
				expression = getHundredPercentExpression();
			} else {
				var enclosingGroupIdx = stateColumnGroup == -1 ? colGroups.size() - 1 
					: stateColumnGroup - 1;
				var enclosingGroup = colGroups.get(enclosingGroupIdx).getUniqueName();
				expression = getPercentExpression(
					getVariableRef(measureName),
					getVariableRef(measureName + "_" + enclosingGroup + "_ALL"));
			}
		} else if (operation == PERCENT_ROW) {
			if (stateRowGroup == 0) {
				expression = getHundredPercentExpression();
			} else {
				var enclosingGroupIdx = stateRowGroup == -1 ? rowGroups.size() - 1 
					: stateRowGroup - 1;
				var enclosingGroup = rowGroups.get(enclosingGroupIdx).getUniqueName();
				expression = getPercentExpression(
					getVariableRef(measureName),
					getVariableRef(measureName + "_" + enclosingGroup + "_ALL"));
			}
		} else if (operation == PERCENT_TOTAL) {
			if (stateRowGroup == 0 && stateColumnGroup == 0) {
				expression = getHundredPercentExpression();
			} else {
				var fistRowGroup = rowGroups.get(0).getUniqueName();
				var fistColGroup = colGroups.get(0).getUniqueName();
				expression = getPercentExpression(
					getVariableRef(measureName),
					getVariableRef(measureName + "_" + fistRowGroup + "_" + fistColGroup + "_ALL"));
			}
		}
	} else {
		expression = getMeasureExpression(measure);
	}
	return expression;
}

function getMeasureExpression(measure) {
	return getFieldMeasureExpression(
		dataStrategy.getAggregateFieldNames(measure),
		measure.getUniqueName(),
		dataStrategy.getAggregateFunction(measure),
		measure.getFunctionType());
}

function getFieldMeasureExpression(fieldNames, varFieldName, aggFunction, functionType) {
	var expression;

    if (dataStrategy.isDoGroupQuery() && (aggFunction.equals("Average"))) {
        return getAverageFieldMeasureExpression(fieldNames, varFieldName, functionType);
    } else if (dataStrategy.isAggregateFirstFieldCalculation(fieldNames[0], aggFunction)) {
		var field = dataStrategy.getFieldForName(fieldNames[0]);
		var formula = field.getFormulaRef();
		var formulaArgs = formula.getArguments();
		var field1 = formulaArgs.get(0);
		var field2 = formulaArgs.get(1);
		var fieldList1 = new Array();
        fieldList1[0] = field1.getName();
		var expr1 = getFieldMeasureExpression(
			fieldList1,
			getAggregateFieldVarName(field1.getName(), aggFunction),
			aggFunction,
			getAggregateFieldFunctionType(field1, aggFunction));
        var fieldList2 = new Array();
        fieldList2[0] = field2.getName();
		var expr2 = getFieldMeasureExpression(
			fieldList2,
			getAggregateFieldVarName(field2.getName(), aggFunction),
			aggFunction,
			getAggregateFieldFunctionType(field2, aggFunction));
		expression = divideExpression(field.getName(), expr1, expr2, functionType);
	} else {
		var measureVar = getFieldMeasureName(varFieldName, aggFunction);
		expression = getVariableRef(measureVar);
	}
	return expression;
}

function getAverageFieldMeasureExpression(fieldNames, varFieldName, functionType) {
    var measureVar_SUM = getFieldMeasureName(varFieldName, "Sum");
    var measureVar_COUNT = getFieldMeasureName(varFieldName, "Count");
	var expression = "((" + getVariableRef(measureVar_COUNT) + " > 0) ? (" + getVariableRef(measureVar_SUM) + "/ " + getVariableRef(measureVar_COUNT) + ") : 0)";
    return expression;
}

function getAggregateFieldVarName(fieldName, aggFunction) {
	var varFieldName;
	var column = dataStrategy.getColumnForField(fieldName);
	if (column != null 
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		varFieldName = column.getUniqueName();
	} else {
		varFieldName = fieldName;
	}
	return varFieldName;
}

function getAggregateFieldFunctionType(field, aggFunction) {
	var functionType;
	var column = dataStrategy.getColumnForField(field.getName());
	if (column != null 
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		functionType = column.getFunctionType();
	} else {
		functionType = dataStrategy.getFieldAggregationType(field, aggFunction);
	}
	return functionType;
}

////////////////////////////////////////////////////////////////////////////////
// Chart-specific functions
////////////////////////////////////////////////////////////////////////////////

function addChartMeasureVariables(report,state) {
    var useSummaries = state.getChartState().getChartRenderer().useSummaries();
    var measures;
    if (useSummaries) {
        measures = state.getValidMeasures();
    } else {
        measures = state.getUniqueMeasures();
    }
    for (var i = 0; i < measures.size(); i++) {
        var measure = measures.get(i);
        if (state.isValidMeasure(measure)) {
        	var field = null;
            if (!isAverageSQL(measure) ) {
                field = dataStrategy.getAggregatedField(measure);
            }
            if ((field != null) && isPercent(field)) {
                var baseField = field.getFormulaRef().getArguments().get(0);
                if (state.getChartState().getChartRenderer().useSummaries()) {
                    addChartFieldGroupCalculation(report, state, state.getGroup(), baseField, "Sum", true);
                } else {
                    report.appendChild(<variable name={measure.getName()} class="java.lang.Number">
                        <variableExpression>{getFieldExpression(baseField.getName(), "Sum", baseField.getType(), baseField.getType())}</variableExpression>
                    </variable>);
                }
            } else if (state.getChartState().getChartRenderer().useSummaries()) {
                addChartMeasureGroupCalculation(report, state, state.getGroup(), measure, measure.getName()+i);
            } else {
                report.appendChild(
                        <variable name={measure.getName()} class="java.lang.Number">
                            <variableExpression>{getColumnFieldExpression(measure)}</variableExpression>
                        </variable>);
            }
        }
    }
}

function addChartMeasureGroupCalculation(report, state, group, measure, varName) {
	addFieldGroupSummaryVar(report, state, group,
		dataStrategy.getAggregateFieldNames(measure),
		varName,
		dataStrategy.getAggregateFunction(measure),
		measure.getType(),
		measure.getFunctionType());
}

function getValidMeasureIndex(state, measure) {
	var validIdx = -1;
	for (var i = 0; i < state.getMeasures().size(); i++) {
		var stateMesure = state.getMeasure(i);
		if (state.isValidMeasure(stateMesure)) {
			++validIdx;
		}
		if (stateMesure == measure) {
			return validIdx;
		}
	}
	return -1;
}

function getChartFieldGroupVarName(state, group, field, aggFunction) {
	var varName;
	var column = dataStrategy.getColumnForField(field.getName());
	if (column != null 
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		// the field is present in the report and has the same summary func
		// adding the field variable (if not yet added)
		
		var validIdx = getValidMeasureIndex(state, column);
		if (validIdx >= 0) {
			//use measure var if valid
			varName = column.getName() + validIdx;
		} else {
			varName = getGroupFieldVariableName(group, 
    			column.getUniqueName(), 
    			dataStrategy.getAggregateFunction(column));
    	}
	} else {
		// we don't have the field in the report
		// TODO use a unique name for the field?
		varName = getGroupFieldVariableName(group, field.getName(), aggFunction);
	}
	return varName;	
}

function addChartFieldGroupCalculation(report, state, group, field, aggFunction, forceAggregation) {
	var varName;
	var column = dataStrategy.getColumnForField(field.getName());
	if (column != null 
		&& column.getFunction() != null 
		&& dataStrategy.getAggregateFunction(column) == aggFunction) {
		// the field is present in the report and has the same summary func
		// adding the field variable (if not yet added)
		
		var validIdx = getValidMeasureIndex(state, column);
		if (validIdx >= 0) {
			//use measure var if valid
			varName = column.getName() + validIdx;
		} else {
			varName = getGroupFieldVariableName(group, 
    			column.getUniqueName(), 
    			dataStrategy.getAggregateFunction(column));
    	}

	    addFieldGroupSummaryVar(report, state, group,
    		dataStrategy.getAggregateFieldNames(column),
    		varName,
    		dataStrategy.getAggregateFunction(column),
    		column.getType(),
    		column.getFunctionType(),
    		forceAggregation);
	} else {
		// we don't have the field in the report
		// TODO use a unique name for the field?
		varName = getGroupFieldVariableName(group, field.getName(), aggFunction);
        var fields = new Array();
		fields[0] = field.getName();
		addFieldGroupSummaryVar(report, state, group,
			fields,
    		varName,
			aggFunction, field.getType(),
			dataStrategy.getFieldAggregationType(field, aggFunction),
			forceAggregation);
	}
	return varName;
}

function addFieldGroupSummaryVar(report, state, group,
		fieldNames, varName, aggFunction, fieldType, functionType, forceAggregation) {
	default xml namespace = jrNS;
	if (report.variable.(@name == varName).length() >= 1) {
		// already added
		return;
	}
    if (dataStrategy.isDoGroupQuery() && (aggFunction.equals("Average"))) {
        addFieldGroupAverageAggregateVar(report, group, fieldNames, varName,
			fieldType, functionType);
    } else if (forceAggregation || !dataStrategy.isAggregateFirstFieldCalculation(fieldNames[0], aggFunction)) {
		addFieldGroupAggregateVar(report, group, fieldNames[0], varName, aggFunction,
			fieldType, functionType);
	} else {
		addChartAggFirstFieldVariables(report, state, group, 
			fieldNames[0], varName, aggFunction, functionType);
	}
}

function addFieldGroupAverageAggregateVar(report, group, fieldNames, varName,
		fieldType, functionType) {
    var sumVarNames = new Array();
    sumVarNames[0] = varName + "_AVG_Sum";
    sumVarNames[1] = varName + "_AVG_Count";
    var fieldExpressions = new Array();
    fieldExpressions[0] = getFieldExpression(fieldNames[0], "Average", fieldType, functionType);
    fieldExpressions[1] = getFieldExpression(fieldNames[1], "Average", fieldType, functionType);

    for (var i = 0; i < fieldNames.length; i++) {
        report.* += <variable
            name={ sumVarNames[i] }
            class={ functionType }
            resetType="Group"
            resetGroup={ group.getName() }
            calculation={ "Sum" }>
            <variableExpression>{ fieldExpressions[i] }</variableExpression>
        </variable>;
    }

    var fieldExpression = "(" + getVariableRef(sumVarNames[0]) + " / " + getVariableRef(sumVarNames[1]) + ")";

    // create a summary variable for the column
    report.* += <variable
        name={ varName }
        class={ functionType }
        resetType="Group"
		resetGroup={ group.getName() }>
        <variableExpression>{ fieldExpression }</variableExpression>
    </variable>;
}

function addChartAggFirstFieldVariables(report, state, group, fieldName, varName, aggFunction, functionType) {
	var field = dataStrategy.getFieldForName(fieldName);
	var formula = field.getFormulaRef();
	var formulaArgs = formula.getArguments();
	var field1 = formulaArgs.get(0);
	var field2 = formulaArgs.get(1);
	
	var varName1 = addChartFieldGroupCalculation(
		report, state, group, field1, aggFunction);
	var varName2 = addChartFieldGroupCalculation(
		report, state, group, field2, aggFunction);
	
	// create a summary variable by dividing the two summary vars
	report.appendChild(
		<variable name={varName} class={functionType} resetType="Group" resetGroup={state.getGroup().getName()}>
			<variableExpression>{divideVarsExpression(field.getName(), varName1, varName2, functionType)}</variableExpression>
		</variable>);
}

function addFieldGroupAggregateVar(report, group, fieldName, varName, aggFunction, 
		fieldType, functionType) {
	var fieldExpression = getFieldExpression(
		fieldName, aggFunction, fieldType, functionType);
	
	report.appendChild(<variable
		name={ varName }
		class={ functionType }
		resetType="Group"
		resetGroup={ group.getName() }
		calculation={ aggFunction }>
			<variableExpression>{ fieldExpression }</variableExpression>
		</variable>);
}

function addChartGroup(report,state,groupRef) {
  report.appendChild(
    <group name={state.getGroup().getName()}>
    <groupExpression>
    {groupRef}
    </groupExpression>
    </group>);
}

function addChart(report,state,themeStyles) {

  default xml namespace = report.namespace();

  var chartType = chartTypeTags[state.getChartState().getDetailedChartType()];
  var chartTitleFont = themeStyles.(@name=="ChartTitle");
  var chartBackColor = state.getChartState().getBackgroundFilled() ? themeStyles.(@name=="ChartContext").@backcolor : "#FFFFFF";

  var chartOuter =
    <{chartType}>
        <chart isShowLegend={state.getChartState().getDisplayLegend()} evaluationTime="Report" evaluationGroup="Category"  hyperlinkTarget="Self" theme="default">
            <reportElement
                mode="Opaque"
                x={state.getChartState().getOffsetX() + 5}
                y={state.getChartState().getOffsetY() + titleHeight+5}
                width={state.getChartState().getChartWidth()}
                height={state.getChartState().getChartHeight()}
                key="element-1"
                backcolor={chartBackColor}/>
            <chartTitle color={chartTitleFont.@forecolor}>
                <font fontName={chartTitleFont.@fontName} pdfFontName={chartTitleFont.@pdfFontName} size={chartTitleFont.@fontSize} isBold={chartTitleFont.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
                <titleExpression>{'"' + state.getChartState().getChartTitle() + '"'}</titleExpression>
            </chartTitle>
        </chart>
    </{chartType}>

    if (state.getChartState().getGradient() != null)
        chartOuter.chart.reportElement.appendChild(
            <property name={Packages.com.jaspersoft.ji.adhoc.jr.BaseAdhocCustomizer.PROPERTY_BACKGROUND_GRADIENT_DIRECTION} value={state.getChartState().getGradient()}/>);
    
    chartOuter.appendChild(getDataSet(state, chartOuter));
    chartOuter.appendChild(getChartPlot(state,themeStyles));

    //chartOuter.setNamespace(report.namespace());

    if (state.getChartState().getDisplayLegend()) {
      chartOuter.chart.appendChild(getLegend(state,themeStyles));
    }

    chartOuter.chart.appendChild(<hyperlinkTooltipExpression>"Chart"</hyperlinkTooltipExpression>);

    report.jrNS::title.jrNS::band.* += chartOuter;
}

function getChartPlot(state,themeStyles) {
  var chartPlot = <{chartPlotTags[state.getChartState().getDetailedChartType()]}/>;

  if (isPieChart(state) && state.getChartState().isThreeD()) {
    chartPlot.@depthFactor=state.getChartState().isThreeD()?"0.05":"0.00";
    chartPlot.@isCircular="true";
  } else {
    if (state.getChartState().getChartRenderer().canHaveLines()) {
        chartPlot.@isShowLines=state.getChartState().getHasLines()?"true":"false";
    }
    if (state.getChartState().getChartRenderer().canHavePoints()) {
        chartPlot.@isShowShapes=state.getChartState().getHasPoints()?"true":"false";
    }
  }

  chartPlot.* += getPlot(state,themeStyles);

  if(state.getChartState().isXYDataType()) {
      chartPlot.* += getXAxisLabelExpression(state);
      chartPlot.* += getYAxisLabelExpression(state);
      chartPlot.* += getYAxisFormats(state,themeStyles);
  } else if(state.getChartState().isTimeSeriesDataType()) {
      chartPlot.* += getTimeAxisLabelExpression(state);
      chartPlot.* += getValueLabelExpression(state);
      chartPlot.* += getValueAxisFormats(state,themeStyles);
  } else {
      chartPlot.* += getCategoryLabelExpression(state);
      chartPlot.* += getCategoryAxisFormats(state,themeStyles);
      chartPlot.* += getValueLabelExpression(state);
      chartPlot.* += getValueAxisFormats(state,themeStyles);
  }
  return chartPlot;
}

function getPlot(state,themeStyles) {

  default xml namespace = jrNS;

  var plot = <plot/>;
  if (isPieChart(state)) {
    //plot.@backcolor="#FFFFFF";
    plot.@labelRotation="135.0";
  } else {
    if (isBarChart(state))
      plot.@orientation=state.getChartState().getIsVertical()?"Vertical":"Horizontal";
    if (isAreaChart(state)&&!state.getChartState().isStacked()) {
      plot.@foregroundAlpha=0.5;
    }
    plot.@labelRotation="-45.0";
    plot.@backgroundAlpha="0";
  }
  var seriesColors = themeStyles.(@name.toString().indexOf("ChartSeriesColor")==0);
  plotSeriesColors = new XMLList();
  for (var i=0; i<seriesColors.length(); i++) {
    var thisSeriesColour = seriesColors[i];
    plotSeriesColors[i]=<seriesColor/>;
    plotSeriesColors[i].@seriesOrder=i;
    plotSeriesColors[i].@color=thisSeriesColour.@backcolor;
  }
  plot.seriesColors=plotSeriesColors;
  return plot;
}




function getDataSet(state, chartNode) {
  if(isPieChart(state)) {
    chartNode.chart.@customizerClass = "com.jaspersoft.ji.adhoc.jr.PieChartCustomizer";
    return getPieDataset(state, chartNode);
  } else if(state.getChartState().isXYDataType()) {
    chartNode.chart.@customizerClass = "com.jaspersoft.ji.adhoc.jr.XYSeriesChartCustomizer";
    return getXYDataset(state, chartNode);
  } else if(state.getChartState().isTimeSeriesDataType()) {
    chartNode.chart.@customizerClass = "com.jaspersoft.ji.adhoc.jr.TimeSeriesChartCustomizer";
    return getTimeSeriesDataset(state, chartNode);
  }else {
    chartNode.chart.@customizerClass = "com.jaspersoft.ji.adhoc.jr.CategoryChartCustomizer";
    return getChartCategoryDataset(state, chartNode);
  }
}

function getChartCategoryDataset(state, chartNode) {
    var dataset = <categoryDataset/>;
    //tried putting these is in its own function but it wouldn't play ball....
    var formattedGroupExpr = 'com.jaspersoft.ji.adhoc.service.AdhocEngineServiceImpl.getInstance().formatValue(' +
              getFieldRef(state.getGroup().getName()) + ', ' + 
              getJavaStringOrNull(state.getGroup().getMask()) + ',"' 
              + state.getGroup().getType() +
              '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

    var validMeasureIndex = -1;
    for (var i = 0; i < state.getMeasures().size(); i++) {
        var measure = state.getMeasure(i);
        if (state.isValidMeasure(measure)) {
            validMeasureIndex++;
            var legendLabel = state.getChartState().getLegendLabelExpressionForJRXMLAtIndex(validMeasureIndex);
            
            var measureExpression;
			var field = null;
            if (!isAverageSQL(measure) ) {
                field = dataStrategy.getAggregatedField(measure);
            }
            if ((field != null) && isPercent(field)) {
                var operation = field.getFormulaRef().getOperatorName();
                if (operation == PERCENT_COLUMN) {
                    measureExpression = getHundredPercentExpression();
                } else {
                    // a chart customizer will be used to compute percentages
                    // setting up required properties for the customizer
                    chartNode.chart.reportElement.appendChild(
                            <property name={Packages.com.jaspersoft.ji.adhoc.jr.CategoryChartCustomizer.PROPERTY_COMPUTE_PERCENTAGES_SERIES_PREFIX + validMeasureIndex}/>);

                    var baseField = field.getFormulaRef().getArguments().get(0);
                    var baseMeasureVar = getChartFieldGroupVarName(state, state.getGroup(), baseField, "Sum");
                    measureExpression = getVariableRef(baseMeasureVar);
                }
            } else {
                measureExpression = getVariableRef(measure.getName()+validMeasureIndex);
            }

            var formattedMeasureExpr = 'com.jaspersoft.ji.adhoc.service.AdhocEngineServiceImpl.getInstance().formatValue(' +
                        measureExpression + ', ' + 
                        getJavaStringOrNull(measure.getFunctionMask()) + ',"' + 
                        measure.getFunctionType(true) +
                        '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

            dataset.* +=
              <categorySeries>
                  <seriesExpression>{legendLabel}</seriesExpression>
                  <categoryExpression>{formattedGroupExpr}</categoryExpression>
                  <valueExpression>{measureExpression}</valueExpression>
                  <itemHyperlink>
                    <hyperlinkTooltipExpression>{formattedMeasureExpr}</hyperlinkTooltipExpression>
                  </itemHyperlink>
              </categorySeries>
         }
    }
    return dataset;
}

function getXYDataset(state, chartNode) {
    var dataset = <xyDataset/>;

    var validMeasureIndex = -1;
    for (var i = 0; i < state.getMeasures().size(); i++) {
        var measure = state.getMeasure(i);
        if (state.isValidMeasure(measure)) {
            validMeasureIndex++;
            var legendLabel = state.getChartState().getLegendLabelExpressionForJRXMLAtIndex(validMeasureIndex);
            
            var measureExpression;
            var field = null;
            if (!isAverageSQL(measure) ) {
                field = dataStrategy.getAggregatedField(measure);
            }
            if ((field != null) && isPercent(field)) {
            	var operation = field.getFormulaRef().getOperatorName();
            	if (operation == PERCENT_COLUMN) {
            		measureExpression = getHundredPercentExpression();
            	} else {
            		// a chart customizer will be used to compute percentages
            		// setting up required properties for the customizer
            		chartNode.chart.reportElement.appendChild(
            			<property name={Packages.com.jaspersoft.ji.adhoc.jr.XYSeriesChartCustomizer.PROPERTY_COMPUTE_PERCENTAGES_SERIES_PREFIX + validMeasureIndex}/>);
            		
            		measureExpression = getVariableRef(measure.getName());
            	}
            } else {
            	measureExpression = getVariableRef(measure.getName());
            }
            
            dataset.* +=
              <xySeries>
                  <seriesExpression>{legendLabel}</seriesExpression>
                  <xValueExpression>{getFieldRef(state.getGroup().getName())}</xValueExpression>
                  <yValueExpression>{measureExpression}</yValueExpression>
                  <itemHyperlink hyperlinkType="None"/>
              </xySeries>
         }
    }
    return dataset;
}

function getTimeSeriesDataset(state, chartNode) {
    var dataset = <timeSeriesDataset timePeriod="Milisecond"/>;

    var validMeasureIndex = -1;
    for (var i = 0; i < state.getMeasures().size(); i++) {
        var measure = state.getMeasure(i);
        if (state.isValidMeasure(measure)) {
            validMeasureIndex++;
            var legendLabel = state.getChartState().getLegendLabelExpressionForJRXMLAtIndex(validMeasureIndex);
            
            var measureExpression;
            var field = null;
            if (!isAverageSQL(measure) ) {
                field = dataStrategy.getAggregatedField(measure);
            }
            if ((field != null) && isPercent(field)) {
            	var operation = field.getFormulaRef().getOperatorName();
            	if (operation == PERCENT_COLUMN) {
            		measureExpression = getHundredPercentExpression();
            	} else {
            		// a chart customizer will be used to compute percentages
            		// setting up required properties for the customizer
            		chartNode.chart.reportElement.appendChild(
            			<property name={Packages.com.jaspersoft.ji.adhoc.jr.TimeSeriesChartCustomizer.PROPERTY_COMPUTE_PERCENTAGES_SERIES_PREFIX + validMeasureIndex}/>);
            		
            		measureExpression = getVariableRef(measure.getName());
            	}
            } else {
            	measureExpression = getVariableRef(measure.getName());
            }
            
            dataset.* +=
              <timeSeries>
                  <seriesExpression>{legendLabel}</seriesExpression>
                  <timePeriodExpression>{getFieldRef(state.getGroup().getName())}</timePeriodExpression>
                  <valueExpression>{measureExpression}</valueExpression>
                  <itemHyperlink hyperlinkType="None"/>
              </timeSeries>
         }
    }
    return dataset;
}

function getPieDataset(state, chartNode) {
  var dataset = <pieDataset/>;
  var thisMeasure = state.getFirstValidMeasure();

  var measureExpression;
  var field = null;
  if (!isAverageSQL(thisMeasure) ) {
    field = dataStrategy.getAggregatedField(thisMeasure);
  }
  if ((field != null) && isPercent(field)) {
  	var operation = field.getFormulaRef().getOperatorName();
  	if (operation == PERCENT_COLUMN) {
  		measureExpression = getHundredPercentExpression();
  	} else {
  		// a chart customizer will be used to compute percentages
  		// setting up required properties for the customizer
  		chartNode.chart.reportElement.appendChild(
  			<property name={Packages.com.jaspersoft.ji.adhoc.jr.PieChartCustomizer.PROPERTY_COMPUTE_PERCENTAGES}/>);
  		chartNode.chart.reportElement.appendChild(
  			<property name={Packages.com.jaspersoft.ji.adhoc.jr.PieChartCustomizer.PROPERTY_MEASURE_MASK}
  				value={thisMeasure.getFunctionMask()}/>);
  		chartNode.chart.reportElement.appendChild(
  			<property name={Packages.com.jaspersoft.ji.adhoc.jr.PieChartCustomizer.PROPERTY_DISPLAY_LEGEND}
  				value={state.getChartState().getDisplayLegend()}/>);
  		
  		var baseField = field.getFormulaRef().getArguments().get(0);
  		var baseMeasureVar = getChartFieldGroupVarName(state, state.getGroup(), baseField, "Sum");
  		measureExpression = getVariableRef(baseMeasureVar);
  	}
  } else {
  	measureExpression = getVariableRef(thisMeasure.getName()+"0");
  }
	
  var formattedMeasureExpr = 'com.jaspersoft.ji.adhoc.service.AdhocEngineServiceImpl.getInstance().formatValue(' +
              measureExpression +
              ', ' + getJavaStringOrNull(thisMeasure.getFunctionMask()) + 
              ',"' + thisMeasure.getFunctionType(true) +
              '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

  //show group label and measure (or only measure if we have a legend)
  var labelExpr = 'com.jaspersoft.ji.adhoc.AdhocFormatHelper.buildPieLabel(' +
              getFieldRef(state.getGroup().getName()) + ',' + 
              formattedMeasureExpr + ',' + 
              state.getChartState().getDisplayLegend() + ', ' + 
              getJavaStringOrNull(state.getGroup().getMask()) + 
              ', $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE} )';

  if (state.getGroup().isNumeric() || state.getGroup().isDate()) {
    dataset.* +=
        <keyExpression>{getFieldRef(state.getGroup().getName())}+""</keyExpression>
  } else {
    dataset.* +=
        <keyExpression>{getFieldRef(state.getGroup().getName())}==null?"":{getFieldRef(state.getGroup().getName()+"")}</keyExpression>
  }
  dataset.* +=
        <valueExpression>{measureExpression}</valueExpression>
  dataset.* +=
        <labelExpression>{labelExpr}</labelExpression>
    dataset.* +=
        <sectionHyperlink><hyperlinkTooltipExpression>{formattedMeasureExpr}</hyperlinkTooltipExpression></sectionHyperlink>
  return dataset;
}

// for xySeries and timeSeries, we need to filter out null values of the x axis
function addXAxisNullFilterExpression(report, state) {
	if(state.getChartState().isXYDataType() || state.getChartState().isTimeSeriesDataType()) {
		report.appendChild(<filterExpression>Boolean.valueOf({getFieldRef(state.getGroup().getName())} != null)</filterExpression>);
	}
}

function getCategoryLabelExpression(state) {
    if(!isPieChart(state) && state.getChartState().getDisplayXAxisLabel()) {
        var groupRef = state.getGroup().getLabelExpressionForJRXML(false);
        return <categoryAxisLabelExpression>{groupRef}</categoryAxisLabelExpression>
    }
    return <categoryAxisLabelExpression/>;
}

function getCategoryAxisFormats(state,themeStyles) {

  default xml namespace = jrNS;

    if(!isPieChart(state)) {
        var categoryAxisFormat = <categoryAxisFormat/>;
        var categoryLabelFormat = themeStyles.(@name=="ChartCategoryAxisLabelFormat");
        var categoryTickFormat = themeStyles.(@name=="ChartCategoryAxisTickFormat");

        categoryAxisFormat.* +=
          <axisFormat labelColor={categoryLabelFormat.@forecolor} tickLabelColor={categoryTickFormat.@forecolor}>
              <labelFont>
                <font fontName={categoryLabelFormat.@fontName} pdfFontName={categoryLabelFormat.@pdfFontName} size={categoryLabelFormat.@fontSize} isBold={categoryLabelFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
              </labelFont>
              <tickLabelFont>
                <font fontName={categoryTickFormat.@fontName} pdfFontName={categoryTickFormat.@pdfFontName} size={categoryTickFormat.@fontSize} isBold={categoryTickFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
              </tickLabelFont>
          </axisFormat>
        return categoryAxisFormat;
    }
    return "";

}

function getValueLabelExpression(state) {
    if(!isPieChart(state) && state.getChartState().getDisplayYAxisLabel() && state.hasExactlyOneMeasure()) {
        var label = state.getChartState().getLegendLabelExpressionForJRXMLAtIndex(0);
        return <valueAxisLabelExpression>{label}</valueAxisLabelExpression>
    }
    return <valueAxisLabelExpression/>;
}

function getValueAxisFormats(state,themeStyles) {

    default xml namespace = jrNS;

    var mask = state.getChartState().getChartRenderer().useSummaries() ? state.getFirstValidMeasure().getFunctionMask() : state.getFirstValidMeasure().getMask();

    if(!isPieChart(state)) {
        var valueAxisFormat = <valueAxisFormat/>;
        var valueLabelFormat = themeStyles.(@name=="ChartValueAxisLabelFormat");
        var valueTickFormat = themeStyles.(@name=="ChartValueAxisTickFormat");
        valueAxisFormat.* +=
          <axisFormat labelColor={valueLabelFormat.@forecolor} tickLabelMask={mask} tickLabelColor={valueTickFormat.@forecolor}>
              <labelFont>
                <font fontName={valueLabelFormat.@fontName} pdfFontName={valueLabelFormat.@pdfFontName} size={valueLabelFormat.@fontSize} isBold={valueLabelFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
              </labelFont>
              <tickLabelFont>
                <font fontName={valueTickFormat.@fontName} pdfFontName={valueTickFormat.@pdfFontName} size={valueTickFormat.@fontSize} isBold={valueTickFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
              </tickLabelFont>
          </axisFormat>
        return valueAxisFormat;
    }
    return "";

}


function getYAxisFormats(state,themeStyles) {

  default xml namespace = jrNS;

    var yAxisFormat = <yAxisFormat/>;
    var valueLabelFormat = themeStyles.(@name=="ChartValueAxisLabelFormat");
    var valueTickFormat = themeStyles.(@name=="ChartValueAxisTickFormat");
    yAxisFormat.* +=
      <axisFormat labelColor={valueLabelFormat.@forecolor} tickLabelMask={state.getFirstValidMeasure().getMask()} tickLabelColor={valueTickFormat.@forecolor}>
          <labelFont>
            <font fontName={valueLabelFormat.@fontName} pdfFontName={valueLabelFormat.@pdfFontName} size={valueLabelFormat.@fontSize} isBold={valueLabelFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
          </labelFont>
          <tickLabelFont>
            <font fontName={valueTickFormat.@fontName} pdfFontName={valueTickFormat.@pdfFontName} size={valueTickFormat.@fontSize} isBold={valueTickFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
          </tickLabelFont>
      </axisFormat>
    return yAxisFormat;

}

function getXAxisLabelExpression(state) {
    if(state.getChartState().getDisplayXAxisLabel()) {
        var groupRef = state.getGroup().getLabelExpressionForJRXML(false);
        return <xAxisLabelExpression>{groupRef}</xAxisLabelExpression>
    }
    return <xAxisLabelExpression/>;
}

function getYAxisLabelExpression(state) {
    if(state.getChartState().getDisplayYAxisLabel() && state.hasExactlyOneMeasure()) {
        var label = state.getChartState().getLegendLabelExpressionForJRXMLAtIndex(0);
        return <yAxisLabelExpression>{label}</yAxisLabelExpression>
    }
    return <yAxisLabelExpression/>;
}

function getTimeAxisLabelExpression(state) {
    if(state.getChartState().getDisplayXAxisLabel()) {
        var groupRef = state.getGroup().getLabelExpressionForJRXML(false);
        return <timeAxisLabelExpression>{groupRef}</timeAxisLabelExpression>
    }
    return <timeAxisLabelExpression/>;
}

function getLegend(state,themeStyles) {

  default xml namespace = jrNS;
  var chartBackColor = themeStyles.(@name=="ChartContext").@backcolor;

  var legendFormat = themeStyles.(@name=="ChartLegend");
  var legend = <chartLegend textColor={legendFormat.@forecolor} backgroundColor={chartBackColor}/>;
  legend.* +=
    <font fontName={legendFormat.@fontName} pdfFontName={legendFormat.@pdfFontName} size={legendFormat.@fontSize} isBold={legendFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>;
  return legend;
}

function isPieChart(state) {
  return state.getChartState().getChartType()=="2_pie"
}

function isBarChart(state) {
  return state.getChartState().getChartType()=="1_bar"
}

function isLineChart(state) {
  return state.getChartState().getChartType()=="3_line"
}

function isAreaChart(state) {
  return state.getChartState().getChartType()=="4_area"
}

function debug(str) {
    var ts = (new Date() - startTime) / 1000;
    var used = Math.floor((java.lang.Runtime.runtime.totalMemory() - java.lang.Runtime.runtime.freeMemory()) / 1024);
    java.lang.System.out.println("(" + ts + "ms " + used + "K) " + str);
}

function addQuery(report, state) {
    var adhocData = state.getFieldManager();
    var query = dataStrategy.getQueryText(true);
    if (query) {
        report.* += <queryString>{query}</queryString>;
        var language = dataStrategy.getQueryLanguage();
        if (language) {
            report.queryString.@language = language;
        }
    }
}

function isPercent(field) {
	return field.getFormulaRef() != null 
		&& field.getFormulaRef().isPercentOfParentCalculation();
}

function isPercentColumn(column) {
    var field = null;
    if (!isAverageSQL(column)) {
        field = dataStrategy.getAggregatedField(column);
    }
	return (field != null) && isPercent(field);
}

function addFields(report, state) {
    for (var i = 0; i < dataStrategy.fieldList.size(); i++) {
    	var field = dataStrategy.fieldList.get(i);
       	report.* += getField(field);
    }
    /**
    if (state.forCrosstab()) {
    	var uddss = dataStrategy.getUnrolledDDSStrategy();
    	var ufl = uddss.fieldList;
        for (var i = 0; i < ufl.size(); i++) {
        	var field = ufl.get(i);
           	logger.warn("field " + field.name + " type: " + field.type);
        }

    }
     **/
}

function getField(field) {
    var fieldElement = <field name={field.name} class={field.type}/>;
//    var origField = dataStrategy.adhocData.findField(field.name);
//    how to get description from domain schema
//    logger.warn('schema desc:' + origField.propertyMap.get('semantic.item.desc'));
    var pi = field.propertyMap.keySet().iterator();
    while (pi.hasNext()) {
        var pname = pi.next();
        fieldElement.appendChild(<property name={pname} value={field.propertyMap.get(pname)}/>);
    }
    if (field.description) {
        fieldElement.appendChild(<fieldDescription>{field.description}</fieldDescription>);
    }
    return fieldElement;
}

//
// main function
//

function state2jrxml(state, themeString, theDataStrategy) {
    // remember data strategy
    dataStrategy = theDataStrategy;

    // init globals including width of all columns
    init(state);

    // start with your top level report tag
    var report = getReport(state);
    // remember the namespace because we need to keep setting it
    jrNS = report.namespace();
    default xml namespace = jrNS;

    // themes are a list of style tags
    var themeStyles = new XMLList(themeString);

    // add adhoc prop
    report.* += getAdHocProperties(state);
         
    report.appendChild(<import value="com.jaspersoft.ji.adhoc.jr.AdhocReportUtils"/>);

    // add styles from theme
    report.* += themeStyles;

    // add parameters
    addParameter(report, state);

    // get query from AdhocBaseData
    addQuery(report, state);

    // construct fields from AdhocFields
    addFields(report, state);

    // set unique names to use for measure/group names
    state.setUniqueNames();

    // table processing
    if (state.forTable()) {
        if (state.printsChart()) {
            addChartMeasureVariables(report, state.getChartState());
        }
        addSummaryVariables(report, state);
        addGroups(report, state);
        addTitle(report, state);
        addColumnHeader(report, state);
        if (state.getShowTableDetails()) {
            addDetail(report, state);
        }
        addColumnFooter(report, state);
        addTablesSummaries(report, state);
        if (state.printsChart()) {
            addChart(report, state.getChartState(), themeStyles);
        }

    } else if (state.forCrosstab()) {
        // xtab processing
        addTitle(report, state);
        var xtab = addCrosstab(report, state);
        addCrosstabGroups(xtab, state);
        addMeasures(xtab, state);
        addCrosstabCells(xtab, state);
    } else if (state.forChart()) {
        addChartMeasureVariables(report, state);
        addXAxisNullFilterExpression(report, state);
        addChartGroup(report, state, getFieldRef(state.getGroup().getName()));
        addTitle(report, state);
        addChart(report, state, themeStyles);
    }

    // create final string from xml header, and real xml
    return xmlheader + report.toXMLString();
}
