<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<%@ page import="org.springframework.web.servlet.support.*" %>
<%@ page import="org.springframework.context.*" %>
<%@ page import="com.jaspersoft.commons.semantic.datasource.SemanticLayerFactory" %>
<%@ page import="com.jaspersoft.commons.semantic.ConfigurationObject" %>


<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code="menu.adhoc.options"/></t:putAttribute>
    <t:putAttribute name="bodyID" value="designerOptions"/>
    <t:putAttribute name="bodyClass" value="twoColumn"/>
    <t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/administer.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/administer.options.js"></script>
        <%@ include file="administerState.jsp" %>
    </t:putAttribute>
    <t:putAttribute name="bodyContent">
		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerID" value="settings"/>
		    <t:putAttribute name="containerClass" value="column decorated primary"/>
		    <t:putAttribute name="containerTitle"><spring:message code="menu.adhoc.options"/></t:putAttribute>
		    <t:putAttribute name="bodyClass" value=""/>
		    <t:putAttribute name="bodyContent">

                <%
                    ConfigurationObject slConfig = (ConfigurationObject) request.getAttribute("slFactoryConfig");
                %>

				<ol class="list settings">		
					<li class="node">
						<div class="wrap">
							<h2 class="title settingsGroup"><spring:message code="QG_100_QUERY_LIMITS"/></h2>
						</div>
						<p class="description"><spring:message code="QG_100_QUERY_LIMITS_EXPLAIN"/></p>
						<ol class="list settings">

                            <%
                                request.setAttribute("oName", "maxAvailableValues");
                                request.setAttribute("oDesc", "QG_101_MAX_AVAILABLE_VALUES_EXPLAIN");
                                request.setAttribute("oLabelCode", "QG_101_MAX_AVAILABLE_VALUES");
                                request.setAttribute("oValue", slConfig.getMaxAvailableValues());
                            %>
                            <jsp:include page="templateInputText.jsp" flush="true" />

                            <%
                              request.setAttribute("oName", "maxResultSetRows");
                              request.setAttribute("oDesc", "QG_102_MAX_ROWS_EXPLAIN");
                              request.setAttribute("oLabelCode", "QG_102_MAX_ROWS");
                              request.setAttribute("oValue", slConfig.getMaxResultSetRows());
                            %>
                            <jsp:include page="templateInputText.jsp" flush="true" />

                            <%
                              request.setAttribute("oName", "maxExecutionTimeSec");
                              request.setAttribute("oDesc", "QG_103_MAX_SECS_EXPLAIN");
                              request.setAttribute("oLabelCode", "QG_103_MAX_SECS");
                              request.setAttribute("oValue", slConfig.getMaxExecutionTimeSec());
                            %>
                            <jsp:include page="templateInputText.jsp" flush="true" />

                        </ol>
                    </li>
                    <li class="node">
                        <div class="wrap">
                            <h2 class="title settingsGroup"><spring:message code="QG_100_DATA_POLICIES"/></h2>
                        </div>
                        <p class="description"><spring:message code="QG_100_DATA_POLICIES_EXPLAIN"/></p>
                        <ol class="list settings">

                              <%
                                request.setAttribute("oName", "domainDataStrategy");
                                request.setAttribute("oDesc", "QG_104_DOMAIN_STRATEGY_ENABLED_EXPLAIN");
                                request.setAttribute("oLabelCode", "QG_104_DOMAIN_STRATEGY_ENABLED");
                                request.setAttribute("oValue", request.getAttribute("domainStrategyEnabled"));
                              %>
                              <jsp:include page="templateCheckbox.jsp" flush="true" />

                              <%
                                request.setAttribute("oName", "sqlQueryDataStrategy");
                                request.setAttribute("oDesc", "QG_105_SQL_STRATEGY_ENABLED_EXPLAIN");
                                request.setAttribute("oLabelCode", "QG_105_SQL_STRATEGY_ENABLED");
                                request.setAttribute("oValue", request.getAttribute("sqlStrategyEnabled"));
                              %>
                              <jsp:include page="templateCheckbox.jsp" flush="true" />

                        </ol>
					</li>
				</ol>

		    </t:putAttribute>
		    <t:putAttribute name="footerContent">
		    </t:putAttribute>
		</t:insertTemplate>

		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
		    <t:putAttribute name="containerID" value="filters"/>
		    <t:putAttribute name="containerClass" value="column decorated secondary sizeable"/>
            <t:putAttribute name="containerElements">
                <div class="sizer horizontal"></div>
                <button class="button minimize"></button>
            </t:putAttribute>
		    <t:putAttribute name="containerTitle"><spring:message code="SEARCH_FILTERS"/></t:putAttribute>
		    <t:putAttribute name="bodyClass" value=""/>
		    <t:putAttribute name="bodyContent">
		    	<!--
		    	   NOTE: these objects serve as navigation links, load respective pages
		    	 -->
		    	<ul class="list responsive filters">
                    <li class="leaf"><p class="wrap button" id="navLogSettings"><b class="icon"></b><spring:message code="menu.log.Settings"/></p></li>
                    <li class="leaf selected"><p class="wrap button" id="navDesignerOptions"><b class="icon"></b><spring:message code="menu.adhoc.options"/></p></li>
                    <li class="leaf"><p class="wrap button" id="navDesignerCache"><b class="icon"></b><spring:message code="menu.adhoc.cache"/></p></li>
                    <li class="leaf"><p class="wrap button down" id="navAnalysisOptions"><b class="icon"></b><spring:message code="menu.mondrian.properties"/></p></li>
					<li class="leaf" disabled="disabled"><p class="wrap separator" href="#"><b class="icon"></b></p></li>
				</ul>
		    </t:putAttribute>
		    <t:putAttribute name="footerContent">
		    </t:putAttribute>
		</t:insertTemplate>

	</t:putAttribute>
		
</t:insertTemplate>
