<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%--tag libs--%>
<%@ taglib uri="/spring" prefix="spring"%>
<%@ taglib prefix="cip" uri="http://java.sun.com/jsp/jstl/core"%>

<%--variables--%>
<cip:set var="control"  value="${dashboardParameter.inputControl}" scope="page"/>
<cip:set var="defaultSelectSize" value="20" scope="page"/>
<cip:set var="readOnly" value="${readOnlyForm or control.readOnly}"/>
<cip:set var="inputControlName" value="${control.name}"/>
<%--custom attributes--%>
<cip:set var="reportUnitURI" value="${requestScope.reportUnitObject.URI}"/>
<cip:set var="uriPrefix" value="${control.URI}"/>
<cip:set var="controlType" value="${control.type}"/>

<cip:if test="${control.visible}">
<cip:choose>
<%-- ##########   BOOLEAN   ########## --%>
<%-- InputControl.TYPE_BOOLEAN --%>
<cip:when test="${control.type == 1}">
    <div id="controlFrameContainer_${frame.name}" class="componentContainer control checkBox"
         style="left:${frameLeft};top:${frameTop};z-index:10;">
        <div id="controlFrameOverlay_${frame.name}"
             data-isBoolean="true"
             data-frameType="controlFrame"
             data-frameName="${frame.name}"
             data-reportUnitURI="${reportUnitURI}"
             data-uriPrefix="${uriPrefix}"
             data-inputControlName="${inputControlName}"
             data-controlType="${controlType}"
             data-isReadOnly="${readOnly}"
             data-wrapperValue="${dashboardParameter.value}"
             data-value="${dashboardParameter.value ? 'true' : 'false'}"
             class="overlay button"></div>
    </div>
</cip:when>


<%-- ##########   SINGLE_VALUE   ########## --%>
<%-- InputControl.TYPE_SINGLE_VALUE --%>
<cip:when test="${control.type == 2}">
    <cip:choose>
        <cip:when test="${control.dataType.localResource.type == 3 || control.dataType.localResource.type == 4}">
            <script type="text/javascript">
                var calendarDateFormat = "<spring:message code='calendar.date.format'/>";
            </script>
            <div id="controlFrameContainer_${frame.name}" class="componentContainer control picker"
                 style="left:${frameLeft};top:${frameTop};z-index:10;">
                <div id="controlFrameOverlay_${frame.name}"
                     data-frameName="${frame.name}"
                     data-frameType="controlFrame"
                     data-reportUnitURI="${reportUnitURI}"
                     data-uriPrefix="${uriPrefix}"
                     data-inputControlName="${inputControlName}"
                     data-controlType="${controlType}"
                     data-isReadOnly="${readOnly}"
                        <cip:if test="${control.dataType.localResource.type == 4}">
                            data-calTime="true"
                        </cip:if>
                     data-value="${dashboardParameter.value}"
                     class="overlay button"></div>
            </div>
        </cip:when>
        <cip:otherwise>
            <div id="controlFrameContainer_${frame.name}" class="componentContainer control text"
                 style="left:${frameLeft};top:${frameTop};z-index:10;">
                <div class="sizer horizontal"></div>
                <div id="controlFrameOverlay_${frame.name}"
                     data-frameName="${frame.name}"
                     data-frameType="controlFrame"
                     data-reportUnitURI="${reportUnitURI}"
                     data-uriPrefix="${uriPrefix}"
                     data-inputControlName="${inputControlName}"
                     data-controlType="${controlType}"
                     data-isReadOnly="${readOnly}"
                     data-value="${dashboardParameter.value}"
                     class="overlay button"></div>
            </div>
        </cip:otherwise>
    </cip:choose>
</cip:when>


<%-- ##########   SINGLE_SELECT   ########## --%>
<cip:when test="${(control.type == 3) || (control.type == 4)}">
    <cip:choose>
        <cip:when test="${requestScope.flowid != null and frame.width == 1}">
            <div id="controlFrameContainer_${frame.name}" class="componentContainer control select"
            style="left:${frameLeft};top:${frameTop};min-width:100px;z-index:10;">
        </cip:when>
        <cip:otherwise>
            <div id="controlFrameContainer_${frame.name}" class="componentContainer control select"
            style="left:${frameLeft};top:${frameTop};width:<cip:choose><cip:when test="${frame.width == 1}">100</cip:when><cip:otherwise>${frame.width}</cip:otherwise></cip:choose>px;z-index:10;">
        </cip:otherwise>
    </cip:choose>
    <div class="sizer horizontal"></div>
    <div id="controlFrameOverlay_${frame.name}"
         data-frameName="${frame.name}"
         data-frameType="controlFrame"
         data-reportUnitURI="${reportUnitURI}"
         data-uriPrefix="${uriPrefix}"
         data-inputControlName="${inputControlName}"
         data-controlType="${controlType}"
         data-isReadOnly="${readOnly}"
         data-value="${dashboardParameter.value}"
         class="overlay button"></div>
    </div>
</cip:when>

<%-- ##########   MULTI_SELECT_LIST_OF_VALUES   ########## --%>
<cip:when test="${(control.type == 6) || (control.type == 7)}">
    <cip:set var="frameHeight" value="${(frame.height) < 20 ? 70 : frame.height}"/>
    <div id="controlFrameContainer_${frame.name}"  class="componentContainer control select multiple"
         style="left:${frameLeft};top:${frameTop};height:${frameHeight}px;z-index:10;">
        <div class="sizer vertical"></div>
        <div id="controlFrameOverlay_${frame.name}"
             data-frameName="${frame.name}"
             data-frameType="controlFrame"
             data-reportUnitURI="${reportUnitURI}"
             data-uriPrefix="${uriPrefix}"
             data-inputControlName="${inputControlName}"
             data-controlType="${controlType}"
             data-isReadOnly="${readOnly}"
             data-value="${dashboardParameter.value}"
             class="overlay button"></div>
    </div>
</cip:when>

<%-- ##########   TYPE_SINGLE_SELECT_RADIO   ########## --%>
<cip:when test="${(control.type == 8) || (control.type == 9)}">
    <cip:set var="resetDrawn" value="false"/>
    <div id="controlFrameContainer_${frame.name}"  class="componentContainer control radio list"
         style="left:${frameLeft};top:${frameTop};z-index:10;">
        <div class="sizer vertical"></div>
        <div id="controlFrameOverlay_${frame.name}"
             data-frameName="${frame.name}"
             data-frameType="controlFrame"
             data-reportUnitURI="${reportUnitURI}"
             data-uriPrefix="${uriPrefix}"
             data-inputControlName="${inputControlName}"
             data-controlType="${controlType}"
             data-isReadOnly="${readOnly}"
             data-value="${dashboardParameter.value}"
             class="overlay button"></div>
    </div>
</cip:when>

<%-- ##########    MULTI_SELECT_CHECKBOX    ########## --%>
<cip:when test="${(control.type == 10) || (control.type == 11)}">
    <cip:set var="frameHeight" value="${(frame.height) < 20 ? 70 : frame.height}"/>
    <div id="controlFrameContainer_${frame.name}"  class="componentContainer control checkBox list"
         style="left:${frameLeft};top:${frameTop};height:${frameHeight}px;z-index:10;">
        <div class="sizer vertical"></div>
        <div id="controlFrameOverlay_${frame.name}"
             data-frameName="${frame.name}"
             data-frameType="controlFrame"
             data-reportUnitURI="${reportUnitURI}"
             data-uriPrefix="${uriPrefix}"
             data-inputControlName="${inputControlName}"
             data-controlType="${controlType}"
             data-isReadOnly="${readOnly}"
             data-value="${dashboardParameter.value}"
             class="overlay button"></div>
    </div>
</cip:when>

<cip:otherwise>
       <span class="wrap"> ${dashboardParameter.displayLabel}
           <b><spring:message code="jsp.defaultParametersForm.notImplemented"/></b>
       </span>
</cip:otherwise>

</cip:choose>
</cip:if>
