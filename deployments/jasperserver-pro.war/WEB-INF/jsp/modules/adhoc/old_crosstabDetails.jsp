<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--total number rows--%>
<c:set var="numberOfDetailRows" value="${fn:length(viewModel.detailRows)}"/>
<c:set var="numberOfColumns" value="${viewModel.numberOfColumnHeaderCells}"/>
<c:set var="isTotalsRow" value="${false}"/>
<c:set var="drillUrl"
       value="${viewModel.viewType == 'olap_crosstab' ? 'localContext.getDrillOlapUrl(localContext.tempARUName)' : 'localContext.getDrillUrl()'}"/>

<%--iterate and print detail rows--%>
<c:forEach var="detailRow" items="${viewModel.detailRows}" varStatus="detailRowsStatus">

    <%-- Set up flag from which totals row generation should starts --%>
    <c:if test="${olapCrosstabMode != 'selected' && rowGroupsPresent && detailRow.rowHeaders[0] != null && detailRow.rowHeaders[0].isSummaryCrosstabHeader}">
        <%-- Show total in safe mode only when measures is last row or not in rows--%>
        <c:if test="${measuresIsLastRow}">
            <c:set var="isTotalsRow" value="${true}"/>
        </c:if>
    </c:if>

    <%--Render the row with headers and cells --%>
    <c:if test="${!viewModel.safeRowMode || (detailRowsStatus.index < safeNumberOfRows) || isTotalsRow}">
        <tr id="detailRow_${detailRowsStatus.index}">
            <c:if test="${rowGroupsPresent}">
                <c:forEach var="xtabHeader" items="${detailRow.rowHeaders}" varStatus="groupIndex">
                    <%--Render actual cell if it is not NULL or if it not exceed safe number of rows--%>
                    <c:if test="${xtabHeader != null}">
                        <c:set var="rowSpan" value="${xtabHeader.span}"/>

                        <%--This checks to see if the next cell exceeds the overflow count. --%>
                        <c:if test="${viewModel.safeRowMode && ((detailRowsStatus.index + rowSpan) > safeNumberOfRows) && !isTotalsRow}">
                            <c:set var="rowSpan" value="${safeNumberOfRows - detailRowsStatus.index}"/>
                        </c:if>

                        <t:insertTemplate template="/WEB-INF/jsp/templates/adhoc/headerLabel.jsp">
                            <t:putAttribute name="isColumnHeader" value="${false}"/>
                            <t:putAttribute name="tclass" value="${xtabHeader.hierarchicalClassSelectors}"/>
                            <t:putAttribute name="id" value="rowGroup_${xtabHeader.level}_${detailRowsStatus.index}"/>
                            <t:putAttribute name="isExpandable" value="${xtabHeader.expandable}"/>
                            <t:putAttribute name="expanded" value="${xtabHeader.expanded}"/>
                            <t:putAttribute name="cellContent" value="${xtabHeader.label}"/>
                            <t:putAttribute name="canSort" value="${viewModel.isDesignView && crosstabMode == 'selected'}"/>
                            <t:putAttribute name="sortStatus" value="${xtabHeader.sortStatus}"/>
                            <t:putAttribute name="rowspan" value="${rowSpan}"/>
                            <%-- we have condition for first header because of
                            empty padding cell which can be present in columns headers
                            see crosstabHeaders.jsp: column-header-padding--%>
                            <t:putAttribute name="colspan" value="${groupIndex.first ? xtabHeader.inwardSpan + 1 : xtabHeader.inwardSpan}"/>
                            <t:putAttribute name="isSummaryHeader" value="${xtabHeader.isSummaryCrosstabHeader}"/>
                            <t:putAttribute name="sliceable" value="${xtabHeader.sliceable}"/>
                            <t:putAttribute name="path" value="${xtabHeader.path}"/>
                        </t:insertTemplate>
                    </c:if>
                </c:forEach>
            </c:if>

            <c:if test="${!rowGroupsPresent}">
                <td id="rowGroupsPlaceHolder" rowspan="${numberOfDetailRows}"><spring:message code="ADH_261_ROW_GROUP"/></td>
            </c:if>

            <c:forEach var="xtabCell" items="${detailRow.cells}" varStatus="cellStatus">
                <c:if test="${cellStatus.index < safeNumberOfColumns || (totalsColSpanIndex > 0 && cellStatus.index >= totalsColSpanIndex)}" >
                    <td class="${xtabCell.hierarchicalSelectors}" id="measureBucketDrill_${xtabCell.rowGroupPathIndex}_${xtabCell.columnGroupPathIndex}_values"
                            onclick="javascript:localContext.allowDrill && window.open(${drillUrl},'drillTable') && (localContext.allowDrill=false)">
                        <c:set var="cellValue" value="${xtabCell.values[0]}"/>
                        <span class="${requestScope.viewModel.isDesignView ? 'link' : ''}"><c:out value="${cellValue}" escapeXml="false"/></span>
                    </td>
                </c:if>
                <c:if test="${cellStatus.index == safeNumberOfColumns && (viewModel.numberOfColumnHeaderCells - safeNumberOfColumns > 0)}">
                    <td class="colOverflow"></td>
                </c:if>
            </c:forEach>
        </tr>
    </c:if>

    <%--Do not render any more cells if we have flagged for overflow which means we have rendered the overflow object--%>
    <c:if test="${viewModel.safeRowMode && detailRowsStatus.index == safeNumberOfRows && (numberOfDetailRows - safeNumberOfRows > 0)}">
        <c:set var="cellsCount" value="${fn:length(detailRow.cells)}"/>
        <c:set var="rowHeadersCount" value="${numberOfRowGroups + (colGroupsPresent ? 1 : 0)}"/>
        <c:set var="rowOverflowColSpan" value="${rowHeadersCount + (cellsCount < safeNumberOfColumns ? cellsCount : safeNumberOfColumns)}"/>

        <tr>
            <td class="rowOverflow" colspan="${rowOverflowColSpan}">
                <a><span class="wrap"><c:out value="${numberOfDetailRows - safeNumberOfRows}"/> <spring:message code="ADH_280_MORE_LINK"/></span></a>
            </td>
        </tr>
    </c:if>
</c:forEach>
