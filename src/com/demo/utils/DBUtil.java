package com.demo.utils;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.regex.Pattern;

import net.sf.json.JSONArray;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.converters.DateConverter;
import org.apache.commons.lang.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

/**
 * 一个db工具
 * @author luzw luzw@jugame.cn
 *
 */
public class DBUtil {
	
	private String table = "";
	
	private JdbcTemplate jdbc;
	
	private String last_sql = "";
	
	private Object[] last_params = null;
	
	private void save_last_query(String sql, Object[] params){
		this.last_sql = sql;
		this.last_params = params;
	}
	
	public DBUtil(String tbl, JdbcTemplate jdbc){
		this.table = tbl;
		this.jdbc = jdbc;
	}
	
	private static Map<String, DBUtil> cache = new TreeMap<>();
	public static DBUtil proxy(String tbl, JdbcTemplate jdbc){
		DBUtil db = cache.get(tbl);
		if(db == null){
			db = new DBUtil(tbl, jdbc);
			cache.put(tbl, db);
		}
		return db;
	}
	public Record get(Record wh){
		return get(wh, null);
	}
	/**
	 * 查询单条数据
	 * @param table 表名
	 * @param wh
	 * @param like
	 * @return
	 */
	public Record get(Record wh, Record like){

		StringBuffer sql = new StringBuffer();
		sql.append("SELECT * FROM `").append(table.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		sql.append(getWhereSql(wh, like, paras).toString());
		sql.append(" LIMIT 1");
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		Record result = get(sql.toString(), paras.toArray());
		return result;
	}
	
	public Record get(String sql , Object...paras){
		Record result = new Record();
		List<Map<String, Object>> list = jdbc.queryForList(sql.toString(), paras);
		if(list.size() == 0){
			return result;
		}
		Map<String, Object> map = list.get(0);
		result.setColumns(map);
		return result;
	}
	public <T>T getEntity(Class<T> entityclazz, Record wh){
		return getEntity(entityclazz, wh, null);
	}
	public <T>T getEntity(Class<T> entityclazz, Record wh, Record like){
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT * FROM `").append(table.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		sql.append(getWhereSql(wh, like, paras).toString());
		sql.append(" LIMIT 1");
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		T result = getEntity(entityclazz, sql.toString(), paras.toArray());
		return result;
	}
	/**
	 * 返回自定义的实体对象
	 * @param entityClazz
	 * @param sql
	 * @param paras
	 * @return
	 */
	public <T>T getEntity(Class<T> entityClazz, String sql , Object...paras){
		SpringResultHandler<T> rh;
		try {
			rh = new SpringResultHandler<T>(entityClazz);
			if(jdbc == null){ 
				jdbc.query(sql.toLowerCase(), rh);
			}else{
				jdbc.query(sql.toLowerCase(), paras, rh);
			}
			return (rh.getDataList() == null || rh.getDataList().size() < 1)  ? null : rh.getDataList().get(0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	public List<Record> all(Record wh){
		return all(wh, null);
	}
	public List<Record> all(Record wh, Record like){
		return all(wh, like, new Record());
	}
	public List<Record> all(Record wh, Record like, Record order){
		return all(wh, like, null, order);
	}
	
	public List<Record> all(Record wh, Record like, Record in, Record order){
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT * FROM `").append(table.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		sql.append(getWhereSql(wh, like, in, paras).toString());
		sql.append(getOrderBySql(order));
		return all(sql.toString(), paras.toArray());
	}
	/**
	 * 查询列表
	 * @param table 表名
	 * @param wh where条件
	 * @param like like条件
	 * @return
	 */
	public List<Record> all(Record wh, Record like, Integer start, Integer limit){
		return all(wh, like, null, start, limit);
	}
	public List<Record> all(Record wh, Record like, Record order, Integer start, Integer limit){
		return all(wh, like, null, order, start, limit);
	}
	public List<Record> all(Record wh, Record like, Record in, Record order, Integer start, Integer limit){
		StringBuffer sql = new StringBuffer();
		List<Object> paras = new ArrayList<>();
		sql.append("SELECT * FROM `").append(table.trim()).append("` ");
		sql.append(getWhereSql(wh, like, in, paras).toString());
		sql.append(getOrderBySql(order));
		if(start != null)
			sql.append(" LIMIT ").append(start);
		if(start != null && limit != null)
			sql.append(" ,").append(limit);
		if(start == null && limit != null)
			sql.append(" LIMIT").append(limit);
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		return all(sql.toString(), paras.toArray());
	}
	public List<Record> all(String sql, Object...paras){
		List<Record> list = new ArrayList<>();
		List<Map<String, Object>> results = jdbc.queryForList(sql, paras);
		for(Map<String, Object> row : results){
			Record r = new Record();
			list.add(r.setColumns(row));
		}
		return list;
	}
	/**
	 * 返回实体列表
	 * @param entityClazz
	 * @param wh
	 * @return
	 */
	public <T> List<T> allEntity(Class<T> entityClazz, Record wh){
		return allEntity(entityClazz, wh , null, null, null);
	}
	/**
	 * 返回实体列表
	 * @param entityClazz
	 * @param wh
	 * @param like
	 * @return
	 */
	public <T> List<T> allEntity(Class<T> entityClazz, Record wh , Record like){
		return allEntity(entityClazz, wh , like, null, null);
	}
	/**
	 * 返回实体列表
	 * @param entityClazz
	 * @param wh
	 * @param like
	 * @param in
	 * @return
	 */
	public <T> List<T> allEntity(Class<T> entityClazz, Record wh , Record like, Record in){
		return allEntity(entityClazz, wh , like, in, null);
	}
	/**
	 * 返回实体列表
	 * @param entityClazz
	 * @param wh
	 * @param like
	 * @param in
	 * @param order
	 * @return
	 */
	public <T> List<T> allEntity(Class<T> entityClazz, Record wh , Record like, Record in, Record order){
		StringBuffer sql = new StringBuffer();
		List<Object> paras = new ArrayList<>();
		sql.append("SELECT * FROM `").append(table.trim()).append("` ");
		sql.append(getWhereSql(wh, like, in, paras).toString());
		sql.append(getOrderBySql(order));
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		return allEntity(entityClazz, sql.toString(), paras.toArray());
	}
	/**
	 * 返回实体列表
	 * @param entityClazz
	 * @param sql
	 * @param paras
	 * @return
	 */
	public <T> List<T> allEntity(Class<T> entityClazz, String sql, Object...paras){
		SpringResultHandler<T> rh;
		try {
			rh = new SpringResultHandler<T>(entityClazz);
			if(jdbc == null){ 
				jdbc.query(sql.toLowerCase(), rh);
			}else{
				jdbc.query(sql.toLowerCase(), paras, rh);
			}
			return (rh.getDataList() == null || rh.getDataList().size() < 1)  ? null : rh.getDataList();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	public int query(String sql, Object...paras){
		return jdbc.update(sql, paras);
	}
	@SuppressWarnings("deprecation")
	public int getTotalInt(String sql , Object...paras){
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras);
		return jdbc.queryForInt(sql, paras);
	}
	public int getTotalInt(Record wh){
		return getTotalInt(wh, new Record());
	}
	/**
	 *获取满足条件的数据总数
	 * @param table 表名
	 * @param wh where条件
	 * @param like like条件
	 * @return
	 */
	public int getTotalInt(Record wh, Record like){
		return getTotalInt(wh, like, null);
	}
	public int getTotalInt(Record wh, Record like, Record in){
		StringBuffer sql = new StringBuffer();
		sql.append("SELECT COUNT(1) FROM `").append(table.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		sql.append(getWhereSql(wh, like, in, paras).toString());
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		return getTotalInt(sql.toString(), paras.toArray());
	}
	public int update(Record data, Record wh){
		return update(data, wh, new Record());
	}
	/**
	 * 更加条件更新相应的数据
	 * @param table 表格
	 * @param data
	 * @param wh
	 * @param like
	 * @return
	 */
	public int update(Record data, Record wh, Record like){
		StringBuffer sql = new StringBuffer();
		List<Object> paras = new ArrayList<>();
		sql.append("update `").append(table.trim()).append("` set ");
		for (Entry<String, Object> e: data.getColumns().entrySet()) {
			String colName = e.getKey();
			if (paras.size() > 0) {
				sql.append(", ");
			}
			sql.append("`").append(colName).append("`=?");
			paras.add(e.getValue());
		}
		sql.append(getWhereSql(wh, like, paras).toString());
		
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		return query(sql.toString(), paras.toArray());
	}
	/**
	 * 
	 * @param data
	 * @return 新增失败返回null
	 */
	public Record save(Record data){
		if(data == null || data.isEmpty()) return null;
		try {
			final StringBuffer sql = new StringBuffer();
			sql.append("INSERT INTO `").append(table).append("` (");
			Map<String, Object> map = data.getColumns();
			final List<Object> paras = new ArrayList<>();
			for(Map.Entry<String, Object> entry : map.entrySet()){
				if(paras.size() > 0)
					sql.append(", ");
					
				sql.append("`").append(entry.getKey()).append("`");
				paras.add(entry.getValue());
			}
			sql.append(") ").append("VALUES(");
			for(int i = 0; i<paras.size();i++ ){
				if(i > 0)
					sql.append(",");
				sql.append("?");
				//sql.append(paras.get(i));
			}
			sql.append(")");
			KeyHolder keyHolder = new GeneratedKeyHolder(); 
			jdbc.update(new PreparedStatementCreator() { 
			public PreparedStatement createPreparedStatement(Connection con) throws SQLException { 
				PreparedStatement ps = con.prepareStatement(sql.toString(), Statement.RETURN_GENERATED_KEYS); 
				for(int i = 0; i<paras.size();i++ ){
					ps.setObject(i+1, paras.get(i));
				}
				return ps; 
				} 
			}, keyHolder); 
//			//新增返回的主键 
			int id = keyHolder.getKey().intValue();
			data.set("id", id);
			//保存最后一次执行的sql
			save_last_query(sql.toString(), paras.toArray());
			return data;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	public int delete(Record wh){
		return delete(wh, null);
	}
	public int delete(Record wh, Record like){
		StringBuffer sql = new StringBuffer();
		sql.append("DELETE FROM `").append(table.trim()).append("` ");
		List<Object> paras = new ArrayList<>();
		String where = getWhereSql(wh, like, paras);
		//如果where条件为空 不执行删除
		if(StringUtils.isBlank(where)) 
			return 0;
		sql.append(where);
		//保存最后一次执行的sql
		save_last_query(sql.toString(), paras.toArray());
		return query(sql.toString(), paras.toArray());
	}
	/**
	 * 获取最后一次执行的sql
	 * @return
	 */
	public String last_query(){
		StringBuffer real_sql = new StringBuffer();
		if(StringUtils.isBlank(this.last_sql)){
			return "";
		}
		
		int pos = 0;
		for(int i=0; i<this.last_sql.length(); ++i){
			char c = this.last_sql.charAt(i);
			//遇到一个占位符
			if(c == '?'){
				real_sql.append("'").append(save_get_param(pos++)).append("'");
			}else{
				real_sql.append(c);
			}
		}
		return real_sql.toString();
	}
	private Object save_get_param(int pos){
		if(this.last_params == null)
			return "?";
		if(pos < 0 || pos >= this.last_params.length)
			return "?";
		
		return mysql_escape_string(this.last_params[pos].toString());
	}
	private String mysql_escape_string(String s){
		if(s == null) return null;
		StringBuffer buf = new StringBuffer();
		for(int i=0; i<s.length(); ++i){
			char c = s.charAt(i);
			switch(c){
			case 0:
                buf.append('0');
                break;
            case '\n':
                buf.append("\\n");
                break;
            case '\r':
                buf.append("\\r");
                break;
            case '\\':
            case '\'':
            case '"':
                buf.append("\\").append(c);
                break;
            case '\032':
            	buf.append("\\Z");
                break;
            default:
            	buf.append(c);
			}
		}
		return buf.toString();
	}
	public static String getWhereSql(Record wh, Record like, List<Object> paras){
		return getWhereSql(wh, like, null, paras);
	}
	private static String getWhereSql(Record wh, Record like, Record in, List<Object> paras){
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
		if(in != null && !in.isEmpty()){
			Map<String, Object> map = in.getColumns();
			for(String key : map.keySet()){
				@SuppressWarnings("unchecked")
				List<String> da = (List<String>) map.get(key);
				if(da.size() == 0 || StringUtils.isBlank(da.get(0).trim()))
					continue;
				if(num != 0)
					sql.append(" AND");
				sql.append(" `").append(key.trim()).append("` IN (");
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
	private String getOrderBySql(Record paras){
		if(paras == null || paras.isEmpty())
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
	/**
	 * 将List<Record> 转为json输出
	 * @param rows
	 * @return
	 */
	public static String toJsonforListRecord(List<Record> rows) {
		JSONArray array = new JSONArray();
		for (Record row : rows) {
			array.add(row.toJson());
		}
		
		return array.toString();
	}

}

class SpringResultHandler<T> implements RowCallbackHandler {
	private static final Pattern UNDERSCORE_PATTERN_1 = Pattern.compile("([A-Z]+)([A-Z][a-z])");
    private static final Pattern UNDERSCORE_PATTERN_2 = Pattern.compile("([a-z\\d])([A-Z])");
	private Class<T> entityClass;
	private List<T> dataList;
	public SpringResultHandler(Class<T> entityClass) throws InstantiationException, IllegalAccessException{
		this.entityClass = entityClass;
		this.dataList = new ArrayList<>();
	}
	
	
	public List<T> getDataList() {
		return dataList;
	}

	public void setDataList(List<T> dataList) {
		this.dataList = dataList;
	}

	public void processRow(ResultSet rs) throws SQLException {
		T rsEntity = null;
		try {
			rsEntity = entityClass.newInstance();
		} catch (InstantiationException | IllegalAccessException e1) {
			e1.printStackTrace();
		}
		Field[] fields = rsEntity.getClass().getDeclaredFields();
		try {
			for(Field field : fields){
				Object columnValue = null;
				try{
					columnValue = rs.getObject( underscore( field.getName() ) );
				}catch(Exception e){
					continue;
				}
				ConvertUtils.register(new DateConverter(null), java.util.Date.class); 
				BeanUtils.copyProperty(rsEntity, field.getName(), columnValue);
			}
		} catch (IllegalAccessException | InvocationTargetException e) {
			e.printStackTrace();
		}
		dataList.add(rsEntity);
	}
	public String underscore(String camelCasedWord) {

        // Regexes in Java are fucking stupid...
        String underscoredWord = UNDERSCORE_PATTERN_1.matcher(camelCasedWord).replaceAll("$1_$2");
        underscoredWord = UNDERSCORE_PATTERN_2.matcher(underscoredWord).replaceAll("$1_$2");
        underscoredWord = underscoredWord.replace('-', '_').toLowerCase();

        return underscoredWord;
    }

}
