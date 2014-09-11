var netSetting = (function(){
	var netSetList = {};
	var maxID = 0;
	showList();
		
	function showList(){
		// 全局变量 * 2
		defautlUrl = localStorage.getItem("defaultUrl");
		defautlID = localStorage.getItem("defaultID");

		netSetList = core.getStorage("netSetList");
		// 要判定为null的情况
		if(netSetList && typeof netSetList === "object" ){
			var $tpl = $("#netSettingTpl"),
				$target = $("#netSettingList");
				
			var tp = $tpl.val(),
				newTp = '',
				obj = {};
				for(var val in netSetList){
					obj = netSetList[val];
					newTp += $.template(tp, obj);
					maxID = maxID < val ? val : maxID ;
				}
			$target.html(newTp);
		}else{
			netSetList = {};
			// $.ui.loadContent('netEdit',false,false,'fade');
		}
	}
	function setDefault(i){
		app.appUrl = netSetList[i].url;
		app.defaultUrl = app.appUrl;
		localStorage.setItem("defaultUrl", netSetList[i].url);
		localStorage.setItem("defaultName", netSetList[i].name);
		localStorage.setItem("defaultID", netSetList[i].id);
		app.isInit = false;
		app.init();
	}
	function save(myid){
		var i = myid ? myid : ++maxID;
		url = $("#netUrlInput").val();
		name = $("#netNameInput").val();
		if( url == "" || name == "" ){ 
			$.ui.showMask("请填写完整");
			setTimeout(function(){
                    $.ui.hideMask();
                 },1200);
			return false;
		}
		_save(i,url,name);
		//返回
		$.ui.goBack();
	}
	function _save(i,url,name){
		var set = _.findWhere(netSetList, { name: name });
		if(!set){
			set = {
				id: i,
				url: url,
				name: name
			}
			netSetList[i] = set;
			core.setStorage("netSetList",netSetList);
		}

		setDefault(set.id);
	}
	function edit(myid){
		var id="",name="",url="";
		if(myid){
			id = netSetList[myid].id;
			name = netSetList[myid].name;
			url = netSetList[myid].url;
		}
		$("#netIDInput").val(id);
		$("#netUrlInput").val(url);
		$("#netNameInput").val(name);
		$.ui.loadContent('netEdit',false,false,"fade");
	}
	function del(myid){
		if(!myid){
			myid = $("#netIDInput").val();
		}
		delete netSetList[myid];
		core.setStorage("netSetList",netSetList);		
		$.ui.goBack();
	}
	function getcodeurl(code){
		$('#selectNet').show().text("正在获取地址");
		$.jsonP({
			url: 		"http://cloud.ibos.cn/Api/Mobile/Geturl?callback=?&type=jsonp&code=" + code ,
			success: 	function(r){
				if(r.ret){
					url = r.data.url;
					name = r.data.tag;
					$('#selectNet').text(name);
					_save(++maxID,url,name);

					//载入LOGO
					if(r.data.logo != ""){
						core.util.loadImage(r.data.logo, function(img){
							$("#logo").attr("src", img.getAttribute("src"));
						});
					}
				}else{
					$('#selectNet').text("公司代码不存在");
				}			
			},
			error: 		function(r){$('#selectNet').text("服务器连接失败"); core.error}
		});
		if(code=="" || code=="demo"){
			$("#username").val("ibos");
			$("#password").val("ibosdemo");
		}
	}
	function clear(){
		core.removeStorage("defaultID");
		core.removeStorage("defaultLogin");
		core.removeStorage("defaultName");
		core.removeStorage("defaultUrl");
		core.removeStorage("lastUrl");
		core.removeStorage("lastUser");
		core.removeStorage("netSetList");
		netSetList = {};
	}
	return {
		showList:	showList,
		setDefault:	setDefault,
		save:		save,
		edit:		edit,
		del:		del,
		netSetList:netSetList,
		getcodeurl:getcodeurl,
		clear: 		clear 
	}
})()