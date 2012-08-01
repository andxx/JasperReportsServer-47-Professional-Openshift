<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

                <t:insertTemplate template="/WEB-INF/jsp/templates/detail.jsp">
                <t:putAttribute name="containerClass" value="sizeable hidden"/>
                <t:putAttribute name="bodyContent">	    
					<ul>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_QUERY"/></h4>
							<p class="data" id="detQuery"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_DATASOURCE"/></h4>
							<p class="data" id="detDataSourceURI"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_PARAMS"/></h4>
							<p class="data" id="detParameters"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_AGE"/></h4>
							<p class="data" id="detAge"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_LAST_USED"/></h4>
							<p class="data" id="detTime"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_ROWS"/></h4>
							<p class="data" id="detRows"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_QUERY_TIME"/></h4>
							<p class="data" id="detQueryTime"></p>
						</li>
						<li>
							<h4 class="label"><spring:message code="ADH_270_CACHE_FETCH_TIME"/></h4>
							<p class="data" id="detFetchTime"></p>
						</li>
					</ul>
	</t:putAttribute>
</t:insertTemplate>						

