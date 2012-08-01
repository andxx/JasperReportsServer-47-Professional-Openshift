<%--
  ~ Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<script type="text/javascript" id="dashboardDesignerConstantState">
    if(typeof designerMessages == 'undefined') {
        designerMessages = {};
    }

    //Report saving
    designerMessages.datasourceOverwrite = "<spring:message code='dialog.generateResource.own.datasource.overwrite' javaScriptEscape='true'/>";
    designerMessages.emptyName = {
        report: "<spring:message code='ADH_162_NULL_SAVE_REPORT_NAME_MESSAGE' javaScriptEscape='true'/>",
        dataView: "<spring:message code='ADH_162_NULL_SAVE_DATA_VIEW_NAME_MESSAGE' javaScriptEscape='true'/>",
        dashboard: "<spring:message code='ADH_162_NULL_SAVE_DASHBOARD_NAME_MESSAGE' javaScriptEscape='true'/>"
    };
    designerMessages.nonSelectedFolder = {
        report: "<spring:message code='ADH_162_NULL_SAVE_REPORT_FOLDER_MESSAGE' javaScriptEscape='true'/>",
        dataView: "<spring:message code='ADH_162_NULL_SAVE_DATA_VIEW_FOLDER_MESSAGE' javaScriptEscape='true'/>",
        reportAndDataView: "<spring:message code='ADH_162_NULL_SAVE_REPORT_AND_DATA_VIEW_FOLDER_MESSAGE' javaScriptEscape='true'/>",
        dashboard: "<spring:message code='ADH_162_NULL_SAVE_DASHBOARD_FOLDER_MESSAGE' javaScriptEscape='true'/>"
    };
    designerMessages.selectedFolderIsNotWritable = {
        report: "<spring:message code='ADH_1001_SERVER_REPOSITORY_ACCESS_DENIED' javaScriptEscape='true'/>",
        dataView: "<spring:message code='ADH_1001_SERVER_REPOSITORY_ACCESS_DENIED' javaScriptEscape='true'/>",
        reportAndDataView: "<spring:message code='ADH_1001_SERVER_REPOSITORY_ACCESS_DENIED' javaScriptEscape='true'/>",
        dashboard: "<spring:message code='ADH_1001_SERVER_REPOSITORY_ACCESS_DENIED' javaScriptEscape='true'/>"
    };
    designerMessages.saveDescriptionError = {
        report: "<spring:message code='ADH_1001_ADHOC_SAVE_REPORT_DESCRIPTION_ERROR' javaScriptEscape='true'/>",
        dataView: "<spring:message code='ADH_1001_ADHOC_SAVE_DATA_VIEW_DESCRIPTION_ERROR' javaScriptEscape='true'/>",
        dashboard: "<spring:message code='ADH_1001_ADHOC_SAVE_DASHBOARD_DESCRIPTION_ERROR' javaScriptEscape='true'/>"
    };
    designerMessages.saveLabelError = {
        report: "<spring:message code='ADH_1001_ADHOC_SAVE_REPORT_LABEL_ERROR' javaScriptEscape='true'/>",
        dataView: "<spring:message code='ADH_1001_ADHOC_SAVE_DATA_VIEW_LABEL_ERROR' javaScriptEscape='true'/>",
        dashboard: "<spring:message code='ADH_1001_ADHOC_SAVE_DASHBOARD_LABEL_ERROR' javaScriptEscape='true'/>"
    };

</script>