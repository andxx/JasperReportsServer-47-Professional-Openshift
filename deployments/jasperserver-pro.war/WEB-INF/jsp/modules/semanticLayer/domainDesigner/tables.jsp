<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ page contentType="text/html" %>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle">
        <spring:message code='page.tables.pageTitle' javaScriptEscape='true'/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="domainDesigner_tables"/>
    <t:putAttribute name="bodyClass" value="oneColumn"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tools.drag.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.nanotree.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.events.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.treenode.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.treesupport.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.utils.js"></script>        
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.validators.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.tables.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.tables.dialogs.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.tables.validators.js"></script>
        <c:choose>
            <c:when test="${presentationSelected}">
                <c:set var="doneButtonDisabledAttribute" value=""/>
            </c:when>
            <c:otherwise>
                <c:set var="doneButtonDisabledAttribute">disabled="disabled"</c:set>
            </c:otherwise>
        </c:choose>
        <c:choose>
            <c:when test="${autoGenerateJoins}">
                <c:set var="autoGenerateJoinsCheckedAttribute">checked="checked"</c:set>
            </c:when>
            <c:otherwise>
                <c:set var="autoGenerateJoinsCheckedAttribute" value=""/>
            </c:otherwise>
        </c:choose>
    </t:putAttribute>

    <t:putAttribute name="bodyContent" >
		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
			<t:putAttribute name="containerClass" value="column decorated primary tabbed showingToolBar"/>
		    <t:putAttribute name="containerTitle">
                <spring:message code='page.tables.title' javaScriptEscape='true'/> ${slName}
            </t:putAttribute>
            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="headerContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/domainDesignerFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="tables"/>
                </t:insertTemplate>
            </t:putAttribute>
		    <t:putAttribute name="bodyContent">
                <t:putAttribute name="bodyClass" value="twoColumn_equal pickWells"/>

                <form id="stepDisplayForm" class="hidden">
                    <input type="hidden" id="selectedModel" name="selectedModel" value=""/>
                    <input type="hidden" id="autoGenerateJoins" name="autoGenerateJoins" value=""/>
                    <input type="hidden" id="datasources" name="datasources" value=""/>
                    <input type="hidden" id="page" name="page" value="tables"/>
                    <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
                </form>

                <div id="moveButtons" class="moveButtons centered_horz">
                    <button id="right" class="button action square move right up" title="<spring:message code='button.tables.moveRight' javaScriptEscape='true'/>">
                        <span class="wrap"><spring:message code='button.tables.moveRight' javaScriptEscape='true'/><span class="icon"></span></span>
                    </button>
                    <button id="left" class="button action square move left up" title="<spring:message code='button.tables.moveLeft' javaScriptEscape='true'/>">
                        <span class="wrap"><spring:message code='button.tables.moveLeft' javaScriptEscape='true'/><span class="icon"></span></span>
                    </button>
                    <!--

<button id="toRight" class="button action square move toRight up" title="<spring:message code='button.tables.moveAllRight' javaScriptEscape='true'/>">
                        <span class="wrap"><spring:message code='button.tables.moveAllRight' javaScriptEscape='true'/><span class="icon"></span></span>
                    </button>
-->

                    <button id="toLeft" class="button action square move toLeft up" title="<spring:message code='button.tables.moveAllLeft' javaScriptEscape='true'/>">
                        <span class="wrap"><spring:message code='button.tables.moveAllLeft' javaScriptEscape='true'/><span class="icon"></span></span>
                    </button>
                </div>

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated primary"/>
                    <t:putAttribute name="containerID" value="destTablesColumn"/>
                    <t:putAttribute name="containerTitle"><spring:message code='page.tables.selectedTables' javaScriptEscape='true'/></t:putAttribute>
                    <t:putAttribute name="bodyContent">
                        <ul id="destinationTablesTree"></ul>
                    </t:putAttribute>

                    <t:putAttribute name="footerContent">
                        <div class="control checkBox">
                            <label class="wrap" for="inspectAndJoin" title="<spring:message code='checkBox.tables.inspectTables' javaScriptEscape='true'/>">
                                <spring:message code='checkBox.tables.inspectTables' javaScriptEscape='true'/>
                            </label>
                            <input class="" id="inspectAndJoin" type="checkbox" ${autoGenerateJoinsCheckedAttribute}/>
                        </div>
                    </t:putAttribute>

                </t:insertTemplate>

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                    <t:putAttribute name="containerID" value="sourceTablesColumn"/>
                    <t:putAttribute name="containerElements">
                        <div class="sizer horizontal"></div>
                        <button class="button minimize"></button>
                    </t:putAttribute>
                    <t:putAttribute name="containerTitle">
                        <spring:message code='page.tables.dataSource' javaScriptEscape='true'/>
                    </t:putAttribute>
                    <t:putAttribute name="headerContent">
                        <a id="dataSource" class="launcher"></a>
                    </t:putAttribute>
                    <t:putAttribute name="bodyContent">
                        <ul id="sourceTablesTree"></ul>
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

        <t:insertTemplate template="/WEB-INF/jsp/templates/manageDataSource.jsp">
            <t:putAttribute name="containerClass">centered_vert centered_horz hidden</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <ul id="selectDataSourceTree"></ul>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/detail.jsp">
            <t:putAttribute name="containerClass" value="sizeable hidden"/>
            <t:putAttribute name="bodyContent">
                <ul id="detailsList"></ul>
                <div id="detailsText"></div>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/select.jsp">
            <t:putAttribute name="containerClass" value="sizeable hidden"/>
            <t:putAttribute name="containerTitle"><spring:message code="domain.designer.tables.select.schemas.dialog.title"/></t:putAttribute>
            <t:putAttribute name="bodyContent">
                <ul id="schemasList"></ul>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/standardConfirm.jsp">
            <t:putAttribute name="containerTitle"><spring:message code="DIALOG_EXPORT_BUNDLE_TITLE"/></t:putAttribute>
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

                <div id="deleteSchemaResourcesConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.tables.deleteSchemaResources_1"/></p>
                    <p class="message"><spring:message code="domain.designer.tables.deleteSchemaResources_2"/></p>
                    <a class="launcher" id="schemaResourceDetails"><spring:message code="domain.designer.tables.deleteSchemaResources_3"/></a>
                </div>

                <div id="calcFieldsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteCalculatedFields_1"/></p>
                    <a class="launcher" id="calcFieldsDetails"><spring:message code="domain.designer.deleteCalculatedFields_2"/></a>
                </div>

                <div id="deleteFiltersConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteFilters_1"/></p>
                    <a class="launcher" id="filtersDetails"><spring:message code="domain.designer.deleteFilters_2"/></a>
                </div>

                <div id="fixSchemaPrefixesConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.tables.fixSchemaPrefixes_1"/></p>
                    <p class="message"><spring:message code="domain.designer.tables.fixSchemaPrefixes_2"/></p>
                    <p class="message"><spring:message code="domain.designer.tables.fixSchemaPrefixes_3"/></p>
                    <a class="launcher" id="tablesDetails"><spring:message code="domain.designer.tables.fixSchemaPrefixes_4"/></a>
                </div>

                <div id="regenerateJoinsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.tables.regenerateJoins_1"/></p>
                    <a class="launcher" id="joinsDetails"><spring:message code="domain.designer.tables.regenerateJoins_2"/></a>
                </div>

                <div id="emptySetsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.emptySets_1"/></p>
                    <p class="message"><spring:message code="domain.designer.emptySets_2"/></p>
                    <a class="launcher" id="emptySetsDetails"><spring:message code="domain.designer.emptySets_3"/></a>
                </div>
            </t:putAttribute>
            <t:putAttribute name="leftButtonId" value="confirmYes"/>
            <t:putAttribute name="rightButtonId" value="confirmNo"/>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="tablesState.jsp"/>
    </t:putAttribute>

</t:insertTemplate>
