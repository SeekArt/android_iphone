/**
* mail
* @author Aeolus
* @copyright IBOS
*/
var Email = (function(){
	var mailCatId = 0,
		mailId = 0,
		isInit = false,
		mailPage = 1,
		mailUrl = function (){ return app.appUrl + '/mail' };
		
	var list;
	/**
	* 初始化新闻模块时，载入一些基础数据，比如分类，默认页新闻，未读条数等
	*/
	function init(){
		if(isInit){
			return false;
		}
		list = new List("mailList", $("#mailListTpl").val())
		//Email.loadCat();
		Email.loadList("inbox");

		isInit = true;
	}
	
	//-------- Mail List
	function loadList(catid,page){
		var pageurl = '';
		$.ui.showMask();
		if( typeof(catid)== "string" ){
			stype = catid;
			catid = 0;
		}else if(catid != mailCatId){
			mailCatId = catid;
			stype = "";
		}else{
			stype = "";
		}

		if(page != mailPage && typeof(page) != "undefined" ){
			mailPage = page;
			pageurl = "&page=" + page;
		}
		
		$.jsonP({
			url: 		mailUrl() + "&callback=?&catid=" + mailCatId + "&type=" + stype + pageurl + "&formhash="+ Math.random(),
			success: 	showList,
			error: 		function(err){	console.log(err) }
		});
	}
	function showList(json){
		if(mailPage > 1){
			list.add(json.datas)
		}else{
			if(json.datas.length){
				list.set(json.datas);
			}else{
				$("#mailList").html("<li class='no-info'></li>");
			}
		}
		$("#readMoreMail").remove();
		if( json.pages.pageCount > mailPage ){
			$("#mailList").append('<li id="readMoreMail" class="list-more"><a onclick="Email.loadList(0,'+( mailPage + 1) +')">加载更多</a></li>');
		}
		$("#mailList").hide()
		setTimeout(function(){ $("#mailList").show() },0);
		
		$.ui.hideMask();
		return;
	}
	
	
	//-------- Mail Catelog
	function loadCat(){
		$.jsonP({
			url: 		mailUrl() + "/category&callback=?",
			success: 	Email.showCat,
			error: 		function(err){	console.log(err)	}
		});
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
	
	// --------- Mail View
	function loadMail(id,dom){
		$("#mailContent").empty().css3Animate({ time: "300ms", opacity: 0 });
		$.ui.showMask();
		if(typeof dom !="undefined"){
			$(dom).parent().removeClass("new"); //取消未读
		}
		if(typeof id === 'undefined'){
			id = Email.mailId;
		}	

		$.jsonP({
			url: 		mailUrl() + "/show&callback=?&id="+id,
			success: 	showMail,
			error: 		function(err){ console.log(err) }
		});
	}
	function showMail(json){
		var $tpl = $("#mailContentTpl"),
			$target = $("#mailContent");
		var tp = $tpl.val(),
			newTp = '';
			// obj = {};
			
			// //对json数据做一些处理之后，赋给obj
			// obj = json;
		newTp += $.template(tp, json);
		$target.html(newTp).css3Animate({ time: "500ms", opacity: 1 });
		mailId = json.emailid;
		$.ui.hideMask();
	}

	function editMail(data){
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
	
	// ----------- Send
	function sendMail(){
		$.ui.showMask("邮件发送中...");
		var data = {},
			user = User.get("mail_user").get();
			toids = [],
			ccids = [],
			mcids = [];

		data.subject = $("#mailSubjectInput").val(),
		data.content = $("#mailContentInput").val();

		if(user.length){
			for(var i = 0; i < user.length; i++) {
				// 抄送
				if(user[i].type === "green") {
					ccids.push(user[i].id);
				// 密送
				} else if(user[i].type === "red") {
					mcids.push(user[i].id);
				//  收件人
				}else{
					toids.push(user[i].id);
				}
			}
			data.toids = toids.join(",");
			data.ccids = ccids.join(",");
			data.mcids = mcids.join(",");
		}


		$.jsonP({
			url: 		mailUrl() + "/edit&callback=?&" + $.param(data),
			success: 	function(){
				$.ui.hideMask();
				Email.loadList('inbox')
				$.ui.goBack();
			},
			error: 		function(err){ console.log(err) }
		});
	}
	// Todo
	function markMail(){

	}

	function replyMail(){
		var subject = $("#mailSubjectHidden").val(),
			toid = $("#mailFromIdHidden").val();
		var user = [{ id: toid, text: app.getUserName(toid)}];
		editMail({
			subject: "回复：" + subject,
			user: user
		})
	}

	function replyAll(){
		var subject = $("#mailSubjectHidden").val(),
			toid = $("#mailFromIdHidden").val(),
			copyArr = $("#mailCopyToIdsHidden").val().split(",")

		var user = [{ id: toid, text: app.getUserName(toid)}];

		for(var i = 0; i < copyArr.length; i++){
			if(copyArr[i]){
				user.push({id: copyArr[i], text: app.getUserName(copyArr[i])})
			}
		}

		editMail({
			subject: "回复：" + subject,
			user: user
		})
	}

	function deleteMail(){
		$.jsonP({
			url: 		mailUrl() + "/del&callback=?&emailid=" + mailId,
			success: 	function(){
				$("#mail_item_" + mailId).remove();
				$.ui.goBack();
				mailId = 0;
			},
			error: 		function(err){	console.log(err)	}
		});
	}

	return {
		init:			init,
		loadList: 		loadList,
		loadCat:		loadCat,
		loadMail:		loadMail,
		showList: 		showList,
		showCat:		showCat,
		showMail:		showMail,
		sendMail:       sendMail,
		editMail:       editMail,

		markMail:       markMail,  
		replyMail:      replyMail,
		replyAll:       replyAll,
		deleteMail:     deleteMail
	}
})();