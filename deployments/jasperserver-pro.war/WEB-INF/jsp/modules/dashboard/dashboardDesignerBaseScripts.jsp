<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%--Apply input controls--%>
<jsp:include page="../inputControls/commonInputControlsImports.jsp" />

<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/controls.dashboard.js"></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/designer.base.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/dashboard.designer.js'></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/report.view.base.js"></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/dialog.definitions.js'></script>


<script type="text/javascript">
localContext.messages["buttonAlreadyAdded"] = '<spring:message code="DASHBOARD_BUTTON_ALREADY_ADDED" javaScriptEscape="true"/>';
</script>