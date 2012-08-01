/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */


var DataSetList = {

    DS_CONTAINER: 'dsContainer',
    BUTTON_CLOSE: '#detail #close',
    BUTTON_CLEAR_ALL_CACHE: 'clearAllCache',
    Q_ITEM_PFX: 'qItem_',

    initialize: function() {
        layoutModule.resizeOnClient('filters', 'settings');
        webHelpModule.setCurrentContext("admin");

        if(!$(this.DS_CONTAINER)) {
            var nothingToDisplay = $('nothingToDisplay');
            nothingToDisplay.removeClassName(layoutModule.HIDDEN_CLASS);
            centerElement(nothingToDisplay, {horz: true, vert: true});
            document.body.addClassName(layoutModule.NOTHING_TO_DISPLAY_CLASS);
        }

        $('display').observe('click', function(e) {
            var elem = e.element();

            var button = matchAny(elem, [layoutModule.BUTTON_PATTERN], true);
            if (button) {

                // observe navigation
                for (var pattern in Administer.menuActions) {
                    if (button.match(pattern) && !button.up('li').hasClassName('selected')) {
                        document.location = Administer.menuActions[pattern]();
                        return;
                    }
                }

                // observe clear all cache button
                if (button.match('button#' + DataSetList.BUTTON_CLEAR_ALL_CACHE)) {
                    e.stop();
                    DataSetList._clearAll();
                }

                // observe clear button
                if (button.match('div.five > button')) {
                    DataSetList._clearQuery(button);
                    return;
                }
            }

            // observe query link
            if (elem.match('a') && matchAny(elem, ['div.two'], true)) {
                DataSetList._getDetails(elem);
                return;
            }
        });

        document.body.appendChild($('detail'));
        $$(DataSetList.BUTTON_CLOSE)[0].observe('click', function(e) { e.stop(); dialogs.popup.hide($('detail'));});

    },


    _getDetails: function(element) {
        var url = 'flow.html?_flowExecutionKey=' + Administer.flowExecutionKey + '&_eventId=isServerAvailable';
        Administer._sendRequest(url, null, function(response) {
            if (response.data && response.data.strip() == "Yes") {
                var data = 'id=' + element.readAttribute("name");
                var url = 'flow.html?_flowExecutionKey=' + Administer.flowExecutionKey + '&_eventId=getDetails';
                Administer._sendRequest(url,data,DataSetList._getDetailsCallback);
            }
        });
    },

    _clearQuery: function(element) {
        var data = 'id=' + element.name;
        var url = 'flow.html?_flowExecutionKey=' + Administer.flowExecutionKey + '&_eventId=clearQuery';
        Administer._sendRequest(url,data,DataSetList._clearCallback);
    },

    _clearAll: function() {
        var url = 'flow.html?_flowExecutionKey=' + Administer.flowExecutionKey + '&_eventId=clearAll';
        Administer._sendRequest(url,null,DataSetList._clearCallback);
    },


    _getDetailsCallback: function(response) {

        var detDialog = $('detail');

        $("detAge").update(response.age);
        $("detQuery").update(response.query.replace(new RegExp("\n", "g"), "<br/>"));
        $("detDataSourceURI").update(response.datasourceURI);
        $("detParameters").update(response.params);
        $("detTime").update(response.idle);
        $("detRows").update(response.rows);
        $("detQueryTime").update(response.queryTime);
        $("detFetchTime").update(response.fetchTime);

        dialogs.popup.show(detDialog);
    },


    _clearCallback: function(response) {

        // in case if detail dialog is opened
        $('detail').hide();

        if (response.empty) {
            var nothingToDisplay = $('nothingToDisplay');
            nothingToDisplay.removeClassName(layoutModule.HIDDEN_CLASS);
            centerElement(nothingToDisplay, {horz: true, vert: true});
            document.body.addClassName(layoutModule.NOTHING_TO_DISPLAY_CLASS);
            DataSetList._disableClearAll();
        } else if (response.id) {
            $(DataSetList.Q_ITEM_PFX + response.id).remove();
        }

        dialogs.systemConfirm.show(Administer.getMessage(response.result));

    },

    _disableClearAll: function(name) {
        buttonManager.disable($(DataSetList.BUTTON_CLEAR_ALL_CACHE));
    }


};

document.observe('dom:loaded',DataSetList.initialize.bind(DataSetList));
