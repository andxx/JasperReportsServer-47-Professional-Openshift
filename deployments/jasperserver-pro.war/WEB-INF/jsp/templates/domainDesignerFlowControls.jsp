<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<t:useAttribute name="selectedTab" id="selectedTab" classname="java.lang.String" ignore="false"/>

<c:choose>
    <c:when test="${presentationSelected}">
        <c:set var="exportButtonDisabledAttribute" value=""/>
    </c:when>
    <c:otherwise>
        <c:set var="exportButtonDisabledAttribute">disabled="disabled"</c:set>
    </c:otherwise>
</c:choose>

<div class="tabs">
    <t:insertTemplate template="/WEB-INF/jsp/templates/control_tabSet.jsp">
        <t:putAttribute name="type" value="buttons"/>
        <t:putAttribute name="containerClass" value="horizontal"/>
        <t:putListAttribute name="tabset">
            <%--<t:addListAttribute>
                <t:addAttribute>sourceTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerSource' javaScriptEscape='true'/></t:addAttribute>
            </t:addListAttribute>--%>
            <t:addListAttribute>
                <t:addAttribute>tablesTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerTables' javaScriptEscape='true'/></t:addAttribute>
                <c:if test="${selectedTab eq 'tables'}">
                    <t:addAttribute>selected</t:addAttribute>
                </c:if>
            </t:addListAttribute>
            <t:addListAttribute>
                <t:addAttribute>derivedTablesTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerDerivedTables' javaScriptEscape='true'/></t:addAttribute>
                <c:if test="${selectedTab eq 'derivedTables'}">
                    <t:addAttribute>selected</t:addAttribute>
                </c:if>
            </t:addListAttribute>
            <t:addListAttribute>
                <t:addAttribute>joinsTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerJoins' javaScriptEscape='true'/></t:addAttribute>
                <c:if test="${selectedTab eq 'joins'}">
                    <t:addAttribute>selected</t:addAttribute>
                </c:if>
            </t:addListAttribute>
            <t:addListAttribute>
                <t:addAttribute>calcFieldsTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerCalcFields' javaScriptEscape='true'/></t:addAttribute>
                <c:if test="${selectedTab eq 'calcFields'}">
                    <t:addAttribute>selected</t:addAttribute>
                </c:if>
            </t:addListAttribute>
            <t:addListAttribute>
                <t:addAttribute>preFiltersTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerPreFilters' javaScriptEscape='true'/></t:addAttribute>
                <c:if test="${selectedTab eq 'preFilters'}">
                    <t:addAttribute>selected</t:addAttribute>
                </c:if>
            </t:addListAttribute>
            <t:addListAttribute>
                <t:addAttribute>displayTab</t:addAttribute>
                <t:addAttribute><spring:message code='button.designerDisplay' javaScriptEscape='true'/></t:addAttribute>
                <c:if test="${selectedTab eq 'display'}">
                    <t:addAttribute>selected</t:addAttribute>
                </c:if>
            </t:addListAttribute>
        </t:putListAttribute>
    </t:insertTemplate>
</div>

<div class="toolbar">
    <span class="cosmetic"></span>
    <ul class="list buttonSet">
    	<li class="node open">
    		<ul class="list buttonSet">
		        <li class="leaf">
		            <button id="checkDesign" title="<spring:message code='toolbar.designer.checkDesign' javaScriptEscape='true'/>" class="button capsule text up first">
		                <span class="wrap"><spring:message code='toolbar.designer.checkDesign' javaScriptEscape='true'/><span class="icon"></span></span>
		            </button>
		        </li>
		        <li class="leaf">
		            <button id="exportSchema" title="<spring:message code='toolbar.designer.export.schema' javaScriptEscape='true'/>" class="button capsule text up middle" ${exportButtonDisabledAttribute}>
		                <span class="wrap"><spring:message code='toolbar.designer.export.schema' javaScriptEscape='true'/><span class="icon"></span></span>
		            </button>
		        </li>
		        <li class="leaf">
		            <button id="exportBundleStub" title="<spring:message code='toolbar.designer.export.bundleStub' javaScriptEscape='true'/>" class="button capsule text up last" ${exportButtonDisabledAttribute}>
		                <span class="wrap"><spring:message code='toolbar.designer.export.bundleStub' javaScriptEscape='true'/><span class="icon"></span></span>
		            </button>
		        </li>
			</ul>
		</li>
    	<li class="node open">
    		<ul class="list buttonSet">
		        <c:if test="${selectedTab eq 'derivedTables'}">
		            <li class="leaf separator"></li>
		            <li class="leaf">
		                <button disabled="disabled" id="delete" title="<spring:message code='toolbar.joins.delete' javaScriptEscape='true'/>" class="button capsule text up">
		                    <span class="wrap"><spring:message code='toolbar.joins.delete' javaScriptEscape='true'/><span class="icon"></span></span>
		                </button>
		            </li>
		        </c:if>
		        <c:if test="${selectedTab eq 'joins'}">
		            <li class="leaf separator"></li>
		            <li class="leaf">
		                <button disabled="disabled" id="copyTable" title="<spring:message code='toolbar.joins.copy' javaScriptEscape='true'/>" class="button capsule text up first">
		                    <span class="wrap"><spring:message code='toolbar.joins.copy' javaScriptEscape='true'/><span class="icon"></span></span>
		                </button>
		            </li>
		            <li class="leaf">
		                <button disabled="disabled" id="changeID" title="<spring:message code='toolbar.joins.changeId.title' javaScriptEscape='true'/>" class="button capsule text up middle">
		                    <span class="wrap"><spring:message code='toolbar.joins.changeId' javaScriptEscape='true'/><span class="icon"></span></span>
		                </button>
		            </li>
		            <li class="leaf">
		                <button disabled="disabled" id="delete" title="<spring:message code='toolbar.joins.delete' javaScriptEscape='true'/>" class="button capsule text up last">
		                    <span class="wrap"><spring:message code='toolbar.joins.delete' javaScriptEscape='true'/><span class="icon"></span></span>
		                </button>
		            </li>
		        </c:if>
    		</li>
		</ul>
    </ul>
</div>
