<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@page import="java.util.regex.Pattern,
        com.jaspersoft.jasperserver.api.metadata.common.domain.ResourceLookup"%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="/spring" prefix="spring"%>
<%@ taglib uri="/WEB-INF/jasperserver.tld" prefix="js"%>

<%!

    protected static final Pattern PATTERN_ID_URI_REPLACE = Pattern.compile("\\/");
    protected static final String PATTERN_ID_URI_REPLACEMENT = "\\:";

    protected static String makeReportId(ResourceLookup report)
    {
        String uri = report.getURIString();
        String id = PATTERN_ID_URI_REPLACE.matcher(uri).replaceAll(PATTERN_ID_URI_REPLACEMENT);
        return id;
    }
%>

<html>
<head>
  <title><spring:message code='jsp.ListReports.title'/></title>
  <meta name="pageHeading" content="INTERACTIVE REPORTS"/>
  <script language="JavaScript" src="${pageContext.request.contextPath}/scripts/utils.expandutils.js"></script>
  <script language="JavaScript">
    expandTypeInit("reportOptions", "reportOptionsListImg", "reportOptionsListLink",
        "images/expand.gif", "<spring:message code="report.options.repository.tooltip.expand.options.list" javaScriptEscape="true"/>", showReportOptions,
        "images/collapse.gif", "<spring:message code="report.options.repository.tooltip.collapse.options.list" javaScriptEscape="true"/>", hideReportOptions);
  </script>
</head>

<body>

<table width="100%" border="0" cellpadding="20" cellspacing="0">
  <tr>
    <td>

<span class="fsection"><spring:message code='jsp.ListReports.section'/></span>
<br/>
<br/>
<form name="fmLstRpts" method="post" action="../">
<table id="resourcesTable" border="0" width="100%" cellpadding="0" cellspacing="0">
    <input type="submit" class="fnormal" name="_eventId_ScheduleReport" id="scheduleReport" value="schedule" style="visibility:hidden;"/>
    <input type="submit" class="fnormal" name="_eventId_runReportInBackground" id="runReportInBackground" value="runReportInBackground" style="visibility:hidden;"/>
    <input type="submit" class="fnormal" name="_eventId_editAdhoc" id="editAdhoc" value="editAdhoc" style="visibility:hidden;"/>
    <input type="hidden" name="reportUnit"/>
    <input type="hidden" name="resourceType"/>
    <input type="hidden" name="reportOptionsExpanded" value=""/>
    <input type="hidden" name="_flowExecutionKey" value="${flowExecutionKey}"/>
  <tr bgcolor="#c2c4b6" class="fheader">
    <td width="1px"></td>
    <td class="paddedcell" width="20%"><spring:message code='jsp.ListReports.report_name'/></td>
    <td class="paddedcell" width="40%"><spring:message code='jsp.ListReports.description'/></td>
    <td class="paddedcell"><spring:message code='jsp.ListReports.date'/></td>
    <td class="paddedcell" width="10%"><spring:message code='RM_CREATE_FOLDER_PARENT_FOLDER'/></td>
    <td width="1px"></td>
  </tr>
<js:paginator items="${reportUnits}" page="${currentPage}" formName="fmLstRpts">
<c:forEach var="reportUnit" items="${paginatedItems}" varStatus="itStatus">
<c:set var="hasReportOptions" value="${not empty reportOptionsMap[reportUnit.URIString]}"/>
  <tr height="18" class="${itStatus.count % 2 == 0 ? 'list_alternate' : 'list_default'}">
<c:choose>
    <c:when test="${hasReportOptions}">
    <%
        ResourceLookup report = (ResourceLookup) pageContext.findAttribute("reportUnit");
        String reportId = makeReportId(report);
        pageContext.setAttribute("reportId", reportId);
    %>
    <td align="center" valign="middle" class="paddedcell" width="1px">
      <a id="reportOptionsListLink${reportId}" href="javascript:expandToggle('reportOptions', '${reportId}');" title="<spring:message code="report.options.repository.tooltip.expand.options.list"/>">
        <img id="reportOptionsListImg${reportId}" border="0"
          src="images/expand.gif" alt="<spring:message code="report.options.repository.tooltip.expand.options.list"/>"
        />
      </a>
    </td>
    </c:when>
    <c:otherwise>
    <td></td>
    </c:otherwise>
</c:choose>
    <td class="paddedcell">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td nowrap>
                <c:url var="reportExecutionURL" value="flow.html">
                    <c:param name="_eventId" value="selectReport"/>
                    <c:param name="reportUnit" value="${reportUnit.URIString}"/>
                    <c:param name="resourceType" value="${reportUnit.resourceType}"/>
                    <c:param name="_flowExecutionKey" value="${flowExecutionKey}"/>
                </c:url>
                <a href="${reportExecutionURL}"><c:out value="${reportUnit.label}"/></a>
                </td>
                <td align="right" valign="middle" nowrap>
                    <c:if test="${reportUnit.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit'}">
                        <a href="javascript:document.fmLstRpts.reportUnit.value='${reportUnit.URIString}';document.fmLstRpts.editAdhoc.click();" title="<spring:message code="repository.browser.adhoc.edit.hint"/>">
                            <img border="0" src="adhoc/images/adhoc.gif" alt="<spring:message code="repository.browser.adhoc.edit.hint"/>"/>
                        </a>
                    </c:if>
                    <a href="javascript:document.fmLstRpts.reportUnit.value='${reportUnit.URIString}';document.fmLstRpts.scheduleReport.click();" title="<spring:message code="repository.browser.schedule.hint"/>">
                        <img border="0" src="images/schedule.gif" alt="<spring:message code="repository.browser.schedule.hint"/>"/>
                    </a>
                    <a href="javascript:document.fmLstRpts.reportUnit.value='${reportUnit.URIString}';document.fmLstRpts.runReportInBackground.click();" title="<spring:message code="repository.browser.run.in.background.hint"/>">
                        <img border="0" src="images/runreport.gif" alt="<spring:message code="repository.browser.run.in.background.hint"/>"/>
                    </a>
                </td>
            </tr>
        </table>
    </td>
    <td class="paddedcell"><c:out value="${reportUnit.description}"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${reportUnit.creationDate}"/></td>
    <td class="paddedcell" nowrap>
     <a href="ListReports.jsp#" onclick="gotoFolderExplorer('${reportUnit.parentFolder}')">
      <c:out value="${reportUnit.parentFolder}"/>
     </a>
    </td>
    <td></td>
  </tr>
    <c:if test="${hasReportOptions}">
        <c:forEach items="${reportOptionsMap[reportUnit.URIString]}" var="option" varStatus="optionStatus">
        <c:set var="repositoryItemCount" value="${repositoryItemCount + 1}"/>
  <tr height="18" id="reportOptionsRow_${reportId}_${optionStatus.count}" style="display:none"
        class="${itStatus.count % 2 == optionStatus.count % 2 ? 'list_alternate' : 'list_default'}">
    <td></td>
    <td class="paddedcell">
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td nowrap>
            &nbsp;&nbsp;
            <c:url var="optionsExecutionURL" value="flow.html">
                <c:param name="_eventId" value="selectReport"/>
                <c:param name="reportUnit" value="${option.URIString}"/>
                <c:param name="resourceType" value="${option.resourceType}"/>
                <c:param name="reportOptionsExpanded" value="${reportId}"/>
                <c:param name="_flowExecutionKey" value="${flowExecutionKey}"/>
            </c:url>
            <a href="${optionsExecutionURL}">
              <c:out value="${option.label}"/>
            </a>
          </td>
          <td align="right" valign="middle" nowrap>
            <a href="javascript:document.fmLstRpts.reportOptionsExpanded.value='${reportId}';document.fmLstRpts.reportUnit.value='${option.URIString}';document.fmLstRpts.resourceType.value = '${option.resourceType}';document.fmLstRpts.scheduleReport.click();" title="<spring:message code="repository.browser.schedule.hint"/>">
              <img border="0" src="images/schedule.gif" alt="<spring:message code="repository.browser.schedule.hint"/>"/>
            </a>
            <a href="javascript:document.fmLstRpts.reportOptionsExpanded.value='${reportId}';document.fmLstRpts.reportUnit.value='${option.URIString}';document.fmLstRpts.resourceType.value = '${option.resourceType}';document.fmLstRpts.runReportInBackground.click();" title="<spring:message code="repository.browser.run.in.background.hint"/>">
              <img border="0" src="images/runreport.gif" alt="<spring:message code="repository.browser.run.in.background.hint"/>"/>
            </a>
          </td>
        </tr>
      </table>
    </td>
    <td class="paddedcell"><c:out value="${option.description}"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${option.creationDate}"/></td>
    <td class="paddedcell" nowrap>
     <a href="ListReports.jsp#" onclick="gotoFolderExplorer('${reportUnit.parentFolder}')">
      <c:out value="${reportUnit.name}"/>
     </a>
    </td>
    <td></td>
  </tr>
        </c:forEach>
    </c:if>
</c:forEach>
    <tr>
        <td colspan="6">
            <js:paginatorLinks/>
        </td>
    </tr>
</js:paginator>
</table>
</form>

    </td>
  </tr>
</table>

<c:if test="${not empty reportOptionsExpanded}">
<script language="JavaScript">
    expandToggle('reportOptions', '<c:out value="${reportOptionsExpanded}"/>');
</script>
</c:if>

</body>

</html>


