package groovy_column

import com.jaspersoft.commons.datarator.DataColumn
import com.jaspersoft.commons.datarator.RankingAggregateColumn
import com.jaspersoft.commons.datarator.ReadOnlyBitSet
import com.jaspersoft.commons.dimengine.AllValuesDimensionMember
import com.jaspersoft.commons.dimengine.DimensionMember
import com.jaspersoft.commons.dimengine.MeasureDimensionMember
import com.jaspersoft.commons.dimengine.TreeNode
import java.math.MathContext
import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import org.joda.time.DateMidnight

class BaseGroovyColumn extends com.jaspersoft.commons.groovy.GroovyColumn {
  def mc = new MathContext(3)
  final MILLS_PER_SEC = 1000;
  final SECS_PER_MIN = 60G;
  final HOUR_PER_DAY = 24G;
  final DAYS_PER_WK  = 7G;
  final DAYS_PER_MONTH = 30G;
  final MONTHS_PER_QUART = 3G;
  final MONTHS_PER_YR = 12G;
  
  DecimalFormat fm = new java.text.DecimalFormat("0.00", new DecimalFormatSymbols(Locale.ENGLISH));
  RankingAggregateColumn rankColumn;

  // debug
  def p(Object[] args) { System.out.println(args.join(" ")) }

  // string functions
  boolean startsWith(String str, String prefix) {str == null ? false : str.toLowerCase().startsWith(prefix.toLowerCase()) }
  boolean endsWith(String str, String suffix) { str == null ? false :  str.toLowerCase().endsWith(suffix.toLowerCase()) }
  boolean contains(String str, String str2) { str == null ? false :  str.toLowerCase().indexOf(str2.toLowerCase()) >= 0 }

  //added support of isAnyValue for all data types
//  boolean isAnyValue(String str) { str != null}
//  boolean isAnyValue(Long num) { num != null}
//  boolean isAnyValue(Double doub) { doub != null}
//  boolean isAnyValue(BigDecimal decimal) { decimal != null}
//  boolean isAnyValue(DateMidnight date) { date != null}
//  boolean isAnyValue(Boolean bool) { bool != null}
  boolean isAnyValue(Object obj) { return true }

  def nothing(arg) { null }

  // cast to date
  DateMidnight Date(obj) { obj == null ? null : new DateMidnight(obj) }

  // these functions convert from Java date types to joda-time
  // Update: moved to GroovyColumn.java
  /*
  def toDateTime(timestamp) { timestamp == null ? null : new DateTime(timestamp) }
  def toDateMidnight(date) { date == null ? null : new DateMidnight(date) }
  */
  // support for calc fields (keep long & double separate)
  // update for bug 21368: for some reason we were falling back to Object[] version which used longs
  // don't know why that even worked, but must have something to do w/ method resolution
  // put in long and double versions of add and multiply; TBD, let's test big decimal
  def add( long[] args ) { long total = 0; args.each { if (it != null) total += it }; return total }
  def add( double[] args ) { double total = 0; args.each { if (it != null) total += it };  return total }
  def add( Object[] args ) { BigDecimal total = 0; args.each { if (it != null) total += it };  return total }
  def subtract(arg1, arg2) { (arg1 ?: 0) - (arg2 ?: 0) }
  def multiply( long[] args ) { long total = 1; args.each { total *= (it ?: 0) }; return total }
  def multiply( double[] args ) { double total = 1; args.each { total *= (it ?: 0) }; return total }
  def multiply( Object[] args ) { BigDecimal total = 1; args.each { total *= (it ?: 0) }; return total }
  
  // don't do separate versions of division because Groovy method resolution is flakey,
  // but we do need to handle BigDecimal separately
  def divide(arg1, arg2)  {
    // div by zero is zero (mask div by zero error)
    // also, null treated as zero
    if (! arg1 || ! arg2) { 
      return 0
    } 
    if (arg1 instanceof BigDecimal) {
      return arg1.divide(arg2, MathContext.DECIMAL64)
    } else {
      return arg1 / arg2
    }
  }

  def round(BigDecimal arg1) { arg1 == null ? null : arg1.setScale(0, RoundingMode.HALF_UP) }
  
  def round(long arg1) {
    if (nullCheck(arg1)) {
      return null
    };
    return arg1
  }

  def round(double arg1) {
    if (nullCheck(arg1)) {
      return null
    };
    return java.lang.Math.round(arg1)
  }

  def toBigDecimal(String num) {
  	new BigDecimal(num).stripTrailingZeros()
  }
  
  /*
  def nullCheck(Object[] args) {
    args.any { it == null }
  }
  */

  // aggregates
  // please, let java do it!!
  /*
    def sum(Iterator i) {
        def sum = 0;
        i.each {
            if (it != null) { sum += it }
        }
        return sum;
    }
    */

  // version with data column and tree nodes
  def sum(DataColumn col) {
    sum(col.iterator(and(rowNode, columnNode)))
  }

  def Sum(DataColumn col) { sum(col) }

  /*
  def average(DataColumn col) {
      def i = col.iterator(and(rowNode, columnNode))
      def sum = 0d, count = 0i;
      i.each {
          if (it != null) { sum += it; count++ }
      }
      return sum / count;
  }
  */
  def average(DataColumn col) {
    average(col.iterator(and(rowNode, columnNode)))
  }

  def Average(DataColumn col) { average(col) }
  
  def StandardDeviation(DataColumn col) {
  	def mean = average(col)
    def i = col.iterator(and(rowNode, columnNode))
    def sum_variance = 0d;
    def count = 0i;
    p("avg: $mean");
    i.each {
      if (it != null) { 
      	def diffsquared = Math.pow(it - mean, 2);
      	sum_variance += diffsquared;
      	count++;
      	p("value = $it, diff = ${it - mean}, diffsquared = $diffsquared"); 
      }
    }
    if (count == 0) return 0;
    p("count: $count, sum_variance: $sum_variance, variance: ${sum_variance / count}, stddev: ${Math.sqrt(sum_variance / count)}");
    return count ? Math.sqrt(sum_variance / count) : 0;
  }
  def LookupValue(DataColumn dataColumn) {
      lookupValue(dataColumn);
  }

  def lookupValue(DataColumn dataColumn) {
      p("Hello world!");
  }

  def LookupValue(DataColumn dataColumn, DataColumn discriminatorCol) {
      lookupValue(dataColumn, discriminatorCol);
  }

  def lookupValue(DataColumn dataColumn, DataColumn discriminatorCol) {
      def orgBitSet = and(rowNode, columnNode);
      def key;
      def isRowSetExisted = (rowNode != null) && (rowNode?.set != null);
      // column node can be node if it is table without details
      def isColumnSetExisted = (columnNode != null) && (columnNode?.set != null);
      def curRowNode = rowNode;
      def curColumnNode = columnNode;
      DimensionMember rowMember = null;
      def rowLevel = 0;
      DimensionMember colMember = null;
      def colLevel = 0;

      if (isRowSetExisted) {
          rowLevel = rowNode.level;
          rowMember = rowNode.getMember();
          // if it is MemberDimensionMember, go up one more level
          if (rowMember instanceof MeasureDimensionMember) {
              curRowNode = rowNode.getParent();
              rowMember = curRowNode.getMember();
              rowLevel--;
          }
      }
      if (isColumnSetExisted) {
          colLevel = columnNode.level;
          colMember = columnNode.getMember();
          // if it is MemberDimensionMember, go up one more level
          if (colMember instanceof MeasureDimensionMember) {
              curColumnNode = columnNode.getParent();
              colMember = curColumnNode.getMember();
              colLevel--;
          }
      }
      // if both row node bit set and column node bit set are null, it must be grant total
      if ((!isRowSetExisted) && (!isColumnSetExisted)) {
          key = "0|0";
      } else {
          // find the current row level
          if (isRowSetExisted) {
              while ((curRowNode != null) && (rowMember.containsAll() || (rowMember instanceof AllValuesDimensionMember))) {
                  rowLevel--;
                  curRowNode = curRowNode.getParent();
                  if (curRowNode != null) {
                      rowMember = curRowNode.getMember();
                  }
              }
          }
          // find the current column level
          if (isColumnSetExisted) {
              while ((curColumnNode != null) && (colMember.containsAll() || (colMember instanceof AllValuesDimensionMember))) {
                  colLevel--;
                  curColumnNode = curColumnNode.getParent();
                  if (curColumnNode != null) {
                      colMember = curColumnNode.getMember();
                  }
              }
          }
          key = rowLevel + "|" + colLevel;
      }
  //    p("KEY = " + key);
      def disBitSet = discriminatorCol.getRowSet(key);
      def rowIndex = -1;
      if (disBitSet == null) rowIndex = orgBitSet.nextSetBit(0);
      if (rowIndex < 0 && orgBitSet == null) rowIndex = disBitSet.nextSetBit(0);
      if (rowIndex < 0) {
            def newSet;
            //  if it is ReadOnlyBitSet, must sure we do the AND operation using the base bitset
            if ((orgBitSet instanceof ReadOnlyBitSet) && (orgBitSet.base != null)) {
                newSet =  orgBitSet.base.clone().and(disBitSet)
            } else {
                newSet =  orgBitSet.clone().and(disBitSet);
            }
            rowIndex = newSet.nextSetBit(0);
      }
  //    p("ROW INDEX = " + rowIndex);
      if (rowIndex >= 0) return dataColumn.get(rowIndex);
      else return null;
  }

  // tree node ops

  // get the result of and-ing the sets for two tree nodes (null if both sets are null)
  def and(TreeNode rnode, TreeNode cnode = null) {
    def rset = rnode?.set
    def cset = cnode?.set
    if (rset == null) {
      return cset
    } else {
      return (cset == null) ? rset : rset.clone().and(cnode.set.base)
    }
  }

  // common code to calculate percent
  def percentResult(datacol, topSet, bottomSet) {
    def bottomSum = sum(datacol.iterator(bottomSet))
    def topSum = sum(datacol.iterator(topSet))
    //p("top   : " + topSet?.cardinality() + "/" + topSum)
    //p("bottom: " + bottomSet?.cardinality() + "/" + bottomSum)
    bottomSum == 0 ? 100 : topSum * 100d / bottomSum
  }

  // you can find root from row node because it will always be there, but root of row & col is the same
  def percent(DataColumn datacol) {
    def myset = and(rowNode, columnNode)
    // get root node which provides overall dataset filter
    def rootset = rowNode ? rowNode.root.set : columnNode.root.set
    percentResult(datacol, myset, rootset)
  }

  def percentOfColumnParent(DataColumn datacol) {
    def myset = and(rowNode, columnNode)
    def parentset = and(rowNode, columnNode?.logicalParent)
    def result = percentResult(datacol, myset, parentset)
    // p("%CGP for " + rowNode?.path + " and " + columnNode?.path + " = " + result)
    return result
  }

  def percentOfRowParent(DataColumn datacol) {
    def myset = and(rowNode, columnNode)
    def parentset = and(rowNode?.logicalParent, columnNode)
    percentResult(datacol, myset, parentset)
  }

  def percentOfRow(DataColumn datacol) {
    def myset = and(rowNode, columnNode)
    def parentset = and(rowNode, rowNode?.root)
    percentResult(datacol, myset, parentset)
  }

  def percentOfColumn(DataColumn datacol) {
    def myset = and(rowNode, columnNode)
    def parentset = and(columnNode, rowNode?.root)
    percentResult(datacol, myset, parentset)
  }

  def rank(DataColumn datacol) {
    if (rankColumn == null) {
      rankColumn = new RankingAggregateColumn(datacol, ds)
    }
    if (rowNode || columnNode) {
	    def myset = and(rowNode, columnNode)
	    return rankColumn.getValue(myset)
	} else {
		return rankColumn.getValue(row)
	}
  }


  /**
   * ==================================
   * These are date diff helper methods
   * UPDATE: moved to GroovyColumn.java
   * ==================================
   */
  //note: not using Seconds.secondsBetween(arg1, arg2) due to buffer overflow when date diff > 2^(31) - 1 (max int)
  /*
  def getMilliSeconds(arg1, arg2){
    return (arg1.getMillis() - arg2.getMillis());
  }

  def getSeconds(arg1, arg2){
    long secs = getMilliSeconds(arg1, arg2);
    return (secs / MILLS_PER_SEC).toLong();
  }

  def getMinutes(arg1, arg2){
    def seconds = getSeconds(arg1, arg2);
    return (seconds / SECS_PER_MIN);
  }

  def getHours(arg1, arg2){
    def mins = getMinutes(arg1, arg2);
    return (mins / SECS_PER_MIN);
  }

  def getDays(arg1, arg2){
    def hours = getHours(arg1, arg2);
    return (hours / HOUR_PER_DAY);
  }

  def getWeeks(arg1, arg2){
    def days = getDays(arg1, arg2);
    return (days / DAYS_PER_WK);
  }

  def getMonths(arg1, arg2){
    def days = getDays(arg1, arg2);
    return (days/DAYS_PER_MONTH);
  }

*/
  /**
   * ====================================
   * These are the main date diff methods
   * ====================================
   */
/*
  def dateDiffInSeconds(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def seconds = getSeconds(arg1, arg2)
    return seconds
  }

  def dateDiffInMinutes(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def minutes = getMinutes(arg1, arg2);
    def formattedMins = fm.format(minutes);
    return new BigDecimal(formattedMins);
  }

  def dateDiffInHours(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def hours = getHours(arg1, arg2);
    def formattedMins = fm.format(hours);
    return new BigDecimal(formattedMins);
  }

  def dateDiffInDays(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def days = getDays(arg1, arg2);
    def formattedMins = fm.format(days);
    return new BigDecimal(formattedMins);
  }

  def dateDiffInWeeks(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def weeks = getWeeks(arg1, arg2);
    def formattedMins = fm.format(weeks);
    return new BigDecimal(formattedMins);
  }

  def dateDiffInMonths(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def months = getMonths(arg1, arg2);
    def formattedMins = fm.format(months);
    return new BigDecimal(formattedMins);
  }

  def dateDiffInQuarters(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def months = getMonths(arg1, arg2);
    def formattedMins = fm.format((months/MONTHS_PER_QUART));
    return new BigDecimal(formattedMins);
  }

  def dateDiffInYears(arg1, arg2){
    if (nullCheck(arg1, arg2)){
      return null
    };
    def months = getMonths(arg1, arg2);
    def formattedMins = fm.format((months / MONTHS_PER_YR));
    return new BigDecimal(formattedMins);
  }
*/

  //custom contains method
  def customContains(arg1, list){
    if (nullCheck(list)){
      return false;
    };

    return list.contains(arg1);
  }


  def customDecimalsContains(BigDecimal arg1, list){
    if (nullCheck(list)){
      return false;
    };
    def value = arg1 != null ? arg1.stripTrailingZeros() : arg1;
    return list.contains(value);
  }
  
  // implement testProfileAttribute() in groovy
  // we can assume that user will be the same for the brief life of this object
  def attrMap = [:]

  def getAttrValueList(testAttrName) {
       def list = attrMap.get(testAttrName)
       if (! list) {
           def attrVal = authentication.principal.attributes.find{it.attrName == testAttrName}?.attrValue
           list = attrVal?.split(",").collect{it.trim()}
           attrMap.put(testAttrName, list)
       }
       list
  }

  def testProfileAttribute(value, testAttrName) {
    def list = getAttrValueList(testAttrName)
    def result = list && list.contains(value)
    result
  }

	def psets(TreeNode node) {
	     def n = node;
	     while (n) {
	             p(n.path + ": " + n.set)
	             n = n.parent
	     }
	}
}