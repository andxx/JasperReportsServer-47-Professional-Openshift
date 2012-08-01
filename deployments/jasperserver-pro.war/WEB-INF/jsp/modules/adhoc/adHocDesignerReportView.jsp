<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>

<%@ page import="java.util.List" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="com.jaspersoft.ji.adhoc.AdhocColumn" %>
<%@ page import="com.jaspersoft.ji.adhoc.service.SessionAttributeManager" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@ taglib uri="/spring" prefix="spring"%>
<%@ taglib uri="/WEB-INF/jasperserver.tld" prefix="js" %>
<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>

<%--jsp variable declaration and initialization--%>
<%@ include file="adHocDesignerVariables.jsp"%>

<%@ include file="/WEB-INF/jsp/jsTemplates/chart.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/table.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/tableRowsIncludingTable.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/crosstab.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/adHocFilterPanel.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/adHocCalculateFieldsTemplate.jsp" %>

<%--templates--%>
<%--calculate fields--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/calculatedField.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
</tiles:insertTemplate>

<%--edit complex expression dialog--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/complexExpression.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
    <tiles:putAttribute name="bodyContent">
        <tiles:putAttribute name="availableFilters">
            <ul id="availableFilters" class="list">
                <li class="leaf" tabindex="-1">
                    <span class="nameAndValue">The Field</span>
                    <span class="operation"> is one of </span>
                    <span class="nameAndValue">{Value1, Value2, Value3, </span>
                    <span class="nameAndValue">more...</span>
                    <span class="nameAndValue"> }</span>
                </li>
                <li class="leaf" tabindex="-1">
                    <span class="nameAndValue">The Field</span>
                    <span class="operation"> equals </span>
                    <span class="nameAndValue">The Value</span>
                </li>
            </ul>
        </tiles:putAttribute>
    </tiles:putAttribute>
</tiles:insertTemplate>

<%--remove filter standard confirm--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/standardConfirm.jsp">
    <tiles:putAttribute name="containerClass">centered_vert centered_horz hidden</tiles:putAttribute>
    <tiles:putAttribute name="bodyContent">
        <p class="message"><spring:message code="ADH_1230_DYNAMIC_FILTER_ADVANCED_CONFIRM_REMOVE" javaScriptEscape="true"/></p>
    </tiles:putAttribute>
    <tiles:putAttribute name="leftButtonId" value="confirmYes"/>
    <tiles:putAttribute name="rightButtonId" value="confirmNo"/>
</tiles:insertTemplate>

<%-- Tip panel for showing more values of simple filters criteria in Complex Filtering dialog --%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
    <tiles:putAttribute name="containerID" value="morePanel"/>
    <tiles:putAttribute name="containerClass" value="panel overlay morePanel centered_horz centered_vert hidden"/>
    <tiles:putAttribute name="bodyContent">
        <div></div>
    </tiles:putAttribute>
</tiles:insertTemplate>

<%--adhoc edit label--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/editLabel.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
</tiles:insertTemplate>


<%--sort dialog--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/sortDialog.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
    <tiles:putAttribute name="bodyContent">
        <tiles:putAttribute name="availableFields">
            <ul id="sortDialogAvailable" class="list responsive collapsible fields hideRoot"></ul>
        </tiles:putAttribute>
        <tiles:putAttribute name="selectedFields">
            <c:if test="${isIPad}"><div class="swipeScroll" style="position: absolute; right: 0; width: 100%;"></c:if>
                <ul id="sortDialogSortFields"></ul>
            <c:if test="${isIPad}"></div></c:if>
        </tiles:putAttribute>
    </tiles:putAttribute>
</tiles:insertTemplate>


<tiles:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <tiles:putAttribute name="pageTitle"><spring:message code='ADH_002c_HEADER'/></tiles:putAttribute>
    <tiles:putAttribute name="bodyID" value="designer"/>
    <tiles:putAttribute name="bodyClass" value="twoColumn"/>
    <tiles:putAttribute name="headerContent">
    </tiles:putAttribute>
    <tiles:putAttribute name="bodyContent">
        <%--script dependencies--%>
        <%@ include file="adHocScriptHeader.jsp"%>
        <%--include base constant variables--%>
        <%@ include file="adHocBaseScripts.jsp"%>
        <c:choose>
            <c:when test="${olapCrosstabMode eq 'selected' && !(fromDesigner eq 'true')}">
                <c:set var="containerClass" value=""/>
                <c:set var="primaryColumnTitle">
                    <spring:message code="report.view.containerTitle"/>
                </c:set>
            </c:when>
            <c:otherwise>
                <c:set var="containerClass" value="showingToolBar showingSubHeader"/>
                <c:set var="primaryColumnTitle">
                    <spring:message code='ADH_002_HEADER'/>
                </c:set>
            </c:otherwise>
        </c:choose>
        <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <tiles:putAttribute name="containerID" cascade="true" value="${primaryColumnID}"/>
            <tiles:putAttribute name="containerClass" cascade="true" value="column decorated primary ${containerClass}"/>
            <tiles:putAttribute name="containerTitle" cascade="true">${primaryColumnTitle}</tiles:putAttribute>
            <tiles:putAttribute name="headerContent" cascade="true">
                <div class="toolbar">
                    <c:if test="${olapCrosstabMode != 'selected'}">
                        <ul class="list buttonSet">
                            <li class="node">
                                <ul class="list buttonSet">
                                    <li class="leaf"><button id="explorer" title="<spring:message code='ADH_1100_TOOLTIP_PRESENTATION_MODE'/>" class="button capsule down first"><span class="wrap">Explorer<span class="icon"></span></span></button></li>
                                    <li class="node"><button id="save" title="<spring:message code='ADH_1101_TOOLTIP_SAVE'/>" class="button capsule mutton up middle disabled" disabled="disabled"><span class="wrap">Save<span class="icon"></span><span class="indicator"></span></span></button></li>
                                    <li class="node"><button id="export" class="button capsule mutton up last" title="<spring:message code="button.export"/>"><span class="wrap">Export<span class="icon"></span><span class="indicator"></span></span></button></li>
                                </ul>
                            </li>
                            <li class="node">
                                <ul class="list buttonSet">
                                    <li class="leaf"><button id="undo" title="<spring:message code='ADH_1103_TOOLTIP_UNDO'/>" class="button capsule up first" disabled="disabled"><span class="wrap">Undo<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="redo" title="<spring:message code='ADH_1104_TOOLTIP_REDO'/>" class="button capsule up  middle" disabled="disabled"><span class="wrap">Redo<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="undoAll" title="<spring:message code='ADH_1105_TOOLTIP_RESET'/>" class="button capsule up last" disabled="disabled"><span class="wrap">Undo All<span class="icon"></span></span></button></li>
                                </ul>
                            </li>
                            <li class="node">
                            <c:if test="${olapCrosstabMode != 'selected'}">
                                <ul class="list buttonSet">
                                    <li class="leaf"><button id="pivot" title="<spring:message code='ADH_1107_TOOLTIP_PIVOT'/>" class="button capsule up first" disabled="disabled"><span class="wrap">Pivot<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="sort" title="<spring:message code='ADH_1108_TOOLTIP_SORT'/>" class="button capsule up middle"><span class="wrap">Sort<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="controls" title="<spring:message code='ADH_1109_TOOLTIP_FILTER'/>" class="button capsule up middle" ${isDomainReport}><span class="wrap">Input Controls<span class="icon"></span></span></button></li>
                                    <%--<li class="leaf"><button id="styles" title="<spring:message code='ADH_1110_TOOLTIP_STYLES'/>" class="button capsule up middle" disabled="disabled"><span class="wrap">Styles<span class="icon"></span></span></button></li>--%>
                                    <li class="node"><button id="options" title="<spring:message code='ADH_1112_TOOLTIP_PAGE_SETUP'/>" class="button capsule mutton up last" disabled="disabled"><span class="wrap">Options<span class="icon"></span><span class="indicator"></span></span></button></li>
                                </ul>
                            </c:if>
                                <c:if test="${olapCrosstabMode == 'selected'}">
                                    <ul class="list buttons">
                                        <li class="leaf"><button id="pivot" title="<spring:message code='ADH_1107_TOOLTIP_PIVOT'/>" class="button capsule up" disabled="disabled"><span class="wrap">Pivot<span class="icon"></span></span></button></li>
                                        <li class="node"><button id="options" title="<spring:message code='ADH_1115_TOOLTIP_DISPLAY_SETUP'/>" class="button capsule mutton up" disabled="disabled"><span class="wrap">Options<span class="icon"></span><span class="indicator"></span></span></button></li>
                                    </ul>
                                </c:if>
                            </li>
                        </ul>
                    </c:if>
                    <c:if test="${olapCrosstabMode == 'selected'}">
                        <ul class="list buttonSet">
                            <li class="node">
                                <ul class="list buttons">
                                    <li class="leaf"><button id="explorer" title="<spring:message code='ADH_1100_TOOLTIP_PRESENTATION_MODE'/>" class="button capsule down first"><span class="wrap">Preview<span class="icon"></span></span></button></li>
                                    <li class="node"><button id="save" title="<spring:message code='ADH_1101_TOOLTIP_SAVE'/>" class="button capsule mutton up last" disabled="disabled" ${canSaveOrExport}><span class="wrap">Save<span class="icon"></span><span class="indicator"></span></span></button></li>
                                </ul>
                            </li>
                            <li class="node">
                                <ul class="list buttonSet">
                                    <li class="leaf"><button id="undo" title="<spring:message code='ADH_1103_TOOLTIP_UNDO'/>" class="button capsule up first" disabled="disabled" ${canUndo}><span class="wrap">Undo<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="redo" title="<spring:message code='ADH_1104_TOOLTIP_REDO'/>" class="button capsule up  middle" disabled="disabled" ${canRedo}><span class="wrap">Redo<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="undoAll" title="<spring:message code='ADH_1105_TOOLTIP_RESET'/>" class="button capsule up last" disabled="disabled" ${canUndo}><span class="wrap">Undo All<span class="icon"></span></span></button></li>
                                </ul>
                            </li>
                            <li class="node">
                                <ul class="list buttons">
                                    <!-- <li class="leaf"><button id="presentation" title="<spring:message code='ADH_1100_TOOLTIP_PRESENTATION_MODE'/>" class="button capsule up" disabled="disabled"><span class="wrap">Preview<span class="icon"></span></span></button></li> -->
                                    <li class="leaf"><button id="pivot" title="<spring:message code='ADH_1107_TOOLTIP_PIVOT'/>" class="button capsule up" disabled="disabled" ${canPivot}><span class="wrap">Pivot<span class="icon"></span></span></button></li>
                                    <!-- <li class="leaf"><button id="toggleDisplayManager" title="<spring:message code='ADH_1213_TOOLTIP_TOGGLE_DISPLAY_MANAGER'/>" class="button capsule up" disabled="disabled"><span class="wrap">Toggle Display Manager<span class="icon"></span></span></button></li> -->
                                    <li class="node"><button id="options" title="<spring:message code='ADH_1115_TOOLTIP_DISPLAY_SETUP'/>" class="button capsule mutton up" disabled="disabled"><span class="wrap">Options<span class="icon"></span><span class="indicator"></span></span></button></li>
                                </ul>
                            </li>
                        </ul>
                    </c:if>
                </div>
                <%--sub toolbar buttons--%>
                <div class="sub header">
                    <%--empty sub header--%>
                </div>
            </tiles:putAttribute>
            <tiles:putAttribute name="bodyID" cascade="true">adhocCanvasContainer</tiles:putAttribute>
            <tiles:putAttribute name="bodyClass" cascade="true" value=""/>
            <tiles:putAttribute name="bodyContent" cascade="true">
                <div id="mainTableContainer" class="${requestScope.viewModel.theme} ${isIPad ? 'swipeScroll' : ''}">
                    <c:if test="${isIPad}"><div class="scrollWrapper"></c:if>
                        <table id='canvasTable' class='data table wrapper default'></table>
                    <c:if test="${isIPad}"></div></c:if>
                </div>
            </tiles:putAttribute>
            <tiles:putAttribute name="footerContent" cascade="true">
                <tiles:insertAttribute name="primary_FooterContent" ignore="true"/>
            </tiles:putAttribute>
        </tiles:insertTemplate>

        <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <tiles:putAttribute name="containerID" value="filters"/>
            <tiles:putAttribute name="containerClass" value="column decorated secondary sizeable ${isIPad ? 'minimized' : ''}"/>
            <tiles:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </tiles:putAttribute>
            <tiles:putAttribute name="containerTitle">
                <spring:message code="ADH_187_FILTERS_TITLE"/>
            </tiles:putAttribute>
            <tiles:putAttribute name="headerContent">
                <span id="filterPanelMutton" class="button mutton"></span>
            </tiles:putAttribute>
            <tiles:putAttribute name="bodyID" cascade="false">filter-container</tiles:putAttribute>
            <tiles:putAttribute name="bodyClass" cascade="false" value=""/>
            <tiles:putAttribute name="swipeScroll" value="${isIPad}"/>
            <tiles:putAttribute name="bodyContent" cascade="false">
                <%--<c:import url="${viewModel.viewResources['filterPanel']}.jsp"/>--%>
            </tiles:putAttribute>
            <tiles:putAttribute name="footerContent" cascade="false">
                <tiles:insertAttribute name="secondary_FooterContent" ignore="true"/>
            </tiles:putAttribute>
        </tiles:insertTemplate>
        <%--ajax buffer--%>
        <div id="ajaxbuffer" style="display: none;" ></div>

        <%-- This form is used for submit actions --%>
        <form id="exportActionForm" action="<c:url value="reportGenerator.html"/>" method="get">
            <input type="hidden" name="action" value="displayTempReportUnit"/>
            <input type="hidden" name="exportFormat" value=""/>
            <input type="hidden" name="clientKey" value="${clientKey}"/>
        </form>

        <!-- ========== INPUT CONTROLS DIALOG =========== -->
        <t:insertTemplate template="/WEB-INF/jsp/templates/inputControls.jsp">
            <tiles:putAttribute name="containerTitle"><spring:message code="input.control.dialog.title" javaScriptEscape="true"/></tiles:putAttribute>
            <tiles:putAttribute name="containerClass" value="sizeable hidden"/>
            <%--<t:putAttribute name="hasReportOptions" value="false"/>--%>
            <t:putAttribute name="bodyContent">
                <ul class="list inputControls" id="inputControlsContainer">
                </ul>

                <div class="control checkBox">
                    <label class="wrap" for="filterssaveasdefault" title="<spring:message code="ADH_183_FILTERS_SAVE_AS_DEFAULT"  javaScriptEscape="true"/>">
                        <spring:message code="ADH_183_FILTERS_SAVE_AS_DEFAULT"  javaScriptEscape="true"/>
                    </label>
                    <input id="filterssaveasdefault" name="filterssaveasdefault" type="checkbox" checked>
                </div>
            </t:putAttribute>
        </t:insertTemplate>

        <%@ include file="adHocMessages.jsp" %>
        <%@ include file="adHocConstants.jsp" %>
    </tiles:putAttribute>
</tiles:insertTemplate>




