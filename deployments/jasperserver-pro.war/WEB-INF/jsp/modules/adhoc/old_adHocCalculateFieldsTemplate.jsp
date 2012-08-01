<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<ul id="calculatedFieldOptions" class="list inputSet">
    <c:choose>
        <%--number calculations--%>
        <c:when test="${formulaCalcType['calcType'] eq 'singleField'}">
            <li id="basicFunctions" class="node">
                <p class="wrap"><spring:message code="ADH_402_BASE" javaScriptEscape="true"/></p>
                <ul class="list inputSet">
                    <c:set var="formulas" value="${formulaMap}" scope="page" />
                    <c:forEach var="entry" items="${pageScope.formulas}">
                        <%--get operation symbol--%>
                        <c:choose>
                            <c:when test="${fn:contains(entry.value,'ADD_NUM')}">
                                <c:set var="operation" value="+" scope="page" />
                            </c:when>
                            <c:when test="${fn:contains(entry.value,'SUBTRACT_NUM')}">
                                <c:set var="operation" value="-" scope="page" />
                            </c:when>
                            <c:when test="${fn:contains(entry.value,'DIVIDE_BY_NUM')}">
                                <c:set var="operation" value="/" scope="page" />
                            </c:when>
                            <c:when test="${fn:contains(entry.value,'MULTIPLY_BY_NUM')}">
                                <c:set var="operation" value="*" scope="page" />
                            </c:when>
                            <c:otherwise>
                                <c:set var="operation" value="" scope="page" />
                            </c:otherwise>
                        </c:choose>
                        <li class="leaf">
                            <div class="control radio"title="">
                                <input class="" id="${entry.value}" type="radio" name="functions" value="" />
                                <c:choose>
                                    <c:when test="${isNumericInputFirst['swapped'] == true}">
                                        <span class="wrap argument one">
                                            <input class="" id="${entry.value}.input" type="text" value=""/>
                                            <span class="message warning">error message here</span>
                                        </span>
                                        <span class="wrap operator">${pageScope.operation}</span>
                                        <span class="wrap argument two">(${fieldNamesMap['fieldNames'][0]})</span>
                                    </c:when>
                                    <c:otherwise>
                                        <span class="wrap argument one">(${fieldNamesMap['fieldNames'][0]})</span>
                                        <span class="wrap operator">${pageScope.operation}</span>
                                        <span class="wrap argument two">
                                            <input class="" id="${entry.value}.input" type="text" value=""/>
                                            <span class="message warning">error message here</span>
                                        </span>
                                    </c:otherwise>
                                </c:choose>

                            </div>
                        </li>
                    </c:forEach>
                    <li class="leaf">
                        <button id="swap" class="button options up"><span class="wrap"><spring:message code="ADH_419_SWAP_FIELDS" javaScriptEscape="true"/></span><span class="icon"></span></button>
                    </li>

                </ul>
            </li>
            <%--advance calculations for single numbers--%>
            <li id="advancedFunctions" class="node">
                <p class="wrap"><spring:message code="ADH_403_ADVANCED" javaScriptEscape="true"/></p>
                <ul class="list inputSet">
                    <c:set var="specialFormulas" value="${specialFormulaMap}" scope="page" />
                    <c:forEach var="entry" items="${pageScope.specialFormulas}">
                        <li class="leaf">
                            <label class="control radio" for="${entry.value}" title="">
                                <input class="" id="${entry.value}" type="radio" name="functions" value=""/>
                                <span class="wrap"><spring:message code="${entry.value}"/></span>
                                <span class="message warning">error message here</span>
                            </label>
                        </li>
                    </c:forEach>
                </ul>
            </li>
        </c:when>
        <%--two fields calculations--%>
        <c:when test="${formulaCalcType['calcType'] eq 'twoNumbers'}">
            <li id="twoNumberFunctions" class="node">
                <p class="wrap"><spring:message code="ADH_403_TWO_FIELD_FUNCTIONS" javaScriptEscape="true"/></p>
                <ul class="list inputSet">
                    <c:set var="formulas" value="${formulaMap}" scope="page" />
                    <c:forEach var="entry" items="${pageScope.formulas}">
                        <%--get operation symbol--%>
                        <c:choose>
                            <c:when test="${fn:contains(entry.value,'ADD')}">
                                <c:set var="operation" value="+" scope="page" />
                            </c:when>
                            <c:when test="${fn:contains(entry.value,'SUBTRACT')}">
                                <c:set var="operation" value="-" scope="page" />
                            </c:when>
                            <c:when test="${fn:contains(entry.value,'DIVIDE')}">
                                <c:set var="operation" value="/" scope="page" />
                            </c:when>
                            <c:when test="${fn:contains(entry.value,'MULTIPLY')}">
                                <c:set var="operation" value="*" scope="page" />
                            </c:when>
                            <c:otherwise>
                                <c:set var="operation" value="" scope="page" />
                            </c:otherwise>
                        </c:choose>
                        <li class="leaf">
                            <label class="control radio" for="${entry.value}" title="">
                                <input class="" id="${entry.value}" type="radio" name="functions" value="" />
                                <span class="wrap argument one">(${fieldNamesMap['fieldNames'][0]})</span>
                                <span class="wrap operator">${pageScope.operation}</span>
                                <span class="wrap argument two">(${fieldNamesMap['fieldNames'][1]})</span>
                                <span class="message warning">error message here</span>
                            </label>
                        </li>
                    </c:forEach>
                    <li class="leaf">
                        <button id="swap" class="button options up"><span class="wrap"><spring:message code="ADH_419_SWAP_FIELDS" javaScriptEscape="true"/></span><span class="icon"></span></button>
                    </li>

                </ul>
            </li>
        </c:when>
        <%--date calculations--%>
        <c:when test="${formulaCalcType['calcType'] eq 'twoDates'}">
            <li id="dateFunctions" class="node">
                <p class="wrap"><spring:message code="ADH_401_CREATE_DATEDIFF_FIELD" javaScriptEscape="true"/></p>
                <ul class="list inputSet">
                    <c:set var="formulas" value="${formulaMap}" scope="page" />
                    <c:forEach var="entry" items="${pageScope.formulas}">
                        <li class="leaf">
                            <label class="control radio" for="${entry.value}" title="">
                                <span class="wrap"><spring:message code="${entry.value}"/></span>
                                <input class="" id="${entry.value}" type="radio" name="functions" value=""/>
                                <span class="message warning">error message here</span>
                            </label>
                        </li>
                    </c:forEach>
                </ul>
            </li>
        </c:when>
        <%--multiple numbers--%>
        <c:when test="${formulaCalcType['calcType'] eq 'multipleNumbers'}">
            <li id="multipleNumberFunctions" class="node">
                <p class="wrap"><spring:message code="ADH_403_MULTI_FIELD_FUNCTIONS" javaScriptEscape="true"/></p>
                <ul class="list inputSet">
                    <c:set var="formulas" value="${formulaMap}" scope="page" />
                    <c:forEach var="entry" items="${pageScope.formulas}">
                        <li class="leaf">
                            <label class="control radio" for="${entry.value}" title="">
                                <span class="wrap"><spring:message code="${entry.value}"/></span>
                                <input class="" id="${entry.value}" type="radio" name="functions" value=""/>
                                <span class="message warning">error message here</span>
                            </label>
                        </li>
                    </c:forEach>
                </ul>
            </li>
        </c:when>
        <c:otherwise>
            <%--do nothing for now--%>
        </c:otherwise>
    </c:choose>
</ul>

