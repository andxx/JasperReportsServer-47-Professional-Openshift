<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<script type="text/javascript">
    var state = null;
    var urlContext = "${pageContext.request.contextPath}";
    // init flowExecutionKey for use in ajax
    var flowExecutionKey = "${flowExecutionKey}";
    var saveFolder = "${requestScope.aruFolder}";
    var saveLabel = "${requestScope.aruLabel}";
    var saveDesc = "${requestScope.aruDesc}";
    // default save name (if new)
    var defaultSaveName = "${requestScope.defaultAruName}";
    // Init root object modifier variables.
    var organizationId = "${organizationId}";
    var publicFolderUri = "${publicFolderUri}";
    var serverTimeoutInterval = ${serverTimeoutInterval};

    var emptyReportNameMessage = "<spring:message code='ADH_162_NULL_SAVE_NAME_MESSAGE' javaScriptEscape='true'/>";
    // errors
    var ajaxError = "<spring:message code='ADH_1001_SERVER_COMMUNICATION_ERROR' javaScriptEscape='true'/>";
    var ajaxErrorHeader = "<spring:message code='ADH_1001_SERVER_COMMUNICATION_ERROR_HEADER' javaScriptEscape='true'/>";
    //Notification messages
    var dashBoardSessionExpireCode = "<spring:message code='ADH_755b_DASHBOARD_SESSION_EXPIRATION' javaScriptEscape='true'/>";
    var dashBoardExitConfirmation = "<spring:message code='ADH_755a_DASHBOARD_EXIT' javaScriptEscape='true'/>";
    var saveConfirmation = "<spring:message code='ADH_755c_SAVE_CONFIRMATION' javaScriptEscape='true'/>";

    //i18n date formats
    var calendarDateFormat = "<spring:message code='calendar.date.format'/>";
    var calendarDateTimeFormat = "<spring:message code='calendar.datetime.format'/>";
</script>

<%@ include file="dashboardDesignerConstantState.jsp" %>
