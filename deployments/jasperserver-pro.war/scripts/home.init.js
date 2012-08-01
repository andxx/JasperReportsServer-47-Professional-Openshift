/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

document.observe('dom:loaded', function() {
    var options = {
        locationMap: {
           'viewReports':'flow.html?_flowId=searchFlow&mode=search&filterId=resourceTypeFilter&filterOption=resourceTypeFilter-reports&searchText=',
           'createReports':'flow.html?_flowId=adhocFlow',
           'createDashboard':'flow.html?_flowId=dashboardDesignerFlow&createNew=true',
           'analyzeResults':'flow.html?_flowId=searchFlow&mode=search&filterId=resourceTypeFilter&filterOption=resourceTypeFilter-view&searchText=',
           'manageServer':'flow.html?_flowId=adminHomeFlow'
        }
    };
    home.initialize(options);
});
