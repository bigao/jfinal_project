package com.demo.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Times {
	
	private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	
	
	public static String now(){
		return sdf.format(new Date(System.currentTimeMillis()));
	}
	
	public static String now(String format){
		SimpleDateFormat f = new SimpleDateFormat(format);
		return f.format(new Date(System.currentTimeMillis()));
	}
	
	public static String getTimeStr(Date date){
		return sdf.format(date);
	}
	/**
	 * 比较时间是否在指定时间范围内
	 * @param begTime 开始时间
	 * @param endTime 结束时间
	 * @param checkTime 验证时间
	 * @return true 在指定时间范围内， false不在指定时间范围内
	 */
	public static boolean inTimeArea(String begTime, String endTime, String checkTime){
		try{
			Date beg = sdf.parse(begTime);
			Date end = sdf.parse(endTime);
			Date check = sdf.parse(checkTime);
			return (beg.before(check) && end.after(check));
		}catch(Exception e){
			return false;
		}
	}
	
	public static String addDay(String time, int days){
		try{
			Date d = sdf.parse(time);
			long t = d.getTime();
			t += days * 24 * 3600 * 1000L;
			return getTimeStr(new Date(t));
		}catch(Exception e){
			return "";
		}
		
	}
	
	public static long getLongTimes(String time){
		Date d;
		try {
			d = sdf.parse(time);
			long t = d.getTime();
			return t;
		} catch (ParseException e) {
			return 0;
		}
	}
	
	public static String getTimeStr(long t){
		return getTimeStr(new Date(t)); 
	}
	/**
	 * 格式为 yyyy-MM-dd 转成yyyy-MM-dd 23:59:59
	 * @param TimesStr
	 * @return
	 */
	public static String getTimeStrToDayLast(String TimesStr){
		SimpleDateFormat s = new SimpleDateFormat("yyyy-MM-dd");
		try {
			Date date = s.parse(TimesStr);
			date.setHours(23);
		    date.setMinutes(59);
		    date.setSeconds(59);
			return sdf.format(date);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			return TimesStr;
		}
		
	}
	/**
	 * 判断比较的时间是否在当前时间后
	 * @param checkTime 比较的时间
	 * @param nowTime 当前时间
	 * @return
	 */
	public static boolean afterNowTime(String checkTime, String nowTime){
		try {
			Date time = sdf.parse(checkTime);
			Date now = sdf.parse(nowTime);
			return time.after(now);
		} catch (ParseException e) {
			return false;
		}
		
	}
}
