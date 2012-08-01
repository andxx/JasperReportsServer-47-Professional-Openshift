<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="/WEB-INF/jasperserver.tld" prefix="js" %>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>

<head>
    <title><spring:message code="ADH_108_DATA_CHOOSER_PAGE_TITLE"/></title>
    <%@ include file="adHocScriptHeader.jsp"%>
    <script type="text/javascript" src='${pageContext.request.contextPath}/scripts/adhoc.start.js'></script>
    <c:choose>
        <c:when test="${startTopic}">
            <c:set var="isTopicTreeHidden" value=""/>
            <c:set var="isTopicTabSelected" value="selected"/>
            <c:set var="isDomainTreeHidden" value="hidden"/>
            <c:set var="isDomainTabSelected" value=""/>
        </c:when>
        <c:otherwise>
            <c:set var="isTopicTreeHidden" value="hidden"/>
            <c:set var="isTopicTabSelected" value=""/>
            <c:set var="isDomainTreeHidden" value=""/>
            <c:set var="isDomainTabSelected" value="selected"/>
        </c:otherwise>
    </c:choose>

    <script type="text/javascript">
        var alreadyEditing = false;
        <c:if test='${param.alreadyEditing}'>
        alreadyEditing = true;
        </c:if>
    </script>
</head>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle">
        <spring:message code="ADH_108_DATA_CHOOSER_PAGE_TITLE"/>
    </t:putAttribute>
    <t:putAttribute name="bodyID" value="dataChooserSource"/>
    <t:putAttribute name="bodyClass" value="threeColumn"/>

    <t:putAttribute name="bodyContent" >
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="panel dialog sourceDialog overlay moveable sizeable centered_vert centered_horz showingSubHeader hidden"/>
            <t:putAttribute name="containerID" value="sourceDialog"/>
            <t:putAttribute name="containerElements"><div class="sizer diagonal"></div></t:putAttribute>
            <t:putAttribute name="headerClass" value="mover"/>
            <t:putAttribute name="containerTitle"><spring:message code="ADH_108_DATA_CHOOSER_DIALOG_TITLE"/></t:putAttribute>
            <t:putAttribute name="headerContent">
                <div class="sub header">
                    <ul id="sourceFilter" class="tabSet control text horizontal responsive">
                        <li id="topics" class="tab ${isTopicTabSelected}">
                            <p class="wrap button">
                                <spring:message code="ADH_108_DATA_CHOOSER_TOPICS"/>
                            </p>
                        </li>
                        <li id="domains" class="tab ${isDomainTabSelected}">
                            <p class="wrap button">
                                <spring:message code="ADH_108_DATA_CHOOSER_DOMAINS"/>
                            </p>
                        </li>
                        <li id="olapConnections" class="tab last">
                            <c:if test="${isAnalysisFeatureSupported}">
                                <p class="wrap button">
                                    <spring:message code="ADH_108_DATA_CHOOSER_OLAP_CONNECTIONS"/>
                                </p>
                            </c:if>
                        </li>
                    </ul>
                </div>
            </t:putAttribute>

            <t:putAttribute name="bodyContent">
                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                    <t:putAttribute name="containerClass" value="control groupBox fillParent"/>
                    <t:putAttribute name="swipeScroll" value="${isIPad}"/>

                    <t:putAttribute name="bodyContent">
                        <ul id="topicsTreeArea" class="list responsive collapsible folders ${isTopicTreeHidden}"></ul>
                        <ul id="domainsTreeArea" class="list responsive collapsible folders ${isDomainTreeHidden}"></ul>
                        <ul id="olapConectionsTreeArea" class="list responsive collapsible folders hidden"></ul>
                    </t:putAttribute>
                </t:insertTemplate>
                <p id="nodeDescription" class="description"></p>
            </t:putAttribute>

            <t:putAttribute name="footerContent">
                <fieldset id="reportTypes" class="${isTopicTreeHidden}">
                    <button id="table" class="button action up"><span class="wrap">
                                <spring:message code="ADH_003a_TABLE"/></span><span class="icon"></span>
                    </button>
                    <button id="chart" class="button action up"><span class="wrap">
                                <spring:message code="ADH_003b_CHART"/></span><span class="icon"></span>
                    </button>
                    <button id="crosstab" class="button action up"><span class="wrap">
                                <spring:message code="ADH_003c_CROSSTAB"/></span><span class="icon"></span>
                    </button>
                </fieldset>
                <button id="dataChooserBtn" class="${isDomainTreeHidden} button action up"><span class="wrap">
                            <spring:message code="ADH_108_DATA_CHOOSER_DOMAIN_LABEL"/>&#8230;</span><span class="icon"></span>
                </button>
                <button id="olapCrosstabBtn" class="hidden button action up"><span class="wrap">
                            <spring:message code="ADH_003c_CROSSTAB"/></span><span class="icon"></span>
                </button>
                <button id="cancel" class="button action up"><span class="wrap">
                    <spring:message code="ADH_010_BUTTON_CANCEL"/></span><span class="icon"></span>
                </button>
            </t:putAttribute>
        </t:insertTemplate>
        <div id="ajaxbuffer" style="display: none;" ></div>


        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated primary"/>
            <t:putAttribute name="containerTitle"><spring:message code='ADH_002c_CANVAS'/></t:putAttribute>
            <t:putAttribute name="bodyContent">

            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
            <t:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </t:putAttribute>
            <t:putAttribute name="containerTitle"><spring:message code='ADH_112_DATA_SOURCE'/></t:putAttribute>
            <t:putAttribute name="bodyContent">

            </t:putAttribute>
        </t:insertTemplate>

        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="column decorated tertiary sizeable"/>
            <t:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </t:putAttribute>
            <t:putAttribute name="containerTitle"><spring:message code='ADH_187_FILTERS_TITLE'/></t:putAttribute>
            <t:putAttribute name="bodyContent">

            </t:putAttribute>
        </t:insertTemplate>

    </t:putAttribute>

</t:insertTemplate>









