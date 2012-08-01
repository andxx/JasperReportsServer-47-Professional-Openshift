<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<div class="hidden">
    <%--content frame--%>
    <div id="contentFrameTemplate" class="componentContainer iframe">
        <div class="sizer diagonal"></div>
        <div class="overlay button"></div>
        <div class="floatingMenu">
            <button class="button action up" title="Refresh" id="refresh">
                <span class="wrap"><spring:message code="ADH_780_REFRESH"/><span class="icon"></span></span>
            </button>
            <button class="button action up" title="<spring:message code='DASHBOARD_OPEN_IN_A_NEW_WINDOW' javaScriptEscape='true'/>" id="open">
                <span class="wrap"><spring:message code="ADH_780_OPEN"/><span class="icon"></span></span>
            </button>
        </div>
        <div style="position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;">
            <c:if test="${isIPad}"><div id="iframeScroll_${frame.name}" class="swipeScroll"></c:if>

	        <iframe frameborder="0"
	                data-iframeLoaed="loading"
	                class="hidden"
                    scrolling="no"
	                marginwidth="0" marginheight="0">
	        </iframe>
            <c:if test="${isIPad}"></div></c:if>
        </div>
    </div>
</div>
