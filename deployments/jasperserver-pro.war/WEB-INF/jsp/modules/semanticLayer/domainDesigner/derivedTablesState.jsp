<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.designer.exitMessage" javaScriptEscape="true"/>';
    domain._messages["designIsValid"]  = '<spring:message code="domain.designer.designIsValid" javaScriptEscape="true"/>';
    domain._messages["yes"]  = '<spring:message code="button.designer.yes" javaScriptEscape="true"/>';
    domain._messages["no"]  = '<spring:message code="button.designer.no" javaScriptEscape="true"/>';
    domain._messages["ok"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_OK" javaScriptEscape="true"/>';
    domain._messages["cancel"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_CANCEL" javaScriptEscape="true"/>';
    domain._messages["queryId.empty"]  = '<spring:message code="domain.designer.derivedTables.error.emptyQueryId" javaScriptEscape="true"/>';
    domain._messages["queryId.invalid"]  = '<spring:message code="domain.designer.derivedTables.error.invalidQueryId" javaScriptEscape="true"/>';
    domain._messages["fieldId.exists"]  = '<spring:message code="domain.designer.derivedTables.error.fieldIdExists" javaScriptEscape="true"/>';
    domain._messages["expression.empty"]  = '<spring:message code="domain.designer.derivedTables.error.emptyQuery" javaScriptEscape="true"/>';
    domain._messages["expression.nonselect"]  = '<spring:message code="domain.designer.derivedTables.error.nonselectQuery" javaScriptEscape="true"/>';
    domain._messages["expression.notRunned"]  = '<spring:message code="domain.designer.derivedTables.error.pleaseRunQuery" javaScriptEscape="true"/>';
    domain._messages["expression.queryFailed"]  = '<spring:message code="domain.designer.derivedTables.error.queryFailed" javaScriptEscape="true"/>';
    domain._messages["resultFields.emptySelection"]  = '<spring:message code="domain.designer.derivedTables.error.selectAtLeastOne" javaScriptEscape="true"/>';
    domain._messages["changesWillBeLost"]  = '<spring:message code="domain.designer.derivedTables.warn.changesWillBeLost" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.domainInitOptions = {
        flowExecutionKey: '${flowExecutionKey}',
        datasourcesProperties: ${datasourcesProperties}, // Do not remove. used for common domain dsigner logic
        presentationSelected: ${presentationSelected}, // Do not remove. used for common domain dsigner logic
        dataSourceId: '${selectedDatasource}', // Do not remove. used for common domain dsigner logic
        usedTablesByItemId: ${tablesUsedForRulesByItemId},
        unsavedChangesPresent: ${unsavedChangesPresent}
    };

</script>
