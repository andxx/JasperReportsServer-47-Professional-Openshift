<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<th
    class="{{=_headerClass}}"
    id="{{=_id}}"
    data-level="{{-_levelName}}"
    data-dimension="{{-_dimensionName}}"
    data-expanable="{{=_isExpandable}}"
    {{ if (_rowspan !== null) { }}
        rowspan="{{=_rowspan}}"
    {{ } }}
    {{ if (_colspan !== null) { }}
        colspan="{{=_colspan}}"
    {{ } }}>
    {{ if (_isExpandable) { }}
        <span class="button disclosure icon {{_isLevelExpanded ? print('open') : print('closed');}}"></span>
    {{ } }}

    {{-_cellContent}}
</th>
