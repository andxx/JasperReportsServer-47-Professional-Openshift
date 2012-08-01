/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

repositorySearch.notSupportedByIPad = ["DashboardResource", "SemanticLayerDataSource"];

function isDomainTopic(resource) {
    return resource.typeSuffix() == "DataDefinerUnit";
}

function isDashboard(resource) {
    return resource.typeSuffix() == "DashboardResource";
}

function isSupportedOnIPad(resource) {
    return !isIPad() || !["DashboardResource", "SemanticLayerDataSource"].include(resource.typeSuffix());
}

function isAdhocReportUnit(resource) {
    return resource.typeSuffix() == "AdhocReportUnit";
}

function isAdhocDataView(resource) {
    return resource.typeSuffix() == "AdhocDataView";
}

function canBeRun(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];

    var canOlapUnitBeRun = true;

    if (("OlapUnit" == resource.typeSuffix()) && (!localContext.rsInitOptions.isAnalysisFeatureEnabled)) {
        canOlapUnitBeRun = false;
    }

    if (isAdhocReportUnit(resource) && localContext.rsInitOptions.isAdHoReportDisabled) {
        return false;
    }

    if (isDashboard(resource) && !localContext.rsInitOptions.isDashboardFeatureEnabled) {
        return false;
    }

    return resource && resource.isReadable() && canOlapUnitBeRun && repositorySearch.runActionFactory[resource.typeSuffix()] && !repositorySearch.isflowRedirectRunning;
}

function canBeGenerated(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];
    return resource && resource.isReadable()
        && isAdhocDataView(resource)
        && localContext.rsInitOptions.isAdHoReportDisabled
        && !repositorySearch.isflowRedirectRunning;
}

function canBeConverted(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];
    return resource && resource.isReadable()
        && isAdhocReportUnit(resource)
        && localContext.rsInitOptions.isAdHoReportDisabled
        && !repositorySearch.isflowRedirectRunning;
}

function canResourceBeEdited(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];

    var canOlapUnitBeEdit = true;

    if (["OlapUnit", "XMLAConnection", "SecureMondrianConnection"].include(resource.typeSuffix()) && (!localContext.rsInitOptions.isAnalysisFeatureEnabled)) {
        canOlapUnitBeEdit = false;
    }

    var allowed = resource && resource.isEditable() && canOlapUnitBeEdit && repositorySearch.editActionFactory[resource.typeSuffix()];

    if (!isSupportedOnIPad(resource)) {
        return false;
    }

    // Edit menu item is forbidden.
    if (["DashboardResource"].include(resource.typeSuffix()) || isAdhocReportUnit(resource)) {
        return false;
    } else if (["ReportUnit", "ReportOptions"].include(resource.typeSuffix())) {
        return allowed;
    } else {
        return allowed && repositorySearch.model.isAdministrator();
    }
}

function canBeRunInBackground(resource) {
    return canBeScheduled(resource);
}

function canBeScheduled(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];

    return resource && resource.isReadable() && !isAdhocReportUnit(resource) &&
           [repositorySearch.ResourceType.REPORT_UNIT, repositorySearch.ResourceType.ADHOC_REPORT_UNIT,
               repositorySearch.ResourceType.REPORT_OPTIONS].include(resource.resourceType);
}

function canBeOpened(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];

    if (!resource) {
        return false;
    }

    if (isDashboard(resource)) {
        return false;
    }

    if (isDomainTopic(resource)) {
        return false;
    }

    if (!isSupportedOnIPad(resource)) {
        return false;
    }

    if (isAdhocDataView(resource)) {
        return !!repositorySearch.openActionFactory[resource.typeSuffix()];
    }

    return resource.isEditable() && repositorySearch.openActionFactory[resource.typeSuffix()];
}

function canBeOpenedInDesigner(resource) {
    resource = resource ? resource : repositorySearch.model.getSelectedResources()[0];

    if ((isDashboard(resource) && !localContext.rsInitOptions.isDashboardFeatureEnabled) ||
        isAdhocReportUnit(resource)) {
        return false;
    }

    if (isAdhocReportUnit(resource) || isAdhocDataView(resource)) {
        return false; //should be opened with "open" menu item, not "open in designer"
    }

    return resource && resource.isEditable() && repositorySearch.openActionFactory[resource.typeSuffix()] &&
    (resource.typeSuffix() !== "ContentResource");
}

function canResourceBeCreated(type) {
    var folder = repositorySearch.model.getContextFolder();

    if ((type == "OlapClientConnection" || type == "OlapUnit") && !localContext.rsInitOptions.isAnalysisFeatureEnabled) {
        return false;
    }

    return folder && !folder.isOrganization() && !folder.isRoot() &&
           !folder.isOrganizationsRoot() && folder.isEditable();
}
