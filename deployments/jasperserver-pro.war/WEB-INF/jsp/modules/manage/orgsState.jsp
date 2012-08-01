<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib uri="/spring" prefix="spring"%>

<script type="text/javascript" defer="defer">
    orgModule.messages['MT_SUB_TENANT_COUNT'] = '<spring:message code="MT_SUB_TENANT_COUNT" javaScriptEscape="true"/>';
    orgModule.messages['MT_SUB_TENANT_UNKNOWN_COUNT'] = '<spring:message code="MT_SUB_TENANT_UNKNOWN_COUNT" javaScriptEscape="true"/>';
    orgModule.messages['orgIdIsAlreadyInUse'] = '<spring:message code="MT_TENANT_EXIST_MSG" javaScriptEscape="true"/>';
    orgModule.messages['orgAliasIsAlreadyInUse'] = '<spring:message code="MT_ORG_ALIAS_ALREADY_EXISTS_MSG" javaScriptEscape="true"/>';
    orgModule.messages['orgIdIsEmpty'] = '<spring:message code="MT_TENANT_ID_IS_EMPTY_MSG" javaScriptEscape="true"/>';
    orgModule.messages['orgAliasIsEmpty'] = '<spring:message code="MT_TENANT_ALIAS_IS_EMPTY_MSG" javaScriptEscape="true"/>';
    orgModule.messages['orgNameIsEmpty'] = '<spring:message code="MT_TENANT_NAME_IS_EMPTY_MSG" javaScriptEscape="true"/>';
    orgModule.messages['unsupportedSymbols'] = '<spring:message code="MT_ORG_UNSUPPORTED_SYMBOLS" javaScriptEscape="true"/>';
    orgModule.messages['addOrg'] = '<spring:message code="MT_ADD_ORG" javaScriptEscape="true"/>';

    orgModule.messages['addOrgTo'] = '<spring:message code="MT_ADD_ORG_TO" javaScriptEscape="true"/>';
    orgModule.messages['deleteMessage'] = '<spring:message code="MT_DELETE_ORG_CONFIRMATION" javaScriptEscape="true"/>';
    orgModule.messages['deleteAllMessage'] = '<spring:message code="MT_DELETE_ALL_ORG_CONFIRMATION" javaScriptEscape="true"/>';
    orgModule.messages['cancelEdit'] = '<spring:message code="MT_CANCEL_TENANT_EDIT_MESSAGE" javaScriptEscape="true"/>';
    orgModule.messages['error.length.description'] = '<spring:message code="error.length.description" javaScriptEscape="true"/>';


    // Initialization of repository search init object.
    localContext.flowExecutionKey = '${flowExecutionKey}';
    localContext.orgMngInitOptions = {
        state: ${state},
        defaultRole: '${defaultRole}',
        currentUser: '${currentUser}'
    };

    orgModule.Configuration = ${configuration};
</script>
<%-- Insert CSRF script here, which is responsible for sending CSRF security token --%>
<script src="<c:url value="/JavaScriptServlet"/>"></script>
