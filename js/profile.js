var setup = {
	loadSetting: function(){
		var $tpl = $("#settingTpl"),
			$target = $("#settingContent");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};				
			obj = appInit.user;
			newTp += $.template(tp, obj);
		$target.html(newTp).css3Animate({ time: "500ms", opacity: 1 });
	},
	
	loadProfile: function(){			
		var $tpl = $("#profileTpl"),
			$target = $("#profileContent");
		var tp = $tpl.val(),
			newTp = '',
			obj = {};				
			obj = appInit.user;
			newTp += $.template(tp, obj);
		$target.html(newTp).css3Animate({ time: "500ms", opacity: 1 });
	}
}