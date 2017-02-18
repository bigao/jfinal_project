package com.demo.controller;

import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.BusiGame;
import com.demo.service.BusiGameService;
import com.jfinal.core.Controller;

/**
 * 业务游戏 controller 层
 * @author chenwj
 *
 */
public class BusiGameController extends Controller{
	
	Logger logger = LoggerFactory.getLogger(BusiGameController.class);
	
	private BusiGameService busiGameService = new BusiGameService();
	
	public void index() {
		render("admin_busi_game.html");
	}

	/**
	 * 根据条件查询主题
	 */
	public void list() {
		Integer start = getParaToInt("start");
		if (start == null) {
			start = -1;
		}
		Integer limit = getParaToInt("limit");
		if (limit == null) {
			limit = -1;
		}
		//添加查询条件的参数
		Map<String, Object> queryMap = new HashMap<String, Object>(); 
		String game_type = getPara("game_type");
		String game_id = getPara("game_id");
		String game_name = getPara("game_name");
		if(!StringUtils.isBlank(game_type)) {
			queryMap.put("game_type", game_type);
		}
		if(!StringUtils.isBlank(game_id)) {
			queryMap.put("game_id", game_id);
		}
		if(!StringUtils.isBlank(game_name)) {
			queryMap.put("game_name", game_name);
		}
		long totalCount = busiGameService.getTotalCount(queryMap); 
		JSONArray dataArr = new JSONArray();
		if(totalCount > 0) {
			dataArr = busiGameService.listArr(queryMap, start, limit); 
		}
		setAttr("total_count", totalCount);
		setAttr("data", dataArr);
		renderJson();
	}
	
	public void get() {
		int id = getParaToInt("id");
		BusiGame busiGame = busiGameService.get(id);
		if(null == busiGame) {
			setAttr("success", false);
			setAttr("msg", "查询失败!");
			renderJson();
			return;
		}
		JSONObject baObj = JSONObject.fromObject(busiGame.toJson());
		setAttr("success", true);
		setAttr("msg", "查询成功!");
		setAttr("data", baObj);
		renderJson();
	}

}
