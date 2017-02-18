package com.demo.model;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.tablebind.TableBind;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Model;

@SuppressWarnings("serial")
@TableBind(tableName = "college", pkName = "id")
public class College extends Model<College>{

	public static final College dao = new College();
	public static final String TABLE = "college";
	Logger logger = LoggerFactory.getLogger(College.class);
	
    
    /**
     * 查询渠道数量
     * @return
     */
    public long getTotalCount() {
	    String sql = "SELECT COUNT(*) FROM " + TABLE;
		logger.info("统计学院数量sql： "+sql);
		return Db.queryLong(sql);
	}
    
    /**
	 * 查询所有渠道
	 * @return
	 */
    public List<College> getList(){
    	String sql = "SELECT * FROM " + TABLE ;
		logger.info("查询学院sql： "+sql);
		return dao.find(sql);
    }
    
	
	
}

