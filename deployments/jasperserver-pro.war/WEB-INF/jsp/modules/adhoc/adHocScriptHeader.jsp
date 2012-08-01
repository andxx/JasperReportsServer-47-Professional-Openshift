<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@include file="../common/designerMessages.jsp"%>

<%--These varables need to be loaded first--%>
<script type="text/javascript">
    //Spring variables
    var multipleFieldsMessage = '<spring:message code="ADH_096_MULTIPLE_FIELDS" javaScriptEscape="true"/>';
    var multipleColumnsMessage = '<spring:message code="ADH_096_MULTIPLE_COLUMNS" javaScriptEscape="true"/>';
    var ALL_DEFAULT = '<spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_ALL" javaScriptEscape="true"/>';
    var xtabFilterMenu = '<spring:message code="ADH_1210_DYNAMIC_FILTER_TITLE" javaScriptEscape="true"/>';
    var saveConfirmation = "<spring:message code='ADH_107_SAVE_CONFIRMATION' javaScriptEscape='true'/>";
    //Error messages
    var addFilterErrorMessage = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE' javaScriptEscape='true'/>";
    var addFilterErrorMessageMeasureAdd = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE_MEASURE_ADD' javaScriptEscape='true'/>";
    var addFilterErrorMessageAllLevelAdd = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE_ALL_LEVEL_ADD' javaScriptEscape='true'/>";
    var addFilterErrorMessageGroupAdd = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE_GROUP_ADD' javaScriptEscape='true'/>";
    var addFilterErrorMessageSpacerAdd = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE_SPACER_ADD' javaScriptEscape='true'/>";
    var addFilterErrorMessagePercentOfParentCalcFieldAdd = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE_PERCENT_OF_PARENT_CALC_FIELD_ADD' javaScriptEscape='true'/>";
    var addFilterErrorMessageConstantAdd = "<spring:message code='ADH_1224_DYNAMIC_FILTER_ERR_MESSAGE_CONSTANT_ADD' javaScriptEscape='true'/>";
    var noColumnsAddedMessage = "<spring:message code='ADH_164_NO_COLUMNS_ADDED_MESSAGE' javaScriptEscape='true'/>";
    var ajaxError = "<spring:message code='ADH_1001_SERVER_COMMUNICATION_ERROR' javaScriptEscape='true'/>";
    var ajaxErrorHeader = "<spring:message code='ADH_1001_SERVER_COMMUNICATION_ERROR_HEADER' javaScriptEscape='true'/>";
    var errorAddTpGroups = "<spring:message code='ADH_1001_ERROR_ADD_TO_GROUPS' javaScriptEscape='true'/>";
    //dynamic filtering error
    var dynamicFilterInputError = "<spring:message code='ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR' javaScriptEscape='true'/>";
    //Calculated fields
    var calculatedFieldErrorCode1 = "<spring:message code='ADH_1001_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode2 = "<spring:message code='ADH_1002_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode3 = "<spring:message code='ADH_1003_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode4 = "<spring:message code='ADH_1004_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode5 = "<spring:message code='ADH_1005_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode6 = "<spring:message code='ADH_1006_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode7 = "<spring:message code='ADH_1007_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    var calculatedFieldErrorCode8 = "<spring:message code='ADH_1008_ADHOC_CALCULATED_FIELD_ERROR' javaScriptEscape='true'/>";
    //Notification messages
    var adHocSessionExpireCode = "<spring:message code='ADH_107_DESIGNER_SESSION_EXPIRATION' javaScriptEscape='true'/>";
    var adHocExitConfirmation = "<spring:message code='ADH_107_DESIGNER_EXIT' javaScriptEscape='true'/>";
    var noTopicsMessage = "<spring:message code='ADH_117a_NO_TOPICS' javaScriptEscape='true'/>";
    //pretty names for functions
    var functionMap = {'Highest':'<spring:message code="ADH_071_MENU_MAXIMUM" javaScriptEscape="true"/>', 'Lowest':'<spring:message code="ADH_072_MENU_MINIMUM" javaScriptEscape="true"/>','Average':'<spring:message code="ADH_073_MENU_AVERAGE" javaScriptEscape="true"/>','Sum':'<spring:message code="ADH_074_MENU_SUM" javaScriptEscape="true"/>','DistinctCount':'<spring:message code="ADH_163_MENU_COUNT_DISTINCT" javaScriptEscape="true"/>','Count':'<spring:message code="ADH_075_MENU_COUNT_ALL" javaScriptEscape="true"/>'};
    //no summary indicator
    var noSummaryLabel = '<spring:message code="ADH_078_MENU_NO_SUMMARY" javaScriptEscape="true"/>';
    var filtersWaitMessage = '<spring:message code="ADH_184_FILTERS_WAIT_MESSAGE" javaScriptEscape="true"/>';
    var missingICMessage = '<spring:message code="ADH_186_FILTERS_MISSING_IC" javaScriptEscape="true"/>';
    // re-entrance message
    var disabledFolderTooltip = '<spring:message code="ADH_106_DISABLED_FOLDER_TOOLTIP" javaScriptEscape="true"/>';
    var rowLimitMessage = '<spring:message code="ADH_294_HIT_ROW_LIMIT_SHORT_NOTIFICATION"  javaScriptEscape="true"/>';
	var itemsSelectedSuffix = '<spring:message code="ADH_055_ITEMS_SELECTED" javaScriptEscape="true"/>';
    var hasVisibleInputControls = "${requestScope.hasVisibleInputControls}";
    var moreValuesLabel = '<spring:message code="ADH_1229_DYNAMIC_FILTER_ADVANCED_MORE" javaScriptEscape="true"/>';
    var layoutManagerLabels = {
        column: {
            table: '<spring:message code="ADH_1213_DISPLAY_MANAGER_COLUMNS_TITLE"/>',
            chart: '<spring:message code="ADH_1213_DISPLAY_MANAGER_MEASURES_TITLE"/>',
            crosstab: '<spring:message code="ADH_1213_DISPLAY_MANAGER_COLUMNS_TITLE"/>'
        },
        row: {
            table: '<spring:message code="ADH_1213_DISPLAY_MANAGER_GROUPS_TITLE"/>',
            chart: '<spring:message code="ADH_1213_DISPLAY_MANAGER_GROUP_TITLE"/>',
            crosstab: '<spring:message code="ADH_1213_DISPLAY_MANAGER_ROWS_TITLE"/>'
        }
    }
    //dummy vars in case IE loses race condition
    var toolbarButtonModule;
    var tabModule;
    var dashboard;
    var defaultTopic = "${defaultTopic}";
    var defaultTopicDir = "${defaultTopicDir}";
    var urlContext = "${pageContext.request.contextPath}";
    var startTopic = "${startTopic}";
    var serverTimeoutInterval = ${serverTimeoutInterval};
    var localContext = window; //default context until we de-globalize
    //filters
    var addFilterWidgetByDefault = ${addFilterWidgetByDefault};
    var filterAutoSubmitTimer = ${filterAutoSubmitTimer};
    // Init root object modifier variables.
    var organizationId = "${organizationId}";
    var publicFolderUri = "${publicFolderUri}";
    // init flowExecutionKey for use in ajax
    var flowExecutionKey = "${flowExecutionKey}";
    var selectedThemeId = "${requestScope.viewModel.theme}";
    var saveFolder = "${requestScope.aruFolder}";
    var saveLabel = "${requestScope.aruLabel}";
    var saveDesc = "<spring:message code="${requestScope.aruDesc}" javaScriptEscape="true"/>";
    // default save name (if new)
    var defaultSaveName = "${requestScope.defaultAruName}";
    var defaultReportSuffix = '<spring:message code="dialog.generateResource.defaultNameSuffix" javaScriptEscape="true"/>';
    //put default masks in an array
    var defaultMasks = new Array();
    defaultMasks['int']="#,##0";
    defaultMasks['dec']="#,##0.00";
    defaultMasks['date']="medium,hide";
    // parameters
    var usingAdhocLauncher = '${param.adhocLauncher}';
    // formulas
    <c:if test="${requestScope.formulaInfo != null}">
        var formulaInfo = eval('(${requestScope.formulaInfo})');
    </c:if>
    <c:if test="${requestScope.formulaDistribution != null}">
        // formulas by types
        var formulaDistribution = eval('(${requestScope.formulaDistribution})');
    </c:if>
    // numeric separators
    var decimalSeparator = '${requestScope.decimalSeparatorForUserLocale}';
    var groupingSeparator = "${requestScope.groupingSeparatorForUserLocale}";
    //launch type
    var launchType = "<%=request.getParameter("launchType")%>";
    var isDomainType = null;
    <c:choose>
        <c:when test="${requestScope.isItDomainReport}">
            isDomainType = true;
        </c:when>
        <c:otherwise>
            isDomainType = false;
        </c:otherwise>
    </c:choose>
    var constantFieldsLevel = "${constant_fields_level}";
    var isAnalysisFeatureSupported = "${isAnalysisFeatureSupported}";
    var isDesignView = "${isDesignView}" === "true";
    var clientKey = "${clientKey}";

    var Report = {
        reportUnitURI: "${reportURI}"
    }
</script>

