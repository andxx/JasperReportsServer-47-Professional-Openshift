/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */
// Topic2JRXML
//
// Converts the the Semantic Layer Topic to a JRXML file

// Prefixed to final string in the main method.
var xmlheader = '<?xml version="1.0" encoding="UTF-8"?>\n';

// Distance to indent each level of grouping labels
// TODO: NEEDS TO BE in CONFIG
var GROUP_INDENT = 10;
// band heights according to Laura

var DETAIL_BAND_HEIGHT = 20;

// minimum group label size that we will try to display on group footer (see getGroupFooter() for more info)
var MIN_GROUP_LABEL_WIDTH = 100;

// xtab dims
var XTAB_MEASURE_HEIGHT = 12;
var XTAB_MIN_CELL_HEIGHT = 20;
var XTAB_CELL_HEIGHT_FUDGE_FACTOR = 4;
var XTAB_ROW_HEADER_WIDTH = 125;
var XTAB_CELL_WIDTH = 100;
var XTAB_CELL_PAD = 3;

// this doesn't work as advertised, so let's turn it off
var STRETCH_WITH_OVERFLOW = "true";

// internal constants
var SUMMARY_PREFIX = 's_';
var SUMMARY_MIDFIX = '_s_';

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

// chart tags
var chartTypeTags = new Array();
var chartPlotTags = new Array();


// debug ts
var startTime = new Date();

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
        xtabCellHeight = XTAB_MEASURE_HEIGHT * state.getMeasures().size() + XTAB_CELL_HEIGHT_FUDGE_FACTOR;
        if (xtabCellHeight < XTAB_MIN_CELL_HEIGHT) {
            xtabCellHeight = XTAB_MIN_CELL_HEIGHT;
        }
        // make col header height same size as cell height
        xtabColumnHeaderHeight = xtabCellHeight;
    }
    if (state.printsChart()) {
      //build up tag names
      chartTypeTags["pie"] = 'pie3DChart';
      chartTypeTags["bar"] = 'bar3DChart';
      chartTypeTags["barStacked"] = 'stackedBar3DChart';
      chartTypeTags["barFlat"] = 'barChart';
      chartTypeTags["barFlatStacked"] = 'stackedBarChart';
      chartTypeTags["line"] = 'lineChart';
      chartTypeTags["area"] = 'areaChart';
      chartTypeTags["areaStacked"] = 'stackedAreaChart';
      //and plot names
      chartPlotTags["pie"] = 'pie3DPlot';
      chartPlotTags["bar"] = 'bar3DPlot';
      chartPlotTags["barStacked"] = 'bar3DPlot';
      chartPlotTags["barFlat"] = 'barPlot';
      chartPlotTags["barFlatStacked"] = 'barPlot';
      chartPlotTags["line"] = 'linePlot';
      chartPlotTags["area"] = 'areaPlot';
      chartPlotTags["areaStacked"] = 'areaPlot';
    }
    //finally make sure page is at least as wide as designated width
    contentWidth = Math.max(state.getContentWidth(),contentWidth);

}

// all page stuff calculated in the state now
function getReport(state) {
    return <jasperReport
         xmlns="http://jasperreports.sourceforge.net/jasperreports" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports 
         http://jasperreports.sourceforge.net/xsd/jasperreport.xsd" 
         name="test"
         columnCount="1"
         printOrder="Vertical"
         orientation={ state.pageOrientation }
         pageWidth={ state.pageWidth  }
         pageHeight={ state.pageHeight }
         columnWidth={state.getContentWidth()}
         columnSpacing="0"
         leftMargin={state.horizontalMargin}
         rightMargin={state.horizontalMargin}
         topMargin={state.verticalMargin}
         bottomMargin={state.verticalMargin}
         whenNoDataType="NoPages"
         isTitleNewPage="false"
         isSummaryNewPage="false"/>;
}

function getAdHocProperties(state)
{
    var props = <property name="com.jaspersoft.ji.adhoc" value="1"/>;
    if (state.printsChart()) {
        props += <property name="net.sf.jasperreports.export.xls.ignore.graphics" value="false"/>
        props += <property name="net.sf.jasperreports.export.xls.remove.empty.space.between.columns" value="false"/>
    }
    return props;
}
// get a box that Laura uses a lot to implement styles
function invisibox() {
    return <box
        topBorder="None"
        topBorderColor="#000000"
        leftBorder="None"
        leftBorderColor="#000000"
        rightBorder="None"
        rightBorderColor="#000000"
        bottomBorder="None"
        bottomBorderColor="#000000"/>;
}

// get a field ref expression
function getFieldRef(name) {
    return '$F{' + name + '}';
}

// get a variable reference expression
function getVariableRef(name) {
    return '$V{' + name + '}';
}

function makeGroupVariable(groupName, columnName) {
	return getVariableRef(groupName + SUMMARY_MIDFIX + columnName);
}

function getTitleBand(state) {
    var chartState;
    var bandHeight = titleHeight;
    var style;
    var width = contentWidth;
    if (state.forTable()) {
      style = "Title";
    }
    else if (state.forCrosstab()) {
      style = "CrosstabTitleStyle";
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

    if (state.getTitle() != null) {
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
    // com.jaspersoft.ji.adhoc.AdhocFormatHelper.formatValue($F{whoozit}, "0,000.00", "java.lang.Double", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})

    var expr = 'com.jaspersoft.ji.adhoc.AdhocFormatHelper.formatValue(' +
                getFieldRef(group.getName()) +
                ',"' + group.getMask() + '","' + group.getType() +
                '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

    // if there's a label, add Java code to prepend it
    if (group.hasLabel()) {
        expr = '"' + group.getLabel() + ': " + ' + expr;
    }

    // now slam it into the JRXML
    return <textFieldExpression class="java.lang.String">{expr}</textFieldExpression>;
}

function getGroupHeader(group, level) {
    // calc offset based on level of header
    var offset = GROUP_INDENT * (level+1);
    var style = 'Group' + Math.min(3, level + 1) + 'Header'
    var ret = <groupHeader>
            <band height={standardHeaderBandHeight}>
                <frame>
                    <reportElement
                        style={style}
                        x="0"
                        y="0"
                        width={ contentWidth }
                        height={standardHeaderBandHeight}/>
                    <textField evaluationTime="Group" evaluationGroup={ group.getName() } bookmarkLevel="1">
                        <reportElement
                            style={style}
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
		<band height={standardHeaderBandHeight} splitType="Stretch">
            <frame>
                <reportElement
                    style={style}
                    x="0"
                    y="0"
                    width={ contentWidth }
                    height={standardHeaderBandHeight}/>
            </frame>
		</band>
	</groupFooter>;
    // group label has to fit in the space to the left of the first column that has a summary.
    // if there isn't enough space, don't print the group label
    var groupLabelWidth = getFirstSummaryOffset(state, group, level) - offset;
    if (groupLabelWidth >= MIN_GROUP_LABEL_WIDTH) {
        ret.band.frame.* += <textField isStretchWithOverflow={STRETCH_WITH_OVERFLOW} isBlankWhenNull="true" evaluationTime="Now" >
                                <reportElement
                                    style={ style }
                                    x={ offset }
                                    y="0"
                                    width={ groupLabelWidth }
                                    height={standardHeaderBandHeight}
                                    stretchType="RelativeToBandHeight"/>
                                <textElement/>
                                { getGroupLabelTextField(group) }
                            </textField>;
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
				stretchType="RelativeToBandHeight"/>
            { getGroupLabelTextField(group) }
		</textField>;
    ret.reportElement += invisibox();
    return ret;
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
			var summary = <textField
					isStretchWithOverflow={STRETCH_WITH_OVERFLOW}
					isBlankWhenNull="true"
					evaluationTime="Now" >
					<reportElement
                        style={style}
						x={x}
						y="0"
						width={column.getWidth()}
						height={standardHeaderBandHeight}
                       	stretchType="RelativeToBandHeight"/>
					<textElement textAlignment={column.alignment}/>
                    <textFieldExpression class={column.getFunctionType()}>{ makeGroupVariable(group.getName(), column.getName()) }</textFieldExpression>
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
            return x;
        }
        x = x + column.getWidth();
    }
    return x;
}

function isSpacer (col) {
	return col.type == "_spacer";
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
		if (column.getFunction() != null) {
			// create a summary variable for the column
			report.* += <variable
				name={ SUMMARY_PREFIX + column.getName() }
				class={ column.getFunctionType() }
				resetType="Report"
				calculation={ column.getFunction() }>
				<variableExpression>{ getFieldRef(column.getName()) }</variableExpression>
			</variable>;

			// for each column with a summary, create a group summary expression
			var groups = state.getGroups();
			for (var g = 0; g < groups.size(); g++) {
				var group = groups.get(g);
				report.* += <variable
					name={ group.getName() + SUMMARY_MIDFIX + column.getName() }
					class={ column.getFunctionType() }
					resetType="Group"
					resetGroup={ group.getName() }
					calculation={ column.getFunction() }>
						<variableExpression>{ getFieldRef(column.getName()) }</variableExpression>
					</variable>;
			}
		}
	}
}

function addTitle(report, state) {
    if (state.getTitle() != null || state.printsChart()) {
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
                        height={standardHeaderBandHeight}/>
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
    var ret = <staticText>
        <reportElement
            style="ColumnHeaderFooter"
            x={x}
            y="0"
            width={width}
            height={standardHeaderBandHeight}/>
        <textElement textAlignment={col.alignment}/>
        <text>{label}</text>
      </staticText>;
    ret.reportElement += invisibox();
    return ret;
}

function addColumnHeader(report, state) {
	var myColHeader = getColumnHeaderSection();
	var band = myColHeader.band;
	var x = 0;
	for (var i = 0; i < state.getColumns().size(); i++) {
		var col = state.getColumns().get(i);
        band.frame.appendChild(getColumnHeader(col, x, col.label, col.width));
        x += col.width;
	}
    //finally - if any remaining width add a blank header
    if (contentWidth>x) {
        band.frame.appendChild(getColumnHeader(col, x, '', contentWidth-x));
    }
	report.appendChild(myColHeader);
}

/*
 * Top level function for adding the grouping section. Calls
 * many sub-functions to help it.
 */
function addGroups(report, state) {
	for (var i = 0; i < state.getGroups().size(); i++) {
		var group = state.getGroups().get(i);
		var groupElem = getGroup(group.getName(), getFieldRef(group.getName()));
		groupElem.appendChild(getGroupHeader(group, i));
		groupElem.appendChild(getGroupFooter(state, group, i));
		report.appendChild(groupElem);
    }
}

function getDetail() {
    var ret = <detail>
            <band height={DETAIL_BAND_HEIGHT} splitType="Stretch">
                <frame>
                    <reportElement
                        style="Details"
                        x="0"
                        y="0"
                        width={contentWidth}
                        height="20"/>
                </frame>
            </band>
        </detail>;
    //ret.band.frame.reportElement += invisibox();
    return ret;
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
            key="textField"/>
        <textElement textAlignment={column.getAlignment()}/>
    </textField>;
    if (column.getMask() != null) {
        ret.@pattern = column.getMask();
    }
    ret.reportElement += invisibox();
    return ret;
}
/*
 * Add the details section which actually has data inside the
 * inner most group level (if present)
 */
function addDetail(report, state) {
    var myDetail = getDetail();
    var band = myDetail.band;
    var x = 0;
    for (var i = 0; i < state.getColumns().size(); i++) {
        var col = state.getColumns().get(i);
        if (! isSpacer(col)) {
            var colDetail = getDetailField(x, col);
            colDetail.appendChild(
                <textFieldExpression class={col.getType()}>{ getFieldRef(col.getName()) }</textFieldExpression>);
            band.frame.appendChild(colDetail);
        }
        x += col.width;
    }
    report.appendChild(myDetail);
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
                totalLabelWidth = x - GROUP_INDENT;
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
					   stretchType="RelativeToBandHeight"/>
					<textElement textAlignment={column.getAlignment()}/>
					<textFieldExpression class={column.getFunctionType()}>{getVariableRef(SUMMARY_PREFIX + column.getName())}</textFieldExpression>
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
	var summaryBand = <summary>
			<band height={standardHeaderBandHeight} splitType="Stretch">
				<frame>
					<reportElement
						style="TableSummaries"
						x="0"
						y="0"
						width={ contentWidth }
						height={standardHeaderBandHeight}
						key="frame-3"/>
					<staticText>
						<reportElement
							style="TableSummaries"
							x={GROUP_INDENT}
							y="0"
                            width={totalLabelWidth}
							height={standardHeaderBandHeight}
							key="staticText-1"
							stretchType="RelativeToBandHeight"/>
						<text>Totals:</text>
					</staticText>
					{summaries}
				</frame>
			</band>
		</summary>;
    //summaryBand.band.frame.reportElement += invisibox();
    summaryBand.band.frame.staticText.reportElement += invisibox();
    report.appendChild(summaryBand);
}

function addParameter(report, reportParameters) {

    var iter = reportParameters.values().iterator();
    while (iter.hasNext()) {
        var adhocParam = iter.next();
        var param = adhocParam.parameter;

        var name = param.name;
        var prompt = (param.forPrompting == true) ? "true" : "false";
        var cls = param.valueClassName;

        var dflt = (state.isSaveParamsAsDefault()) ? adhocParam.getExpression() : ((param.defaultValueExpression != null) ? param.defaultValueExpression.text : null);

        var paramTag = <parameter name={name} isForPrompting={prompt} class={cls} />;
        if (dflt != null) {
            var defExp = <defaultValueExpression>{dflt}</defaultValueExpression>;
            paramTag.appendChild(defExp);
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
    if (state.getTitle() != null) {
        xtabHeight -= titleHeight;
    }
    // note: the crosstabHeaderCell is currently not used; it's the box above the row headers & to the left of the col headers
    // we could put something in here but at this time we just put bottom and right borders because it makes the other borders line up.
    report.appendChild( <summary>
                            <band height={xtabHeight}>
                                <crosstab>
                                    <reportElement x="0" y="0" width={state.contentWidth} height={xtabHeight}/>
                                    <crosstabHeaderCell>
                                        <cellContents mode="Transparent" style="CrosstabTitleStyle">
                                            <box rightBorder="1Point" bottomBorder="1Point"/>
                                        </cellContents>
                                    </crosstabHeaderCell>
                                </crosstab>
                            </band>
                        </summary>);
    return report.summary.band.crosstab;
}

// add the crosstab row and column groups

function addCrosstabGroups(xtab, state) {
    for (var i = 0; i < state.getRowGroups().size(); i++) {
        var rowGroup = state.getRowGroups().get(i);
        // create element
        var groupDef = getCrosstabGroup(rowGroup, true);
        // set styles
        setCrosstabGroupStyles(groupDef, i, true);
        xtab.appendChild(groupDef);
    }
    for (var i = 0; i < state.getColumnGroups().size(); i++) {
        var columnGroup = state.getColumnGroups().get(i);
        // create element
        var groupDef = getCrosstabGroup(columnGroup, false);
        // set styles
        setCrosstabGroupStyles(groupDef, i, false);
        xtab.appendChild(groupDef);
    }
}

// do common style setting stuff on all header cell definitions

function setCrosstabGroupStyles(groupDef, i, isRow) {
    var style = (isRow ? "CrosstabRow" : "CrosstabColumn") + Math.min(3, i + 1);
    var contentElems = groupDef..cellContents;
    for (var re = 0; re < contentElems.length(); re++) {
        var contentElem = contentElems[re];
        // set style for cellContents and also the text field`s reportElement
        contentElem.@style = style;
        contentElem.textField.reportElement.@style = style;
        if (i == 0) {
            if (isRow) {
                // set left border if this is first row header
                contentElem.box.@leftBorder = "Thin";
            } else {
                // set top border if this is first col header
                contentElem.box.@topBorder = "Thin";
            }
        }
    }
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


function getCrosstabGroup(stateGroup, isRow) {
    var group;
    var bucket;
    var header;
    var totalHeader;
    // adapter is the thing that spits out the right expressions for different bucketing methods
    var adapter = stateGroup.getCategorizer().getJRAdapter(stateGroup.getFieldName(), stateGroup.getFieldType(), stateGroup.getUniqueName());
    var hasTotals = stateGroup.getCategorizer().isIncludeAll();
    // get names of stuff right
    // set name of group to the name of the adhoc field

    if (isRow) {
        group = <rowGroup name={stateGroup.getUniqueName()} width={XTAB_ROW_HEADER_WIDTH} headerPosition="Middle"/>;
        header = <crosstabRowHeader/>;
        if (hasTotals) {
            totalHeader = <crosstabTotalRowHeader/>;
            group.@totalPosition = "End";
        }
    } else {
        group = <columnGroup name={stateGroup.getUniqueName()} height={xtabColumnHeaderHeight} headerPosition="Center"/>;
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
    // if the field is type Number, which has come up with MDX queries, we need to provide
    // a comparator since Number doesn't implement Comparable for some reason
    if (adapter.bucketExpressionClass == "java.lang.Number") {
        bucket.appendChild(<comparatorExpression>new com.jaspersoft.commons.datarator.jr.NumberComparator()</comparatorExpression>);
    }
    // figure out the dimensions and alignments
    var width = isRow ? XTAB_ROW_HEADER_WIDTH : XTAB_CELL_WIDTH;
    var height = isRow ? xtabCellHeight : xtabColumnHeaderHeight;
    var x = isRow ? XTAB_CELL_PAD : 0;
    var textAlign = isRow ? "Left" : "Center";
    var vertAlign = "Middle";

    // append cell contents to header
    // get text from the variable with the same name as the group...this works when you bucket by value
    // what about bucket by range?

    header.appendChild(<cellContents>
            <box bottomBorder="Thin" rightBorder="Thin"/>
            <textField isBlankWhenNull="true">
                <reportElement x={x} y="0" width={width - x} height={height}/>
                <textElement verticalAlignment={vertAlign} textAlignment={textAlign}/>
                <textFieldExpression class={adapter.headerExpressionClass}>{adapter.headerExpression}</textFieldExpression>
            </textField>
        </cellContents>);

    // set mask from categorizer if present
    var mask = stateGroup.getCategorizer().getMask();
    if (mask != null) {
        header.cellContents.textField.@pattern = mask;
    }

    // append cell contents to total header
    if (totalHeader) {
        totalHeader.appendChild(<cellContents>
                <box bottomBorder="Thin" rightBorder="Thin"/>
                <textField isStretchWithOverflow="true">
                    <reportElement x={x} y="0" width={width - x} height={height}/>
                    <textElement verticalAlignment={vertAlign} textAlignment={textAlign}/>
                    <textFieldExpression class="java.lang.String">{'"' + stateGroup.getLabel() + ' Totals"'}</textFieldExpression>
                </textField>
            </cellContents>);
    }

    group.* += bucket;
    group.* += header;
    if (totalHeader) {
        group.* += totalHeader;
    }
    return group;
}

function addMeasures(xtab, state) {
    for (var i = 0; i < state.measures.size(); i++) {
        var measure = state.measures.get(i);
        xtab.appendChild(getMeasure(measure));
    }
}

function getMeasure(field) {
    return <measure name={field.getUniqueName()} class={field.functionType} calculation={field.getFunction()}>
               <measureExpression>{getFieldRef(field.name)}</measureExpression>
           </measure>;
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
    for (var i = 0; i < state.getRowGroups().size(); i++) {
        if (state.getRowGroups().get(i).getCategorizer().isIncludeAll()) {
            addCrosstabCellsForRowGroup(xtab, state, i);
        }
    }
    addCrosstabCellsForRowGroup(xtab, state, -1);
}

function addCrosstabCellsForRowGroup(xtab, state, rowGroupNumber) {
    for (var i = 0; i < state.getColumnGroups().size(); i++) {
        if (state.getColumnGroups().get(i).getCategorizer().isIncludeAll()) {
            xtab.appendChild(getCrosstabCell(state, rowGroupNumber, i));
        }
    }
    xtab.appendChild(getCrosstabCell(state, rowGroupNumber, -1));
}

// if both zero, use grand total
// if only one of row/col is summary, then use corresponding style
// if both summary, take lowest number style
// there are only two xtab styles so we need to use % func
function getCrosstabCellStyle(rowGroup, colGroup) {
    if (colGroup == 0 && rowGroup == 0) {
        return "CrosstabGrandTotal";
    } else if (colGroup >= 0 && rowGroup >= 0) {
        if (rowGroup <= colGroup) {
            return "CrosstabRow" + Math.min(3, rowGroup + 1);
        } else {
            return "CrosstabColumn" + Math.min(3, colGroup + 1);
        }
    } else if (rowGroup >= 0) {
        return "CrosstabRow" + Math.min(3, rowGroup + 1);
    } else if (colGroup >= 0) {
        return "CrosstabColumn" + Math.min(3, colGroup + 1);
    } else {
        return "CrosstabMeasureCell";
    }
}

// get a xtab cell for some combination of row/column summaries
// iterate through measures to add contents
function getCrosstabCell(state, stateRowGroup, stateColumnGroup) {
    var style = getCrosstabCellStyle(stateRowGroup, stateColumnGroup);
    var cell = <crosstabCell width={XTAB_CELL_WIDTH} height={xtabCellHeight}>
                    <cellContents style={style}>
                        <box bottomBorder="Thin" rightBorder="Thin"/>
                    </cellContents>
               </crosstabCell>;
    // set row/col total group if non null
    if (stateRowGroup >= 0) {
        cell.@rowTotalGroup = state.getRowGroups().get(stateRowGroup).getUniqueName();
    }
    if (stateColumnGroup >= 0) {
        cell.@columnTotalGroup = state.getColumnGroups().get(stateColumnGroup).getUniqueName();
    }
    for (var i = 0; i < state.measures.size(); i++) {
        var measure = state.measures.get(i);
        var y = i * XTAB_MEASURE_HEIGHT;
        var field = <textField isStretchWithOverflow="true">
                        <reportElement style={style} x="0" y={y} width={XTAB_CELL_WIDTH - XTAB_CELL_PAD} height={XTAB_MEASURE_HEIGHT}/>
                        <textElement textAlignment="Right" verticalAlignment="Middle"/>
                        <textFieldExpression class={measure.functionType}>{ getVariableRef(measure.getUniqueName()) }</textFieldExpression>
                    </textField>;
        if (measure.getFunctionMask() != null) {
            field.@pattern = measure.getFunctionMask();
        }
        cell.cellContents.* += field;
    }
    return cell;
}

////////////////////////////////////////////////////////////////////////////////
// Chart-specific functions
////////////////////////////////////////////////////////////////////////////////

function addChartMeasureVariables(report,state) {
  for (var i = 0; i < state.measures.size(); i++) {
    var thisMeasure = state.measures.get(i);
    report.appendChild(
    <variable name={thisMeasure.getName()+i} class={thisMeasure.getFunctionType()} resetType="Group" resetGroup={state.getGroup().getName()} calculation={thisMeasure.getFunctionOrDefault()}>
        <variableExpression>{getFieldRef(thisMeasure.getName())}</variableExpression>
    </variable>);
  }
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
  var chartType = chartTypeTags[state.getDetailedChartType()];
  var chartTitleFont = themeStyles.(@name=="ChartTitle");

  var chart =
    <{chartType}>
        <chart isShowLegend={state.getDisplayLegend()} evaluationTime="Report" evaluationGroup="Category"  hyperlinkTarget="Self" >
            <reportElement
                mode="Opaque"
                x={state.getOffsetX() + 5}
                y={state.getOffsetY() + titleHeight+5}
                width={state.getChartWidth()}
                height={state.getChartHeight()}
                key="element-1"
                backcolor="#FFFFFF"/>
            <chartTitle color={chartTitleFont.@forecolor}>
                <font fontName={chartTitleFont.@fontName} pdfFontName={chartTitleFont.@pdfFontName} size={chartTitleFont.@fontSize} isBold={chartTitleFont.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>
                <titleExpression>{'"' + state.getChartTitle() + '"'}</titleExpression>
            </chartTitle>
        </chart>
        {getDataSet(state)}
        {getChartPlot(state,themeStyles)}
    </{chartType}>

    if (state.getDisplayLegend()) {
      chart.chart.appendChild(getLegend(state,themeStyles));
    }
    report.title.band.* += chart;
}

function getChartPlot(state,themeStyles) {
  var chartPlot = <{chartPlotTags[state.getDetailedChartType()]}/>;

  if (isPieChart(state)) {
    chartPlot.@depthFactor=state.getPieChart3D()?"0.05":"0.00";
    chartPlot.@isCircular="true";
  }
  chartPlot.* += getPlot(state,themeStyles);
  chartPlot.* += getCategoryLabelExpression(state);
  chartPlot.* += getCategoryAxisFormats(state,themeStyles);
  chartPlot.* += getValueLabelExpression(state);
  chartPlot.* += getValueAxisFormats(state,themeStyles);
  return chartPlot;
}

function getPlot(state,themeStyles) {
  var plot = <plot/>;
  if (isPieChart(state)) {
    plot.@backcolor="#FFFFFF";
    plot.@labelRotation="135.0";
  } else {
    if (isBarChart(state))
      plot.@orientation=state.getIsVertical()?"Vertical":"Horizontal";
    if (isAreaChart(state)&&!state.getStackAreaPlots())
      plot.@foregroundAlpha=0.5;
    plot.@labelRotation="-45.0";

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




function getDataSet(state) {
  if(isPieChart(state)) {
    return getPieDataset(state);
  } else {
    return getChartCategoryDataset(state);
  }
}

function getChartCategoryDataset(state) {
  var dataset = <categoryDataset/>;
  //tried putting these is in its own function but it wouldn't play ball....
  var formattedGroupExpr = 'com.jaspersoft.ji.adhoc.AdhocFormatHelper.formatValue(' +
              getFieldRef(state.getGroup().getName()) +
              ',"' + state.getGroup().getMask() + '","' + state.getGroup().getType() +
              '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

  for (var i = 0; i < state.measures.size(); i++) {
    var thisMeasure = state.measures.get(i);
    var legendLabel = state.getChartState().getLegendLabelAtIndex(i);
    var formattedMeasureExpr = 'com.jaspersoft.ji.adhoc.AdhocFormatHelper.formatValue(' +
                getVariableRef(thisMeasure.getName()+i) +
                ',"' + thisMeasure.getFunctionMask() + '","' + thisMeasure.getFunctionType(true) +
                '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

    dataset.* +=
      <categorySeries>
          <seriesExpression>{'"' + legendLabel + '"'}</seriesExpression>
          <categoryExpression>{formattedGroupExpr}</categoryExpression>
          <valueExpression>{getVariableRef(thisMeasure.getName()+i)}</valueExpression>
          <itemHyperlink>
            <hyperlinkTooltipExpression>{formattedMeasureExpr}</hyperlinkTooltipExpression>
          </itemHyperlink>
      </categorySeries>
  }
  return dataset;
}

function getPieDataset(state) {
  var dataset = <pieDataset/>;
  var thisMeasure = state.measures.get(0);

  var formattedMeasureExpr = 'com.jaspersoft.ji.adhoc.AdhocFormatHelper.formatValue(' +
              getVariableRef(thisMeasure.getName()+"0") +
              ',"' + thisMeasure.getFunctionMask() + '","' + thisMeasure.getFunctionType(true) +
              '", $P{REPORT_LOCALE}, $P{REPORT_TIME_ZONE})';

  //show group label and measure (or only measure if we have a legend)
  var labelExpr = 'com.jaspersoft.ji.adhoc.AdhocFormatHelper.buildPieLabel(' +
              getFieldRef(state.getGroup().getName()) +
              ',' + formattedMeasureExpr + ',' + state.getDisplayLegend() + ')';


  dataset.* +=
        <keyExpression>{getFieldRef(state.getGroup().getName())}==null?"":{getFieldRef(state.getGroup().getName())}</keyExpression>
  dataset.* +=
        <valueExpression>{getVariableRef(thisMeasure.getName()+"0")}</valueExpression>
  dataset.* +=
        <labelExpression>{labelExpr}</labelExpression>
    dataset.* +=
        <sectionHyperlink><hyperlinkTooltipExpression>{formattedMeasureExpr}</hyperlinkTooltipExpression></sectionHyperlink>
  return dataset;
}

function getCategoryLabelExpression(state) {
    if(!isPieChart(state) && state.getDisplayXAxisLabel()) {
        var groupRef = state.getGroup().getFieldDisplay();
        return <categoryAxisLabelExpression>{'"' + groupRef + '"'}</categoryAxisLabelExpression>
    }
    return <categoryAxisLabelExpression/>;
}

function getCategoryAxisFormats(state,themeStyles) {
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
    if(!isPieChart(state) && state.getDisplayYAxisLabel() && state.hasExactlyOneMeasure()) {
        var label = state.getChartState().getLegendLabelAtIndex(0);
        return <valueAxisLabelExpression>{'"' + label + '"'}</valueAxisLabelExpression>
    }
    return <valueAxisLabelExpression/>;
}

function getValueAxisFormats(state,themeStyles) {
    if(!isPieChart(state)) {
        var valueAxisFormat = <valueAxisFormat/>;
        var valueLabelFormat = themeStyles.(@name=="ChartValueAxisLabelFormat");
        var valueTickFormat = themeStyles.(@name=="ChartValueAxisTickFormat");
        valueAxisFormat.* +=
          <axisFormat labelColor={valueLabelFormat.@forecolor} tickLabelMask={state.getMeasure(0).getFunctionMask()} tickLabelColor={valueTickFormat.@forecolor}>
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

function getLegend(state,themeStyles) {
  var legendFormat = themeStyles.(@name=="ChartLegend");
  var legend = <chartLegend textColor={legendFormat.@forecolor} backgroundColor={legendFormat.@backcolor}/>;
  legend.* +=
    <font fontName={legendFormat.@fontName} pdfFontName={legendFormat.@pdfFontName} size={legendFormat.@fontSize} isBold={legendFormat.@isBold} isItalic="false" isUnderline="false" isStrikeThrough="false" isPdfEmbedded="false" pdfEncoding="Cp1252"/>;
  return legend;
}

function isPieChart(state) {
  return state.getChartType()=="pie"
}

function isBarChart(state) {
  return state.getChartType()=="bar"
}

function isLineChart(state) {
  return state.getChartType()=="line"
}

function isAreaChart(state) {
  return state.getChartType()=="area"
}


function debug(str) {
    var ts = (new Date() - startTime) / 1000;
    var used = Math.floor((java.lang.Runtime.runtime.totalMemory() - java.lang.Runtime.runtime.freeMemory()) / 1024);
    java.lang.System.out.println("(" + ts + "ms " + used + "K) " + str);
}

function addFields(report, fieldList) {
    for (var i = 0; i < fieldList.size(); i++) {
        report.* += getField(fieldList.get(i));
    }
}

function getField(field) {
    var fieldElement = <field name={field.name} class={field.type}/>;
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

function state2jrxml(context, baseReportString, fieldList, reportParameters) {
    // base report is full jrxml
    var baseReport = new XML(baseReportString);

    // themes are a list of style tags
//    var themeStyles = new XMLList(themeString);

    // init globals including width of all columns
//    init(state);

    // start with your top level report tag
//    var report = getReport(state);

    // add adhoc prop
//    report.* += getAdHocProperties(state);

    // add styles from theme
//    report.* += themeStyles;

    // add parameters
//    addParameter(report, reportParameters);

    // get query from base report
//    report.* += baseReport.queryString;

    // construct fields from AdhocFields
    addFields(report, fieldList);

    // table processing
//    if (state.forTable()) {
//        if (state.printsChart()) {
//            addChartMeasureVariables(report, state.getChartState());
//        }
//        addSummaryVariables(report, state);
//        addGroups(report, state);
//        addTitle(report, state);
//        addColumnHeader(report, state);
//        addDetail(report, state);
//        addTablesSummaries(report, state);
//        if (state.printsChart()) {
//            addChart(report, state.getChartState(), themeStyles);
//        }
//
//    } else if (state.forCrosstab()) {
//        // xtab processing
//        addTitle(report, state);
//        var xtab = addCrosstab(report, state);
//        // set unique names to use for measure/group names
//        state.setUniqueNames();
//        addCrosstabGroups(xtab, state);
//        addMeasures(xtab, state);
//        addCrosstabCells(xtab, state);
//    } else if (state.forChart()) {
//        addChartMeasureVariables(report, state);
//        addChartGroup(report, state, getFieldRef(state.getGroup().getName()));
//        addTitle(report, state);
//        addChart(report, state, themeStyles);
//    }

    // create final string from xml header, and real xml
    return xmlheader + report.toXMLString();
}
