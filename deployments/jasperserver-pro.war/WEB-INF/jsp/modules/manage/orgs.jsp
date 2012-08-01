<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<%@ include file="../common/jsEdition.jsp" %>
<%@ page import="com.jaspersoft.ji.license.LicenseManager" %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <%
        if (LicenseManager.isMTSupportedToDelete()) {
    %>
    <t:putAttribute name="pageTitle">
        <spring:message code="MT_MANAGE_ORG" javaScriptEscape="true"/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="manage_orgs"/>
    <t:putAttribute name="bodyClass">threeColumn manager</t:putAttribute>
    <t:putAttribute name="headerContent" >
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tools.infiniteScroll.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/mng.common.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/mng.common.actions.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/mng.main.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/org.mng.main.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/org.mng.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/org.mng.actions.js"></script>
    </t:putAttribute>
    <t:putAttribute name="bodyContent">
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerID" value="organizations"/>
            <t:putAttribute name="containerClass" value="column decorated primary showingToolBar"/>
            <t:putAttribute name="containerTitle">
                <spring:message code="MT_ORGANIZATIONS" javaScriptEscape="true"/>
            </t:putAttribute>
            <t:putAttribute name="headerContent" >
                    <t:insertTemplate template="/WEB-INF/jsp/templates/control_searchLockup.jsp">
				        <t:putAttribute name="containerID" value="secondarySearchBox"/>
				        <t:putAttribute name="inputID" value="secondarySearchInput"/>
				    </t:insertTemplate>
                <div class="toolbar">
                    <ul class="list buttonSet">
                        <%
                            if (LicenseManager.isMultitenancyFeatureSupported()) {
                        %>
                        <li class="node open">
                            <ul class="list buttonSet">
                                <%--bug 18939: &#8230 changed to "..." --%>
                                <li class="leaf"><button id="addNewOrgBtn" class="button capsule text up"><span class="wrap"><spring:message code="MT_ADD_ORG" javaScriptEscape="true"/>...</span><span class="icon"></span></button></li>
                            </ul>
                        </li>
                        <% } %>
                        <li class="node open">
                            <ul class="list buttonSet">
                                <li class="leaf"><button id="deleteAllOrgsBtn" class="button capsule text up" disabled="disabled"><span class="wrap"><spring:message code="jsp.userAndRoleManager.deleteAll" javaScriptEscape="true"/></span><span class="icon"></span></button></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </t:putAttribute>
            <t:putAttribute name="bodyID" value="listContainer"/>
            <t:putAttribute name="bodyContent">
                <ol id="entitiesList"></ol>
            </t:putAttribute>
            <t:putAttribute name="footerContent">
            </t:putAttribute>
        </t:insertTemplate>


        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerID" value="folders"/>
            <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
            <t:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </t:putAttribute>
            <t:putAttribute name="containerTitle">
                <spring:message code="MT_ORGANIZATIONS" javaScriptEscape="true"/>
            </t:putAttribute>
            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="bodyContent" >
                    <ul id="orgTree"></ul>
                    <div id="ajaxbuffer"></div>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerID" value="properties"/>
            <t:putAttribute name="containerClass" value="column decorated tertiary sizeable"/>
            <t:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </t:putAttribute>
            <t:putAttribute name="containerTitle"><spring:message code="jsp.userAndRoleManager.properties" javaScriptEscape="true"/></t:putAttribute>
            <t:putAttribute name="bodyClass" value=""/>

            <t:putAttribute name="bodyContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/nothingToDisplay.jsp">
					<t:putAttribute name="bodyContent">
						<p class="message"><spring:message code="MT_ORG_NOTHING_TO_DISPLAY" javaScriptEscape="true"/></p>
				    </t:putAttribute>
				</t:insertTemplate>

                <fieldset class="group">
                    <legend class="offLeft"><span><spring:message code="dialog.file.nameAndDescription" javaScriptEscape="true"/></span></legend>
                    <label class="control input text" class="required" for="orgName" title="<spring:message code="MT_ORG_NAME_TEXT" javaScriptEscape="true"/>">
                        <span class="wrap"><spring:message code="MT_ORG_NAME" javaScriptEscape="true"/>:</span>
                        <input class="" id="orgName" type="text" maxlength="100" value="" readonly="readonly"/>
                        <span class="message warning"></span>
                    </label>
                    <label class="control input text" for="orgID" title="<spring:message code="MT_ORG_ID_TEXT" javaScriptEscape="true"/>">
                        <span class="wrap"><spring:message code="MT_ORG_ID" javaScriptEscape="true"/>:</span>
                        <input class="" id="orgID" type="text" maxlength="100" value="" readonly="readonly"/>
                        <span class="hint"><spring:message code="MT_ORG_ID_HINT" javaScriptEscape="true"/></span>
                        <span class="message warning"></span>
                    </label>
                    <label class="control input text" class="required" for="orgAlias" title="<spring:message code="MT_ORG_ALIAS_TEXT" javaScriptEscape="true"/>">
                        <span class="wrap"><spring:message code="MT_ORG_ALIAS" javaScriptEscape="true"/>:</span>
                        <input class="" id="orgAlias" type="text" maxlength="100" value="" readonly="readonly"/>
                        <span class="message warning"></span>
                    </label>
                    <label class="control textArea" for="orgDesc" title="<spring:message code="MT_DESC_TEXT" javaScriptEscape="true"/>">
                        <span class="wrap"><spring:message code="MT_DESCRIPTION" javaScriptEscape="true"/>:</span>
                        <textarea id="orgDesc" type="text" rows="3" cols="30" maxlength="250" readonly="readonly"/></textarea>
                        <span class="message warning"></span>
                    </label>
                </fieldset>
                <fieldset id="attributes" class="group">
                        <ul class="list type_attributes">
                            <li class="node"><span class="label wrap"><spring:message code="MT_NUM_OF_USERS" javaScriptEscape="true"/>:</span>
                                <span id="assignedUsers">0</span> (<a id="manageUsers" class="launcher"><spring:message code="form.manage" javaScriptEscape="true"/>&#8230;</a>)
                            </li>
                            <li class="node"><span class="label wrap"><spring:message code="MT_NUM_OF_ROLES" javaScriptEscape="true"/>:</span>
                                <span id="assignedRoles">0</span> (<a id="manageRoles" class="launcher"><spring:message code="form.manage" javaScriptEscape="true"/>&#8230;</a>)
                            </li>
                        </ul>
                </fieldset>
            </t:putAttribute>
            <t:putAttribute name="footerID" value="propertiesButtons"/>
            <t:putAttribute name="footerContent">
                <button id="delete" class="button action up"><span class="wrap"><spring:message code="MT_DELETE" javaScriptEscape="true"/></span><span class="icon"></span></button>
                <button id="edit" class="button action primary up"><span class="wrap"><spring:message code="form.edit" javaScriptEscape="true"/></span><span class="icon"></span></button>
                <button id="save" class="button action primary up"><span class="wrap"><spring:message code="form.edit.save" javaScriptEscape="true"/></span><span class="icon"></span></button>
                <button id="cancel" class="button action up"><span class="wrap"><spring:message code="form.edit.cancel" javaScriptEscape="true"/></span><span class="icon"></span></button>
            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/addOrganization.jsp">
            <t:putAttribute name="containerClass" value="hidden"/>
        </t:insertTemplate>
        <jsp:include page="orgsState.jsp"/>
    </t:putAttribute>
    <% } else { %>
        <t:putAttribute name="pageTitle"><spring:message code='LIC_019_license.failed'/></t:putAttribute>
        <t:putAttribute name="bodyID" value="licenseError"/>
        <t:putAttribute name="bodyClass" value="oneColumn"/>

        <t:putAttribute name="bodyContent" >
            <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                <t:putAttribute name="containerClass" value="column decorated primary noHeader"/>
                <t:putAttribute name="containerTitle"><spring:message code='LIC_019_license.failed'/></t:putAttribute>
                <t:putAttribute name="bodyClass" value="flow"/>
                <t:putAttribute name="bodyContent">
                <div id="flowControls">

                </div>
                    <div id="stepDisplay">
                        <fieldset class="row instructions">
                            <h2 class="textAccent02"><spring:message code='LIC_014_feature.not.licensed.multitenancy'/></h2>
                            <h4><spring:message code='LIC_020_licence.contact.support'/></h4>
                        </fieldset>
                    </div>
                </t:putAttribute>
            </t:insertTemplate>
        </t:putAttribute>
    <% } %>


</t:insertTemplate>
