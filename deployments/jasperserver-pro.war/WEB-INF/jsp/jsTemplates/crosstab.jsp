<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>

<script id="${viewModel.viewType == 'olap_crosstab' ? 'olap_crosstab' : 'crosstab'}Template" type="text/template">
{{
var olapCrosstabMode =  viewType == 'olap_crosstab' ? true : false;

var numberOfRowGroups =  crosstab.rowGroups.length;
var numberOfColumnGroups =  crosstab.headerRows.length;
var measureIndex = crosstab.firstMeasureIndex;
var isMeasureInColumns =  crosstab.measureDimensionInColumns;
var measuresIsLastColumn =  !isMeasureInColumns || (measureIndex == numberOfColumnGroups - 1);
var measuresIsLastRow =  isMeasureInColumns || (measureIndex == numberOfRowGroups - 1);

var colGroupsPresent = crosstab.hasConcreteColumnGroups;
var rowGroupsPresent = crosstab.hasConcreteRowGroups;
var measuresPresent = crosstab.numberOfMeasures;

<%-- variables for generation "totals" columns for nonOLAP mode --%>
var lastHeaderOfFirstColumn = (colGroupsPresent && !olapCrosstabMode) ? crosstab.headerRows[0][crosstab.headerRows[0].length - 1] : null;
var totalsColumnSpanCount =  (colGroupsPresent && !olapCrosstabMode) ? (lastHeaderOfFirstColumn.isSummaryCrosstabHeader ? lastHeaderOfFirstColumn.span : 0): 0;

<%-- fix for Bug #23149: 1000 is a max colspan value for IE --%>
var maxColspanCount =  1000 - numberOfRowGroups - (colGroupsPresent ? 2 : 1) - totalsColumnSpanCount;
var safeNumberOfRows = crosstab.safeMemberCount;
var safeNumberOfColumns =  crosstab.safeColumnMode ? crosstab.safeMemberCount : maxColspanCount;
<%--TODO: move to messages --%>
var nullDimension =  "NULL Dimension";
}}

{{ if (titleBarShowing) { }}
<div class="caption" id="titleCaption">{{=title}}</div>
{{ } }}

{{ if (crosstab.queryStatus === 'OK') { }}
    <table id="canvasTable"
        class="data table olap crosstab default"
        cellpadding="1" cellspacing="0">

        <!-- rows of header rows -->
        <thead id="headerAxis">
            <%@ include file="crosstabHeaders.jsp" %>
        </thead>

        <!-- detail rows for row group summaries, measures and totals-->
        <tbody id="detailRows">
            <%@ include file="crosstabDetails.jsp" %>
        </tbody>
    </table>
{{ } }}
</script>
