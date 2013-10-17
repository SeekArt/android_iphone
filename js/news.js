/**
* appInit

* @author Aeolus
* @copyright IBOS
*/
var appInit = (function(){
	var isLogin = false,
		isInit = false,
		appUrl = defaultUrl = localStorage.getItem("defaultUrl") ,
		formHash = '';
		
	function init(){
		if(!appInit.isInit){
			//初始化完整的路径
			appInit.appUrl += "/?r=mobile";
			// $.jsonP({
				// url: 		appInit.appUrl + '&callback=?',
				// success: 	checkLogin,
				// error: 		function(err){	console.log(err)	}
			// });		
			appInit.isInit = true;
		}
	}
	
	function login(){
		var username = $("#username").val(),
			password = $("#password").val(),
			gps = $("#gpsInput").val(),
			address = $("#addressInput").val();
			
		//以下登录换用了rpc
		// doLogin(username,password);		
		$.jsonP({
			url: 		appInit.appUrl + '/default/login&callback=?&username=' + username +'& password=' + password + '&gps=' + gps + '&address=' + address,
			success: 	checkLogin,
			error: 		function(err){	
				$.ui.popup('服务器错误,请检查');
				console.log(err);
			}
		});
	}
	//这是用rpc形式请求的登录
	// function doLogin(a,b){
		// var client = new HproseHttpClient(appUrl + "/api", ["login"]);
		// client.login(a,b, function(result) {
			// $.ui.loadContent('main',false,false,'fade');
		// });
		
	// }
	
	function logout(){
		$.jsonP({
			url: 		appInit.appUrl + '/default/logout&callback=?&formhash=' + formHash,
			success: 	checkLogin,
			error: 		function(err){	console.log(err) }
		});
	}
	
	function checkLogin(json){
		if(json.login==true){
			$.ui.loadContent('main',false,false,'fade');
			formHash = json.formhash;
			isLogin = true;
		}else{
			if(json.msg){
				$.ui.popup(json.msg);
			}
			$.ui.loadContent('login',false,false,'fade');
			console.log("dfdffffffffffffffffffffff");
		}
	}
	return {
		isInit:		isInit,
		defaultUrl:	defaultUrl,
		appUrl:		appUrl,
		init:		init,
		login:		login,
		logout:		logout,
		checkLogin:	checkLogin
	}
	
})()

$(document).ready(function(){
	appInit.init();
})

var netSetting = (function(){
	var netSetList = new Object;
	var maxID = 0;
		
	function showList(){
		defautlUrl = localStorage.getItem("defaultUrl");
		defautlID = localStorage.getItem("defaultID");
		netSetList = getStorage("netSetList");
		if(typeof(netSetList) == "object" ){
			var $tpl = $("#netSettingTpl"),
				$target = $("#netSettingList");
				
			var tp = $tpl.val(),
				newTp = '',
				obj = {};
				for(var val in netSetList){
					obj = netSetList[val];
					newTp += $.template(tp, obj);
					maxID = maxID < val ? val:maxID ;
				}
			$target.html(newTp);
		}else{
			netSetList = new Object;
			$.ui.loadContent('netEdit',false,false,'fade');
		}
	}
	function setDefault(i){
		appInit.appUrl = netSetList[i].url;
		appInit.isInit = false;
		appInit.init();
		localStorage.setItem("defaultUrl", netSetList[i].url);
		localStorage.setItem("defaultName", netSetList[i].name);
		localStorage.setItem("defaultID", netSetList[i].id);
	}
	function save(myid){
		var i;
		if(myid){
			i = myid;
		}else{
			i = ++maxID;		
		}
		url = $("#netUrlInput").val();
		name = $("#netNameInput").val();
		if( url == "" || name == "" ){ 
			$.ui.showMask("请填写完整");
			setTimeout(function(){
                    $.ui.hideMask();
                 },1200);
			return false;
		}
		netSetList[i] = new Object;
		netSetList[i].id = new Object( i );
		netSetList[i].url = new Object(url);
		netSetList[i].name = new Object(name);
		setStorage("netSetList",netSetList);
		setDefault(i);
		//返回
		$.ui.goBack();
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
		setStorage("netSetList",netSetList);		
		$.ui.goBack();
	}
	return {
		showList:	showList,
		setDefault:	setDefault,
		save:		save,
		edit:		edit,
		del:		del,
		netSetList:netSetList
	}
})()

function showNetList(){ netSetting.showList(); }

/**
* 工具方法,获取和储存本地缓存
*
*/
function setStorage( key, val ){
	tmp = JSON.stringify(val);
	localStorage.setItem( key, tmp );
}
function getStorage( key ){
	var tmp = localStorage.getItem(key);
	return tmp?JSON.parse(tmp):"";
}


/**
* News
* @author Aeolus
* @copyright IBOS
*/
//因为面板的data-load限制，而特意写的调用函数
function newsInit(){ news.init(); }

var news = (function(){
	var newsCatId = 0,
		newsId = 0,
		isInit = false,
		newsPage = 1,
		newsUrl = function (){ return appInit.appUrl + '/news' };
		
	/**
	* 初始化新闻模块时，载入一些基础数据，比如分类，默认页新闻，未读条数等
	*/
	function init(){
		if(isInit){
			return false;
		}		
		news.loadCat();
		news.loadList(newsCatId);
		isInit = true;
	}
	
	function loadList(catid,page){
		//$(dom).parent().addClass("active"); //选中分类
		//$(dom).parent().siblings().removeClass("active"); //选中分类
		
		if(catid != newsCatId){
			$("#newsList").empty();
			newsCatId = catid;
		}
		if(page != newsPage && typeof(page) != "undefined" ){
			newsPage = page;
			pageurl = "&page=" + page;
		}else{
			$("#newsList").empty();
			pageurl = ''
		}
		
		$.jsonP({
			url: 		newsUrl() + "&callback=?&catid=" + newsCatId + pageurl,
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});
	}
	
	function loadCat(){
		$.jsonP({
			url: 		newsUrl() + "/category&callback=?",
			success: 	news.showCat,
			error: 		function(err){	console.log(err)	}
		});
	}
	
	function loadNews(id,dom){
		$("#newsContent").empty().css3Animate({ time: "300ms", opacity: 0 });
		$(dom).parent().removeClass("new"); //取消未读
		if(typeof id == 'undefined'){
			id = news.newsId;
		}
		
		$.jsonP({
			url: 		newsUrl() + "/show&callback=?&id="+id,
			success: 	news.showNews,
			error: 		function(err){	console.log(err)	 }
		});
	}
	
	function showList(json){
		var $tpl = $("#newsListTpl"),
			$target = $("#newsList");
			
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
			for(var val in json.datas){
				obj = json.datas[val]; //没有特殊要处理的则直接对象赋于就行了
				//obj.id = json.datas[val].readStatus?1:0  //有特殊处理的额外写
				newTp += $.template(tp, obj);
			}
		$target.append(newTp);
		
		$("#readMoreNews").remove();
		if( json.pages.pageCount > newsPage ){
			$target.append('<li id="readMoreNews"><a onclick="news.loadList(0,'+( newsPage + 1) +')">加载更多</a></li>');
		}
		
	}
	
	function showCat(json){
		// var $tpl = $("#newsCatTpl"),
			// $target = ;
		// var tp = $tpl.val(),
			// newTp = '',
			// obj = {};
			// for(var val in json){
				// if(newsCatId!=0 && json[val].catid == newsCatId){
					// json[val].classname = 'class="active"';
				// }else{
					// json[val].classname = ' ';
				// }
				// obj = json[val];
				// newTp += $.template(tp, obj);
			// }
		// $target.append(newTp);
		$("#newsCat").append(json);
	}
	
	function showNews(json){
		var $tpl = $("#newsContentTpl"),
			$target = $("#newsContent");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
			
			//对json数据做一些处理之后，赋给obj
			obj = json;
			newTp += $.template(tp, obj);
		$target.html(newTp).css3Animate({ time: "500ms", opacity: 1 });
	}
	
	function search(data){
		console.log(data);
		
		$("#newsList").empty();
		pageurl = ''
		
		$.jsonP({
			url: 		newsUrl() + "&callback=?&search=" + data + pageurl,
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});
		
	}
	
	return {
		init:			init,
		loadList: 		loadList,
		loadCat:		loadCat,
		loadNews:		loadNews,
		showList: 		showList,
		showCat:		showCat,
		showNews:		showNews,
		search:			search
	}
})();


/**
* mail
* @author Aeolus
* @copyright IBOS
*/
//因为面板的data-load限制，而特意写的调用函数
function mailInit(){ mail.init(); }

var mail = (function(){
	var mailCatId = 0,
		mailId = 0,
		isInit = false,
		mailPage = 1,
		mailUrl = function (){ return appInit.appUrl + '/mail' };
		
	/**
	* 初始化新闻模块时，载入一些基础数据，比如分类，默认页新闻，未读条数等
	*/
	function init(){
		if(isInit){
			return false;
		}		
		mail.loadCat();
		mail.loadList(mailCatId);
		isInit = true;
	}
	
	function loadList(catid,page){
		if( typeof(catid)== "string" ){
			stype = catid;
			catid = 0;
		}else if(catid != mailCatId){
			$("#mailList").empty();
			mailCatId = catid;
			stype = "";
		}else{
			stype = "";
		}
		if(page != mailPage && typeof(page) != "undefined" ){
			mailPage = page;
			pageurl = "&page=" + page;
		}else{
			$("#mailList").empty();
			pageurl = ''
		}
		
		$.jsonP({
			url: 		mailUrl() + "&callback=?&catid=" + mailCatId + "&type=" + stype + pageurl,
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});
	}
	
	function loadCat(){
		$.jsonP({
			url: 		mailUrl() + "/category&callback=?",
			success: 	mail.showCat,
			error: 		function(err){	console.log(err)	}
		});
	}
	
	function loadMail(id){
		$("#mailContent").empty().css3Animate({ time: "300ms", opacity: 0 });
		if(typeof id == 'undefined'){
			id = mail.mailId;
		}
		
		$.jsonP({
			url: 		mailUrl() + "/show&callback=?&id="+id,
			success: 	mail.showMail,
			error: 		function(err){ console.log(err) }
		});
	}
	
	function showList(json){
		var $tpl = $("#mailListTpl"),
			$target = $("#mailList");
			
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
			for(var val in json.list){
				obj = json.list[val]; //没有特殊要处理的则直接对象赋于就行了
				//obj.id = json.datas[val].readStatus?1:0  //有特殊处理的额外写
				newTp += $.template(tp, obj);
			}
		$target.append(newTp);
		
		$("#readMoreMail").remove();
		if( json.pages.pageCount > mailPage ){
			$target.append('<li id="readMoreMail"><a onclick="mail.loadList(0,'+( mail._get('mailPage')+1) +')">加载更多</a></li>');
		}
	}
	
	function showCat(json){
		var $tpl = $("#mailCatTpl"),
			$target = $("#mailCat");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
			for(var val in json.folders){
				if(mailCatId!=0 && json.folders[val].catid == mailCatId){
					json.folders[val].classname = 'class="active"';
				}else{
					json.folders[val].classname = ' ';
				}
				obj = json.folders[val];
				newTp += $.template(tp, obj);
			}
			if(json.noread>0){
				$.ui.updateBadge("#inbox", json.noread);
			}
		$target.append(newTp);
	}
	
	function showMail(json){
		var $tpl = $("#mailContentTpl"),
			$target = $("#mailContent");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
			
			//对json数据做一些处理之后，赋给obj
			obj = json;
			newTp += $.template(tp, obj);
		$target.html(newTp).css3Animate({ time: "500ms", opacity: 1 });
	}
	
	return {
		init:			init,
		loadList: 		loadList,
		loadCat:		loadCat,
		loadMail:		loadMail,
		showList: 		showList,
		showCat:		showCat,
		showMail:		showMail
	}
})();







/*------ funcion -------*/
function toDatetime(unix,type) {
    var dt = new Date(parseInt(unix) * 1000);
	var now = new Date();
	var datatime,Y,M,D,h,m,s;
		Y = dt.getFullYear();
		M = dt.getMonth() + 1 ;
		D = dt.getDate();
		h = dt.getHours();
		m = dt.getMinutes();
		s = dt.getSeconds();
		
	if(typeof(type) == "undefined"){type="u"}
	switch(type){
		case "u":
			var time = (now - dt)/1000;
				if (time > 604800){
					datatime = Y + "-" + M + "-" + D;
				} else if (time > 86400){
					datatime = Math.floor(time / 86400) + "天前";
				}else if (time > 3600) {
					datatime = Math.floor(time / 3600) + "小时前";
				} else if (time > 1800) {
					datatime = "半小时前";
				} else if (time > 60) {
					datatime = Math.floor(time / 60) + "分钟前" ;
				} else if (time >= 0) {
					datatime = time + "秒前" ;
				} else {
					datatime = Y + "-" + M + "-" + D;
				}			
			break;
		case "d":
			datatime = Y + "-" + M + "-" + D;
			break;
		case "dt":
			datatime = Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
			break;
	}
	return datatime;
}