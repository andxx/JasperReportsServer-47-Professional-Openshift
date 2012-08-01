<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<c:set var="currentColumnDimension" value=""/>
<c:set var="oddColumnClass" value="odd"/>
<c:set var="currentRowDimension" value=""/>
<c:set var="oddRowClass" value="odd"/>

<c:set var="totalsColSpanIndex" value="-1"/>
<c:set var="measuresHeaderLabel">
    <spring:message code="ADH_530_MEASURES" javaScriptEscape="true"/>
</c:set>

<%--iterate only if some real dimensions present in columns --%>
<c:if test="${colGroupsPresent}">
<%--perform iteration--%>
<c:forEach var="headerRow" items="${viewModel.headerRows}" varStatus="headerRowStatus">
    <c:set var="currentColumnGroup" value="${viewModel.columnGroups[headerRowStatus.index]}"/>
    <c:set var="isMeasureColumn" value="${isMeasureInColumns and (measureIndex == headerRowStatus.index)}"/>

    <tr>
        <%-- determine odd/even dimension--%>
        <c:if test="${currentColumnDimension != currentColumnGroup.dimensionName}">
            <c:set var="oddColumnClass" value="${oddColumnClass == 'odd' ? '' : 'odd'}"/>
            <c:set var="currentColumnDimension" value="${currentColumnGroup.dimensionName}"/>
        </c:if>

        <%-- do not apply odd class if this is measure column--%>
        <c:set var="calculatedOddColumnClass" value="${isMeasureColumn ? '' : oddColumnClass}"/>

        <!-- pad on left if needed to easily distinguish beetween columns and rows on UI -->
        <c:if test="${viewModel.numberOfRowGroups > 0 && rowGroupsPresent}">
            <th colspan="1" class="column-header-padding"></th>
            <c:if test="${viewModel.numberOfRowGroups > 1}">
                <th colspan="1"  class="${isMeasureColumn ? 'measure' : ''} level dummy ${calculatedOddColumnClass}"></th>
                <c:if test="${viewModel.numberOfRowGroups > 2}">
                    <th colspan="${numberOfRowGroups - 2 }"  class="${isMeasureColumn ? 'measure' : ''} level dummy ${calculatedOddColumnClass}"></th>
                </c:if>
            </c:if>
        </c:if>

        <t:insertTemplate template="/WEB-INF/jsp/templates/adhoc/groupHeaderLabel.jsp">
            <t:putAttribute name="headerClass" value="${isMeasureColumn ? 'measure' : ''} level column ${calculatedOddColumnClass}"/>
            <t:putAttribute name="id" value="colGroupLabelHeaderRow_${headerRowStatus.index}"/>
            <t:putAttribute name="levelName" value="${currentColumnGroup.name}"/>
            <t:putAttribute name="dimensionName" value="${currentColumnGroup.dimensionName}"/>
            <t:putAttribute name="isExpandable" value="${currentColumnGroup.levelExpandable}"/>
            <t:putAttribute name="isLevelExpanded" value="${currentColumnGroup.levelExpanded}"/>
            <t:putAttribute name="cellContent" value="${isMeasureColumn ? measuresHeaderLabel : currentColumnGroup.displayName}"/>
        </t:insertTemplate>

        <%--include column group header labels--%>
        <c:if test="${viewModel.hasConcreteColumnGroups}">
            <%@ include file="crosstabHeaderRowCells.jsp"%>
        </c:if>
    </tr>
</c:forEach>
</c:if>

<c:if test="${rowGroupsPresent}">
<tr>
    <c:forEach var="rowGroup" items="${viewModel.rowGroups}" varStatus="rowGroupStatus">
        <c:set var="currentRowGroup" value="${viewModel.rowGroups[rowGroupStatus.index]}"/>
        <c:set var="isMeasureRow" value="${!isMeasureInColumns and (measureIndex == rowGroupStatus.index)}"/>

        <%-- determine odd/even dimension--%>
        <c:if test="${not (currentRowDimension eq currentRowGroup.dimensionName)}">
            <c:set var="oddRowClass" value="${oddRowClass == 'odd' ? '' : 'odd'}"/>
            <c:set var="currentRowDimension" value="${currentRowGroup.dimensionName}"/>
        </c:if>
        <c:set var="calculatedOddRowClass" value="${isMeasureRow ? '' : oddRowClass}"/>

        <c:set var="cellContent" value ="${rowGroup.displayName}"/>
        <c:set var="cellId" value ="rowGroupHeaderRowLabel_${rowGroupStatus.index}"/>

        <t:insertTemplate template="/WEB-INF/jsp/templates/adhoc/groupHeaderLabel.jsp">
            <t:putAttribute name="headerClass" value="${isMeasureRow ? 'measure' : ''} level ${calculatedOddRowClass}"/>
            <t:putAttribute name="id" value="${cellId}"/>
            <t:putAttribute name="levelName" value="${currentRowGroup.name}"/>
            <t:putAttribute name="dimensionName" value="${currentRowGroup.dimensionName}"/>
            <t:putAttribute name="isExpandable" value="${currentRowGroup.levelExpandable}"/>
            <t:putAttribute name="isLevelExpanded" value="${currentRowGroup.levelExpanded}"/>
            <t:putAttribute name="cellContent" value="${isMeasureRow ? measuresHeaderLabel : cellContent}"/>
            <t:putAttribute name="colspan" value="${rowGroupStatus.first ? 2 : 1}"/>
        </t:insertTemplate>
    </c:forEach>

    <c:forEach var="rowGroup" items="${viewModel.headerRows[numberOfColumnGroups - 1]}" varStatus="rowGroupStatus">
        <c:if test="${rowGroupStatus.index < safeNumberOfColumns || (totalsColSpanIndex > 0 && rowGroupStatus.index >= totalsColSpanIndex)}">
            <th class="empty"></th>
        </c:if>
    </c:forEach>
</tr>
</c:if>
