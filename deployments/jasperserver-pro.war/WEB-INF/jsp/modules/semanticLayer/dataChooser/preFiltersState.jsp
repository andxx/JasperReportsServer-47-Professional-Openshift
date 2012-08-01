<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.chooser.exitMessage" javaScriptEscape="true"/>';
    domain._messages['DISABLED_NODE_TOOLTIP'] = '<spring:message code="QB_133_QB_DISABLED_NODE_TOOLTIP" javaScriptEscape="true"/>';
    domain._messages['SELECTED_NODES_WARNING'] = '<spring:message code="QB_134_QB_SELECTED_NODES_WARNING" javaScriptEscape="true"/>';
    domain._messages['SELECTED_NODES_WARNING_HEADER'] = '<spring:message code="QB_135_QB_SELECTED_NODES_WARNING_HEADER" javaScriptEscape="true"/>';
    domain._messages['QB_DATA_CHANGING_DOMAINS'] = '<spring:message code="QB_DATA_CHANGING_DOMAINS" javaScriptEscape="true"/>';
    domain._messages['QB_BUNDLES_CONFLICT'] = '<spring:message code="QB_BUNDLES_CONFLICT" javaScriptEscape="true"/>';
    domain._messages['QB_DELETE_ITEM_CONFLICT'] = '<spring:message code="QB_DELETE_ITEM_CONFLICT" javaScriptEscape="true"/>';
    domain._messages['warning'] = '<spring:message code="QB_WARNING"/>';
    <%--domain._messages['confirm'] = '<spring:message code="QB_CONFIRM"/>'--%>
    domain._messages['accessDeniedError'] = '<spring:message code="ADH_1001_SERVER_REPOSITORY_ACCESS_DENIED" javaScriptEscape="true"/>';
    domain._messages['topicAlredyExists'] = '<spring:message code="SLQB_TOPIC_ALREADY_EXISTS" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.rsInitOptions = {
        flowExecutionKey : '${flowExecutionKey}',
        filtersJson : [<c:forEach items="${slRulesProvider}" var="item" varStatus="status">
            <c:out value="${item.json}" escapeXml="false"/>
            ${not status.last ? ',' : ''}
            </c:forEach>],
        javaToDataTypeMap : ${slObjectTypeMap},
        dateFormat : '${dateFormat}',
        timeOffset : ${timeOffset},
        decimalSeparator : '${decimalSeparatorForUserLocale}',
        groupingSeparator : "${requestScope.groupingSeparatorForUserLocale}",
        unsavedChangesPresent: ${unsavedChangesPresent}
    };
</script>
<jsp:include page="../filtersMessages.jsp"/>
