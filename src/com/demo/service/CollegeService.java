package com.demo.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.College;
/**
 * 实名认证配置 service 层
 * @author Administrator
 *
 */
public class CollegeService {
	
	Logger logger = LoggerFactory.getLogger(CollegeService.class);
	
	/**
	 * 根据id查询记录
	 * @param id
	 * @return
	 */
	public College findById(int id) {
		return College.dao.findById(id);
	}
	
	
	/**
	 * 查询有多少条记录
	 * @param wh
	 * @return
	 */
	public long getTotalCount() {
		return College.dao.getTotalCount();
	}
	
	/**
	 * 查询所有数据
	 * @param wh
	 * @return
	 */
	public List<College> getList(){
		return College.dao.getList();
	}

    
}
