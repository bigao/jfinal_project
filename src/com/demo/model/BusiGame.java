package com.demo.model;

import cn.dreampie.tablebind.TableBind;

import com.jfinal.plugin.activerecord.Model;

@SuppressWarnings("serial")
@TableBind(tableName = "busi_game", pkName = "id")
public class BusiGame extends Model<BusiGame>{
	
	public static final BusiGame dao = new BusiGame();

}
