<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="/spring" prefix="spring"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c-rt"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>


<%--jstl variables--%>
<c-rt:set var="state" scope="page" value="${requestScope.dashboardState}"/>
<c-rt:set var="frames" scope="page" value="${requestScope.dashboardState.allFrames}"/>
<c-rt:set var="contentFrames" scope="page" value="${requestScope.dashboardState.contentFrames}"/>
<c-rt:set var="controlFrames" scope="page" value="${requestScope.dashboardState.controlFrames}"/>
<c-rt:set var="controlFramesInitialValues" scope="page" value="${requestScope.dashboardState.formattedInputControlValues}"/>
<c-rt:set var="dashboardParameters" scope="page" value="${requestScope.dashboardState.dashboardParameters}"/>
<c-rt:set var="hiddenParameters" scope="page" value="${hiddenParams}"/>
<c-rt:set var="textFrames" scope="page" value="${requestScope.dashboardState.textFrames}"/>
<c-rt:set var="clickableFrames" scope="page" value="${requestScope.dashboardState.clickableFrames}"/>
<c-rt:set var="reportParameters" scope="page" value="${requestScope.dashboardState.reportParameters}"/>
<c-rt:set var="maxMultiSelectSize" value="7"/>
<c-rt:set var="calendarDatePattern" scope="page" value="${state.calendarDatePattern}"/>
<c-rt:set var="calendarDateTimePattern" scope="page" value="${state.calendarDateTimePattern}"/>



<%@ include file="dashboardViewerCommonImports.jsp"%>

<%--State props for javascript objects--%>
<script type="text/javascript">
    var clientKey = "${clientKey}";

    //server set variables
    var maxMultiSelectSize = "${maxMultiSelectSize}";
    var urlContext = "${pageContext.request.contextPath}";
    var staticDatePattern = "${state.staticDatePattern}";
    var localDatePattern = "${state.localDatePattern}";
    var paramsChanged = ${state.paramValuesChanged};
    var proportionalSizing = ${!state.useAbsoluteSizing};
    var dashboardState = "${requestScope.dashboardState}";
    var dashboardResource = "${requestScope.dashboardResource}";
    var NO_DASHBOARD_TITLE_TEXT = "<spring:message code='ADH_725_DASHBOARD_SELECTOR' javaScriptEscape='true'/>";
    localContext.resetButton = "<spring:message code='button.reset' javaScriptEscape='true'/>";

    //i18n date formats
    var localDateFormat = "<spring:message code='date.format'/>";
    var localDateTimeFormat = "<spring:message code='datetime.format'/>";
    var calendarDateFormat = "<spring:message code='calendar.date.format'/>";
    var calendarDateTimeFormat = "<spring:message code='calendar.datetime.format'/>";


    //constructors
    function ContentFrame(frameName) {
        this.frameName = frameName;
    }

    function ControlFrame(frameName) {
        this.frameName = frameName;
        this.paramName = null;
    }

    function TextFrame(frameName) {
        this.frameName = frameName;
        this.fontSize = null;
        this.label = null;
        this.resizeable = null;
    }

    function HiddenParam(theName, theValue) {
        this.paramName = theName;
        this.paramValue = theValue;
    }

    //shared variables
    var currentFrame = null;

    //JSTL to create objects
    //content frames
    var currentAutoRefresh;
    var contentFrames = [];
	
    var url_context;
    var frame_src;
    var frame_uri;
    var fid_parm;
    
    <c-rt:forEach var="frame" items="${contentFrames}" varStatus="frameStatus">
        <c-rt:set var="thisUrlContext" value="${(frame.resourceType=='customResourceType') ? '' : pageContext.request.contextPath}"/>
        contentFrames[${frameStatus.index}] = new ContentFrame('${frame.name}');
        currentFrame = contentFrames[${frameStatus.index}];
        url_context = '${thisUrlContext}';
        frame_src = '${frame.source}';
        var frame_uri = '${frame.URI}';
        (url_context == '' && frame_uri == '') ? fid_parm = '' : fid_parm = '&fid=contentFrame_${frame.name}';
        currentFrame.src = "${thisUrlContext}${frame.source}${frame.URI}" + fid_parm;
        currentAutoRefresh = <c-rt:out value="${frame.autoRefresh}" escapeXml="false"/>;
        if (currentAutoRefresh) {
            localContext.setRefreshTimer('${frame.name}', currentAutoRefresh)
        }
        //param mappings
        <c-rt:forEach var="controlFrame" items="${controlFrames}" varStatus="frameStatus">
            currentFrame['${controlFrame.paramName}'] = "${frame.paramMappings[controlFrame.paramName]}";
        </c-rt:forEach>
    </c-rt:forEach>

    var textFrames = [];
    <c-rt:forEach var="frame" items="${textFrames}" varStatus="frameStatus">
        textFrames[${frameStatus.index}] = new TextFrame('${frame.name}');
        currentFrame = textFrames[${frameStatus.index}];
        currentFrame.resizesProportionally = ${frame.resizesProportionally};
        currentFrame.fontSize = "${frame.textFontSize}";
        currentFrame.label = "<spring:escapeBody javaScriptEscape="true" htmlEscape="false">${frame.textLabel}</spring:escapeBody>";
        currentFrame.fontResizes = ${frame.fontResizes};
        currentFrame.heightPercentage = ${frame.heightAsPercentage};
        currentFrame.maxFontSize = ${frame.maxFontSize};
    </c-rt:forEach>


//    if (!controlFrames) {
        var controlFrames = [];
        <c-rt:forEach var="frame" items="${controlFrames}" varStatus="frameStatus">
            controlFrames[${frameStatus.index}] = new ControlFrame('${frame.name}');
            currentFrame = controlFrames[${frameStatus.index}];
            currentFrame.paramName = "${frame.paramName}";
            currentFrame.paramValue = [
                <c-rt:forEach var="paramValue" items="${controlFramesInitialValues[frame.paramName]}" varStatus="valueStatus">
                <c:if test="${!valueStatus.first}">, </c:if>"${paramValue}"
                </c-rt:forEach>
            ];
            currentFrame.dataType = "${frame.dataType}";
        </c-rt:forEach>
//    }

    //these are passed in via the dashboard URL and applied to every report
    if (!hiddenParams) {
        var hiddenParams = [];
        <c-rt:forEach var="hiddenParameter" items="${hiddenParameters}" varStatus="paramStatus">
            var paramName = "${hiddenParameter.name}";
            var paramValue = "${hiddenParameter.value}";
            var subString = getTextAfterSubstring(paramName, localContext.HIDDEN_PARAM_PREFIX);
            //assignment
            hiddenParams[${paramStatus.index}] = new HiddenParam(subString, paramValue);
        </c-rt:forEach>
    }

</script>
