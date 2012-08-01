<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.designer.exitMessage" javaScriptEscape="true"/>';
    domain._messages["designIsValid"]  = '<spring:message code="domain.designer.designIsValid" javaScriptEscape="true"/>';
    domain._messages["yes"]  = '<spring:message code="button.designer.yes" javaScriptEscape="true"/>';
    domain._messages["no"]  = '<spring:message code="button.designer.no" javaScriptEscape="true"/>';
    domain._messages["ok"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_OK" javaScriptEscape="true"/>';
    domain._messages["cancel"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_CANCEL" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.domainInitOptions = {
        flowExecutionKey: '${flowExecutionKey}',
        datasourcesProperties: ${datasourcesProperties}, // Do not remove. used for common domain dsigner logic
        presentationSelected: ${presentationSelected}, // Do not remove. used for common domain dsigner logic
        dataSourceId: '${selectedDatasource}', // Do not remove. used for common domain dsigner logic
        javaToDataTypeMap : ${slObjectTypeMap},
        filtersJson : [<c:forEach items="${slRulesProvider}" var="item" varStatus="status">
                <c:out value="${item.json}" escapeXml="false"/>
                ${not status.last ? ',' : ''}
            </c:forEach>],
        dateFormat : '${dateFormat}',
        timeOffset : ${timeOffset},
        decimalSeparator : '${decimalSeparatorForUserLocale}',
        groupingSeparator : "${groupingSeparatorForUserLocale}",
        unsavedChangesPresent: ${unsavedChangesPresent}
    };

</script>
<jsp:include page="../filtersMessages.jsp"/>
