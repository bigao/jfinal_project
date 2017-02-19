package com.demo.controller;

import java.util.List;

import net.sf.json.JSONArray;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.routebind.ControllerKey;

import com.demo.model.College;
import com.demo.service.CollegeService;
import com.demo.utils.ResponseUtils;
import com.jfinal.core.Controller;

/**
 * 学院 controller 层
 * @author chenwj
 *
 */
@ControllerKey(value = "/adminCollege", path = "/view")
public class CollegeController extends Controller{
	
	Logger logger = LoggerFactory.getLogger(CollegeController.class);
	private CollegeService collegeService = new CollegeService();
	
	
	public void index() {
		render("college.html");
	}

	/**
	 * 查询数据
	 */
	public void list(){
		JSONArray dataArr = new JSONArray();
		List<College> list = collegeService.getList();
		if (list != null && list.size() > 0) {
			for (College college : list) {
				dataArr.add(college.toJson());
			}
		}
		renderJson(ResponseUtils.buildResp(dataArr.size(), dataArr));
	}
	

}
