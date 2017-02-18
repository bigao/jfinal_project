package com.demo.utils;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFHeader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;



/**
 * Excel工具类
 * @author houjt
 *
 */
public class ExcelUtils {
	public static Logger LOGGER = LoggerFactory.getLogger(ExcelUtils.class);

	// 创建工作本
	public static HSSFWorkbook WORKBOOK = null;

	// 创建表
	public static HSSFSheet DEMOSHEET = null;

	// 表头的单元格个数目
	public static  short CELL_NUMBER = 0;

	// 表的索引
	private static int SHEETINDEX = 1;

	// 表中的行数
	private static final int SHEET_ROW_COUNT = 50000;
	/**
	 * 初始化方法
	 * @param fileName
	 */
	public static void init(String sheetName){
		WORKBOOK = new HSSFWorkbook();
		DEMOSHEET = WORKBOOK.createSheet(sheetName);
	}
	/**
	 * 创建表头
	 * 
	 */
	public static void createHeader(Map<String,Object> map) {
		CELL_NUMBER = (short) map.size();
	    HSSFHeader header = DEMOSHEET.getHeader();
	    HSSFRow row = DEMOSHEET.createRow(0);
	    short i = 0;
	    for(Entry<String, Object> entry : map.entrySet()){
	    	HSSFCell cell = row.createCell(i);
	    	cell.setEncoding(HSSFCell.ENCODING_UTF_16);
		    cell.setCellValue(entry.getKey());
		    i++;
	    }
	}
	/**
	 * 创建行
	 */
	public static void createRow(Map<String, Object> map, int rowIndex,String sheetContent) {
		if (rowIndex == SHEET_ROW_COUNT) {
			DEMOSHEET = WORKBOOK.createSheet(sheetContent + SHEETINDEX);
			SHEETINDEX++;
			createHeader(map);
		}
		// 创建第rowIndex行
		HSSFRow row = DEMOSHEET.createRow(rowIndex);
		// 循环创建每行的单元格
		 short i = 0;
		  for (Entry<String, Object> b : map.entrySet()) {  
			  HSSFCell cell = row.createCell(i);
			  cell.setEncoding(HSSFCell.ENCODING_UTF_16);
				String temp = "";
				if (null != b.getValue() || !("".equals(b.getValue()))) {
					try {
						cell.setCellValue(b.getValue().toString());
					} catch (Exception e) {
						cell.setCellValue("");
					}
				} else {
					
				}
			  i++;
		  } 
	}
	/**
	 * 创建Excel
	 * @param list 值
	 */
	public static boolean createExcel(List<Map<String,Object>> list,String sheetContent) {
		try {
			int rowIndex = 1;
			for(int i = 0;i < list.size(); i++){
				Map<String,Object> map = list.get(i);
				if(i == 0){
					createHeader(map);
				}
				createRow(map, rowIndex,sheetContent);
				rowIndex++;
				if ((rowIndex - 1) == SHEET_ROW_COUNT) {
					rowIndex = 1;

				}
				map.clear();
			}
			return true;
		} catch (Exception e) {
			LOGGER.error("",e);
			e.printStackTrace();
			return false;
		}
	}
	/**
	 * 导出Excel
	 * @param outStream
	 * @param list
	 * @param sheetContent sheet的文字描述
	 */
	public static String exportExcel(HttpServletRequest request,List<Map<String,Object>> list,String sheetContent) {
		init(sheetContent);
		try {
			if(createExcel(list,sheetContent)){
				FileOutputStream fileOut = null;
				String filePath = request.getSession().getServletContext().getRealPath("") + "\\download\\order.xls";
				System.out.println("filePath++++++++++++++++==" + filePath);
				fileOut = new FileOutputStream(filePath);  
				WORKBOOK.write(fileOut);
				fileOut.flush();
				fileOut.close();
				WORKBOOK = null;
				return filePath;
			}
			return null;
		} catch (IOException e) {
			LOGGER.error("",e);
			e.printStackTrace();
			return null;
		}
	}
	/**
	 * 写文件至服务器上
	 * @param list
	 * @param sheetContent
	 * @param path
	 * @return
	 */
	public static String writeExcel(List<Map<String,Object>> list,String sheetContent,String path){
		init(sheetContent);
		try {
			if(createExcel(list,sheetContent)){
				FileOutputStream fileOut = null;
				fileOut = new FileOutputStream(path);  
				WORKBOOK.write(fileOut);
				fileOut.flush();
				fileOut.close();
				WORKBOOK = null;
				return path;
			}
			return null;
		} catch (IOException e) {
			LOGGER.error("",e);
			e.printStackTrace();
			return null;
		}
	}
}
