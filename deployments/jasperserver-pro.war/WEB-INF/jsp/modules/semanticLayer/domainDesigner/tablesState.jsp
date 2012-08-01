<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.designer.exitMessage" javaScriptEscape="true"/>';
    domain._messages["manageDataSource.emptyName"]  = '<spring:message code="page.tables.dataSource.manageDataSource.emptyName" javaScriptEscape="true"/>';
    domain._messages["designIsValid"]  = '<spring:message code="domain.designer.designIsValid" javaScriptEscape="true"/>';
    domain._messages["yes"]  = '<spring:message code="button.designer.yes" javaScriptEscape="true"/>';
    domain._messages["no"]  = '<spring:message code="button.designer.no" javaScriptEscape="true"/>';
    domain._messages["ok"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_OK" javaScriptEscape="true"/>';
    domain._messages["cancel"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_CANCEL" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.domainInitOptions = {
        flowExecutionKey: '${flowExecutionKey}',
        dataSourcesList: ${dataSourcesJson},
        jsonJoins: ${joinsJSON},
        datasourcesProperties: ${datasourcesProperties},
        presentationSelected: ${presentationSelected},
        askForSchemas: ${askForSchemas},
        dataSourceId: '${selectedDatasource}',
        usedTablesByItemId: ${tablesUsedForRulesByItemId},
        autoGenerateJoins: ${autoGenerateJoins},
        organizationId: '${organizationId}',
        publicFolderUri: '${publicFolderUri}',
        unsavedChangesPresent: ${unsavedChangesPresent}
    };
</script>
