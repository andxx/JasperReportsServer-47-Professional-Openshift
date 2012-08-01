<%--
  ~ Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<script id="chartTemplate" type="text/template">
<table id="canvasTable"
       class="table wrapper default"
       style='width:{{=chartWidth}};border-width: 0px;border-style: none;height:{{=chartHeight}}'
       margins='{{=hasMargins}}'
       cellspacing="0">
    <tbody>
    <!-- title caption -->
    {{ if (titleBarShowing) { }}
    <caption class="caption" id="titleCaption">{{=title}}</caption>
    {{ } }}
    <tr>
        <td id='chart' width="{{=chartWidth}}" height="{{=chartHeight}}" style="background-color:transparent;">
            <div id="chartBorder" class="chartBorder" style="left:{{=chartX}}px;top:{{=chartY}}px">
                <img id='chart-image'
                     class="chartImgBorder"
                     alt="generated chart"
                     src='<%=request.getContextPath()%>/DisplayChart?filename={{=filename}}'
                     width="{{=chartWidth}}"
                     height="{{=chartHeight}}">
                <div class="sizer hidden"
                     id="dragger">
                </div>
            </div>
        </td>
    </tr>
    </tbody>
</table>
</script>