<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>

<%@ page import="com.jaspersoft.ji.adhoc.service.SessionAttributeManager" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib uri="/spring" prefix="spring"%>

<div
        id="canvasMetadata"
        data-orientation='${viewModel.pageOrientation}'
        data-size='${viewModel.paperSize}'
        class="hidden">
</div>

<table id="canvasTable"
       class="table wrapper default"
       style='width:${viewModel.chartWidth};border-width: 0px;border-style: none;
       height:${viewModel.chartHeight}'
       margins='${viewModel.hasMargins}'
       cellspacing="0">
    <!-- title caption -->
    <c:if test="${viewModel.titleBarShowing}">
        <caption class="caption" id="titleCaption">${viewModel.title}</caption>
    </c:if>
    <tbody>
        <tr>
            <%--what are these for? Need to ask angus--%>
            <%--<td colspan='2' style="background-color:transparent;">--%>
                <%--<img id='chartYBuffer' src="adhoc/images/px.gif" style="height:${viewModel.chartY};width:1">--%>
            <%--</td>--%>
            <%--<td style="background-color:transparent;">--%>
                <%--<img id='chartXBuffer' src="adhoc/images/px.gif" style="height:1;width:${viewModel.chartX}">--%>
            <%--</td>--%>
            <c:set var="left" value="left:"/>
            <c:set var="top" value="top:"/>
            <c:set var="pixel" value="px;"/>
            <c:set var="leftValue" value="${viewModel.chartX}"/>
            <c:set var="topValue" value="${viewModel.chartY}"/>
            <c:choose>
                <c:when test="${leftValue == 0}">
                    <c:set var="leftStyle" value=""/>
                </c:when>
                <c:otherwise>
                    <c:set var="leftStyle" value="${left}${leftValue}${pixel}"/>
                </c:otherwise>
            </c:choose>

            <c:choose>
                <c:when test="${topValue == 0}">
                    <c:set var="topStyle" value=""/>
                </c:when>
                <c:otherwise>
                    <c:set var="topStyle" value="${top}${topValue}${pixel}"/>
                </c:otherwise>
            </c:choose>

            <td id='chart' width="${viewModel.chartWidth}" height="${viewModel.chartHeight}" style="background-color:transparent;">
                <div id="chartBorder" class="chartBorder" style="${leftStyle} ${topStyle}">
                    <img id='chart-image'
                         class="chartImgBorder"
                         alt="generated chart"
                         src='<%=request.getContextPath()%>/DisplayChart?filename=<%=SessionAttributeManager.getInstance().getSessionAttribute("chartFilename",request)%>'
                         width="${viewModel.chartWidth}"
                         height="${viewModel.chartHeight}">
                    <div class="sizer hidden"
                         id="dragger">
                    </div>
                </div>
            </td>
        </tr>
    </tbody>

</table>

<script type="text/javascript" id='adhocActionModel' >
    '${viewModel.clientActionModelDocument}'
</script>

<%@ include file="baseState.jsp" %>
<%@ include file="chartState.jsp" %>
<%@ include file="chartConstantState.jsp" %>
<c:out value="${newOrDeletedFieldScript}" escapeXml="false"/>



