package com.demo.service;

import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.Student;
import com.demo.utils.DBJfinal;
import com.jfinal.plugin.activerecord.Record;
/**
 * 学生 service 层
 * @author chenwj
 *
 */
public class StudentService {
	
	public static final String TABLE = "student";
	Logger logger = LoggerFactory.getLogger(StudentService.class);
	
	/**
	 * 根据id查询记录
	 * @param id
	 * @return
	 */
	public Student findById(int id) {
		return Student.dao.findById(id);
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
	public List<Record> getList(Record wh,Record like,int start,int limit){
		logger.info(wh.toJson());
		return DBJfinal.use(TABLE).all(wh, like, start, limit);
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
    	return Student.dao.query(ids);
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
		return Student.dao.delete(ids);
    }
    
    /**
     * 修改数据
     */
    public boolean update(Record data, Record wh){
    	return new DBJfinal(TABLE).update(data, wh) > 0;
    }
    
}
