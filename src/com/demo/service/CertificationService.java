package com.demo.service;

import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.Certification;
import com.demo.utils.DBJfinal;
import com.jfinal.plugin.activerecord.Record;
/**
 * 实名认证配置 service 层
 * @author Administrator
 *
 */
public class CertificationService {
	
	public static final String TABLE = "certification";
	Logger logger = LoggerFactory.getLogger(CertificationService.class);
	
	/**
	 * 根据id查询记录
	 * @param id
	 * @return
	 */
	public Certification findById(int id) {
		return Certification.dao.findById(id);
	}
	
	
	/**
	 * 查询有多少条记录
	 * @param wh
	 * @return
	 */
	public long getTotalCount(Record wh) {
		return DBJfinal.use(TABLE).getTotal(wh);
	}
	
	/**
	 * 根据条件查询数据
	 * @param wh
	 * @param like
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Record> getList(Record wh,Record like,Record in,Record order,int start,int limit){
		logger.info(wh.toJson());
		return DBJfinal.use(TABLE).all(wh, like, in, order, start, limit);
	}
	
	
    /**
     * 添加数据
     * @param record
     * @return
     */
    public boolean save(Record record) {
		return DBJfinal.use(TABLE).save(record);
	}
    
    /**
     * 批量获取数据
     * @param ids
     * @return
     */
    public List<Record> query(String ids) {
    	if(StringUtils.isEmpty(ids)) {
    		return null;
    	}
    	return Certification.dao.query(ids);
    }
    
    /**
     * 批量删除数据
     * @param ids
     * @return
     */
    public boolean delete(String ids) {
    	if(StringUtils.isEmpty(ids)) {
    		return false;
    	}
		return Certification.dao.delete(ids);
    }
    
    /**
     * 修改数据
     */
    public boolean update(Record data, Record wh){
    	return new DBJfinal(TABLE).update(data, wh) > 0;
    }
    
}
