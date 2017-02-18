package com.demo.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.ProductTypeGroup;




/**
 * 商品一级分类
 * @author chenwj
 *
 */
public class ProductTypeGroupService{
    
	public static final String TABLE = "product_type_group";
	Logger logger = LoggerFactory.getLogger(ProductTypeGroupService.class);
	
	/**
	 * 查询有多少条数据
	 * @return
	 */
	public long getTotalCount(){
		return ProductTypeGroup.dao.getTotalCount();
	}
	
	/**
	 * 查询数据
	 * @return
	 */
	public List<ProductTypeGroup> getList(){
		return ProductTypeGroup.dao.getList();
	}
	
	/**
	 * 根据一级分类名称查询
	 * @param channelName
	 * @return
	 */
    public ProductTypeGroup findByName(String name){
    	return ProductTypeGroup.dao.findByName(name);
    }
    
}
