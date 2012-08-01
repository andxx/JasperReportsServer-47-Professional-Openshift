<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page import="com.jaspersoft.ji.license.LicenseManager" %>

<%@ taglib prefix="spring" uri="/spring" %>

<script type="text/javascript">
	isIPad() && jQuery('#frame').hide();

    loginBox._initVars = function(options) {
        this._baseInitVars(options);

        this._organizationId = options.organizationId;
        this._singleOrganization = options.singleOrganization;
    };

    loginBox._processTemplate = function() {
        this._baseProcessTemplate();

        this._organizationIdLabel = this._dom.select('label[for="orgId"]')[0];
        this._organizationIdInput = $('orgId');
    };

    loginBox.initialize = function(options) {
        this._baseInitialize(options);

        if (this._organizationId != 'null' || this._singleOrganization) {
            this._organizationIdLabel.addClassName("hidden");
            this._organizationIdInput.setValue(this._organizationId);
        }
    };


    document.observe('dom:loaded', function() {
        loginBox.initialize({
            showLocaleMessage: '<spring:message code="jsp.Login.link.showLocale" javaScriptEscape="true"/>',
            hideLocaleMessage: '<spring:message code="jsp.Login.link.hideLocale" javaScriptEscape="true"/>',
            allowUserPasswordChange: ${allowUserPasswordChange},
            changePasswordMessage: '<spring:message code="jsp.Login.link.changePassword" javaScriptEscape="true"/>',
            cancelPasswordMessage: '<spring:message code="jsp.Login.link.cancelPassword" javaScriptEscape="true"/>',
            passwordExpirationInDays: ${passwordExpirationInDays},
            nonEmptyPasswordMessage: '<spring:message code="jsp.Login.link.nonEmptyPassword" javaScriptEscape="true"/>',
            passwordNotMatchMessage: '<spring:message code="jsp.Login.link.passwordNotMatch" javaScriptEscape="true"/>',
            <%
                String warningMessage = (String)request.getSession().getAttribute(LicenseManager.LICENSE_WARNING);
                if (warningMessage != null && warningMessage.length() > 0 ) {
            %>
                    warningMessage: '<%= warningMessage %>',
            <%
                }
            %>
            organizationId: '<%=request.getParameter("orgId")%>',
            singleOrganization: <%=((Boolean)request.getSession().getAttribute("singleOrganization")).booleanValue()%>
        });
        
        if(isIPad()){
        	var orientation = window.orientation;
    	    switch(orientation){
    	        case 0:
    	        	jQuery('#welcome').get(0).style.webkitTransform = 'scale(0.8) translate3d(-60px,0,0)';
    	        	jQuery('h2.textAccent').css('font-size','14px').parent().css('width','39%');
    	        	jQuery('#copy').css('width','600px');
					jQuery('#loginForm').css({
    	        		left:'524px',
    	        		right: ''
    	        	});  	
    	        	break;  
    	        case 90:
    	        	jQuery('#welcome').get(0).style.webkitTransform = 'scale(1.0) translate3d(0,0,0)';
    	        	jQuery('h2.textAccent').css('font-size','16px').parent().css('width','46%');
    	        	jQuery('#copy').css('width','766px');
    	            break;
    	        case -90:
    	        	jQuery('#welcome').get(0).style.webkitTransform = 'scale(1.0) translate3d(0,0,0)';
    	        	jQuery('h2.textAccent').css('font-size','16px').parent().css('width','46%');
    	        	jQuery('#copy').css('width','766px');
    	            break;
    	    }     
			jQuery('#frame').show();
        	window.addEventListener('orientationchange',function(e){
        	    var orientation = window.orientation;
        	    switch(orientation){
        	        case 0:
        	        	jQuery('#welcome').get(0).style.webkitTransform = 'scale(0.75) translate3d(-60px,0,0)';
        	        	jQuery('h2.textAccent').css('font-size','14px').parent().css('width','39%');
        	        	jQuery('#copy').css('width','600px');
						jQuery('#loginForm').css({
							left:'524px',
							right: ''
						});  	
        	        	break;  
        	        case 90:
        	        	jQuery('#welcome').get(0).style.webkitTransform = 'scale(1.0) translate3d(0,0,0)';
        	        	jQuery('h2.textAccent').css('font-size','16px').parent().css('width','46%');
        	        	jQuery('#copy').css('width','766px');
						jQuery('#loginForm').css({
        	        		left:'',
        	        		right: '-10px'
        	        	});
        	            break;
        	        case -90:
        	        	jQuery('#welcome').get(0).style.webkitTransform = 'scale(1.0) translate3d(0,0,0)';
        	        	jQuery('h2.textAccent').css('font-size','16px').parent().css('width','46%');
        	        	jQuery('#copy').css('width','766px');
						jQuery('#loginForm').css({
        	        		left:'',
        	        		right: '-10px'
        	        	});
        	            break;
        	    }        		
        	})        	
        }
    });
</script>
