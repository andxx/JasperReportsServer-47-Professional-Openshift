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
  <script language="JavaScript" src="${pageContext.request.contextPath}/scripts/components.checkbox-utils.js"></script>
  <script language="JavaScript" src="${pageContext.request.contextPath}/scripts/utils.expand-utils.js"></script>
  <script language="JavaScript">
    function removeRepositoryItems() {
        if (checkboxListAnySelected('repositoryItems')) {
            if (confirm('<spring:message code="jsp.repoAdmin.defaultView.confirmRemove" javaScriptEscape="true"/>')) {
                document.frm.remove.click();
            }
        } else {
            alert('<spring:message code="jsp.repoAdmin.defaultView.nothing.to.remove" javaScriptEscape="true"/>');
        }
    }

    expandTypeInit("reportOptions", "reportOptionsListImg", "reportOptionsListLink",
        "images/expand.gif", "<spring:message code="report.options.repository.tooltip.expand.options.list" javaScriptEscape="true"/>", showReportOptions,
        "images/collapse.gif", "<spring:message code="report.options.repository.tooltip.collapse.options.list" javaScriptEscape="true"/>", hideReportOptions);
  </script>
</head>

<body>

<table width="100%" border="0" cellpadding="20" cellspacing="0">
  <tr>
    <td>

<span class="fsection"><spring:message code="jsp.repoAdmin.defaultView.header"/></span>
<br/>
<br/>
<table border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
<spring:message code="jsp.repoAdmin.defaultView.path"/>: <a href="<c:url value="flow.html"><c:param name="_flowId" value="repoAdminFlow"/></c:url>"><spring:message code="jsp.repoAdmin.defaultView.root"/></a>
<c:set var="lastFolder" value="/"/>
<c:forEach items="${requestScope.pathFolders}" var="folder">
/<a href="<c:url value="flow.html"><c:param name="_flowId" value="repoAdminFlow"/><c:param name="folder" value="${folder.URIString}"/></c:url>">${folder.name}</a>
   <c:set var="lastFolder" value="${folder.URIString}"/>
</c:forEach>
    </td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
    <td><a href="javascript:document.frm.resource.value='${lastFolder}';document.frm.assign.click();"><spring:message code="jsp.repoAdmin.defaultView.assign.permissions"/></a></td>
  </tr>
</table>
<form name="frm" action="" method="post">
  <input type="hidden" name="_flowExecutionKey" value="${flowExecutionKey}"/>
  <input type="hidden" name="resource"/>
  <input type="hidden" name="resourceType"/>
  <input type="hidden" name="reportOptionsExpanded" value=""/>
  <input type="submit" class="fnormal" name="_eventId_Edit" id="edit" value="edit" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_ViewReport" id="viewReport" value="view" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_ViewOlapModel" id="viewOlapModel" value="view" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_ScheduleReport" id="scheduleReport" value="schedule" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_runReportInBackground" id="runReportInBackground" value="runReportInBackground" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_editAdhoc" id="editAdhoc" value="editAdhoc" style="visibility:hidden;"/>
  <input type="submit" class="fnormal" name="_eventId_editDashboard" id="editDashboard" value="editDashboard" style="visibility:hidden;"/>
  <input type="submit" name="_eventId_Remove" id="remove" value="remove" style="visibility:hidden;"/>
  <input type="submit" name="_eventId_Assign" id="assign" value="assign" style="visibility:hidden;"/>
<table id="resourcesTable" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr bgcolor="#c2c4b6" class="fheader">
    <td width="1px"></td>
    <td class="paddedcell" width="20%"><spring:message code="label.name"/></td>
    <td class="paddedcell"><spring:message code="label.label"/></td>
    <td class="paddedcell" width="20%"><spring:message code="label.type"/></td>
    <td class="paddedcell" width="12%"><spring:message code="label.date"/></td>
    <td class="paddedcell" width="12%" align="center"><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></td>
    <td class="paddedcell" width="12%" align="center"><spring:message code="jsp.repoAdmin.defaultView.permissions"/></td>
    <td class="paddedcell" width="10" align="center">
        <input type="checkbox" name="selectAll" class="fnormal"
            onclick="checkboxListAllClicked('repositoryItems', this)"
            title="<spring:message code="list.checkbox.select.all.hint"/>"/>
    </td>
    <td width="1px"></td>
  </tr>
<js:paginator items="${resources}" page="${currentPage}" formName="frm">
<c:set var="repositoryItemCount" value="0"/>
<c:forEach items="${paginatedItems}" var="resource" varStatus="itStatus">
<c:set var="repositoryItemCount" value="${repositoryItemCount + 1}"/>
<c:if test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.common.domain.Folder'}">
  <tr class="${itStatus.count % 2 == 0 ? 'list_alternate' : 'list_default'}">
    <td></td>
    <td class="paddedcell"><a href="<c:url value="flow.html"><c:param name="_flowId" value="repoAdminFlow"/><c:param name="folder" value="${resource.URIString}"/></c:url>">${resource.name}</a></td>
    <td class="paddedcell">${resource.label}</td>
    <td class="paddedcell"><spring:message code="label.folder"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${resource.creationDate}"/></td>
    <c:choose>
        <c:when test="${not empty editableResources[resource.URIString]}">
               <td class="paddedcell" align="center" nowrap><a href="javascript:document.frm.resourceType.value='folder';document.frm.resource.value='${resource.URIString}';document.frm.edit.click();" value="Edit"><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></a></td>
        </c:when>
        <c:otherwise>
            <td class="paddedcell" align="center" nowrap><span disabled><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></span></td>
        </c:otherwise>
    </c:choose>
    <td class="paddedcell" align="center" nowrap><a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.assign.click();"><spring:message code="jsp.repoAdmin.defaultView.assign"/></a></td>
    <c:choose>
        <c:when test="${not empty removableResources[resource.URIString]}">
               <td class="paddedcell" align="center"><input type="checkbox" name="selectedFolders" value="${resource.URIString}" class="fnormal" onclick="checkboxListCheckboxClicked('repositoryItems', this)"/></td>
        </c:when>
        <c:otherwise>
            <td class="paddedcell" align="center"><input type="checkbox" class="fnormal"  disabled/></td>
        </c:otherwise>
    </c:choose>
    <td></td>
  </tr>
</c:if>
<c:if test="${resource.resourceType != 'com.jaspersoft.jasperserver.api.metadata.common.domain.Folder'}">
<c:set var="hasReportOptions" value="${(resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.ReportUnit'
                or resource.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit')
            and not empty reportOptionsMap[resource.URIString]}"/>
  <tr class="${itStatus.count % 2 == 0 ? 'list_alternate' : 'list_default'}">
<c:choose>
    <c:when test="${hasReportOptions}">
    <td align="center" valign="middle" class="paddedcell">
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
    <td class="paddedcell">
        <c:choose>
            <c:when test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.ReportUnit' ||
                resource.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit' || resource.resourceType == 'com.jaspersoft.ji.adhoc.DashboardResource'}">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.resourceType.value = '${resource.resourceType}';document.frm.viewReport.click();">
                            <c:out value="${resource.name}"/>
                        </a>
                    </td>
                    <td align="right" valign="middle" nowrap>
                        <c:if test="${resource.resourceType == 'com.jaspersoft.ji.adhoc.AdhocReportUnit'}">
                            <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.editAdhoc.click();" title="<spring:message code="repository.browser.adhoc.edit.hint"/>">
                                <img border="0" src="adhoc/images/adhoc.gif" alt="<spring:message code="repository.browser.adhoc.edit.hint"/>"/>
                            </a>
                        </c:if>
                        <c:if test="${resource.resourceType == 'com.jaspersoft.ji.adhoc.DashboardResource'}">
                            <a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.editDashboard.click();" title="<spring:message code="repository.browser.adhoc.edit.hint"/>">
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
            <a href="<c:url value="/olap/viewOlap.html"><c:param name="name" value="${resource.URIString}"/><c:param name="new" value="true"/><c:param name="parentFlow" value="repoAdminFlow"/><c:param name="folderPath" value="${lastFolder}"/></c:url>">
                <c:out value="${resource.name}"/></a>
        </c:when>
            <c:when test="${resource.resourceType == 'com.jaspersoft.jasperserver.api.metadata.common.domain.ContentResource'}">
                <a href="<c:url value="/fileview/fileview${resource.URIString}"/>" target="_new">
                    <c:out value="${resource.name}"/></a>
            </c:when>
        <c:otherwise>
            <c:out value="${resource.name}"/>
        </c:otherwise>
        </c:choose>
    </td>
    <td class="paddedcell"><c:out value="${resource.label}"/></td>
    <td class="paddedcell" nowrap><spring:message code="resource.${resource.resourceType}.label"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${resource.creationDate}"/></td>
    <c:choose>
        <c:when test="${not empty editableResources[resource.URIString]}">
            <td class="paddedcell" align="center" nowrap><a href="javascript:document.frm.resourceType.value='${resource.resourceType}';document.frm.resource.value='${resource.URIString}';document.frm.edit.click();"><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></a></td>
        </c:when>
        <c:otherwise>
            <td class="paddedcell" align="center" nowrap><span disabled><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></span></td>
        </c:otherwise>
    </c:choose>
    <td class="paddedcell" align="center" nowrap><a href="javascript:document.frm.resource.value='${resource.URIString}';document.frm.assign.click();"><spring:message code="jsp.repoAdmin.defaultView.assign"/></a></td>
    <c:choose>
        <c:when test="${not empty removableResources[resource.URIString]}">
               <td class="paddedcell" align="center"><input type="checkbox" name="selectedResources" value="${resource.URIString}" class="fnormal" onclick="checkboxListCheckboxClicked('repositoryItems', this)"/></td>
        </c:when>
        <c:otherwise>
            <td class="paddedcell" align="center"><input type="checkbox" class="fnormal"  disabled/></td>
        </c:otherwise>
    </c:choose>
    <td></td>
  </tr>
    <c:if test="${hasReportOptions}">
        <c:forEach items="${reportOptionsMap[resource.URIString]}" var="option" varStatus="optionStatus">
        <c:set var="repositoryItemCount" value="${repositoryItemCount + 1}"/>
  <tr id="reportOptionsRow_${resource.name}_${optionStatus.count}" style="display:none"
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
    <td class="paddedcell"><c:out value="${option.label}"/></td>
    <td class="paddedcell" nowrap><spring:message code="report.options.repository.type.label"/></td>
    <td class="paddedcell" nowrap><js:formatDate value="${option.creationDate}"/></td>
    <c:choose>
        <c:when test="${not empty editableReportOptions[option.URIString]}">
               <td class="paddedcell" align="center"><a href="javascript:document.frm.reportOptionsExpanded.value='${resource.name}';document.frm.resourceType.value='${option.resourceType}';document.frm.resource.value='${option.URIString}';document.frm.edit.click();"><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></a></td>
        </c:when>
        <c:otherwise>
            <td class="paddedcell" align="center"><span disabled><spring:message code="jsp.repoAdmin.defaultView.capitalEdit"/></span></td>
        </c:otherwise>
    </c:choose>
    <td class="paddedcell" align="center"><a href="javascript:document.frm.reportOptionsExpanded.value='${resource.name}';document.frm.resource.value='${option.URIString}';document.frm.assign.click();"><spring:message code="jsp.repoAdmin.defaultView.assign"/></a></td>
    <c:choose>
        <c:when test="${not empty removableReportOptions[option.URIString]}">
            <td class="paddedcell" align="center"><input type="checkbox" name="selectedResources" value="${option.URIString}" class="fnormal" onclick="checkboxListCheckboxClicked('repositoryItems', this)"/></td>
        </c:when>
        <c:otherwise>
            <td class="paddedcell" align="center"><input type="checkbox" class="fnormal"  disabled/></td>
        </c:otherwise>
    </c:choose>
    <td></td>
  </tr>
        </c:forEach>
    </c:if>
</c:if>
</c:forEach>
  <tr>
      <td colspan="9">
        <js:paginatorLinks/>
      </td>
  </tr>
</js:paginator>
  <tr>
    <td colspan="9">&nbsp;</td>
  </tr>
  <tr>
    <td></td>
    <td class="paddedcell" colspan="5">
      <input type="submit" class="fnormal" name="_eventId_Add" value="<spring:message code='jsp.repoAdmin.defaultView.button.addNew'/>" onClick="document.frm.resourceType.value=document.frm.cmbResourceType.value" class="fnormal"/>
      <select name="cmbResourceType" class="fnormal">
        <c:forEach items="${requestScope.resourceTypes}" var="resourceType">
        <option value="<c:out value="${resourceType.value}"/>"><spring:message code="${resourceType.key}"/></option>
        <%--
        <option value="com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.ReportUnit">Report Unit</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.JndiJdbcReportDataSource">Data Source</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.InputControl">Input Control</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.DataType">Data Type</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.ListOfValues">List of Values</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">JRXML</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.olap.domain.OlapUnit">OLAP View</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.olap.domain.OlapClientConnection">OLAP Client Connection</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">OLAP Schema</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">Access Grant Schema</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.olap.domain.MondrianXMLADefinition">Mondrian XML/A Source</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">Image</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">Font</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">JAR</option>
        <option value="com.jaspersoft.jasperserver.api.metadata.common.domain.FileResource">Resource Bundle</option>
        --%>
        </c:forEach>
      </select>
    </td>
    <td class="paddedcell" colspan="2" align="right"><input type="button" name="" value="<spring:message code="button.remove"/>" class="fnormal" onclick="removeRepositoryItems()"/></td>
    <td></td>
  </tr>
</form>
</table>

    </td>
  </tr>
</table>

<script language="JavaScript">
  checkboxListInit('repositoryItems', 'frm', 'selectAll', ['selectedFolders', 'selectedResources'], <c:out value="${repositoryItemCount}"/>, 0);
</script>

<c:if test="${not empty reportOptionsExpanded}">
<script language="JavaScript">
    expandToggle('reportOptions', '<c:out value="${reportOptionsExpanded}"/>');
</script>
</c:if>

</body>
</html>
