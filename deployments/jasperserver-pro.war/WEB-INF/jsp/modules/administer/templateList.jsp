<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<li class="leaf last">
    <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
        <t:putAttribute name="containerClass" value="panel pane settings"/>
        <t:putAttribute name="containerTitle"><spring:message code='<%= oLabelCode %>' /></t:putAttribute>
        <t:putAttribute name="bodyClass" value="twoColumn"/>
        <t:putAttribute name="bodyContent">
            <div class="column simple primary">
            <label class="control input text" for="input_<%= oName %>" title="<spring:message code='<%= oLabelCode %>' />">
                <span class="wrap"><spring:message code="<%= oDesc %>"/></span>
                <select id="input_<%= oName %>" name="">
                 <%
                    for (String e: oSelectOptions ) { %>
                        <option value="<%= e %>" <%= e.equals(oValue) ? "selected" : "" %> ><%= e %></option>
                 <% } %>
                </select>
                <span class="message warning" id="error_<%= oName %>">&nbsp;</span>
            </label>
        </div>
        <div class="column simple secondary">
            <fieldset class="actions">
                <button id="save" name="<%= oName %>" disabled="true" class="button action primary up"><span class="wrap"><spring:message code="button.change"/></span></button>
                <button id="cancel" name="<%= oName %>" value="<%= oValue %>" disabled="true" class="button action up"><span class="wrap"><spring:message code="button.cancel"/></span></button>
            </fieldset>
        </div>
        </t:putAttribute>
    </t:insertTemplate>
</li>
