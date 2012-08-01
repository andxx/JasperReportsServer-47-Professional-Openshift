<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<%@ include file="preFiltersState.jsp" %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code="domain.chooser.filters.page.title"/></t:putAttribute>
    <t:putAttribute name="bodyID" value="dataChooserPreFilters"/>
    <t:putAttribute name="bodyClass" value="oneColumn flow oneStep"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.filters.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.filters.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/utils.dateFormatter.js"></script>
    </t:putAttribute>

    <t:putAttribute name="bodyContent" >
        <form id="preFiltersForm">
            <input type="hidden" id="slRules" name="slRules"/>
        </form>
		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
			<t:putAttribute name="containerClass" value="column decorated primary"/>
            <t:putAttribute name="containerTitle">
                <spring:message code="domain.chooser.title" htmlEscape="true"/>
            </t:putAttribute>
		
		    <t:putAttribute name="bodyContent">
                <c:if test="${isIPad}">
                    <div id="stepDisplayScrollWrapper" style="position:absolute;bottom:0;top:0;">
                </c:if>
                <t:insertTemplate template="/WEB-INF/jsp/templates/dataChooserFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="filters"/>
                </t:insertTemplate>

                <div id="stepDisplay">
                    <fieldset class="row instructions">
                        <legend class="offLeft">
                            <span><spring:message code="page.filters.instructions"/></span>
                        </legend>
                        <h2 class="textAccent02"><spring:message code="page.filters.instructions.title"/></h2>
                        <h4><spring:message code="page.filters.instructions.text" htmlEscape="true"/></h4>
                    </fieldset>

                    <fieldset class="row inputs twoColumn">
                        <legend class="offLeft">
                            <span><spring:message code="page.filters.userInputs"/></span>
                        </legend>

                        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                            <t:putAttribute name="containerClass" value="column decorated primary"/>
                            <t:putAttribute name="containerTitle"><spring:message code="page.filters.filters"/></t:putAttribute>
                            <%--<t:putAttribute name="swipeScroll" value="${isIPad}"/>--%>
                            <t:putAttribute name="bodyID">preFilters</t:putAttribute>
                            <t:putAttribute name="bodyContent">
                                <ul id="filtersListId"></ul>
                            </t:putAttribute>
                        </t:insertTemplate>

                        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                            <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                            <t:putAttribute name="containerElements">
                                <div class="sizer horizontal"></div>
                                <button class="button minimize"></button>
                            </t:putAttribute>
                            <t:putAttribute name="containerTitle"><spring:message code="page.filters.fields" /></t:putAttribute>
                            <%--<t:putAttribute name="swipeScroll" value="${isIPad}"/>--%>
                            <t:putAttribute name="bodyID">selFieldsPanel</t:putAttribute>
                            <t:putAttribute name="bodyContent">
                                    <ul id="fieldsTreeRoot"></ul>
                            </t:putAttribute>
                        </t:insertTemplate>
                    <!-- end two columns -->

                    </fieldset><!--/.row.inputs-->
                </div><!--/#stepDisplay-->
                <c:if test="${isIPad}">
                    </div>
                </c:if>
                <t:putAttribute name="footerContent">
                    <fieldset id="wizardNav" class="row actions">
                        <button id="previous" class="button action up"><span class="wrap"><spring:message code='button.previous'/></span><span class="icon"></span></button>
                        <button id="next" class="button action up"><span class="wrap"><spring:message code='button.next'/></span><span class="icon"></span></button>
                        <c:if test="${wizardMode == 'createMode'}">
                            <button id="goToDesigner_table" class="button action up">
                                <span class="wrap">
                                        <spring:message code="button.goToDesigner.table" javaScriptEscape="true"/>
                                </span><span class="icon"></span>
                            </button>
                            <button id="goToDesigner_chart" class="button action up">
                                <span class="wrap">
                                        <spring:message code="button.goToDesigner.chart" javaScriptEscape="true"/>
                                </span><span class="icon"></span>
                            </button>
                            <button id="goToDesigner_crosstab" class="button action up">
                                <span class="wrap">
                                        <spring:message code="button.goToDesigner.crosstab" javaScriptEscape="true"/>
                                </span><span class="icon"></span>
                            </button>
                        </c:if>
                        <c:if test="${wizardMode == 'editMode'}">
                            <button id="goToDesigner_table" class="button primary action up">
                                <span class="wrap">
                                        <spring:message code="button.save" javaScriptEscape="true"/>
                                </span><span class="icon"></span>
                            </button>
                        </c:if>
                        <button id="cancel" class="button action up"><span class="wrap"><spring:message code='button.cancel'/></span><span class="icon"></span></button>
                   </fieldset>
                </t:putAttribute>

			</t:putAttribute>	    
		</t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerID" value="editorTemplate"/>
            <t:putAttribute name="containerClass" value="panel dialog inlay filter noHeader hidden"/>

            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="bodyContent">
                        <fieldset id="fieldAndOperation" class="column one">
                            <span class="fieldName"></span>
                            <label class="control select inline" for="comparisonType"
                                   title="<spring:message code='page.filters.filter.filterOperation' javaScriptEscape='true'/>">
                                <span class="wrap offLeft">
                                    <spring:message code='page.filters.filter.filterOperation'/>:
                                </span>
                                <select id="comparisonType"></select>
                                <span class="message warning"></span>
                            </label>
                        </fieldset>
                        <fieldset id="values"/>
            </t:putAttribute>
            <t:putAttribute name="footerContent">
                <button id="filterEditorOk" class="button action primary up">
                    <span class="wrap"><spring:message code="button.ok"/></span>
                    <span class="icon"></span>
                </button>
                <button id="filterEditorCancel" class="button action up">
                    <span class="wrap"><spring:message code="button.cancel"/></span>
                    <span class="icon"></span>
                </button>
                <label class="control checkBox lock" for="editable" title="<spring:message code="page.filters.filter.lock.title" />">
                    <span class="wrap"><spring:message code="page.filters.filter.locked" /></span>
                    <input id="editable" type="checkbox"/>
                </label>
            </t:putAttribute>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="../filtersInputTemplates.jsp"/>
    </t:putAttribute>

</t:insertTemplate>