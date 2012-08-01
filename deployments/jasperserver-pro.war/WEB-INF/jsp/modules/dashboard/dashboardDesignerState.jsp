<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--imports--%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="cf"%>
<%@ taglib uri="/spring" prefix="spring"%>

<%--dummy tag required for innerHTML to work in IE--%>
<br>
<script type="text/javascript" id="dashboardDesignerState">
    //dashboard props
    localContext.title = "<cf:out value='${viewModel.title}' escapeXml='false'/>";
    localContext.titleShowing = "<cf:out value='${viewModel.titleBarShowing}' escapeXml='false'/>";
    localContext.resyncRequired = <cf:out value='${viewModel.resyncRequired}' escapeXml='false'/>;
    localContext.conversionFactor = <cf:out value='${viewModel.conversionFactor}' escapeXml='false'/>;
    localContext.gridSize = <cf:out value='${viewModel.gridSize}' escapeXml='false'/>;
    localContext.layoutSize = "<cf:out value='${viewModel.layoutSize}' escapeXml='false'/>";
    localContext.oversized = <cf:out value='${viewModel.isOversized}' escapeXml='false'/>;
    localContext.cannotResize = <cf:out value='${viewModel.cannotResize}' escapeXml='false'/>;
    localContext.layoutWidth = <cf:out value='${viewModel.layoutWidth}' escapeXml='false'/>;
    localContext.layoutHeight = <cf:out value='${viewModel.layoutHeight}' escapeXml='false'/>;
    localContext.titleBandHeight = <cf:out value='${viewModel.titleBandHeight}' escapeXml='false'/>;
    localContext.isFixedSizing = <cf:out value='${viewModel.useAbsoluteSizing}' escapeXml='false'/>;
    //frame properties
    localContext.nextContentFrameName = "<cf:out value='${viewModel.nextContentFrameName}' escapeXml='false'/>";
    localContext.nextContentFrameLeft = <cf:out value='${viewModel.nextContentFrameLeft}' escapeXml='false'/>;
    localContext.nextContentFrameTop = <cf:out value='${viewModel.nextContentFrameTop}' escapeXml='false'/>;
    localContext.nextContentFrameWidth = <cf:out value='${viewModel.nextContentFrameWidth}' escapeXml='false'/>;
    localContext.nextContentFrameHeight = <cf:out value='${viewModel.nextContentFrameHeight}' escapeXml='false'/>;
    localContext.displayNextContentFrameCue = <cf:out value='${viewModel.displayNextContentFrameCue}' escapeXml='false'/>;
    localContext.nextControlFrameLeft = <cf:out value='${viewModel.nextNonContentFrameLeft}' escapeXml='false'/>;
    localContext.nextControlFrameTop = <cf:out value='${viewModel.nextNonContentFrameTop}' escapeXml='false'/>;
    localContext.nextControlFrameWidth = <cf:out value='${viewModel.nextNonContentFrameWidth}' escapeXml='false'/>;
    localContext.nextControlFrameHeight = <cf:out value='${viewModel.nextNonContentFrameHeight}' escapeXml='false'/>;
    localContext.resetButton = "<spring:message code='button.reset' javaScriptEscape='true'/>";
    // Bundle messages
    localContext.messages.dashboardOptionMessage = "<spring:message code='DASHBOARD_OPTION_ONLY_PRESENT_IN_RUNTIME'/>";
    //frames as array
    <cf:out value="${viewModel.contentFramesAsJSArray}" escapeXml='false'/>
    <cf:out value="${viewModel.controlFramesAsJSArray}" escapeXml='false'/>
    <cf:out value="${viewModel.textFramesAsJSArray}" escapeXml='false'/>
    <cf:out value="${viewModel.clickableFramesAsJSArray}" escapeXml='false'/>
    <cf:out value="${viewModel.addedClickableControlIDsAsJSArray}" escapeXml='false'/>
    //params as array
    <cf:out value="${viewModel.controlsAsJSArray}" escapeXml='false'/>
    var calendarDateFormat = "<spring:message code='calendar.date.format'/>";
</script>

<script type="text/javascript" id='dashboardActionModel' >
    '${viewModel.clientActionModelDocument}'
</script>
