<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%--imports--%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="cr"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@ taglib uri="/spring" prefix="springcr"%>

<cr:set var="calendarDatePattern" scope="page" value="${viewModel.calendarDatePattern}"/>
<cr:set var="calendarDateTimePattern" scope="page" value="${viewModel.calendarDateTimePattern}"/>
<cr:set var="sizingHack" value="2"/>



<%--clickable buttons (currently print, submit and reset--%>
<cr:forEach  var="frame" items="${viewModel.clickableFrames}" varStatus="frameStatus">
    <div id="clickableFrameContainer_${frame.name}"
         class="componentContainer control actionButton"
         style="left:${frame.left}px;top:${frame.top}px">
        <div class="overlay button"
             id="clickableFrameOverlay_${frame.name}"
             data-id="${frame.id}"
             data-resizeable="false"
             data-frameType="clickableFrame"
             data-frameName="${frame.name}"></div>
        <button id="button_${frame.id}"
                class="button action">
            <cr:choose>
                <cr:when test="${frame.id eq 'submit'}">
                    <span class="wrap"><springcr:message code='ADH_770a_BUTTON_SUBMIT' javaScriptEscape='true'/></span>
                </cr:when>
                <cr:when test="${frame.id eq 'reset'}">
                    <span class="wrap"><springcr:message code='ADH_770b_BUTTON_RESET' javaScriptEscape='true'/></span>
                </cr:when>
                <cr:when test="${frame.id eq 'print'}">
                    <span class="wrap"><springcr:message code='ADH_770c_BUTTON_PRINT' javaScriptEscape='true'/></span>
                </cr:when>
            </cr:choose>
            <span class="icon"></span>
        </button>
    </div>
</cr:forEach>



<%--text control frames--%>
<cr:forEach var="frame" items="${viewModel.textFrames}" varStatus="frameStatus">
    <cr:set var="type" value="${(frame.fontResizes eq true) ? 'free' : 'label'}"/>
    <div id="textFrameContainer_${frame.name}"
         class="componentContainer control displayText ${type}"
         style="font-size:${frame.textFontSize}px;line-height:${frame.textFontSize}px;width:${frame.width}px;height:${frame.height}px;left:${frame.left}px;top:${frame.top}px">
        <cr:choose>
            <cr:when test="${type == 'label'}">
            </cr:when>
            <cr:otherwise>
                <div class="sizer diagonal"></div>
            </cr:otherwise>
        </cr:choose>
        <div id="textFrameOverlay_${frame.name}"
             data-frameType="textFrame"
             data-frameName="${frame.name}"
             class="overlay button"></div>
        <div class="read">${frame.textLabel}</div>
        <input class="edit" type="text" value="${fn:escapeXml(frame.textLabel)}"/>
    </div>
</cr:forEach>



<%--input controls--%>
<cr:forEach var="frame" items="${viewModel.controlFrames}" varStatus="frameStatus">
    <cr:set var="dashboardParameter" scope="page" value="${viewModel.dashboardParameters[frame.paramName]}"/>
    <cr:set var="frameLeft" value="${frame.left}px"/>
    <cr:set var="frameTop" value="${frame.top}px"/>
    <%@ include file="dashboardDesignerInputControlGenerator.jsp" %>
</cr:forEach>
<%--state after each ajax call--%>
<div id="dashboardStatePlaceholder">
    <%@ include file="dashboardDesignerState.jsp" %>
</div>

