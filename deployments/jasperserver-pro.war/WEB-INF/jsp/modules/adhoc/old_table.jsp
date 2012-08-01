<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib uri="/spring" prefix="spring"%>
<%--variables--%>
<c:set var="containsRows" value="${fn:length(viewModel.columns) > 0 || fn:length(viewModel.flattenedData) > 0}"/>

<div
        id="canvasMetadata"
        data-orientation='${viewModel.pageOrientation}'
        data-size='${viewModel.paperSize}'
        class="hidden">
</div>

<!-- START: Main Table Row -->
<c:if test="${!isIPad}">
<div id="canvasTableFrame" style="padding-right:100px;position:absolute;">
</c:if>
<table id="canvasTable"
       class="data table wrapper default"
       <c:if test="${!containsRows}">
            style="z-index:0; border:none;"    
       </c:if>
       style="z-index:0;"
       cellspacing="0">
    <!-- title caption -->
    <c:if test="${viewModel.titleBarShowing}">
        <caption class="caption" id="titleCaption">${viewModel.title}</caption>
    </c:if>
    <!-- START: Column Stakes -->
    <colgroup id='canvasTableCols'>
        <c:forEach var="column" items="${viewModel.columns}">
            <col style="width:${column.width}px;">
        </c:forEach>
    </colgroup>
    <!-- END: Column Stakes -->
    <!-- START: Column Headers -->
    <tr  class="labels column" id='columnHeaderRow'>
        <c:forEach var="headerCell" items="${viewModel.columnHeaderRow.childMembers}" varStatus="columnHeaderItStatus">
            <c:set var="containsRows" value="true"/>
            <c:set var="thisColumn" value="${viewModel.columns[columnHeaderItStatus.index]}"/>
            <c:choose>
                <c:when test="${headerCell.isSpacer}">
                    <c:set var="fieldName" value="${thisColumn.type}"/>
                </c:when>
                <c:otherwise>
                    <c:set var="fieldName" value="${thisColumn.name}"/>
                </c:otherwise>
            </c:choose>
            <th data-type="${thisColumn.numericType}"
                data-mask='${thisColumn.mask}'
                    <c:choose>
                        <c:when test="${!headerCell.isEmpty || headerCell.isSpacer}">
                            class="label ${headerCell.isNumeric ? 'numeric' : ''}"
                        </c:when>
                        <c:otherwise>
                            class="label deletedHeader"
                        </c:otherwise>
                    </c:choose>
                data-fieldName="${fieldName}"
                data-fieldDisplay="${thisColumn.defaultDisplayName}"
                data-label="${headerCell.formattedContent}"
                data-index="${columnHeaderItStatus.index}"
                style="min-width:${thisColumn.width}px;">
                <c:choose>
                    <c:when test="${!headerCell.isEmpty || headerCell.isSpacer}">
                        <span class="wrap">${headerCell.formattedContent}</span>
                    </c:when>
                    <c:otherwise>
                        ${thisColumn.name}
                    </c:otherwise>
                </c:choose>
            </th>
        </c:forEach>
    </tr>
    <!-- END: Column Headers -->
    <!-- START: Group and Rows-->
    <c:if test="${!viewModel.hasNoData}">
        <c:set var="rowCounter" value="-1"/>
        <%@ include file="tableRows.jsp" %>
    </c:if>
</table>
<c:if test="${!isIPad}">
</div>
</c:if>

<%--empty view model message--%>
<c:set var="hidden" value=" ${viewModel.hasNoData ? 'hidden' : ''}"/>
<div id="NoDataRow" class="${hidden}">
    <t:insertTemplate template="/WEB-INF/jsp/templates/nothingToDisplay.jsp">
        <t:putAttribute name="containerID" value="nothingToDisplay"/>
        <t:putAttribute name="containerClass" value="${isIPad ? 'centered_fn_adhocCenterElement' : ''}"/>
        <t:putAttribute name="bodyContent">
            <p class="message"> <spring:message code="ADH_265_TABLE_STATUS_MISSING_FIELD_MEASURE"/></p>
        </t:putAttribute>
    </t:insertTemplate>
</div>

<script type="text/javascript" id='adhocActionModel' >
    '${viewModel.clientActionModelDocument}'
</script>
<%--page imports--%>

<%@ include file="tableState.jsp" %>
<%@ include file="baseState.jsp" %>
<c:out value="${newOrDeletedFieldScript}" escapeXml="false"/>
<!-- end dynamic content indicator-->

