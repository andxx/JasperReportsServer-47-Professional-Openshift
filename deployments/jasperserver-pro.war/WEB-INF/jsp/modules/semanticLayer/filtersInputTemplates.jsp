<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<%-- Templates for Filter Value Editors --%>
<fieldset id="multipleValues" class="column two control pickWells hidden">
    <div class="control combo availableValues"
           title="<spring:message code='page.filters.filter.availableValues.title' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code="page.filters.filter.availableValues" javaScriptEscape="true" />:</span>
        <t:insertTemplate template="/WEB-INF/jsp/templates/control_searchLockup.jsp">
            <t:putAttribute name="inputID" value="mvSearchInput"/>
        </t:insertTemplate>
        <select multiple="multiple" class="availableValues button">
        </select>
        <span class="message warning"></span>
    </div>
    <label class="control select multiple selectedValues"
           title="<spring:message code='page.filters.filter.selectedValues.title' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code="page.filters.filter.selectedValues" javaScriptEscape="true"/>:</span>
        <select multiple="multiple" class="selectedValues button"></select>
        <span class="message warning"></span>
    </label>
</fieldset>

<fieldset id="comboValues" class="column two hidden">
    <div class="control combo">
        <span class="wrap"></span>
        <t:insertTemplate template="/WEB-INF/jsp/templates/control_searchLockup.jsp">
            <t:putAttribute name="inputID" value="comboSearchInput"/>
        </t:insertTemplate>
        <select class="">
            <option selected="selected" class="empty" title="null" value="null"></option>
        </select>
        <span class="message warning"></span>
    </div>
</fieldset>

<fieldset id="singleSelectValues" class="column two hidden">
    <label class="control select inline">
        <span class="wrap"><spring:message code="page.filters.filter.availableValues" javaScriptEscape="true" />:</span>
        <select></select>
        <span class="message warning"></span>
    </label>
</fieldset>

<fieldset id="stringValues" class="column two hidden">
    <label class="control input text">
        <span class="wrap"><spring:message code="page.filters.filter.value" javaScriptEscape="true" />:</span>
        <input class="" type="text" value=""/>
        <span class="message warning"></span>
    </label>
</fieldset>

<fieldset id="numberRangeValues" class="column two range hidden">
    <legend class="offLeft">
        <spring:message code='page.filters.filter.valueRange' javaScriptEscape='true'/>
    </legend>
    <label class="control input text" for="rangeValue_1"
           title="<spring:message code='page.filters.filter.lowerbound.title' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code='page.filters.filter.lowerbound' javaScriptEscape='true'/>:</span>
        <input class="" id="rangeValue_1" type="text"/>
        <span class="message warning"></span>
    </label>
    <label class="control input text" for="rangeValue_2"
           title="<spring:message code='page.filters.filter.upperbound.title' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code='page.filters.filter.upperbound' javaScriptEscape='true'/>:</span>
        <input class="" id="rangeValue_2" type="text"/>
        <span class="message warning"></span>
    </label>
</fieldset>


<fieldset id="dateValues" class="column two hidden">
    <label class="control picker" for="calendar_input"
           title="<spring:message code='page.filters.filter.calendarPicker' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code="page.filters.filter.value" javaScriptEscape="true" />:</span>
        <input type="text" onmousedown="cancelEventBubbling(event)" id="calendar_input">

        <span class="message warning"></span>
    </label>
</fieldset>

<fieldset id="dateRangeValues" class="column two range hidden">
    <legend class="offLeft"><spring:message code="page.filters.filter.valueRange" javaScriptEscape="true" /></legend>
    <label class="control picker" for="rangeValue_1" title="<spring:message code='page.filters.filter.lowerbound.title' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code='page.filters.filter.lowerbound' javaScriptEscape='true'/>:</span>
        <input class="" id="rangeValue_1" type="text" onmousedown="cancelEventBubbling(event)" value=""/>
        <span class="message warning"></span>
    </label>
    <label class="control picker" for="rangeValue_2" title="<spring:message code='page.filters.filter.upperbound.title' javaScriptEscape='true'/>">
        <span class="wrap"><spring:message code='page.filters.filter.upperbound' javaScriptEscape='true'/>:</span>
        <input class="" id="rangeValue_2" type="text" onmousedown="cancelEventBubbling(event)" value=""/>
        <span class="message warning"></span>
    </label>
</fieldset>

<fieldset id='fieldEditor' class="column one hidden">
    <span class="fieldName"></span>
    <label class="control select inline" for="comparison"
           title="<spring:message code='page.filters.filter.filterOperation' javaScriptEscape='true'/>">
        <span class="wrap offLeft">
            <spring:message code='page.filters.filter.filterOperation' javaScriptEscape='true'/>:
        </span>
        <select id="comparison">
        </select>
        <span class="message warning"></span>
    </label>
    <span class="fieldName"></span>
    <button id="swap" class="button options up">
        <span class="wrap"><spring:message code="page.filters.filter.swap" javaScriptEscape="true"/></span>
        <span class="icon"></span>
    </button>
</fieldset>