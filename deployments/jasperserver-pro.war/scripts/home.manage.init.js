/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

document.observe('dom:loaded', function() {
    var options = {
        locationMap: {
            'browseRepo':'flow.html?_flowId=searchFlow&mode=browse',
            'manageUsers':'flow.html?_flowId=userListFlow',
            'manageRoles':'flow.html?_flowId=roleListFlow',
            'manageOLAP':'flow.html?_flowId=mondrianPropertiesFlow'
        }
    };
    home.initialize(options);
});
