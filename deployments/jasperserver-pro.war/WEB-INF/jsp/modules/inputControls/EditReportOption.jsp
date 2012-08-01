<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="js" uri="/WEB-INF/jasperserver.tld" %>

<t:insertTemplate template="/WEB-INF/jsp/templates/page.jsp">
    <t:putAttribute name="pageTitle" value="Edit Report Options"/>
    <t:putAttribute name="bodyID" value="reportOptions_edit"/>
    <t:putAttribute name="bodyClass" value="oneColumn flow"/>
    
    <t:putAttribute name="headerContent">
        <script type="text/javascript">
            var Report = {
                reportOptionsURI: "${reportOptionsURI}"
            }
        </script>

        <jsp:include page="../inputControls/commonInputControlsImports.jsp" />

        <script type="text/javascript" language="JavaScript" src="${pageContext.request.contextPath}/scripts/controls.editoptions.js"></script>
    </t:putAttribute>

    <t:putAttribute name="bodyContent" >

        <form:form name="fmEditReportOptions" method="POST" commandName="reportOptionsForm" action="">
            <input type="hidden" name="_flowExecutionKey" value="${flowExecutionKey}"/>
            <input type="hidden" name="_eventId" value=""/>

            <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                <t:putAttribute name="containerClass" value="column decorated primary"/>
                <t:putAttribute name="containerTitle"><spring:message code="report.options.edit.title"/></t:putAttribute>


                <t:putAttribute name="bodyContent">
                <div id="flowControls"></div>
                    <div id="stepDisplay">
                        <fieldset class="row instructions">
                            <legend class="offLeft"><span>Instructions</span></legend>
                            <h2 class="textAccent02"><spring:message code="report.options.edit.header"/></h2>
                            <h4><spring:message code="report.options.edit.header.note"/></h4>
                        </fieldset>

                        <fieldset class="row inputs oneColumn">
                                <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
                                    <t:putAttribute name="containerClass" value="column primary"/>
                                    <t:putAttribute name="containerTitle"><spring:message code="report.options.edit.header.report"/> <span class="path">${reportUnitURI}</span></t:putAttribute>
                                    <t:putAttribute name="bodyContent">
                                        <fieldset class="group">
                                            <legend class="offLeft"><span>Name and Description</span></legend>
                                            <label class="control input text" class="required" for="label" title="<spring:message code="report.options.edit.name.title"/>">
                                                <span class="wrap"><spring:message code="report.options.edit.label.label"/> (<spring:message code='required.field'/>):</span>
                                                <form:input path="label" cssClass="fnormal" size="40"/>
                                                <form:errors path="label">
                                                    <c:forEach items="${messages}" var="message">
                                                        <span class="message warning"><c:out value="${message}"/></span>
                                                    </c:forEach>
                                                </form:errors>
                                                <span class="message warning">error message here</span>
                                            </label>
                                            <label class="control input text" for="name" title="<spring:message code="report.options.edit.id.title"/>">
                                                <span class="wrap"><spring:message code="report.options.edit.label.id"/> (<spring:message code="dialog.value.readOnly"/>):</span>
                                                <form:input path="name" cssClass="" readonly="true" disabled="true"/>
                                                <span class="message warning">error message here</span>
                                            </label>
                                            <label class="control textArea" for="description" title="<spring:message code="report.options.edit.description.title"/>">
                                                <span class="wrap"><spring:message code="report.options.edit.label.description"/></span>
                                                <form:textarea path="description" cssClass=""/>
                                                <form:errors path="description">
                                                    <c:forEach items="${messages}" var="message">
                                                        <span class="message warning"><c:out value="${message}"/></span>
                                                    </c:forEach>
                                                </form:errors>
                                            </label>
                                        </fieldset>

                                        <fieldset class="group">
                                            <legend class="label"><span class="wrap"><spring:message code="report.options.edit.label.input.controls"/></span></legend>
                                            <ul class="list inputControls" id="inputControlsContainer"></ul>
                                        </fieldset>
                                    </t:putAttribute>
                                    </t:insertTemplate>
                        </fieldset><!--/.row.inputs-->
                        </div>
                    <t:putAttribute name="footerContent">
                        <fieldset id="wizardNav" >
                            <button id="previous" class="button action up"><span class="wrap"><spring:message code='button.previous'/></span><span class="icon"></span></button>
                            <button id="next" class="button action up"><span class="wrap"><spring:message code='button.next'/></span><span class="icon"></span></button>
                            <button id="done" class="button primary action up"><span class="wrap"><spring:message code='button.submit'/></span><span class="icon"></span></button>
                            <button id="cancel" class="button action up"><span class="wrap"><spring:message code='button.cancel'/></span><span class="icon"></span></button>
                        </fieldset>
                    </t:putAttribute>

                </t:putAttribute>
            </t:insertTemplate>
		
        </form:form>
    </t:putAttribute>

</t:insertTemplate>