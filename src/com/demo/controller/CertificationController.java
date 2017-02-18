package com.demo.controller;

import java.util.List;

import net.sf.json.JSONArray;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.routebind.ControllerKey;

import com.demo.model.Certification;
import com.demo.model.Channel;
import com.demo.model.ProductTypeGroup;
import com.demo.service.CertificationService;
import com.demo.service.ChannelService;
import com.demo.service.ProductTypeGroupService;
import com.demo.utils.Times;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;

/**
 * 实名认证配置controller 层
 * @author chenwj
 *
 */
@ControllerKey(value = "/adminCertification", path = "/view")
public class CertificationController extends Controller{
	
	Logger logger = LoggerFactory.getLogger(CertificationController.class);
	
	private CertificationService certificationService = new CertificationService();
	private ProductTypeGroupService ptgService = new ProductTypeGroupService();
	private ChannelService channelService = new ChannelService();
	
	public void index() {
		render("admin_certification.html");
	}

	/**
	 * 查询数据
	 */
	public void getList(){
		Integer start = getParaToInt("start");
		if (start == null) {
			start = -1;
		}
		Integer limit = getParaToInt("limit");
		if (limit == null) {
			limit = -1;
		}
		String product_type_group_name = getPara("ptg_name");
		String channel_name = getPara("channel_name");
		String status = getPara("status");
		Record wh = new Record();
		if(StringUtils.isNotBlank(product_type_group_name)){
			wh.set("product_type_group_name", product_type_group_name);
		}
		if(StringUtils.isNotBlank(channel_name)){
			wh.set("channel_name", channel_name);
		}
		if(StringUtils.isNotBlank(status)){
			wh.set("status", status);
		}
		Record order = new Record();
		order.set("id", "desc");
		long totalCount = certificationService.getTotalCount(wh); 
		JSONArray dataArr = new JSONArray();
		if(totalCount > 0) {
			List<Record> list = certificationService.getList(wh,null,null,order,start,limit);
			if (list != null && list.size() > 0) {
				for (Record record : list) {
					dataArr.add(record.toJson());
				}
			}
		}
		setAttr("total_count", totalCount);
		setAttr("data", dataArr);
		renderJson();
	}
	
	/**
	 * 新增对象
	 */
//	@Before(OperationLogInterceptor.class)
	public void add() {
		String productTypeGroupName = getPara("product_type_group_name");
		String channelId = getPara("channel_id");
		String channelName = getPara("channel_name");
		int status = getParaToInt("status");
		String remark = getPara("remark");
		
		//用一级分类名称查一级分类ID
		ProductTypeGroup productTypeGroup = ptgService.findByName(productTypeGroupName);
		int productTypeGroupId = productTypeGroup.get("product_type_group_id");
		
		Record record = new Record();
		record.set("product_type_group_id", productTypeGroupId);
		record.set("product_type_group_name", productTypeGroupName);
		record.set("channel_id", channelId);
		record.set("channel_name", channelName);
		record.set("status", status);
		record.set("create_time", Times.now());
		record.set("update_time", Times.now());
		record.set("remark", remark);
		try{
			logger.info("参数为："+record.toJson());
			certificationService.save(record);
		}catch(Exception e){
			e.printStackTrace();
			setAttr("success", false);
			setAttr("msg", "保存失败!");
			renderJson();
			return;
		}
		setAttr("success", true);
		setAttr("msg", "保存成功!");
		renderJson();
	}
	
	/**
	 * 批量删除对象
	 */
//	@Before(OperationLogInterceptor.class)
	public void delete() {
		String ids = getPara("ids");
		if(StringUtils.isBlank(ids)) {
			setAttr("success", false);
            setAttr("msg","删除失败，传入参数为空!");
            renderJson();
            return;
		}
		//删除之前先打个日志，误删时可以恢复
		List<Record> list = certificationService.query(ids);
		if(null == list || list.size() <= 0) {
			setAttr("success", false);
			setAttr("msg","删除失败，通过主键获取即将删除的数据为空!");
			renderJson();
			return;
		}
		JSONArray arr = new JSONArray();
		for (Record rec : list) {
			arr.add(rec.toJson());
		}
		logger.info("The certification data being deleted is: " + arr);
		if(certificationService.delete(ids)) {
			setAttr("success", true);
			setAttr("msg","删除成功!");
			renderJson();
			return;
		}
		setAttr("success", false);
		setAttr("msg","删除失败!");
		renderJson();
		return;
	}
	
	/**
	 * 修改对象
	 */
//	@Before(OperationLogInterceptor.class)
	public void update(){
		int id = getParaToInt("id");
		String productTypeGroupName = getPara("product_type_group_name");
		String channelName = getPara("channel_name");
		int status = getParaToInt("status");
		String remark = getPara("remark");
		
		//根据商品一级分类名称查商品一级分类ID
		ProductTypeGroup productTypeGroup = ptgService.findByName(productTypeGroupName);
		int productTypeGroupId = productTypeGroup.get("product_type_group_id");
		//根据渠道名称查渠道ID
		Channel channel = channelService.findByName(channelName);
		String channelId = channel.get("channel_id");
		
		//打印修改前的数据
		Certification cer = certificationService.findById(id);
		logger.info("修改的原记录为: "+cer.toJson());
		
		Record data = new Record();
		data.set("product_type_group_id", productTypeGroupId);
		data.set("product_type_group_name", productTypeGroupName);
		data.set("channel_id", channelId);
		data.set("channel_name", channelName);
		data.set("update_time", Times.now());
		data.set("status", status);
		data.set("remark", remark);
		
		Record wh = new Record();
		wh.set("id", id);
		try{
			logger.info("参数为："+data.toJson()+"  条件为："+wh.toJson());
			if(!certificationService.update(data, wh)) {
				setAttr("success", false);
				setAttr("msg", "保存失败，数据库异常!");
				renderJson();
				return;
			}
		}catch(Exception e) {
			e.printStackTrace();
			setAttr("success", false);
			setAttr("msg", "保存失败，后台异常!");
			renderJson();
			return;
		}
		setAttr("success", true);
		setAttr("msg", "保存成功!");
		renderJson();
	}

}
