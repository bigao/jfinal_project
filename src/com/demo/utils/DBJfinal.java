package com.demo.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import net.sf.json.JSONArray;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;










import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.DbPro;
import com.jfinal.plugin.activerecord.Record;

/**
 * 
 * @author chenwj
 *
 */
public class DBJfinal {
	
	private String tableName = "";
	private DbPro db = null;
	Logger logger = LoggerFactory.getLogger(DBJfinal.class);
	
	private String lastSql = "";
	private Object[] lastParams = null;
	
	public DBJfinal(String tableName){
		this.db = Db.use("default");
		this.tableName = tableName;
	}
	public DBJfinal(DbPro db, String tableName){
		this.db = db;
		this.tableName = tableName;
	}
	public static TreeMap<String, DBJfinal> cache = new TreeMap<>();
	/**
	 *  这里为配置了不同的数据源用
	 * @param configName 
	 * @param tableName
	 * @return
	 */
	public static DBJfinal use(String configName, String tableName){
		String key = configName+tableName;
		
		DBJfinal db = cache.get(key);
		if(db == null){
			db = new DBJfinal(Db.use(configName), tableName);
			cache.put(key, db);
		}
		return db;
	}
	/**
	 * 使用默认的数据源 com.jfinal.plugin.activerecord.Db; Db.use("default")
	 * @param tableName
	 * @return
	 */
	public static DBJfinal use(String tableName){
		String key = tableName;
		DBJfinal db = cache.get(key);
		if(db == null){
			db = new DBJfinal(tableName);
			cache.put(key, db);
		}
		return db;
	}
	
	
	/**
	 * 保存最后一次执行的sql
	 * @param sql
	 * @param params
	 */
	private void saveLastSql(String sql, Object[] params){
		this.lastSql = sql;
		this.lastParams = params;
	}
	
	/**
	 * 返回符合条件的第一条数据
	 * @param wh
	 * @return
	 */
	public Record findFirst(Record wh){
		return findFirst(wh, null);
	}
	
	/**
	 * 返回符合条件的第一条数据
	 * @param wh
	 * @param like
	 * @return
	 */
	public Record findFirst(Record wh, Record like){
		return findFirst(wh, like, null);
	}
	
	/**
	 * 返回符合条件的第一条数据
	 * @param wh
	 * @param like
	 * @param in
	 * @return
	 */
	public Record findFirst(Record wh, Record like, Record in){
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT * FROM `").append(tableName.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		sql.append(getWhereSql(wh, like, in ,paras).toString());
		return db.findFirst(sql.toString(), paras.toArray());
	}
	
	/**
	 * 查询列表
	 * @param wh 
	 * @return
	 */
	public List<Record> all(Record wh){
		return all(wh, null);
	}
	
	/**
	 * 查询列表
	 * @param wh 
	 * @param like 
	 * @return
	 */
	public List<Record> all(Record wh, Record like){
		return all(wh, like, null);
	}
	
	/**
	 * 查询列表
	 * @param wh 
	 * @param like 
	 * @param in
	 * @return
	 */
	public List<Record> all(Record wh, Record like,Record in){
		return all(wh, like, in, null);
	}
	
	/**
	 * 查询列表
	 * @param wh
	 * @param like
	 * @param in
	 * @param order
	 * @return
	 */
	public List<Record> all(Record wh, Record like,Record in,Record order){
		return all(wh, like, in, order, null, null);
	}
	
	/**
	 * 查询列表
	 * @param wh
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Record> all(Record wh, Integer start, Integer limit){
		return all(wh, null, start, limit);
	}
	
	/**
	 * 查询列表
	 * @param wh
	 * @param like
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Record> all(Record wh, Record like, Integer start, Integer limit){
		return all(wh, like, null, start, limit);
	}
	
	/**
	 * 查询列表
	 * @param wh
	 * @param like
	 * @param in
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Record> all(Record wh, Record like, Record in, Integer start, Integer limit){
		return all(wh, like, in, null, start, limit);
	}
	
	/**
	 * 查询列表
	 * @param wh
	 * @param like
	 * @param in
	 * @param order
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Record> all(Record wh, Record like, Record in, Record order, Integer start, Integer limit){
		StringBuffer sql = new StringBuffer();
		List<Object> paras = new ArrayList<>();
		sql.append("SELECT * FROM `").append(tableName.trim()).append("` ");
		sql.append(getWhereSql(wh, like, in, paras).toString());
		sql.append(getOrderBySql(order));
		if(start != null){
			sql.append(" LIMIT ").append(start);
		}
		if(start != null && limit != null){
			sql.append(" ,").append(limit);
		}
		if(start == null && limit != null){
			sql.append(" LIMIT").append(limit);
		}
		//保存最后一次执行的sql
		saveLastSql(sql.toString(), paras.toArray());
		logger.info("------------>> sql:"+sql);
		logger.info("------------>> paras:"+paras);
		return db.find(sql.toString(), paras.toArray());
	}
	
	/**
	 * 查询数量
	 * @param wh
	 * @return
	 */
	public Long getTotal(Record wh){
		return getTotal(wh, null);
	}
	/**
	 * 查询数量
	 * @param wh
	 * @param like
	 * @return
	 */
	public Long getTotal(Record wh, Record like){
		return getTotal(wh,like,null);
	}
	
	/**
	 * 查询数量
	 * @param wh
	 * @param like
	 * @param in
	 * @return
	 */
	public Long getTotal(Record wh, Record like, Record in){
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT COUNT(1) FROM `").append(tableName.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		sql.append(getWhereSql(wh, like, in, paras).toString());
		//保存最后一次执行的sql
		saveLastSql(sql.toString(), paras.toArray());
		logger.info("------------>> sql:"+sql);
		logger.info("------------>> paras:"+paras);
		return db.queryLong(sql.toString(), paras.toArray());
	}
	
	/**
	 * 更新数据
	 * @param data 
	 * @param wh
	 * @return
	 */
	public int update(Record data, Record wh){
		return update(data, wh, null);
	}
	
	/**
	 * 更新数据 
	 * @param data
	 * @param wh
	 * @param like
	 * @return
	 */
	public int update(Record data, Record wh, Record like){
		return update(data, wh, like, null);
	}
	
	/**
	 * 更新数据
	 * @param data
	 * @param wh
	 * @param like
	 * @param in
	 * @return
	 */
	public int update(Record data, Record wh, Record like, Record in){
		StringBuffer sql = new StringBuffer();
		List<Object> paras = new ArrayList<>();
		sql.append("update `").append(tableName.trim()).append("` set ");
		for (Entry<String, Object> e: data.getColumns().entrySet()) {
			String colName = e.getKey();
			if (paras.size() > 0) {
				sql.append(", ");
			}
			sql.append("`").append(colName).append("` = ? ");
			paras.add(e.getValue());
		}
		sql.append(getWhereSql(wh, like, in, paras).toString());
		logger.info("------------>> sql:"+sql);
		logger.info("------------>> paras:"+paras);
		return db.update(sql.toString(), paras.toArray());
	}
	
	/**
	 * 新增数据
	 * @param record
	 * @return
	 */
	public boolean save(Record record){
		logger.info("------------>> record:" + record.toJson());
		return db.save(tableName, record);
	}
	
	/**
	 * 删除数据 
	 * @param wh
	 * @return
	 */
	public int delete(Record wh){
		return delete(wh, null);
	}
	
	/**
	 * 删除数据
	 * @param wh
	 * @param like
	 * @return
	 */
	public int delete(Record wh, Record like){
		return delete(wh, like, null);
	}
	
	/**
	 * 删除数据
	 * @param wh
	 * @param like
	 * @param in
	 * @return
	 */
	public int delete(Record wh, Record like, Record in){
		
		//打印删除的数据
		List<Record> records = all(wh, like, in);
		JSONArray arr = new JSONArray();
		for (Record rec : records) {
			arr.add(rec.toJson());
		}
		logger.info("-----The data being deleted is------->>" + arr);
		
		StringBuffer sql = new StringBuffer();
		sql.append("DELETE FROM `").append(tableName.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		String where = getWhereSql(wh, like, in, paras);
		//如果where条件为空 不执行删除
		if(StringUtils.isBlank(where)) 
			return 0;
		sql.append(where);
		return db.update(sql.toString(), paras.toArray());
	}
	
	/**
	 * 构造sql语句的wh、like、in条件
	 * @param wh
	 * @param like
	 * @param in
	 * @param paras
	 * @return
	 */
	private String getWhereSql(Record wh, Record like, Record in, List<Object> paras){
		StringBuffer sql = new StringBuffer();
		int num = 0;
		if(wh != null){
			Map<String, Object> mapWh = wh.getColumns();
			for(String key : mapWh.keySet()){
				if(StringUtils.isBlank(mapWh.get(key)+""))
					continue;
				if(num != 0)
					sql.append(" AND");
				if(key.matches(".*[<>=]+.*")){
					sql.append(" ").append(key.trim()).append(" ? ");
				}
				else
					sql.append(" `").append(key.trim()).append("` =").append(" ? ");
				paras.add(mapWh.get(key));
				num++;
			}
		}
		if(like != null){
			Map<String, Object> mapLike = like.getColumns();
			for(String key : mapLike.keySet()){
				if(StringUtils.isBlank(mapLike.get(key)+""))
					continue;
				if(num != 0)
					sql.append(" AND");
				sql.append(" `").append(key.trim()).append("` LIKE '%").append(mapLike.get(key)).append("%' ");
				num++;
			}
		}
		if(in != null && !in.getColumns().isEmpty()){
			Map<String, Object> map = in.getColumns();
			for(String key : map.keySet()){
				@SuppressWarnings("unchecked")
				List<String> da = (List<String>) map.get(key);
				if(da.size() == 0 || StringUtils.isBlank(da.get(0).trim()))
					continue;
				if(num != 0)
					sql.append(" AND");
				if(key.trim().contains(".")){
					sql.append(" ").append(key.trim()).append(" IN (");
				}else{
					sql.append(" `").append(key.trim()).append("` IN (");
				}
				for(int i = 0; i < da.size(); i++){
					if(i > 0)
						sql.append(", ");
					sql.append("?");
					paras.add(da.get(i));	
				}
				sql.append(")");
				num++;
			}
		}
		return num == 0 ? "" : " WHERE"+sql.toString();
	}
	
	/**
	 * 构造sql语句的排序条件
	 * @param paras
	 * @return
	 */
	private String getOrderBySql(Record paras){
		if(paras == null || paras.getColumns().isEmpty())
			return "";
		StringBuffer sql = new StringBuffer();
		Map<String, Object> map = paras.getColumns();
		for(Map.Entry<String, Object> entry : map.entrySet()){
			if(sql.length() > 0){
				sql.append(",");
			}
			sql.append("`").append(entry.getKey().trim()).append("` ").append(entry.getValue());	
		}
		return " ORDER BY " + sql.toString();
	}
	
	
	
	
	
	
}
