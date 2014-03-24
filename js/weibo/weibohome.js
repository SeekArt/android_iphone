/**
 * 微博主页
 */
(function(){
	Weibo.bindRefreshEvent("weibo");
	Weibo.bindLoadMoreEvent("weibo");
	Weibo.loadNewFeed();

	// Weibo.startLoadNew();
})();