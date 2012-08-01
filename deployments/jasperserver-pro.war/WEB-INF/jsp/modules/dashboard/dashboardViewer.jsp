<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@ taglib uri="/spring" prefix="spring-cr"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="authz"%>

<c:if test='${!empty param.viewAsDashboardFrame}'>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
</c:if>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><%--<spring-cr:message code="dashboard.viewer.page.title"/> - --%>${requestScope.dashboardState.propertyMap.dashboardName}</t:putAttribute>
	<t:putAttribute name="headerContent">
	    <%--script dependencies--%>
    	<%@ include file="dashboardViewerScriptHeader.jsp"%>
	</t:putAttribute>				
    <t:putAttribute name="bodyID" value="dashboardViewer"/>
    <t:putAttribute name="bodyClass" value="oneColumn"/>


    <t:putAttribute name="bodyContent" >
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary"/>
            <t:putAttribute name="containerTitle"><%--<spring-cr:message code='ADH_700_DASHBOARD_VIEWER_TITLE'/> - --%>${requestScope.dashboardState.propertyMap.dashboardName}</t:putAttribute>

			<t:putAttribute name="headerID" value="dashboard_viewer_header"/>
			<%--
			<t:putAttribute name="headerControls" value=""/>
 			 --%>
            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="swipeScroll" value="${false}"/>
            <t:putAttribute name="bodyID" value="dashboardViewerFrame"/>
            <t:putAttribute name="bodyContent">

                <div id="sizeGuide" class="proportional">
                    <div class="sizer horizontal"></div>
                    <div class="sizer vertical"></div>
                    <div class="sizer diagonal"></div>

                    <c:if test="${requestScope.dashboardState.title != null}">
                        <div id="title" class="emphasis larger">
                            <c:out value="${requestScope.dashboardState.title}" escapeXml="false"/>
                        </div>
                    </c:if>
                </div>
                
                <!-- 
                	Following div is used to indicate to javascript that the dashboard is in
                	printing mode. Adding page dimmer.
                -->
                <c:if test="${param.JSprint != null}">
                <div id="fusioncharts_managed_print" style="display:none"></div>
                </c:if>
               	<div id="pageDimmer" class="dimmer hidden" style="z-index:900;"></div>
				<div id="managedPrintLoader" class="" style="display:none;text-align:center;background:#fff;position:relative;top:240px;z-index:9999;margin:auto;width:300px;height:120px;padding:8px;">
					<div id="animated_loading_bar"></div>
					<p style="padding:12px;">Charts are being processed for print... This may take several seconds.</p>
					<p style="padding:12px;">Thank you for your patience.</p>
				</div>
				
                <%--frames go here--%>
                <div id="dashboardFrameParent">
                    <%--content frames--%>
                    <c:forEach var="frame" items="${contentFrames}" varStatus="frameStatus">
                        <c:set var="isCustom" value="${(frame.resourceType == 'customResourceType') ? true : false}"/>
                        <c:set var="thisUrlContext" value="${isCustom ? '' : pageContext.request.contextPath}"/>
                        <c:set var="toolTip" value="${isCustom ? frame.source : frame.URI}"/>

                        <div id="contentFrameContainer_${frame.name}"
                             class="componentContainer iframe"
                             title="${toolTip}"
                             style="left:${frame.leftForRuntimeStyle};top:${frame.topForRuntimeStyle};width:${frame.widthForRuntimeStyle};height:${frame.heightForRuntimeStyle}">
                            <div class="sizer diagonal"></div>
                            <div id="containerOverlay_${frame.name}" class="overlay button"
                                 data-frameType="contentFrame"
                                 data-frameName="${frame.name}"
                                 data-iFrameID="contentFrame_${frame.name}"
                                 data-isCustom=${isCustom}>
                            </div>
                            <div class="floatingMenu">
                                <button class="button action up refresh" title="Refresh" id="refresh_${frame.name}">
                                    <span class="wrap"><spring-cr:message code="ADH_780_REFRESH"/><span class="icon"></span></span>
                                </button>
                                <c:if test="${frame.propertyMap.allowSeparateWindow}">
                                    <button class="button action up open" title="<spring:message code='DASHBOARD_OPEN_IN_A_NEW_WINDOW' javaScriptEscape='true'/>" id="open_${frame.name}">
                                        <span class="wrap"><spring-cr:message code="ADH_780_OPEN"/><span class="icon"></span></span>
                                    </button>
                                </c:if>
                            </div>
                            <div style="position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;">

                                <iframe id="contentFrame_${frame.name}"
                                        frameborder="0"
                                        <%--src="${pageContext.request.contextPath}/blank.htm"--%>
                                        src=""
                                        class="hidden"
                                        marginwidth="0"
                                        marginheight="0"
                                        onload="localContext._updateIFrameLoadingStatus('containerOverlay_${frame.name}');"
                                        scrolling="${frame.scrollingStyle == 'auto' ? "yes" : "no"}"
                                        style="overflow: ${frame.scrollingStyle}">
                                </iframe>
                            
                            </div>
                        </div>
                    </c:forEach>

                    <%--text control frames--%>
                    <c:forEach var="frame" items="${textFrames}" varStatus="frameStatus">
                        <div id="textFrameContainer_${frame.name}"
                             class="componentContainer control displayText label"
                             style="font-size:${frame.textFontSize}px;line-height:${frame.textFontSize}px;width:${frame.widthForRuntimeStyle};height:${frame.heightForRuntimeStyle};left:${frame.leftForRuntimeStyle};top:${frame.topForRuntimeStyle}">
                            <div id="textFrameOverlay_${frame.name}"
                                 data-frameType="textFrame"
                                 data-frameName="${frame.name}"
                                 class="overlay button"></div>
                            <div class="read">${frame.textLabel}</div>
                            <input class="edit" type="text" value="${fn:escapeXml(frame.textLabel)}"/>
                        </div>
                    </c:forEach>

                    <%--clickable buttons (currently print, submit and reset--%>
                    <c:forEach  var="frame" items="${clickableFrames}" varStatus="frameStatus">
                        <div id="clickableFrameContainer_${frame.name}"
                             class="componentContainer control actionButton"
                             style="left:${frame.leftForRuntimeStyle};top:${frame.topForRuntimeStyle}">
                            <div class="overlay button"
                                 id="clickableFrameOverlay_${frame.name}"
                                 data-id="${frame.id}"
                                 data-resizeable="false"
                                 data-frameType="clickableFrame"
                                 data-frameName="${frame.name}"></div>
                            <button id="button_${frame.id}"
                                    class="button action">
                                <c:choose>
                                    <c:when test="${frame.id eq 'submit'}">
                                        <span class="wrap"><spring-cr:message code='ADH_770a_BUTTON_SUBMIT' javaScriptEscape='true'/></span>
                                    </c:when>
                                    <c:when test="${frame.id eq 'reset'}">
                                        <span class="wrap"><spring-cr:message code='ADH_770b_BUTTON_RESET' javaScriptEscape='true'/></span>
                                    </c:when>
                                    <c:when test="${frame.id eq 'print'}">
                                        <span class="wrap"><spring-cr:message code='ADH_770c_BUTTON_PRINT' javaScriptEscape='true'/></span>
                                    </c:when>
                                </c:choose>
                                <span class="icon"></span>
                            </button>
                        </div>
                    </c:forEach>

                    <%--input controls --%>
                    <c:forEach var="frame" items="${controlFrames}" varStatus="frameStatus">
                        <c:set var="dashboardParameter" scope="page" value="${dashboardParameters[frame.paramName]}"/>
                        <c:set var="frameLeft" value="${frame.leftForRuntimeStyle}"/>
                        <c:set var="frameTop" value="${frame.topForRuntimeStyle}"/>
                        <%@ include file="dashboardDesignerInputControlGenerator.jsp" %>
                    </c:forEach>
                </div>
            </t:putAttribute>
            <t:putAttribute name="footerContent">
            </t:putAttribute>
        </t:insertTemplate>

    </t:putAttribute>

</t:insertTemplate>
