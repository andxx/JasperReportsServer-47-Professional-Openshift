<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<script id="calcFieldsTemplate" type="text/template">
<ul id="calculatedFieldOptions" class="list inputSet">
    <%--number calculations--%>
    {{ if (formulaCalcType === "singleField") { }}
        <li id="basicFunctions" class="node">
            <p class="wrap"><spring:message code="ADH_402_BASE" javaScriptEscape="true"/></p>
            <ul class="list inputSet">
                {{ _.each(formulaKeys, function(key) { }}
                    <%--get operation symbol--%>
                    {{
                        var operation = "";

                        if (key.indexOf("ADD_NUM") >= 0) {
                            operation = "+";
                        } else if (key.indexOf("SUBTRACT_NUM") >= 0) {
                            operation = "-";
                        } else if (key.indexOf("DIVIDE_BY_NUM") >= 0) {
                            operation = "/";
                        } else if (key.indexOf("MULTIPLY_BY_NUM") >= 0) {
                            operation = "*";
                        }
                    }}
                    <li class="leaf">
                        <div class="control radio"title="">
                            <input class="" id="{{=key}}" type="radio" name="functions" value="" />
                            {{ if (isNumericInputFirst) { }}
                                <span class="wrap argument one">
                                    <input class="" id="{{=key}}.input" type="text" value=""/>
                                    <span class="message warning">error message here</span>
                                </span>
                                <span class="wrap operator">{{=operation}}</span>
                                <span class="wrap argument two">({{=fieldNames[0]}})</span>
                            {{ } else { }}
                                <span class="wrap argument one">({{=fieldNames[0]}})</span>
                                <span class="wrap operator">{{=operation}}</span>
                                <span class="wrap argument two">
                                    <input class="" id="{{=key}}.input" type="text" value=""/>
                                    <span class="message warning">error message here</span>
                                </span>
                            {{ } }}
                        </div>
                    </li>
                {{ }); }}
                <li class="leaf">
                    <button id="swap" class="button options up">
                        <span class="wrap"><spring:message code="ADH_419_SWAP_FIELDS" javaScriptEscape="true"/></span><span class="icon"></span>
                    </button>
                </li>

            </ul>
        </li>
        <%--advance calculations for single numbers--%>
        <li id="advancedFunctions" class="node">
            <p class="wrap"><spring:message code="ADH_403_ADVANCED" javaScriptEscape="true"/></p>
            <ul class="list inputSet">
                {{ _.each(specialFormulaKeys, function(key, index) { }}
                    <li class="leaf">
                        <label class="control radio" for="{{=key}}" title="">
                            <input class="" id="{{=key}}" type="radio" name="functions" value=""/>
                            <span class="wrap">{{=specialFormulaValues[index]}}</span>
                            <span class="message warning">error message here</span>
                        </label>
                    </li>
                {{ }); }}
            </ul>
        </li>
    {{ } else if (formulaCalcType === "twoNumbers") { }}
        <%--two fields calculations--%>
        <li id="twoNumberFunctions" class="node">
            <p class="wrap"><spring:message code="ADH_403_TWO_FIELD_FUNCTIONS" javaScriptEscape="true"/></p>
            <ul class="list inputSet">
                {{ _.each(formulaKeys, function(key) { }}
                    <%--get operation symbol--%>
                    {{
                        var operation = "";

                        if (key.indexOf("ADD") >= 0) {
                            operation = "+";
                        } else if (key.indexOf("SUBTRACT") >= 0) {
                            operation = "-";
                        } else if (key.indexOf("DIVIDE") >= 0) {
                            operation = "/";
                        } else if (key.indexOf("MULTIPLY") >= 0) {
                            operation = "*";
                        }
                    }}
                    <li class="leaf">
                        <label class="control radio" for="{{=key}}" title="">
                            <input class="" id="{{=key}}" type="radio" name="functions" value="" />
                            <span class="wrap argument one">({{=fieldNames[0]}})</span>
                            <span class="wrap operator">{{=operation}}</span>
                            <span class="wrap argument two">({{=fieldNames[1]}})</span>
                            <span class="message warning">error message here</span>
                        </label>
                    </li>
                {{ }); }}
                <li class="leaf">
                    <button id="swap" class="button options up">
                        <span class="wrap"><spring:message code="ADH_419_SWAP_FIELDS" javaScriptEscape="true"/></span><span class="icon"></span>
                    </button>
                </li>

            </ul>
        </li>
    {{ } else if (formulaCalcType === "twoDates") { }}
        <%--date calculations--%>
        <li id="dateFunctions" class="node">
            <p class="wrap"><spring:message code="ADH_401_CREATE_DATEDIFF_FIELD" javaScriptEscape="true"/></p>
            <ul class="list inputSet">
                {{ _.each(formulaKeys, function(key, index) { }}
                    <li class="leaf">
                        <label class="control radio" for="{{=key}}" title="">
                            <span class="wrap">{{=formulaValues[index]}}</span>
                            <input class="" id="{{=key}}" type="radio" name="functions" value=""/>
                            <span class="message warning">error message here</span>
                        </label>
                    </li>
                {{ }); }}
            </ul>
        </li>
    {{ } else if (formulaCalcType === "multipleNumbers") { }}
        <%--multiple numbers--%>
        <li id="multipleNumberFunctions" class="node">
            <p class="wrap"><spring:message code="ADH_403_MULTI_FIELD_FUNCTIONS" javaScriptEscape="true"/></p>
            <ul class="list inputSet">
                {{ _.each(formulaKeys, function(key, index) { }}
                    <li class="leaf">
                        <label class="control radio" for="{{=key}}" title="">
                            <span class="wrap">{{=formulaValues[index]}}</span>
                            <input class="" id="{{=key}}" type="radio" name="functions" value=""/>
                            <span class="message warning">error message here</span>
                        </label>
                    </li>
                {{ }); }}
            </ul>
        </li>
    {{ } else { }}
        <%--do nothing for now--%>
    {{ } }}
</ul>
</script>
