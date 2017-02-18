package com.demo.controller;

import java.util.List;

import net.sf.json.JSONArray;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.routebind.ControllerKey;

import com.demo.model.Channel;
import com.demo.service.ChannelService;
import com.jfinal.core.Controller;
@ControllerKey(value = "/adminChannel", path = "/view")
public class ChannelController extends Controller {
	Logger logger = LoggerFactory.getLogger(ChannelController.class);

	private static ChannelService channelService = new ChannelService();

	public void index() {
		render("admin_channel.html");
	}

	/**
	 * 查询所有数据
	 */
	public void getList() {
		long totalCount = channelService.getTotalCount();
		JSONArray dataArr = new JSONArray();
		if (totalCount > 0) {
			List<Channel> channelList = channelService.getList();
			if (channelList != null && channelList.size() > 0) {
				for (Channel g : channelList) {
					dataArr.add(g.toJson());
				}
			}
		}
		setAttr("total_count", totalCount);
		setAttr("data", dataArr);
		renderJson();
	}
	
	
	
}
