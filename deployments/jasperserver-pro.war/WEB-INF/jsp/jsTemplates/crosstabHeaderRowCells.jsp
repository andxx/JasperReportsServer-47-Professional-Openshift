<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--Used to keep track of the spanning--%>
{{
var flagForOverflow = false;
var innerSpanCount = 0;
}}

{{ for (var groupIndex = 0; groupIndex < headerRow.length; groupIndex++) { }}
    {{ var xtabHeader = headerRow[groupIndex]; }}
    {{var colSpan = xtabHeader.span; }}

    {{var renderNextCell = true; }}

    <%-- Set up index from which totals column generation should starts --%>
    {{ if (!olapCrosstabMode && headerRowIndex == 0 && xtabHeader.isSummaryCrosstabHeader && totalsColSpanIndex < 0) {
        <%-- Show total in safe mode only when measures is last column or not in columns --%>
        if (measuresIsLastColumn) {
            totalsColSpanIndex = innerSpanCount;
        }
    } }}
    {{ var isTotalsColumn = totalsColSpanIndex > 0 ? (innerSpanCount >= totalsColSpanIndex) : false; }}

    <%--set overflow flag to true for overflow rendering--%>
    {{ if (innerSpanCount + colSpan >= safeNumberOfColumns) {
        flagForOverflow = innerSpanCount < safeNumberOfColumns;
        <%--adjust column span for summary cell--%>
        colSpan = flagForOverflow ? (safeNumberOfColumns - innerSpanCount) : colSpan;

        <%-- Render next cell if it is a last column which will be cut to safeColumns number or if it is a totals column --%>
        renderNextCell = flagForOverflow ? true : isTotalsColumn;
    } }}

    {{ if (renderNextCell) {
        (function() {
        var _isColumnHeader = true;
        var _tclass = xtabHeader.hierarchicalClassSelectors;
        var _id = "colGroupHeaderRow_" + xtabHeader.level + "_" + groupIndex;
        var _isExpandable = xtabHeader.expandable;
        var _expanded = xtabHeader.expanded;
        var _cellContent = xtabHeader.label;
        var _canSort = inDesignView && !olapCrosstabMode;
        var _sortStatus = xtabHeader.sortStatus;
        var _rowspan = xtabHeader.inwardSpan;
        var _colspan = colSpan;
        var _isSummaryHeader = xtabHeader.isSummaryCrosstabHeader;
        var _sliceable = xtabHeader.sliceable;
        var _path = xtabHeader.path; }}

        <%@ include file="crosstabHeaderLabel.jsp" %>
        {{ })(); }}

        <%--render this cell IFF we need overflow. this should only be rendered once by the outmost row --%>
        {{ if (flagForOverflow && (crosstab.numberOfColumnHeaderCells - safeNumberOfColumns > 0)) { }}
            {{ if (headerRowIndex == 0) { }}
                <th class="colOverflow"
                    data-canShowMore="{{=crosstab.safeColumnMode}}"
                    title="{{print(crosstab.numberOfColumnHeaderCells - safeNumberOfColumns);}} <spring:message code="ADH_280_MORE_LINK"/>"
                    rowspan="{{print(rowGroupsPresent ? numberOfColumnGroups + 1: numberOfColumnGroups)}}">
                    <a><span class="wrap">...</span></a>
                </th>
            {{ } }}
        {{ } }}
    {{ } }}

    <%--update cell count--%>
    {{ innerSpanCount = innerSpanCount + xtabHeader.span; }}
{{ } }}
