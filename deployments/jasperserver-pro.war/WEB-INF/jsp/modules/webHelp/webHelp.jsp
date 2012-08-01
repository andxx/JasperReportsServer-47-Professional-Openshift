<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<!--
 Utility for serving up Online Help Pages in a hosted environment
-->

<script type="text/javascript" >
    var webHelpModuleState = {};

    // Commented out because it is a work in progress. The architect will sort it out
    webHelpModuleState.contextMap = <%= WebHelpLookup.getInstance().getHelpContextMapAsJSON() %>;
    webHelpModuleState.hostURL = '<%= WebHelpLookup.getInstance().getHostURL() %>';
    webHelpModuleState.pagePrefix = '<%= WebHelpLookup.getInstance().getPagePrefix() %>';
</script>
