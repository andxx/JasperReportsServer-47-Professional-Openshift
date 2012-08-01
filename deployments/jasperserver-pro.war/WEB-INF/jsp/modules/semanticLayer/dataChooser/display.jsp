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
        <spring:message code='page.display.pageTitle' javaScriptEscape='true'/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="dataChooserDisplay"/>
    <t:putAttribute name="bodyClass" value="oneColumn flow oneStep"/>
    
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tools.drag.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.nanotree.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.events.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.treenode.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/tree.treesupport.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.components.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/domain.chooser.display.js"></script>
        <c:choose>
            <c:when test="${slIsTableAsList}">
                <c:set var="isFlatListSelected" value="selected"/>
                <c:set var="isNestedListSelected" value=""/>
                <c:set var="foldersTreeClass" value="flat"/>
            </c:when>
            <c:otherwise>
                <c:set var="isFlatListSelected" value=""/>
                <c:set var="isNestedListSelected" value="selected"/>
                <c:set var="foldersTreeClass" value=""/>
            </c:otherwise>
        </c:choose>
    </t:putAttribute>
    
    <t:putAttribute name="bodyContent">
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary"/>
            <t:putAttribute name="containerTitle">
                <spring:message code='domain.chooser.title' javaScriptEscape='true'/>
            </t:putAttribute>
            
            <t:putAttribute name="bodyContent">
	            <t:insertTemplate template="/WEB-INF/jsp/templates/dataChooserFlowControls.jsp">
	                <t:putAttribute name="selectedTab" value="display"/>
	            </t:insertTemplate>
	
	            <form id="stepDisplayForm">
	                <input type="hidden" id="slSortedQueryTree" name="slSortedQueryTree" value=""/>
	                <input type="hidden" id="slSortedQueryList" name="slSortedQueryList" value=""/>
	                <input type="hidden" id="isSimpleListCheckbox" name="isSimpleListCheckbox" value=""/>
	                <input type="hidden" id="unsavedChangesPresent" name="unsavedChangesPresent" value=""/>
	            </form>
	
	            <div id="stepDisplay">
	                <fieldset class="row instructions">
	                    <legend class="offLeft"><span><spring:message code='page.display.instructions' javaScriptEscape='true'/></span></legend>
	                    <h2 class="textAccent02"><spring:message code='page.display.setDisplay' javaScriptEscape='true'/></h2>
	                    <h4><spring:message code='page.display.selectFields.info' javaScriptEscape='true'/></h4>
	                </fieldset>
	
	                <fieldset class="row inputs oneColumn">
	                    <legend class="offLeft"><span><spring:message code='page.display.userInputs' javaScriptEscape='true'/></span></legend>
	                    <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
	                        <t:putAttribute name="containerClass" value="column decorated primary"/>
	                        <t:putAttribute name="containerTitle"><spring:message code='page.display.fields' javaScriptEscape='true'/></t:putAttribute>
	                        <t:putAttribute name="headerContent">
	                            <ul id="listMode" class="tabSet text mode horizontal responsive">
	                                <li class="label"><p class="wrap"><spring:message code='page.display.displayAs' javaScriptEscape='true'/></p></li>
	                                <li class="tab ${isNestedListSelected}"><p id="nestedList" class="wrap button"><spring:message code='page.display.nestedList' javaScriptEscape='true'/></p></li>
	                                <li class="tab last ${isFlatListSelected}"><p id="flatList" class="wrap button"><spring:message code='page.display.flatList' javaScriptEscape='true'/></p></li>
	                            </ul>
	                        </t:putAttribute>
	                        <t:putAttribute name="bodyContent">
                                <c:if test="${isIPad}"><div class="" style="position: absolute; right: 0; width: 100%; top: 0;"></c:if>
	                            <ul id="containerTree" class="list responsive collapsible fields tabular twoColumn hideRoot column simple">
	                                <li class="node open">
	                                    <p class="wrap"><b class="icon" title=""></b>root</p>
	                                    <ul id="foldersTree" class="list responsive collapsible fields tabular twoColumn ${foldersTreeClass}">
	                                        <li class="node open">
	                                            <div class="wrap header">
	                                                <b class="icon" title=""></b>
	                                                <p class="column one"><spring:message code='page.display.tree.header.columnOne' javaScriptEscape='true'/></p>
	                                                <p class="column two"><spring:message code='page.display.tree.header.columnTwo' javaScriptEscape='true'/></p>
	                                            </div>
	                                            <%--<div class=".swipeScroll">--%>
	                                            <div class="">
	                                            	<ul class="responsive" id="foldersTreeRoot"></ul>
	                                            </div>
	                                            <%--</div>--%>
	                                        </li>
	                                     </ul>
	                                </li>
	                            </ul>
                               <c:if test="${isIPad}"></div></c:if>
	                            <div id="moveButtons" class="moveButtons">
	                                <button id="toTop" class="button action square move toTop up" title="<spring:message code="button.dataChooser.display.moveToTop" javaScriptEscape="true"/>"><span class="wrap"><span class="icon"></span></span></button>
	                                <button id="upward" class="button action square move upward up" title="<spring:message code="button.dataChooser.display.moveUp" javaScriptEscape="true"/>"><span class="wrap"><span class="icon"></span></span></button>
	                                <button id="downward" class="button action square move downward up" title="<spring:message code="button.dataChooser.display.moveDown" javaScriptEscape="true"/>"><span class="wrap"><span class="icon"></span></span></button>
	                                <button id="toBottom" class="button action square move toBottom up" title="<spring:message code="button.dataChooser.display.moveToBottom" javaScriptEscape="true"/>"><span class="wrap"><span class="icon"></span></span></button>
	                            </div>
	                        </t:putAttribute>
	                    </t:insertTemplate>
	                </fieldset><!--/.row.inputs-->
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

        <%--ajax buffer--%>
        <div id="ajaxbuffer" class="hidden" ></div>

        <jsp:include page="displayState.jsp"/>

    </t:putAttribute>
</t:insertTemplate>
