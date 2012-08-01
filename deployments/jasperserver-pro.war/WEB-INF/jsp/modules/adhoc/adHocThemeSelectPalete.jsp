<%--
  ~ Copyright (C) 2005 - 2009 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib prefix="t" uri="http://tiles.apache.org/tags-tiles" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<t:useAttribute id="containerTitle" name="containerTitle" classname="java.lang.String" ignore="true"/>
<t:useAttribute id="containerClass" name="containerClass" classname="java.lang.String" ignore="true"/>
<t:useAttribute id="bodyContent" name="bodyContent" classname="java.lang.String" ignore="true"/>
<t:useAttribute id="selectFileButtonId" name="selectFileButtonId" classname="java.lang.String" ignore="true"/>
<t:useAttribute id="cancelButtonId" name="cancelButtonId" classname="java.lang.String" ignore="true"/>

<t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
    <t:putAttribute name="containerClass">panel dialog overlay selectPalette moveable sizeable centered_horz centered_vert ${containerClass}</t:putAttribute>
    <t:putAttribute name="containerElements"><div class="sizer diagonal"></div></t:putAttribute>
    <t:putAttribute name="headerClass" value="mover"/>
    <t:putAttribute name="containerID" value="selectPalette"/>
    <t:putAttribute name="containerTitle"><spring:message code="ADH_115_THEME_PALETTE_MESSAGE"/></t:putAttribute>
    <t:putAttribute name="bodyContent">
        <t:insertTemplate template="/WEB-INF/jsp/templates/container.jsp">
            <t:putAttribute name="containerClass" value="control groupBox fillParent"/>
            <t:putAttribute name="bodyContent">

                <ul class="list responsive palette">
                    <c:forEach var="theme" items="${viewModel.themeKeys}" varStatus="themeIndex">
                        <c:set var="selected" value="${(requestScope.viewModel.theme eq theme) ? 'selected' : ''}"/>
                        <li id="${theme}" class="leaf button ${selected}">
                            <p class="wrap"><spring:message code="${viewModel.themes[theme].display}"/></p>
                            <ul class="list palette ${theme}">
                                <li class="leaf chip color01"></li>
                                <li class="leaf chip color02"></li>
                                <li class="leaf chip color03"></li>
                                <li class="leaf chip color04"></li>
                            </ul>
                        </li>
                    </c:forEach>
                </ul>

            </t:putAttribute>
        </t:insertTemplate>
    </t:putAttribute>
    <t:putAttribute name="footerContent">
        <button id="themeDialogClose" class="button action primary up"><span class="wrap"><spring:message code="ADH_014_BUTTON_CLOSE"/></span><span class="icon"></span></button>
    </t:putAttribute>
</t:insertTemplate>
