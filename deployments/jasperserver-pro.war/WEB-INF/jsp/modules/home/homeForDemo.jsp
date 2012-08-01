<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page import="com.jaspersoft.ji.license.LicenseManager" %>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib uri="/spring" prefix="spring"%>

<% request.setAttribute("homePage","true"); %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code='home.title'/></t:putAttribute>
    <t:putAttribute name="bodyID">home_user</t:putAttribute>
    <t:putAttribute name="bodyClass" value="oneColumn"/>
    <t:putAttribute name="bodyContent" >
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary"/>
            <t:putAttribute name="containerTitle"><spring:message code="home.header.title"/></t:putAttribute>
            <t:putAttribute name="swipeScroll" value="${isIPad}"/>
            <t:putAttribute name="bodyContent">
                <iframe id="outerFrame" name="Dashboard" allowtransparency="true" align="center" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" height="450" width="100%" scrolling="no"
                    src="${pageContext.request.contextPath}/flow.html?_flowId=dashboardRuntimeFlow&amp;dashboardResource=/supermart/SupermartDashboard30&viewAsDashboardFrame=true&decorate=no&hidden_isJasperAnalysis=<%=LicenseManager.isAnalysisFeatureSupported()?"true":"false"%>">
                </iframe>
            </t:putAttribute>
        </t:insertTemplate>
    </t:putAttribute>
</t:insertTemplate>
