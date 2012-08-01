<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ page import="com.jaspersoft.ji.license.LicenseManager" %>
<%@ page import="com.jaspersoft.ji.license.LicenseCheckStatus" %>

<%@ taglib prefix="spring" uri="/spring" %>
<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>

<tiles:insertTemplate template="/WEB-INF/jsp/templates/aboutBox.jsp">
    <tiles:putAttribute name="containerClass" value="hidden centered_vert centered_horz"/>
    <tiles:putAttribute name="bodyContent">
        <%
            LicenseManager licenseManager = LicenseManager.getInstance();
        %>

        <%  LicenseCheckStatus licenseCheckStatus = licenseManager.checkLicense();
            if (!licenseCheckStatus.isLicenseAccepted()) { %>
        <p class="message"><%=licenseCheckStatus.getMessage()%></p>
        <%  } else { %>
            <p class="message"><spring:message code='NAV_146_ABOUT_LICENSE_PRODUCT_EDITION'/>:&nbsp;<span class="emphasis"><%= licenseManager.getProductEditionName() %></span></p>
            <%  String supportedFeatureNames = licenseManager.getSupportedFeatureNames();
                if (supportedFeatureNames != null) {    %>
            <p class="message"><spring:message code="NAV_147_ABOUT_LICENSE_FEATURES"/>: <span class="emphasis"><%=supportedFeatureNames%></span></p>
            <%  }   %>
            <p class="message"><spring:message code="dialog.aboutBox.productVersion"/>: <span class="emphasis"><spring:message code='PRO_VERSION'/></span></p>
            <p class="message"><spring:message code="dialog.aboutBox.build"/>: <span class="emphasis"><spring:message code='BUILD_DATE_STAMP'/>_<spring:message code='BUILD_TIME_STAMP'/></span></p>
            <p class="message"><spring:message code="NAV_142_ABOUT_LICENSE_TYPE"/>: <span class="emphasis"><%=licenseManager.getLicenseTypeString()%></span></p>
            <p class="message"><spring:message code="NAV_143_ABOUT_LICENSE_EXPIRATION"/>: <span class="emphasis"><%=licenseManager.getFormattedExpirationDate()%></span></p>
        <%  } %>

    </tiles:putAttribute>
</tiles:insertTemplate>