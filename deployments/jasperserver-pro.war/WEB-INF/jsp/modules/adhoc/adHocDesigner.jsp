<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>
<%--tag libs--%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@ taglib uri="/spring" prefix="spring"%>
<%@ taglib uri="/WEB-INF/jasperserver.tld" prefix="js" %>
<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>

<%@ include file="adHocDesignerVariables.jsp"%>

<%@ include file="/WEB-INF/jsp/jsTemplates/chart.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/table.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/tableRowsIncludingTable.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/crosstab.jsp" %>
<%@ include file="/WEB-INF/jsp/jsTemplates/layoutManager.jsp" %>
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

<tiles:insertTemplate template="/WEB-INF/jsp/templates/dependencies.jsp">
    <tiles:putAttribute name="containerClass" value="hidden centered_vert centered_horz"/>

    <tiles:putAttribute name="bodyContent">
        <ul id="dependenciesList">
        </ul>
    </tiles:putAttribute>
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

<%--select fields for re-entrant adhoc--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/selectFields.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
    <tiles:putAttribute name="bodyContent">
        <tiles:putAttribute name="availableFields">
            <ul id="sourceFieldsTree"></ul>
        </tiles:putAttribute>
        <tiles:putAttribute name="selectedFields">
            <ul id="destinationFieldsTree"></ul>
            <input type="hidden" id="selectedModel" name="selectedModel" value=""/>
            <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
        </tiles:putAttribute>
    </tiles:putAttribute>
</tiles:insertTemplate>

<%--adhoc themes--%>
<tiles:insertTemplate template="adHocThemeSelectPalete.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
</tiles:insertTemplate>

<%--adhoc edit label--%>
<tiles:insertTemplate template="/WEB-INF/jsp/templates/editLabel.jsp">
    <tiles:putAttribute name="containerClass" value="hidden"/>
</tiles:insertTemplate>

<tiles:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <tiles:putAttribute name="pageTitle"><spring:message code='ADH_001_TITLE'/></tiles:putAttribute>
    <tiles:putAttribute name="bodyID" value="designer"/>
    <tiles:putAttribute name="bodyClass" value="threeColumn"/>
    <tiles:putAttribute name="headerContent">
    </tiles:putAttribute>
    <tiles:putAttribute name="bodyContent">
        <%--script dependencies--%>
        <%@ include file="adHocScriptHeader.jsp"%>
        <%--include base constant variables--%>
        <%@ include file="adHocBaseScripts.jsp"%>

        <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <tiles:putAttribute name="containerID" value="${primaryColumnID}"/>
            <%-- <tiles:putAttribute name="containerClass" cascade="false" value="column decorated primary showingToolBar showingSubHeader"/> --%>
            <tiles:putAttribute name="containerClass" cascade="false">column decorated primary showingToolBar</tiles:putAttribute>
            <tiles:putAttribute name="containerTitle" cascade="false"><spring:message code='ADH_002c_CANVAS'/><%--${requestScope.defaultAruName}--%></tiles:putAttribute>
            <tiles:putAttribute name="headerContent" cascade="false">
                <div id="adhocToolbar" class="toolbar">
                    <ul class="list buttonSet">
                        <li class="node">
                            <ul class="list buttonSet">
                                <li class="leaf"><button id="presentation" title="<spring:message code='ADH_1100_TOOLTIP_PRESENTATION_MODE'/>" class="button capsule up first"><span class="wrap">Preview<span class="icon"></span></span></button></li>
                                <li class="node"><button id="save" title="<spring:message code='ADH_1101_TOOLTIP_SAVE'/>" class="button capsule mutton up middle" ${canSaveOrExport}><span class="wrap">Save<span class="icon"></span><span class="indicator"></span></span></button></li>
								<li class="node"><button id="export" class="button capsule mutton up last" ${canSaveOrExport} title="<spring:message code="button.export"/>"><span class="wrap">Export<span class="icon"></span><span class="indicator"></span></span></button></li>
                                <!-- <li class="leaf"><button id="execute" title="<spring:message code='ADH_1102_TOOLTIP_RUN_REPORT'/>" class="button capsule up last" ${canSaveOrExport}><span class="wrap"><spring:message code='ADH_1102_TOOLTIP_RUN_REPORT'/><span class="icon"></span></span></button></li> -->
                            </ul>
                        </li>
                        <li class="node">
                            <ul class="list buttonSet">
                                <li class="leaf"><button id="undo" title="<spring:message code='ADH_1103_TOOLTIP_UNDO'/>" class="button capsule up first" ${canUndo}><span class="wrap">Undo<span class="icon"></span></span></button></li>
                                <li class="leaf"><button id="redo" title="<spring:message code='ADH_1104_TOOLTIP_REDO'/>" class="button capsule up  middle" ${canRedo}><span class="wrap">Redo<span class="icon"></span></span></button></li>
                                <li class="leaf"><button id="undoAll" title="<spring:message code='ADH_1105_TOOLTIP_RESET'/>" class="button capsule up last" ${canUndo}><span class="wrap">Undo All<span class="icon"></span></span></button></li>
                            </ul>
                        </li>
                        <li class="node">
                            <c:if test="${olapCrosstabMode != 'selected'}">
                                <ul class="list buttonSet">
                                    <li class="leaf"><button id="pivot" title="<spring:message code='ADH_1107_TOOLTIP_PIVOT'/>" class="button capsule up first" ${canPivot}><span class="wrap">Pivot<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="sort" title="<spring:message code='ADH_1108_TOOLTIP_SORT'/>" class="button capsule up middle" ${canSort}><span class="wrap">Sort<span class="icon"></span></span></button></li>
                                    <li class="leaf"><button id="controls" title="<spring:message code='ADH_1109_TOOLTIP_FILTER'/>" class="button capsule up middle" ${isDomainReport}><span class="wrap">Input Controls<span class="icon"></span></span></button></li>
                                    <!--<li class="leaf"><button id="styles" title="<spring:message code='ADH_1110_TOOLTIP_STYLES'/>" class="button capsule up middle"><span class="wrap">Styles<span class="icon"></span></span></button></li>-->
                                    <li class="node"><button id="options" title="<spring:message code='ADH_1112_TOOLTIP_PAGE_SETUP'/>" class="button capsule mutton up last"><span class="wrap">Options<span class="icon"></span><span class="indicator"></span></span></button></li>
                                </ul>
                            </c:if>
                            <c:if test="${olapCrosstabMode == 'selected'}">
                                <ul class="list buttonSet">
                                    <li class="leaf"><button id="pivot" title="<spring:message code='ADH_1107_TOOLTIP_PIVOT'/>" class="button capsule up first" ${canPivot}><span class="wrap">Pivot<span class="icon"></span></span></button></li>
                                    <li class="node"><button id="options" title="<spring:message code='ADH_1115_TOOLTIP_DISPLAY_SETUP'/>" class="button capsule mutton up last"><span class="wrap">Options<span class="icon"></span><span class="indicator"></span></span></button></li>
                                </ul>
                            </c:if>
                        </li>
                    </ul>
                </div>
                <div style="background:#fff;">
                    <c:if test="${olapCrosstabMode != 'selected'}">
                    <%--sub toolbar buttons--%>
                    <div class="sub header">
                        <ul id="dataMode" class="list tabSet text control horizontal responsive">
                            <li id="sample-data" class="tab ${sampleData}"><p class="button wrap"><span><spring:message code="ADH_107_DESIGNER_SAMPLEDATA_LABEL"/></span></p></li>
                            <li id="full-data" class="tab ${fullData} last"><p class="button wrap"><span><spring:message code="ADH_108_DESIGNER_FULLDATA_LABEL"/></span></p></li>
                        </ul>
                        <ul id="displayMode" class="list tabSet text control horizontal responsive">
                            <li id="table-mode" class="tab ${tableMode}"><p class="button wrap"><span><spring:message code="ADH_003a_TABLE"/></span></p></li>
                            <li id="chart-mode" class="tab ${chartMode}"><p class="button wrap"><span><spring:message code="ADH_003b_CHART"/></span></p></li>
                            <li id="crosstab-mode" class="tab ${crosstabMode} last"><p class="button wrap"><span><spring:message code="ADH_003c_CROSSTAB"/></span></p></li>
                        </ul>
                    </div>
                    </c:if>

                    <table class="displayManager hidden" id="displayManagerPanel">
                        <tbody>
                            <tr id="columns" class="axis">
                            <td class="title">
                                <c:if test="${tableMode == 'selected'}">
                                    <spring:message code="ADH_1213_DISPLAY_MANAGER_COLUMNS_TITLE"/>
                                </c:if>
                                <c:if test="${chartMode == 'selected'}">
                                    <spring:message code="ADH_1213_DISPLAY_MANAGER_MEASURES_TITLE"/>
                                </c:if>
                                <c:if test="${crosstabMode == 'selected' || olapCrosstabMode == 'selected'}">
                                    <spring:message code="ADH_1213_DISPLAY_MANAGER_COLUMNS_TITLE"/>
                                </c:if>
                            </td>
                            <td class="slot">
                                <ul id='olap_columns' class="tokens sortable" style="z-index:99;"/>
                            </td>
                        </tr>
                        <tr id="rows" class="axis">
                            <td class="title">
                                <c:if test="${tableMode == 'selected'}">
                                    <spring:message code="ADH_1213_DISPLAY_MANAGER_GROUPS_TITLE"/>
                                </c:if>
                                <c:if test="${chartMode == 'selected'}">
                                    <spring:message code="ADH_1213_DISPLAY_MANAGER_GROUP_TITLE"/>
                                </c:if>
                                <c:if test="${crosstabMode == 'selected' || olapCrosstabMode == 'selected'}">
                                    <spring:message code="ADH_1213_DISPLAY_MANAGER_ROWS_TITLE"/>
                                </c:if>
                            </td>
                            <td class="slot">
                                <ul id='olap_rows' class="tokens sortable" style="z-index:99;"/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </tiles:putAttribute>
            <tiles:putAttribute name="bodyID" cascade="false">adhocCanvasContainer</tiles:putAttribute>
            <tiles:putAttribute name="bodyContent" cascade="false">
                <div id="mainTableContainer" class="${requestScope.viewModel.theme}">
                    <c:if test="${isIPad}"><div class="scrollWrapper"></c:if>
                        <table id='canvasTable' class='data table wrapper default'></table>
                    <c:if test="${isIPad}"></div></c:if>
                </div>
                <div id="mainTableContainerOverlay" class="hidden"></div>
                <t:insertTemplate template="/WEB-INF/jsp/templates/nothingToDisplay.jsp">
                    <t:putAttribute name="containerID" value="nothingToDisplay"/>
                    <t:putAttribute name="containerClass" value="${isIPad ? 'centered_fn_adhocCenterElement' : ''}"/>
                    <t:putAttribute name="bodyContent">
                        <p id="nothingToDisplayMessage" class="message">
                        </p>
                    </t:putAttribute>
                </t:insertTemplate>
            </tiles:putAttribute>
        </tiles:insertTemplate>

        <%--available fields section--%>
        <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <tiles:putAttribute name="containerID" value="fields"/>
            <tiles:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
            <tiles:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </tiles:putAttribute>
            <tiles:putAttribute name="containerTitle" cascade="false">
                <c:choose>
                            <c:when test="${olapCrosstabMode == 'selected'}">
                                <spring:message code='ADH_045d_OLAP'/>: <c:out escapeXml="true" value="${cubeLabel}"/>
                            </c:when>
                            <c:otherwise>
                                <c:choose>
                                    <c:when test="${requestScope.isItDomainReport}">
                                        <spring:message code='ADH_045a_DOMAIN'/>: ${requestScope.viewModel.topicName}
                                    </c:when>
                                    <c:otherwise> <spring:message code='ADH_045b_TOPIC'/>: ${requestScope.viewModel.topicName}</c:otherwise>
                                </c:choose>
                            </c:otherwise>
                </c:choose>
            </tiles:putAttribute>
            <tiles:putAttribute name="headerContent">
                <span id="availableFieldsMutton" class="button mutton"></span>
            </tiles:putAttribute>
            <tiles:putAttribute name="bodyID" >availableFields</tiles:putAttribute>
            <tiles:putAttribute name="bodyClass" value="${availFieldsPanelClass}"/>
            <tiles:putAttribute name="swipeScroll" value="${isIPad}"/>
            <tiles:putAttribute name="bodyContent">
                <c:choose>
                    <c:when test="${olapCrosstabMode == 'selected'}">
                        <c:set var="dimensionsTreeClass" value="dimension"/>
                    </c:when>
                    <c:otherwise>
                        <c:set var="dimensionsTreeClass" value="dimension attribute"/>
                    </c:otherwise>
                </c:choose>
                <%-- two trees inside sizeable panel will be shown --%>
                <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <tiles:putAttribute name="containerTitle">
                         <c:choose>
                            <c:when test="${olapCrosstabMode == 'selected'}">
                                <spring:message code='ADH_1213_AVAILABLE_FIELDS_PANEL_DIMENSIONS'/>
                            </c:when>
                            <c:otherwise><spring:message code='ADH_112_AVAILABLE_FIELDS'/></c:otherwise>
                         </c:choose>
                    </tiles:putAttribute>
                    <tiles:putAttribute name="containerClass" value="primary panel pane sizeable ${dimensionsTreeClass}"/>
                    <tiles:putAttribute name="bodyContent">
                        <ul id="dimensionsTree"></ul>
                    </tiles:putAttribute>
                </tiles:insertTemplate>

                <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <tiles:putAttribute name="containerTitle">
                        <spring:message code='ADH_1213_AVAILABLE_FIELDS_PANEL_MEASURES'/>
                    </tiles:putAttribute>
                    <tiles:putAttribute name="containerElements">
                        <div class="sizer vertical"></div>
                    </tiles:putAttribute>
                    <tiles:putAttribute name="containerClass" value="panel pane secondary sizeable measure"/>
                    <tiles:putAttribute name="bodyContent">
                        <ul id="measuresTree"></ul>
                    </tiles:putAttribute>
                </tiles:insertTemplate>
            </tiles:putAttribute>
        </tiles:insertTemplate>

        <tiles:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <tiles:putAttribute name="containerID" value="filters"/>
            <tiles:putAttribute name="containerClass" value="column decorated tertiary sizeable ${isIPad ? 'minimized' : ''}"/>
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

        <t:insertTemplate template="/WEB-INF/jsp/templates/saveDataViewAndReport.jsp">
            <t:putAttribute name="containerClass" value="hidden centered_vert centered_horz"/>
            <t:putAttribute name="bodyContent" >
                <ul class="responsive collapsible folders hideRoot" id="saveDataViewAndReportFoldersTree"></ul>
            </t:putAttribute>
        </t:insertTemplate>

        <%@ include file="adHocMessages.jsp" %>
        <%@ include file="adHocConstants.jsp" %>
    </tiles:putAttribute>
</tiles:insertTemplate>



