/**
* News
* @author Aeolus
* @copyright IBOS
*/
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

//TODO:: 待zcs补全
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