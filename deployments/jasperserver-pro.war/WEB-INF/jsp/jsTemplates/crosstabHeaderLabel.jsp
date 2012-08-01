<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

{{ if (_isColumnHeader) { }}
<th
{{ } else { }}
<td
{{ } }}
    id="{{=_id}}"
    class="{{=_tclass}}"
    rowspan="{{=_rowspan}}"
    colspan="{{=_colspan}}"
    data-isSummaryHeader="{{=_isSummaryHeader}}"
    data-fieldValue="{{=_cellContent}}"
    data-sliceable="{{=_sliceable}}"
    data-expanable="{{=_isExpandable}}"
    data-path="{{=_path}}">
    {{ if (_isExpandable) { }}
        <span class="button disclosure icon {{ _expanded ? print('open') : print('closed'); }}"></span>
    {{ } }}
    {{ if (_canSort) { }}
        {{ var sortIcon = _sortStatus == 1 ? "ascending" : (_sortStatus == 2 ? "descending" : "natural"); }}
        <span title="<spring:message code="ADH_177_CLICK_TO_CHANGE_SORTING" javaScriptEscape="true"/>" class="icon button {{=sortIcon}}"></span>
    {{ } }}

    <%-- This check is made only for case when we receiving empty string from DB. We are trying to prevent escaping &NBSP; --%>
    <%-- Better solution will be NOT to convert empty strings and null values to &nbsp; in java, but make this in templates. --%>
    <%--{{ if (_cellContent === "&nbsp;") { }}
        &nbsp;
    {{ } else { }}--%>
        {{=_cellContent}}
    <%--{{ } }}--%>
{{ if (_isColumnHeader) { }}
</th>
{{ } else { }}
</td>
{{ } }}
