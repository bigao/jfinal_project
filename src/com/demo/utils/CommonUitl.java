package com.demo.utils;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import net.sf.json.JSONArray;

import org.apache.commons.lang.StringUtils;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.Record;

/**
 * 
 * @author hongyi.wang
 * 
 */
public class CommonUitl {
	
	//初始化
	static{
		
	}
	/**
	 * author : why 处理从数据库读取的日期格式 去除 .0 格式 2015-06-10 11:55:16.0 ----->
	 * 2015-06-10 11:55:16
	 * 
	 * @param dateStr
	 * @return
	 */
	public static String formatDateString(String dateStr) {
		if (dateStr.contains(".0")) {
			dateStr = dateStr.substring(0, dateStr.lastIndexOf("."));
			return dateStr;
		}
		return dateStr;
	}

	public static boolean isEmpty(Object obj) {
		String str = String.valueOf(obj);
		return StringUtils.isBlank(str) || "null".equals(str);
	}


	/**
	 * author : why 设置从数据库读取的不同类型值 如果为空则处理不同的类型空值
	 * 
	 * @param model
	 *            对象
	 * @param fieldClassType
	 *            字段类型 如：String.class
	 * @param fieldName
	 *            字段名称
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static Object setExistOrEmptyValue(Model model,
			Class<?> fieldClassType, String fieldName) {

		if (fieldClassType == Integer.class) {
			return CommonUitl.isEmpty(model.getInt(fieldName)) ? "" : model
					.getInt(fieldName);
		} else if (fieldClassType == Double.class) {
			return CommonUitl.isEmpty(model.getDate(fieldName)) ? "" : model
					.getDouble(fieldName);
		} else if (fieldClassType == BigDecimal.class) {
			return CommonUitl.isEmpty(model.getBigDecimal(fieldName)) ? ""
					: model.getBigDecimal(fieldName);
		} else if (fieldClassType == Long.class) {
			return CommonUitl.isEmpty(model.getLong(fieldName)) ? "" : model
					.getLong(fieldName);
		} else if (fieldClassType == Date.class) {
			String dateStr = String.valueOf(model.getDate(fieldName));
			return CommonUitl.isEmpty(dateStr) ? "" : CommonUitl
					.formatDateString(dateStr);
		} else if (fieldClassType == String.class) {
			return CommonUitl.isEmpty(model.getStr(fieldName)) ? "" : model
					.getStr(fieldName);
		}
		return CommonUitl.isEmpty(model.getStr(fieldName)) ? "" : model
				.getStr(fieldName);

	}
	
	
	public static Object setRecordDefaultValue(Record record,
			Class<?> fieldClassType, String fieldName) {

		if (fieldClassType == Integer.class) {
			return CommonUitl.isEmpty(record.getInt(fieldName)) ? "" : record
					.getInt(fieldName);
		} else if (fieldClassType == Double.class) {
			return CommonUitl.isEmpty(record.getDate(fieldName)) ? "" : record
					.getDouble(fieldName);
		} else if (fieldClassType == BigDecimal.class) {
			return CommonUitl.isEmpty(record.getBigDecimal(fieldName)) ? ""
					: record.getBigDecimal(fieldName);
		} else if (fieldClassType == Long.class) {
			return CommonUitl.isEmpty(record.getLong(fieldName)) ? "" : record
					.getLong(fieldName);
		} else if (fieldClassType == Date.class) {
			String dateStr = String.valueOf(record.getDate(fieldName));
			return CommonUitl.isEmpty(dateStr) ? "" : CommonUitl
					.formatDateString(dateStr);
		} else if (fieldClassType == String.class) {
			return CommonUitl.isEmpty(record.getStr(fieldName)) ? "" : record
					.getStr(fieldName);
		}
		return CommonUitl.isEmpty(record.getStr(fieldName)) ? "" : record
				.getStr(fieldName);

	}
	
	/**
	 * 将jfinal中的List<Record> 转为json输出
	 * @param rows
	 * @return
	 */
	public static String getJsonBylistRecord(List<Record> rows) {
		JSONArray array = new JSONArray();
		for (Record row : rows) {
			array.add(row.toJson());
		}

		return array.toString();
	}

	/**
	 * 生成任意长度的字符串
	 * 
	 * @param length
	 * @return
	 */
	public static String getRandomString(int length) {
		String base = UUID.randomUUID().toString().replaceAll("-", "");
		Random random = new Random();
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < length; i++) {
			int number = random.nextInt(base.length());
			sb.append(base.charAt(number));
		}
		return sb.toString();
	}

	
	
	/**
	 * 生成任意长度的字符串
	 * 
	 * @param length
	 * @return
	 */
	public static String getRanStr(int length) {
		String base = "abcdefghijklmnopqrstuvwxyz0123456789";
		Random random = new Random();
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < length; i++) {
			int number = random.nextInt(base.length());
			sb.append(base.charAt(number));
		}
		return sb.toString();
	}
	
}
