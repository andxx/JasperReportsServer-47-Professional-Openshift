<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>

<c:set var="numericFilterDataType" value="${filter.filterDataType == 'Integer' || filter.filterDataType == 'Decimal' || filter.filterDataType == 'Long'}" />
<c:set var="dateTimeFilterDataType" value="${filter.filterDataType == 'Date' || filter.filterDataType == 'Time' || filter.filterDataType == 'Timestamp'}" />

<%--filter pod state minimized/maximized--%>
<c:choose>
    <c:when test="${filter.filterPodMinimized}">
        <c:set var="minimized" value="minimized" scope="page"/>
    </c:when>
    <c:otherwise>
        <c:set var="minimized" value="" scope="page"/>
    </c:otherwise>
</c:choose>

<c:choose>
<c:when test="${filter.editable}">
<%-- determine what operation type is loaded --%>
<c:choose>
    <c:when test="${fn:toLowerCase(filter.operatorName) == 'in' || fn:toLowerCase(filter.operatorName) == 'notin'}">
        <c:set var="filterType" value="multipleSelect" scope="page" />
    </c:when>
    <c:when test="${fn:toLowerCase(filter.operatorName) == 'between' || fn:toLowerCase(filter.operatorName) == 'notbetween'}">
        <c:set var="filterType" value="multipleInput" scope="page" />
    </c:when>
    <c:when test="${(fn:toLowerCase(filter.operatorName) == 'equals' || fn:toLowerCase(filter.operatorName) == 'notequal') && !dateTimeFilterDataType && !numericFilterDataType}">
        <c:set var="filterType" value="singleSelect" scope="page" />
    </c:when>
    <c:when test="${fn:toLowerCase(filter.operatorName) == 'isanyvalue'}">
        <c:set var="filterType" value="functionSelect" scope="page" />
    </c:when>
    <c:otherwise>
        <c:set var="filterType" value="singleInput" scope="page" />
    </c:otherwise>
</c:choose>

<c:choose>
    <c:when test="${pageScope.filterType == 'multipleSelect' || pageScope.filterType == 'functionSelect'}">
        <c:set var="hidden" value="" scope="page" />
    </c:when>
    <c:otherwise>
        <c:set var="hidden" value="hidden" scope="page"/>
    </c:otherwise>
</c:choose>

<c:choose>
    <c:when test="${viewModel.viewType == 'olap_crosstab'}">
        <c:set var="filterIDprefix" value="${filter.filterLabel}"/>
        <c:set var="filterLetterPrefix" value=""/>
    </c:when>
    <c:otherwise>
        <c:set var="filterIDprefix" value=""/>
        <c:set var="filterLetterPrefix" value="${filter.filterLetter}. "/>
    </c:otherwise>
</c:choose>



<%--filter pod--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
<tiles:putAttribute name="containerTitle" cascade="true" value="${filterLetterPrefix}${filter.filterDisplayLabel}"/>
<tiles:putAttribute name="containerID" cascade="true" value="${filterIDprefix}Pod${filter.filterId}"/>
<tiles:putAttribute name="containerClass" value="panel pane filter ${pageScope.minimized}"/>
<tiles:putAttribute name="containerAttributes" cascade="true">data-filterId=${filter.filterId} data-filterType=${pageScope.filterType} data-fieldName='${filter.filterLabel}' data-dataType=${filter.filterDataType} data-collapse=${filter.filterPodMinimized} data-editable=${filter.editable} data-filterUsed=${filter.used}</tiles:putAttribute>
<tiles:putAttribute name="headerContent">
    <button class="button disclosure noBubble"></button>
    <span class="button mutton"></span>
</tiles:putAttribute>
<tiles:putAttribute name="footerAttributes">style="z-index: -1;"</tiles:putAttribute>
<tiles:putAttribute name="bodyContent" cascade="true">
    <%--operation type --%>
    <fieldset id="${filterIDprefix}Pod${filter.filterId}_filterOpsContainer" class="options">
        <legend  class="offLeft"><span><spring:message code="ADH_1216_DYNAMIC_FILTER_CONDITION"/></span></legend>
        <label class="control select" for="${filterIDprefix}Pod${filter.filterId}_filterOps" title="Filter condition">
            <span class="wrap">Filter Condition:</span>
            <select id="${filterIDprefix}Pod${filter.filterId}_filterOps"
                    onchange="return adHocFilterModule.onChangeForSelect('${filterIDprefix}Pod${filter.filterId}_filterOps')"
                    class="single-select">
                <c:if test="${filter.filterDataType == 'String'}">
                    <option value="in" <c:if test="${fn:toLowerCase(filter.operatorName) == 'in' || pageScope.filterType == 'functionSelect'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IN"/></option>
                    <option value="notin" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notin'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_IN"/></option>
                    <option value="equals" <c:if test="${fn:toLowerCase(filter.operatorName) == 'equals'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                    <c:if test="${viewModel.viewType != 'olap_crosstab'}">
                        <option value="contains" <c:if test="${fn:toLowerCase(filter.operatorName) == 'contains'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_CONTAINS"/></option>
                        <option value="notcontains" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notcontains'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_CONTAINS"/></option>
                        <option value="startsWith" <c:if test="${fn:toLowerCase(filter.operatorName) == 'startswith'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_STARTS"/></option>
                        <option value="notstartsWith" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notstartswith'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_STARTS"/></option>
                        <option value="endsWith" <c:if test="${fn:toLowerCase(filter.operatorName) == 'endswith'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_ENDS"/></option>
                        <option value="notendsWith" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notendswith'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_ENDS"/></option>
                    </c:if>
                </c:if>
                <c:if test="${numericFilterDataType}">
                    <option value="in" <c:if test="${fn:toLowerCase(filter.operatorName) == 'in'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IN"/></option>
                    <option value="notin" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notin'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_IN"/></option>
                    <option value="equals_n" <c:if test="${fn:toLowerCase(filter.operatorName) == 'equals'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual_n" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                    <option value="greater" <c:if test="${fn:toLowerCase(filter.operatorName) == 'greater'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_GREATER"/></option>
                    <option value="less" <c:if test="${fn:toLowerCase(filter.operatorName) == 'less'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_LESS"/></option>
                    <option value="greaterOrEqual" <c:if test="${fn:toLowerCase(filter.operatorName) == 'greaterorequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_GREATER_OR_EQUAL"/></option>
                    <option value="lessOrEqual" <c:if test="${fn:toLowerCase(filter.operatorName) == 'lessorequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_LESS_OR_EQUAL"/></option>
                    <option value="between" <c:if test="${fn:toLowerCase(filter.operatorName) == 'between' || pageScope.filterType == 'functionSelect'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_BETWEEN"/></option>
                    <option value="notBetween" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notbetween'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_BETWEEN"/></option>
                </c:if>
                <c:if test="${dateTimeFilterDataType}">
                    <option value="equals_d" <c:if test="${fn:toLowerCase(filter.operatorName) == 'equals'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual_d" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                    <option value="greater" <c:if test="${fn:toLowerCase(filter.operatorName) == 'greater'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_AFTER"/></option>
                    <option value="less" <c:if test="${fn:toLowerCase(filter.operatorName) == 'less'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_BEFORE"/></option>
                    <option value="greaterOrEqual" <c:if test="${fn:toLowerCase(filter.operatorName) == 'greaterorequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_ON_OR_AFTER"/></option>
                    <option value="lessOrEqual" <c:if test="${fn:toLowerCase(filter.operatorName) == 'lessorequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IS_ON_OR_BEFORE"/></option>
                    <option value="between" <c:if test="${fn:toLowerCase(filter.operatorName) == 'between' || pageScope.filterType == 'functionSelect'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_BETWEEN"/></option>
                    <option value="notBetween" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notbetween'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_BETWEEN"/></option>
                </c:if>
                <c:if test="${filter.filterDataType == 'Boolean'}">
                    <option value="in" <c:if test="${fn:toLowerCase(filter.operatorName) == 'in'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_IN"/></option>
                    <option value="notin" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notin'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_IN"/></option>
                    <option value="equals" <c:if test="${fn:toLowerCase(filter.operatorName) == 'equals'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_EQUAL"/></option>
                    <option value="notEqual" <c:if test="${fn:toLowerCase(filter.operatorName) == 'notequal'}"> selected="selected"</c:if>><spring:message code="ADH_1211_DYNAMIC_FILTER_COMPARISON_OPERATOR_NOT_EQUAL"/></option>
                </c:if>
            </select>
        </label>
    </fieldset>

    <%--this is for multiselect operations--%>
    <c:if test="${pageScope.filterType == 'multipleSelect'  || (pageScope.filterType == 'functionSelect' && (filter.filterDataType == 'String' || filter.filterDataType == 'Boolean'))}">
        <fieldset id="${filterIDprefix}Pod${filter.filterId}_filterInputContainer" class="values">
            <label class="control select multiple" for="${filterIDprefix}Pod${filter.filterId}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                <span class="wrap">Value:</span>
                <select id="${filterIDprefix}Pod${filter.filterId}_filterInput"
                        onchange="return adHocFilterModule.onChangeForSelect('${filterIDprefix}Pod${filter.filterId}_filterInput')"
                        multiple="multiple">
                    <c:if test="${viewModel.viewType == 'olap_crosstab'}">
                        <c:forEach var="entry" items="${filter.possibleValueMap}">
                            <%-- key and value should be escaped to correctly handle special characters like quote etc. --%>
                            <c:set var="escapedKey">
                                <c:out value="${entry.key}" escapeXml="true"/>
                            </c:set>
                            <c:set var="escapedValue">
                                <c:out value="${entry.value}" escapeXml="true"/>
                            </c:set>

                            <option value="${escapedKey}" title="${escapedValue}"
                                            <c:forEach var="selected" items="${filter.filterValue}">
                                                <c:if test="${selected == entry.key}">
                                                    selected="selected"
                                                </c:if>
                                            </c:forEach>>
                                    ${escapedValue}
                            </option>
                        </c:forEach>
                    </c:if>
                    <c:if test="${viewModel.viewType != 'olap_crosstab'}">
                        <c:forEach var="value" items="${filter.possibleValues}">
                            <%-- value should be escaped to allow special characters like quote etc. --%>
                            <c:set var="escapedValue">
                                <c:out value="${value}" escapeXml="true"/>
                            </c:set>
                            <option value="${escapedValue}" title="${escapedValue}"
                                    <c:choose >
                                        <c:when test="${fn:toLowerCase(filter.operatorName) == 'isanyvalue'}">
                                            selected="selected"
                                        </c:when>
                                        <c:otherwise>
                                            <c:forEach var="selected" items="${filter.filterValue}">
                                                <c:if test="${selected == value}">
                                                    selected="selected"
                                                </c:if>
                                            </c:forEach>
                                        </c:otherwise>
                                    </c:choose>>
                                    ${escapedValue}
                            </option>
                        </c:forEach>
                    </c:if>
                </select>
            </label>
        </fieldset>
    </c:if>


    <%--this is for multiple input operations--%>
    <c:if test="${pageScope.filterType == 'multipleInput' || (pageScope.filterType == 'functionSelect' && (dateTimeFilterDataType || numericFilterDataType))}">
        <fieldset id="${filterIDprefix}Pod${filter.filterId}_filterInputContainer" class="values">
            <c:choose>
            <c:when test="${filter.filterDataType == 'Date'}">
            <label class="control picker" for="${filterIDprefix}Pod${filter.filterId}_filterInput" title="Calendar picker">
                </c:when>
                <c:otherwise>
                <label class="control input text" for="${filterIDprefix}Pod${filter.filterId}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                    </c:otherwise>
                    </c:choose>
                    <span class="wrap">From:</span>
                    <c:choose>
                        <c:when test="${filter.filterDataType == 'Date'}">
                            <input id="${filterIDprefix}Pod${filter.filterId}_filterInput" class=""
                                   type="text"
                                   onchange="return adHocFilterModule.onChangeForDateInput('${filterIDprefix}Pod${filter.filterId}')"
                                   value="${filter.filterValue[0]}"/>
                            <button class="button picker" id="${filterIDprefix}Pod${filter.filterId}_filterInput_calendarButton"></button>
                        </c:when>
                        <c:otherwise>
                            <input id="${filterIDprefix}Pod${filter.filterId}_filterInput" 
                                onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            	onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                            	class="" 
                            	type="text" 
                            	value="${filter.filterValue[0]}"/>
                        </c:otherwise>
                    </c:choose>
                    <span class="message warning"><spring:message code="ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR"/></span>
                </label>

                <c:choose>
                <c:when test="${filter.filterDataType == 'Date'}">
                <label class="control picker" for="${filterIDprefix}Pod${filter.filterId}_filterInput2" title="Calendar picker">
                    </c:when>
                    <c:otherwise>
                    <label class="control input text" for="${filterIDprefix}Pod${filter.filterId}_filterInput2" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                        </c:otherwise>
                        </c:choose>
                        <span class="wrap">From:</span>

                        <c:choose>
                            <c:when test="${filter.filterDataType == 'Date'}">
                                <input id="${filterIDprefix}Pod${filter.filterId}_filterInput2" class=""
                                       type="text"
                                       onchange="return adHocFilterModule.onChangeForDateInput('${filterIDprefix}Pod${filter.filterId}')"
                                       value="${filter.filterValue[1]}"/>
                                <button class="button picker" id="${filterIDprefix}Pod${filter.filterId}_filterInput2_calendarButton"></button>
                            </c:when>
                            <c:otherwise>
                                <input id="${filterIDprefix}Pod${filter.filterId}_filterInput2" 
                                	onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            		onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                                	class="" 
                                	type="text" 
                                	value="${filter.filterValue[1]}"/>
                            </c:otherwise>
                        </c:choose>
                        <span class="message warning"><spring:message code="ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR"/></span>
                    </label>

        </fieldset>
    </c:if>


    <%--this is for single select operations--%>
    <c:if test="${pageScope.filterType == 'singleSelect'}">
        <fieldset id="${filterIDprefix}Pod${filter.filterId}_filterInputContainer" class="values">
            <label class="control select" for="${filterIDprefix}Pod${filter.filterId}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                <span class="wrap">Value:</span>
                <select id="${filterIDprefix}Pod${filter.filterId}_filterInput"
                         onchange="return adHocFilterModule.onChangeForSelect('${filterIDprefix}Pod${filter.filterId}_filterInput')"
                         class="single-select">
                    <c:if test="${viewModel.viewType == 'olap_crosstab'}">
                        <c:forEach var="entry" items="${filter.possibleValueMap}">
                            <%-- key and value should be escaped to correctly handle special characters like quote etc. --%>
                            <c:set var="escapedKey">
                                <c:out value="${entry.key}" escapeXml="true"/>
                            </c:set>
                            <c:set var="escapedValue">
                                <c:out value="${entry.value}" escapeXml="true"/>
                            </c:set>

                            <option value="${escapedKey}" title="${escapedValue}"
                                    <c:forEach var="selected" items="${filter.filterValue}">
                                        <c:if test="${selected == entry.key}">
                                            selected="selected"
                                        </c:if>
                                    </c:forEach>>
                                    ${escapedValue}
                            </option>
                        </c:forEach>
                    </c:if>
                        <c:if test="${viewModel.viewType != 'olap_crosstab'}">
                        <c:forEach var="value" items="${filter.possibleValues}">
                            <%-- value should be escaped to allow special characters like quote etc. --%>
                            <c:set var="escapedValue">
                                <c:out value="${value}" escapeXml="true"/>
                            </c:set>
                            <option value="${escapedValue}" title="${escapedValue}"
                                    <c:forEach var="selected" items="${filter.filterValue}">
                                        <c:if test="${selected == value}">
                                            selected="selected"
                                        </c:if>
                                    </c:forEach>>
                                    ${escapedValue}
                            </option>
                        </c:forEach>
                    </c:if>
                </select>
            </label>
        </fieldset>
    </c:if>


    <%--this is for single input--%>
    <c:if test="${pageScope.filterType == 'singleInput'}">
        <fieldset id="${filterIDprefix}Pod${filter.filterId}_filterInputContainer" class="values">
            <c:choose>
            <c:when test="${filter.filterDataType == 'Date'}">
            <label class="control picker" for="${filterIDprefix}Pod${filter.filterId}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                </c:when>
                <c:otherwise>
                <label class="control input text" for="${filterIDprefix}Pod${filter.filterId}_filterInput" title="<spring:message code="ADH_1212_FILTER_VALUE" javaScriptEscape="true"/>">
                    </c:otherwise>
                    </c:choose>
                    <span class="wrap">Value:</span>
                    <c:choose>
                        <c:when test="${filter.filterDataType == 'Date'}">
                            <input id="${filterIDprefix}Pod${filter.filterId}_filterInput" class=""
                            	type="text"
                            	onchange="return adHocFilterModule.onChangeForDateInput('${filterIDprefix}Pod${filter.filterId}')"
                            	onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            	onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                            	value="${filter.filterValue[0]}"/>
                            <button class="button picker" id="${filterIDprefix}Pod${filter.filterId}_filterInput_calendarButton"></button>
                        </c:when>
                        <c:otherwise>
                            <input id="${filterIDprefix}Pod${filter.filterId}_filterInput" 
                            	onfocus="adhocDesigner.initEnableBrowserSelection($('designer'))"
                            	onblur="adhocDesigner.initPreventBrowserSelection($('designer'))"
                            	class="" 
                            	type="text"
                            	value="${filter.filterValue[0]}"/>
                        </c:otherwise>
                    </c:choose>
                    <span class="message warning"><spring:message code="ADH_1216_DYNAMIC_FILTER_NUMERIC_INPUT_ERROR"/></span>
                </label>
        </fieldset>
    </c:if>


    <%--this is for the all option tag--%>
    <fieldset id="${filterIDprefix}Pod${filter.filterId}_allOption" class="all ${pageScope.hidden}">
        <div class="control checkBox">
        <label class="wrap" for="${filterIDprefix}Pod${filter.filterId}_All" title="Check to select all values">
            <spring:message code="ADH_1202_DYNAMIC_FILTER_ALL_OPTION"/>
        </label>
            <input type="checkbox" name="${filterIDprefix}Pod${filter.filterId}_All"
                   value="All"
                   id="${filterIDprefix}Pod${filter.filterId}_all" class=""
                    <c:choose>
                        <c:when test="${fn:toLowerCase(filter.operatorName) == 'isanyvalue'}">
                            checked="checked"
                        </c:when>
                    </c:choose>/>
        </div>
    </fieldset>
</tiles:putAttribute>
</tiles:insertTemplate>
</c:when>

<%--complex and uneditable filters--%>
<c:otherwise>
    <c:choose>
        <c:when test="${viewModel.viewType == 'olap_crosstab'}">
            <c:set var="isComplex" value="${fn:toLowerCase(filter.filterLabel) == 'complex'}"/>
            <c:set var="footerAttributes" value="style='z-index: -1;'"/>
            <c:set var="filterTitle">
                <c:choose>
                    <c:when test="${isComplex}">
                        <spring:message code="ADH_1213_DYNAMIC_FILTER_ADVANCED_SELECTION"/>
                    </c:when>
                    <c:otherwise>
                        ${filter.filterDisplayLabel}
                    </c:otherwise>
                </c:choose>
            </c:set>
        </c:when>
        <c:otherwise>
            <%-- map filter source to message code (see SubFilter.Source Java enum for the values this can take) --%>
            <c:choose>
                <c:when test="${filter.source == 'SLICE_COMPLEX_KEEPONLY'}">
                    <c:set var="filterLabelMessage" value="ADH_1208_DYNAMIC_FILTER_KEEP"/>
                </c:when>
                <c:when test="${filter.source == 'SLICE_COMPLEX_EXCLUDE'}">
                    <c:set var="filterLabelMessage" value="ADH_1209_DYNAMIC_FILTER_EXCLUDE"/>
                </c:when>
                <c:otherwise>
                    <c:set var="filterLabelMessage" value="ADH_1215_DYNAMIC_FILTER_UNEDITABLE_TITLE"/>
                </c:otherwise>
            </c:choose>
            <c:set var="filterTitle">${filter.filterLetter}. <spring:message code="${filterLabelMessage}"/></c:set>
            <c:set var="footerAttributes" value=""/>
        </c:otherwise>
    </c:choose>

    <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
        <tiles:putAttribute name="containerTitle" value="${filterTitle}"/>
        <tiles:putAttribute name="containerID" cascade="true" value="${filterIDprefix}Pod${filter.filterId}"/>
        <tiles:putAttribute name="containerClass" value="panel pane filter"/>
        <tiles:putAttribute name="containerAttributes" cascade="true">data-filterId=${filter.filterId} data-filterType=${pageScope.filterType} data-fieldName='${filter.filterLabel}' data-collapse=${filter.filterPodMinimized} data-editable=${filter.editable} data-filterUsed=${filter.used}</tiles:putAttribute>
        <tiles:putAttribute name="headerContent">
            <button class="button disclosure noBubble"></button>
            <span class="button mutton"></span>
        </tiles:putAttribute>
        <tiles:putAttribute name="footerAttributes">${footerAttributes}</tiles:putAttribute>
        <tiles:putAttribute name="bodyContent">
            <fieldset class="values">
                <c:choose>
                    <c:when test="${isComplex || viewModel.viewType != 'olap_crosstab'}">
                        <ul class="message">
                            <c:if test="${filter.variableNames != null}">
                                <c:forEach var="value" items="${filter.variableNames}">
                                    <li>${value}</li>
                                </c:forEach>
                            </c:if>
                            <c:if test="${filter.variableNames == null}">
                                <li>${filter.filterDisplayLabel}</li>
                            </c:if>
                        </ul>
                        <p class="message"><spring:message code="ADH_1215_DYNAMIC_FILTER_ADVANCED_INFO"/></p>
                    </c:when>
                    <c:otherwise>
                        <p class="message">${filter.expressionAsString}</p>
                        <p class="message"><spring:message code="ADH_1215_DYNAMIC_FILTER_UNEDITABLE_INFO"/></p>
                    </c:otherwise>
                </c:choose>
            </fieldset>
        </tiles:putAttribute>
    </tiles:insertTemplate>
</c:otherwise>
</c:choose>

