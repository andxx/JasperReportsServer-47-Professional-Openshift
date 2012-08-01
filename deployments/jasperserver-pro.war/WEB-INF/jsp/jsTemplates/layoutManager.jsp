<%--
  ~ Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<script id="tableLayoutManagerTemplate" type="text/template">
    {{ _.each(data, function(level) { }}
        <li class="level button {{= level.axisClass}} {{= level.itemClass}}" fieldname="{{= level.name}}" style="z-index: 800">
            <a href="#" class="level wrap" title="{{- level.title}}">{{= level.title}}</a>
            <span class="icon remove"></span>
        </li>
    {{ }); }}
</script>

<script id="chartLayoutManagerTemplate" type="text/template">
    {{ _.each(data, function(level) { }}
    <li class="level button {{= level.axisClass}} {{= level.itemClass}}" fieldname="{{= level.name}}" style="z-index: 800">
        <a href="#" class="level wrap" title="{{- level.title}}">{{= level.title}}</a>
        <span class="icon remove"></span>
    </li>
    {{ }); }}
</script>

<script id="crosstabLayoutManagerTemplate" type="text/template">
    {{ _.each(data, function(group) { }}
        <li class="{{= group.liClass}} draggable" data-dimension="{{- group.groupId}}" style="z-index: 800">
            {{= group.measureHandle}}
            <span class='title'>{{= group.groupId}}</span>
            <ul class="{{= group.ulClass}}">
                {{ _.each(group.levels, function(level) { }}
                    <li id="{{= level.id}}" class='{{= level.levelClass}} button' style='z-index: 800;' data-level='{{- level.name}}' data-dimension='{{- level.groupId}}'>
                        <a href='#' class='wrap' title="{{= level.label}}">{{- level.label}}</a>
                        <span class='icon remove'></span>
                    </li>
                {{ }); }}
            </ul>
        </li>
    {{ }); }}
</script>