package com.demo.controller;

import java.util.Date;
import java.util.List;

import net.sf.json.JSONArray;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cn.dreampie.routebind.ControllerKey;

import com.demo.service.StudentService;
import com.demo.utils.DateUtil;
import com.demo.utils.ResponseUtils;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;

/**
 * 学生controller 层
 * @author chenwj
 *
 */
@ControllerKey(value = "/adminStudent", path = "/view")
public class StudentController extends Controller{
	
	Logger logger = LoggerFactory.getLogger(StudentController.class);
	
	
	private StudentService studentService = new StudentService();
	
	public void index() {
		render("student.html");
	}

	/**
	 * 查询学生信息
	 */
	public void list(){
		Integer start = getParaToInt("start");
		if (start == null) {
			start = -1;
		}
		Integer limit = getParaToInt("limit");
		if (limit == null) {
			limit = -1;
		}
		String sno = getPara("sno");
		String sname = getPara("sname");
		String college_no = getPara("college_no");
		Record wh = new Record();
		wh.set("s_no", sno);
		wh.set("s_name", sname);
		wh.set("college_no", college_no);
		JSONArray dataArr = new JSONArray();
		List<Record> list = studentService.getList(wh,null,start,limit);
		if (list != null && list.size() > 0) {
			for (Record record : list) {
				dataArr.add(record.toJson());
			}
		}
		renderJson(ResponseUtils.buildResp(dataArr.size(), dataArr));
	}
	
	/**
	 * 新增学生信息
	 */
	public void add() {
		
		String s_no = getPara("s_no");
		String s_name = getPara("s_name");
		int sex = getParaToInt("sex");
		Date birth = getParaToDate("birth");
		Date admission_time = getParaToDate("admission_time");
		String college_no = getPara("college_no");
		String college_name = getPara("college_name");
		String birth_place = getPara("birth_place");
		String phone_num = getPara("phone_num");
		
		
		Record record = new Record();
		record.set("s_no", s_no);
		record.set("s_name", s_name);
		record.set("sex", sex);
		record.set("birth", DateUtil.formatDateToYYYYMD(birth));
		record.set("admission_time", DateUtil.formatDateToYYYYMD(admission_time));
		record.set("college_no", college_no);
		record.set("college_name", college_name);
		record.set("birth_place", birth_place);
		record.set("phone_num", phone_num);
		logger.info("The data being save is："+record.toJson());
		
		if(studentService.save(record)){
			renderJson(ResponseUtils.buildResp(true, "保存成功！"));
			return;
		}
		renderJson(ResponseUtils.buildResp(false, "保存失败！"));
	}
	
	
	/**
	 * 修改学生信息
	 */
	public void update(){
		
		int id = getParaToInt("id");
		String s_no = getPara("s_no");
		String s_name = getPara("s_name");
		int sex = getParaToInt("sex");
		Date birth = getParaToDate("birth");
		Date admission_time = getParaToDate("admission_time");
		String college_no = getPara("college_no");
		String college_name = getPara("college_name");
		String birth_place = getPara("birth_place");
		String phone_num = getPara("phone_num");
		
		Record  data = new Record();
		data.set("s_no", s_no);
		data.set("s_name", s_name);
		data.set("sex", sex);
		data.set("birth", DateUtil.formatDateToYYYYMD(birth));
		data.set("admission_time", DateUtil.formatDateToYYYYMD(admission_time));
		data.set("college_no", college_no);
		data.set("college_name", college_name);
		data.set("birth_place", birth_place);
		data.set("phone_num", phone_num);
		
		Record wh = new Record();
		wh.set("id", id);
		
		logger.info("The param is ：" + data.toJson() + "  The condiction is：" + wh.toJson());
		if(studentService.update(data, wh)){
			renderJson(ResponseUtils.buildResp(true, "修改成功！"));
			return;
		}
		render(ResponseUtils.buildResp(false, "修改失败！"));
	}
	
	/**
	 * 批量删除学生信息
	 */
//	@Before(OperationLogInterceptor.class)
	public void delete() {
		String ids = getPara("ids");
		if(StringUtils.isBlank(ids)) {
            renderJson(ResponseUtils.buildResp(false, "删除失败，传入参数为空！"));
            return;
		}
		//打印删除的数据
		List<Record> list = studentService.query(ids);
		if(list != null && list.size() > 0){
			JSONArray arr = new JSONArray();
			for(Record rec: list){
				arr.add(rec.toJson());
			}
			logger.info("The data being delete is: " + arr);
		}
		
		if(studentService.delete(ids)) {
			renderJson(ResponseUtils.buildResp(true, "删除成功！"));
			return;
		}
		renderJson(ResponseUtils.buildResp(false, "删除失败！"));
	}

}
