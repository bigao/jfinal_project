package com.demo.controller;

import java.util.List;

import net.sf.json.JSONArray;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.routebind.ControllerKey;

import com.demo.model.Certification;
import com.demo.model.Channel;
import com.demo.model.College;
import com.demo.model.ProductTypeGroup;
import com.demo.service.CertificationService;
import com.demo.service.ChannelService;
import com.demo.service.CollegeService;
import com.demo.service.ProductTypeGroupService;
import com.demo.utils.Times;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;

/**
 * 实名认证配置controller 层
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
		long totalCount = collegeService.getTotalCount(); 
		JSONArray dataArr = new JSONArray();
		if(totalCount > 0) {
			List<College> list = collegeService.getList();
			if (list != null && list.size() > 0) {
				for (College college : list) {
					dataArr.add(college.toJson());
				}
			}
		}
		setAttr("total_count", totalCount);
		setAttr("data", dataArr);
		renderJson();
	}
	

}
