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
	// unix  秒数时间戳
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
		W = dt.getDay();

		switch(type){
			case "u":
			default:
				var time = (now - dt)/1000;
					// 七天以前
					if (time > 604800){
						datetime = Y + "年" + M + "月" + D +"日";
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
						datetime = Math.floor(time) + "秒前" ;
					} else {
						datetime = Y + "-" + M + "-" + D;
					}
				break;
			case "d":
				datetime = Y + "-" + ("00" + M).substr(("" + M).length) + "-" + ("00" + D).substr(("" + D).length);
				break;
			case "dt":
				datetime = Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
				break;
			case "cn":
				datetime = Y + "年" + M + "月" + D ;
				break;
			case "cnday":
				datetime = Y + "年" + M + "月" + D + "日 星期" + ("日一二三四五六".charAt(W));
				break;
				
		}
		return datetime;
	},


	// Storage
	// 获取和储存本地缓存
	setStorage: function(name, value){
		value = JSON.stringify(value);
		localStorage.setItem(name, value);
	},

	getStorage: function(name){
		var result = localStorage.getItem(name);
		return result ? JSON.parse(result) : result;
	},
	removeStorage: function(name){
		var result = localStorage.removeItem(name);
		return result
	},
	// @Todo: 这里只有自动增高的功能，是否有在内容减少后自动减去高度的需要
	adjustTextarea: function(elem, extra, maxHeight){
		extra = extra || 20;
		// 这个判断也许没有必要
		var isOpera = !! window.opera && !! window.opera.toString().indexOf('Opera'),
			getStyle = function(name) { return $(elem).css(name); },
			minHeight = parseFloat(getStyle('height'));

		// getStyle('heigth')有可能返回auto值, 此时将最小高度设置offsetHeight
		isNaN(minHeight) && (minHeight = elem.offsetHeight);

		// 有最小高度会限制高度的增长，所以去掉
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
		change();
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
		var that = this;
		elem.addEventListener('input', function(){
			that.adjustTextarea(elem, extra, maxHeight)
		}, false);
		elem.addEventListener('focus', function(){
			that.adjustTextarea(elem, extra, maxHeight)
		}, false);
	},

	error: function(err){ console && console.log(err) }
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

	this.$list = $("#" + this.id);

	if(!core.isset(this.$list) || !tpl || typeof tpl !== "string") {
		throw new Error("List: 初始化失败，参数不正确")
	}

	this._cache = {};

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
		data = $.isArray(data) ? data : [data];
		for(var i = 0; i < data.length; i++){
			var $item = $.tmpl(this.tpl, data[i]);

			this.$list.append($item);

			if(this.options.id in data[i]) {
				this._cache[data[i][this.options.id]] = $item;
			}
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

// 测试专用
if(!localStorage.getItem("defaultUrl")){
	localStorage.setItem("defaultUrl","http://uweboa.sinaapp.com");
	localStorage.setItem("defaultID","1");
	localStorage.setItem("defaultName","云端");
	localStorage.setItem("netSetList",'{"1":{"id":"1","url":"http://uweboa.sinaapp.com","name":"云端"}}');
}

/**
* app

* @author Aeolus
* @copyright IBOS
*/
var app = (function(){
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
		if(!app.isInit){
			if(!uid || !user){
				setTimeout(function(){$.ui.loadContent('login',false,false,'fade')},500);
			}
			//初始化完整的路径
			app.appUrl += "/?r=mobile";
			UserNP = core.getStorage("defaultLogin");
			if(UserNP){
				$.jsonP({
					url: 		app.appUrl + '/default/login&callback=?&username='+UserNP.u+"&password="+UserNP.p,
					success: 	checkLogin,
					error: 		function(err){	console.log(err)	}
				});
			}
			app.isInit = true;
		}
	}

	function login(){
		var username = $("#username").val(),
			password = $("#password").val(),
			gps = $("#gpsInput").val(),
			address = $("#addressInput").val();
			//$("#loginbtn").html('登录中...');
			$.ui.showMask("登录中...");
			if(localStorage.getItem("lastUrl")!=defaultUrl){
				_isset = false;			
			}
			localStorage.setItem("defaultUrl", defaultUrl);
			
						
		//以下登录换用了rpc
		// doLogin(username,password);		
		$.jsonP({
			url: 		app.appUrl + '/default/login&callback=?&username=' + username +'& password=' + password + '&gps=' + gps + '&address=' + address + '&issetuser=' + _isset,
			success: 	function(res){
				if(res.userData){
					userData = res.userData;
					core.setStorage("ibosUserData", res.userData);
				}
				core.setStorage("defaultLogin", {"u":username,"p":password});
				
				//$("#loginbtn").html('登录');
				$.ui.hideMask();
				checkLogin(res);
			},
			error: 		function(err){	
				$.ui.popup('服务器错误,请检查',"dfdf");
				//$("#loginbtn").html('登录');
				$.ui.hideMask();
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
			url: 		app.appUrl + '/default/logout&callback=?&formhash=' + formHash,
			success: 	checkLogin,
			error: 		function(err){	console.log(err) }
		});
		core.removeStorage("defaultLogin");
		core.removeStorage("user");
		core.removeStorage("uid");		
		$.ui.loadContent('login',false,false,'fade');
	}
	
	function checkLogin(json){
		$.ui.hideMask();
		if(json.login==true){
			$.ui.loadContent('main',false,false,'fade');
			formHash = json.formhash;
			isLogin = true;
			app.user = json.user;
			app.uid = json.uid;
			localStorage.setItem("uid", app.uid);
			core.setStorage("user", app.user);
			getpush();
		}else{
			if(json.msg){
				$.ui.popup(json.msg);
				//appSdk.alert(json.msg);
			}
			$.ui.loadContent('login',false,false,'fade');
			console.log("lgoin fail");
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
})();


// 一些全局初始化事件

$(document).ready(function(){
	var $doc = app.$doc = $(this),
		$body = app.$body = $("body");

	// 文本框自动高度
	$doc.on("focusin input", "[data-auto-height]", function(){
		core.adjustTextarea(this)
	});

	// 侧栏菜单的处理，在加载panel时, 如果panel上有 data-nav="none" 值，则禁止菜单，否则开启菜单
	$doc.on("loadpanel", function(evt){
		if(evt.target.getAttribute('data-nav') === "none") {
			$.ui.disableSideMenu();
		} else {
			$.ui.enableSideMenu()
		}
	})
})

