package com.demo.utils;

import net.sf.json.JSONObject;

import com.jfinal.core.Controller;

public class ResponseUtils {
	public static String page(String title, String entry_js, Controller model){
		model.setAttr("title", title);
		model.setAttr("module_path", entry_js);
		
		//解析entry_js得到module的名字，按.分最后一个字段便是
		String[] ss = entry_js.split("\\.");
		model.setAttr("module", ss[ss.length-1]);
		
		model.setAttr("param", model.getParaMap());
		System.out.println(model.getPara("param"));
		return "index.html";
	}
	
	public static String buildResp(boolean succ, String msg){
		JSONObject obj = new JSONObject();
		obj.put("success", succ);
		obj.put("msg", msg);
		return obj.toString();
	}
	
	public static String buildResp(boolean succ, String msg, Object data){
		JSONObject obj = new JSONObject();
		obj.put("success", succ);
		obj.put("msg", msg);
		obj.put("data", data);
		return obj.toString();
	}
	
	public static String buildResp(int total, Object data){
		JSONObject obj = new JSONObject();
		obj.put("total", total);
		obj.put("data", data);
		return obj.toString();
	}
}
