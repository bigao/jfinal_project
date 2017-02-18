package com.demo.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.Channel;
import com.demo.utils.DBJfinal;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

/**
 * 渠道信息
 * 
 * @author hongyi.wang
 * 
 */
public class ChannelService {

	public static final String TABLE = "channel";
	Logger logger = LoggerFactory.getLogger(ChannelService.class);


	/**
	 * 查询渠道数量
	 * @return 
	 */
	public long getTotalCount() {
		return Channel.dao.getTotalCount();
	}

	/**
	 * 查询所有渠道
	 * @return
	 */
	public List<Channel> getList() {
		return Channel.dao.getList();
	}

    /**
     * 根据渠道名称查询
     * @param channelName
     * @return
     */
    public Channel findByName(String channelName){
    	return Channel.dao.findByName(channelName);
    }
    
}
