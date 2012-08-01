<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<c:set var="modeClass" value="${viewModel.useAbsoluteSizing ? '' : 'proportional'}"/>
<c:choose>
    <c:when test="${viewModel.useAbsoluteSizing}">
        <c:set var="modeStyle" value="style='width:${viewModel.layoutWidth}px;height:${viewModel.layoutHeight}px'"/>
        <c:set var="resolution" value="${viewModel.layoutSize}"/>
    </c:when>
    <c:otherwise>
        <c:set var="modeStyle" value=""/>
        <c:set var="resolution" value=""/>
    </c:otherwise>
</c:choose>

<%--guide for canvas--%>
<div id="dashboardCanvasArea" class="proportional">
<div id="sizeGuide"
     class="${modeClass}"
${modeStyle}>
    <span id="guideLabel" class="label">
        <c:if test="${viewModel.useAbsoluteSizing}">
            ${resolution}
        </c:if>
    </span>

    <%--title section--%>
    <c:if test="${viewModel.titleBarShowing}">
        <div id="title" class="emphasis larger">${viewModel.title}</div>
    </c:if>

    <%--used when trying to dynamically figure out font sizes--%>
    <div id="fontSizeTester"></div>
</div>

</div>

<%--frames go here--%>
<div id="dashboardFrameParent">

    <%--iterate through the array and print out each frame--%>
    <c:forEach var="frame" items="${viewModel.contentFrames}">
        <c:choose>
            <c:when test="${frame.hasScrollBars}">
                <c:set var="scrolling" value="style='overflow-x: scroll; overflow-y : scroll; overflow : scroll'"/>
                <c:set var="isScrolling" value="yes"/>
            </c:when>
            <c:otherwise>
                <c:set var="scrolling" value="style='overflow-x: hidden; overflow-y : hidden; overflow : hidden'"/>
                <c:set var="isScrolling" value="no"/>
            </c:otherwise>
        </c:choose>

        <c:set var="isCustom" value="${(frame.resourceType == viewModel.customResourceType) ? true : false}"/>
        <c:set var="thisUrlContext" value="${isCustom ? '' : pageContext.request.contextPath}"/>
        <c:set var="toolTip" value="${isCustom ? frame.source : frame.URI}"/>
        <%--main frame--%>
        <div id="contentFrameContainer_${frame.name}"
             class="componentContainer iframe"
             title="${toolTip}"
             style="left:${frame.left}px;top:${frame.top}px;width:${frame.width}px;height:${frame.height}px;">
            <div class="sizer diagonal"></div>
            <div id="containerOverlay_${frame.name}" class="overlay button"
                 data-frameType="contentFrame"
                 data-frameName="${frame.name}"
                 data-iFrameID="contentFrame_${frame.name}"
                 data-isCustom=${isCustom}>
            </div>
            <div class="floatingMenu">
                <button class="button action up refresh" title="Refresh" id="refresh_${frame.name}">
                    <span class="wrap"><spring:message code="ADH_780_REFRESH"/><span class="icon"></span></span>
                </button>
                <button class="button action up open" title="<spring:message code='DASHBOARD_OPEN_IN_A_NEW_WINDOW' javaScriptEscape='true'/>" id="open_${frame.name}">
                    <span class="wrap"><spring:message code="ADH_780_OPEN"/><span class="icon"></span></span>
                </button>
            </div>
            <c:set var="frameSrc" value="${thisUrlContext}${frame.source}${frame.URI}&embedded=true"/>
             
            <div style="position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;">
            <c:if test="${isIPad}"><div id="iframeScroll_${frame.name}" class="swipeScroll"></c:if>

            <iframe id="contentFrame_${frame.name}"
                    class="reportContainerFrame"
                    onload="localContext._updateIFrameLoadingStatus('containerOverlay_${frame.name}','${isScrolling}');"
                    frameborder="0" src="${fn:replace(frameSrc, "/&", "?")}"
                    marginwidth="0"
                    marginheight="0"
                    data-iframeLoaed="loading"
                    scrolling="no">
            </iframe>
            <c:if test="${isIPad}"></div></c:if>
            </div>
        </div>
    </c:forEach>
</div>

<%--controls--%>
<div id="dashboardControlsPlaceHolder">
    <jsp:include page="/dashboard/${requestScope.viewModel.ajaxControllerURL}">
        <jsp:param name="action" value="getControlsPage" />
        <jsp:param name="clientKey" value="${clientKey}" />
    </jsp:include>
</div>