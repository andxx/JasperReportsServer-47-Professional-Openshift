<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>

{{ var numericFilterDataType = filter.filterDataType === "Integer" || filter.filterDataType === "Decimal" || filter.filterDataType === "Long"; }}
{{ var dateTimeFilterDataType = filter.filterDataType === "Date" || filter.filterDataType === "Time" || filter.filterDataType === "Timestamp"; }}
{{ var minimized = filter.filterPodMinimized ? "minimized" : ""; }}

{{ if (filter.editable) { }}
<%-- determine what operation type is loaded --%>
{{
    var opName = filter.operatorName.toLowerCase();

    var filterType = "singleInput";

    if (_.indexOf(["in", "notin"], opName) >= 0) {
        var filterType = "multipleSelect";
    } else if (_.indexOf(["between", "notbetween"], opName) >= 0) {
        var filterType = "multipleInput";
    } else if ((_.indexOf(["equals", "notequal"], opName) >= 0) && !dateTimeFilterDataType && !numericFilterDataType) {
        var filterType = "singleSelect";
    } else if ("isanyvalue" === opName) {
        var filterType = "functionSelect";
    }
}}

{{ var hidden = _.indexOf(["multipleSelect", "functionSelect"], filterType) >= 0 ? "" : "hidden"; }}
{{ var filterIDprefix = (viewType === "olap_crosstab") ? filter.filterLabel : ""; }}
{{ var filterLetterPrefix = (viewType === "olap_crosstab") ? "" : filter.filterLetter + ". "; }}
{{ var filterIdWithPrefix = filterIDprefix + "Pod" + filter.filterId; }}

<%--filter pod--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
<tiles:putAttribute name="containerTitle" cascade="true" value="{{=filterLetterPrefix}}{{=filter.filterDisplayLabel}}"/>
<tiles:putAttribute name="containerID" cascade="true" value="{{=filterIdWithPrefix}}"/>
<tiles:putAttribute name="containerClass" value="panel pane filter {{=minimized}}"/>
<tiles:putAttribute name="containerAttributes" cascade="true">data-filterId={{=filter.filterId}} data-filterType={{=filterType}} data-fieldName='{{=filter.filterLabel}}' data-dataType={{=filter.filterDataType}} data-collapse={{=filter.filterPodMinimized}} data-editable={{=filter.editable}} data-filterUsed={{=filter.used}}</tiles:putAttribute>
<tiles:putAttribute name="headerContent">
    <button class="button disclosure noBubble"></button>
    <span class="button mutton"></span>
</tiles:putAttribute>
<tiles:putAttribute name="footerAttributes">style="z-index: -1;"</tiles:putAttribute>
<tiles:putAttribute name="bodyContent" cascade="true">
    <%--operation type --%>
    <fieldset id="{{=filterIdWithPrefix}}_filterOpsContainer" class="options">
        <legend  class="offLeft"><span><spring:message code="ADH_1216_DYNAMIC_FILTER_CONDITION"/></span></legend>
        <label class="control select" for="{{=filterIdWithPrefix}}_filterOps" title="Filter condition">
            <span class="wrap">Filter Condition:</span>
            <select id="{{=filterIdWithPrefix}}_filterOps"
                    onchange="return adHocFilterModule.onChangeForSelect('{{=filterIdWithPrefix}}_filterOps')"
                    class="single-select">
                {{ if (filter.filterDataType === "String") { }}
                    <option value="in" {{ if (opName === "in" || filterType === "functionSelect") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IN"/></option>
                    <option value="notin" {{ if (opName === "notin") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_IN"/></option>
                    <option value="equals" {{ if (opName === "equals") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual" {{ if (opName === "notequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                    {{ if (viewType !== "olap_crosstab") { }}
                        <option value="contains" {{ if (opName === "contains") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_CONTAINS"/></option>
                        <option value="notcontains" {{ if (opName === "notcontains") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_CONTAINS"/></option>
                        <option value="startsWith" {{ if (opName === "startswith") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_STARTS"/></option>
                        <option value="notstartsWith" {{ if (opName === "notstartswith") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_STARTS"/></option>
                        <option value="endsWith" {{ if (opName === "endswith") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_ENDS"/></option>
                        <option value="notendsWith" {{ if (opName === "notendswith") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_ENDS"/></option>
                    {{ } }}
                {{ } }}
                {{ if (numericFilterDataType) { }}
                    <option value="in" {{ if (opName === "in") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IN"/></option>
                    <option value="notin" {{ if (opName === "notin") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_IN"/></option>
                    <option value="equals_n" {{ if (opName === "equals") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual_n" {{ if (opName === "notequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                    <option value="greater" {{ if (opName === "greater") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_GREATER"/></option>
                    <option value="less" {{ if (opName === "less") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_LESS"/></option>
                    <option value="greaterOrEqual" {{ if (opName === "greaterorequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_GREATER_OR_EQUAL"/></option>
                    <option value="lessOrEqual" {{ if (opName === "lessorequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_LESS_OR_EQUAL"/></option>
                    <option value="between" {{ if (opName === "between" || filterType === "functionSelect") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_BETWEEN"/></option>
                    <option value="notBetween" {{ if (opName === "notbetween") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_BETWEEN"/></option>
                {{ } }}
                {{ if (dateTimeFilterDataType) { }}
                    <option value="equals_d" {{ if (opName === "equals") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual_d" {{ if (opName === "notequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                    <option value="greater" {{ if (opName === "greater") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_AFTER"/></option>
                    <option value="less" {{ if (opName === "less") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_BEFORE"/></option>
                    <option value="greaterOrEqual" {{ if (opName === "greaterorequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_ON_OR_AFTER"/></option>
                    <option value="lessOrEqual" {{ if (opName === "lessorequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_ON_OR_BEFORE"/></option>
                    <option value="between" {{ if (opName === "between" || filterType === "functionSelect") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_BETWEEN"/></option>
                    <option value="notBetween" {{ if (opName === "notbetween") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_BETWEEN"/></option>
                {{ } }}
                {{ if (filter.filterDataType === "Boolean") { }}
                    <option value="in" {{ if (opName === "in") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IN"/></option>
                    <option value="notin" {{ if (opName === "notin") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_IN"/></option>
                    <option value="equals" {{ if (opName === "equals") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual" {{ if (opName === "notequal") { }} selected="selected" {{ } }}><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                {{ } }}
            </select>
        </label>
    </fieldset>

    <%--this is for multiselect operations--%>
    {{ if (filterType === "multipleSelect" || (filterType === "functionSelect" && _.indexOf(["String", "Boolean"], filter.filterDataType) >= 0)) { }}
        <fieldset id="{{=filterIdWithPrefix}}_filterInputContainer" class="values">
            <label class="control select multiple" for="{{=filterIdWithPrefix}}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                <span class="wrap">Value:</span>
                <select id="{{=filterIdWithPrefix}}_filterInput"
                        onchange="return adHocFilterModule.onChangeForSelect('{{=filterIdWithPrefix}}_filterInput')"
                        multiple="multiple">
                    {{ if (viewType === "olap_crosstab") { }}
                        {{ _.each(filter.possibleValueMapKeys, function(key) { }}
                            <%-- key and value should be escaped to correctly handle special characters like quote etc. --%>
                            <option value="{{=key}}" title="{{=filter.possibleValueMap[key]}}" {{ if (_.indexOf(filter.filterValue, key) >= 0) { }} selected="selected" {{ } }}>
                                    {{=filter.possibleValueMap[key]}}
                            </option>
                        {{ }); }}
                    {{ } }}
                    {{ if (viewType !== "olap_crosstab") { }}
                        {{ _.each(filter.possibleValues, function(value) { }}
                            <%-- value should be escaped to allow special characters like quote etc. --%>
                            <option value="{{=value}}" title="{{=value}}"
                                {{ if (opName === "isanyvalue" || _.indexOf(filter.filterValue, value) >= 0) { }} selected="selected" {{ } }}>
                                    {{=value}}
                            </option>
                        {{ }); }}
                    {{ } }}
                </select>
                <div class="sizer vertical hidden"><span class="ui-icon ui-icon-grip-solid-horizontal"></span></div>
            </label>
        </fieldset>
    {{ } }}


    <%--this is for multiple input operations--%>
    {{ if (filterType === "multipleInput" || (filterType === "functionSelect" && (dateTimeFilterDataType || numericFilterDataType))) { }}
        <fieldset id="{{=filterIdWithPrefix}}_filterInputContainer" class="values">
            {{ if (filter.filterDataType === "Date") { }}
                <label class="control picker" for="{{=filterIdWithPrefix}}_filterInput" title="Calendar picker">
            {{ } else { }}
                <label class="control input text" for="{{=filterIdWithPrefix}}_filterInput"
                       title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
            {{ } }}
                    <span class="wrap">From:</span>
                    {{ if (filter.filterDataType === "Date") { }}
                        <input id="{{=filterIdWithPrefix}}_filterInput" class=""
                               type="text"
                               onchange="return adHocFilterModule.onChangeForDateInput('{{=filterIdWithPrefix}}')"
                               value="{{=filter.filterValue[0]}}"/>
                    {{ } else { }}
                        <input id="{{=filterIdWithPrefix}}_filterInput"
                            onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                            class=""
                            type="text"
                            value="{{=filter.filterValue[0]}}"/>
                    {{ } }}
                    <span class="message warning"><spring:message code="ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR"/></span>
                </label>

                {{ if (filter.filterDataType === "Date") { }}
                    <label class="control picker" for="{{=filterIdWithPrefix}}_filterInput2" title="Calendar picker">
                {{ } else { }}
                    <label class="control input text" for="{{=filterIdWithPrefix}}_filterInput2" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                {{ } }}
                        <span class="wrap">From:</span>

                        {{ if (filter.filterDataType === "Date") { }}
                            <input id="{{=filterIdWithPrefix}}_filterInput2" class=""
                                   type="text"
                                   onchange="return adHocFilterModule.onChangeForDateInput('{{=filterIdWithPrefix}}')"
                                   value="{{=filter.filterValue[1]}}"/>
                        {{ } else { }}
                            <input id="{{=filterIdWithPrefix}}_filterInput2"
                                onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                                onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                                class=""
                                type="text"
                                value="{{=filter.filterValue[1]}}"/>
                        {{ } }}
                        <span class="message warning"><spring:message code="ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR"/></span>
                    </label>

        </fieldset>
    {{ } }}


    <%--this is for single select operations--%>
    {{ if (filterType === "singleSelect") { }}
        <fieldset id="{{=filterIdWithPrefix}}_filterInputContainer" class="values">
            <label class="control select" for="{{=filterIdWithPrefix}}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                <span class="wrap">Value:</span>
                <select id="{{=filterIdWithPrefix}}_filterInput"
                         onchange="return adHocFilterModule.onChangeForSelect('{{=filterIdWithPrefix}}_filterInput')"
                         class="single-select">
                    {{ if (viewType === "olap_crosstab") { }}
                        {{ _.each(filter.possibleValueMapKeys, function(key) { }}
                            <%-- key and value should be escaped to correctly handle special characters like quote etc. --%>
                            <option value="{{=key}}" title="{{=filter.possibleValueMap[key]}}"
                                    {{ if (_.indexOf(filter.filterValue, key) >= 0) { }}
                                        selected="selected"
                                    {{ } }}>
                                    {{=filter.possibleValueMap[key]}}
                            </option>
                        {{ }); }}
                    {{ } }}
                    {{ if (viewType !== "olap_crosstab") { }}
                        {{ _.each(filter.possibleValues, function(value) { }}
                            <%-- value should be escaped to allow special characters like quote etc. --%>
                            <option value="{{=value}}" title="{{=value}}"
                                {{ if (_.indexOf(filter.filterValue, value) >= 0) { }}
                                    selected="selected"
                                {{ } }}>
                                    {{=value}}
                            </option>
                        {{ }); }}
                    {{ } }}
                </select>
            </label>
        </fieldset>
    {{ } }}


    <%--this is for single input--%>
    {{ if (filterType === "singleInput") { }}
        <fieldset id="{{=filterIdWithPrefix}}_filterInputContainer" class="values">
            {{ if (filter.filterDataType === "Date") { }}
                <label class="control picker" for="{{=filterIdWithPrefix}}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
            {{ } else { }}
                <label class="control input text" for="{{=filterIdWithPrefix}}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
            {{ } }}
                    <span class="wrap">Value:</span>
                    {{ if (filter.filterDataType === "Date") { }}
                        <input id="{{=filterIdWithPrefix}}_filterInput" class=""
                            type="text"
                            onchange="return adHocFilterModule.onChangeForDateInput('{{=filterIdWithPrefix}}')"
                            onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                            value="{{=filter.filterValue[0]}}"/>
                    {{ } else { }}
                        <input id="{{=filterIdWithPrefix}}_filterInput"
                            onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                            class=""
                            type="text"
                            value="{{=filter.filterValue[0]}}"/>
                    {{ } }}
                    <span class="message warning"><spring:message code="ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR"/></span>
                </label>
        </fieldset>
    {{ } }}


    <%--this is for the all option tag--%>
    <fieldset id="{{=filterIdWithPrefix}}_allOption" class="all {{=hidden}}">
        <div class="control checkBox">
        <label class="wrap" for="{{=filterIdWithPrefix}}_All" title="Check to select all values">
            <spring:message code="ADH_1202_DYNAMIC_FILTER_ALL_OPTION"/>
        </label>
            <input type="checkbox" name="{{=filterIdWithPrefix}}_All"
                   value="All"
                   id="{{=filterIdWithPrefix}}_all" class=""
                   {{ if (opName === "isanyvalue") { }}
                        checked="checked"
                   {{ } }}/>
        </div>
    </fieldset>
</tiles:putAttribute>
</tiles:insertTemplate>

<%--complex and uneditable filters--%>
{{ } else { }}
    {{ if (viewType === "olap_crosstab") {
        var isComplex = filter.filterLabel.toLowerCase() === "complex";
        var footerAttributes = "style='z-index: -1;'";
        var filterTitle = isComplex ? "<spring:message code="ADH_1213_DYNAMIC_FILTER_ADVANCED_SELECTION"/>" : filter.filterDisplayLabel;
       } else {
            <%-- map filter source to message code (see SubFilter.Source Java enum for the values this can take) --%>
           var filterLabelMessage = "<spring:message code="ADH_1215_DYNAMIC_FILTER_UNEDITABLE_TITLE"/>";
           if (filter.source === "SLICE_COMPLEX_KEEPONLY") {
              var filterLabelMessage = "<spring:message code="ADH_1208_DYNAMIC_FILTER_KEEP"/>";
           } else if (filter.source === "SLICE_COMPLEX_EXCLUDE") {
              var filterLabelMessage = "<spring:message code="ADH_1209_DYNAMIC_FILTER_EXCLUDE"/>";
           }

        var filterTitle = filter.filterLetter + ". " + filterLabelMessage;
        var footerAttributes = "";
        var filterIdWithPrefix = (viewType === "olap_crosstab") ? filter.filterLabel : "" + "Pod" + filter.filterId;
    } }}

    <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
        <tiles:putAttribute name="containerTitle" value="{{=filterTitle}}"/>
        <tiles:putAttribute name="containerID" cascade="true" value="{{=filterIdWithPrefix}}"/>
        <tiles:putAttribute name="containerClass" value="panel pane filter"/>
        <tiles:putAttribute name="containerAttributes" cascade="true">data-filterId={{=filter.filterId}} data-filterType={{=filterType}} data-fieldName='{{=filter.filterLabel}}' data-collapse={{=filter.filterPodMinimized}} data-editable={{=filter.editable}} data-filterUsed={{=filter.used}}</tiles:putAttribute>
        <tiles:putAttribute name="headerContent">
            <button class="button disclosure noBubble"></button>
            <span class="button mutton"></span>
        </tiles:putAttribute>
        <tiles:putAttribute name="footerAttributes">{{=footerAttributes}}</tiles:putAttribute>
        <tiles:putAttribute name="bodyContent">
            <fieldset class="values">
                {{ if (isComplex || viewType !== "olap_crosstab") { }}
                    <ul class="message">
                        {{ if (filter.filterDisplayLabel) }}
                             <li>{{=filter.filterDisplayLabel}}</li>
                        {{ if (filter.variableNames) { }}
                            {{ _.each(filter.variableNames, function(value) { }}
                                <li>{{=value}}</li>
                            {{ }); }}
                        {{ } }}
                        {{ if (!filter.variableNames) { }}
                            <li>{{=filter.filterDisplayLabel}}</li>
                        {{ } }}
                    </ul>
                    <p class="message"><spring:message code="ADH_1215_DYNAMIC_FILTER_ADVANCED_INFO"/></p>
                {{ } else { }}
                    <p class="message">{{=filter.expressionAsString}}</p>
                    <p class="message"><spring:message code="ADH_1215_DYNAMIC_FILTER_UNEDITABLE_INFO"/></p>
                {{ } }}
            </fieldset>
        </tiles:putAttribute>
    </tiles:insertTemplate>
{{ } }}
