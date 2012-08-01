/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

function invokeOrgAction(actionName, options) {
    var action = orgModule.orgActionFactory[actionName](options);
    action.invokeAction();
}

function invokeManagerAction(actionName, options) {
    var action = orgModule.orgManager.actionFactory[actionName](options);
    action.invokeAction();
}

function canAddOrg() {
    return orgModule.manager.tree.getOrganization() != null;
}

function canDeleteAll() {
    return orgModule.entityList.getSelectedEntities().length > 0;
}

function canDeleteUser() {
    return orgModule.entityList.getSelectedEntities().length > 0;
}

orgModule.orgManager = {
    NAME_REG_EXP: null,
    ID_REG_EXP: null,
    ID_REG_EXP_FOR_REPLACEMENT: null,
    ALIAS_REG_EXP: null,
    ALIAS_REG_EXP_FOR_REPLACEMENT: null,

    Event: {},

    Action: {
        ALIAS_EXIST: "aliasExist"
    },

    initialize: function() {
        layoutModule.resizeOnClient('folders', 'organizations', 'properties');
        webHelpModule.setCurrentContext("admin");

        var options = localContext.orgMngInitOptions;

        this.NAME_REG_EXP = new RegExp(orgModule.Configuration.tenantNameNotSupportedSymbols),    
        this.ID_REG_EXP = new RegExp(orgModule.Configuration.tenantIdNotSupportedSymbols),
        this.ID_REG_EXP_FOR_REPLACEMENT = new RegExp(orgModule.Configuration.tenantIdNotSupportedSymbols, "g"),
        this.ALIAS_REG_EXP = new RegExp(orgModule.Configuration.tenantIdNotSupportedSymbols),
        this.ALIAS_REG_EXP_FOR_REPLACEMENT = new RegExp(orgModule.Configuration.tenantIdNotSupportedSymbols, "g"),

        // Manager customization.
        orgModule.manager.initialize(options);
        orgModule.manager.entityJsonToObject = function(json) {
            return new orgModule.Organization(json);
        };

        this.orgList.initialize({
            toolbarModel: this.actionModel,
            text: orgModule.manager.state.text
        });

        // Dialogs customization.
        orgModule.addDialog.show = function(org) {
            this.addDialog.show(org);
        }.bind(this);
        // Dialogs customization.
        orgModule.addDialog.hide = function(org) {
            this.addDialog.hide(org);
        }.bind(this);

        this.properties.initialize();
        this.addDialog.initialize();

        orgModule.observe("entity:created", function(event) {
            orgModule.manager.tree.updateSubOrganizations(orgModule.orgManager.addDialog.organization);
        }.bindAsEventListener(this));

        orgModule.observe("entity:updated", function(event) {
            var entityJson = event.memo.inputData.entity;

            if (entityJson) {
                var entity = orgModule.manager.entityJsonToObject(entityJson.evalJSON());
                var tree = orgModule.manager.tree;

                tree.updateOrganization(entity, tree.getOrganization());
            }
        }.bindAsEventListener(this));

        orgModule.observe("searchAssigned:loaded", function(event) {
            var data = event.memo.responseData;

            this.properties.setAssigned(data.usersCount, data.rolesCount);
        }.bindAsEventListener(this));

        orgModule.observe("entity:detailsLoaded", function(event) {
            invokeServerAction(orgModule.ActionMap.SEARCH_ASSIGNED, {text: ""});            
        }.bindAsEventListener(this));

        orgModule.observe("entity:deleted", function(event) {
            var tree = orgModule.manager.tree;
            tree.updateSubOrganizations(tree.getOrganization());
        }.bindAsEventListener(this));

        orgModule.observe("entities:deleted", function(event) {
            var tree = orgModule.manager.tree;
            tree.updateSubOrganizations(tree.getOrganization());
        }.bindAsEventListener(this));

        orgModule.observe("server:unavailable", function(event) {
            var tree = orgModule.manager.tree;

            var id = tree ? tree.getOrganization().id : null;
            new orgModule.Organization({ tenantId: id }).navigateToManager();
        }.bindAsEventListener(this));
    },

    actionModel: {
        ADD: {
            buttonId: "addNewOrgBtn",
            action: invokeClientAction,
            actionArgs: "create",
            test: canAddOrg
        },

        DELETE: {
            buttonId: "deleteAllOrgsBtn",
            action: invokeClientAction,
            actionArgs: "deleteAll",
            test: canDeleteAll
        }
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.observe('dom:loaded', orgModule.orgManager.initialize.bind(orgModule.orgManager));
