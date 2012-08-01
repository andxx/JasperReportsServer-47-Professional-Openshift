<%--
  ~ Copyright (C) 2005 - 2011 Jaspersoft Corporation. All rights reserved.
  ~ http://www.jaspersoft.com.
  ~ Licensed under commercial Jaspersoft Subscription License Agreement
  --%>
<%@ page contentType="text/html" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="/spring" prefix="spring"%>
<!-- (Group and Detail rows should already be correctly interleaved) -->
<tbody id="tableDetails" class="copyTo">
<c:set var="lastGroup" value="${viewModel.lastGroup}"/>
<c:forEach var="thisMember" items="${viewModel.flattenedData}" varStatus="groupIndex">
    <c:choose>
        <c:when test="${thisMember.isGroupMember}">
            <!-- START: Group -->
            <c:set var="thisGroup" value="${thisMember.group}"/>
            <c:choose>
                <c:when test="${!viewModel.hasColumns}">
                    <tr id="${thisMember.id}"
                        class="${thisMember.rowClass} placeholder member labels"
                        data-index="${groupIndex.index}"
                        data-value="${thisMember.formattedValue}"
                        data-mask="${thisGroup.mask}"
                        data-type="${thisGroup.numericType}"
                        data-fieldDisplay="${thisGroup.defaultDisplayName}"
                        data-label="${thisGroup.currentDisplayName}"
                        data-fieldName="${thisGroup.name}">
                        <td class="label"></td>
                    </tr>
                </c:when>
                <c:when test="${thisMember.isFooter}">
                    <tr id="${thisMember.id}"
                        class="${thisMember.rowClass} memberSummaries"
                        data-index="${groupIndex.index}"
                        data-value="${thisMember.formattedValue}"
                        data-mask="${thisGroup.mask}"
                        data-type="${thisGroup.numericType}"
                        data-fieldDisplay="${thisGroup.defaultDisplayName}"
                        data-label="${thisGroup.currentDisplayName}"
                        data-fieldName="${thisGroup.name}">
                        <c:forEach var="footerCell" items="${thisMember.groupSummaryRow.childMembers}" varStatus="groupSummaryCellItStatus">
                            <c:set var="thisColumn" value="${viewModel.columns[groupSummaryCellItStatus.index]}"/>
                            <td class="value ${footerCell.isNumeric ? 'numeric' : ''}">${footerCell.formattedContent}</td>
                        </c:forEach>
                    </tr>
                </c:when>
                <c:when test="${viewModel.showTableDetails || thisGroup != lastGroup}">
                    <tr id="${thisMember.id}"
                        class="${thisMember.rowClass} placeholder member labels"
                        data-index="${groupIndex.index}"
                        data-value="${thisMember.formattedValue}"
                        data-mask="${thisGroup.mask}"
                        data-type="${thisGroup.numericType}"
                        data-fieldDisplay="${thisGroup.defaultDisplayName}"
                        data-label="${thisGroup.currentDisplayName}"
                        data-fieldName="${thisGroup.name}">
                        <c:forEach var="thisColumn" items="${viewModel.columns}">
                            <td class="label"></td>
                        </c:forEach>
                    </tr>
                </c:when>
            </c:choose>
            <!-- END: Group -->
        </c:when>
        <c:when test="${thisMember.isRow && viewModel.showTableDetails}">
            <c:set var="rowCounter" value="${rowCounter+1}"/>
            <c:choose>
                <c:when test="${rowCounter%2==0}">
                    <c:set var="detailRowClass" value="stripe"/>
                    <c:set var="detailCellClass" value="${viewModel.detailCellClass}"/>
                </c:when>
                <c:otherwise>
                    <c:set var="detailRowClass" value=""/>
                    <c:set var="detailCellClass" value="${viewModel.detailCellAltClass}"/>
                </c:otherwise>
            </c:choose>
            <c:if test="${viewModel.hasColumns}">
                <tr class="record ${detailRowClass}">
                    <c:forEach var="detailCell" items="${thisMember.childMembers}" varStatus="detailCellItStatus">
                        <c:set var="thisColumn" value="${viewModel.columns[detailCellItStatus.index]}"/>
                        <td class="value ${detailCell.isNumeric ? 'numeric' : ''}">
                            <span class="wrap">${empty detailCell.formattedContent ? '&nbsp;' : detailCell.formattedContent}</span>
                        </td>
                    </c:forEach>
                </tr>
            </c:if>
        </c:when>
    </c:choose>
</c:forEach>
<!-- END: Group and Rows-->
<!-- START: Summary Row -->
<c:if test="${viewModel.hasSummaryRow}">
        <tr id="grandSummaryRow" class="grand columnSummaries stripe">
            <c:forEach var="summaryCell" items="${viewModel.summaryRow.childMembers}" varStatus="summaryCellItStatus">
                <c:set var="thisColumn" value="${viewModel.columns[summaryCellItStatus.index]}"/>

                <c:choose>
                    <c:when test="${summaryCell.isEmpty}">
                        <td id="grandSummaryCell_${summaryCellItStatus.index}"
                            data-summaryIndex="${summaryCellItStatus.index}"
                            data-fieldName="${thisColumn.name}"
                            class="value"></td>
                    </c:when>
                    <c:otherwise>
                        <td id="grandSummaryCell_${summaryCellItStatus.index}"
                            class="value ${summaryCell.isNumeric ? 'numeric' : ''}"
                            data-summaryIndex="${summaryCellItStatus.index}"
                            data-fieldName="${thisColumn.name}"
                            data-name="${thisColumn.summaryFunction}">${summaryCell.formattedContent}
                        </td>
                    </c:otherwise>
                </c:choose>
            </c:forEach>
        </tr>
</c:if>
<!-- END: Summary Row -->
<!-- START: EOF file test -->
<c:if test="${viewModel.allDataFetched}">
    <tr id="endOfFileRow"></tr>
</c:if>
<!-- END: EOF file test -->
</tbody>


