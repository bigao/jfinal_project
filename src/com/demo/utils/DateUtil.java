package com.demo.utils;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

public class DateUtil {
	public static final String StringToDateFormat = "yyyy-MM-dd";
	public static final String StringToDateFormatMDY = "MM/dd/yyyy";
	public static final String StringToDateFormatHH = "yyyy-MM-dd hh:mm:ss";
	public static final String STRINGTODATEFORMATHH2 = "yyyy/MM/dd hh:mm:ss";

	/**
	 * 字符串转为Date工具
	 * 
	 * @param dateStr
	 *            日期字符串
	 * @param formatStr
	 * @return
	 */
	public static Date StringToDate(String dateStr, String formatStr) {
		DateFormat sdf = new SimpleDateFormat(formatStr);
		Date date = null;
		try {
			date = sdf.parse(dateStr);
		} catch (java.text.ParseException e) {
			e.printStackTrace();
		}
		return date;
	}

	/**
	 * 格式化日期字符串 将mm-dd-yyyy格式化为dd-mm-yyyy
	 * 
	 * @param date
	 *            日期字符串:mm-dd-yyyy
	 * @return String dd-mm-yyyy格式的日期字符串
	 */
	public static String FormatDateMDYToDMY(String date) {
		String str[] = date.split("\\/");
		StringBuilder sb = new StringBuilder();
		// 日期非空，则拼接日期
		if (str.length > 1) {
			sb.append(str[1]).append("-").append(str[0]).append("-")
					.append(str[2]);
		}

		return sb.toString();
	}

	/**
	 * 格式化日期字符串 将mm-dd-yyyy格式化为dd-mm-yyyy
	 * 
	 * @param date
	 *            日期字符串:mm-dd-yyyy
	 * @return String dd-mm-yyyy格式的日期字符串
	 */
	public static String FormatDateMDYToYMD(String date) {
		String str[] = date.split("\\/");
		StringBuilder sb = new StringBuilder();
		// 日期非空，则拼接日期
		if (str.length > 1) {
			sb.append(str[2]).append("-").append(str[0]).append("-")
					.append(str[1]);
		}

		return sb.toString();
	}

	/**
	 * 格式化日期 MM/dd/yyyy
	 * 
	 * @param date
	 *            日期对象
	 * @return 日期字符串
	 */
	public static String formatDateToMDY(Date date) {
		SimpleDateFormat sf = new SimpleDateFormat("MM/dd/yyyy");
		return sf.format(date);
	}

	/**
	 * 格式化日期 yyyy/MM/dd
	 * 
	 * @param date
	 *            日期对象
	 * @return 日期字符串
	 */
	public static String formatDateToYMD(Date date) {
		SimpleDateFormat sf = new SimpleDateFormat("yyyy/MM/dd");
		return sf.format(date);
	}

	/**
	 * 时间增加相应的值 1=year;2=month;5=date
	 * 
	 * @param filed
	 *            标示增加的年,月,日
	 * @param offset
	 *            表示增加量
	 * @return
	 */
	public static Date getDateAddOffSet(int filed, int offset) {
		Date date = new Date();
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.add(filed, offset);
		date = c.getTime();
		return date;
	}

	/**
	 * 时间增加相应的值 1=year;2=month;5=date
	 * 
	 * @param filed
	 *            标示增加的年,月,日
	 * @param offset
	 *            表示增加量
	 * @param date
	 *            日期
	 * @return
	 */
	public static Date getDateAddOffSet(int filed, int offset, Date date) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.add(filed, offset);
		date = c.getTime();
		return date;
	}

	/**
	 * 时间增加相应的值 1=year;2=month;5=date
	 * 
	 * @param filed
	 *            标示增加的年,月,日
	 * @param offset
	 *            表示增加量
	 * @param date
	 *            日期
	 * @return
	 */
	// public static String getDateAddOffSet(int filed, int offset, String
	// dateStr) {
	// Calendar c = Calendar.getInstance();
	// c.setTime(StringToDate(dateStr,StringToDateFormat));
	// c.add(filed, offset);
	// Date date = c.getTime();
	// return date;
	// }

	public static long getDateOffset(String begin, String end) {
		Date beginTime = StringToDate(begin, StringToDateFormat);
		Date endTime = StringToDate(end, StringToDateFormat);
		long between = (endTime.getTime() - beginTime.getTime()) / 1000;// 除以1000是为了转换成秒
		long dayCount = between / (24 * 3600);
		return dayCount;
	}

	/**
	 * 获取当前日期属于当年的第几周 周日为每周第一天
	 * 
	 * @param dateStr
	 * @return
	 */
	public static int getWeekOfYear(Date date) {
		Calendar calendar = Calendar.getInstance();
		// 设置周日为每周第一天
		calendar.setFirstDayOfWeek(Calendar.SUNDAY);
		calendar.setTime(date);
		return calendar.get(Calendar.WEEK_OF_YEAR);
	}

	/**
	 * 获取两个日期之间跨越的周数
	 * 
	 * @param startDateStr
	 * @param endDateStr
	 * @return
	 */
	public static int getWeekOffset(String startDateStr, String endDateStr) {
		Calendar start = Calendar.getInstance();
		Calendar end = Calendar.getInstance();
		Date startDate = StringToDate(startDateStr, StringToDateFormatMDY);
		Date endDate = StringToDate(endDateStr, StringToDateFormatMDY);

		start.setTime(startDate);
		end.setTime(endDate);
		int sumSunday = 0;
		if (start.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
			sumSunday = 1;
		}

		while (start.compareTo(end) <= 0) {
			int w = start.get(Calendar.DAY_OF_WEEK);
			if (w == Calendar.SUNDAY)
				sumSunday++;
			// 循环，每次天数加1
			start.set(Calendar.DATE, start.get(Calendar.DATE) + 1);
		}
		return sumSunday;

	}

	/**
	 * 获取两个日期之间跨越的月数
	 * 
	 * @param startDateStr
	 * @param endDateStr
	 * @return
	 */
	public static int getMonthOffset(String startDateStr, String endDateStr) {
		Calendar start = Calendar.getInstance();
		Calendar end = Calendar.getInstance();
		Date startDate = StringToDate(startDateStr, StringToDateFormatMDY);
		Date endDate = StringToDate(endDateStr, StringToDateFormatMDY);

		start.setTime(startDate);
		end.setTime(endDate);
		int beginMonth = start.get(Calendar.MONTH) + 1;
		int endMonth = end.get(Calendar.MONTH) + 1;
		int checkmonth = endMonth - beginMonth
				+ (end.get(Calendar.YEAR) - start.get(Calendar.YEAR)) * 12;
		return checkmonth;
	}

	public static Date getFirstDayOfWeek(Date date) {
		Calendar calendar = Calendar.getInstance();
		calendar.setFirstDayOfWeek(Calendar.SUNDAY);
		calendar.setTime(date);
		calendar.set(Calendar.DAY_OF_WEEK, calendar.getFirstDayOfWeek()); // SUNDAY
		return calendar.getTime();
	}

	/**
	 * 某一个月第一天和最后一天
	 * 
	 * @param date
	 * @return
	 */
	public static Date getFirstdayOfMonth(Date date) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.add(Calendar.DAY_OF_MONTH, 1);
		Date theDate = calendar.getTime();

		GregorianCalendar gcLast = (GregorianCalendar) Calendar.getInstance();
        gcLast.setTime(theDate);
        gcLast.set(Calendar.DAY_OF_MONTH, 1);

		return gcLast.getTime();
	}

	public static Date getLastdayOfMonth(Date date){
		Calendar lastDate = Calendar.getInstance();   
		lastDate.setTime(date);
	       lastDate.set(Calendar.DATE,1);//设为当前月的1号   
	       lastDate.add(Calendar.MONTH,1);//加一个月，变为下月的1号   
	       lastDate.add(Calendar.DATE,-1);//减去一天，变为当月最后一天   
        return lastDate.getTime();
	}
	
	
	public static Date getFirstOfNextMonth(Date date) {
		Calendar lastDate = Calendar.getInstance();
		lastDate.setTime(date);
		lastDate.add(Calendar.MONTH, 1);// 减一个月
		lastDate.set(Calendar.DATE, 1);// 把日期设置为当月第一天
		return lastDate.getTime();
	}

	/**
	 * 格式化日期 yyyy-MM-dd
	 * 
	 * @param date
	 *            日期对象
	 * @return 日期字符串
	 */
	public static String formatDateToYYYYMD(Date date) {
		SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
		return sf.format(date);
	}
	
	/**
	 * 格式化日期 yyyy-MM-dd HH:mm:ss
	 * @param date  日期对象
	 * @return 日期字符串
	 */
	public static String formatDateToStr(Date date) {
		SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		return sf.format(date);
	}
	
	public static void main(String[] args) {
//		System.out.println(getFirstdayOfMonth(
//				StringToDate("2014-4-8", StringToDateFormat)).toString());
//		System.out.println(getLastdayOfMonth(new Date()));
	}

}
