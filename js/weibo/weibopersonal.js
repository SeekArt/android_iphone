/**
 * 微博个人主页
 */
(function(){
	var uid = app.param.get("personalUid");
	app.param.remove("personalUid");

	// 渲染个人信息
	
	$("#wb_profile").html($.template( document.getElementById('wb_profile_tpl').value, {
		uid: uid,
		feedCount: 22,
		followCount: 2,
		followerCount: 20,
		followed: 1,
		followEach: 1
	}))

	// 绑定滚动加载事件
	Weibo.bindRefreshEvent("weibo_personal", { uid: uid });
	Weibo.bindLoadMoreEvent("weibo_personal", { uid: uid });

	// 首次读取
	Weibo.loadNewFeed({ uid: uid });
})();