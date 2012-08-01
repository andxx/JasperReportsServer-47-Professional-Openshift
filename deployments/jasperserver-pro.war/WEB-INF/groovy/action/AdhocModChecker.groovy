import com.jaspersoft.jasperserver.api.common.domain.impl.ExecutionContextImpl
import com.jaspersoft.ji.adhoc.service.RequestMonitor
import com.jaspersoft.ji.adhoc.service.SessionAttributeManager
import com.jaspersoft.ji.adhoc.service.AdhocEngineServiceImpl
import com.jaspersoft.ji.adhoc.action.AdhocAction

import org.apache.log4j.Logger

import java.util.HashMap
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

// This is a Groovy bean implementing RequestMonitor, an interface
// which gets called before and after Ad Hoc AJAX calls.
// It's added to the requestMonitorList in the adhocAjaxController bean definition.

class AdhocModChecker implements RequestMonitor {
	AdhocEngineServiceImpl engine
	Logger log = Logger.getLogger("adhocAjaxRequests")
	
	// debug
	def p(Object[] args) { 
		log.debug(args.join(" ")) 
	}

	// don't track these actions
	def ignoreActions = [
		"updateAvailableTree", 
		"loadState", 
		"generateFilterPanel", 
		"checkSave", 
		"save", 
		"tryToKeepServerAlive",
		"toggleAdhocDataSetSize",
		"prepareDrillTableState",
		"prepareDrillTableStateOLAP",
		"showInUnsafeColumnMode",
		"showInUnsafeRowMode",
	]

	// actions that won't get propagated to the report
	def wontReflectChangesActions = [
		"insertDimensionInAxisWithChild", 
		"insertColumn",
		"moveDimension", 
		"switchToRowGroup",
		"switchToColumnGroup",
		"moveColumn", 
		"moveGroup", 
		"setDataMask",
		"setColumnMask",
		"insertGroup",
		"removeColumn",
		"removeMeasure",
		"setGroupLabel",
		"setColumnHeader",
		"setColumnSummaryFunction",
		"toggleDetails",
		"removeGroup",
		"chartChange"   // see endRequest(): all chart changes get lumped into this bucket
	]

	// actions that may cause report breakage
	def unexpectedBehaviorActions = [
		"pivot", 
		"insertMeasure", 
		"setSummaryFunction", 
		"setSummaryFunctionAndDataMask", 
		"setSummaryFunctionAndMeasureMask",
		"updateField",
		"updateFieldAndView",
		"changeFieldAttributeOrMeasure",
		"moveMeasureByName",
		"hideRowLevel",
		"hideColumnLevel"
	] 

	def getSessionAttr(req, name) {
		SessionAttributeManager.getInstance().getSessionAttribute(name, req)
	}
	
	// get state out of session
	def getState(req) {
		def iEngine = getSessionAttr(req, AdhocAction.ENGINE)
		iEngine.state
	}
	
	// look up last saved view
	def getSavedView(req) {
		def currentView = getSessionAttr(req, AdhocAction.ADHOC_REPORT)
		def savedView 
		if (currentView) {
			savedView = engine.repository.getResource(null, currentView.URIString)
		} 
		return savedView
	}
	
	// return true if mode has changed since last save
	boolean checkModeSwitch(req) {
		def savedView = getSavedView(req)
		if (! savedView) {
			return false
		}
		def savedState = savedView.adhocState
		def switched = (getState(req).mode != savedState.mode)
		if (switched) {
			p("mode changed from ${savedState.mode} to ${getState(req).mode}")
		}
		return switched
	}
	/*
	    private boolean savingViewWouldBreakReports(HttpServletRequest req) throws Exception {
    	AdhocDataView currentView = (AdhocDataView) getSessionAttribute(AdhocAction.ADHOC_REPORT, req);
    	AdhocUnifiedState currentState = (AdhocUnifiedState) currentView.getAdhocState();
    	AdhocDataView savedView = (AdhocDataView) getRepository().getResource(exContext(req), currentView.getURIString());
    	AdhocUnifiedState savedState = (AdhocUnifiedState) savedView.getAdhocState();

    	if (! currentState.getMode().equals(savedState.getMode())) {
    		return true;
    	}
    	AdhocMetadata savedMetadata = engineService.getAdhocMetadataFactory().getRuntimeDataViewMetadata(currentView.getURI(), Locale.getDefault());
    	savedState.setFieldManager(savedMetadata);
    	AdhocDataStrategy strategyForSavedView = engineService.getDataStrategyService().getDataStrategy(savedMetadata, savedState, new HashMap());
    	AdhocDataStrategy currentStrategy = getStrategy(req);
    	compareStrategies(strategyForSavedView, currentStrategy);
		return false;
	}
	*/
	// get and set modifications using a state property so that it works correctly with undo
	// 
	def getModFlags(req) {
		def modFlagString = getState(req).getProperty("modFlags")
		(modFlagString ? modFlagString.split(" ") : []) as Set
	}
	
	def setModFlags(req, flags) {
		getState(req).setProperty("modFlags", flags.join(" "))
	}
	
	// when checkSave is called, figure out the effect of changes and set it in a property.
	// this is used to select an appropriate message for the user
	void startRequest(HttpServletRequest req, HttpServletResponse resp) {
		if (req.getParameter("action") == "checkSave") {
			def msg = ""
			// see if mode has changed from original (can't be tested with ajax monitor because it bounces out to webflow)
			if (checkModeSwitch(req)) {
				msg = "unexpectedBehavior"
			} else {
				// check other edits
				def modSet = getModFlags(req)
				if (unexpectedBehaviorActions.intersect(modSet).size() > 0) {
					msg = "unexpectedBehavior"
				} else if (wontReflectChangesActions.intersect(modSet).size() > 0) {
					msg = "wontReflectChanges"
				} else if (modSet) {
				    // assume that if an edit was made but it doesn't fall into any other categories, the changes will propagate
					msg = "willReflectChanges"
				}
				p("modSet = " + modSet);
			}
			p("typeOfViewChange = " + msg);
			getState(req).setProperty("typeOfViewChange", msg);
		} else if (req.getParameter("action") == "save") {
			setModFlags(req, [])
		}
	}
	
	// update the set of ajax request actions called since the last save
	// do this AFTER the handler runs
	void endRequest(HttpServletRequest req, HttpServletResponse resp, Exception e) {
		def action = req.getParameter("action")
		if (ignoreActions.contains(action)) {
			return
		}
		def modFlags = getModFlags(req)
		// differentiate adding measures
		if (action == "insertDimensionInAxisWithChild" && req.getParameter("dim") == "Measures") {
			action = "insertMeasure"
		}
		// chart changes never make it
		if (getState(req).mode == "chart") {
			action = "chartChange"
		}
		modFlags.add(action)
		setModFlags(req, modFlags)
		p("modFlags = " + modFlags)
	}
	
	public void setEngine(AdhocEngineServiceImpl engine) {
		this.engine = engine
	}
	
	public AdhocEngineServiceImpl getEngine() {
		this.engine
	}
	
}