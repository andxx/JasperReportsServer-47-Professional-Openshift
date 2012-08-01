<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

{{
var currentColumnDimension = "";
var varoddColumnClass = "odd";
var currentRowDimension ="";
var oddRowClass ="odd";

var totalsColSpanIndex = -1;
var measuresHeaderLabel = adhocDesigner.getMessage("ADH_530_MEASURES");
}}

<%--iterate only if some real dimensions present in columns --%>
{{ if (hasConcreteColumnGroups) { }}
<%--perform iteration--%>
{{ _.each(crosstab.headerRows, function(headerRow, headerRowIndex) { }}
    {{ var currentColumnGroup = columnGroups[headerRowIndex];
       var isMeasureColumn = isMeasureInColumns && (measureIndex == headerRowIndex); }}

    <tr>
        <%-- determine odd/even dimension--%>
        {{ if (currentColumnDimension !== currentColumnGroup.dimensionName) {
            var oddColumnClass = oddColumnClass == 'odd' ? '' : 'odd';
            var currentColumnDimension = currentColumnGroup.dimensionName;
        } }}

        <%-- do not apply odd class if this is measure column--%>
        {{ var calculatedOddColumnClass = isMeasureColumn ? '' : oddColumnClass; }}

        <!-- pad on left if needed to easily distinguish beetween columns and rows on UI -->
        {{ if (numberOfRowGroups > 0 && rowGroupsPresent) { }}
            <th colspan="1" class="column-header-padding"></th>
            {{ if (numberOfRowGroups > 1) { }}
                <th colspan="1"  class="{{isMeasureColumn ? print('measure') : print('');}} level dummy {{=calculatedOddColumnClass}}"></th>
                {{ if (numberOfRowGroups > 2) { }}
                    <th colspan="{{print(numberOfRowGroups - 2)}}"  class="{{print(isMeasureColumn ? 'measure' : '')}} level dummy {{=calculatedOddColumnClass}}"></th>
                {{ } }}
            {{ } }}
        {{ } }}

        {{
            var _headerClass = (isMeasureColumn ? 'measure' : '') + " level column " + calculatedOddColumnClass;
            var _id = "colGroupLabelHeaderRow_" + headerRowIndex;
            var _levelName = currentColumnGroup.name;
            var _dimensionName = currentColumnGroup.dimensionName;
            var _isExpandable = currentColumnGroup.levelExpandable;
            var _isLevelExpanded = currentColumnGroup.levelExpanded;
            var _cellContent = isMeasureColumn ? measuresHeaderLabel : currentColumnGroup.displayName;
            var _colspan = null;
            var _rowspan = null;
        }}
        <%@ include file="crosstabGroupHeaderLabel.jsp"%>

        <%--include column group header labels--%>
        {{ if (hasConcreteColumnGroups) { }}
            <%@ include file="crosstabHeaderRowCells.jsp"%>
        {{ } }}
    </tr>
{{ });}}
{{ } }}

{{ if (rowGroupsPresent) { }}
<tr>
    {{ _.each(crosstab.rowGroups, function(rowGroup, rowGroupIndex) { }}
        {{ var isMeasureRow = !isMeasureInColumns && (measureIndex == rowGroupIndex); }}

        <%--determine odd/even dimension--%>
        {{ if (currentRowDimension !== rowGroup.dimensionName) {
            var oddRowClass = oddRowClass == 'odd' ? '' : 'odd';
            var currentRowDimension = rowGroup.dimensionName;
        } }}
        {{var calculatedOddRowClass = isMeasureRow ? '' : oddRowClass;}}

        {{var cellContent = rowGroup.displayName; }}
        {{var cellId = "rowGroupHeaderRowLabel_" + rowGroupIndex; }}

        {{
            var _headerClass = (isMeasureRow ? "measure" : "") + " level " + calculatedOddRowClass;
            var _id = cellId;
            var _levelName = rowGroup.name;
            var _dimensionName = rowGroup.dimensionName;
            var _isExpandable = rowGroup.levelExpandable;
            var _isLevelExpanded = rowGroup.levelExpanded;
            var _cellContent = isMeasureRow ? measuresHeaderLabel : cellContent;
            var _colspan = rowGroupIndex == 0 ? 2 : 1;
            var _rowspan = null;
        }}
        <%@ include file="crosstabGroupHeaderLabel.jsp"%>
    {{ });}}

    {{ _.each(crosstab.headerRows[numberOfColumnGroups - 1], function(rowGroup, index) { }}
        {{ if (index < safeNumberOfColumns || (totalsColSpanIndex > 0 && index >= totalsColSpanIndex)) { }}
            <th class="empty"></th>
        {{ } }}
    {{ });}}
</tr>
{{ } }}
