<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>

<!-- purpose of this jsp is simply to redirect to the Ad Hoc main editor page if you start the adhocFlow from repository
     this is so that refresh (or change mode) doesn't wipe out data -->
<script language="JavaScript" src="${pageContext.request.contextPath}/scripts/old_adhoc.base.js"></script>
<script>
// tbd...integrate this w/ renamed stuff in flow
window.onload = function() {
    this.location.href = '${pageContext.request.contextPath}/flow.html' +
        '?_flowId=adhocFlow' +
        '&_eventId=initForExistingReport' +
        '&_flowExecutionKey=${flowExecutionKey}' +
        '&viewReport=${viewReport}';
}
</script>
