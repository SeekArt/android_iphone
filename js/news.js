/**
* appInit

* @author Aeolus
* @copyright IBOS
*/
var appInit = (function(){
	var isLogin = false,
		isInit = false,
		appUrl = defaultUrl = localStorage.getItem("defaultUrl") ,
		user = core.getStorage("user"),
		uid	= localStorage.getItem("uid"),
		formHash = '';
	
	var userData = core.getStorage("ibosUserData");
	var _isset = true;
	if(!userData) {
		_isset = false;
		userData = {}
	}

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
			url: 		appInit.appUrl + '/default/login&callback=?&username=' + username +'& password=' + password + '&gps=' + gps + '&address=' + address + '&issetuser=' + _isset,
			success: 	function(res){
				if(res.userData){
					userData = res.userData;
					core.setStorage("ibosUserData", res.userData);
				}
				checkLogin(res);
			},
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
			appInit.user = json.user;
			appInit.uid = json.uid;
			localStorage.setItem("uid", appInit.uid);
			core.setStorage("user", appInit.user);
		}else{
			if(json.msg){
				$.ui.popup(json.msg);
			}
			$.ui.loadContent('login',false,false,'fade');
			console.log("dfdffffffffffffffffffffff");
		}
	}

	function getUserData(){
		return userData;
	}
	function getUser(uid){
		var datas = userData.datas;
		for(var i in datas) {
			if(datas[i].uid == uid) {
				return datas[i];
			}
		}
		return null;
	}
	function getUserName(ids){
		var argu = ids.split(",");
		var results = [];
		for(var i = 0; i < argu.length; i++){
			var user = getUser(argu[i]);
			if(user){
				results.push(user.realname);
			}
		}
		return results.join(",");
	}

	return {
		isInit:		isInit,
		defaultUrl:	defaultUrl,
		appUrl:		appUrl,
		uid:		uid,
		user:		user,
		init:		init,
		login:		login,
		logout:		logout,
		checkLogin:	checkLogin,

		getUserData: getUserData,
		getUser: 	getUser,
		getUserName:getUserName
	}
	
})()

$(document).ready(function(){
	appInit.init();
})




var netSetting = (function(){
	var netSetList = {};
	var maxID = 0;
		
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
					maxID = maxID < val ? val:maxID ;
				}
			$target.html(newTp);
		}else{
			netSetList = {};
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
		netSetList[i] = {
			id: i,
			url: url,
			name: name
		}
		core.setStorage("netSetList",netSetList);
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
		core.setStorage("netSetList",netSetList);		
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
* News
* @author Aeolus
* @copyright IBOS
*/
//因为面板的data-load限制，而特意写的调用函数
function newsInit(){ news.init(); }

var news = (function(){
	var newsCatId = 0, // 当前分类, 0为默认，显示所有
		newsId = 0, //
		isInit = false,
		newsPage = 1, // 当前页码
		newsUrl = function (){ return appInit.appUrl + '/news' };

	var list;
		
	/**
	* 初始化新闻模块时，载入一些基础数据，比如分类，默认页新闻，未读条数等
	*/
	function init(){
		if(isInit){
			return false;
		}
		
		list = new List('newsList', $("#newsListTpl").val(), {"id": "articleid"});
	
		news.loadCat();
		news.loadList(newsCatId);

		isInit = true;
	}
	//------ News List
	function loadList(catid, page){
		//$(dom).parent().addClass("active"); //选中分类
		//$(dom).parent().siblings().removeClass("active"); //选中分类
		var pageurl;

		$.ui.showMask();
		// 目录变更
		if(catid !== newsCatId) {
			newsCatId = catid;
			newsPage = 1;
		}
		// 页码变更
		if(typeof page !== "undefined" && page !== newsPage){
			newsPage = page;
		}

		pageurl = "&page=" + newsPage;

		$.jsonP({
			url: 		newsUrl() + "&callback=?&catid=" + newsCatId + pageurl,
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});

	}

	function showList(json){

		if(newsPage > 1){
			list.add(json.datas)
		}else{
			list.set(json.datas);
		}
		

		$("#readMoreNews").remove();
		if( json.pages.pageCount > newsPage ){
			$("#newsList").append('<li id="readMoreNews" class="list-more"><a onclick="news.loadList(' + newsCatId + ','+( newsPage + 1) +')">加载更多</a></li>');
		}
		$.ui.hideMask();
		return;
	}
	
	//------ News Catelog
	function loadCat(){
		$.jsonP({
			url: 		newsUrl() + "/category&callback=?",
			success: 	news.showCat,
			error: 		function(err){	console.log(err)	}
		});
	}
	function showCat(json){
		// debugger;
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
	
	//------ News View
	function loadNews(id,dom){
		$("#newsContent").empty().css3Animate({ time: "300ms", opacity: 0 });
		$.ui.showMask();

		$(dom).parent().removeClass("new"); //取消未读
		if(typeof id === 'undefined'){
			id = news.newsId;
		}
		
		$.jsonP({
			url: 		newsUrl() + "/show&callback=?&id="+id,
			success: 	news.showNews,
			error: 		function(err){	console.log(err)	 }
		});
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
		$.ui.hideMask();
	}
	
	//------ Search
	function search(data){
		// 发起搜索时，重置页码为1
		newsPage = 1;
		$.jsonP({
			url: 		newsUrl() + "&callback=?&search=" + data,
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});
		
	}

	// @Debug: 测试用
	function getList(){
		return list;
	}
	
	return {
		init:			init,
		loadList: 		loadList,
		loadCat:		loadCat,
		loadNews:		loadNews,
		showList: 		showList,
		showCat:		showCat,
		showNews:		showNews,
		search:			search,
		getList:        getList
	}
})();


/**
 * [Module description]
 * @param {[type]} name    [description]
 * @param {[type]} options [description]
 */
// options.listId
// options.listTpl
// 
var Module = function(name, options){
	this.name = name;
	this.options = $.extend({}, options);

	this.list;
	this._catId = 0;
	this._page = 1;
	// this.url
}
Module.prototype = {
	constructor: Module,
	init: function(){
		var that;
		this.list = new List(this.options.listId, this.options.listTpl);

		this.$loadMoreBtn = $('<li class="list-more"><a href="javascript:;">加载更多</a></li>').appendTo($("#" + this.options.listId));
		this.$loadMoreBtn.bind("click", function(){
			that.loadList(that._catId, that._page + 1, that._params);
		})
	},
	
	_getUrl: function(){
		return this.options.url || (appInit && appInit.appUrl + "/" + this.name);
	},

	loadList: function(catid, page, params){
		var url, that =-this;

		$.ui.showMask();
		// 目录变更，重置页码为1
		if(catid !== this._catId) {
			this._catId = catid;
			this._page = 1;
		}
		// 页码变更
		if(typeof page === "number" && !isNaN(page) && page !== this._page){
			this._page = page;
		}

		url = this._getUrl() + "&callback=?&catid=" + this._catId + "&page=" + this._page + (params ? "&" + $.param(params) : "");

		$.jsonP({
			url: 		url,
			success: 	function(res){
				that.showList(res);
			},
			error: 		function(err){	console.log(err) }
		});
	},
	_rebuildList: function(data){
		this.list.set(data);
	},
	_addToList: function(data){
		this.list.add(data);
	}, 

	showList: function(res){
		// 此时刷新列表
		if(this._page === 1){
			this._rebuildList(res.datas);
		}else{
			this._addToList(res.datas);
		}
		// this.$loadMoreBtn.
	},

	loadmore: function(argument) {
		
	}
}

Module.instance = [];