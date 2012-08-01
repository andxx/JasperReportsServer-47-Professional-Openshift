<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@include file="../common/designerMessages.jsp"%>

<%--state variable set from the server--%>
<script type="text/javascript" id="dashboardDesignerConstantState">
    localContext.URL_CONTEXT_PATH = "${pageContext.request.contextPath}";
    localContext.CUSTOM_RESOURCE_TYPE = "<c:out value="${viewModel.customResourceType}" escapeXml='false'/>";
    localContext.NO_DASHBOARD_TITLE_TEXT = "<spring:message code='ADH_725_DASHBOARD_SELECTOR' javaScriptEscape='true'/>";
    localContext.DASHBOARD_MENU_TITLE = "<spring:message code='ADH_730_DASHBOARD_MENU_TITLE' javaScriptEscape='true'/>";
    localContext.MULTI_SELECT_FRAME_MENU_TITLE = "<spring:message code='ADH_731_DASHBOARD_MULTI_SELECT_FRAME_MENU_TITLE' javaScriptEscape='true'/>";
    localContext.MULTI_SELECT_CONTENT_FRAME_MENU_TITLE = "<spring:message code='ADH_732_DASHBOARD_MULTI_SELECT_CONTENT_FRAME_MENU_TITLE' javaScriptEscape='true'/>";
    localContext.HIDE_SCROLL_BARS_LABEL = "<spring:message code='ADH_739a_DASHBOARD_HIDE_SCROLLBARS' javaScriptEscape='true'/>";
    localContext.SHOW_SCROLL_BARS_LABEL = "<spring:message code='ADH_739b_DASHBOARD_SHOW_SCROLLBARS' javaScriptEscape='true'/>";
    localContext.HIDE_ALL_SCROLL_BARS_LABEL = "<spring:message code='ADH_739c_DASHBOARD_HIDE_ALL_SCROLLBARS' javaScriptEscape='true'/>";
    localContext.SHOW_ALL_SCROLL_BARS_LABEL = "<spring:message code='ADH_739d_DASHBOARD_SHOW_ALL_SCROLLBARS' javaScriptEscape='true'/>";
    localContext.USE_PROPORTIONAL_FRAME_SIZING_LABEL = "<spring:message code='ADH_747a_USE_PROPORTIONAL_FRAME_SIZING' javaScriptEscape='true'/>";
    localContext.USE_ABSOLUTE_FRAME_SIZING_LABEL = "<spring:message code='ADH_747b_USE_ABSOLUTE_FRAME_SIZING' javaScriptEscape='true'/>";
    localContext.TEXT_LABEL = "<spring:message code='ADH_771d_TEXT_LABEL' javaScriptEscape='true'/>";
    localContext.FREE_TEXT = "<spring:message code='ADH_771e_FREE_TEXT' javaScriptEscape='true'/>";
    localContext.CUSTOM_URL_LABEL = "<spring:message code='ADH_771c_CUSTOM_URL_LABEL' javaScriptEscape='true'/>";
    localContext.MULTIPLE_REPORT_CONTROL_LABEL = "<spring:message code='ADH_771a_MULTIPLE_REPORT_CONTROL_LABEL' javaScriptEscape='true'/>";
    localContext.STANDARD_REPORT_CONTROL_LABEL = "<spring:message code='ADH_771b_STANDARD_REPORT_CONTROL_LABEL' javaScriptEscape='true'/>";
    localContext.SINGLE_REPORT_CONTROL_LABEL = "<spring:message code='ADH_771b_SINGLE_REPORT_CONTROL_LABEL' javaScriptEscape='true'/>";
    localContext.SUBMIT_BUTTON_LABEL = "<spring:message code='ADH_770a_BUTTON_SUBMIT' javaScriptEscape='true'/>";
    localContext.RESET_BUTTON_LABEL = "<spring:message code='ADH_770b_BUTTON_RESET' javaScriptEscape='true'/>";
    localContext.PRINT_BUTTON_LABEL = "<spring:message code='ADH_770c_BUTTON_PRINT' javaScriptEscape='true'/>";
    localContext.SPECIAL_CONTENT_LABEL = "<spring:message code='ADH_772_SPECIAL_CONTENT' javaScriptEscape='true'/>";
    localContext.DELETE_FRAME_LABEL = "<spring:message code='ADH_738a_DASHBOARD_MENU_DELETE_FRAME' javaScriptEscape='true'/>";
    localContext.DELETE_FRAMES_LABEL = "<spring:message code='ADH_738b_DASHBOARD_MENU_DELETE_FRAMES' javaScriptEscape='true'/>";
    localContext.DELETE_ITEMS_LABEL = "<spring:message code='ADH_738c_DASHBOARD_MENU_DELETE_ITEMS' javaScriptEscape='true'/>";
    localContext.DELETE_ITEM_LABEL = "<spring:message code='ADH_738d_DASHBOARD_MENU_DELETE_ITEM' javaScriptEscape='true'/>";
    localContext.CONTROLS_AFFECT_SIZING = "<spring:message code='ADH_790_CONTROLS_AFFECT_SIZING' javaScriptEscape='true'/>";
    localContext.DASHBOARD_DISPLAY_TYPE = "<spring:message code='ADH_799a_DASHBOARD_TYPE' javaScriptEscape='true'/>";
    localContext.REPORT_DISPLAY_TYPE = "<spring:message code='ADH_799b_REPORT_TYPE' javaScriptEscape='true'/>";
    localContext.INPUT_CONTROL_DISPLAY_TYPE = "<spring:message code='ADH_799c_INPUT_CONTROL_TYPE' javaScriptEscape='true'/>";
    localContext.TEXT_DISPLAY_TYPE = "<spring:message code='ADH_799d_TEXT_CONTROL_TYPE' javaScriptEscape='true'/>";
    localContext.CLICKABLE_DISPLAY_TYPE = "<spring:message code='ADH_799e_CLICKABLE_CONTROL_TYPE' javaScriptEscape='true'/>";
    localContext.RESOLUTION_MESSAGE = "<spring:message code='ADH_75cb_DASHBOARD_RESOLUTION_MESSAGE' javaScriptEscape='true'/>";
    localContext.RESOLUTION_MODE_LABEL = "<spring:message code='ADH_75cb_DASHBOARD_RESOLUTION_MODE_LABEL' javaScriptEscape='true'/>";
	//global only because we need ot be to be compatible with adhoc code
	var nonSelectedFolder = "<spring:message code='ADH_162_NULL_SAVE_FOLDER_MESSAGE' javaScriptEscape='true'/>";	
</script>

