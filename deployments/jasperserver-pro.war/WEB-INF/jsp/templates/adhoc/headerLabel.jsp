<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<t:useAttribute name="isColumnHeader" id="isColumnHeader" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="tclass" id="tclass" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="id" id="id" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="isExpandable" id="isExpandable" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="expanded" id="expanded" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="cellContent" id="cellContent" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="canSort" id="canSort" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="sortStatus" id="sortStatus" classname="java.lang.Number" ignore="false"/>
<t:useAttribute name="rowspan" id="rowspan" classname="java.lang.Number" ignore="false"/>
<t:useAttribute name="colspan" id="colspan" classname="java.lang.Number" ignore="false"/>
<t:useAttribute name="isSummaryHeader" id="isSummaryHeader" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="sliceable" id="sliceable" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="path" id="path" classname="java.lang.String" ignore="false"/>

<c:if test="${isColumnHeader}">
<th
</c:if>
<c:if test="${!isColumnHeader}">
<td
</c:if>
    id="${id}"
    class="${tclass}"
    rowspan="${rowspan}"
    colspan="${colspan}"
    data-isSummaryHeader="${isSummaryHeader}"
    data-fieldValue="<c:out value='${cellContent}' escapeXml='true'/>"
    data-sliceable="${sliceable}"
    data-expanable="${isExpandable}"
    data-path="<c:out value='${path}' escapeXml='true'/>">
    <c:if test="${isExpandable}">
        <span class="button disclosure icon ${expanded ? 'open' : 'closed'}"></span>
    </c:if>
    <c:if test="${canSort}">
        <c:set var="sortIcon" value="${sortStatus == 1 ? 'ascending' : (sortStatus == 2 ? 'descending' : 'natural')}"/>
        <span title="<spring:message code="ADH_177_CLICK_TO_CHANGE_SORTING" javaScriptEscape="true"/>" class="icon button ${sortIcon}"></span>
    </c:if>
    <c:choose>
        <%-- This check is made only for case when we receiving empty string from DB. We are trying to prevent escaping &NBSP; --%>
        <%-- Better solution will be NOT to convert empty strings and null values to &nbsp; in java, but make this in templates. --%>
        <c:when test="${cellContent eq '&nbsp;'}">&nbsp;</c:when>
        <c:otherwise>
            <spring:message text="${cellContent}" htmlEscape="true" />
        </c:otherwise>
    </c:choose>
<c:if test="${isColumnHeader}">
</th>
</c:if>
<c:if test="${!isColumnHeader}">
</td>
</c:if>
