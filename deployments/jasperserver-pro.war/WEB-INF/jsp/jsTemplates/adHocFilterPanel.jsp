<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@ taglib prefix="spring" uri="/spring" %>

<script id="filterPodTemplate" type="text/template">
<%-- create filter row for each of the existing filters --%>
<ul class="list filters">
    <li class="leaf">
        <%-- complex filters are supported only for nonOLAP for now --%>
        {{ if (viewType != 'olap_crosstab') { }}
            <%@ include file="adHocFilterComplexPodTemplate.jsp" %>
        {{ } }}
    </li>
    {{ _.each(existingFilters, function(filter) { }}
        <li class="leaf">
            <%@ include file="adHocFilterPodTemplate.jsp" %>
        </li>
    {{ }); }}
</ul>
</script>