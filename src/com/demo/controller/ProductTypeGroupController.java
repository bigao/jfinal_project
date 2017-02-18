package com.demo.controller;

import java.util.List;

import net.sf.json.JSONArray;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.routebind.ControllerKey;

import com.demo.model.ProductTypeGroup;
import com.demo.service.ProductTypeGroupService;
import com.jfinal.core.Controller;

@ControllerKey(value = "/adminProductTypeGroup", path = "/view")
public class ProductTypeGroupController extends Controller {
	Logger logger = LoggerFactory.getLogger(ProductTypeGroupController.class);

	private static ProductTypeGroupService ptgService = new ProductTypeGroupService();

	public void index() {
		render("admin_product_type_group.html");
	}

	/**
	 * 查询数据
	 */
	public void getList() {
	    long totalCount = ptgService.getTotalCount();
	    JSONArray dataArr = new JSONArray();
	    if(totalCount > 0) {
	        List<ProductTypeGroup> ptgList = ptgService.getList();
	        if(ptgList != null && ptgList.size() > 0){
	        	for(ProductTypeGroup ptg: ptgList){
	        		dataArr.add(ptg.toJson());
	        	}
	        }
	    }
	    setAttr("total_count", totalCount);
	    setAttr("data", dataArr);
        renderJson();
	}


}
