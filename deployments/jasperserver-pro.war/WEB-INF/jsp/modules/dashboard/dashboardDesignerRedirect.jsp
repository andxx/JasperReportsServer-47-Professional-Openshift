<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!--
The purpose of this jsp is simply to redirect to the same Dashboard instance flow but without the createNew param
This is so subsequent refreshes will not clobber data
-->

<script type="text/javascript">
//    url context
    var urlContext = "${pageContext.request.contextPath}";
//event fired on onload to cause redirect.
    window.onload = function() {
        this.location.href="${pageContext.request.contextPath}/flow.html?_flowId=dashboardDesignerFlow&clientKey=${clientKey}"
    }
</script>