package com.demo.model;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.tablebind.TableBind;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Model;

@SuppressWarnings("serial")
@TableBind(tableName = "channel", pkName = "id")
public class Channel extends Model<Channel> {
	
    public static final Channel dao = new Channel();
    public static final String TABLE = "channel";
    Logger logger = LoggerFactory.getLogger(Channel.class);
    
    /**
     * 查询渠道数量
     * @return
     */
    public long getTotalCount() {
	    String sql = "SELECT COUNT(*) FROM " + TABLE;
		logger.info("统计渠道对象数量sql： "+sql);
		return Db.queryLong(sql);
	}
    
    /**
	 * 查询所有渠道
	 * @return
	 */
    public List<Channel> getList(){
    	String sql = "SELECT * FROM " + TABLE + " ORDER BY weight ASC";
		logger.info("查询渠道列表sql： "+sql);
		return dao.find(sql);
    }
    
    /**
     * 根据渠道名称查询
     * @param channelName
     * @return
     */
    public Channel findByName(String channelName){
    	String sql = "SELECT * FROM " + TABLE + " WHERE channel_name = '"+channelName+"'";
    	logger.info("根据渠道名称查询的sql:"+sql);
    	return dao.findFirst(sql);
    }
    
}
