<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.designer.exitMessage" javaScriptEscape="true"/>';
    domain._messages["designIsValid"]  = '<spring:message code="domain.designer.designIsValid" javaScriptEscape="true"/>';
    domain._messages["yes"]  = '<spring:message code="button.designer.yes" javaScriptEscape="true"/>';
    domain._messages["no"]  = '<spring:message code="button.designer.no" javaScriptEscape="true"/>';
    domain._messages["ok"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_OK" javaScriptEscape="true"/>';
    domain._messages["cancel"]  = '<spring:message code="DIALOG_CONFIRM_BUTTON_LABEL_CANCEL" javaScriptEscape="true"/>';
    domain._messages['Highest'] = '<spring:message code="ADH_071_MENU_MAXIMUM" javaScriptEscape="true"/>';
    domain._messages['Lowest'] = '<spring:message code="ADH_072_MENU_MINIMUM" javaScriptEscape="true"/>';
    domain._messages['Average'] = '<spring:message code="ADH_073_MENU_AVERAGE" javaScriptEscape="true"/>';
    domain._messages['Sum']  = '<spring:message code="ADH_074_MENU_SUM" javaScriptEscape="true"/>';
    domain._messages['DistinctCount'] = '<spring:message code="ADH_163_MENU_COUNT_DISTINCT" javaScriptEscape="true"/>';
    domain._messages['Count'] = '<spring:message code="ADH_075_MENU_COUNT_ALL" javaScriptEscape="true"/>';
    domain._messages['none'] = '<spring:message code="domain.designer.display.none" javaScriptEscape="true"/>';
    domain._messages['Dimension'] = '<spring:message code="DD_ITEM_PROPERTY_DIMENSION" javaScriptEscape="true"/>';
    domain._messages['Measure'] = '<spring:message code="DD_ITEM_PROPERTY_MEASURE" javaScriptEscape="true"/>';

    domain._messages['field.empty'] = '<spring:message code="domain.designer.error.field.empty" javaScriptEscape="true"/>';
    domain._messages['id.invalid'] = '<spring:message code="domain.designer.error.id.invalid" javaScriptEscape="true"/>';
    domain._messages['itemNameKey.invalid'] = '<spring:message code="domain.designer.error.itemNameKey.invalid" javaScriptEscape="true"/>';
    domain._messages['itemDescriptionKey.invalid'] = '<spring:message code="domain.designer.error.itemDescriptionKey.invalid" javaScriptEscape="true"/>';
    domain._messages['field.invalid'] = '<spring:message code="domain.designer.error.field.invalid" javaScriptEscape="true"/>';
    domain._messages['item.exists'] = '<spring:message code="domain.designer.error.item.exists" javaScriptEscape="true"/>';
    domain._messages['items.fromDifferentDataIslands'] = '<spring:message code="domain.designer.error.items.fromDifferentDataIslands" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.domainInitOptions = {
        flowExecutionKey: '${flowExecutionKey}',
        jsonJoins: ${joinsJSON},
        datasourcesProperties: ${datasourcesProperties},
        presentationSelected: ${presentationSelected},
        dataSourceId: '${selectedDatasource}',
        usedTablesByItemId: ${tablesUsedForRulesByItemId},
        typesMap: ${typesMap},
        fieldJavaTypes: [${ddFiledJavaTypes}],
        joinTreeModel: ${joinTreeModel},
        designerMode: '${designerMode}',
        dontWarnOfDeleteItems: '${dontWarnOfDeleteItems}',
        unsavedChangesPresent: ${unsavedChangesPresent}
    };

    var opts = localContext.domainInitOptions;

    // Default mask setup
    opts.defaultMasks = [];
    opts.defaultMasks['int'] = [{'value':'none','label': domain.getMessage('none')}];
    opts.defaultMasks['dec'] = [{'value':'none','label': domain.getMessage('none')}];
    opts.defaultMasks['date'] = [{'value':'none','label': domain.getMessage('none')}];
    opts.defaultMasks['NaN'] = [];

   <c:forEach var="m" items="${sessionScope['maskMap']['int']}">
     opts.defaultMasks['int'].push({'value':'${m.key}','label':'${m.value}'.replace(/&nbsp;/g,' ')});
   </c:forEach>

   <c:forEach var="m" items="${sessionScope['maskMap']['dec']}">
     opts.defaultMasks['dec'].push({'value':'${m.key}','label':'${m.value}'.replace(/&nbsp;/g,' ')});
   </c:forEach>

   <c:forEach var="m" items="${sessionScope['maskMap']['date']}">
     opts.defaultMasks['date'].push({'value':'${m.key}','label':'${m.value}'.replace(/&nbsp;/g,' ')});
   </c:forEach>

</script>
