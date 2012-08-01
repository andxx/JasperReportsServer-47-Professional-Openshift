<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--total number rows--%>
{{
var numberOfDetailRows = crosstab.detailRows.length;
var totalNumberOfDetailRows = crosstab.totalNumberOfDetailRows;
var numberOfColumns = crosstab.numberOfColumnHeaderCells;
var isTotalsRow = false;
}}

<%--iterate and print detail rows--%>
{{ _.each(crosstab.detailRows, function(detailRow, detailRowIndex) { }}

    <%-- Set up flag from which totals row generation should starts --%>
    {{ if (!olapCrosstabMode && rowGroupsPresent && detailRow.rowHeaders[0] && detailRow.rowHeaders[0].isSummaryCrosstabHeader) { }}
        {{ if (measuresIsLastRow) { }}
        <%-- Show total in safe mode only when measures is last row or not in rows--%>
            {{ isTotalsRow = true; }}
        {{ } }}
    {{ } }}

    <%--Render the row with headers and cells --%>
    {{ if (!crosstab.safeRowMode || (detailRowIndex < safeNumberOfRows) || isTotalsRow) { }}
        <tr id="detailRow_{{=detailRowIndex}}">
            {{ if (rowGroupsPresent) { }}
                {{ _.each(detailRow.rowHeaders, function(xtabHeader, groupIndex) { }}
                    <%--Render actual cell if it is not NULL or if it not exceed safe number of rows--%>
                    {{ if (xtabHeader) { }}
                        {{ var rowSpan = xtabHeader.span; }}

                        <%--This checks to see if the next cell exceeds the overflow count. --%>
                        {{ if (crosstab.safeRowMode && ((detailRowIndex + rowSpan) > safeNumberOfRows) && !isTotalsRow) { }}
                            {{ rowSpan = safeNumberOfRows - detailRowIndex; }}
                        {{ } }}

                        {{ (function() {
                        var _isColumnHeader = false;
                        var _tclass = xtabHeader.hierarchicalClassSelectors;
                        var _id = "rowGroup_" + xtabHeader.level + "_" + detailRowIndex;
                        var _isExpandable = xtabHeader.expandable;
                        var _expanded = xtabHeader.expanded;
                        var _cellContent = xtabHeader.label;
                        var _canSort = inDesignView && !olapCrosstabMode;
                        var _sortStatus = xtabHeader.sortStatus;
                        var _rowspan = rowSpan;
                        <%-- we have condition for first header because of
                        empty padding cell which can be present in columns headers
                        see crosstabHeaders.jsp: column-header-padding--%>
                        var _colspan = groupIndex == 0 ? xtabHeader.inwardSpan + 1 : xtabHeader.inwardSpan;
                        var _isSummaryHeader = xtabHeader.isSummaryCrosstabHeader;
                        var _sliceable = xtabHeader.sliceable;
                        var _path = xtabHeader.path; }}

                        <%@ include file="crosstabHeaderLabel.jsp" %>
                        {{ })(); }}
                    {{ } }}
                {{ }); }}
            {{ } }}

            {{ if (!rowGroupsPresent) { }}
                <td id="rowGroupsPlaceHolder" rowspan="{{=numberOfDetailRows}}"><spring:message code="ADH_261_ROW_GROUP"/></td>
            {{ } }}

            {{ _.each(detailRow.cells, function(xtabCell, xtabCellIndex) { }}
                {{ if (xtabCellIndex < safeNumberOfColumns || (totalsColSpanIndex > 0 && xtabCellIndex >= totalsColSpanIndex)) { }}
                    <%-- TODO: think how to optimize branching to avoid this code duplications--%>
                    {{ if (xtabCellIndex == safeNumberOfColumns && (crosstab.numberOfColumnHeaderCells - safeNumberOfColumns > 0)) { }}
                        <td class="colOverflow"></td>
                    {{ } }}

                    {{ if (crosstab.hasParentChildDimension) { }}
                       <%--
                           2012-04-27 thorick chow:  http://bugzilla.jaspersoft.com/show_bug.cgi?id=16298
                           Drill Through is disabled for any view that contains OLAP Dimension with ParentChild (recursive) Hierarchies
                       --%>
                       <td class="{{=xtabCell.hierarchicalSelectors}}" id="measureBucketNoDrillParentChild_{{=xtabCell.rowGroupPathIndex}}_{{=xtabCell.columnGroupPathIndex}}_values">
                       <span class="">{{=xtabCell.cellValue}}</span>
                    {{ } else { }}
                       <td class="{{=xtabCell.hierarchicalSelectors}}" id="measureBucketDrill_{{=xtabCell.rowGroupPathIndex}}_{{=xtabCell.columnGroupPathIndex}}_values">
                       <span class="{{inDesignView ? print('link') : print('');}}">{{=xtabCell.cellValue}}</span>
                    {{ } }}
                    </td>
                {{ } }}
                {{ if (xtabCellIndex == safeNumberOfColumns && (crosstab.numberOfColumnHeaderCells - safeNumberOfColumns > 0)) { }}
                    <td class="colOverflow"></td>
                {{ } }}
            {{ }); }}
        </tr>
    {{ } }}

    <%--Do not render any more cells if we have flagged for overflow which means we have rendered the overflow object--%>
    {{ if (crosstab.safeRowMode && detailRowIndex == safeNumberOfRows && (numberOfDetailRows - safeNumberOfRows > 0)) { }}
        {{var cellsCount =  detailRow.cells.length; }}
        {{var rowHeadersCount =  numberOfRowGroups + (colGroupsPresent ? 1 : 0); }}
        {{var rowOverflowColSpan =  rowHeadersCount + (cellsCount < safeNumberOfColumns ? cellsCount : safeNumberOfColumns); }}

        <tr>
            <td class="rowOverflow" colspan="{{=rowOverflowColSpan}}">
                <a><span class="wrap">{{print(totalNumberOfDetailRows - safeNumberOfRows);}} <spring:message code="ADH_280_MORE_LINK"/></span></a>
            </td>
        </tr>
    {{ } }}
{{ }); }}
