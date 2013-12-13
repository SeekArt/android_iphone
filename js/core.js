/**
 * core
 * 将用于放置核心函数
 */

// 全局命名空间
var core = {
	/* 判断对象是否为$.afm对象且不为空 */
	isset: function($elem){
		return $.is$($elem) && $elem.length;
	},


	// Date
	/*------ funcion -------*/
	toDatetime: function(unix, type) {
	    var dt = new Date(parseInt(unix) * 1000);
		var now = new Date();
		var datetime,Y,M,D,h,m,s;
		// @Todo: 前置补零
		Y = dt.getFullYear();
		M = dt.getMonth() + 1 ;
		D = dt.getDate();
		h = dt.getHours();
		m = dt.getMinutes();
		s = dt.getSeconds();
			
		if(typeof type == "undefined") {
			type = "u"
		}

		switch(type){
			case "u":
				var time = (now - dt)/1000;
					// 七天以前
					if (time > 604800){
						datetime = Y + "-" + M + "-" + D;
					// 一天至七天
					} else if (time > 86400){
						datetime = Math.floor(time / 86400) + "天前";
					}else if (time > 3600) {
						datetime = Math.floor(time / 3600) + "小时前";
					} else if (time > 1800) {
						datetime = "半小时前";
					} else if (time > 60) {
						datetime = Math.floor(time / 60) + "分钟前" ;
					} else if (time >= 0) {
						datetime = time + "秒前" ;
					} else {
						datetime = Y + "-" + M + "-" + D;
					}			
				break;
			case "d":
				datetime = Y + "-" + M + "-" + D;
				break;
			case "dt":
				datetime = Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
				break;
		}
		return datetime;
	},


	// Storage
	// 获取和储存本地缓存
	setStorage: function(name, value){
		if(typeof value === "object" && value !== null) {
			value = JSON.stringify(value);
		}
		localStorage.setItem(name, value);
	},

	getStorage: function(name){
		// debugger;
		var result = localStorage.getItem(name);
		if(result){
			// 当结果只是纯粹的字符串时，JSON.parse方法会出错
			return JSON.parse(result);
		}
		return result;
	},


	// Input 
	/**
	 * textarea高度自适应
	 * @param  {[type]} elem      [description]
	 * @param  {[type]} extra     [description]
	 * @param  {[type]} maxHeight [description]
	 * @return {[type]}           [description]
	 */
	autoTextarea: function(elem, extra, maxHeight) {
		extra = extra || 20;
		var isOpera = !! window.opera && !! window.opera.toString().indexOf('Opera'),
			addEvent = function(type, callback) {
				elem.addEventListener(type, callback, false)
			},
			getStyle = function(name) {
				return $(elem).css(name);
			},
			minHeight = parseFloat(getStyle('height'));
		// getStyle('heigth')有可能返回auto值
		isNaN(minHeight) && (minHeight = elem.offsetHeight);

		elem.style.maxHeight = elem.style.resize = 'none';

		var change = function() {
			// console.count()
			var scrollTop, height,
				padding = 0,
				style = elem.style;

			if (elem._length === elem.value.length) return;
			elem._length = elem.value.length;

			if (!isOpera) {
				padding = parseInt(getStyle('paddingTop'), 10) + parseInt(getStyle('paddingBottom'), 10);
			};

			scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

			elem.style.height = minHeight + 'px';

			if (elem.scrollHeight > minHeight) {
				if (maxHeight && elem.scrollHeight > maxHeight) {
					height = maxHeight - padding;
					style.overflowY = 'auto';
				} else {
					height = elem.scrollHeight - padding;
					style.overflowY = 'hidden';
				};

				style.height = height + extra + 'px';
				scrollTop += parseInt(style.height, 10) - elem.currHeight;
				document.body.scrollTop = scrollTop;
				document.documentElement.scrollTop = scrollTop;
				elem.currHeight = parseInt(style.height, 10);
			};
		};

		addEvent('propertychange', change);
		addEvent('input', change);
		addEvent('focus', change);
		change();
	}
}

var ui = {
	switchOptionPanel: function(h){
		var defHeight = "49px",
			time = "100ms",
			$navbar = $("#navbar");
		h = h || "124px";
		
		if(this._optionPanelOpen){
			$navbar.removeClass("open");
			$navbar.css3Animate({
				time: time,
				height: defHeight
			});
			this._optionPanelOpen = false;
		} else{
			$navbar.css3Animate({
				time: time,
				height: h,
				callback: function () {
					$navbar.addClass("open")
				}
			});
			this._optionPanelOpen = true;
		}
	}
}


/// 用于创建列表结构
var List = function(id, tpl, options){
	this.id = id;
	this.tpl = tpl,
	this.options = $.extend({}, List.defaults, options);

	this._cache = {};

	this.$list = $("#" + this.id);

	if(!core.isset(this.$list) || !tpl || typeof tpl !== "string") {
		throw new Error("List: 初始化失败，参数不正确")
	}
}
List.defaults = {
	id: "id"
}
List.prototype = {
	constructor: List,

	_add: function(data){

		var $item = $.tmpl(this.tpl, data);
		var id = this.options.id;

		this.$list.append($item);

		if(id in data) {
			this._cache[data[id]] = $item;
		}
	},

	add: function(data){

		if($.isArray(data)){
			for(var i = 0; i < data.length; i++){
				this._add(data[i]);
			}
		} else {
			this._add(data);
		}
	},

	remove: function(id){
		if(id in this._cache) {
			this._cache[id].remove();
			delete this._cache[id];
		}
	},

	clear: function(){
		this.$list.empty();
		this._cache = {};
	},

	get: function(id){
		return this._cache[id] || null;
	},

	set: function(data){
		this.clear();
		// @Todo: 为了提高效率可能考虑直接拼接模板而不是调用 add 方法
		this.add(data);
	}
}


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
			getpush();
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