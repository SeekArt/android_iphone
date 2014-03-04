var WorkTodo = (function(){
	var listIns,
		mainListIns;

	var init = function(){
		listIns = new List("work_todo_list", $.query("#work_todo_tpl").val(), { id: 'runid'});
		mainListIns = new MainList(listIns, { url: "" })
		mainListIns.load();
	}

	// 读取列表
	return {
		init: init
	}
})();

app.evt.add({
	"sponsorWork": function(param){
		$LAB.script("js/work/workstart.js")
		.wait(function(){
			WorkStart.startFlow(param.runId, "sponsor");
		})
	},
	"operateWork": function(param){
		$LAB.script("js/work/workstart.js")
		.wait(function(){
			WorkStart.startFlow(param.runId, "operate");
		})
	},
	"viewWork": function(param) {
		$LAB.script("js/work/workstart.js")
		.wait(function(){
			WorkStart.startFlow(param.runId, "view");
		})
	}
})