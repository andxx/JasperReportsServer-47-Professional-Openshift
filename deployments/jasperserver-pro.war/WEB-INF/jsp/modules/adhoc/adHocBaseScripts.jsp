<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/domain.base.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/domain.components.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/domain.chooser.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/domain.chooser.fields.js'></script>

<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/components.dependent.dialog.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/designer.base.js'></script>
<!--
	JIF2 Adhoc Designer 
 -->
<jsp:include page="../../scripts/adhoc/table.jsp"/>
<jsp:include page="../../scripts/adhoc/crosstab.jsp"/>
<jsp:include page="../../scripts/adhoc/chart.jsp"/>
<jsp:include page="../../scripts/adhoc/designer.jsp"/>

<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/adhoc/designer.filter.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/adhoc/designer.filter.events.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/adhoc/designer.filter.complex.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/adhoc/designer.calculatedFields.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/adhoc/designer.sort.js"></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/adhoc/designer.reentrant.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/adhoc/designer.obsolete.js'></script>

<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/adhoc/designer.dragdrop.extra.js"></script>

<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/org.rootObjectModifier.js'></script>

<%--Apply input controls--%>
<jsp:include page="../inputControls/commonInputControlsImports.jsp" />

<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/controls.adhoc.js"></script>

<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/adhoc/designer.contextmenu.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/adhoc/worksheet.js'></script>
<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/adhoc/crosstab.multiselect.js'></script>

<script type="text/javascript" src='${pageContext.request.contextPath}/scripts/dialog.definitions.js'></script>

<script type="text/javascript">
	jQuery(function(){
		adhocDesigner.run("${viewModel.viewType}");
	})
</script>
