/*
 * Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
 * http://www.jaspersoft.com.
 * Licensed under commercial Jaspersoft Subscription License Agreement
 */

////////////////////////////////////////////////////////////////
// Ad Hoc start Code.
////////////////////////////////////////////////////////////////


var adhocStart = {
    //member variables
    TopicsTreeContainerId : "topicsTreeArea",
    DomainTreeContainerId : "domainsTreeArea",
    OlapConnectionsTreeContainerId : "olapConectionsTreeArea",
    DefaultTopicsPath : "",
    DefaultDomainsPath : "/Domains/Simple_Domain",
    DefaultOlapConnectionPath : "/analysis/connections/Foodmart/Sales",
    selectedRealmURI : "",
    selectedSubType : "",
    options : null,
    // Adhoc tab types identifiers
    TOPIC : "topics",
    DOMAIN : "domains",
    OLAP_CONNECTION : "olapConnections",
    // Adhoc Designer launch types
    TOPIC_LAUNCH_TYPE : "ADH_045b_TOPIC",
    DOMAIN_LAUNCH_TYPE : "ADH_045a_DOMAIN",
    OLAP_CONNECTION_LAUNCH_TYPE : "ADH_108_DATA_CHOOSER_OLAP_CONNECTIONS",



    /**
     * This is for the initialization of ad Hoc's start page
     */
    initialize : function(){
        dialogs.popup.show($("sourceDialog"), true);
        //get the topic path
        var options;
        var UNSPECIFIED_TOPIC ="unspecifiedTopic";
        if(!defaultTopic){
            this.DefaultTopicsPath = defaultTopicDir + UNSPECIFIED_TOPIC;
        }else{
            this.DefaultTopicsPath = defaultTopicDir + defaultTopic;
        }

        if(!isNotNullORUndefined(this.TopicsTreeContainerId)){
            return;
        }

        switch (window.launchType) {
            case this.DOMAIN_LAUNCH_TYPE:
                this.hideRealmTree(this.DOMAIN);
                this.getDomains();
            break;
            case this.OLAP_CONNECTION_LAUNCH_TYPE:
                this.hideRealmTree(this.OLAP_CONNECTION);
                this.getOlapConnections();
            break;
            default:
                // Fall back to Adhoc Topic
                this.getTopics();
        }
        this.initializeHandlers();
    },


    /**
     * used to register click events for the start page
     */
    initializeHandlers : function(){

        $$("fieldset#reportTypes > .button").each(function(object){
            Event.observe($(object), 'click', function(evt){
                var reportType = $(object).identify();
                if(reportType !== "cancel"){
                    this.startWithRealm(reportType);
                    Event.stop(evt);
                }
            }.bind(this));
        }.bind(this));

        $('dataChooserBtn').observe('click', function(evt){
            var reportType = "table";
            this.startWithRealm(reportType);
            Event.stop(evt);
        }.bind(this));

        $('olapCrosstabBtn').observe('click', function(evt){
            var reportType = "olap";
            this.startWithRealm(reportType);
            Event.stop(evt);
        }.bind(this));

        $("dataChooserSource").observe('mouseup', function(evt){
            var element = evt.element();
            var matched = matchAny(element, ["button.action.up"], true);
            if(matched){
                if(matched.identify() == "cancel"){
                    this.cancelTopic(alreadyEditing);
                    Event.stop(evt);
                }
            }
        }.bind(this));

        //realm buttons

        var eventName = isSupportsTouch() ? 'drag:touchstart' : 'mouseup';
        Event.observe($$("#sourceDialog > .content > .header")[0], eventName, function(event) {
            this.getRealm(event.memo ? event.memo.targetEvent : event);
        }.bind(this));

        //enable cancel buttons
        this._enableCancelButtons();
    },


    /**
     * Used to get the realm based on the button pressed
     * @param evt
     */
    getRealm : function(evt){
        var element = Event.extend(getEvent(evt)).element();
        if(!element.hasClassName("tab")){
            element = element.up('li');
        }
        if (!element) {
            return;
        }
        var buttonId = element.readAttribute("id");
        var isSelected = $(element).hasClassName(layoutModule.SELECTED_CLASS); //check if already selected.
        if (!isSelected) {
            this.hideRealmTree(buttonId); //hide the other tree

            if(buttonId === this.TOPIC){
                this.getTopics();
            } else if(buttonId === this.DOMAIN){
                this.getDomains();
            } else if (buttonId === this.OLAP_CONNECTION) {
                this.getOlapConnections();
            }
        }
    },


    /**
     * Method to toggle between enabling and disabling buttons
     * @param tree
     */
    _toggleEnableDisableReportBtns : function(tree){
        //check if node selected. If so, disable buttons
        var selectedItem = tree.getSelectedNode();
        var enable = !((selectedItem && selectedItem.isParent()) || !selectedItem);
        adhocStart._enableReportTypeButtons(enable);
        adhocStart._enableDataChooserButtons(enable);
        adhocStart._enableOlapCrosstabButtons(enable);
    },


    /**
     * Recusive method to add leaf icons to tree
     * @param node
     */
    _processTreeNodeIcon : function(node){
        if(node.isParent()){
            for(var i = 0; i < node.childs.length; i++){
                this._processTreeNodeIcon(node.childs[i]);
            }
        }else{
            adhocStart._updateLeafIcons(node);
        }
    },


    /**
     * Helper method to set css classes on tree leaf
     * @param node
     */
    _updateLeafIcons : function(node){
        if(node && node.param.extra != null){
            if (node.param.extra.subType == 'SLDS') {
                node.param.cssClass = "domain";
            } else if(node.param.extra.subType == 'sl.no.ds') {
                node.param.cssClass = "domain topic";
            } else if (node.param.extra.creator == "QueryBuilder" ){
                node.param.cssClass = "domain topic";
            } else if (node.param.extra.subType == "OLAPDS" ){
                //node.param.cssClass = "node closed";
            } else if (node.param.extra.subType == "olap.no.ds" ){
                node.param.cssClass = "olap";
            } else if (node.param.extra.subType == "Cube" ){
                node.param.cssClass = "olap";
            } else{
                node.param.cssClass = "topic";
            }
            node.refreshStyle();
        }
    },



    /**
     * Used to get info for topics and tie events to the nodes and leaves of the tree
     */
    getTopics : function(){
        var topicsTree;
        var loadTree = false;
        if ($(this.TopicsTreeContainerId).childElements().length < 1) {
            topicsTree = adhocStart.getTopicsTree();
            loadTree = true;
        }else{
            topicsTree = dynamicTree.trees[adhocStart.TopicsTreeContainerId];
        }

        //update description
        this.setSelectedRealmDescription("");

        //events
        topicsTree.observe('leaf:selected', function(event) {
            var node = event.memo.node;
            this._enableReportTypeButtons(true);
            this.setRealmProps(node.param);
        }.bind(this));

        topicsTree.observe('leaf:dblclick', function(event) {
            var reportType = "table";
            this.startWithRealm(reportType);
        }.bind(this));

        topicsTree.observe('node:selected', function(event) {
            this.setRealmProps(null);
            //disable all report type buttons
            this._enableReportTypeButtons(false);
        }.bind(this));

        topicsTree.observe('nodeIcon:click', function(event) {
            var node = event.memo.node;
            //if not leaf, disable all report type buttons
            if (node.childs > 0) {
                this.setRealmProps(null);
                this._enableReportTypeButtons(false);
            }
        }.bind(this));

        topicsTree.observe("children:loaded", function(event){
            var nodes = event.memo.nodes;
            nodes.each(function(node){
                //iterate all nodes and assign css class
                adhocStart._processTreeNodeIcon(node);
            }.bind(this));
        });


        var onShowTree = function(tree) {
            //need to get selected node
            function action() {
                var tree = dynamicTree.trees[adhocStart.TopicsTreeContainerId];
                var nodes = tree.getRootNode().childs;
                if(nodes && nodes.length == 0){
                    adhocStart.setSelectedRealmDescription(noTopicsMessage);   
                }
                var selectedNode = tree.getSelectedNode();
                if (selectedNode != null && !selectedNode.isParent()) {
                    adhocStart.setRealmProps(selectedNode.param);
                }
                //set state of report buttons
                adhocStart._toggleEnableDisableReportBtns(tree);
                //iterate all nodes and assign css class
                adhocStart._processTreeNodeIcon(tree.getRootNode());
            }

            return function() {
                tree.openAndSelectNode(this.DefaultTopicsPath, action, true);
            }.bind(adhocStart)
        }(topicsTree);

        topicsTree.showTreePrefetchNodes(adhocStart.DefaultTopicsPath, onShowTree, ajaxErrorHandler);
        this._markAdhocTypeAsSelected(this.TOPIC);
    },



    /**
     * Used to get the domain tree and tie events to the nodes and leaves of the tree.
     */
    getDomains : function(){
        var domainsTree;
        var loadTree = false;
        if($(this.DomainTreeContainerId).childElements().length < 1){
            domainsTree = adhocStart.getDomainsTree();
            loadTree = true;
        }else{
            domainsTree =  dynamicTree.trees[adhocStart.DomainTreeContainerId];
        }

        //update description
        this.setSelectedRealmDescription("");

        //    events
        domainsTree.observe('leaf:selected', function(event) {
            var node = event.memo.node;
            node.isSelected() && this._enableDataChooserButtons(true);
            this.setRealmProps(node.param);
        }.bind(adhocStart));

        domainsTree.observe('node:selected', function(event) {
            //disable all report type buttons
            this._enableDataChooserButtons(false);
            this.setRealmProps(null);
        }.bind(adhocStart));

        domainsTree.observe('nodeIcon:click', function(event) {
            var node = event.memo.node;
            //if not leaf, disable all report type buttons
            if (node.childs > 0) {
                this.setRealmProps(null);
                this._enableReportTypeButtons(false);
            }
        }.bind(adhocStart));

        domainsTree.observe("children:loaded", function(event){
            var nodes = event.memo.nodes;
            nodes.each(function(node){
                //iterate all nodes and assign css class
                adhocStart._processTreeNodeIcon(node);
            }.bind(this));
        });


        var callback = function(){
            var domainItemType = "com.jaspersoft.commons.semantic.datasource.SemanticLayerDataSource";
            var tree = dynamicTree.trees[adhocStart.DomainTreeContainerId];

            var nodes = tree.getRootNode().childs;
            var domains = new Array();
            var processAllChildren = function(nodes) {
                var objs = new Array();
                for(var i = 0; i < nodes.length; i ++) {
                    if (nodes[i].param.type == domainItemType) {
                        objs.push(nodes[i]);
                    } else {
                        objs = objs.concat(processAllChildren(nodes[i].childs));
                    }
                }

                return objs;
            };

            domains = processAllChildren(nodes);
            var parent = null;
            for(var j = 0; j < domains.length; j ++) {
                tree.openAndSelectNode(domains[j].param.uri, null);
                this.setRealmProps(domains[j].param);
                parent = domains[j].parent;
            }

            if (domains.length > 0) {
                tree.openAndSelectNode(domains[0].param.uri, null);
                this.setRealmProps(domains[0].param);
            }
            //set state of report buttons
            adhocStart._toggleEnableDisableReportBtns(tree);
            //iterate all nodes and assign css class
            adhocStart._processTreeNodeIcon(tree.getRootNode());

        }.bind(adhocStart);

        domainsTree.showTreePrefetchNodes(adhocStart.DefaultDomainsPath, callback, ajaxErrorHandler);
        this._markAdhocTypeAsSelected(this.DOMAIN);
    },

    /**
     * Used to get the domain tree and tie events to the nodes and leaves of the tree.
     */
    getOlapConnections : function(){
        var olapConnectionsTree;
        if($(this.OlapConnectionsTreeContainerId).childElements().length < 1){
            olapConnectionsTree = adhocStart.getOlapConnectionsTree();
        } else {
            olapConnectionsTree =  dynamicTree.trees[adhocStart.OlapConnectionsTreeContainerId];
        }

        //update description
        this.setSelectedRealmDescription("");

        //    events
        olapConnectionsTree.observe('leaf:selected', function(event) {
            var node = event.memo.node;
            node.isSelected() && this._enableOlapCrosstabButtons(true);
            this.setRealmProps(node.param);
        }.bind(adhocStart));

        olapConnectionsTree.observe('node:selected', function(event) {
            //disable all report type buttons
            this._enableOlapCrosstabButtons(false);
            this.setRealmProps(null);
        }.bind(adhocStart));

        olapConnectionsTree.observe('nodeIcon:click', function(event) {
            var node = event.memo.node;
            //if not leaf, disable all report type buttons
            if (node.childs > 0) {
                this.setRealmProps(null);
                this._enableReportTypeButtons(false);
            }
        }.bind(adhocStart));

        olapConnectionsTree.observe("children:loaded", function(event){
            var nodes = event.memo.nodes;
            nodes.each(function(node){
                //iterate all nodes and assign css class
                adhocStart._processTreeNodeIcon(node);
            }.bind(this));
        });


        var callback = function(){
            var tree = dynamicTree.trees[adhocStart.OlapConnectionsTreeContainerId];

            var olapConnections = this._getAllLeaves(tree.getRootNode());

            var node = olapConnections.find(function(connection) {
                return connection.param.uri === adhocStart.DefaultOlapConnectionPath;
            }.bind(adhocStart));

            if (node) {
                tree.openAndSelectNode(node.param.uri, null);
                this.setRealmProps(node.param);
            }

            /*if (olapConnections.first()) {
                tree.openAndSelectNode(olapConnections.first().param.uri, null);
                this.setRealmProps(olapConnections.first().param);
            }*/
            //set state of report buttons
            adhocStart._toggleEnableDisableReportBtns(tree);
            //iterate all nodes and assign css class
            adhocStart._processTreeNodeIcon(tree.getRootNode());

        }.bind(adhocStart);

        olapConnectionsTree.showTreePrefetchNodes(adhocStart.DefaultOlapConnectionPath, callback, ajaxErrorHandler);
        this._markAdhocTypeAsSelected(this.OLAP_CONNECTION);
    },

    _getAllLeaves: function(node) {
        var objs = new Array();
        if (node.isParent()) {
            node.childs.each(function(child) {
                objs = objs.concat(adhocStart._getAllLeaves(child));
            });
        } else {
            objs.push(node);
        }

        return objs;
    },

    /**
     * Used to get the topics tree
     */
    getTopicsTree : function(){
        return dynamicTree.createRepositoryTree(adhocStart.TopicsTreeContainerId, {
            providerId: 'topicTreeDataProvider',
            rootUri: '/',
            bShowRoot: false,
            treeErrorHandlerFn: function() {}
        });
    },


    /**
     * Used to get the domains tree
     */
    getDomainsTree : function(){
        return dynamicTree.createRepositoryTree(adhocStart.DomainTreeContainerId, {
            providerId: 'semanticTreeDataProvider',
            rootUri: '/',
            bShowRoot: false,
            treeErrorHandlerFn: function() {}
        });
    },

    /**
     * Used to get the olapConnections tree
     */
    getOlapConnectionsTree : function(){
        return adhocStart.createOlapConnectionsTree(adhocStart.OlapConnectionsTreeContainerId, {
            providerId: 'olapConnectionTreeDataProvider',
            rootUri: '/',
            bShowRoot: false,
            treeErrorHandlerFn: function() {},
            hideLoader: true
        });
    },


    /**
     * Used to invoke adhoc designer based on the realm chosen
     */
    startWithRealm : function(reportType) {
        var event;
        var realmType = this.getRealmSubType();
        var realmURI = this.getRealmURI();
        var cube = "";

        // tell web flow to use selected topic or go into query builder
        if (realmType === 'Topic') {
            event = 'startAdHocWithTopic';
        }else if (realmType === 'SLDS') {
            event = 'startQueryBuilder';
        } else if (realmType === 'Cube') {
            event = 'startAdhocForOlap';
            //remove cube name from uri - it will be passed as separate parameter
            realmURI = realmURI.substring(0, realmURI.lastIndexOf("/"));
            cube = "cube=" + encodeText(this.getRealmName());
        }

        //no ajax here - just reload the page, sending params needed by web flow
        if (isNotNullORUndefined(event) && isNotNullORUndefined(reportType) && isNotNullORUndefined(realmURI)) {
            //disable all report type buttons
            this._enableReportTypeButtons(false);
            this._enableDataChooserButtons(false);
            this._enableOlapCrosstabButtons(false);
            document.location = 'flow.html?_flowId=adhocFlow&realm=' + encodeURIComponent(encodeURIComponent(realmURI)) +
                    '&_flowExecutionKey=' + flowExecutionKey +
                    '&reportType=' + reportType +
                    '&_eventId=' + event + (cube ? "&" + cube : "");
        }
    },



    /**
     * Used to choose the type of view to open in the designer
     */
    getReportType : function(){
        var reportObject =  $$("#reportTypes >.selected")[0];
        if(reportObject){
            return $(reportObject).readAttribute("id");
        }else{
            return "table";
        }
    },



    /**
     * Leaf actions on domain tree..
     * @param node
     */
//    setDomainsRealmProps : function(node) {
//        if (node != null && node.extra != null) {
//            if (node.extra.subType == 'SLDS') {
//                this.setRealmProps(node);
//            } else {
//                if (node.extra.subType == 'sl.no.ds') {
//                    this.setRealmProps(node);
//                }
//            }
//        }else{
//            this.setRealmProps(null);
//        }
//    },


    /**
     * Used to choose the realm type (topics or domains)
     */
    getRealmType : function(){
        var selectedRealm = $$("#realm >.selected");
        if(selectedRealm){
            return selectedRealm[0].down().readAttribute("id");
        }
    },


    /**
     * Used to hide the realm type based on the button clicked
     * @param id
     */
    hideRealmTree : function(id){
        adhocStart._showTopicsTree(id === this.TOPIC);
        adhocStart._showDomainsTree(id === this.DOMAIN);
        adhocStart._showOlapConnectionsTree(id === this.OLAP_CONNECTION);
    },


    _markAdhocTypeAsSelected : function(adhocTypeElement) {
        // Remove old selection
        [this.TOPIC, this.DOMAIN, this.OLAP_CONNECTION].each(function(typeButton) {
            $(typeButton).removeClassName(layoutModule.SELECTED_CLASS);
        });
        // Select given tab element
        $(adhocTypeElement).addClassName(layoutModule.SELECTED_CLASS);
    },

    /**
     * Shows/Hides topics tree and related buttons
     * @param show - wether tree should be shown
     */
    _showTopicsTree: function(show) {
        if (!show) {
            var tree =  dynamicTree.trees[adhocStart.TopicsTreeContainerId];
            selectedNode = tree ? tree.getSelectedNode() : null;
            if(!!selectedNode){
                selectedNode.deselect();
            }

            $('topicsTreeArea').addClassName(layoutModule.HIDDEN_CLASS);
            $('reportTypes').addClassName(layoutModule.HIDDEN_CLASS);
        } else {
            $('topicsTreeArea').removeClassName(layoutModule.HIDDEN_CLASS);
            $('reportTypes').removeClassName(layoutModule.HIDDEN_CLASS);
        }
    },

    /**
     * Shows/Hides domains tree and related buttons
     * @param show - wether tree should be shown
     */
    _showDomainsTree: function(show) {
        if (!show) {
            var tree =  dynamicTree.trees[adhocStart.DomainTreeContainerId];
            selectedNode = tree ? tree.getSelectedNode() : null;
            if(!!selectedNode){
                selectedNode.deselect();
            }

            $(adhocStart.DomainTreeContainerId).addClassName(layoutModule.HIDDEN_CLASS);
            $('dataChooserBtn').addClassName(layoutModule.HIDDEN_CLASS);
        } else {
            $(adhocStart.DomainTreeContainerId).removeClassName(layoutModule.HIDDEN_CLASS);
            $('dataChooserBtn').removeClassName(layoutModule.HIDDEN_CLASS);
        }
    },

    /**
     * Shows/Hides olapConnections tree and related buttons
     * @param show - wether tree should be shown
     */
    _showOlapConnectionsTree: function(show) {
        if (!show) {
            var tree =  dynamicTree.trees[adhocStart.OlapConnectionsTreeContainerId];
            selectedNode = tree ? tree.getSelectedNode() : null;
            if(!!selectedNode){
                selectedNode.deselect();
            }

            $(adhocStart.OlapConnectionsTreeContainerId).addClassName(layoutModule.HIDDEN_CLASS);
            $('olapCrosstabBtn').addClassName(layoutModule.HIDDEN_CLASS);
        } else {
            $(adhocStart.OlapConnectionsTreeContainerId).removeClassName(layoutModule.HIDDEN_CLASS);
            $('olapCrosstabBtn').removeClassName(layoutModule.HIDDEN_CLASS);
        }
    },

    /**
     * Used to cancel
     */
    cancelRealms : function() {
        history.back();
    },



    /**
     * Used to cancel topics creation
     * @param isAlreadyEditing
     */
    cancelTopic : function(isAlreadyEditing) {
        if(isAlreadyEditing){
            history.back();
        }else{
            this.redirectToHomePage();
        }
    },


     /**
     * Navigate to home page
     */
    redirectToHomePage : function() {
        document.location='flow.html?_flowId=homeFlow';
    },



    /**
     * helper to get realm uri
     */
    getRealmURI : function(){
        return this.selectedRealmURI;
    },


    getRealmSubType : function(){
        return this.selectedSubType;
    },

    getRealmName : function(){
        return this.selectedRealmName;
    },

    setSelectedRealmDescription : function(desc) {
        $("nodeDescription").innerHTML = (typeof desc == "object" ? "" : desc);
    },

    /**
     * Helper to set realm uri
     * @param node
     */
    setRealmProps : function(node){
        if (isNotNullORUndefined(node) && isNotNullORUndefined(node.extra)) {
            this.selectedRealmURI = node.uri;
            this.selectedRealmName = node.id;
            this.selectedSubType = node.extra.subType;
            this.setSelectedRealmDescription(node.extra.desc);
        }else{
            this.selectedRealmURI = "";
            this.selectedRealmName = "";
            this.selectedSubType = "";
            this.setSelectedRealmDescription("");
        }
    },


    /**
     * Enable/Disable report type buttons
     */
    _enableReportTypeButtons: function(enable) {
        $$("fieldset#reportTypes > .button").each(function(object){
            //if(!object.identify().startsWith("cancel")){
                enable ? $(object).writeAttribute("disabled", null) : $(object).writeAttribute("disabled", "disabled");
            //}
        });
    },

    /**
     * Enable/Disable data chooser button
     */
    _enableDataChooserButtons: function(enable) {
        if (enable) {
            var tree = dynamicTree.trees[adhocStart.DomainTreeContainerId];
            var selectedItem = tree && tree.getSelectedNode();
            selectedItem && (enable = selectedItem.param.id !== "sl.no.ds");
            !enable && (selectedItem && selectedItem.deselect());
        }

        $('dataChooserBtn').writeAttribute("disabled", enable ? null : "disabled");
    },

    /**
     * Enable/Disable olap crosstab button
     */
    _enableOlapCrosstabButtons: function(enable) {
        if (enable) {
            var tree = dynamicTree.trees[adhocStart.OlapConnectionsTreeContainerId];
            var selectedItem = tree && tree.getSelectedNode();
            selectedItem && (enable = selectedItem.param.id !== "olap.no.ds");
            !enable && (selectedItem && selectedItem.deselect());
        }

        buttonManager[enable ? 'enable' : 'disable']($('olapCrosstabBtn'));
    },

    /**
     * Enable/Disable report type buttons
     */
    _enableCancelButtons : function(){
        $$("#cancel.button").each(function(object){
            $(object).writeAttribute("disabled", null);
        });
    }

};

adhocStart.createOlapConnectionsTree = function(id, options) {
    // Creating RepositoryFolder class.
    adhocStart.RepositoryFolder = function(options) {
        dynamicTree.TreeNode.call(this, options);

        this.Types = {
            Folder : new dynamicTree.TreeNode.Type('com.jaspersoft.jasperserver.api.metadata.common.domain.Folder'),
            MondrianConnection : new dynamicTree.TreeNode.Type('com.jaspersoft.ji.ja.security.domain.MondrianConnection'),
            SecureMondrianConnection : new dynamicTree.TreeNode.Type('com.jaspersoft.ji.ja.security.domain.SecureMondrianConnection'),
            XMLConnection : new dynamicTree.TreeNode.Type('com.jaspersoft.jasperserver.api.metadata.olap.domain.XMLAConnection'),
            SuperRoot : new dynamicTree.TreeNode.Type('superroot'),
            Root : new dynamicTree.TreeNode.Type('root')
        };
        this.nodeHeaderTemplateDomId = "list_responsive_collapsible_folders:folders";
    };

    adhocStart.RepositoryFolder.prototype = deepClone(dynamicTree.RepositoryFolder.prototype);

    adhocStart.RepositoryFolder.addMethod('isParent', function() {
        return this.param.type == this.Types.Folder.name ||
               this.param.type == this.Types.SuperRoot.name ||
               this.param.type == this.Types.Root.name ||
               this.param.type == this.Types.MondrianConnection.name ||
               this.param.type == this.Types.SecureMondrianConnection.name ||
               this.param.type == this.Types.XMLConnection.name;
    });

    return dynamicTree.createRepositoryTree(id, Object.extend({nodeClass: adhocStart.RepositoryFolder}, options));

};

document.observe('dom:loaded', adhocStart.initialize.bind(adhocStart));