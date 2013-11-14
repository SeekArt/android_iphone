var msg = (function(){
	var msgId = 0,
		sinceId = 0,
		isInit = false,
		msgPage = 1,
		msgUrl = function (){ return appInit.appUrl + '/msg' };
		
	function init(){
		if(isInit){
			return false;
		}
		
		list = new List('msgList', $("#msgListTpl").val(), {"id": "id"});
		
		msg.loadList();
		
		isInit = true;
	}
	
	function loadList(page){

		//$.ui.showMask();
		
		$.jsonP({
			url: 		msgUrl() + "/list&callback=?",
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});
	}
	
	function showList(json){
		$.ui.hideMask();
		list.add(json.datas);
	}	
	function loadMsg(id,sinceid){
		$("#msgContent").empty().css3Animate({ time: "300ms", opacity: 0 });
		//$.ui.showMask();
		$.jsonP({
			url: 		msgUrl() + "/show&callback=?&id="+id,
			success: 	msg.showMsg,
			error: 		function(err){	console.log(err)	 }
		});
	}
	function showMsg(json){
		var $tpl = $("#msgViewTpl"),
			$target = $("#msgView");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};
		if(json.data.length>0){
			for(var val in json.data){
				obj = json.data[val]; //没有特殊要处理的则直接对象赋于就行了
				newTp += $.template(tp, obj);
			}
			$target.append(newTp).css3Animate({ time: "500ms", opacity: 1 });
			$.ui.scrollToBottom('msg_view');
			$.ui.hideMask();
		}
		//判断当前页面是否是私信页
		timeout = setTimeout(msg.loadMsg,4000,msg.msgId,msg.sinceId); 
	}	
	return {
		init:			init,
		sinceId:		sinceId,
		loadList: 		loadList,
		loadMsg:		loadMsg,
		showList: 		showList,
		showMsg:		showMsg,
	}
})();
