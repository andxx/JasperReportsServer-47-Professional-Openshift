<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>
<%@ page import="com.jaspersoft.ji.license.LicenseManager" %>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="authz"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib uri="/spring" prefix="spring"%>

<% request.setAttribute("homePage","true"); %>

<authz:authorize ifAllGranted="ROLE_ADMINISTRATOR">
    <c:set var="bodyId" value="home_admin"/>
</authz:authorize>
<authz:authorize ifNotGranted="ROLE_ADMINISTRATOR">
    <c:set var="bodyId" value="home_user"/>
</authz:authorize>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code='home.title'/></t:putAttribute>
    <t:putAttribute name="bodyID">${bodyId}</t:putAttribute>
    <t:putAttribute name="bodyClass" value="oneColumn"/>
    <t:putAttribute name="headerContent" >
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/core.accessibility.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/home.main.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/home.init.js"></script>
    </t:putAttribute>
    <t:putAttribute name="bodyContent" >
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary home"/>
            <t:putAttribute name="containerTitle"><spring:message code="home.header.title"/></t:putAttribute>
            <t:putAttribute name="bodyContent">
                <div class="<c:if test="${!isIPad}">centered_horz</c:if>" data-tab-index="3" data-component-type="linkList">
                    <%
                        if (!LicenseManager.banUserRole()) {
                    %>
                    <div class="row">
                        <a id="viewReports" class="button action jumbo up"><span class="wrap"><spring:message code="home.view" javaScriptEscape="true"/></span><span class="icon"></span></a>

                        <%
                            if (LicenseManager.isAnalysisFeatureSupported()) {
                        %>
                        <a id="createReports" class="button action jumbo up"><span class="wrap"><spring:message code="home.create" javaScriptEscape="true"/></span><span class="icon"></span></a>
                        <%
                            }
                        %>

                        <a id="manageServer" class="button action jumbo up"><span class="wrap"><spring:message code="home.manage" javaScriptEscape="true"/></span><span class="icon"></span></a>
                    </div>
                    <%
                        }
                    %>
                </div>
            </t:putAttribute>
        </t:insertTemplate>
    </t:putAttribute>
</t:insertTemplate>
