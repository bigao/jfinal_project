package com.demo.config;

import cn.dreampie.routebind.RouteBind;

import com.alibaba.druid.filter.stat.StatFilter;
import com.alibaba.druid.util.JdbcConstants;
import com.alibaba.druid.wall.WallFilter;
import com.demo.controller.BusiGameController;
import com.demo.model.BusiGame;
import com.demo.model.Certification;
import com.demo.model.Channel;
import com.demo.model.College;
import com.demo.model.ProductTypeGroup;
import com.demo.model.Student;
import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.core.JFinal;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.druid.DruidPlugin;

/**
 * API引导式配置
 */
public class DemoConfig extends JFinalConfig {
	Routes routes;
	
	/**
	 * 配置常量
	 */
	public void configConstant(Constants me) {
		// 加载少量必要配置，随后可用PropKit.get(...)获取值
		 //加载数据库配置文件
//		PropKit.use("db.properties");
		loadPropertyFile("db.properties");
		//配置模式为开发模式
		me.setDevMode(getPropertyToBoolean("devMode"));
	}
	
	/**
	 * 配置路由
	 */
	public void configRoute(Routes me) {
		// 第一个参数为请求路径，第二个为请求的Controller，第三个参数为该Controller的视图存放路径
	    me.add("/adminBusiGame", BusiGameController.class,"/view");
		this.routes = me;
		RouteBind routeBind = new RouteBind();
		routeBind.autoScan(false);
		routes.add(routeBind);
	}
	
	
	/**
	 * 配置插件
	 */
	public void configPlugin(Plugins me) {
		// 配置druid连接池
		DruidPlugin druidDefault = new DruidPlugin(getProperty("db.default.url"), getProperty("db.default.user"), getProperty("db.default.password"), getProperty("db.default.driver"));
		// StatFilter提供JDBC层的统计信息
		druidDefault.addFilter(new StatFilter());
		// WallFilter的功能是防御SQL注入攻击
		WallFilter wallDefault = new WallFilter();
		wallDefault.setDbType(JdbcConstants.MYSQL);
		druidDefault.addFilter(wallDefault);
		
		druidDefault.setInitialSize(getPropertyToInt("db.default.poolInitialSize"));
		druidDefault.setMaxPoolPreparedStatementPerConnectionSize(getPropertyToInt("db.default.poolMaxSize"));
		druidDefault.setTimeBetweenConnectErrorMillis(getPropertyToInt("db.default.connectionTimeoutMillis"));
		me.add(druidDefault);
		
        ActiveRecordPlugin arp0 = new ActiveRecordPlugin("default", druidDefault);
        me.add(arp0);
        
        arp0.addMapping("certification", Certification.class);
        arp0.addMapping("busi_game", BusiGame.class);
        arp0.addMapping("channel", Channel.class);
        arp0.addMapping("product_type_group", ProductTypeGroup.class);
        arp0.addMapping("student", Student.class);
        arp0.addMapping("college", College.class);
	       
	}
	
	/**
	 * 配置全局拦截器，将拦截所有的action请求，类似于struts2
	 */
	public void configInterceptor(Interceptors me) {
		
	}
	
	/**
	 * 配置处理器，处理器可接管所有的web请求
	 */
	public void configHandler(Handlers me) {
		
	}
	
	/**
	 * 建议使用 JFinal 手册推荐的方式启动项目
	 * 运行此 main 方法可以启动项目，此main方法可以放置在任意的Class类定义中，不一定要放于此
	 */
	public static void main(String[] args) {
		JFinal.start("WebRoot", 80, "/", 5);
	}
}
