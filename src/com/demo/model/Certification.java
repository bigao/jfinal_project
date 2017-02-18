package com.demo.model;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.tablebind.TableBind;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.Record;

@SuppressWarnings("serial")
@TableBind(tableName = "certification", pkName = "id")
public class Certification extends Model<Certification>{

	public static final Certification dao = new Certification();
	public static final String TABLE = "certification";
	Logger logger = LoggerFactory.getLogger(Certification.class);
	
	
	 /**
     * 批量获取数据
     * @param ids
     * @return
     */
    public List<Record> query(String ids) {
    	String sql  = "SELECT * FROM "+TABLE+" WHERE id IN (" + ids + ")";
    	return Db.find(sql);
    }
	
    /**
     * 批量删除数据
     * @param ids
     * @return
     */
    public boolean delete(String ids) {
    	String sql = "DELETE FROM "+TABLE+" WHERE id IN (" + ids + ")";
    	logger.info("批量删除实名认证配置SQL为："+sql);
		return Db.update(sql) > 0;
    }
    
	
}

