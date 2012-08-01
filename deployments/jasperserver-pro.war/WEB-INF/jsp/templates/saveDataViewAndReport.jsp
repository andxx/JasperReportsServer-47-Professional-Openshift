<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~
  ~ Unless you have purchased  a commercial license agreement from Jaspersoft,
  ~ the following license terms  apply:
  ~
  ~ This program is free software: you can redistribute it and/or  modify
  ~ it under the terms of the GNU Affero General Public License  as
  ~ published by the Free Software Foundation, either version 3 of  the
  ~ License, or (at your option) any later version.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  ~ GNU Affero  General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public  License
  ~ along with this program. If not, see <http://www.gnu.org/licenses/>.
  --%>

<%--
Overview:
    Usage:permit user to add a system created object to the repository.

Usage:

    <t:insertTemplate template="/WEB-INF/jsp/templates/saveAs.jsp">
    </t:insertTemplate>
    
--%>

<%@ page import="com.jaspersoft.jasperserver.api.JSException" %>
<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>


<t:useAttribute id="containerClass" name="containerClass" classname="java.lang.String" ignore="true"/>
<t:useAttribute id="bodyContent" name="bodyContent" classname="java.lang.String" ignore="true"/>

<style>
    .saveAs #saveAsInputDescription,  .saveAs textarea.resourceDescriptionInput{
        min-height: 40px;
        min-height:44px \9; /* IE9 */
    }
</style>


<!--/WEB-INF/jsp/templates/saveAs.jsp revision A-->
<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
    <t:putAttribute name="containerClass">panel dialog overlay saveAs sizeable moveable ${containerClass}</t:putAttribute>
    <t:putAttribute name="containerID" value="saveDataViewAndReport" />
    <t:putAttribute name="containerTitle"><span class="forDataViewOnly"><spring:message code="dialog.saveAs.title"/></span><span class="forReport"><spring:message code="ADH_037_MENU_SAVE_DATA_VIEW_AND_REPORT"/></span></t:putAttribute>
    <t:putAttribute name="containerElements"><div class="sizer diagonal"></div></t:putAttribute>
    <t:putAttribute name="headerClass" value="mover"/>
    <t:putAttribute name="bodyContent">
        <label class="control input text forDataView" accesskey="o" title="This will be the visible name for the resource and can be changed.">
            <span class="wrap"><spring:message code="dialog.file.data.view.name"/> (<spring:message code='required.field'/>):</span>
            <input class="dataViewName resourceNameInput" type="text" maxlength="94" value=""/>
            <span class="message warning">error message here</span>
        </label>
        <label class="control textArea forDataView">
            <span class="wrap"><spring:message code="dialog.file.data.view.description"/>:</span>
            <textarea class="dataViewDescription resourceDescriptionInput" type="text" maxlength="249"> </textarea>
            <span class="message warning">error message here</span>
        </label>

        <%-- TODO make design look fine when both DataView and Report options need to be edited --%>
        <label class="control input text forReport" accesskey="o" title="This will be the visible name for the resource and can be changed.">
            <span class="wrap"><spring:message code="dialog.file.report.name"/> (<spring:message code='required.field'/>):</span>
            <input class="reportName resourceNameInput" type="text" value=""/>
            <span class="message warning">error message here</span>
        </label>
        <label class="control textArea forReport">
            <span class="wrap"><spring:message code="dialog.file.report.description"/>:</span>
            <textarea class="reportDescription resourceDescriptionInput" type="text"> </textarea>
            <span class="message warning">error message here</span>
        </label>

        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="control groupBox"/>
                    <t:putAttribute name="bodyContent">${bodyContent}</t:putAttribute>
            </t:insertTemplate>


    </t:putAttribute>
    <t:putAttribute name="footerContent">
         <button class="button action primary up saveButton"><span class="wrap"><spring:message code="dialog.file.save"/><span class="icon"></span></button>
         <button class="button action up cancelButton"><span class="wrap"><spring:message code="dialog.file.cancel"/><span class="icon"></span></button>
    </t:putAttribute>
</t:insertTemplate>
