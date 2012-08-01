<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<t:useAttribute name="headerClass" id="headerClass" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="id" id="id" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="levelName" id="levelName" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="dimensionName" id="dimensionName" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="isExpandable" id="isExpandable" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="isLevelExpanded" id="isLevelExpanded" classname="java.lang.Boolean" ignore="false"/>
<t:useAttribute name="cellContent" id="cellContent" classname="java.lang.String" ignore="false"/>
<t:useAttribute name="rowspan" id="rowspan" classname="java.lang.Long" ignore="true"/>
<t:useAttribute name="colspan" id="colspan" classname="java.lang.Long" ignore="true"/>

<th
    class="${headerClass}"
    id="${id}"
    data-level="<c:out value='${levelName}' escapeXml='true'/>"
    data-dimension="<c:out value='${dimensionName}' escapeXml='true'/>"
    data-expanable="${isExpandable}"
    <c:if test="${rowspan != null}">rowspan="${rowspan}"</c:if>
    <c:if test="${colspan != null}">colspan="${colspan}"</c:if>>

    <c:if test="${isExpandable}">
        <span class="button disclosure icon ${isLevelExpanded ? 'open' : 'closed'}"></span>
    </c:if>
    <c:out value="${cellContent}" escapeXml="true"/>
</th>
