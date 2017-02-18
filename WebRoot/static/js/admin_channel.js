define(function(require, exports, module) {
    var URLS = {
        GET: "adminChannel/getList",//获取列表url
    };
    var DELETE_URLS = {
    	GET: "adminChannel/delete",//删除对象url
    };
    var QUERY_URLS = {
        GET: "adminChannel/query",//查询对象url
    };
    var SAVE_URLS = {
         GET: "adminChannel/addChannel",//保存对象url
    };
    var UPDATE_URLS = {
         GET: "adminChannel/updateChannel",//更新存在的对象url
    };
        
    var utils = require('./utils.js');
    
    var createDataStore =  function() {
        return new Ext.data.JsonStore({
            autoDestroy: true,
            url: URLS.GET,
            baseParams: {start:0, limit: 50},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'total_count',
            fields:[ 
                {name: 'id'},
                {name: 'channel_id'},
                {name: 'channel_name'},
                {name: 'usable'},
                {name: 'operating_systems'},
                {name: 'weight'},
                {name: 'channel_home_url'},
                {name: 'channel_icon_url'},
                {name: 'app_icon_url'},
                {name: 'app_angle_url'},
                {name: 'web_icon_url'},
                {name: 'web_angle_url'},
            ]
        });
    };

    var myPanel = Ext.extend(Ext.grid.EditorGridPanel, {
        createColumn: function(me) {
            return [
                // new Ext.grid.RowNumberer,
                me.sm,
                {header: 'ID', dataIndex: 'id', align: 'left', sortable: true, width: 50,hidden : true},
                {header: '渠道ID', dataIndex: 'channel_id', align: 'left', sortable: false, width: 30},
                {header: '名称', dataIndex: 'channel_name', align: 'left', sortable: false, width: 80},
                {header: '是否可用', dataIndex: 'usable', align: 'left', sortable: false, width: 30, 
                	renderer: function(value){
                		if(value==1){
                			return '是';
                		}else{
                			return '否';
                		}
                	}
                },
                {header: '操作系统', dataIndex: 'operating_systems', align: 'left', sortable: false, width: 50},
                {header: '权重', dataIndex: 'weight', align: 'left', sortable: false, width: 30},
                {header: '渠道首页链接', dataIndex: 'channel_home_url', align: 'left', sortable: false, width: 100},
                {header: '渠道icon图片地址', dataIndex: 'channel_icon_url', align: 'left', sortable: false, width: 100},
                {header: 'app图标', dataIndex: 'app_icon_url', align: 'left', sortable: false, width: 100},
                {header: 'app角标', dataIndex: 'app_angle_url', align: 'left', sortable: false, width: 100},
                {header: '网站图标', dataIndex: 'web_icon_url', align: 'left', sortable: false, width: 100},
                {header: '网站角标', dataIndex: 'web_angle_url', align: 'left', sortable: false, width: 100},
            ];
        },
      
        viewConfig : {
        	forceFit: true,
        },
        
        constructor: function() {
            var me = this;
            me.pageSize = 50; 
            me.store = createDataStore();
            me.sm = new Ext.grid.CheckboxSelectionModel();
            me.column = me.createColumn(me);
            Ext.QuickTips.init();
            Ext.form.Field.prototype.msgTarget='side';
            myPanel.superclass.constructor.call(this, {
                id: "tab:admin:channel_list",
                title: "渠道列表",
                columns: me.column,
                layout: 'fit',
                loadMask: true,
                bbar: new Ext.PagingToolbar({store: this.store, pageSize: this.pageSize, displayInfo: true}),
                tbar: new Ext.Toolbar([
                    {xtype: 'button', text: '增加',  width: 60, icon: 'static/libs/icons/add.png', 
                         handler:  function(){
                        	 var addWin = null;
              		         if(!addWin){
              		        	addWin = new Ext.Window({//加载窗体
              		                 layout:'fit',
              		                 width:550,
              		                 height:650,
              		                 plain: true,
              		                 items: new Ext.FormPanel({//加载form表单
              		                 labelWidth: 110, // label settings
                      		               frame:true,
                      		               title: '新增渠道信息',
                      		               bodyStyle:'padding:5px 5px 0',
                      		               width: 550,
                      		               defaults: {width: 530},
                      		               defaultType: 'textfield',
                      		               items: [
	                      		                  {fieldLabel: '名称', id : "channel_name", name: 'channel_name', value : "",  allowBlank:false,width:230},
	                      		                  {width:50, xtype: 'combo', mode: 'local', value: "1", triggerAction:  'all',forceSelection: true,width:100,
		                                           editable: false, fieldLabel:'是否可用', name: 'title', id : "usable", hiddenName:'usable',
		                                           displayField:'name', valueField:'value', store: new Ext.data.JsonStore({
		                                                   fields : ['name', 'value'],
		                                                   data   : [
		                                                       {name : '是',   value: '1'},
		                                                       {name : '否',  value: '0'},
		                                                   ]
		                                               })
	                      		                  },
	                      		                  {width:50, xtype: 'combo', mode: 'local', value: "1", triggerAction:  'all',forceSelection: true,width:100,
			                                           editable: false, fieldLabel:'是否可用', name: 'operating_systems', id : "operating_systems", hiddenName:'operating_systems',
			                                           displayField:'name', valueField:'value', store: new Ext.data.JsonStore({
			                                                   fields : ['name', 'value'],
			                                                   data   : [
			                                                       {name : 'android',   value: '1'},
			                                                       {name : 'ios',  value: '2'},
			                                                   ]
			                                               })
		                      		                  },
	                      		                  {xtype : 'numberfield', fieldLabel: '权重', name: 'weight', id : "weight", value : "",  allowBlank:false, blankText:"请填入非空的数字",width:230},
                      		                      {fieldLabel: '渠道首页链接',name: 'channel_home_url',id : "channel_home_url", value : "",width:230},
  		                                    	  
		                                    	  {xtype: 'compositefield', fieldLabel: '渠道icon图片地址',
	  		                                             items: [
	  		                                                   {fieldLabel: '渠道icon图片地址',name: 'a_channel_icon_url',id : "a_channel_icon_url" ,xtype: 'box', autoEl: {src: "", tag: 'img', complete: 'off',width:230, height: 72}},
	  				                                       	   {xtype: 'textfield',id : "a_ciu_file", width : '65',inputType: "file",
	  		                  		                    	   listeners:{
	  				                                    		   change : function (file,oldValue,newValue){
	  		       		                                           var el = Ext.getCmp("a_ciu_file").getEl();
	  		       		                                           Ext.get("a_channel_icon_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
	  				                                    		}  
	  				                                    	   }},
	  		                                              ]
	  		                          		          },
		                                    	  
		                                    	  
  		                                    	  {xtype: 'compositefield', fieldLabel: 'app图标',
	  		                                             items: [
	  		                                                   {fieldLabel: 'app图标',name: 'a_app_icon_url',id : "a_app_icon_url" ,xtype: 'box', autoEl: {src: "", tag: 'img', complete: 'off',width:230, height: 72}},
	  		  		                                       	   {xtype: 'textfield',id : "a_app_icon_file", width : '65',inputType: "file",
	  		                    		                    	  listeners:{
	  		  		                                    		   change : function (file,oldValue,newValue){
	  		         		                                           var el = Ext.getCmp("a_app_icon_file").getEl();
	  		         		                                           Ext.get("a_app_icon_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
	  		  		                                    		}  
	  		  		                                    	  }},
	  		                                              ]
	  		                          		          },
		                                    	  
		                                    	  {xtype: 'compositefield', fieldLabel: 'app角标',
	  		                                             items: [
															{fieldLabel: 'app角标',name: 'a_app_angle_url',id : "a_app_angle_url" ,xtype: 'box', autoEl: {src: "", tag: 'img', complete: 'off',width:230, height: 72}},
																  {xtype: 'textfield',id : "a_app_angle_file", width : '65',inputType: "file",
															  listeners:{
																   change : function (file,oldValue,newValue){
															        var el = Ext.getCmp("a_app_angle_file").getEl();
															        Ext.get("a_app_angle_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
																}  
															}},
	  		                                              ]
	  		                          		          },
		                                    	
  		                                    	  {xtype: 'compositefield', fieldLabel: '网站图标',
  		                                             items: [
  		                                                   
  		                                                     {fieldLabel: '网站图标',name: 'a_web_icon_url',id : "a_web_icon_url" ,xtype: 'box', autoEl: {src: "", tag: 'img', complete: 'off',width:230, height: 72}},
  		    		                                       	  {xtype: 'textfield',id : "a_web_icon_file", width : '65',inputType: "file",
  		                      		                    	  listeners:{
  		    		                                    		   change : function (file,oldValue,newValue){
  		           		                                           var el = Ext.getCmp("a_web_icon_file").getEl();
  		           		                                           Ext.get("a_web_icon_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
  		    		                                    		}  
  		    		                                    	  }},
  		    		                                    	  
  		                                              ]
  		                          		          },
 		                                    	  
 		                                    	   {xtype: 'compositefield', fieldLabel: '网站角标',
 		                                             items: [
 		                                                    {fieldLabel: '网站角标',name: 'a_web_angle_url',id : "a_web_angle_url" ,xtype: 'box', autoEl: {src: "", tag: 'img', complete: 'off',width:230, height: 72}},
 		  		                                       	  	{xtype: 'textfield',id : "a_web_angle_file", width : '65',inputType: "file",
 		                    		                    	  listeners:{
 		  		                                    		   change : function (file,oldValue,newValue){
 		         		                                           var el = Ext.getCmp("a_web_angle_file").getEl();
 		         		                                           Ext.get("a_web_angle_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
 		  		                                    		   }  
 		                    		                    	}},
 		                                              ]
 		                          		         },
 		                                    	  
                      		               ]
              		                 }),
              		         buttons: [
              		                   {
              		                	 text:'保存',
		                                 handler : function(){
		                                 if(Ext.getCmp("channel_name").isValid() && Ext.getCmp("usable").isValid() 
		                                		 && Ext.getCmp("weight").isValid()){
		                                	 //名称
		                                	 var name = Ext.getCmp("channel_name").getValue();
		                                	 //是否可用
		                                	 var usable = Ext.getCmp("usable").getValue();
		                                	 //操作系统
		                                	 var operating_systems = Ext.getCmp("operating_systems").getValue();
		                                	 //权重
		                                	 var weight = Ext.getCmp("weight").getValue();
		                                	 //渠道首页链接
		                                	 var channel_home_url = Ext.getCmp("channel_home_url").getValue();
		                                	 //渠道icon图片地址
		                                	 if(operating_systems == 1){
		                                		 operating_systems = 'android';
		                                	 }else{
		                                		 operating_systems = 'ios';
		                                	 }
		                                	 
		                                	 
		                                	 var form = new FormData();
                                          	 var wapFile = Ext.getCmp("a_ciu_file").getEl().dom.files[0];
                                           	 if(wapFile != undefined && wapFile != ""){
                                           		 form.append("channel_icon_url_file", wapFile);
                                           	 }
                                           	 
                                           	 //app图标
                                           	 var appIconFile = Ext.getCmp("a_app_icon_file").getEl().dom.files[0];
                                           	 var appIconSrc = Ext.get("a_app_icon_url").dom.src;
                                           	 if(appIconFile != undefined && appIconFile != ""){
                                           		 form.append("app_icon_file", appIconFile);
                                           	 }
                                           	 if(appIconSrc != undefined && appIconSrc != "" ){
                                           		form.append("app_icon_url_src", appIconSrc);
                                           	 }
                                           	 
                                           	 //app角标
                                           	 var appAngleFile = Ext.getCmp("a_app_angle_file").getEl().dom.files[0];
                                           	 var appAngleSrc = Ext.get("a_app_angle_url").dom.src;
                                           	 if(appAngleFile != undefined && appAngleFile != ""){
                                           		 form.append("app_angle_file", appAngleFile);
                                           	 }
                                           	 if(appAngleSrc != undefined && appAngleSrc != "" ){
                                           		form.append("app_angle_url_src", appAngleSrc);
                                           	 }
                                           	 //web图标
                                           	 var webIconFile = Ext.getCmp("a_web_icon_file").getEl().dom.files[0];
                                           	 var webIconSrc = Ext.get("a_web_icon_url").dom.src;
                                           	 if(webIconFile != undefined && webIconFile != ""){
                                           		 form.append("web_icon_file", webIconFile);
                                           	 }
                                           	 if(webIconSrc != undefined && webIconSrc != "" ){
                                           		form.append("web_icon_url_src", webIconSrc);
                                           	 }
                                           	 //web角标
                                           	 var webAngleFile = Ext.getCmp("a_web_angle_file").getEl().dom.files[0];
                                           	 var webAngleSrc = Ext.get("a_web_angle_url").dom.src;
                                           	 if(webAngleFile != undefined && webAngleFile != ""){
                                           		 form.append("web_angle_file", webAngleFile);
                                           	 }
                                           	 if(webAngleSrc != undefined && webAngleSrc != "" ){
                                           		form.append("web_angle_url_src", webAngleSrc);
                                           	 }
                                           	 
                                           	 
                                           	 
                                             //存放上传本地文件控件或者服务器图片URL
           					            	 form.append("channel_name", name);
           					            	 form.append("usable",usable);
           					            	 form.append("operating_systems",operating_systems);
           					            	 form.append("weight", weight);
           					            	 form.append("channel_home_url", channel_home_url);
           					            	 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "请耐心等待正在保存中..." });
           					            	 myMask.show();
	                                         var xmlhttp = new XMLHttpRequest();
	                                         xmlhttp.open("POST", SAVE_URLS.GET, true);
	                                         xmlhttp.onload = function(e){
	                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
	                                         	 myMask.hide();
	                                         	 if(resp.isUpdateSuccess){
	                                         	   utils.show_msg(resp.msg);
	                                         	   me.store.load({params: {start:0, limit: me.pageSize}});
	                                         	   editWin.close();
	                                             }else{
	                                            	 me.store.load({params: {start:0, limit: me.pageSize}});
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
		                                   	            utils.show_msg("新增渠道后台异常!");
		                                   	            return;
		                                   	        }  
		                                   	    }   
	 		                                  }

		                                 }else{
		                                	 utils.show_msg("信息校验不通过!请重新填写!");
		                                 }
		                                }
                                 },
	                             {text: '取消', handler: function(){  addWin.close(); }
	                             }]
              		            });
              		         }
              		       addWin.show(this);
                         }
                    },
                    ' ', ' ', ' ',
                    {xtype: 'button', text: '删除',  width: 60, icon: 'static/libs/icons/delete.png', 
                    	 handler: function (){
                    		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                    		 if(sels && sels.length == 1){
                    			 Ext.MessageBox.confirm('删除选择框', '确定要删除？', function(btn) {  
                    				    if(btn == 'yes'){
                	        				 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "正在处理中,请耐心等待..." });
                     						 myMask.show();
                                         	 Ext.Ajax.request({
                                         		   url: DELETE_URLS.GET,
                                         		   params: {'deleteId':sels[0].id, 'channel_id':sels[0].data.channel_id,'channel_name':sels[0].data.channel_name},
                                         		   success: function(resp,otps){
                                         			   myMask.hide();
                                         			   var obj = Ext.decode(resp.responseText);
                                         			   utils.show_msg(obj.msg);
                                         			   if(obj.success){
                                         				   me.store.load({params: {start:0, limit: me.pageSize}});
                                         			   }
                                         		   },
                                         		   failure : function(resp ,otps){
                                         			   myMask.hide();
                                         			   utils.show_msg("failure of delete");
                                         		   }
                                         		});
                    				    }
                    				}); 
                    		 }
                    		 else{
                    			 utils.show_msg("请选择一条记录删除");
                    		 }
                    	 }
                    },
                    {xtype: 'button', text: '修改',  width: 60, icon: 'static/libs/icons/application_edit.png', 
                   	 handler: function (){
                   		 var sels = me.getSelectionModel().getSelections();// 获取选择的记录
                   		 var queryId = null;
                   		 if(sels && sels.length == 1){
                   			queryId = sels[0].id;
                   			Ext.Ajax.request({
                   	            url: QUERY_URLS.GET+"?queryId="+queryId,
                   	            params: {"queryId":queryId},
                   	            method : "POST",
                   	            success: function(resp, opts){
                   	             var obj = Ext.decode(resp.responseText);
                   	             var queryFlag = obj.queryFlag;
                   	             if(!queryFlag){
                   	            	 utils.show_msg(obj.msg);
                   	            	 return;
                   	             }
                   	             var updateObject = obj.updateObject;
                          			var eidtWin = null;
                          		         if(!eidtWin){
                          		        	eidtWin = new Ext.Window({//加载窗体
                          		                 layout:'fit',
                          		                 width:550,
                          		                 height:650,
                          		                 plain: true,
                          		                 items: new Ext.FormPanel({//加载form表单
                          		                 labelWidth: 110, // label settings
		                          		               frame:true,
		                          		               title: '编辑渠道信息',
		                          		               bodyStyle:'padding:5px 5px 0',
		                          		               width: 550,
		                          		               defaults: {width: 530},
		                          		               defaultType: 'textfield',
		                          		               items: [
		                          		                      {fieldLabel: 'id', id : "id", value : updateObject.id, hidden :true },
			                          		                  {fieldLabel: '渠道ID',  disabled : true,  id : "channel_id", value : updateObject.channel_id,  allowBlank:false,width:230}, 
		                          		                      {fieldLabel: '渠道名称',id : "channel_name", value : updateObject.channel_name, allowBlank:false,width:230},
		                          		                      {width: 50, xtype:'combo', mode:'local', value: updateObject.usable, triggerAction: 'all',
				                                               forceSelection: true, editable:false, fieldLabel:'是否可用', name:'title',
				                                               id : "usable", hiddenName:'title',displayField:'name',valueField: 'value',width:230,
				                                               store:new Ext.data.JsonStore({
				                                                       fields : ['name', 'value'],
				                                                       data   : [
				                                                           {name : '是',   value: '1'},
				                                                           {name : '否',  value: '0'},
				                                                       ]
				                                                   })
		                          		                      },
		                          		                     {width: 50, xtype:'combo', mode:'local', value: (updateObject.operating_systems == 'android' ? 1 : (updateObject.operating_systems == 'ios' ? 2:null)) , triggerAction: 'all',
					                                               forceSelection: true, editable:false, fieldLabel:'是否可用', name:'u_operating_systems', allowBlank:false,
					                                               id : "u_operating_systems", hiddenName:'u_operating_systems',displayField:'name',valueField: 'value',width:230,
					                                               store:new Ext.data.JsonStore({
					                                                       fields : ['name', 'value'],
					                                                       data   : [
					                                                                 {name : 'android',   value: '1'},
								                                                     {name : 'ios',  value: '2'},
					                                                       ]
					                                                   })
			                          		                  }, 
		                          		                      
		                          		                    
		                          		                      {fieldLabel: '权重', xtype : 'numberfield', name: 'last', id : "weight", value : updateObject.weight, allowBlank:false, blankText:"请填入非空的数字",width:230 },
		                          		                      {fieldLabel: '渠道首页链接', name: 'last', id : "channel_home_url",  value : updateObject.channel_home_url,width:230},
		                          		                      
		                          		                    
		    		                                    	  {xtype: 'compositefield', fieldLabel: '渠道icon图片地址',
		    	  		                                             items: [
		    	  		                                                   {fieldLabel: '渠道icon图片地址',name: 'u_channel_icon_url',id : "u_channel_icon_url" ,xtype: 'box', autoEl: {src: updateObject.channel_icon_url, tag: 'img', complete: 'off',width:230, height: 72}},
		    	  				                                       	   {xtype: 'textfield',id : "u_ciu_file", width : '65',inputType: "file",
		    	  		                  		                    	   listeners:{
		    	  				                                    		   change : function (file,oldValue,newValue){
		    	  		       		                                           var el = Ext.getCmp("u_ciu_file").getEl();
		    	  		       		                                           Ext.get("u_channel_icon_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
		    	  				                                    		}  
		    	  				                                    	   }},
		    	  		                                              ]
		    	  		                          		          },
		    		                                    	  
		    		                                    	  
		      		                                    	  {xtype: 'compositefield', fieldLabel: 'app图标',
		    	  		                                             items: [
		    	  		                                                   {fieldLabel: 'app图标',name: 'u_app_icon_url',id : "u_app_icon_url" ,xtype: 'box', autoEl: {src: updateObject.app_icon_url, tag: 'img', complete: 'off',width:230, height: 72}},
		    	  		  		                                       	   {xtype: 'textfield',id : "u_app_icon_file", width : '65',inputType: "file",
		    	  		                    		                    	  listeners:{
		    	  		  		                                    		   change : function (file,oldValue,newValue){
		    	  		         		                                           var el = Ext.getCmp("u_app_icon_file").getEl();
		    	  		         		                                           Ext.get("u_app_icon_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
		    	  		  		                                    		}  
		    	  		  		                                    	  }},
		    	  		                                              ]
		    	  		                          		          },
		    		                                    	  
		    		                                    	  {xtype: 'compositefield', fieldLabel: 'app角标',
		    	  		                                             items: [
		    															{fieldLabel: 'app角标',name: 'u_app_angle_url',id : "u_app_angle_url" ,xtype: 'box', autoEl: {src: updateObject.app_angle_url, tag: 'img', complete: 'off',width:230, height: 72}},
		    																  {xtype: 'textfield',id : "u_app_angle_file", width : '65',inputType: "file",
		    															  listeners:{
		    																   change : function (file,oldValue,newValue){
		    															        var el = Ext.getCmp("u_app_angle_file").getEl();
		    															        Ext.get("u_app_angle_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
		    																}  
		    															}},
		    	  		                                              ]
		    	  		                          		          },
		    		                                    	
		      		                                    	  {xtype: 'compositefield', fieldLabel: '网站图标',
		      		                                             items: [
		      		                                                   
		      		                                                     {fieldLabel: '网站图标',name: 'u_web_icon_url',id : "u_web_icon_url" ,xtype: 'box', autoEl: {src: updateObject.web_icon_url, tag: 'img', complete: 'off',width:230, height: 72}},
		      		    		                                       	  {xtype: 'textfield',id : "u_web_icon_file", width : '65',inputType: "file",
		      		                      		                    	  listeners:{
		      		    		                                    		   change : function (file,oldValue,newValue){
		      		           		                                           var el = Ext.getCmp("u_web_icon_file").getEl();
		      		           		                                           Ext.get("u_web_icon_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
		      		    		                                    		}  
		      		    		                                    	  }},
		      		    		                                    	  
		      		                                              ]
		      		                          		          },
		     		                                    	  
		     		                                    	   {xtype: 'compositefield', fieldLabel: '网站角标',
		     		                                             items: [
		     		                                                    {fieldLabel: '网站角标',name: 'u_web_angle_url',id : "u_web_angle_url" ,xtype: 'box', autoEl: {src: updateObject.web_angle_url, tag: 'img', complete: 'off',width:230, height: 72}},
		     		  		                                       	  	{xtype: 'textfield',id : "u_web_angle_file", width : '65',inputType: "file",
		     		                    		                    	  listeners:{
		     		  		                                    		   change : function (file,oldValue,newValue){
		     		         		                                           var el = Ext.getCmp("u_web_angle_file").getEl();
		     		         		                                           Ext.get("u_web_angle_url").dom.src = window.URL.createObjectURL(el.dom.files.item(0));
		     		  		                                    		   }  
		     		                    		                    	}},
		     		                                              ]
		     		                          		         },
		                          		                      
		                          		               ]
                          		                 }),
                          		                 
                          		         buttons: [
                          		                   {
                          		                	 text:'保存',
		                                             handler : function(){
		                                            	 if(Ext.getCmp("channel_name").isValid() && Ext.getCmp("usable").isValid() 
		                                            			 && Ext.getCmp("weight").isValid() && Ext.getCmp("u_operating_systems").isValid()){
			                                              	 //id
		                                            		 var id = Ext.getCmp("id").getValue();
			                                              	 //名称值
			                                              	 var name = Ext.getCmp("channel_name").getValue();
			                                              	 //是否可用
			                                              	 var usable = Ext.getCmp("usable").getValue();
			                                              	 //权重
			                                              	 var weight = Ext.getCmp("weight").getValue();
			                                              	 //渠道首页链接
			                                              	 var channel_home_url = Ext.getCmp("channel_home_url").getValue();
			                                              	 //操作系统
			    		                                	 var operating_systems = Ext.getCmp("u_operating_systems").getValue();
			    		                                	 //渠道icon图片地址
			    		                                	 if(operating_systems == 1){
			    		                                		 operating_systems = 'android';
			    		                                	 }else{
			    		                                		 operating_systems = 'ios';
			    		                                	 }
			                                              	 
			                                              	 //渠道icon图片地址
			                                             	 var form = new FormData();
			                                              	 var wapFile = Ext.getCmp("u_ciu_file").getEl().dom.files[0];
		                                                   	 var wapSrc = Ext.get("u_channel_icon_url").dom.src;
		                                                   	 if(wapFile != undefined && wapFile != ""){
		                                                   		 form.append("channel_icon_url_file", wapFile);
		                                                   	 }
		                                                   	 if(wapSrc != undefined && wapSrc != "" ){
		                                                   		form.append("channel_icon_url_src", wapSrc);
		                                                   	 }
		                                                   	 
		                                                   	 //app图标
		                                                   	 var appIconFile = Ext.getCmp("u_app_icon_file").getEl().dom.files[0];
		                                                   	 var appIconSrc = Ext.get("u_app_icon_url").dom.src;
		                                                   	 if(appIconFile != undefined && appIconFile != ""){
		                                                   		 form.append("app_icon_file", appIconFile);
		                                                   	 }
		                                                   	 if(appIconSrc != undefined && appIconSrc != "" ){
		                                                   		form.append("app_icon_url_src", appIconSrc);
		                                                   	 }
		                                                   	 
		                                                   	 //app角标
		                                                   	 var appAngleFile = Ext.getCmp("u_app_angle_file").getEl().dom.files[0];
		                                                   	 var appAngleSrc = Ext.get("u_app_angle_url").dom.src;
		                                                   	 if(appAngleFile != undefined && appAngleFile != ""){
		                                                   		 form.append("app_angle_file", appAngleFile);
		                                                   	 }
		                                                   	 if(appAngleSrc != undefined && appAngleSrc != "" ){
		                                                   		form.append("app_angle_url_src", appAngleSrc);
		                                                   	 }
		                                                   	 //web图标
		                                                   	 var webIconFile = Ext.getCmp("u_web_icon_file").getEl().dom.files[0];
		                                                   	 var webIconSrc = Ext.get("u_web_icon_url").dom.src;
		                                                   	 if(webIconFile != undefined && webIconFile != ""){
		                                                   		 form.append("web_icon_file", webIconFile);
		                                                   	 }
		                                                   	 if(webIconSrc != undefined && webIconSrc != "" ){
		                                                   		form.append("web_icon_url_src", webIconSrc);
		                                                   	 }
		                                                   	 //web角标
		                                                   	 var webAngleFile = Ext.getCmp("u_web_angle_file").getEl().dom.files[0];
		                                                   	 var webAngleSrc = Ext.get("u_web_angle_url").dom.src;
		                                                   	 if(webAngleFile != undefined && webAngleFile != ""){
		                                                   		 form.append("web_angle_file", webAngleFile);
		                                                   	 }
		                                                   	 if(webAngleSrc != undefined && webAngleSrc != "" ){
		                                                   		form.append("web_angle_url_src", webAngleSrc);
		                                                   	 }
			                                            	 
		                                                     //存放上传本地文件控件或者服务器图片URL
		       	           					            	 form.append("updateId", id);
		       	           					            	 form.append("channel_name", name);
		       	           					            	 form.append("usable",usable);
		       	           					            	 form.append("operating_systems",operating_systems);
		       	           					            	 form.append("weight", weight);
		       	           					            	 form.append("channel_home_url", channel_home_url);
		       	           					            	 var myMask = new Ext.LoadMask(Ext.getBody(), {msg: "请耐心等待正在保存关联商品渠道信息中..." });
		       	           					            	 myMask.show();
	         		                                         var xmlhttp = new XMLHttpRequest();
	         		                                         xmlhttp.open("POST", UPDATE_URLS.GET, true);
	         		                                         xmlhttp.onload = function(e){
	         		                                         var resp = Ext.util.JSON.decode(e.currentTarget.response);
	         		                                         	 myMask.hide();
	         		                                         	 if(resp.isUpdateSuccess){
	         		                                         	   utils.show_msg(resp.msg);
	                                            				   me.store.load({params: {start:0, limit: me.pageSize}});
	                                            				   eidtWin.close();
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
		         		                                   	            utils.show_msg("同步更新关联的商品渠道名称数据过大超时 或者 后台异常!");
		         		                                   	            return;
		         		                                   	        }  
		         		                                   	    }   
		         		                                   	 }
				                                            	
		                                            	  }else{
		                                            		  utils.show_msg("信息校验不通过!请重新填写!");
		                                            	  }
		                                             }
                          		                 },
		                                         {text: '取消', handler: function(){eidtWin.close(); }}
                          		              ]
                          		           });
                          		         }
                          		       eidtWin.show(this);
                   	            },
                   	            failure: function(resp, otps){
                   	            	utils.show_msg("修改失败");
                   	            }
                   	        });
                   		 }
                   		 else{
                   			 utils.show_msg("请选择一条记录修改");
                   		 }
                   	 }
                   }
                ]),
                listeners:  {
                    render: function() {
                        me.store.load({params: {start:0, limit: this.pageSize}});
                    }
                }
            });
        },
        
    });
    
    var viewPort = new Ext.Viewport({
        layout: 'fit',
        items: [{
            xtype: 'panel',
            items: [new myPanel()],
            layout: 'fit',
            region: 'center'
        }]
    });

    viewPort.render(document.body);
});
