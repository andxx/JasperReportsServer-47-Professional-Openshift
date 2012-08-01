<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>



<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle"><spring:message code="menu.adhoc.cache"/></t:putAttribute>
    <t:putAttribute name="bodyID" value="designerCache"/>
    <t:putAttribute name="bodyClass" value="twoColumn"/>
	<t:putAttribute name="headerContent">
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/administer.base.js"></script>
        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/administer.cache.js"></script>
        <%@ include file="administerState.jsp" %>
	</t:putAttribute>
    <t:putAttribute name="bodyContent">
		<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerID" value="settings"/>
		    <t:putAttribute name="containerClass" value="column decorated primary"/>
		    <t:putAttribute name="containerTitle"><spring:message code="menu.adhoc.cache"/></t:putAttribute>
		    <t:putAttribute name="headerContent">
                <button id="clearAllCache" class="button capsule text up" ${(! empty dsList) ? '' : 'disabled=""'}><span class="wrap"><spring:message code="ADH_270_CACHE_CLEAR_ALL"/></span></button>
		    </t:putAttribute>
		    <t:putAttribute name="bodyClass" value=""/>
		    <t:putAttribute name="bodyContent">

				<t:insertTemplate template="/WEB-INF/jsp/templates/nothingToDisplay.jsp">
					<t:putAttribute name="bodyContent">
						<p class="message"><spring:message code="ADH_270_CACHE_NO_DATASETS"/></p>
				    </t:putAttribute>
				</t:insertTemplate>
								
                <c:if test="${! empty dsList}">

                    <ol class="list tabular fiveColumn" id="dsContainer">

                        <li class="leaf header">
                            <div class="wrap">
                                <div class="column one">
                                    <p class="data"><spring:message code="ADH_270_CACHE_AGE"/></p>
                                </div>
                                <div class="column two">
                                    <p class="data"><spring:message code="ADH_270_CACHE_QUERY_AND_SOURCE"/></p>
                                </div>
                                <div class="column three">
                                    <p class="data"><spring:message code="ADH_270_CACHE_QUERY_TIME"/></p>
                                </div>
                                <div class="column four">
                                    <p class="data"><spring:message code="ADH_270_CACHE_FETCH_TIME"/></p>
                                </div>
                                <div class="column five">
                                </div>
                            </div>
                        </li>

                        <c:forEach var="ds" items="${dsList}" varStatus="n">
                            <li class="leaf ${ds.isComplete ? "" : "running"}" id="qItem_${ds.id}">
                                <div class="wrap">
                                    <div class="column one">
                                        <p class="data">${ds.age}</p>
                                    </div>
                                    <div class="column two">
                                        <h3 class="query"><a name="${ds.id}">${ds.query}</a></h3>
                                        <p class="data path">${ds.datasourceURI}</p>
                                    </div>
                                    <div class="column three">
                                        <p class="data">${ds.queryTime}</p>
                                    </div>
                                    <div class="column four">
                                        <p class="data">${ds.fetchTime}</p>
                                    </div>
                                    <div class="column five">
                                        <button class="button action up" name="${ds.id}">
                                            <span class="wrap">
                                                <c:choose>
                                                    <c:when test="${ds.isComplete}">
                                                        <spring:message code="button.clear"/>
                                                    </c:when>
                                                    <c:otherwise>
                                                        <spring:message code="button.cancel"/>
                                                    </c:otherwise>
                                                </c:choose>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </c:forEach>

                    </ol>
                </c:if>

                <jsp:include page="templateDetails.jsp"/>

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
                    <li class="leaf"><p class="wrap button" id="navDesignerOptions"><b class="icon"></b><spring:message code="menu.adhoc.options"/></p></li>
                    <li class="leaf selected"><p class="wrap button" id="navDesignerCache"><b class="icon"></b><spring:message code="menu.adhoc.cache"/></p></li>
                    <li class="leaf"><p class="wrap button down" id="navAnalysisOptions"><b class="icon"></b><spring:message code="menu.mondrian.properties"/></p></li>
                    <li class="leaf" disabled="disabled"><p class="wrap separator" href="#"><b class="icon"></b></p></li>
				</ul>
		    </t:putAttribute>
		    <t:putAttribute name="footerContent">
		    </t:putAttribute>
		</t:insertTemplate>
	</t:putAttribute>
	
</t:insertTemplate>
