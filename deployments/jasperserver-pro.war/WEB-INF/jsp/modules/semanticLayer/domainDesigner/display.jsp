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
        <spring:message code='page.design.pageTitle' javaScriptEscape='true'/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="domainDesigner_display"/>
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
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.display.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.designer.display.validators.js"></script>
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
                <spring:message code='page.design.title' javaScriptEscape='true'/> ${slName}
            </t:putAttribute>

            <t:putAttribute name="bodyClass" value=""/>
            <t:putAttribute name="headerContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/domainDesignerFlowControls.jsp">
                    <t:putAttribute name="selectedTab" value="display"/>
                </t:insertTemplate>
            </t:putAttribute>

		    <t:putAttribute name="bodyContent">
                <t:putAttribute name="bodyClass" value="twoColumn primaryLeft"/>
                <form id="stepDisplayForm">
                    <input type="hidden" id="page" name="page" value="design"/>
                    <input type="hidden" id="islands" name="islands" value=""/>
                    <input type="hidden" id="selectedModel" name="selectedModel" value=""/>
                    <input type="hidden" id="selectedView" name="selectedView" value=""/>
                    <input type="hidden" id="dontWarnOfDeleteItems" name="dontWarnOfDeleteItems" value=""/>
                    <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
                </form>

                <!-- start two columns -->

                <div class="column simple sizeable primary">
                    <div class="sizer horizontal"></div>
                    <div class="body twoColumn_equal pickWells">
                    <div class="moveButtons">
                        <button id="add" class="button action square up" title="<spring:message code='button.domainDesigner.display.addToSets.title' javaScriptEscape='true'/>">
                            <span class="wrap">
                                <spring:message code='button.domainDesigner.display.addToSets' javaScriptEscape='true'/>
                                <span class="icon"></span>
                            </span>
                        </button>
                        <button id="addToSet"  class="button action square up" title="<spring:message code='button.domainDesigner.display.addToSelectedSet.title' javaScriptEscape='true'/>">
                            <span class="wrap">
                                <spring:message code='button.domainDesigner.display.addToSelectedSet' javaScriptEscape='true'/>
                                <span class="icon"></span>
                            </span>
                        </button>
                    </div>
                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated primary"/>
                    <t:putAttribute name="containerTitle"><spring:message code='domain.designer.display.setsAndItems' javaScriptEscape='true'/></t:putAttribute>
                    <t:putAttribute name="containerID" value="setsAndItems"/>
                    <t:putAttribute name="bodyID" value="setsAndItemsBody"/>

                    <t:putAttribute name="bodyContent">
                        <ul id="viewTree"></ul>
                        <div class="moveButtons">

                            <button id="toTop" class="button action square move toTop up" title="<spring:message code='button.domainDesigner.display.moveToTop.title' javaScriptEscape='true'/>">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.moveToTop' javaScriptEscape='true'/>
                                    <span class="icon"></span>
                                </span>
                            </button>
                            <button id="upward" class="button action square move upward up" title="<spring:message code='button.domainDesigner.display.moveUp.title' javaScriptEscape='true'/>">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.moveUp' javaScriptEscape='true'/>
                                    <span class="icon"></span>
                                </span>
                            </button>
                            <button id="downward" class="button action square move downward up" title="<spring:message code='button.domainDesigner.display.moveDown.title' javaScriptEscape='true'/>">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.moveDown' javaScriptEscape='true'/>
                                    <span class="icon"></span>
                                </span>
                            </button>
                            <button id="toBottom" class="button action square move toBottom up" title="<spring:message code='button.domainDesigner.display.moveToBottom.title' javaScriptEscape='true'/>">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.moveToBottom' javaScriptEscape='true'/>
                                    <span class="icon"></span>
                                </span>
                            </button>

                        </div>

                        </t:putAttribute>
                        <t:putAttribute name="footerContent">
                            <button id="newSet" class="button action up" title="<spring:message code='button.domainDesigner.display.newSet.title' javaScriptEscape='true'/>">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.newSet' javaScriptEscape='true'/>
                                    <span class="icon"></span>
                                </span>
                            </button>
                            <button id="deleteItem" class="button action up" title="<spring:message code='button.domainDesigner.display.deleteItem.title' javaScriptEscape='true'/>">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.deleteItem' javaScriptEscape='true'/>
                                    <span class="icon"></span>
                                </span>
                            </button>
                        </t:putAttribute>

                    </t:insertTemplate>

                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="column decorated secondary sizeable showingSubHeader showingFooterButtons"/>
                    <t:putAttribute name="containerElements">
                        <div class="sizer horizontal"></div>
                    </t:putAttribute>
                    <t:putAttribute name="containerTitle"><spring:message code='domain.designer.display.resources' javaScriptEscape='true'/></t:putAttribute>
                    <t:putAttribute name="containerID" value="resources"/>
                    <t:putAttribute name="bodyID" value="resourcesBody"/>
                    <t:putAttribute name="headerContent">
                        <div class="sub header">
                            <ul class="tabSet text control horizontal responsive">
                                <li class="label"><p class="wrap"><spring:message code='domain.designer.display.viewAs' javaScriptEscape='true'/></p></li>
                                <li id="joinTreeView" class="tab first selected"><p class="wrap"><spring:message code='domain.designer.display.joinTree' javaScriptEscape='true'/></p></li>
                                <li id="tableListView" class="tab last"><p class="wrap"><spring:message code='domain.designer.display.tableList' javaScriptEscape='true'/></p></li>
                            </ul>
                        </div>
                    </t:putAttribute>
                    <t:putAttribute name="bodyContent">
                        <ul id="joinsTree"></ul>
                        <ul id="tablesTree"></ul>
                    </t:putAttribute>
                    <t:putAttribute name="footerContent">
                        <button id="deleteTable" class="button action up" title="<spring:message code='button.domainDesigner.display.deleteTable.title' javaScriptEscape='true'/>">
                            <span class="wrap">
                                <spring:message code='button.domainDesigner.display.deleteTable' javaScriptEscape='true'/>
                                <span class="icon"></span>
                            </span>
                        </button>
                    </t:putAttribute>
                </t:insertTemplate>

                    </div>
                </div>

                    <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                        <t:putAttribute name="containerID" value="properties"/>
                        <t:putAttribute name="containerClass" value="column decorated tertiary sizeable"/>
                        <t:putAttribute name="containerElements">
                            <div class="sizer horizontal"></div>
                        </t:putAttribute>
                        <t:putAttribute name="containerTitle"><spring:message code='domain.designer.display.properties' javaScriptEscape='true'/></t:putAttribute>
                        <t:putAttribute name="bodyClass" value=""/>

                        <t:putAttribute name="bodyContent">
                            <fieldset id="resourceInfo" class="group hidden">
                                <label class="control input text" for="resourceItemId" title="<spring:message code='domain.designer.display.resourceItemId.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.resourceItemId' javaScriptEscape='true'/></span>
                                    <input class="" id="resourceItemId" type="text" value="" readonly="readonly"/>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control input text" for="resourceItemDataSource" title="<spring:message code='domain.designer.display.resourceItemDataSource.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.resourceItemDataSource' javaScriptEscape='true'/></span>
                                    <input class="" id="resourceItemDataSource" type="text" value="" readonly="readonly"/>
                                </label>
                                <label class="control input text" for="resourceItemSourceTable" title="<spring:message code='domain.designer.display.resourceItemSourceTable.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.resourceItemSourceTable' javaScriptEscape='true'/></span>
                                    <input class="" id="resourceItemSourceTable" type="text" value="" readonly="readonly"/>
                                </label>
                                <label class="control input text" for="resourceItemType" title="<spring:message code='domain.designer.display.resourceItemType.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.resourceItemType' javaScriptEscape='true'/></span>
                                    <input class="" id="resourceItemType" type="text" value="" readonly="readonly"/>
                                </label>
                            </fieldset>

                            <fieldset id="identification" class="group">
                                <legend class=""><span><spring:message code='domain.designer.display.identification' javaScriptEscape='true'/></span></legend>
                                <label class="control input text" for="itemName" title="<spring:message code='domain.designer.display.itemName.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.itemName' javaScriptEscape='true'/></span>
                                    <input class="" id="itemName" type="text" value="" readonly="readonly"/>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control input text" for="itemID" title="<spring:message code='domain.designer.display.itemID.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.itemID' javaScriptEscape='true'/></span>
                                    <input class="" id="itemID" type="text" value="" readonly="readonly"/>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control textArea" for="itemDescription">
                                    <span class="wrap"><spring:message code='domain.designer.display.itemDescription' javaScriptEscape='true'/></span>
                                    <textarea id="itemDescription" type="text" readonly="readonly"> </textarea>
                                    <span class="message warning">error message here</span>
                                </label>
                            </fieldset>
                            <fieldset id="bundleInfo" class="group">
                                <legend class=""><span><spring:message code='domain.designer.display.bundleKeys' javaScriptEscape='true'/></span></legend>
                                <label class="control input text" for="itemNameKey" title="<spring:message code='domain.designer.display.itemNameKey.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.itemNameKey' javaScriptEscape='true'/></span>
                                    <input class="" id="itemNameKey" type="text" value="" readonly="readonly"/>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control input text" for="itemDescriptionKey" title="<spring:message code='domain.designer.display.itemDescriptionKey.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.itemDescriptionKey' javaScriptEscape='true'/></span>
                                    <input class="" id="itemDescriptionKey" type="text" value="" readonly="readonly"/>
                                    <span class="message warning">error message here</span>
                                </label>
                            </fieldset>
                            <fieldset id="itemSpecific" class="group">
                                <legend class=""><span><spring:message code='domain.designer.display.dataProperties' javaScriptEscape='true'/></span></legend>
                                <label class="control input text" for="resourceID" title="<spring:message code='domain.designer.display.resourceID.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.resourceID' javaScriptEscape='true'/></span>
                                    <input class="" id="resourceID" type="text" value="" readonly="readonly"/>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control select" for="dataFormat" title="<spring:message code='domain.designer.display.dataFormat.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.dataFormat' javaScriptEscape='true'/></span>
                                    <select id="dataFormat" name="dataFormat" disabled="disabled"></select>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control select" for="summaryType" title="<spring:message code='domain.designer.display.summaryType.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.summaryType' javaScriptEscape='true'/></span>
                                    <select id="summaryType" name="summaryType" disabled="disabled"></select>
                                    <span class="message warning">error message here</span>
                                </label>
                                <label class="control select" for="dimensionOrMeasure" title="<spring:message code='domain.designer.display.dimensionOrMeasure.title' javaScriptEscape='true'/>">
                                    <span class="wrap"><spring:message code='domain.designer.display.dimensionOrMeasure' javaScriptEscape='true'/></span>
                                    <select id="dimensionOrMeasure" name="dimensionOrMeasure" disabled="disabled"></select>
                                    <span class="message warning">error message here</span>
                                </label>
                            </fieldset>

                        </t:putAttribute>
                        <t:putAttribute name="footerContent">
                            <button id="edit" class="button action up">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.edit' javaScriptEscape='true'/>
                                </span>
                                <span class="icon"></span>
                            </button>
                            <button id="save" class="button action up">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.save' javaScriptEscape='true'/>
                                </span>
                                <span class="icon"></span>
                            </button>
                            <button id="cancel" class="button action up">
                                <span class="wrap">
                                    <spring:message code='button.domainDesigner.display.cancel' javaScriptEscape='true'/>
                                </span>
                                <span class="icon"></span>
                            </button>
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

                <div id="calcFieldsConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteCalculatedFields_1"/></p>
                    <a class="launcher" id="calcFieldsDetails"><spring:message code="domain.designer.deleteCalculatedFields_2"/></a>
                </div>

                <div id="deleteFiltersConfirmMessage" class="hidden">
                    <p class="message"><spring:message code="domain.designer.deleteFilters_1"/></p>
                    <a class="launcher" id="filtersDetails"><spring:message code="domain.designer.deleteFilters_2"/></a>
                </div>
                
                <div id="deleteViewItemsConfirmMessage" class="hidden">
                    <p class="message">
                        <spring:message code="domain.designer.display.deleteViewItem_1"/>
                    </p>
                    <p class="message">
                        <a class="launcher" id="viewItemsDetails"><spring:message code="domain.designer.display.deleteViewItem_2"/></a>
                    </p>
                    <p class="message">
                        <div class="control checkBox">
                            <label class="wrap" for="dontWarnInCurrentSession"
                               title="<spring:message code='checkbox.domain.display.dontWarnInCurrentSession' javaScriptEscape='true'/>">
                                <spring:message code='checkbox.domain.display.dontWarnInCurrentSession' javaScriptEscape='true'/>
                            </label>
                            <input id="dontWarnInCurrentSession" type="checkbox"/>
                        </div>
                    </p>
                </div>
            </t:putAttribute>
            <t:putAttribute name="leftButtonId" value="confirmYes"/>
            <t:putAttribute name="rightButtonId" value="confirmNo"/>
        </t:insertTemplate>

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="displayState.jsp"/>
    </t:putAttribute>

</t:insertTemplate>
