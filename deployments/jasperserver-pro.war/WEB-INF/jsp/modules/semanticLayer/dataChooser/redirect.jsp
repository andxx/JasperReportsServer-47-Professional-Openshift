<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>

<head></head>

<body>
<script type="text/javascript">
<c:choose>
<c:when test='${ParentFolderUri != null}'>
    document.location='flow.html?_flowId=searchFlow&lastMode=true';
</c:when>
<c:otherwise>
    document.location='flow.html?_flowId=queryBuilderFlow&_flowExecutionKey=${flowExecutionKey}&_eventId=finishWizard&selectedReportType=${reportType}&realm=${sessionScope['slReportUri']}';
</c:otherwise>
</c:choose>
</script>
</body>
