<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="spring" uri="/spring" %>
<%@ taglib uri="/WEB-INF/jasperserver.tld" prefix="js" %>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page errorPage="/WEB-INF/jsp/modules/system/errorPage.jsp" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.prototype.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-1.7.1.min.js"></script>
    <script type='text/javascript' src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-ui-1.8.20.custom.min.js"></script>
    <script type='text/javascript' src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-ui-timepicker-addon.js"></script>
    <script type='text/javascript' src="${pageContext.request.contextPath}/scripts/ext.utils.underscore.js"></script>
	<script type="text/javascript">
		jQuery.noConflict();
	</script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/jquery/js/jquery.urldecoder.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.nwmatcher.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.scriptaculous.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.touch.controller.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/utils.common.js"></script>

    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/core.layout.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/core.events.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/components.dialogs.js"></script>

    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/core.ajax.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/controls.base.js"></script>

    <c:if test="${isAdhocReportUnit == null || isAdhocReportUnit == 'false'}">
        <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/report.view.base.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/report.view.runtime.js"></script>
    </c:if>

    <%--styles for report--%>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/themes/reset.css" type="text/css" media="screen">
	<!-- Theme -->
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="theme.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="pages.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="containers.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="buttons.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="lists.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="controls.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="dataDisplays.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="pageSpecific.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="dialogSpecific.css"/>" type="text/css" media="screen,print"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="forPrint.css"/>" type="text/css" media="print"/>

    <link rel="stylesheet" href="${pageContext.request.contextPath}/scripts/jquery/theme/jquery.ui.theme.css" type="text/css" media="screen,print"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/scripts/jquery/theme/redmond/jquery-ui-1.8.20.custom.css" type="text/css" media="screen">
	
	<style type="text/css">
		/*
			Override body background color set in theme.css
		*/
		body {background:none;}
		.novis {visibility:hidden;}
	</style>    
    
	<script type="text/javascript" src="${pageContext.request.contextPath}/fusion/charts/FusionCharts.js"></script>
	<script type="text/javascript">
		var JRS = JRS || {};
		JRS.vars = {};
		JRS.fid = '${param.fid}';
    	function printRequest(){
    		if(parent.document.getElementById('fusioncharts_managed_print')) {
    			if(parent.getIEVersion() > 0 && parent.getIEVersion() < 9){
    				parent.requestBrowserUpdate();
    			} else {
        			window.parent.jQuery(parent).trigger('managed_print_request');
        			FusionCharts.printManager.enabled(true);
        	    	FusionCharts.addEventListener (FusionChartsEvents.PrintReadyStateChange ,function (identifier, parameter) {
        	            if(parameter.ready) {
        	                window.parent.jQuery(parent).trigger('chart_rendered');
        	            }
        	        });    				
    			}
    		}
    	}
        function FC_Rendered(DOMId){
            jQuery('#'+DOMId).hide().show();
        }
        jQuery(function(){
            if(window.parent.document.body.id == 'dashboardViewer' && window.parent.document.getElementById(JRS.fid).getAttribute('scrolling') == 'no') {
                document.body.style.overflow = 'hidden';
            }
        	if(isIPad()){
        		document.addEventListener('touchstart', function(e) { 			
        			if(window.parent.TouchController.proxy) {
        				window.parent.TouchController.proxy.onTouchStart(e);
        			}
        		}, false);
        		document.body.addEventListener('touchmove', function(e) {     			
        			if(window.parent.TouchController.proxy && e.touches.length == 1) {
        				window.parent.TouchController.proxy.onTouchMove(e);
        			}
        			e.preventDefault();
        		}, false);
        	}
        });
	</script>
	
	<!-- jasperreports scripts -->
	<script type='text/javascript' src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-ui-1.8.20.custom.min.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/reportresource?resource=net/sf/jasperreports/web/servlets/resources/jasperreports-global.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/jasperreports-reportViewerToolbar.js"></script>
    <script type='text/javascript'> jasperreports.global.APPLICATION_CONTEXT_PATH = "${pageContext.request.contextPath}";</script>

    <script type="text/javascript">
        var dashboardViewFrame = {};
        dashboardViewFrame.flowExecutionKey = '${flowExecutionKey}';
    </script>
</head>

<body class="body dashboardViewFrame">
<%--note: not using class hidden because it creates a padding--%>
<form style="display:none"  name="viewReportForm" action="<c:url value="flow.html"/>" method="post">
    <input class="hidden" type="hidden" name="pageIndex" value="${pageIndex}"/>
    <input class="hidden" type="hidden" name="_flowExecutionKey" value="${flowExecutionKey}"/>
</form>

<t:insertTemplate template="/WEB-INF/jsp/templates/nothingToDisplay.jsp">
    <t:putAttribute name="containerID" value="emptyReportID" />
    <t:putAttribute name="bodyContent">
        <p class="message emphasis">${reportUnitObject.label}</p>
        <p class="message">
            <%-- currently empty report message is set on server side - see ViewReportAction.runReport --%>
        </p>
    </t:putAttribute>
</t:insertTemplate>

<c:choose>
<c:when test="${false}">
<div id="reportContainer" class="novis" style="position:relative;"></div>
</c:when>
<c:otherwise>
<div id="reportContainer" class="" style="position:relative;">
    <c:if test="${isAdhocReportUnit != null && isAdhocReportUnit == 'true'}">
        <spring:message code="log.error.cannot.view.adhocReport"/>
        <script type="text/javascript">
            var frame = jQuery('#' + JRS.fid, window.parent.document);

            frame.removeClass('hidden').show();
            if (!isIPad()) {
                frame.parents('.iframe').css('background-image', 'none');
            }
        </script>
    </c:if>
</div>
</c:otherwise>
</c:choose>

</body>
</html>
