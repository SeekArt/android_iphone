/**
* Diary
* @author Aeolus
* @copyright IBOS
*/
var diary = (function(){
	var diaryCatId = 0, // 当前分类, 0为默认，显示所有
		diaryId = 0, //
		isInit = false,
		diaryPage = 1, // 当前页码
		diaryUrl = function (){ return app.appUrl + '/diary' };

	var list;
		
	/**
	* 初始化新闻模块时，载入一些基础数据，比如分类，默认页新闻，未读条数等
	*/
	function init(){
		if(isInit){
			return false;
		}
		
		list = new List('diaryList', $("#diaryListTpl").val(), {"id": "articleid"});
	
		diary.loadCat();
		diary.loadList(diaryCatId);

		isInit = true;
	}
	//------ diary List
	function loadList(catid, page){
		//$(dom).parent().addClass("active"); //选中分类
		//$(dom).parent().siblings().removeClass("active"); //选中分类
		var pageurl;

		$.ui.showMask();
		// 目录变更
		if(catid !== diaryCatId) {
			diaryCatId = catid;
			diaryPage = 1;
		}
		// 页码变更
		if(typeof page !== "undefined" && page !== diaryPage){
			diaryPage = page;
		}

		pageurl = "&page=" + diaryPage;

		$.jsonP({
			url: 		diaryUrl() + "&callback=?&catid=" + diaryCatId + pageurl,
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});

	}

	function showList(json){
		if(diaryPage > 1){
			list.add(json.datas)
		}else{
			list.set(json.datas);
		}
		
		$("#readMorediary").remove();
		if( json.pages.pageCount > diaryPage ){
			$("#diaryList").append('<li id="readMorediary" class="list-more"><a onclick="diary.loadList(' + diaryCatId + ','+( diaryPage + 1) +')">加载更多</a></li>');
		}
		$.ui.hideMask();
		return;
	}
	
	//------ diary Catelog
	function loadCat(){
		$.jsonP({
			url: 		diaryUrl() + "/category&callback=?",
			success: 	diary.showCat,
			error: 		function(err){	console.log(err)	}
		});
	}
	function showCat(json){
		// debugger;
		// var $tpl = $("#diaryCatTpl"),
			// $target = ;
		// var tp = $tpl.val(),
			// newTp = '',
			// obj = {};
			// for(var val in json){
				// if(diaryCatId!=0 && json[val].catid == diaryCatId){
					// json[val].classname = 'class="active"';
				// }else{
					// json[val].classname = ' ';
				// }
				// obj = json[val];
				// newTp += $.template(tp, obj);
			// }
		// $target.append(newTp);
		$("#diaryCat").append(json);
	}
	
	//------ diary View
	function loadDiary(id,dom){
		$("#diaryContent").empty().css3Animate({ time: "300ms", opacity: 0 });
		$.ui.showMask();

		$(dom).parent().removeClass("new"); //取消未读
		if(typeof id === 'undefined'){
			id = diary.diaryId;
		}
		
		$.jsonP({
			url: 		diaryUrl() + "/show&callback=?&id="+id,
			success: 	diary.showDiary,
			error: 		function(err){	console.log(err)	 }
		});
	}
	function showDiary(json){
		var $tpl = $("#diaryContentTpl"),
			$target = $("#diaryContent");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
			
			//对json数据做一些处理之后，赋给obj
			obj = json;
			newTp += $.template(tp, obj);
		$target.html(newTp).css3Animate({ time: "500ms", opacity: 1 });
		$.ui.hideMask();
	}
	function edit(data){
		var $subject = $("#mailSubjectInput"),
			$content = $("#mailContentInput");
		data = $.extend({
			subject: "",
			content: "",
			user: null
		}, data);
		$("#mail_new").on("loadpanel", function(){
			var inUser = new User('mail_user');
			core.autoTextarea($content.get(0));
			$subject.val(data.subject);
			$content.val(data.content);
			if(data.user){
				inUser.set(data.user);
			} else{
				inUser.clear();
			}
			$("#mail_new").off("loadpanel")
		});
		$.ui.loadContent("mail_new");
	}
	
	//------ Search
	function search(data){
		// 发起搜索时，重置页码为1
		diaryPage = 1;
		$.jsonP({
			url: 		diaryUrl() + "&callback=?&search=" + data,
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
		loadDiary:		loadDiary,
		showList: 		showList,
		showCat:		showCat,
		showDiary:		showDiary,
		search:			search,
		getList:        getList
	}
})();
