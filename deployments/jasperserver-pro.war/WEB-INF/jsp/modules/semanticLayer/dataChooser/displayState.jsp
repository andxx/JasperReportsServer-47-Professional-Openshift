<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.chooser.exitMessage" javaScriptEscape="true"/>';
    domain._messages["sortingInfoWillBeLost"]  = '<spring:message code="page.display.sortingInfoWillBeLost" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.rsInitOptions = {
        flowExecutionKey: '${flowExecutionKey}',
        treeItemsModel: ${slSortedQueryTree},
        listItemsModel: ${slSortedQueryList},
        itemOriginalLabels: ${treeItemOriginalLabelsJSON},
        isFlatList: ${slIsTableAsList},
        unsavedChangesPresent: ${unsavedChangesPresent}
    };
</script>
