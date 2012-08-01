<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<script type="text/javascript">
    domain._messages["exitMessage"]  = '<spring:message code="domain.chooser.exitMessage" javaScriptEscape="true"/>';
    domain._messages['accessDeniedError'] = '<spring:message code="ADH_1001_SERVER_REPOSITORY_ACCESS_DENIED" javaScriptEscape="true"/>';
    domain._messages['warning'] = '<spring:message code="QB_WARNING" javaScriptEscape="true"/>';
    domain._messages['tooLongName'] = '<spring:message code="QB_TOO_LONG_NAME" javaScriptEscape="true"/>';
    domain._messages['tooLongDescription'] = '<spring:message code="QB_TOO_LONG_DESCRIPTION" javaScriptEscape="true"/>';
    domain._messages['topicAlredyExists'] = '<spring:message code="SLQB_TOPIC_ALREADY_EXISTS" javaScriptEscape="true"/>';
    domain._messages['QB_007_NAVIGATION_BUTTON_SAVE'] = '<spring:message code="QB_007_NAVIGATION_BUTTON_SAVE" javaScriptEscape="true"/>';
    domain._messages['QB_007_NAVIGATION_BUTTON_SAVE_AS'] = '<spring:message code="QB_007_NAVIGATION_BUTTON_SAVE_AS" javaScriptEscape="true"/>';
    domain._messages['resource_of_other_type_exists'] = '<spring:message code="ADH_1001_RESOURCE_OF_OTHER_TYPE_EXISTS_ERROR" javaScriptEscape="true"/>';

    // Initialization of repository search init object.
    localContext.rsInitOptions = {
        flowExecutionKey: '${flowExecutionKey}',
        organizationId:  "${organizationId}",
        publicFolderUri:  "${publicFolderUri}",
        folderURI: "${slReportUnitLocation}",
        // Session values
        topicName : "${slReportUnitLabel}",
        topicLocation : "${slReportUnitLocation}",
        topicDescription : "${slReportUnitDesc}",
        // Validation params
        maxTopicName: ${maxTopicName},
        maxTopicDescription: ${maxTopicDescription},
        unsavedChangesPresent: ${unsavedChangesPresent},
        organizationsFolderUri: "${organizationsFolderUri}"
    };
</script>
