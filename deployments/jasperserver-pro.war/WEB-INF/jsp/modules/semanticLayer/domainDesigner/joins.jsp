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
        <spring:message code='page.joins.pageTitle' javaScriptEscape='true'/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="domainDesigner_joins"/>
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
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.joins.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.joins.validators.js"></script>
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
                <spring:message code='page.joins.title' javaScriptEscape='true'/> ${slName}
            </t:putAttribute>
            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="headerContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/domainDesignerFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="joins"/>
                </t:insertTemplate>
            </t:putAttribute>

		    <t:putAttribute name="bodyContent">
                <t:putAttribute name="bodyClass" value="twoColumn primaryLeft"/>
                
                <form id="stepDisplayForm">
                    <input type="hidden" id="selectedModel" name="selectedModel" value=""/>
                    <input type="hidden" id="page" name="page" value="joins"/>
                    <input type="hidden" id="joinsInput" name="joinsInput" value=""/>
                    <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
                </form>

                <div class="column simple sizeable primary">
                <div class="sizer horizontal"></div>

                <div id="pickWells" class="body twoColumn_equal pickWells">
                    <!-- start two columns -->
                    <div id="moveButtons" class="moveButtons centered_horz">
                        <button id="inner" class="button join square action inner up" title="<spring:message code='button.joins.innerJoin' javaScriptEscape='true'/>">
                            <span class="wrap"><spring:message code='button.joins.innerJoin' javaScriptEscape='true'/><span class="icon"></span></span>
                        </button>
                        <button id="left" class="button join square action left up" title="<spring:message code='button.joins.leftJoin' javaScriptEscape='true'/>">
                            <span class="wrap"><spring:message code='button.joins.leftJoin' javaScriptEscape='true'/><span class="icon"></span></span>
                        </button>
                        <button id="right" class="button join square action right up" title="<spring:message code='button.joins.rightJoin' javaScriptEscape='true'/>">
                            <span class="wrap"><spring:message code='button.joins.rightJoin' javaScriptEscape='true'/><span class="icon"></span></span>
                        </button>
                        <button id="full" class="button join square action full up" title="<spring:message code='button.joins.fullJoin' javaScriptEscape='true'/>">
                            <span class="wrap"><spring:message code='button.joins.fullJoin' javaScriptEscape='true'/><span class="icon"></span></span>
                        </button>
                    </div>

                    <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                        <t:putAttribute name="containerClass" value="column decorated primary"/>
                        <t:putAttribute name="containerTitle"><spring:message code='domain.designer.joins.rightTable' javaScriptEscape='true'/></t:putAttribute>

                        <t:putAttribute name="bodyContent">
                                <ul id="rightTree" class=""></ul>
                        </t:putAttribute>
                    </t:insertTemplate>

                    <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                        <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                        <t:putAttribute name="containerElements">
                            <div class="sizer horizontal"></div>
                            <button class="button minimize"></button>
                        </t:putAttribute>
                        <t:putAttribute name="containerTitle"><spring:message code='domain.designer.joins.leftTable' javaScriptEscape='true'/></t:putAttribute>
                        <t:putAttribute name="bodyContent">
                            <ul id="leftTree" class="">
                        </t:putAttribute>
                    </t:insertTemplate>
                    <!-- end two columns -->
                </div>
                </div>
                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                    <t:putAttribute name="containerElements">
                        <div class="sizer horizontal"></div>
                    </t:putAttribute>
                    <t:putAttribute name="containerTitle"> </t:putAttribute>
                    <t:putAttribute name="containerID" value="joinsPanel"/>
                    <t:putAttribute name="headerContent">
                        <ul id="joinTabSet" class="tabSet text control horizontal responsive">
                            <li class="tab first selected">
                                <p id="allJoins" class="button wrap">
                                    <spring:message code='domain.designer.joins.allJoins' javaScriptEscape='true'/>
                                </p>
                            </li>
                            <li class="tab last">
                                <p id="selectedTableJoins" class="button wrap">
                                    <spring:message code='domain.designer.joins.selectedTableJoins' javaScriptEscape='true'/>
                                </p>
                            </li>
                        </ul>
                    </t:putAttribute>

                    <t:putAttribute name="bodyContent">
                        <ul class="list setLeft tabular fourColumn">
                            <li class="node">
                                <div class="wrap header">
                                    <b class="icon" title=""></b>
                                    <p class="column one">
                                        <spring:message code='domain.designer.joins.leftTableField' javaScriptEscape='true'/>
                                    </p>
                                    <p class="column two">
                                        <spring:message code='domain.designer.joins.rightTableField' javaScriptEscape='true'/>
                                    </p>
                                    <p class="column three">
                                        <spring:message code='domain.designer.joins.joinType' javaScriptEscape='true'/>
                                    </p>
                                    <p class="column four"></p>
                                </div>
                                <ul id="joinsList" class=""></ul>
                            </li>
                        </ul>
                    </t:putAttribute>
                </t:insertTemplate>
			</t:putAttribute>
            <t:putAttribute name="footerContent">
                <fieldset id="wizardNav">
                    <button id="done" class="button action primary up" ${doneButtonDisabledAttribute}><span class="wrap"><spring:message code="button.ok" javaScriptEscape="true"/></span><span class="icon"></span></button>
                    <button id="cancelButton" class="button action up"><span class="wrap"><spring:message code="button.cancel" javaScriptEscape="true"/></span><span class="icon"></span></button>
                </fieldset>
            </t:putAttribute>
		</t:insertTemplate>

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

                <div id="calcFieldsForJoinConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.joins.deleteCalculatedFields_1"/></p>
                    <a class="launcher" id="calcFieldsForJoinsDetails"><spring:message code="domain.designer.joins.deleteCalculatedFields_2"/></a>
                </div>

                <div id="filtersForJoinConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.joins.deleteFilters"/></p>
                </div>

                <div id="calcFieldsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteCalculatedFields_1"/></p>
                    <a class="launcher" id="calcFieldsDetails"><spring:message code="domain.designer.deleteCalculatedFields_2"/></a>
                </div>

                <div id="deleteFiltersConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteFilters_1"/></p>
                    <a class="launcher" id="filtersDetails"><spring:message code="domain.designer.deleteFilters_2"/></a>
                </div>

                <div id="createCompositeKeyConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.joins.createCompositeKey"/></p>
                </div>
            </t:putAttribute>
            <t:putAttribute name="leftButtonId" value="confirmYes"/>
            <t:putAttribute name="rightButtonId" value="confirmNo"/>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="joinsState.jsp"/>
    </t:putAttribute>

</t:insertTemplate>