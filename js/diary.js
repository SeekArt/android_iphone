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
		reviewPage = 1,
		reviewUid = 0,
		diaryUrl = function(){ return app.appUrl + '/diary'};

	var list;
		
	/**
	* 初始化新闻模块时，载入一些基础数据，比如分类，默认页新闻，未读条数等
	*/
	function init(){
		if(isInit){
			return false;
		}
		
		list = new List('diaryList', $("#diaryListTpl").val(), {"id": "diaryid"});
	
		//diary.loadCat();
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

	function loadReview(date,uid,page){
		url="";
		if(typeof uid != "undefined") {
			url += "&uid=" + uid;
		}
		if(typeof date != "undefined") {
			url += "&date=" + date;
		}
		// 页码变更
		if(typeof page !== "undefined" && page !== reviewPage){
			reviewPage = page;
		}
		pageurl = "&page=" + reviewPage;
		
		$.jsonP({
			url: 		diaryUrl() + "/review&callback=?"+ url + pageurl,
			success: 	showReview,
			error: 		function(err){	console.log(err) }
		});
	}
	function showReview(json){
		var tp = $("#reviewTpl").val(),
			$target = $("#reviewList");
	
		$target.html($.template(tp, json));
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
	function _load(id, callback) {
		$.ui.showMask();
		id = typeof id === "undefined" ? diaryId : id;
		$.jsonP({
			url: 	diaryUrl() + "/show&callback=?&id="+id,
			success:  function(){
				callback && callback.apply(this, arguments);
				$.ui.hideMask();
				diaryId = id;
			},
			error: 	function(e){ console.log(e) }
		});
	}

	function loadDiary(id,dom){
		$("#diaryContent").empty();
		_load(id, diary.showDiary);

	}

	function showDiary(json){
		var tp = $("#diaryContentTpl").val(),
			$target = $("#diaryContent");
			
		$target.html($.template(tp, json));
	}
	
	
	function editDiary(id, callback){
		var $target = $("#diaryEditContent"),
			tpl = $("#diaryEditTpl").val();

		$target.empty();

		_load(id, function(res){
			res && $target.html($.template(tpl, res));
		})
	}
	
	function addDiary(date,callback){		
		var $target = $("#diaryEditContent"),
			tpl = $("#diaryEditTpl").val();
		$target.empty();
		$.jsonP({
			url: 	diaryUrl() + "/add&callback=?",
			success:  function(res){
				$target.html($.template(tpl, res));
			},
			error: 	function(e){ console.log(e) }
		});
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
	

	function _addItemBeforeLast(container, tpl, data){
		var $item = $($.template(tpl, data)).insertBefore($(container).find("li").eq(-1));
		// 焦点放置到新建项
		// $item.find("input").focus(); 
		return $item;
	}
	function _removeItem(elem){
		return $(elem).parent().parent().remove();
	}

	function addDiaryRecord(){
		var tpl = document.getElementById('diaryRecordTpl').value,
			container = document.getElementById("diaryRecordList");
		return _addItemBeforeLast(container, tpl, {})
	}

	function addDiaryPlan(){
		var tpl = document.getElementById('diaryPlanTpl').value,
			container = document.getElementById("diaryPlanList");
		return _addItemBeforeLast(container, tpl, {})
	}



	return {
		init:			init,
		loadList: 		loadList,
		loadCat:		loadCat,
		loadDiary:		loadDiary,
		showList: 		showList,
		showCat:		showCat,
		showDiary:		showDiary,
		editDiary:      editDiary,
		search:			search,
		getList:        getList,
		loadReview:		loadReview,
		addDiary:		addDiary,

		addDiaryPlan:   addDiaryPlan,
		removeDiaryPlan: _removeItem,
		addDiaryRecord: addDiaryRecord,
		removeDiaryRecord: _removeItem
	}
})();