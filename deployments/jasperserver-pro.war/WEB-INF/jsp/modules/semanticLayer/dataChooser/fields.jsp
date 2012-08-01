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
        <spring:message code='page.fields.pageTitle' javaScriptEscape='true'/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="dataChooserFields"/>
    <t:putAttribute name="bodyClass" value="oneColumn flow oneStep"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.fields.js"></script>
    </t:putAttribute>
    <t:putAttribute name="bodyContent">
		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
			<t:putAttribute name="containerClass" value="column decorated primary"/>
		    <t:putAttribute name="containerTitle">
                <spring:message code='domain.chooser.title' javaScriptEscape='true'/>
            </t:putAttribute>
            <t:putAttribute name="bodyContent">
            <t:insertTemplate template="/WEB-INF/jsp/templates/dataChooserFlowControls.jsp">
                <t:putAttribute name="selectedTab" value="fields"/>
            </t:insertTemplate>

            <form id="stepDisplayForm">
                <input type="hidden" id="selectedModel" name="selectedModel" value=""/>
                <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
            </form>

            <div id="stepDisplay">
                <fieldset class="row instructions">
                    <legend class="offLeft"><span><spring:message code='page.fields.instructions' javaScriptEscape='true'/></span></legend>
                    <h2 class="textAccent02"><spring:message code='page.fields.selectFields' javaScriptEscape='true'/></h2>
                    <h4><spring:message code='page.fields.selectFields.info' javaScriptEscape='true'/></h4>
                </fieldset>

                <fieldset class="row inputs twoColumn_equal pickWells">
                    <legend class="offLeft"><span><spring:message code='page.fields.userInputs' javaScriptEscape='true'/></span></legend>
                        <!-- start two columns -->
                        <div id="moveButtons" class="centered_horz">
                            <button id="right" class="button action square move right up" title="<spring:message code='button.dataChooser.fields.add' javaScriptEscape='true'/>"><span class="wrap"><b class="icon"></b></span></button>
                            <button id="left" class="button action square move left up" title="<spring:message code='button.dataChooser.fields.remove' javaScriptEscape='true'/>"><span class="wrap"><b class="icon"></b></span></button>
                            <button id="toRight" class="button action square move toRight up" title="<spring:message code='button.dataChooser.fields.addAll' javaScriptEscape='true'/>"><span class="wrap"><b class="icon"></b></span></button>
                            <button id="toLeft" class="button action square move toLeft up" title="<spring:message code='button.dataChooser.fields.removeAll' javaScriptEscape='true'/>"><span class="wrap"><b class="icon"></b></span></button>
                        </div>

                        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                            <t:putAttribute name="containerClass" value="column decorated primary"/>
                            <t:putAttribute name="containerTitle"><spring:message code='page.fields.selectedFields' javaScriptEscape='true'/></t:putAttribute>
                            <t:putAttribute name="containerID" value="destTablesColumn"/>
                            <t:putAttribute name="swipeScroll" value="${isIPad}"/>
                            <t:putAttribute name="bodyContent">
                                <p class="message warning"><spring:message code='page.fields.error.fromDifferentIslands' javaScriptEscape='true'/></p>
                                <ul id="destinationFieldsTree">
                            </t:putAttribute>
                        </t:insertTemplate>

                        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                            <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
                                <t:putAttribute name="containerElements">
                                    <div class="sizer horizontal"></div>
                                    <button class="button minimize"></button>
                                </t:putAttribute>
                            <t:putAttribute name="containerTitle"><spring:message code='page.fields.sourceFields' javaScriptEscape='true'/></t:putAttribute>
                            <t:putAttribute name="containerID" value="sourceTablesColumn"/>
                            <t:putAttribute name="swipeScroll" value="${isIPad}"/>
                            <t:putAttribute name="bodyContent">
                                <ul id="sourceFieldsTree">
                            </t:putAttribute>
                        </t:insertTemplate>
                        <!-- end two columns -->
                </fieldset><!--/row.inputs-->
            </div><!--/#stepDisplay-->

            </t:putAttribute>
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

                    <button id="cancel" class="button action up"><span class="wrap"><spring:message code="button.cancel" javaScriptEscape="true"/></span><span class="icon"></span></button>
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
        
        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>
        
        <jsp:include page="fieldsState.jsp"/>

    </t:putAttribute>
</t:insertTemplate>
