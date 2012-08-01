<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<script type="text/javascript" id="crosstabState">
    (function (exports) {
        exports.crosstabState = {
            rowGroups : ${viewModel.rowDimensionsJSON},
            columnGroups : ${viewModel.columnDimensionsJSON},
            hideEmptyRows : '${viewModel.hideEmptyRows}',
            showDisplayManager : ${viewModel.showDisplayManager},
            messages: {}
        };

        exports.crosstabState.messages["addMeasures"] = '<spring:message code="ADH_1213_CROSSTAB_LEVEL_ADD_MEASURES" javaScriptEscape="true"/>';
        exports.crosstabState.messages["addLevels"] = '<spring:message code="ADH_1213_CROSSTAB_LEVEL_ADD_LEVELS" javaScriptEscape="true"/>';
        exports.crosstabState.messages["defaultCaptionTitle"] = '<spring:message code="ADH_113_REPORT_SELECTOR" javaScriptEscape="true"/>';
        exports.crosstabState.queryStatus = '${viewModel.queryStatus}';

        exports.localContext.fieldsInUse = ${viewModel.fieldsInUseJSON};
        exports.localContext.hasConcreteRowGroups = ${viewModel.hasConcreteRowGroups};
        exports.localContext.hasConcreteColumnGroups = ${viewModel.hasConcreteColumnGroups};
        exports.localContext.hasMeasures = ${viewModel.hasMeasures};
        exports.localContext.numberOfRowGroups = ${viewModel.numberOfRowGroups};
        exports.localContext.numberOfColumnGroups = ${viewModel.numberOfColumnGroups};
        exports.localContext.rowGroupsWithCollapsedNodes = ${viewModel.rowGroupsWithCollapsedNodeJSON};
        exports.localContext.columnGroupsWithCollapsedNode = ${viewModel.columnGroupsWithCollapsedNodeJSON};
        exports.localContext.measures = ${viewModel.measuresJSON};
        exports.localContext.columnGroups = ${viewModel.columnGroupsJSON};
        exports.localContext.rowGroups = ${viewModel.rowGroupsJSON};
        exports.localContext.showLabels = ${viewModel.showLabels};
        exports.localContext.rowNodeList = [ <c:forEach var="node" items="${viewModel.rowNodeSet}">"${node.path}",</c:forEach> ];
        exports.localContext.columnNodeList = [ <c:forEach var="node" items="${viewModel.columnNodeSet}">"${node.path}",</c:forEach> ];
        <c:set var="props" value="${viewModel.propertyMap}"/>
        <c:set var="dataRows" value="${props['dataRows']}"/>
        <c:if test="${empty dataRows}">
        <c:set var="dataRows" value="0"/>
        </c:if>

        exports.localContext.dataRows = ${dataRows};
        exports.localContext.hasNoData = ${dataRows == 0};
    })(window);
</script>
