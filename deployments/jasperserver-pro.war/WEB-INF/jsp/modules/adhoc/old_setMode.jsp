<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%--These varables need to be loaded first--%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
{
    "decimalSeparator":"${requestScope.decimalSeparatorForUserLocale}",
    "groupingSeparator":"${requestScope.groupingSeparatorForUserLocale}",
    "selectedThemeId":"${requestScope.viewModel.theme}",
    "viewType":"${requestScope.viewModel.viewType}",

    "flowExecutionKey": "${flowExecutionKey}",
    "clientKey":"${clientKey}",
    "serverTimeoutInterval":${serverTimeoutInterval},
    "addFilterWidgetByDefault":${addFilterWidgetByDefault},
    "filterAutoSubmitTimer":${filterAutoSubmitTimer},
    "organizationId":"${organizationId}",
    "publicFolderUri":"${publicFolderUri}",
    "constantFieldsLevel":"${constant_fields_level}",
    "isAnalysisFeatureSupported":${isAnalysisFeatureSupported},

    "usingAdhocLauncher":"${param.adhocLauncher}",

    "adhocActionModel":${viewModel.clientActionModelDocument}
}