<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--Used to keep track of the spanning--%>
<c:set var="flagForOverflow" value="${false}"/>
<c:set var="innerSpanCount" value="0"/>

<c:forEach var="xtabHeader" items="${headerRow}" varStatus="groupIndex">
    <c:set var="colSpan" value="${xtabHeader.span}"/>

    <c:set var="renderNextCell" value="${true}"/>

    <%-- Set up index from which totals column generation should starts --%>
    <c:if test="${olapCrosstabMode != 'selected' && headerRowStatus.first && xtabHeader.isSummaryCrosstabHeader && totalsColSpanIndex < 0}">
        <%-- Show total in safe mode only when measures is last column or not in columns --%>
        <c:if test="${measuresIsLastColumn}">
            <c:set var="totalsColSpanIndex" value="${innerSpanCount}"/>
        </c:if>
    </c:if>
    <c:set var="isTotalsColumn" value="${totalsColSpanIndex > 0 ? (innerSpanCount >= totalsColSpanIndex) : false}"/>

    <%--set overflow flag to true for overflow rendering--%>
    <c:if test="${innerSpanCount + colSpan >= safeNumberOfColumns}">
        <c:set var="flagForOverflow" value="${innerSpanCount < safeNumberOfColumns ? true : false}"/>
        <%--adjust column span for summary cell--%>
        <c:set var="colSpan" value="${flagForOverflow ? (safeNumberOfColumns - innerSpanCount) : colSpan}"/>

        <%-- Render next cell if it is a last column which will be cut to safeColumns number or if it is a totals column --%>
        <c:set var="renderNextCell" value="${flagForOverflow ? true : isTotalsColumn}"/>
    </c:if>

    <c:if test="${renderNextCell}">
        <t:insertTemplate template="/WEB-INF/jsp/templates/adhoc/headerLabel.jsp">
            <t:putAttribute name="isColumnHeader" value="${true}"/>
            <t:putAttribute name="tclass" value="${xtabHeader.hierarchicalClassSelectors}"/>
            <t:putAttribute name="id" value="colGroupHeaderRow_${xtabHeader.level}_${groupIndex.index}"/>
            <t:putAttribute name="isExpandable" value="${xtabHeader.expandable}"/>
            <t:putAttribute name="expanded" value="${xtabHeader.expanded}"/>
            <t:putAttribute name="cellContent" value="${xtabHeader.label}"/>
            <t:putAttribute name="canSort" value="${viewModel.isDesignView && crosstabMode == 'selected'}"/>
            <t:putAttribute name="sortStatus" value="${xtabHeader.sortStatus}"/>
            <t:putAttribute name="rowspan" value="${xtabHeader.inwardSpan}"/>
            <t:putAttribute name="colspan" value="${colSpan}"/>
            <t:putAttribute name="isSummaryHeader" value="${xtabHeader.isSummaryCrosstabHeader}"/>
            <t:putAttribute name="sliceable" value="${xtabHeader.sliceable}"/>
            <t:putAttribute name="path" value="${xtabHeader.path}"/>
        </t:insertTemplate>

        <%--render this cell IFF we need overflow. this should only be rendered once by the outmost row --%>
        <c:if test="${flagForOverflow && (viewModel.numberOfColumnHeaderCells - safeNumberOfColumns > 0)}">
            <c:if test="${headerRowStatus.first}">
                <th class="colOverflow"
                    data-canShowMore="${viewModel.safeColumnMode}"
                    title="${viewModel.numberOfColumnHeaderCells - safeNumberOfColumns} <spring:message code="ADH_280_MORE_LINK"/>"
                    rowspan="${rowGroupsPresent ? numberOfColumnGroups + 1: numberOfColumnGroups}">
                    <a><span class="wrap">...</span></a>
                </th>
            </c:if>
        </c:if>
    </c:if>

    <%--update cell count--%>
    <c:set var="innerSpanCount" value="${innerSpanCount + xtabHeader.span}"/>
</c:forEach>
