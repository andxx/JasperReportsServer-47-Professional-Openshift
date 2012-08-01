/*
 * Copyright (C) 2005 - 2012 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////////////////////////////////////////////////
// AdHoc Complex Filter
////////////////////////////////////////////////////////////////////////////

/**
 * Some Complex Filter constants and handles
 */
adHocFilterModule.MORE_VALUES_LABEL = moreValuesLabel;
adHocFilterModule.COMPLEX_FILTERS_POD_ID = "complexExpressionPod";
adHocFilterModule.COMPLEX_FILTER_POD_VALUE = "complexExpressionPodValue";
adHocFilterModule.COMPLEX_EXPRESSION_DIALOG_ID = "editComplexExpressionDialog";
adHocFilterModule.COMPLEX_EXPRESSION_MORE_PANEL = "morePanel";
adHocFilterModule.COMPLEX_FILTER_REMOVE_CONFIRM = "standardConfirm";

adHocFilterModule.COMPLEX_EXPRESSION_INPUT = "complexExpressionInput";
adHocFilterModule.SUCCESS_SPAN_CSS_RULE = "span.success";
adHocFilterModule.ERROR_SPAN_CSS_RULE = "span.warning";
adHocFilterModule.SHOW_COMPLEX_POD_ACTION = "complexShown";

adHocFilterModule.MAX_CRITERIA_VALUES_LENGTH = 60;

/**
 * Init and Open Complex Filter dialog
 * @param complexExpression
 *          Complex Expression which should be displayed in dialog
 */
adHocFilterModule.openComplexFilterDialog = function() {
    /* Set complex expression */
    var expression = $(adHocFilterModule.COMPLEX_FILTER_POD_VALUE).innerHTML;
    $(adHocFilterModule.COMPLEX_EXPRESSION_INPUT).setValue(expression);

    /* Clear validation success and error messages */
    var dialogContainer = $(adHocFilterModule.COMPLEX_EXPRESSION_DIALOG_ID);
    var successSpan = dialogContainer.down(adHocFilterModule.SUCCESS_SPAN_CSS_RULE);
    var errorSpan = dialogContainer.down(adHocFilterModule.ERROR_SPAN_CSS_RULE);

    successSpan.update('');
    errorSpan.update('');

    /* Fill dialog with existing filters info */
    adHocFilterModule.drawExistingFilters();

    /* Open dialog popup with a dimmer */
    dialogs.popup.show($(adHocFilterModule.COMPLEX_EXPRESSION_DIALOG_ID), true);

    /* Enable selection for complex expression Input in Firefox */
    adhocDesigner.initEnableBrowserSelection($("designer"));
};

/**
 * Close dialog, block selection
 */
adHocFilterModule.closeComplexFilterDialog = function() {
     dialogs.popup.hide($(adHocFilterModule.COMPLEX_EXPRESSION_DIALOG_ID));
     adhocDesigner.initPreventBrowserSelection($("designer"));
};

/**
 * AJAX call for Complex Filter Validation
 */
adHocFilterModule.validateComplexFilter = function() {
    var expression = $(adHocFilterModule.COMPLEX_EXPRESSION_INPUT).value;

    var callback = function(json) {
        adHocFilterModule.indicateValidation(json);
    };

    designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_validateComplexFilter', new Array("complexFilterExpression=" + expression), callback, null);
};

/**
 * AJAX call for Complex Filter Save & Validation
 */
adHocFilterModule.submitComplexFilter = function() {
    var expression = $(adHocFilterModule.COMPLEX_EXPRESSION_INPUT).value;

    var callback = function(json) {
        /* See whether we have error flag presented in response text */
        if (!json.complexFilterError) {
            adHocFilterModule.closeComplexFilterDialog();

            /* Refresh report */
            //(isSupportsTouch() ? $('mainTableContainer').down() : $("mainTableContainer")).innerHTML = ajaxbuffer.innerHTML;
            //ajaxbuffer.innerHTML = "";
            localContext.standardOpCallback(json);

            /* Refresh filters */
            adHocFilterModule.resetFilterPanel();
        } else {
            /* Just indicate error in dialog */
            adHocFilterModule.indicateValidation(json);
        }
    };

    designerBase.sendRequest(adHocFilterModule.CONTROLLER_PREFIX + '_setComplexFilter', new Array("complexFilterExpression=" + expression), callback, null);
};


/**
 * Check if the filter is used in customized Complex Expression
 */
adHocFilterModule.isUsed = function(podId) {
    var filterPod = $(podId);
    if (filterPod) {
        return (String($(podId).readAttribute("data-filterUsed")) == "true");
    }
    return false;
}


/**
 * Show validation message
 */
adHocFilterModule.indicateValidation = function(json) {
    var dialogContainer = $(adHocFilterModule.COMPLEX_EXPRESSION_DIALOG_ID);
    var successSpan = dialogContainer.down(adHocFilterModule.SUCCESS_SPAN_CSS_RULE);
    var errorSpan = dialogContainer.down(adHocFilterModule.ERROR_SPAN_CSS_RULE);

    /* Expect to have JSON like {"complexFilterError" : "<errorMessageFromServer>"} */
    if (json.complexFilterError) {
        errorSpan.update(json.complexFilterError);
        successSpan.update('');
    /* Or {"complexFilterSuccess" : "<successMessageFromServer>"} */
    } else if (json.complexFilterSuccess) {
        errorSpan.update('');
        successSpan.update(json.complexFilterSuccess);
    }

    return typeof json.complexFilterSuccess != 'undefined';
};

/**
 * Show existing filters info
 */
adHocFilterModule.drawExistingFilters = function() {
    /* Clear simple filters criteria in dialog */
    var body = $(adHocFilterModule.COMPLEX_EXPRESSION_DIALOG_ID).down("div.body", 1);
    var ul = new Element('ul', {'class': 'list tabular'});
    body.update(ul);

    /* Iterate over new ones */
    var filters = adHocFilterModule.gatherSimpleFiltersCriteria();
    filters.each(function(criteria) {
        var fieldName = new Element('span', {'class': 'nameAndValue'}).insert(criteria.fieldName);
        var operation = new Element('span', {'class': 'operation'}).insert("&nbsp;" + criteria.operation + "&nbsp;");
        var criteriaClass;
        criteria.isUsed ? criteriaClass = 'wrap criteria' : criteriaClass = 'wrap criteria unused';
        var p = new Element('p', {'class': criteriaClass}).insert(fieldName).insert(operation);

        /* See if it's a multi select */
        if ((criteria.filterType === "multipleSelect" || criteria.filterType === "functionSelect") && criteria.editable) {
            var limitedValues = adHocFilterModule.cutArrayByLength(criteria.operand, adHocFilterModule.MAX_CRITERIA_VALUES_LENGTH);
            var braceAndValues = new Element('span', {'class': 'nameAndValue'}).insert("{" + limitedValues.join(", "));
            p.insert(braceAndValues);
            /* See if values exceed limit, then show it in tip as "more" */
            if (limitedValues.length < criteria.operand.length) {
                var more = new Element('span', {'class': 'nameAndValue'}).insert(",&nbsp;" + adHocFilterModule.MORE_VALUES_LABEL + "...&nbsp;");
                more.observe("mouseenter", function(event) {
                    var ulTip = new Element('ul', {'class': 'list'}).update(new Element('li', {'class': 'leaf'}).update(criteria.operand.join(", ")));
                    var coordinates = {};
                    coordinates.menuLeft = getBoxOffsets(this, true)[0];
                    coordinates.menuTop = getBoxOffsets(this, true)[1];
                    actionModel.showDynamicTip(event, "menu vertical context morePanel", coordinates, ulTip);
                });
                p.insert(more);
            }
            var brace = new Element('span', {'class': 'nameAndValue'}).insert("}");
            p.insert(brace);
        } else {
            p.insert(new Element('span', {'class': 'nameAndValue'}).insert(criteria.operand));
        }

        var li = new Element('li', {'class': 'leaf'}).insert(p);
        ul.insert(li);
    });

    ul.childElements().first().addClassName("first");
    ul.childElements().last().addClassName("last");

    adhocDesigner.initPreventBrowserSelection(ul);

    /* Existing filters info DOM structure

        <ul id="availableFilters" class="list">
            <li class="leaf" tabindex="-1">
                <span class="nameAndValue">The Field</span>
                <span class="operation"> is one of </span>
                <span class="nameAndValue">{Value1, Value2, Value3, </span>
                <span class="nameAndValue">more...</span>
                <span class="nameAndValue"> }</span>
            </li>
            <li class="leaf" tabindex="-1">
                <span class="nameAndValue">The Field</span>
                <span class="operation"> equals </span>
                <span class="nameAndValue">The Value</span>
            </li>
        </ul>
    */
};

/**
 * Get list if simple filter user friendly criteria
 */
adHocFilterModule.gatherSimpleFiltersCriteria = function() {
    var filters = [];
    var filterPodList = adHocFilterModule._getFilterPods();
    if (filterPodList) {
        var unusedFiltersAmount = 0;
        filterPodList.each(function(podLi) {
            var podDiv = podLi.down("div.filter");
            if (podDiv && podDiv.readAttribute("id") != adHocFilterModule.COMPLEX_FILTERS_POD_ID) {
                var criteria = adHocFilterModule.buildUserFriendlyExpression(podDiv);
                if (!criteria.isUsed) {
                    unusedFiltersAmount++;
                }
                filters.push(criteria);
            }
        });
        /* All filters are unused - the expression is in default state, thus all filters appear used */
        if (filters.length == unusedFiltersAmount) {
            filters.each(function(criteria) {
                criteria.isUsed = true;
            })
        }
    }
    filters.reverse();
    return filters;
};

/**
 * Build user friendly filter expression, can be 3 types:
 * - The Field equals TheValue
 * - The Field is one of {Value1, Value2, Value3}
 * - The Field is between {Value1 and Value2}
 *
 * @param pod
 *      Filter container
 * @return User friendly filter expression
 */
adHocFilterModule.buildUserFriendlyExpression = function(pod) {
    var criteria = {};
    criteria.fieldName = pod.down('div.title').innerHTML;
    criteria.filterType = pod.readAttribute("data-filterType");
    criteria.editable = (String(pod.readAttribute("data-editable")) == "true");
    criteria.isUsed = adHocFilterModule.isUsed(pod);
    criteria.operation = "";

    var dropDown = $(pod.readAttribute("id") + "_filterOps");
    if (dropDown) {
        criteria.operation =  dropDown.options[dropDown.selectedIndex].innerHTML;
        criteria.operand = adHocFilterModule.getFilterValuesStringNotEncoded(pod);
    } else {

        var ulMessage = pod.down('ul.message');
        /* Keep Only / Exclude */
        /* Locked filters from Data Chooser */
        if (ulMessage) {
            criteria.operation = "-";
            var fields = [];
            ulMessage.childElements().each(function(li) {
                fields.push(li.innerHTML);    
            });
            criteria.operand = fields.join(", ") + ".";
        }
    }

    return criteria;
};

/**
 * Get filter value, not encoded
 * @param podId
 *          Id of filter container
 * @return Not encoded filter value as string
 */
adHocFilterModule.getFilterValuesStringNotEncoded = function(pod) {
    var filterType = pod.readAttribute("data-filterType");
    var inputId = pod.readAttribute("id") + "_filterInput";
    var checkBoxButton = $(pod.readAttribute("id") + "_all");
    var value = null;

    if (filterType === "singleSelect" || filterType === "singleInput") {
        var temp = $(inputId).value;
        value = $(inputId).value;
    } else if (filterType === "multipleSelect" || filterType === "functionSelect") {
        var values = [];
        var multiSelect = $(inputId);
        for (var index = 0; index < multiSelect.length; index++) {
            if (multiSelect.options[index].selected) {
                var selectedValue = multiSelect.options[index].value;
                values.push(selectedValue);
            }
        }
        /* Return array for multi select to be able to shorten values list correctly */
        value = values;
    } else if (filterType === "multipleInput") {
        value = "{" + $(inputId).value + " and " + $(inputId + "2").value + "}";
    }
    return value;
};

/**
 * Cur array by sum of its elements length
 * @param array
 *          Array that needs to be shorten
 * @param allowedLength
 *          Allowed length for array elements length sum
 * @return
 *          New array which elements length sum is <= that allowedLength
 */
adHocFilterModule.cutArrayByLength = function(array, allowedLength) {
    var length = 0;
    var newArray = [];
    array.each(function(element) {
        if (length + element.length > allowedLength) {
            $break;
        } else {
            length += element.length;
            newArray.push(element);
        }
    });
    return newArray;
};

/**
 * Show or Hide Complex Filter dialog
 */
adHocFilterModule.showHideComplexExpressionPod = function(){
    var pod = $(adHocFilterModule.COMPLEX_FILTERS_POD_ID);
    if (pod.hasClassName("hidden")) {
        pod.removeClassName("hidden");
    } else {
        pod.addClassName("hidden");
    }

    adHocFilterModule.toggleAdhocFilterPod(adHocFilterModule.SHOW_COMPLEX_POD_ACTION);
};

/**
 * Check to see whether to show Complex Filter Pod menu item
 */
adHocFilterModule.isShowComplexExpressionPodAllowed = function() {
    /* Allow to show complex expression if there are at least 2 simple filters */
    return (localContext.state.numberOfExistingFilters >= 2) && $(adHocFilterModule.COMPLEX_FILTERS_POD_ID).hasClassName("hidden");
};

/**
 * Check to see whether to hide Complex Filter Pod menu item
 */
adHocFilterModule.isHideComplexExpressionPodAllowed = function() {
    /* Allow to show complex expression if there are at least 2 simple filters */
    return (localContext.state.numberOfExistingFilters >= 2) && !$(adHocFilterModule.COMPLEX_FILTERS_POD_ID).hasClassName("hidden");
};


/**
 * Present a Tip with custom content.
 * @param event The event tied to the menu.
 * @param className Class name a caller may wish to use instead of the default.
 * @param coordinates Used for menu positioning.
 * @param content Content for div.content of the menu.
 */
actionModel.showDynamicTip = function(event, className, coordinates, content){
    actionModel.resetMenu();
    actionModel.updateCSSClass(className);
    actionModel.menuDom.down("div.content").update(content);
    actionModel.setMenuPosition(actionModel.menuDom, event, coordinates);
    actionModel.setMenuEventHandlers(actionModel.menuDom);
	actionModel.makeMenuVisible(actionModel.menuDom);
    isIE7() && setWidthStyleByReflection(actionModel.menuDom, '.content');
    actionModel.adjustMenuPosition(actionModel.menuDom);
    actionModel.focusMenu();
    Event.stop(event);
    Event.observe(actionModel.menuDom, 'mouseleave', function() {
        adhocDesigner.showButtonMenuMouseOut(actionModel.menuDom);
    }.bind(this));
};
