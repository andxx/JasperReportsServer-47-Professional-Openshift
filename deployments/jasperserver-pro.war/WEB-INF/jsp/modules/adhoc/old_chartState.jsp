<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<script id="chartState" type="text/javascript" >

  localContext.fieldsInUse = ${viewModel.fieldsInUseJSON};

  localContext.type = '${viewModel.type}';
  localContext.canSave = ${viewModel.canSave};
  localContext.chartTitle = '${viewModel.chartTitle}';
  localContext.seriesEnabled = ${viewModel.seriesEnabled};
  localContext.hasGroup = ${viewModel.hasGroup};
  localContext.groupName = "${viewModel.groupLabel}";
  localContext.hasMeasures = ${viewModel.hasMeasures};
  localContext.firstMeasureDisplayName = "${viewModel.firstMeasureDisplayName}";
  localContext.numberOfMeasures = ${viewModel.numberOfMeasures};
  localContext.pageOrientation = '${viewModel.pageOrientation}';
  localContext.hasMargins = ${viewModel.hasMargins};
  localContext.paperSize = '${viewModel.paperSize}';
  localContext.chartWidth = ${viewModel.chartWidth};
  localContext.chartHeight = ${viewModel.chartHeight};
  localContext.chartX = ${viewModel.chartX};
  localContext.chartY = ${viewModel.chartY};
  localContext.availableChartWidth = ${viewModel.availableChartWidth};
  localContext.availableChartHeight = ${viewModel.availableChartHeight};

  //display option booleans
  localContext.displayLegend= ${viewModel.displayLegend};
  localContext.displayXAxis= ${viewModel.displayXAxisLabel};
  localContext.displayYAxis= ${viewModel.displayYAxisLabel};
  localContext.vertical= ${viewModel.vertical};

  //measure names
  ${viewModel.measureNamesAsJSArray}
  //chart measures to render
  ${viewModel.chartMeasuresArray}
  //chart items to render
  ${viewModel.chartItemsArray}
  // chart fns needed for rendering
  ${viewModel.chartFns}
  //function names
  ${viewModel.functionsAsJSArray}
  //masks
  ${viewModel.masksAsJSArray}
  //data types
  ${viewModel.dataTypesAsJSArray}
  //numeric?
  ${viewModel.isNumericAsJSArray}

  //legend dimensions
  ${viewModel.legendItemsAsJSMap}
  localContext.legendLeft= ${viewModel.legendLeft};
  localContext.legendTop= ${viewModel.legendTop};
  localContext.legendWidth= ${viewModel.legendWidth};
  localContext.legendHeight= ${viewModel.legendHeight};

  localContext.messages = {};
  localContext.messages['cantAddSet'] = '<spring:message code="ADH_109_CANT_ADD_SET" javaScriptEscape="true"/>';

</script>
