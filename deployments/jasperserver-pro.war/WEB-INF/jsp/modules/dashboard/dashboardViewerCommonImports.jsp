<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="overrides_custom.css"/>" type="text/css" media="screen"/>--%>

<!-- These resources only needed for dash in dash -->
<c:if test='${!empty param.viewAsDashboardFrame}'> 
	<link rel="stylesheet" href="${pageContext.request.contextPath}/themes/reset.css" type="text/css" media="screen">	
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="buttons.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="controls.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="pageSpecific.css"/>" type="text/css" media="screen,print"/>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="dialogSpecific.css"/>" type="text/css" media="screen,print"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/scripts/jquery/theme/jquery.ui.theme.css" type="text/css" media="screen,print"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/scripts/jquery/theme/redmond/jquery-ui-1.8.20.custom.css" type="text/css" media="screen">


    <!--[if IE]>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/<spring:theme code="overrides_ie.css"/>" type="text/css" media="screen"/>
<![endif]-->
	
	<style type="text/css">
		body {background:#fff;}
		.hidden {display:none;}
		.column.decorated.primary {border:none;border-radius:0;}
		.column.decorated.primary>.corner,
		.column.decorated.primary>.edge,
		.column.decorated.primary>.content>.header,
		.column.decorated.primary>.content>.footer {
			display:none !important;
		}
		
		.column.decorated.primary,
		.column.decorated.primary>.content,
	    .column.decorated.primary>.content>.body {
			top:0;
			bottom:0;
			left:0;
			right:0;
			margin:0;
		}
		
		#display {overflow: visible;}

		#pageDimmer {
			position: absolute;
			top:0;
			left:0;
			right:0;
			bottom: 0;
			background-color: #000;
			opacity:.6;
		}

		@media print {
			.floatingMenuContainer {
    			display:none;
			}
			#button_print {
				display:none;
			}
		}
	</style>

	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.prototype.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-1.7.1.min.js"></script>
    <script type='text/javascript' src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-ui-1.8.20.custom.min.js"></script>
    <script type='text/javascript' src="${pageContext.request.contextPath}/scripts/jquery/js/jquery-ui-timepicker-addon.js"></script>
	<script type="text/javascript">
		jQuery.noConflict();
	</script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.underscore.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.nwmatcher.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.scriptaculous.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/ext.utils.touch.controller.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/utils.common.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/core.layout.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/core.events.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/core.ajax.js"></script>
	<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/list.base.js'></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/components.dialogs.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/report.view.base.js"></script>
	<script type="text/javascript">
		var JRS = JRS || {};
		JRS.number_of_charts = 0;
		JRS.charts_rendered = 0;
		
    	jQuery(function(){
    		/*
    			Enlarge text container frame by 3px:
    		*/
    		jQuery('div[id^="textFrameContainer_text_"]').each(function(){
    			var it = jQuery(this);
    			var ov = it.width();
    			it.css('width',ov+3+'px');
    		});
    		/*
    			Wait for all charts to be rendered by FusionCharts managed print then remove modal window:
    		*/
    		jQuery(window).bind('chart_rendered',function(){
    			JRS.charts_rendered++;
    			if(JRS.charts_rendered == JRS.number_of_charts){
    				jQuery('#managedPrintLoader').hide();
    				pageDimmer.hide();
    				alert('Page is ready to print.');
    			}
    		});

    		/*
    			If there are Fusion Charts to be rendered show modal window. Track number of 
    			Fusion Charts to be rendered.
    		*/
    		jQuery(window).bind('managed_print_request',function(){
    			JRS.number_of_charts++;
    			pageDimmer.show();
    			jQuery('#managedPrintLoader').show();    			
    		})
    	});
    	
    	function requestBrowserUpdate(){
    		if(JRS.number_of_charts == 0){
    			alert('To print our Flash based charts please update to a HTML5 capable browser such as IE9.');
    		}
    		JRS.number_of_charts++;
    	}
	</script>
    <%--Dynarch Caleandar Picker--%>
    <%--<jsp:include page="/cal/calendar.jsp" flush="true"/>--%>
</c:if>

<%-- common input control imports --%>
<jsp:include page="../inputControls/commonInputControlsImports.jsp" />

<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/controls.dashboard.runtime.js'></script>

<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/designer.base.js"></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/dashboard.runtime.js'></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/utils.dateFormatter.js"></script>
