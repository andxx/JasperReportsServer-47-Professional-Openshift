<%--
~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
~ http://www.jaspersoft.com.
~ Licensed under commercial Jaspersoft Subscription License Agreement
--%>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<script type="text/javascript">
    domain._messages['equals'] = '<spring:message code="QB_062_RE_COMPARISON_EQUALS" javaScriptEscape="true"/>';
    domain._messages['isOneOf'] = '<spring:message code="QB_063_RE_COMPARISON_IS_ONE_OF" javaScriptEscape="true"/>';
    domain._messages['contains'] = '<spring:message code="QB_064_RE_COMPARISON_CONTAINS" javaScriptEscape="true"/>';
    domain._messages['startsWith'] = '<spring:message code="QB_065_RE_COMPARISON_STARTS_WITH" javaScriptEscape="true"/>';
    domain._messages['endsWith'] = '<spring:message code="QB_066_RE_COMPARISON_ENDS_WITH" javaScriptEscape="true"/>';
    domain._messages['doesNotEqual'] = '<spring:message code="QB_067_RE_COMPARISON_DOES_NOT_EQUAL" javaScriptEscape="true"/>';
    domain._messages['isNotOneOf'] = '<spring:message code="QB_068_RE_COMPARISON_IS_NOT_ONE_OF" javaScriptEscape="true"/>';
    domain._messages['doesNotContain'] = '<spring:message code="QB_069_RE_COMPARISON_DOES_NOT_CONTAIN" javaScriptEscape="true"/>';
    domain._messages['doesNotStartWith'] = '<spring:message code="QB_070_RE_COMPARISON_DOES_NOT_START_WITHF" javaScriptEscape="true"/>';
    domain._messages['doesNotEndWith'] = '<spring:message code="QB_071_RE_COMPARISON_DOES_NOT_END_WITH" javaScriptEscape="true"/>';

    domain._messages['isNotEqualTo'] = '<spring:message code="QB_067_RE_COMPARISON_DOES_NOT_EQUAL" javaScriptEscape="true"/>';
    domain._messages['isGreaterThan'] = '<spring:message code="QB_073_RE_COMPARISON_IS_GREATER_THAN" javaScriptEscape="true"/>';
    domain._messages['lessThan'] = '<spring:message code="QB_074_RE_COMPARISON_LESS_THAN" javaScriptEscape="true"/>';
    domain._messages['isGreaterThanOrEqualTo'] = '<spring:message code="QB_075_RE_COMPARISON_IS_GREATER_THAN_OR_EQUAL_TO" javaScriptEscape="true"/>';
    domain._messages['isLessThanOrEqualTo'] = '<spring:message code="QB_076_RE_COMPARISON_IS_LESS_THAN_OR_EQUAL_TO" javaScriptEscape="true"/>';
    domain._messages['isBetween'] = '<spring:message code="QB_077_RE_COMPARISON_IS_BETWEEN" javaScriptEscape="true"/>';

    domain._messages['isAfter'] = '<spring:message code="QB_078_RE_COMPARISON_IS_AFTER" javaScriptEscape="true"/>';
    domain._messages['isBefore'] = '<spring:message code="QB_079_RE_COMPARISON_IS_BEFORE" javaScriptEscape="true"/>';
    domain._messages['isOnOrAfter'] = '<spring:message code="QB_080_RE_COMPARISON_IS_ON_OR_AFTER" javaScriptEscape="true"/>';
    domain._messages['isOnOrBefore'] = '<spring:message code="QB_081_RE_COMPARISON_IS_ON_OR_BEFORE" javaScriptEscape="true"/>';
    domain._messages['isDuring'] = '<spring:message code="QB_082_RE_COMPARISON_IS_DURING" javaScriptEscape="true"/>';
    domain._messages['isBetween'] = '<spring:message code="QB_077_RE_COMPARISON_IS_BETWEEN" javaScriptEscape="true"/>';
    domain._messages['isNotEqualTo'] = '<spring:message code="QB_067_RE_COMPARISON_DOES_NOT_EQUAL" javaScriptEscape="true"/>';
    domain._messages['isNotDuring'] = '<spring:message code="QB_083_RE_COMPARISON_IS_NOT_DURING" javaScriptEscape="true"/>';
    domain._messages['isNotBetween'] = '<spring:message code="QB_084_RE_COMPARISON_IS_NOT_BETWEEN" javaScriptEscape="true"/>';


    domain._messages['blank'] = '<spring:message code="QB_126_RE_VALUE_BLANK" javaScriptEscape="true"/>';
    domain._messages['true'] = '<spring:message code="QB_101_RE_VALUE_TRUE" javaScriptEscape="true"/>';
    domain._messages['false'] = '<spring:message code="QB_102_RE_VALUE_FALSE" javaScriptEscape="true"/>';

    domain._messages['today'] = '<spring:message code="QB_103_RE_VALUE_TODAY" javaScriptEscape="true"/>';
    domain._messages['yesterday'] = '<spring:message code="QB_104_RE_VALUE_YESTERDAY" javaScriptEscape="true"/>';
    domain._messages['startOfThisWeek'] = '<spring:message code="QB_105_RE_VALUE_START_OF_THIS_WEEK" javaScriptEscape="true"/>';
    domain._messages['startOfThisMonth'] = '<spring:message code="QB_106_RE_VALUE_START_OF_THIS_MONTH" javaScriptEscape="true"/>';
    domain._messages['startOfThisQuarter'] = '<spring:message code="QB_107_RE_VALUE_START_OF_THIS_QUARTER" javaScriptEscape="true"/>';
    domain._messages['startOfThisYear'] = '<spring:message code="QB_108_RE_VALUE_START_OF_THIS_YEAR" javaScriptEscape="true"/>';
    domain._messages['startOfPreviousWeek'] = '<spring:message code="QB_109_RE_VALUE_START_OF_PREVIOUS_WEEK" javaScriptEscape="true"/>';
    domain._messages['startOfPreviousMonth'] = '<spring:message code="QB_110_RE_VALUE_START_OF_PREVIOUS_MONTH" javaScriptEscape="true"/>';
    domain._messages['startOfPreviousQuarter'] = '<spring:message code="QB_111_RE_VALUE_START_OF_PREVIOUS_QUARTER" javaScriptEscape="true"/>';
    domain._messages['startOfPreviousYear'] = '<spring:message code="QB_112_RE_VALUE_START_OF_PREVIOUS_YEAR" javaScriptEscape="true"/>';
    domain._messages['otherDate'] = '<spring:message code="QB_117_RE_VALUE_END_OF_OTHER_DATE" javaScriptEscape="true"/>';
    domain._messages['endOfPreviousWeek'] = '<spring:message code="QB_113_RE_VALUE_END_OF_PREVIOUS_WEEK" javaScriptEscape="true"/>';
    domain._messages['endOfPreviousMonth'] = '<spring:message code="QB_114_RE_VALUE_END_OF_PREVIOUS_MONTH" javaScriptEscape="true"/>';
    domain._messages['endOfPreviousQuarter'] = '<spring:message code="QB_115_RE_VALUE_END_OF_PREVIOUS_QUARTER" javaScriptEscape="true"/>';
    domain._messages['endOfPreviousYear'] = '<spring:message code="QB_116_RE_VALUE_END_OF_PREVIOUS_YEAR" javaScriptEscape="true"/>';
    domain._messages['thisWeek'] = '<spring:message code="QB_118_RE_VALUE_THIS_WEEK" javaScriptEscape="true"/>';
    domain._messages['thisMonth'] = '<spring:message code="QB_119_RE_VALUE_THIS_MONTH" javaScriptEscape="true"/>';
    domain._messages['thisQuarter'] = '<spring:message code="QB_120_RE_VALUE_THIS_QUARTER" javaScriptEscape="true"/>';
    domain._messages['thisYear'] = '<spring:message code="QB_121_RE_VALUE_THIS_YEAR" javaScriptEscape="true"/>';
    domain._messages['previousWeek'] = '<spring:message code="QB_122_RE_VALUE_PREVIOUS_WEEK" javaScriptEscape="true"/>';
    domain._messages['previousMonth'] = '<spring:message code="QB_123_RE_VALUE_PREVIOUS_MONTH" javaScriptEscape="true"/>';
    domain._messages['previousQuarter'] = '<spring:message code="QB_124_RE_VALUE_PREVIOUS_QUARTER" javaScriptEscape="true"/>';
    domain._messages['previousYear'] = '<spring:message code="QB_125_RE_VALUE_PREVIOUS_YEAR" javaScriptEscape="true"/>';

    domain._messages['and'] = '<spring:message code="QB_059_RE_AND" javaScriptEscape="true"/>';
    domain._messages['startOf'] = '<spring:message code="QB_127_RE_VALUE_START_OF" javaScriptEscape="true"/>';

    domain._messages['QB_RE_INCORECT_INTEGER_VALUE'] = '<spring:message code="QB_RE_INCORECT_INTEGER_VALUE" javaScriptEscape="true"/>';
    domain._messages['warning'] = '<spring:message code="QB_WARNING" javaScriptEscape="true"/>';

    domain._messages['fieldName'] = '<spring:message code="QB_042_RE_FIELD_NAME" javaScriptEscape="true"/>';
    domain._messages['comparison'] = '<spring:message code="QB_043_RE_COMPARISON" javaScriptEscape="true"/>';
    domain._messages['values'] = '<spring:message code="QB_044_RE_VALUES" javaScriptEscape="true"/>';
    domain._messages['firstField'] = '<spring:message code="QB_096_RE_FIRST_FIELD" javaScriptEscape="true"/>';
    domain._messages['secondField'] = '<spring:message code="QB_097_RE_SECOND_FIELD" javaScriptEscape="true"/>';

    // Error messages
    domain._messages['value_should_be_not_empty'] = '<spring:message code="page.filters.warning.not.empty" javaScriptEscape="true"/>';
    domain._messages['wrong_number_format'] = '<spring:message code="page.filters.warning.number.format" javaScriptEscape="true"/>';
    domain._messages['number_out_of_bounds'] = '<spring:message code="page.filters.warning.out.of.bounds" javaScriptEscape="true"/>';
    domain._messages['number_range_error'] = '<spring:message code="page.filters.warning.number.range" javaScriptEscape="true"/>';
    domain._messages['date_range_error'] = '<spring:message code="page.filters.warning.date.range" javaScriptEscape="true"/>';
    domain._messages['wrong_date_format'] = '<spring:message code="page.filters.warning.date.format" javaScriptEscape="true"/>';
    domain._messages['domain.filter.incorrect_integer_value'] =
            '<spring:message code="page.filters.warning.integer.format" javaScriptEscape="true"/>';
    domain._messages['too_long_text'] = '<spring:message code="page.filters.warning.max.length" javaScriptEscape="true"/>';
    // Server errors
    domain._messages['domain.filter.too_many_records'] = '<spring:message code="QB_TOO_MANY_ROWS" javaScriptEscape="true"/>';

    // Filters title messages
    domain._messages['filter_default_title'] = '<spring:message code="page.filters.filter.value.title" javaScriptEscape="true"/>';
    domain._messages['filter_string_title'] = '<spring:message code="page.filters.filter.title.string" javaScriptEscape="true"/>';
    domain._messages['filter_number_title'] = '<spring:message code="page.filters.filter.title.number" javaScriptEscape="true"/>';
    domain._messages['filter_date_title'] = '<spring:message code="page.filters.filter.title.date" javaScriptEscape="true"/>';
    domain._messages['filter_range_title'] = '<spring:message code="page.filters.filter.title.range" javaScriptEscape="true"/>';
    domain._messages['filter_multiple_values_title'] = '<spring:message code="page.filters.filter.title.multipleValues" javaScriptEscape="true"/>';
    domain._messages['filter_combo_title'] = '<spring:message code="page.filters.filter.title.combo" javaScriptEscape="true"/>';
    domain._messages['filter_empty_string'] = '<spring:message code="page.filters.filter.empty.string" javaScriptEscape="true"/>';
    domain._messages['filter_null_value'] = '<spring:message code="page.filters.filter.null.value" javaScriptEscape="true"/>';

    domain._messages['domain.filter.locked'] = '<spring:message code="page.filters.filter.locked" javaScriptEscape="true"/>';
    domain._messages['domain.filter.unlocked'] = '<spring:message code="page.filters.filter.unlocked" javaScriptEscape="true"/>'; 


    Calendar._MN = [<c:forEach var="i" begin="0" end="${fn:length(dateMonths) - 2}">"${dateMonths[i]}"<c:if test="${i < 11}">,</c:if></c:forEach>];
    Calendar._SMN = [<c:forEach var="i" begin="0" end="${fn:length(dateShortMonths) - 2}">"${dateShortMonths[i]}"<c:if test="${i < 11}">,</c:if></c:forEach>];
    Calendar._SDN = [<c:forEach var="i" begin="1" end="${fn:length(dateSnortWeekdays) - 1}">"${dateSnortWeekdays[i]}"<c:if test="${i < 7}">,</c:if></c:forEach>];

</script>