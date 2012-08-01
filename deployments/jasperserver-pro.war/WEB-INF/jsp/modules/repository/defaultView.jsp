<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="/spring" prefix="spring"%>
<%@ taglib uri="/WEB-INF/jasperserver.tld" prefix="js"%>

<html>
<head>
  <script language="JavaScript" src="${pageContext.request.contextPath}/scripts/utils.expand-utils.js"></script>
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

<span class="fsection"><spring:message code="jsp.repository.defaultView.header"/></span>
<br/>
<br/>
<spring:message code="jsp.repository.defaultView.path"/>: <a href="<c:url value="flow.html"><c:param name="_flowId" value="repositoryFlow"/></c:url>"><spring:message code="jsp.repository.defaultView.root"/></a>
<c:set var="lastFolder" value="/"/>
<c:forEach items="${requestScope.pathFolders}" var="folder">
/<a href="<c:url value="flow.html"><c:param name="_flowId" value="repositoryFlow"/><c:param name="folder" value="${folder.URIString}"/></c:url>">${folder.name}</a>
<c:set var="lastFolder" value="${folder.URIString}"/>
</c:forEach>
<form name="frm" action="" method="post">
  <input type="hidden" name="_flowExecutionKey" value="${flowExecutionKey}"/>
  <input type="hidden" name="resource"/>
  <input type="hidden" name="resourceType"/>
  <input type="hidden" name="reportOptionsExpanded" value=""/>
  <input type="submit" class="fnormal" name="_eventId_ViewReport" id="viewReport" value="view" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_ViewOlapModel" id="viewOlapModel" value="view" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_ScheduleReport" id="scheduleReport" value="schedule" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_runReportInBackground" id="runReportInBackground" value="runReportInBackground" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_editAdhoc" id="editAdhoc" value="editAdhoc" style="visibility:hidden;"/>
  <input type="submit" name="_eventId_Remove" id="remove" value="remove" style="visibility:hidden;"/>
<table id="resourcesTable" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr bgcolor="#c2c4b6" class="fheader">
    <td width="1px"></td>
    <td class="paddedcell" width="20%"><spring:message code="label.display_name"/></td>
    <td class="paddedcell" width="30%"><spring:message code="label.description"/></td>
    <td class="paddedcell" width="20%"><spring:message code="label.type"/></td>
    <td class="paddedcell"><spring:message code="label.date"/></td>
    <td width="1px"></td>
  </tr>
<js:paginator items="${resources}" page="${currentPage}" formName="frm">
<c:forEach items="${paginatedItems}" var="resource" varStatus="itStatus">
<c:if test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.common.domain.Folder'}">
  <tr height="18" class="${itStatus.count % 2 == 0 ? 'list_alternate' : 'list_default'}">
    <td></td>
    <td class="paddedcell" nowrap><a href="<c:url value="flow.html"><c:param name="_flowId" value="repositoryFlow"/><c:param name="folder" value="${resource.URIString}"/></c:url>">${resource.label}</a></td>
    <td class="paddedcell">${resource.description}</td>
    <td class="paddedcell" nowrap><spring:message code="label.folder"/></td>
    <td nowrap class="paddedcell"><js:formatDate value="${resource.creationDate}"/></td>
    <td></td>
  </tr>
</c:if>
<c:if test="${resource.resourceType != 'com.jaspersoft.jasperserver.api.metadata.common.domain.Folder'}">
<c:set var="hasReportOptions" value="${(resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.ReportUnit'
                or resource.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit')
            and not empty reportOptionsMap[resource.URIString]}"/>
  <tr height="18" class="${itStatus.count % 2 == 0 ? 'list_alternate' : 'list_default'}">
<c:choose>
    <c:when test="${hasReportOptions}">
    <td align="center" valign="middle" class="paddedcell" width="1px">
      <a id="reportOptionsListLink${resource.name}" href="javascript:expandToggle('reportOptions', '${resource.name}');" title="<spring:message code="report.options.repository.tooltip.expand.options.list"/>">
        <img id="reportOptionsListImg${resource.name}" border="0"
          src="images/expand.gif" alt="<spring:message code="report.options.repository.tooltip.expand.options.list"/>"
        />
      </a>
    </td>
    </c:when>
    <c:otherwise>
    <td></td>
    </c:otherwise>
</c:choose>
    </td>
    <td class="paddedcell" nowrap>
        <c:choose>
            <c:when test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.ReportUnit' ||
                resource.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit' || resource.resourceType == 'com.jaspersoft.ji.adhoc.DashboardResource'}">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td nowrap>
                        <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.resourceType.value = '${resource.resourceType}';document.frm.viewReport.click();">
                            <c:out value="${resource.label}"/>
                        </a>
                    </td>
                    <td align="right" valign="middle" nowrap>
                        <c:if test="${resource.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit'}">
                            <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.editAdhoc.click();" title="<spring:message code="repository.browser.adhoc.edit.hint"/>">
                                <img border="0" src="adhoc/images/adhoc.gif" alt="<spring:message code="repository.browser.adhoc.edit.hint"/>"/>
                            </a>
                        </c:if>
                        <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.scheduleReport.click();" title="<spring:message code="repository.browser.schedule.hint"/>">
                            <img border="0" src="images/schedule.gif" alt="<spring:message code="repository.browser.schedule.hint"/>"/>
                        </a>
                        <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.runReportInBackground.click();" title="<spring:message code="repository.browser.run.in.background.hint"/>">
                            <img border="0" src="images/runreport.gif" alt="<spring:message code="repository.browser.run.in.background.hint"/>"/>
                        </a>
                    </td>
                </tr>
            </table>
        </c:when>
        <%-- olap web flow --%>
        <c:when test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.olap.domain.OlapUnit'}">
            <a href="<c:url value="/olap/viewOlap.html"><c:param name="name" value="${resource.URIString}"/><c:param name="new" value="true"/><c:param name="parentFlow" value="repositoryFlow"/><c:param name="folderPath" value="${lastFolder}"/></c:url>">
                <c:out value="${resource.label}"/></a>
        </c:when>
            <c:when test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.common.domain.ContentResource'}">
                <a href="<c:url value="/fileview/fileview${resource.URIString}"/>" target="_new">
                    <c:out value="${resource.label}"/></a>
            </c:when>
        <c:otherwise>
            <c:out value="${resource.label}"/>
        </c:otherwise>
        </c:choose>
    </td>
    <td class="paddedcell"><c:out value="${resource.description}"/></td>
    <td class="paddedcell" nowrap><spring:message code="resource.${resource.resourceType}.label"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${resource.creationDate}"/></td>
    <td></td>
  </tr>
    <c:if test="${hasReportOptions}">
        <c:forEach items="${reportOptionsMap[resource.URIString]}" var="option" varStatus="optionStatus">
        <c:set var="repositoryItemCount" value="${repositoryItemCount + 1}"/>
  <tr height="18" id="reportOptionsRow_${resource.name}_${optionStatus.count}" style="display:none"
        class="${itStatus.count % 2 == optionStatus.count % 2 ? 'list_alternate' : 'list_default'}">
    <td></td>
    <td class="paddedcell">
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            &nbsp;&nbsp;
            <a href="javascript:document.frm.reportOptionsExpanded.value='${resource.name}';document.frm.resource.value='${option.URIString}';document.frm.resourceType.value = '${option.resourceType}';document.frm.viewReport.click();">
              <c:out value="${option.name}"/>
            </a>
          </td>
          <td align="right" valign="middle" nowrap>
            <a href="javascript:document.frm.reportOptionsExpanded.value='${resource.name}';document.frm.resource.value='${option.URIString}';document.frm.resourceType.value = '${option.resourceType}';document.frm.scheduleReport.click();" title="<spring:message code="repository.browser.schedule.hint"/>">
              <img border="0" src="images/schedule.gif" alt="<spring:message code="repository.browser.schedule.hint"/>"/>
            </a>
            <a href="javascript:document.frm.reportOptionsExpanded.value='${resource.name}';document.frm.resource.value='${option.URIString}';document.frm.resourceType.value = '${option.resourceType}';document.frm.runReportInBackground.click();" title="<spring:message code="repository.browser.run.in.background.hint"/>">
              <img border="0" src="images/runreport.gif" alt="<spring:message code="repository.browser.run.in.background.hint"/>"/>
            </a>
          </td>
        </tr>
      </table>
    </td>
    <td class="paddedcell"><c:out value="${option.description}"/></td>
    <td class="paddedcell" nowrap><spring:message code="report.options.repository.type.label"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${option.creationDate}"/></td>
    <td></td>
  </tr>
        </c:forEach>
    </c:if>
</c:if>
</c:forEach>
    <tr>
        <td colspan="7">
            <js:paginatorLinks/>
        </td>
    </tr>
</js:paginator>
</form>
</table>

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
