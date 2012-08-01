<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<script type="text/javascript">
    domain._messages['calculated_field_added'] = '<spring:message code="page.calcFields.field.added" javaScriptEscape="true"/>';
    domain._messages['calculated_field_edited'] = '<spring:message code="page.calcFields.field.edited" javaScriptEscape="true"/>';
    domain._messages['calculated_field_removed'] = '<spring:message code="page.calcFields.field.removed" javaScriptEscape="true"/>';
    domain._messages['wrong_name_format'] = '<spring:message code="page.calcFields.wrong.name.format" javaScriptEscape="true"/>';
    domain._messages['cannot_edit_field'] = '<spring:message code="page.calcFields.cannot.edit" javaScriptEscape="true"/>';
    domain._messages['confirm_filter_delete'] = '<spring:message code="DD_CONFIRM_DELETE_FILTER_IF_USED_IN_CALC_FIELD" javaScriptEscape="true"/>';

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
        fieldsUsedByFilters : ${fieldsUsedForRulesByItemId},
        unsavedChangesPresent: ${unsavedChangesPresent}
    };
                                                                                                     
</script>
