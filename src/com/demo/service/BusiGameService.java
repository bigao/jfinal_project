package com.demo.service;

import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.demo.model.BusiGame;
import com.demo.utils.DBJfinal;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
/**
 * 业务游戏 service 层
 * @author Administrator
 *
 */
public class BusiGameService {
	
	public static final String TABLE = "busi_game";
	Logger logger = LoggerFactory.getLogger(BusiGameService.class);
	
	/**
	 * 查询有多少条记录
	 * @param params 查询参数
	 * @return
	 */
	public long getTotalCount(Map<String, Object> params) {
		StringBuffer sqlBuf = new StringBuffer("SELECT COUNT(1) FROM ").append(TABLE).append(" WHERE 1 = 1 ");
		//添加查询条件的参数
	    if(params.containsKey("game_type")) {
            sqlBuf.append(" AND game_type like '%" + params.get("game_type")+"%' ");
        }
	    if(params.containsKey("game_id")) {
            sqlBuf.append(" AND game_id like '%" + params.get("game_id")+"%' ");
        }
	    if(params.containsKey("game_name")) {
            sqlBuf.append(" AND game_name like '%" + params.get("game_name")+"%' ");
        }
		logger.debug("执行busigame列表数量sql： "+sqlBuf.toString());
		return Db.queryLong(sqlBuf.toString());
	}
	
	/**
	 * 根据条件查询数据
	 * @param params 查询参数
	 * @param start 起始位置
	 * @param limit 查询范围
	 * @return
	 */
	public List<BusiGame> list(Map<String, Object> params, int start, int limit) {
		StringBuffer sqlBuf = new StringBuffer("SELECT * FROM ").append(TABLE).append(" WHERE 1 = 1 ");
		if(params.containsKey("game_type")) {
            sqlBuf.append(" AND game_type like '%" + params.get("game_type")+"%'");
        }
		if(params.containsKey("game_id")) {
            sqlBuf.append(" AND game_id like '%" + params.get("game_id")+"%'");
        }
		if(params.containsKey("game_name")) {
            sqlBuf.append(" AND game_name like '%" + params.get("game_name")+"%'");
        }
	    sqlBuf.append(" order by id desc ");
		if(start != -1 && limit != -1){
			sqlBuf.append(" LIMIT ").append(start).append(", ").append(limit);
		}
		logger.info("执行busigame对象列表sql： "+sqlBuf.toString());
		return BusiGame.dao.find(sqlBuf.toString());
	}
	
	/**
	 * 根据条件查询数据，并将结果转换为JSONArray格式返回
	 * @param params 查询参数
	 * @param start 起始位置
	 * @param limit 查询范围
	 * @return
	 */
	public JSONArray listArr(Map<String, Object> params, int start, int limit) {
		JSONArray dataArr = new JSONArray();
		List<BusiGame> busiGames = this.list(params, start, limit);
		if(null == busiGames || busiGames.size() <= 0) {
			return dataArr;
		}
		for(BusiGame busiGame : busiGames) {
			//busi_game表中字段file_size、down_url存在空值，将空值设为空串，不然转化为JSON对象时会报空异常
			String file_size = busiGame.get("file_size");
			String down_url = busiGame.get("down_url");
			if(file_size == null){
				busiGame.set("file_size", "");
			}
			if(down_url == null){
				busiGame.set("down_url", "");
			}
			dataArr.add(busiGame.toJson());
		}
		return dataArr;
	}
	
	public BusiGame get(int id) {
		if(id <= 0) {
			logger.error("通过主键获取BusiGame时主键id<=0");
			return null;
		}
		return BusiGame.dao.findById(id);
	}
	
	public boolean saveReturnRecord(Record record){
		return new DBJfinal(TABLE).save(record);
	}

}
