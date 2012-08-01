<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>

<script id="tableTemplate" type="text/template">
<c:if test="${!isIPad}">
<div id="canvasTableFrame" style="padding-right:100px;position:absolute;">
</c:if>
<table id="canvasTable"
       class="data table wrapper default"
       style="z-index:0; {{ if (!(table.columns.length > 0 || table.flattenedData.length > 0)) { print('border:none;'); } }}"
       cellspacing="0">
    <!-- title caption -->
    {{ if (titleBarShowing) { }}
        <caption class="caption" id="titleCaption" style="">
            {{ if (isWebKitEngine() || isIE7()) { }}
            <div style="position:relative;text-align:left;">
                <div style="position:absolute;margin:auto;text-align:center;min-width:100%;">{{=title}}</div>
            </div>
            {{ } else {}}
                {{=title}}
            {{ } }}
        </caption>
    {{ } }}
    <!-- START: Column Stakes -->
    <colgroup id='canvasTableCols'>
        {{ _.each(table.columns, function(column) { }}
            <col style="width:{{=column.width}}px;">
        {{ }); }}
    </colgroup>
    <!-- END: Column Stakes -->

    <!-- START: Column Headers -->
    <tr  class="labels column" id='columnHeaderRow'>
        {{ _.each(table.columnHeaderRow.members, function(member, index) { }}
            <th data-type="{{=table.columns[index].numericType}}"
                data-mask='{{=table.columns[index].mask}}'
                class="label {{ if (member.isEmpty || member.isSpacer) {print('deletedHeader');} else {member.isNumeric ? print('numeric') : print('');} }}"
                data-fieldName="{{ if (member.isSpacer) { print(table.columns[index].type); } else { print(table.columns[index].name);} }}"
                data-fieldDisplay="{{=table.columns[index].defaultDisplayName}}"
                data-label="{{=member.formattedContent}}"
                data-index="{{=index}}"
                style="min-width:{{=table.columns[index].width}}px;">
                {{ if (!member.isEmpty || member.isSpacer) { }}
                <span class="wrap">{{=_.unescapeHTML(member.formattedContent)}}</span>
                {{ } else { }}
                {{=table.columns[index].name}}
                {{ } }}
            </th>
        {{ }); }}
    </tr>
    <!-- END: Column Headers -->
    <!-- START: Group and Rows-->
    {{ if (!hasNoData) { }}
        <%@ include file="tableRows.jsp" %>
    {{ } }}
</table>
<c:if test="${!isIPad}">
</div>
</c:if>
</script>
