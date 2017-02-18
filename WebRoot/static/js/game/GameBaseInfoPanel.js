define(function(require, exports, module){
	var utils = require("../utils");
	var fw = require("../../com/FormWindow.ui.js");
	var SAVE_URLS = {
        UPDATE_OTHER_INFO: "adminGame/updateOtherInfo", //更新其它信息
        CHANGE_TO_BE_MASTER: "adminGame/changeToBeMaster", //设为主包
        UPDATE_PACKS_INFO: "adminGame/updatePacksInfo", //更新游戏包下载信息
        UPDATE_PICS_INFO: "adminGame/updatePicsInfo", //更新游戏截图信息
    };
	var QUERY_URLS = {
		GET_GAME_CHANNELS: "gameChannel/list",	//获取游戏渠道	
	};
	
	var validateImgType = function(filename) {
    	var imgTypeArr = ["jpg","jpeg","png"];
    	if(-1 == filename.lastIndexOf(".")) {
			return "保存失败，上传图片: " + filename + "，名称不合法";
		}
		var imgType = filename.substr(filename.lastIndexOf(".")).toLowerCase();
		var flag = false;
		for(var i=0; i<imgTypeArr.length; i++) {
			if(-1 != imgType.indexOf(imgTypeArr[i])) {
				flag = true;
				break;
			}
		}
		if(!flag) {
			return "保存失败，上传图片只支持以下格式: "+imgTypeArr.join(",");
		}
		return true;
    };
	
	var GameBaseInfoPanel = Ext.extend(Ext.Panel, {
		__make_id : function(name){
            return "GameBaseInfoPanel:" + name;
        },

        __get_cmp: function(name){
            return Ext.getCmp(this.__make_id(name));
        },
        
		constructor: function(){
			var me = this;
			me.gameCateGoryStore = me.createGameCateGoryStore();
            //如果是修改数据的话，logo_url有值，此时后端通过logo文件和logo_url判断是否需要更新
            this.logo_url = "";
            this.file_size = "";
            this.game_id = "";
			this.form1 = new Ext.form.FormPanel({
                border: false,
                width: 400,
                height: 150,
                padding: "10px 10px 0px 0px",
                items: [
                    {id: me.__make_id("game_name"), xtype: "textfield", fieldLabel: "游戏名称<font color='red'>*</font>", allowBlank: false, anchor: "95%", listeners: {
                        blur: function(p){
                            var game_info = me.__get_cmp("game_info").getValue();
                            if(game_info == ""){
                                me.__get_cmp("game_info").setValue(p.getValue());
                            }

                        }
                    }},
                    {xtype : "combo", allowBlank: false, fieldLabel: "所属平台<font color='red'>*</font>", width : 120, triggerAction: 'all',
                        typeAhead : true, mode : "local", value : "android",
                        id : me.__make_id("platform"),
                        store : [["android", "android"]],
                    },
                    
                    new Ext.form.ComboBox({
						id: "game_category", fieldLabel:'游戏类别',
						store: me.gameCateGoryStore,
					    displayField:'name',  valueField:'code', typeAhead: true,
					    mode: 'local' ,forceSelection: true,
					    triggerAction: 'all', allowBlank:true,
					    emptyText:'游戏类别', width: 120, selectOnFocus:true,
					    listeners: {
					    	render : function(combo){
					    		combo.store.load();
					    	}
                        },
					  }),

                    {id: me.__make_id("weight"), xtype: "numberfield", fieldLabel: "权重<font color='red'>*</font>", allowBlank: false, anchor: "95%"},
                   
                    {id: me.__make_id('logo'), hideLabel: false, fieldLabel: "选择Logo", anchor: "95%", xtype: 'textfield', inputType: "file", listeners: {
                        change: function(field, newValue, oldValue){
                            var el = me.__get_cmp('logo').getEl();
                            var url = 'file://' + el.dom.value;
                            Ext.get(me.__make_id('imageBrowser')).dom.src = window.URL.createObjectURL(el.dom.files.item(0));
                        }
                    }},
                ]
            });

            this.form2 = new Ext.form.FormPanel({
                border: false,
                width: 500,
                height: 150,
                padding: "10px 10px 0px 0px",
                items: [
                        {id: me.__make_id("game_initial"), xtype: "textfield", fieldLabel: "首字母<font color='red'>*</font>", allowBlank: false, anchor: "95%"},
                	{xtype : "combo", allowBlank: false, fieldLabel: "是否上线<font color='red'>*</font>", width : 120, triggerAction: 'all',
                        typeAhead : true, mode : "local", value : 1,
                        id : me.__make_id("usable"),
                        store : [[1, "上线"], [0, "线下"]],
                    },
                   
                    {id: me.__make_id("game_home_url"), xtype: "textfield", fieldLabel: "游戏官方首页地址", anchor: "95%",},
                    {xtype : "button", text : "配置游戏api属性", fieldLabel : "游戏api", handler : function(){
                    	var that = me;
                    	if(me.game_id == undefined || me.game_id == ""){
                			utils.show_msg("请保存游戏基本信息");
                			return false;
                		}
                    	var win = new  fw.FormWindowUi({
                            title : "配置游戏api属性",
                            width : 500,
                            height : 250,
                            id : Ext.id(),
                            listeners : {
                            	render : function(w){
                            		
                            		var params = {game_id : me.game_id};
                        			utils.http_request(utils.build_url("baseGameInfo/getApiGameProperties"), params, function(json){
                        				if(json.success){
                        					var data = json.data;
                        					if(data == "")
                        						return;
                        					
                        					me.__get_cmp("api_game_id").setValue(data.id);
                        					me.__get_cmp("interface_url").setValue(data.interface_url);
                        					me.__get_cmp("interface_key").setValue(data.interface_key);
                        					me.__get_cmp("find_user_way").setValue(data.find_user_way);
                        					me.__get_cmp("api_version").setValue(data.api_version);
                        				}
                        			});
                            	}
                            }
                        }); 
                        win.addItem({
                            xtype : "hidden",
                            id : me.__make_id("api_game_id"),
                        });
                        win.addItem({
                        	xtype : "textfield",
                        	fieldLabel : "游戏接口URL<font color='red'>*</font>",
                        	id : me.__make_id("interface_url"),
                        	anchor : "90%",
                        });
                        win.addItem(
                    		{id: me.__make_id("find_user_way"), xtype: "combo", 
                    			fieldLabel: "查找用户的方式<font color='red'>*</font>", 
                    			anchor: "90%", triggerAction: 'all', typeAhead : true, 
                    			editable: false, model: "local",
            					allowBlank: false, store: [[1, "ID"], [2, "角色名"]]}
                        );
                        win.addItem({
                            xtype : "textfield",
                            fieldLabel : "签名key<font color='red'>*</font>",
                            id : me.__make_id("interface_key"),
                            anchor : "90%",
                        });
                        win.addItem(
                    		{id: me.__make_id("api_version"), xtype: "combo", 
                    			fieldLabel: "api版本<font color='red'>*</font>", 
                    			anchor: "90%", triggerAction: 'all', 
                    			typeAhead : true, model: "local",
            					allowBlank: false, store: [["版本1", "版本1"], ["版本2", "版本2"]]}
                        );
                        win.onClickSubmit = function(){
                            var id = that.__get_cmp("api_game_id").getValue();
                            var game_id = that.game_id;
                            var interface_url = that.__get_cmp("interface_url").getValue();
                            var find_user_way = that.__get_cmp("find_user_way").getValue();
                            var interface_key = that.__get_cmp("interface_key").getValue();
                            var api_version = me.__get_cmp("api_version").getValue();
                            var data = {
                        		id : id , 
                        		game_id : game_id, 
                        		interface_url: interface_url, 
                        		find_user_way : find_user_way,
                        		interface_key : interface_key,
                        		api_version : api_version
                            };
                            var json = Ext.util.JSON.encode(data);
                            win.submit(utils.build_url("baseGameInfo/addOrUpdateApiGameProInfo"),{data : json});
                        };  
                        win.onSubmitSuccess = function(json){
                            if(json.success){
                                utils.tips(json.msg);
                                win.close();
                            }   
                            else{
                                utils.show_msg(json.msg);
                            }   
                           
                        }   
                        win.show();
                    }}
                ]
            });

            this.form3 = new Ext.form.FormPanel({
                border: false,
                width: 400,
                padding: "0px 10px 0px 0px",
                items: [
                    {fieldLabel: 'Logo预览', xtype: 'box', autoEl: {src: Ext.BLANK_IMAGE_URL, tag: 'img', complete: 'off', id: me.__make_id('imageBrowser'), width:100, height: 100} },
                ]
            });

            this.form4 = new Ext.form.FormPanel({
                border: false,
                padding: 5, 
                colspan: 3,
                items: [
                    {id: me.__make_id("game_info"), xtype: "textarea", fieldLabel: "游戏简介", anchor: "100%", height: 100}
                ]
            });
            
            
            this.formGamePackInfo = new Ext.form.FormPanel({
					labelWidth: 20, 
					padding: 5, 
	                colspan: 3,
					border: true,
					title: '游戏包下载信息(<font color="red">渠道不可修改，包记录不能删除</font>)',
					id : 'GameBaseInfoPanel:formGamePackInfo',
					autoHeight:true,
					autoScroll:true,
					layout:"form",
					frame:true,
					tbar : new Ext.Toolbar({
	        			style: "background:#D3D3D3",
	        			items :[
	                    {xtype : "button", text : "<b><font color='red'>保存</font></b>", icon : "static/libs/icons/accept.png", handler : function(){
	                    	var subGames = Ext.getCmp('GameBaseInfoPanel:formGamePackInfo').items.items;
	                    	if(null == subGames || undefined == subGames || subGames.length <= 0) {
	                    		return;
	                    	}
	                    	//进行检验
	                    	var isValid = true;
	                    	for(var i=0; i<subGames.length; i++) {
	                    		var sub = subGames[i];
	                    		var channel_id = sub.items.items[1].items.items[0].getValue();
	                    		var down_url = sub.items.items[3].items.items[0].getValue();
	                    		if(undefined == channel_id || channel_id == "") {
	                    			utils.show_msg("渠道必填");
	                    			return;
	                    		}
	                    	}
	                    	var ajax_sub_games = [];
	                    	for(var i=0; i<subGames.length; i++) {
	                    		var sub = subGames[i];
	                    		var sub_id = sub.items.items[0].items.items[0].getValue();
	                    		var channel_id = sub.items.items[1].items.items[0].getValue();
	                    		var sub_game_name = sub.items.items[2].items.items[0].getValue();
	                    		var down_url = sub.items.items[3].items.items[0].getValue();
	                    		var file_size = sub.items.items[4].items.items[0].getValue();
	                    			ajax_sub_games.push({"sub_id":sub_id,"channel_id":channel_id,"sub_game_name":sub_game_name,
	                    			"down_url":down_url,"file_size":file_size});
	                    	}
	                    	var game_id = me.game_id;
	                    	var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
       						myMask.show();
                           	Ext.Ajax.request({
								url: SAVE_URLS.UPDATE_PACKS_INFO,
								params: {'game_id':game_id,'sub_games':JSON.stringify(ajax_sub_games)},
								success: function(resp,otps){
								   myMask.hide();
								   var obj = Ext.decode(resp.responseText);
								   if(obj.success){
									   location.reload();
								   } else {
									   utils.show_msg(obj.msg);
								   }

								},
								failure : function(resp ,otps){
								   myMask.hide();
								   utils.show_msg("发送请求时发生错误");
								}
                       		});
	                    }},
	                     "-","-","-",
	                    {xtype : "button", text : "增加游戏包", icon : "static/libs/icons/add.png", handler : function(){
	                    	 var formGamePackInfo = Ext.getCmp("GameBaseInfoPanel:formGamePackInfo");
	                    	 var gameChannelStore = me.createGameChannelStore();
                  		     formGamePackInfo.add(
                    			{columnWidth : 1, layout : "column", items : [
        							{columnWidth : .1,  layout : "form", labelWidth: 30, items : [{xtype:"numberfield", fieldLabel : "子ID",anchor : "98%", disabled : true}] },
        							{columnWidth : .2,  layout : "form", labelWidth: 80, items : [
          								{xtype:"combo", fieldLabel : "渠道(客户端)",anchor : "96%", editable : false, 
          									store: gameChannelStore, displayField:'channel_name',  valueField:'channel_id', typeAhead: true,
          									mode: 'local' , forceSelection: true,
          									triggerAction: 'all', allowBlank:true,
          									emptyText:'未选', width: 120, selectOnFocus:true, 
          									listeners: {
          										render : function(combo){
          											combo.store.load();
          										}
          									}
          								}
                                    ]},
        							{columnWidth : .2,  layout : "form", labelWidth: 60, items : [{xtype:"textfield", fieldLabel : "版本名称",anchor : "96%"}] },
        							{columnWidth : .3,  layout : "form", labelWidth: 60, items : [{xtype:"textfield", fieldLabel : "下载地址",anchor : "96%"}] },
        							{columnWidth : .15, layout : "form", labelWidth: 70,items : [{xtype:"textfield", fieldLabel : "包大小(MB)",anchor : "96%"}] },
        							{columnWidth : .05, layout : "form",items : []},                                          
                          		]}
                  		     );
                  		     formGamePackInfo.doLayout();//新增后布局刷新
	                    }},
	                ]}),
				});
            
            this.formGameOtherInfo = new Ext.form.FormPanel({
            	id: me.__make_id('formGameOtherInfo'),
            	labelWidth: 80, 
            	padding: 5, 
            	colspan: 3,
            	border: true,
            	title: '游戏其它信息',
            	autoHeight:true,
            	autoScroll:true,
            	layout:"form",
            	frame:true,
            	tbar : new Ext.Toolbar({
            		style: "background:#D3D3D3",
            		items :[
            		        {xtype : "button", text : "<b><font color='red'>保存</font></b>", icon : "static/libs/icons/accept.png", handler : function(){
            		        	var game_id = me.game_id;
            		        	var game_intro = me.__get_cmp("game_intro").getValue();
            		        	var game_desc = me.__get_cmp("game_desc").getValue();
            		        	var seo_title = me.__get_cmp("seo_title").getValue();
            		        	var seo_desc = me.__get_cmp("seo_desc").getValue();
            		        	var seo_keywords = me.__get_cmp("seo_keywords").getValue();
            		        	var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
	       						myMask.show();
	                           	Ext.Ajax.request({
									url: SAVE_URLS.UPDATE_OTHER_INFO,
									params: {'game_id':game_id,'game_intro':game_intro,'game_desc':game_desc,
	                           				 'seo_title':seo_title,'seo_desc':seo_desc,'seo_keywords':seo_keywords
	                           		},
									success: function(resp,otps){
									   myMask.hide();
									   var obj = Ext.decode(resp.responseText);
									   if(!obj.success){
										   utils.show_msg(obj.msg);
									   }

									},
									failure : function(resp ,otps){
									   myMask.hide();
									   utils.show_msg("发送请求时发生错误");
									}
	                       		});
            		        }},
            		]
            	}),
            	items:[{
					layout : "column",
					labelWidth: 100,
					items : [
						{columnWidth : 1, layout : "form",items : [{xtype:"textfield", id: me.__make_id("game_intro"), fieldLabel : "游戏描述", allowBlank:false, anchor : "98%"}] },
						{columnWidth : 1, layout : "form",items : [{xtype:"textfield", id: me.__make_id("game_desc"),fieldLabel : "游戏详情", allowBlank:false, anchor : "98%"}] },
						{columnWidth : 1, layout : "form",items : [{xtype:"textfield", id: me.__make_id("seo_title"),fieldLabel : "SEO Title",allowBlank:true, anchor : "98%"}] },
						{columnWidth : 1, layout : "form",items : [{xtype:"textfield", id: me.__make_id("seo_desc"),fieldLabel : "SEO Description", allowBlank:true, anchor : "98%"}] },
						{columnWidth : 1, layout : "form",items : [{xtype:"textfield", id: me.__make_id("seo_keywords"),fieldLabel : "SEO Keywords", allowBlank:true, anchor : "98%"}] }
				   ]
				}]
            });
            
            this.formGamePicsInfo = new Ext.form.FormPanel({
            	padding: 5, 
            	colspan: 3,
            	border: true,
            	title: '游戏截图信息(<font color="red">权重越小，排列越靠前</font>)',
            	id: 'GameBaseInfoPanel:formGamePicsInfo',
            	autoHeight:true,
            	autoScroll:true,
            	layout:"form",
            	frame:true,
            	tbar : new Ext.Toolbar({
            		style: "background:#D3D3D3",
            		items :[
            		        {xtype : "button", text : "<b><font color='red'>保存</font></b>", icon : "static/libs/icons/accept.png", handler : function(){
            		        	//截图信息
            		        	var form = new FormData();
            		        	form.append("game_id", me.game_id);

            		        	var formGamePicsInfo = Ext.getCmp("GameBaseInfoPanel:formGamePicsInfo");
								var pics = formGamePicsInfo.items.items;
								for(var i = 0 ; i < pics.length ; i ++){
									var id = pics[i].items.items[1].items.items[0].getValue();
									form.append("id_"+i, id);
									
									var weight = pics[i].items.items[2].items.items[0].getValue();
									if(weight == undefined || weight == "") {
										utils.show_msg("更新失败，权重必填");
										return;
									}
									form.append("weight_"+i, weight);
									
									var uploadByUrl = pics[i].items.items[3].items.items[0].items.items[0].items.items[0].getValue();
									form.append("upload_by_url_"+i, uploadByUrl);
									
									if(uploadByUrl) {
										//通过手写URL上传
										var url = pics[i].items.items[3].items.items[0].items.items[1].items.items[0].getValue();
										if(null == url || undefined == url || url == "") {
											utils.show_msg("更新失败，选中图片URL时，该选项必填");
											return;
										}
										form.append("pic_input_url_"+i, url);
									} else {
										var fileId = pics[i].items.items[3].items.items[1].items.items[2].items.items[0].id; 
										var picFile = Ext.getCmp(fileId).getEl().dom.files[0];
										if(picFile != undefined && picFile != "") {
											//判断类型
											var validateResult = validateImgType(picFile.name);
											if(validateResult != true) {
												utils.show_msg(validateResult);
												return;
											}
											form.append("pic_file_url_"+i, picFile);
										}
										var pic_url = pics[i].items.items[3].items.items[1].items.items[1].items.items[0].autoEl.src; 
						            	form.append("pic_src_url_"+i, pic_url);
									}
								}
								form.append("pic_size", pics.length);
								
								var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
								myMask.show();
								var xmlhttp = new XMLHttpRequest();
								xmlhttp.open("POST", SAVE_URLS.UPDATE_PICS_INFO, true);
								xmlhttp.onload = function(e){
									if(e.target.readyState == 4) {  
										myMask.hide();
										//判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
										if(e.target.status != 200) {  
											utils.show_msg("更新失败，请检查图片是否已经上传");
											return;
										}  
									}
									var resp = Ext.util.JSON.decode(e.currentTarget.response);
									myMask.hide();
									if(resp.success){
										location.reload();
									}else{
										utils.show_msg(resp.msg);
									}
								};
								xmlhttp.send(form);
								function callback() {  
									//接收响应数据  
									//判断对象状态是否交互完成，如果为4则交互完成 
									if(xmlhttp.readyState == 4) {  
										myMask.hide();
										//判断对象状态是否交互成功,如果成功则为200 ,如果 500则不成功
										if(xmlhttp.status == 500) {  
											//接收数据,得到服务器输出的纯文本数据  
											utils.show_msg("更新游戏截图信息失败");
											return;
										}  
									}   
								}
            		        }},
            		        "-","-","-",
            		        {xtype : "button", text : "增加图片", icon : "static/libs/icons/add.png", handler : function(){
            		        	var random_num = utils.get_random_num(1000,9999);
            		        	var formGamePicsInfo = Ext.getCmp("GameBaseInfoPanel:formGamePicsInfo");
								var items = formGamePicsInfo.items.items;
								if(undefined == items || items.length >= 5) {
									return false;
								}
            		        	
        	        			var pic_var = 
        			        		{columnWidth : 1, layout : "column", style:'border-bottom:2px solid #D3D3D3;padding: 10 0 10 0', items : [
        									{columnWidth : .05, layout : "form", labelWidth: 10, items : [                                     
        		                                 {checked: false,xtype : 'checkbox',anchor : "48%"}
        									]},
        									{columnWidth : .1, layout : "form", labelWidth: 20,items : [                                     
        									      {xtype:"textfield", fieldLabel : "ID", anchor : "80%", disabled: true},
        									]},
        			                       	{columnWidth : .1, layout : "form", labelWidth: 30,items : [                                     
        		                                 {xtype:"numberfield", fieldLabel : "权重", anchor : "80%"},
        			                       	]},
        			                       	{columnWidth : .75, layout : "column", items : [
        										{columnWidth : 1, layout : "column", items : [
        										  	  {columnWidth : .15, layout : "form", labelWidth: 40, items : [             
        										           {xtype:"radio", name:"pic_radio_"+random_num, boxLabel:"图片URL:",anchor : "96%"},
        										  	  ]},
        										  	  {columnWidth : .85, layout : "form", items : [             
        										           {xtype:"textfield", anchor : "96%"}
        										      ]},
        										]},                                     
        										{columnWidth : 1, layout : "column", items : [
        											  {columnWidth : .3, layout : "form", labelWidth: 40, items : [     
        										           {xtype:"radio", name:"pic_radio_"+random_num, boxLabel:"本地上传:", checked: true,anchor : "100%"}
        											  ]},
        											  {columnWidth : .15, layout : "form", items : [             
        										           {xtype: 'box', autoEl: {src: '', tag: 'img', complete: 'off', width:60, height: 60} },
        										      ]},
        										      {columnWidth : .55, layout : "form", items : [             
        										           {xtype: 'textfield', inputType: "file", listeners:{
        										            	 change : function (file,oldValue,newValue){
        										                	   var img = this.ownerCt.previousSibling().items.items[0]; 
        										                	   var el = this.getEl();
        										                	   img.getEl().dom.src = window.URL.createObjectURL(el.dom.files[0]);
        										             		}
        										           }}
        										      ]},
        										]},                                     
        			                       	]},
        			           		]};
        	        			formGamePicsInfo.add(pic_var);
            	        		formGamePicsInfo.doLayout(); //新增后布局刷新
            		        }},
            		        "-","-","-",
            		        {xtype : "button", text : "删除图片", icon : "static/libs/icons/delete.png", handler : function(){
								var formGamePicsInfo = Ext.getCmp("GameBaseInfoPanel:formGamePicsInfo");
								var items = formGamePicsInfo.items.items;
								if(undefined == items || null == items || items == "" || items.length <= 0) {
									return false;
								}
								var deleteArray = new Array();
								var j = 0;
								for(var i = 0 ; i < items.length ; i ++){
									//新增、删除控件的原因，绝对定位获取组件是否选中而删除
									var isChecked = items[i].items.items[0].items.items[0].checked;
									if(isChecked){
										var panelId =  items[i].id;
										deleteArray[j++] = panelId;
									} 
								}
								for(var k = 0 ; k < deleteArray.length ; k++){
									formGamePicsInfo.remove(Ext.getCmp(deleteArray[k]));
								}
								formGamePicsInfo.doLayout();//新增后布局刷新
            		        }},
            		 ]
            	})
            });
            
			GameBaseInfoPanel.superclass.constructor.call(this, {
				border: false, 
				layout: "table",
				
				layoutConfig: {columns:3}, 
				tbar : new Ext.Toolbar({
					items : [{xtype : "button", text : "保存", width : 80, height : 30, icon : "static/libs/icons/accept.png", 
						handler : function(){
							me.on_save();
						}
					}],
				}),
				items: [this.form1, this.form2, this.form3, this.form4, this.formGamePackInfo, this.formGameOtherInfo, this.formGamePicsInfo]
			});
		},
		
		get_game_name: function(){
			return this.__get_cmp("game_name").getValue();
		},

		is_valid : function(){
            if(!this.form1.getForm().isValid() || !this.form2.getForm().isValid() || !this.form3.getForm().isValid() || !this.form4.getForm().isValid()){
                return false;
            }

            if(!this.logo_url && this.__get_cmp('logo').getValue() == "")
                return false;

            return true;
        },
        on_save : function(){
        	// to be implement
        },
        get_data : function(){
            var base = {};
            base.game_id = this.game_id;
            base.game_name = this.__get_cmp("game_name").getValue();
            //编辑游戏保存之前的游戏名称
            base.game_name_start_value = this.__get_cmp("game_name").startValue;
            if(base.game_name == ""){
            	utils.show_msg("请填写游戏名称");
            	return false;
            }
            base.weight = this.__get_cmp("weight").getValue();
            if(base.weight == ""){
            	utils.show_msg("请填写权重");
            	return false;
            }
            base.logo = this.__get_cmp('logo').getEl().dom.files[0];
            base.platform = this.__get_cmp("platform").getValue();
            if(base.platform == ""){
            	utils.show_msg("请选择游戏平台");
            	return false;
            }
            base.usable = this.__get_cmp("usable").getValue();
            base.game_initial = this.__get_cmp("game_initial").getValue();
            if(base.platform == ""){
            	utils.show_msg("请填写首字母");
            }
            base.game_home_url = this.__get_cmp("game_home_url").getValue();
            base.game_info = this.__get_cmp("game_info").getValue();
            base.game_category = Ext.getCmp("game_category").getValue();
            return base;
        },

        reset : function(){
            this.form1.getForm().reset();
            this.form2.getForm().reset();
            this.form3.getForm().reset();
            this.form4.getForm().reset();

            this.logo_url = "";
            this.file_size = "";
            Ext.get(this.__make_id('imageBrowser')).dom.src = "";
        },

        set_data: function(base_info){
            this.logo_url = base_info.game_pic;
            this.file_size = base_info.file_size;
            this.game_id = base_info.game_id;
            this.__get_cmp("game_name").setValue(base_info.game_name);
            this.__get_cmp("weight").setValue(base_info.weight);
            this.__get_cmp("platform").setValue(base_info.platform);
            this.__get_cmp("usable").setValue(base_info.usable);
            this.__get_cmp("game_initial").setValue(base_info.game_initial);
            this.__get_cmp("game_home_url").setValue(base_info.game_home_url);
            this.__get_cmp("game_info").setValue(base_info.game_info);
            Ext.getCmp("game_category").setValue(base_info.game_category);
            Ext.get(this.__make_id('imageBrowser')).dom.src = this.logo_url;
        },
        
        set_ext_data: function(sub_games,game_pics,base_info, game_channel){
        	this.logo_url = base_info.game_pic;
        	this.file_size = base_info.file_size;
        	this.game_id = base_info.game_id;
        	
        	//游戏其它信息
        	this.__get_cmp("game_intro").setValue(base_info.game_intro);
        	this.__get_cmp("game_desc").setValue(base_info.game_desc);
        	this.__get_cmp("seo_title").setValue(base_info.seo_title);
        	this.__get_cmp("seo_desc").setValue(base_info.seo_desc);
        	this.__get_cmp("seo_keywords").setValue(base_info.seo_keywords);
        	
        	//游戏包下载信息
        	var gameChannelStore = new Ext.data.SimpleStore({
                fields:[ 
                    'channel_id','channel_name'
				],
                data: game_channel
            });
        	if(null != sub_games && undefined != sub_games && sub_games.length > 0) {
        		var formGamePackInfo = Ext.getCmp("GameBaseInfoPanel:formGamePackInfo");
        		var mainSubId = base_info.main_sub_id;
        		for(var i = 0 ; i < sub_games.length ; i++){
          		     var sub = sub_games[i];
          		     var subPack = {columnWidth : 1, layout : "column", items : []};
          		     subPack.items.push(
      		    		{columnWidth : .1,  layout : "form", labelWidth: 30, items : [{xtype:"numberfield", fieldLabel : "子ID", anchor : "98%", disabled : true, value:sub.sub_id}] }
          		     );
          		     
          		     subPack.items.push(
      		    		 {columnWidth : .2,  layout : "form", labelWidth: 80, items : [
								{xtype:"combo", fieldLabel : "渠道(客户端)",anchor : "96%", editable : false, disabled: true,
									store: new Ext.data.JsonStore({
										fields:[ 
										        {name: 'channel_id'},
										        {name: 'channel_name'}
										],
								        data: game_channel
								    }), 
									displayField:'channel_name',  valueField:'channel_id', typeAhead: true,
									mode: 'local' , forceSelection: true,
									triggerAction: 'all', allowBlank:true,
									emptyText:'未选', width: 120, selectOnFocus:true, value: sub.channel_id
								}
                         ]}
      		         );
          		     subPack.items.push(
      		    		 {columnWidth : .2,  layout : "form", labelWidth: 60, items : [{xtype:"textfield", fieldLabel : "版本名称",anchor : "96%", value:sub.sub_game_name}] }
					 );
          		     subPack.items.push(
      		    		 {columnWidth : .3,  layout : "form", labelWidth: 60, items : [{xtype:"textfield", fieldLabel : "下载地址",anchor : "96%", value:sub.down_url}] }
  		    		 );
          		     subPack.items.push(
      		    		 {columnWidth : .15, layout : "form", labelWidth: 70,items : [{xtype:"textfield", fieldLabel : "包大小(MB)",anchor : "96%", value:sub.file_size}] }
  		    		 );
					 if(sub.channel_id == '20') {
						if(mainSubId == sub.sub_id) {
							subPack.items.push(
								{columnWidth : .05, layout : "form",items : [{xtype:"button", text:"主包", disabled: true, anchor : "96%"}]}                                          
							);
						} else {
							subPack.items.push(
								{columnWidth : .05, layout : "form",items : [{xtype:"button", text:"设为主包",anchor : "96%", handler : function(){
									//获取子ID
									var sub_id = this.ownerCt.previousSibling().previousSibling().previousSibling().previousSibling().previousSibling().items.items[0].getValue();
									var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
		       						myMask.show();
		                           	Ext.Ajax.request({
										url: SAVE_URLS.CHANGE_TO_BE_MASTER,
										params: {'game_id':base_info.game_id, 'sub_id': sub_id},
										success: function(resp,otps){
										   myMask.hide();
										   var obj = Ext.decode(resp.responseText);
										   if(obj.success){
											   location.reload();
										   } else {
											   utils.show_msg(obj.msg);
										   }
										},
										failure : function(resp ,otps){
										   myMask.hide();
										   utils.show_msg("发送请求时发生错误");
										}
		                       		});
								}}]}                                          
							);
						}
					 }
          		     
					 formGamePackInfo.add(subPack);
        		}
        		formGamePackInfo.doLayout();//新增后布局刷新
        	}
        	
        	//游戏截图信息
        	if(null != game_pics && undefined != game_pics && game_pics.length > 0) {
        		var formGamePicsInfo = Ext.getCmp("GameBaseInfoPanel:formGamePicsInfo");
        		for(var i=0; i<game_pics.length; i++) {
        			var pic = game_pics[i];
        			var pic_var = 
		        		{columnWidth : 1, layout : "column", style:'border-bottom:2px solid #D3D3D3;padding: 10 0 10 0', items : [
								{columnWidth : .05, layout : "form", labelWidth: 10, items : [                                     
	                                 {checked: false,xtype : 'checkbox',anchor : "48%"}
								]},
								{columnWidth : .1, layout : "form", labelWidth: 20,items : [                                     
								      {xtype:"textfield", fieldLabel : "ID", anchor : "80%", value: pic.id, disabled: true},
								]},
		                       	{columnWidth : .1, layout : "form", labelWidth: 30,items : [                                     
	                                 {xtype:"numberfield", fieldLabel : "权重", anchor : "80%", value: pic.weight},
		                       	]},
		                       	{columnWidth : .75, layout : "column", items : [
									{columnWidth : 1, layout : "column", items : [
									  	  {columnWidth : .15, layout : "form", labelWidth: 40, items : [             
									           {xtype:"radio", name:"pic_radio_"+i, boxLabel:"图片URL:",anchor : "96%"},
									  	  ]},
									  	  {columnWidth : .85, layout : "form", items : [             
									           {xtype:"textfield", anchor : "96%"}
									      ]},
									]},                                     
									{columnWidth : 1, layout : "column", items : [
										  {columnWidth : .3, layout : "form", labelWidth: 40, items : [     
									           {xtype:"radio", name:"pic_radio_"+i, boxLabel:"本地上传:", checked: true,anchor : "100%"}
										  ]},
										  {columnWidth : .15, layout : "form", items : [             
									           {xtype: 'box', autoEl: {src:  pic.pic_url, tag: 'img', complete: 'off', width:60, height: 60} },
									      ]},
									      {columnWidth : .55, layout : "form", items : [             
									           {xtype: 'textfield', inputType: "file", listeners:{
									            	 change : function (file,oldValue,newValue){
									                	   var img = this.ownerCt.previousSibling().items.items[0]; 
									                	   var el = this.getEl();
									                	   img.getEl().dom.src = window.URL.createObjectURL(el.dom.files[0]);
									             		}
									           }}
									      ]},
									]},                                     
		                       	]},
		           		]};
        			formGamePicsInfo.add(pic_var);
        		}
        		formGamePicsInfo.doLayout(); //新增后布局刷新
        	}
        },
        
        //从字典中加载游戏类别
        createGameCateGoryStore : function(){
        	return new Ext.data.JsonStore({
        		url: "adminDictionary/getItems",
    	    	baseParams: {'group_code':'GAME_CATEGORY'},//获取游戏类别类型
    	    	root: 'data',
    	    	idProperty: 'code',
    	    	totalProperty: 'total_count',
    	    	fields:[ 
    	          {name: 'code'},
    	          {name: 'name'}
    	        ],
                listeners :{
		        	load : function(s){
		        		var gameCategory = Ext.getCmp("game_category").getValue();
		        		Ext.getCmp("game_category").setValue(gameCategory);
		        	}
		        	
		        }
            });
        },
        
        //加载游戏渠道
        createGameChannelStore : function(){
        	return new Ext.data.JsonStore({
        		url: QUERY_URLS.GET_GAME_CHANNELS,
        		baseParams: {'game_id': this.game_id},//获取游戏类别类型
        		root: 'data',
        		idProperty: 'channel_id',
        		totalProperty: 'total_count',
        		fields:[ 
        		        {name: 'channel_id'},
        		        {name: 'channel_name'}
        		]
        	});
        },
        
        
        
	});

	exports.GameBaseInfoPanel = GameBaseInfoPanel;
});