<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page import="com.jaspersoft.ji.license.LicenseManager" %>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="authz"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="/spring" prefix="spring"%>

<% request.setAttribute("homePage","true"); %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code='manage.home.header.title'/></t:putAttribute>
    <t:putAttribute name="bodyID" value="home_manage"/>
    <t:putAttribute name="bodyClass" value="oneColumn"/>
    <t:putAttribute name="headerContent" >
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/home.main.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/home.manage.init.js"></script>
    </t:putAttribute>
    <t:putAttribute name="bodyContent" >
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary home"/>
            <t:putAttribute name="containerTitle"><spring:message code="manage.home.title"/></t:putAttribute>
            <t:putAttribute name="bodyContent">
                <div class="centered_horz">
                    <div class="row">
                        <a id="manageUsers" class="button action jumbo up"><span class="wrap"><spring:message code="manage.home.users" javaScriptEscape="true"/></span><span class="icon"></span></a>
                        <a id="manageRoles" class="button action jumbo up"><span class="wrap"><spring:message code="manage.home.roles" javaScriptEscape="true"/></span><span class="icon"></span></a>

                    </div>
                    <div class="row bottom">
                        <a id="browseRepo" class="button action jumbo up"><span class="wrap"><spring:message code="manage.home.browseRepository" javaScriptEscape="true"/></span><span class="icon"></span></a>
                        <%
                            Object principal = org.springframework.security.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                            boolean couldShowAnalysisOptions = true;
                            if (principal != null && principal instanceof com.jaspersoft.jasperserver.api.metadata.user.domain.TenantQualified) {
                                if (((com.jaspersoft.jasperserver.api.metadata.user.domain.TenantQualified)principal).getTenantId() != null) {
                                    couldShowAnalysisOptions = false;
                                }
                            }

                            if (couldShowAnalysisOptions && LicenseManager.isAnalysisFeatureSupported()) {
                        %>
                        <a id="manageOLAP" class="button action jumbo up"><span class="wrap"><spring:message code="manage.home.analysisOptions" javaScriptEscape="true"/></span><span class="icon"></span></a>
                        <%
                            }
                        %>
                    </div>
                </div>
            </t:putAttribute>
        </t:insertTemplate>
    </t:putAttribute>
</t:insertTemplate>
