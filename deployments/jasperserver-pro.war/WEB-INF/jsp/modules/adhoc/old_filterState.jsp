<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>

<script id="adhocFilterState" type="text/javascript">
    localContext.numberOfExistingFilters = ${fn:length(viewModel.existingFilters)};
    //need to comment this out because of bug 24053
    //Because in other case during calling adhocDesigner.updateBase this script will evaluated (with incorrect data)
    //AFTER evaluating of baseState script where undoModeNames has correct value.
    //localContext.undoModeNames = "${viewModel.undoModeNames}".split(", ");
</script>

<%--
 HACK to fix bug 22529 - somewhy in IE <script id="adhocFilterState"> tag is not evaluated on AJAX request
 possibly due to compatibility mode.
 --%>
<textarea class="hidden" style="display:none" name="_evalScript">
    localContext.numberOfExistingFilters = ${fn:length(viewModel.existingFilters)};
    localContext.undoModeNames = "${viewModel.undoModeNames}".split(", ");
</textarea>
