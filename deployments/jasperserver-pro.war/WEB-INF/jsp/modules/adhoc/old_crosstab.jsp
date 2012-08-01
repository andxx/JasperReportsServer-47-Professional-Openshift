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

<c:set var="crosstabMode" value="${viewModel.viewType == 'crosstab' ? 'selected' : ''}"/>
<c:set var="olapCrosstabMode" value="${viewModel.viewType == 'olap_crosstab' ? 'selected' : ''}"/>

<c:set var="numberOfRowGroups" value="${fn:length(viewModel.rowGroups)}"/>
<c:set var="numberOfColumnGroups" value="${fn:length(viewModel.headerRows)}"/>
<c:set var="measureIndex" value="${viewModel.firstMeasureIndex}"/>
<c:set var="isMeasureInColumns" value="${viewModel.measureDimensionInColumns}"/>
<c:set var="measuresIsLastColumn" value="${!isMeasureInColumns || (measureIndex == numberOfColumnGroups - 1)}"/>
<c:set var="measuresIsLastRow" value="${isMeasureInColumns || (measureIndex == numberOfRowGroups - 1)}"/>

<c:set var="colGroupsPresent" value="${viewModel.hasConcreteColumnGroups}"/>
<c:set var="rowGroupsPresent" value="${viewModel.hasConcreteRowGroups}"/>
<c:set var="measuresPresent" value="${viewModel.numberOfMeasures}"/>

<%-- variables for generation "totals" columns for nonOLAP mode --%>
<c:set var="lastHeaderOfFirstColumn" value="${(colGroupsPresent && olapCrosstabMode != 'selected') ? viewModel.headerRows[0][fn:length(viewModel.headerRows[0]) - 1] : null}"/>
<c:set var="totalsColumnSpanCount" value="${(colGroupsPresent && olapCrosstabMode != 'selected') ? (lastHeaderOfFirstColumn.isSummaryCrosstabHeader ? lastHeaderOfFirstColumn.span : 0): 0}"/>

<%-- fix for Bug #23149: 1000 is a max colspan value for IE --%>
<c:set var="maxColspanCount" value="${1000 - numberOfRowGroups - (colGroupsPresent ? 2 : 1) - totalsColumnSpanCount}"/>
<c:set var="safeNumberOfRows" value="${viewModel.safeMemberCount}"/>
<c:set var="safeNumberOfColumns" value="${viewModel.safeColumnMode ? viewModel.safeMemberCount : maxColspanCount}"/>
<c:set var="nullDimension" value="NULL Dimension"/>

<div
        id="canvasMetadata"
        data-orientation='${viewModel.pageOrientation}'
        data-size='${viewModel.paperSize}'
        class="hidden">
</div>

<c:choose>
    <c:when test="${viewModel.queryStatus ne 'OK'}">
         <c:if test="${viewModel.titleBarShowing}">
		     <div class="caption" id="titleCaption">${viewModel.title}</div>
		 </c:if>
        <t:insertTemplate template="/WEB-INF/jsp/templates/nothingToDisplay.jsp">
            <t:putAttribute name="containerID" value="nothingToDisplay"/>
            <t:putAttribute name="containerClass" value="${isIPad ? 'centered_fn_adhocCenterElement' : ''}"/>
            <t:putAttribute name="bodyContent">
                <p class="message"> <spring:message code="${viewModel.queryStatusMessagePrefix}${viewModel.queryStatus}"/></p>
            </t:putAttribute>
        </t:insertTemplate>
    </c:when>
    <c:otherwise>
		<table id="canvasTable"
		       class="data table olap crosstab default"
		       cellpadding="1" cellspacing="0">
		
		    <!-- title caption -->
		    <c:if test="${viewModel.titleBarShowing}">
		        <caption class="caption" id="titleCaption">${viewModel.title}</caption>
		    </c:if>
		
		    <!-- rows of header rows -->
            <thead id="headerAxis">
                <%@ include file="crosstabHeaders.jsp" %>
            </thead>

            <!-- detail rows for row group summaries, measures and totals-->
            <tbody id="detailRows">
                <%@ include file="crosstabDetails.jsp" %>
            </tbody>
        </table>
    </c:otherwise>
</c:choose>

<script type="text/javascript" id='adhocActionModel' >
    '${viewModel.clientActionModelDocument}'
</script>

<%@ include file="baseState.jsp" %>
<%@ include file="crosstabState.jsp" %>
<%@ include file="crosstabConstantState.jsp" %>
<c:out value="${newOrDeletedFieldScript}" escapeXml="false"/>

