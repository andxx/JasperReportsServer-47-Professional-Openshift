<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code="domain.designer.calculatedFields.page.title"/></t:putAttribute>
    <t:putAttribute name="bodyID" value="domainDesigner_calculatedFields"/>
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
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.calculatedFields.js"></script>
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
                <spring:message code='page.calcFields.title' javaScriptEscape='true'/> ${slName}
            </t:putAttribute>

            <t:putAttribute name="bodyClass" value="twoColumn"/>
            <t:putAttribute name="headerContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/domainDesignerFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="calcFields"/>
                </t:insertTemplate>
            </t:putAttribute>

		    <t:putAttribute name="bodyContent">
                <form id="calculatedFieldsForm">
                    <input type="hidden" id="page" name="page" value="calcFields"/>
                    <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
                </form>

                <!-- start two columns -->

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerID" value="calculatedFieldsPanel"/>
                    <t:putAttribute name="containerClass" value="column decorated primary"/>
                    <t:putAttribute name="containerTitle"><spring:message code="page.calcFields.calcField" /></t:putAttribute>
                    <t:putAttribute name="bodyID" value="calculatedField"/>
                    <t:putAttribute name="bodyContent">
                        <fieldset class="group">
                            <label class="control input text" for="fieldName"
                                   title="<spring:message code="page.calcFields.fieldName.title" javaScriptEscape="true" />">
                                <span class="wrap"><spring:message code="page.calcFields.fieldName" />:</span>
                                <input class="" id="fieldName" type="text" value=""/>
                                <span class="message warning"></span>
                            </label>

                            <label class="control select" for="dataType"
                                   title="<spring:message code="page.calcFields.type.title" javaScriptEscape="true" />">
                                <span class="wrap"><spring:message code="page.calcFields.type"/>:</span>
                                 <select id="dataType">
                                     <c:forEach items="${sessionScope['supportedJavaTypes']}" var="type">
                                         <option value="${type.key}" title="${type.value}">${type.value}</option>
                                     </c:forEach>
                                </select>
                                <span class="message warning"></span>
                            </label>

                            <label class="control textArea taller" for="expression"
                                   title="<spring:message code="page.calcFields.expression.title" javaScriptEscape="true"/>">
                                <span class="wrap"><spring:message code="page.calcFields.expression"/>:</span>
                                <textarea id="expression"/></textarea>
                                <span class="message warning"></span>
                            </label>
                        </fieldset>
                    </t:putAttribute>
                    <t:putAttribute name="footerContent">
                        <button id="deleteField" class="button action">
                            <span class="wrap"><spring:message code="page.calcFields.deleteField"/></span>
                            <span class="icon"></span>
                        </button>
                        <button id="saveField" class="button action primary up">
                            <span class="wrap"><spring:message code="page.calcFields.saveField"/></span>
                            <span class="icon"></span>
                        </button>
                        <button id="cancelField" class="button action">
                            <span class="wrap"><spring:message code="button.cancel"/></span>
                            <span class="icon"></span>
                        </button>
                    </t:putAttribute>

                </t:insertTemplate>

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                    <t:putAttribute name="containerID" value="fields"/>
                    <t:putAttribute name="containerElements">
                        <div class="sizer horizontal"></div>
                    </t:putAttribute>
                    <t:putAttribute name="containerTitle"><spring:message code="DD_CALC_FIELDS_TREE_VIEW_TITLE"/>:</t:putAttribute>
                    <t:putAttribute name="bodyContent">
                        <ul id="fieldsTreeRoot"></ul>
                    </t:putAttribute>
                </t:insertTemplate>
                <!-- end two columns -->
			</t:putAttribute>
            <t:putAttribute name="footerContent">
                <fieldset id="wizardNav">
                    <button id="done" class="button action primary up" ${doneButtonDisabledAttribute}>
                        <span class="wrap"><spring:message code="button.ok"/></span>
                        <span class="icon"></span>
                    </button>
                    <button id="cancelButton" class="button action up">
                        <span class="wrap"><spring:message code="button.cancel"/></span>
                        <span class="icon"></span>
                    </button>
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

                <div id="editFieldConfirmMessage" class="hidden">
                    <p class="message"></p>
                </div>

            </t:putAttribute>
            <t:putAttribute name="leftButtonId" value="confirmYes"/>
            <t:putAttribute name="rightButtonId" value="confirmNo"/>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="calculatedFieldsState.jsp"/>
    </t:putAttribute>

</t:insertTemplate>
