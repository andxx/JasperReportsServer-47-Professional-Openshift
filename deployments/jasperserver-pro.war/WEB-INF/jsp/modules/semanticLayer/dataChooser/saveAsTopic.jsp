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
        <spring:message code="page.saveAsTopic.pageTitle"/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="dataChooserSaveAsTopic"/>
    <t:putAttribute name="bodyClass" value="oneColumn"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.saveAsTopic.js"></script>
    </t:putAttribute>

    <t:putAttribute name="bodyContent" >
        <form id="stepDisplayForm">
            <input type="hidden" id="slTopicLabel" name="slTopicLabel" value=""/>
            <input type="hidden" id="slTopicLocation" name="slTopicLocation" value=""/>
            <input type="hidden" id="slTopicDesc" name="slTopicDesc" value=""/>
        </form>
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary"/>
            <t:putAttribute name="containerTitle">
                <spring:message code='domain.chooser.title'/>
            </t:putAttribute>
            <t:putAttribute name="bodyClass" value="flow oneStep"/>

            <t:putAttribute name="bodyContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/dataChooserFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="saveAs"/>
                </t:insertTemplate>
                <div id="stepDisplay">
                    <fieldset class="row instructions">
                        <legend class="offLeft">
                            <span><spring:message code="page.saveAsTopic.instructions"/></span>
                        </legend>
                        <h2 class="textAccent02">
                            <spring:message code="page.saveAsTopic.saveTopic"/>
                        </h2>
                        <h4><spring:message code="page.saveAsTopic.saveTopic.info"/></h4>
                    </fieldset>

                    <fieldset class="row inputs oneColumn">
                        <legend class="offLeft">
                            <span><spring:message code="page.saveAsTopic.userInputs"/></span>
                        </legend>
                        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                                <t:putAttribute name="containerClass" value="column primary noHeader"/>
                                <t:putAttribute name="containerTitle">
                                    <spring:message code="page.saveAsTopic.userInputs.save"/>
                                </t:putAttribute>

                                <t:putAttribute name="bodyContent">
                                    <label class="control input text" accesskey="o" for="topicName" title="<spring:message code='dialog.file.name.title' javaScriptEscape="true"/>">
                                        <span class="wrap"><spring:message code="page.saveAsTopic.name"/> (<spring:message code='required.field'/>):</span>
                                        <input class="" id="topicName" type="text" value="${slReportUnitLabel}"/>
                                        <span class="message warning"></span>
                                    </label>
                                    <label class="control textArea" for="topicDesc">
                                        <span class="wrap"><spring:message code="page.saveAsTopic.description"/>:</span>
                                        <textarea id="topicDesc" type="text">${slReportUnitDesc}</textarea>
                                        <span class="message warning"></span>
                                    </label>

                                    <label class="control browser" for="topicLocation" title="<spring:message code="page.saveAsTopic.location.title" javaScriptEscape="true"/>">
                                        <span class="wrap"><spring:message code="page.saveAsTopic.location"/>:</span>
                                        <input class="" id="topicLocation" type="text" value="${slReportUnitLocation}"/>
                                        <button class="button action" id="browser_button">
                                            <span class="wrap">
                                                <spring:message code="button.browse"/>
                                                <span class="icon"></span>
                                            </span>
                                        </button>
                                        <span class="message warning"></span>
                                    </label>

                                </t:putAttribute>
                            </t:insertTemplate>

                    </fieldset><!--/.row.inputs-->
                </div><!--/#stepDisplay-->
            </t:putAttribute>
            <t:putAttribute name="footerContent">
                <fieldset id="wizardNav">
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
                    <button id="cancel" class="button action up">
                        <span class="wrap"><spring:message code='button.cancel'/></span>
                        <span class="icon"></span>
                    </button>
               </fieldset>
            </t:putAttribute>
        </t:insertTemplate><!--column-->

        <t:insertTemplate template="/WEB-INF/jsp/templates/selectFromRepository.jsp">
            <t:putAttribute name="containerTitle">
                <spring:message code="QB_SAVE_ADHOC_TOPIC_DIALOG_TITLE"/>
            </t:putAttribute>
            <t:putAttribute name="containerClass">hidden centered_vert centered_horz</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <ul class="responsive collapsible folders hideRoot" id="addFileTreeRepoLocation" style="position: relative;">
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/standardConfirm.jsp">
            <t:putAttribute name="containerClass">centered_vert centered_horz hidden</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <p class="message"><spring:message code="page.saveAsTopic.repoBrowser.warningMessage"/></p>
                <p class="message"><spring:message code="page.saveAsTopic.repoBrowser.cautionMessage"/></p>
            </t:putAttribute>
            <t:putAttribute name="okLabel"><spring:message code="QB_BUTTON_YES"/></t:putAttribute>
            <t:putAttribute name="leftButtonId" value="saveAsTopicOverwriteButtonId"/>

            <t:putAttribute name="cancelLabel"><spring:message code="QB_BUTTON_NO" javaScriptEscape="true"/></t:putAttribute>
            <t:putAttribute name="rightButtonId" value="saveAsTopicOverwriteCancelButtonId"/>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>
        
        <%@ include file="saveAsTopicState.jsp" %>

    </t:putAttribute>

</t:insertTemplate><!--page-->