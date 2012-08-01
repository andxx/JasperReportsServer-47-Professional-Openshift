<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<c:set var="addTitle"><spring:message code="CSLD_ADD_TITLE"/></c:set>
<c:set var="editTitle"><spring:message code="CSLD_EDIT_TITLE"/></c:set>
<c:set var="setProperties"><spring:message code="CSLD_PROPERTIES_SET"/></c:set>
<c:set var="editProperties"><spring:message code="CSLD_PROPERTIES_EDIT"/></c:set>
<c:set var="createSchema"><spring:message code="CSLD_CREATE_WITH_DD"/></c:set>
<c:set var="editSchema"><spring:message code="CSLD_EDIT_WITH_DD"/></c:set>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle">${mode == "edit" ? editTitle : addTitle}</t:putAttribute>
    <t:putAttribute name="bodyID">${mode == "edit" ? "domainDesigner_editDomain" : "addDomain"}</t:putAttribute>
    <t:putAttribute name="bodyClass" value="oneColumn flow oneStep"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/resource.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.setup.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.setup.dialogs.js"></script>
        <%@ include file="domainSetUpConstantState.jsp" %>
    </t:putAttribute>
    
    <t:putAttribute name="bodyContent" >
        <form id="pageForm" action="">
            <input type="hidden" name="_flowExecutionKey" value="${flowExecutionKey}"/>
            <input type="hidden" name="_eventId" value="cancel"/>
		    <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                <t:putAttribute name="containerClass" value="column decorated primary"/>
                <t:putAttribute name="containerTitle">${mode == "edit" ? editTitle : addTitle}: ${slName}</t:putAttribute>

                <t:putAttribute name="bodyContent">
                    <div id="flowControls"> </div>
                    <div id="stepDisplay">
                        <fieldset class="row instructions">
                            <legend class="offLeft"><span>Instructions</span></legend>
                            <h2 class="textAccent02">${mode == "edit" ? editTitle : addTitle}</h2>
                            <h4>${mode == "edit" ? editProperties : setProperties}</h4>
                        </fieldset>

                        <fieldset class="row inputs twoColumn_equal">
                            <legend class="offLeft"><span><spring:message code="CSLD_USER_INPUTS"/></span></legend>

                            <!-- start two columns -->

                            <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                                <t:putAttribute name="containerClass" value="column primary"/>
                                <t:putAttribute name="containerTitle"><spring:message code="CSLD_OPTIONAL_INFORMATION"/></t:putAttribute>

                                <t:putAttribute name="bodyContent">

                                    <ul class="list setLeft tabular linkedResources twoColumn">
                                        <li class="node">
                                            <div class="wrap header"><b class="icon" title=""></b><p class="column one"><spring:message code="CSLD_SECURITY_FILE_TITLE"/></p><p class="column two"></p><p class="column two"></p></div>
                                            <ul class="">
                                                <li id="noSecurityFileLeaf" class="leaf">
                                                    <div class="wrap"><b class="icon" title=""></b><p class="column one"><a class="launcher" id="addSecurityLink"><spring:message code="CSLD_ADD_SECURITY_FILE"/></a></p><p class="column two"></p></div>
                                                    </li>
                                                <li id="securityFileLeaf" class="leaf hidden">
                                                    <div class="wrap"><b class="icon" title=""></b><p class="column one"><a class="emphasis"></a></p><p class="column two"><a class="launcher"><spring:message code="CSLD_CHANGE_LINK"/></a> | <a class="launcher"><spring:message code="CSLD_REMOVE_LINK"/></a></p></div>
                                                </li>
                                                <li id="securityFileError" class="leaf errorMessage">
                                                    <div class="wrap"><p class="message warning"> </p></div>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="node">
                                            <div class="wrap header"><b class="icon" title=""></b><p class="column one"><spring:message code="CSLD_LOCAL_BUNDLES_TITLE"/></p><p class="column two"></p><p class="column two"></p></div>
                                            <ul class="">
                                                <ul id="bundlesList" class=""> </ul>
                                                <li id="addBundleLeaf" class="leaf">
                                                    <div class="wrap"><b class="icon" title=""></b><p class="column one"><a class="launcher" id="addBundleLink"><spring:message code="CSLD_ADD_BUNDLE_FILE"/></a></p><p class="column two"></p></div>
                                                </li>
                                                <li id="bundleError" class="leaf errorMessage">
                                                    <div class="wrap"><p class="message warning">Error message here</p></div>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </t:putAttribute>
                            </t:insertTemplate>

                            <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                                <t:putAttribute name="containerClass" value="column secondary"/>
                                <t:putAttribute name="containerTitle"><spring:message code="CSLD_REQUIRED_INFORMATION"/></t:putAttribute>

                                <t:putAttribute name="bodyContent">

                                    <fieldset class="group">
                                        <legend class="offLeft"><span>Name and Description</span></legend>
                                        <label id="nameLabel" class="control input text" class="required" for="slName"
                                               title="<spring:message code="CSLD_NAME_TOOLTIP"/>">
                                            <span class="wrap"><spring:message code="CSLD_NAME"/> (<spring:message code='required.field'/>):</span>
                                            <input class="" id="slName" type="text" value="${slName}" name="slName"/>
                                            <span class="message warning">error message here</span>
                                        </label>
                                        <label class="control input text" class="required" for="slResourceID"
                                               title="<spring:message code="CSLD_RESOURCE_ID_TOOLTIP"/>">
                                            <span class="wrap"><spring:message code="CSLD_RESOURCE_ID"/>
                                                <c:choose>
                                                    <c:when test="${mode == 'edit'}"> (<spring:message code='dialog.value.readOnly'/>):</c:when>
                                                    <c:otherwise> (<spring:message code='required.field'/>):</c:otherwise>
                                                </c:choose>
                                            </span>
                                            <input class="" id="slResourceID" type="text" value="${slResourceID}" name="slResourceID"
                                                    <c:if test="${mode == 'edit'}">tabindex="-1" readonly="readonly"</c:if>/>
                                            <span class="message warning">error message here</span>
                                        </label>
                                        <label class="control textArea" for="slDescription">
                                            <span class="wrap"><spring:message code="CSLD_DESCRIPTION"/></span>
                                            <textarea class="" id="slDescription" name="slDescription" type="text">${slDescription}</textarea>
                                            <span class="message warning">error message here</span>
                                        </label>
                                        <label class="control browser" for="schemaLocation" title="<spring:message code="CSLD_PATH_IN_REPO_TOOLTIP"/>">
                                            <span class="wrap"><spring:message code="form.saveLocation"/></span>
                                            <input type="text" id="schemaLocation" name="schemaLocation" value="<spring:escapeBody htmlEscape="true">${slLocation}</spring:escapeBody>"/>
                                            <%-- We need to have two schema location inputs because if visible input is disabled it isn't submitted to the server --%>
                                            <input type="hidden" id="slLocation" name="slLocation" value="<spring:escapeBody htmlEscape="true">${slLocation}</spring:escapeBody>"/>
                                            <button class="button action" id="browser_button"><span class="wrap"><spring:message code="button.browse"/><span class="icon"></span></span></button>
                                            <span class="message warning">error message here</span>
                                        </label>
                                    </fieldset>
                                    <fieldset class="group">
                                        <legend class="offLeft"><span>Data Source</span></legend>
                                        <label class="control browser" for="dataSourceInput" title="<spring:message code="CSLD_SELECT_DATASOURCE_TOOLTIP"/>">
                                            <span class="wrap"><spring:message code="CSLD_DATASOURCE"/></span>
                                            <input type="text" id="dataSourceInput" name="dataSourceInput" value=""/>
                                            <button class="button action" id="ds_browser_button"><span class="wrap"><spring:message code="button.browse"/><span class="icon"></span></span></button>
                                            <span class="message warning">error message here</span>
                                        </label>
                                    </fieldset>
                                    <fieldset class="group">
                                        <legend class="label"><span class="wrap"><spring:message code="CSLD_DOMAIN_SCHEMA"/></span></legend>
                                        <ul class="list inputSet">
                                            <li class="leaf">
                                                <label class="control radio" for="schemaCreateRadio" title="<spring:message code="CSLD_SELECT_DD_TOOLTIP"/>">
                                                    <span class="wrap"><a class="launcher" id="launchDD">${isSchemaSet ? editSchema : createSchema}</a></span>
                                                    <input  checked="checked" class="" id="schemaCreateRadio" type="radio" name="sample" value=""/>
                                                </label>
                                            </li>
                                            <li class="leaf">
                                                <label class="control radio" for="schemaUploadRadio" title="<spring:message code="CSLD_UPLOAD_TOOLTIP"/>">
                                                    <span class="wrap"><spring:message code="CSLD_UPLOAD"/></span>
                                                    <input class="" id="schemaUploadRadio" type="radio" name="sample" value=""/>
                                                    <input class="" name="file" id="schemaUpload" type="file" value="" disabled="disabled"/>
                                                    <span class="message warning"> </span>
                                                </label>
                                            </li>
                                        </ul>

                                    </fieldset>

                                </t:putAttribute>
                                <t:putAttribute name="footerAttributes">style="z-index: -1;"</t:putAttribute>
                            </t:insertTemplate>
                            <!-- end two columns -->

                        </fieldset><!--/.row.inputs-->
                    </div>
                    <t:putAttribute name="footerContent">
                        <fieldset id="wizardNav" >
                            <button id="previous" class="button action up"><span class="wrap"><spring:message code='button.previous'/></span><span class="icon"></span></button>
                            <button id="next" class="button action up"><span class="wrap"><spring:message code='button.next'/></span><span class="icon"></span></button>
                            <button id="done" class="button primary action up"><span class="wrap"><spring:message code='button.submit'/></span><span class="icon"></span></button>
                            <button id="cancel_button" class="button action up"><span class="wrap"><spring:message code='button.cancel'/></span><span class="icon"></span></button>
                        </fieldset>
                    </t:putAttribute>

                </t:putAttribute>
            </t:insertTemplate>
		
        </form>

        <t:insertTemplate template="/WEB-INF/jsp/templates/selectFromRepository.jsp">
            <t:putAttribute name="containerClass">hidden</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <ul class="responsive collapsible folders hideRoot" id="addResourceTreeRepoLocation"> </ul>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/selectFile.jsp">
            <t:putAttribute name="containerTitle"><spring:message code="CSLD_ADD_FILE"/></t:putAttribute>
            <t:putAttribute name="containerClass">hidden</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <ul class="responsive collapsible folders hideRoot" id="addFileResourceTreeRepoLocation"> </ul>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/standardConfirm.jsp">
            <t:putAttribute name="containerClass">centered_vert centered_horz hidden</t:putAttribute>
            <t:putAttribute name="bodyContent">
                <div id="resourceExistsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="CSLD_SLDS_ALREADY_EXISTS_1" javaScriptEscape="true"/></p>
                    <p class="message"><spring:message code="CSLD_SLDS_ALREADY_EXISTS_2" javaScriptEscape="true"/></p>
                </div>

                <div id="uploadSchemaConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="CSLD_WARN_OF_DELETE_ITEMS_SCHEMA_UPLOAD_1" javaScriptEscape="true"/></p>
                    <p class="message"><spring:message code="CSLD_WARN_OF_DELETE_ITEMS_SCHEMA_UPLOAD_2" javaScriptEscape="true"/></p>
                    <p class="message"><spring:message code="CSLD_WARN_OF_DELETE_ITEMS_SCHEMA_UPLOAD_3" javaScriptEscape="true"/></p>
                </div>
            </t:putAttribute>
            <t:putAttribute name="leftButtonId" value="confirmYes"/>
            <t:putAttribute name="rightButtonId" value="confirmNo"/>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/detail.jsp">
            <t:putAttribute name="containerClass" value="sizeable hidden"/>
            <t:putAttribute name="bodyContent">
                <ul id="detailsList"></ul>
                <div id="detailsText"></div>
            </t:putAttribute>
        </t:insertTemplate>
        
        <div id="ajaxbuffer"></div>

    </t:putAttribute>

</t:insertTemplate>