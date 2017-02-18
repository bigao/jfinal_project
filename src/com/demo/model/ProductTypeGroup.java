package com.demo.model;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.tablebind.TableBind;

import com.demo.utils.DBJfinal;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Model;

@SuppressWarnings("serial")
@TableBind(tableName = "product_type_group", pkName = "product_type_group_id")
public class ProductTypeGroup extends Model<ProductTypeGroup> {
    /**
     * 创建一级分类对象 
     * 新增一级分类业务ID时 前缀为: ptg
     */
	public static final ProductTypeGroup dao = new ProductTypeGroup();
	public static final String TABLE = "product_type_group";
	Logger logger = LoggerFactory.getLogger(ProductTypeGroup.class);
	
	
	/**
	 * 查询有多少条数据
	 * @return
	 */
	public long getTotalCount(){
		return Db.queryLong("SELECT COUNT(*) FROM "+TABLE);
	}
	
	public List<ProductTypeGroup> getList(){
		String sql = "SELECT * FROM " + TABLE + " ORDER BY weight ASC";
		logger.info("查询商品一级分类的sql:"+sql);
		return dao.find(sql);
	}
	
	/**
	 * 根据一级分类名称查询
	 * @param name
	 * @return
	 */
	public ProductTypeGroup findByName(String name){
		return dao.findFirst("SELECT * FROM "+ TABLE + " WHERE name = '"+name + "'");
	}
}
