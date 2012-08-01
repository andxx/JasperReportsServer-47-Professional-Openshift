<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle">
        <spring:message code='page.derivedTables.pageTitle' javaScriptEscape='true'/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="domainDesigner_derivedTables"/>
    <t:putAttribute name="bodyClass" value="oneColumn"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.nanotree.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.events.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.treenode.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.treesupport.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.utils.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.validators.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.derivedTables.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/components.tabs.js"></script>
        <c:choose>
            <c:when test="${presentationSelected}">
                <c:set var="doneButtonDisabledAttribute" value=""/>
            </c:when>
            <c:otherwise>
                <c:set var="doneButtonDisabledAttribute">disabled="disabled"</c:set>
            </c:otherwise>
        </c:choose>
    </t:putAttribute>

    <t:putAttribute name="bodyContent" >

		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
			<t:putAttribute name="containerClass" value="column decorated primary tabbed showingToolBar"/>
		    <t:putAttribute name="containerTitle">
                <spring:message code='page.derivedTables.title' javaScriptEscape='true'/> ${slName}
            </t:putAttribute>

            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="headerContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/domainDesignerFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="derivedTables"/>
                </t:insertTemplate>
            </t:putAttribute>
		    <t:putAttribute name="bodyContent">
                <t:putAttribute name="bodyClass" value="twoColumn"/>
                <form id="stepDisplayForm">
                    <input type="hidden" id="selectedModel" name="selectedModel" value=""/>
                    <input type="hidden" id="page" name="page" value="query"/>
                    <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
                </form>

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated primary"/>
                    <t:putAttribute name="containerID" value="derivedTableDetailsPanel"/>
                    <t:putAttribute name="containerTitle"><spring:message code='domain.designer.derivedTables.derivedTable' javaScriptEscape='true'/></t:putAttribute>

                    <t:putAttribute name="bodyContent">
                        <fieldset class="group">
                            <legend class="offLeft"><span><spring:message code='domain.designer.derivedTables.defineTheQuery' javaScriptEscape='true'/></span></legend>
                            <label class="control input text" for="queryName" title="<spring:message code='domain.designer.derivedTables.queryId.title' javaScriptEscape='true'/>">
                                <span class="wrap"><spring:message code='domain.designer.derivedTables.queryId' javaScriptEscape='true'/></span>
                                <input class="" id="queryName" type="text" value=""/>
                                <span class="message warning">error message here</span>
                            </label>

                            <label class="control input text" for="dataSource" title="<spring:message code='domain.designer.derivedTables.dataSource.title' javaScriptEscape='true'/>">
                                <span class="wrap"><spring:message code='domain.designer.derivedTables.dataSource' javaScriptEscape='true'/></span>
                                <input class="" id="dataSource" type="text" value="${selectedDatasource}" readonly="readonly"/>
                                <span class="message warning">error message here</span>
                            </label>

                            <label class="control textArea taller" for="expression" title="<spring:message code='domain.designer.derivedTables.expression.title' javaScriptEscape='true'/>">
                                <span class="wrap"><spring:message code='domain.designer.derivedTables.expression' javaScriptEscape='true'/></span>
                                <textarea id="expression"/></textarea>
                                <span class="message hint"><spring:message code='domain.designer.derivedTables.expression.hint' javaScriptEscape='true'/></span>
                                <span class="message warning">error message here</span>
                            </label>
                            <button id="runQuery" class="button action up"><span class="wrap"><spring:message code='button.derivedTablesRunQuery' javaScriptEscape='true'/></span><span class="icon"></span></button>

                            <fieldset id="queryResults" class="">
                                <legend class="offLeft"><span><spring:message code='domain.designer.derivedTables.resultsLegend' javaScriptEscape='true'/></span></legend>

                                <label id="error" class="control textArea taller" for="errorReport" title="<spring:message code='domain.designer.derivedTables.error.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.derivedTables.error' javaScriptEscape='true'/></span>
                                    <textarea id="errorReport" readonly="readonly"/> </textarea>
                                </label>

                                <label id="results" class="control select multiple taller" for="returnedFields" title="<spring:message code='domain.designer.derivedTables.returnedFields.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.derivedTables.selectFields' javaScriptEscape='true'/></span>
                                    <select id="returnedFields" name="" multiple="multiple"> </select>
                                    <span class="message hint"><spring:message code='domain.designer.derivedTables.selectFields.hint' javaScriptEscape='true'/></span>
                                    <span class="message warning">error message here</span>
                                </label>

                            </fieldset>

                        </fieldset>
                    </t:putAttribute>

                    <t:putAttribute name="footerContent">
                        <button id="saveTable" class="button action primary up"><span class="wrap"><spring:message code='button.derivedTables.saveTable' javaScriptEscape='true'/></span><span class="icon"></span></button>
                        <button id="cancelSave" class="button action up"><span class="wrap"><spring:message code="button.cancel" javaScriptEscape="true"/></span><span class="icon"></span></button>
                    </t:putAttribute>

                </t:insertTemplate>

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                    <t:putAttribute name="containerID" value="fields"/>
                    <t:putAttribute name="containerElements">
                        <div class="sizer horizontal"></div>
                    </t:putAttribute>
                    <t:putAttribute name="containerTitle"><spring:message code='domain.designer.derivedTables.availableObjects' javaScriptEscape='true'/></t:putAttribute>

                    <t:putAttribute name="bodyContent">
                            <ul id="itemsTree" class=""></ul>
                    </t:putAttribute>
                </t:insertTemplate>
                <!-- end two columns -->
			</t:putAttribute>
            <t:putAttribute name="footerContent">
                <fieldset id="wizardNav">
                    <button id="done" class="button action primary up" ${doneButtonDisabledAttribute}><span class="wrap"><spring:message code="button.ok" javaScriptEscape="true"/></span><span class="icon"></span></button>
                    <button id="cancelButton" class="button action up"><span class="wrap"><spring:message code="button.cancel" javaScriptEscape="true"/></span><span class="icon"></span></button>
                </fieldset>
            </t:putAttribute>
		</t:insertTemplate>

        <%-- DO not remove theese dialogs they are used for common domain designer logic --%>
        <t:insertTemplate template="/WEB-INF/jsp/templates/detail.jsp">
            <t:putAttribute name="containerClass" value="sizeable hidden"/>
            <t:putAttribute name="bodyContent">
                <ul id="detailsList"></ul>
                <div id="detailsText"></div>
            </t:putAttribute>
        </t:insertTemplate>
        
        <t:insertTemplate template="/WEB-INF/jsp/templates/standardConfirm.jsp">
            <t:putAttribute name="containerClass">centered_vert centered_horz hidden</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <div id="exportSchemaPrefixesConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.exportSchemaPrefixes"/></p>
                </div>

                <div id="exportBundlesConfirmMessage" class="hidden">
                    <p class="message">
                        <div id="autoGenerateLabelKeys" class="control checkBox">
                            <label class="wrap" for="generateLabelKeys"
                               title="<spring:message code='checkbox.domain.generateLabelKeys' javaScriptEscape='true'/>">
                                <spring:message code='checkbox.domain.generateLabelKeys' javaScriptEscape='true'/>
                            </label>
                            <input class="" id="generateLabelKeys" type="checkbox"/>
                        </div>
                    </p>

                    <p class="message">
                        <div id="autoGenerateDescriptionKeys" class="control checkBox">
                            <label class="wrap" for="generateDescriptionKeys"
                               title="<spring:message code='checkbox.domain.generateDesriptionKeys' javaScriptEscape='true'/>">
                                <spring:message code='checkbox.domain.generateDesriptionKeys' javaScriptEscape='true'/>
                            </label>
                            <input class="" id="generateDescriptionKeys" type="checkbox"/>
                        </div>
                    </p>
                </div>

                <div id="invalidDesignConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.invalidDesign_1"/></p>
                    <p class="message"><spring:message code="domain.designer.invalidDesign_2"/></p>
                    <a class="launcher" id="designDetails"><spring:message code="domain.designer.invalidDesign_3"/></a>
                </div>

                <div id="emptySetsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.emptySets_1"/></p>
                    <p class="message"><spring:message code="domain.designer.emptySets_2"/></p>
                    <a class="launcher" id="emptySetsDetails"><spring:message code="domain.designer.emptySets_3"/></a>
                </div>

                <div id="calcFieldsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteCalculatedFields_1"/></p>
                    <a class="launcher" id="calcFieldsDetails"><spring:message code="domain.designer.deleteCalculatedFields_2"/></a>
                </div>

                <div id="deleteFiltersConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteFilters_1"/></p>
                    <a class="launcher" id="filtersDetails"><spring:message code="domain.designer.deleteFilters_2"/></a>
                </div>

            </t:putAttribute>
            <t:putAttribute name="leftButtonId" value="confirmYes"/>
            <t:putAttribute name="rightButtonId" value="confirmNo"/>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="derivedTablesState.jsp"/>
    </t:putAttribute>

</t:insertTemplate>
