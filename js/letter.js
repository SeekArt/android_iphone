var Letter = function(options) {
	var $target = $("#content");
	this.$elem = $('<div class="letter"></div>').appendTo($target);
	this.$elem.height($target.offset().height - 10);

	this.options = $.extend({}, options);
	this.hash = "";
	this.letterInfo = [];
	this._init();
}

Letter.prototype = {
	constructor: Letter,

	_init: function() {

		// 生成通用匹配节点#
		this.$elem.append('<a data-hash="#' + (this.options.prefix || "") + '#">#</a>');

		// 生成A-Z节点，65-90 为大写字母Unicode
		for (var i = 65; i <= 90; i++) {
			var ca = String.fromCharCode(i);
			this.$elem.append('<a data-hash="#' + (this.options.prefix || "") + ca + '">' + ca + '</a>');
		}
		// 保存当前的hash值
		this.hash = "";

		this._bindEvent();
	},

	// 此函数用于刷新字母位置信息，当屏幕大小变化时或字母位置变化时，应刷新信息。
	_refreshLetterInfo: function() {
		var that = this;
		this.letterInfo.length = 0;

		this.$elem.find("a").each(function() {

			var offset = $(this).offset();

			that.letterInfo.push({
				hash: this.getAttribute("data-hash"),
				from: offset.top - document.body.scrollTop,
				to: offset.bottom - document.body.scrollTop
			});

		});
	},

	_bindEvent: function() {
		var that = this,
			$doc = $(document);

		// 字母滑动开始
		var dragStart = function() {
			that.$elem.addClass("active");

			$doc.on("touchmove.letter", function(evt) { //mousemove.letter 

				// 获取touch事件的页面y坐标
				var y = evt.y || (evt.changedTouches && evt.changedTouches[0].clientY);
				// 遍历计算，当触摸y坐标，在字母范围内时，滚动定位
				for (var i = 0; i < that.letterInfo.length; i++) {
					var info = that.letterInfo[i];
					if (y > info.from && y < info.to) {
						that.setHash(info.hash);
					}
				}
				evt.preventDefault();
				evt.stopPropagation();
			})
		}
		var dragEnd = function() {
			that.$elem.removeClass("active");
			$doc.off("touchmove.letter"); //mousemove.letter 
		}
		// 触摸开始
		this.$elem.on("touchstart.letter", function(evt) {
			that._refreshLetterInfo();
			dragStart(evt);
	
			var hash = evt.target.getAttribute("data-hash");
			if(hash){
				that.setHash(hash);
			}
			evt.preventDefault();
			evt.stopPropagation();
		});

		$doc.on("touchend.letter", function(evt) {
			that.hideBox();
			dragEnd();
		});
	},
	/**
	 * 滚动到hash值地应的y轴坐标
	 * @param {[type]} hash [description]
	 */
	setHash: function(hash) {

		var $node;
		if (hash !== this.hash) {
			$node = $(hash);
			this.showBox(hash.charAt(hash.length-1))
			if($node.length){			
				// 调动scroller对象的scrollToItem方法
				$.ui.scrollingDivs[$.ui.activeDiv.id].scrollToItem($node);
				this.hash = hash;
			}

		}
	},

	showBox: function(content){
		if(!$.is$(this.$box) || !this.$box.length){
			this.$box = $("<div class='letter-box'></div>").appendTo(document.body);
		}
		this.$box.html(content);
	},

	hideBox: function(){
		this.$box && this.$box.remove();
		this.$box = null;
	},

	destory: function() {
		$(document).off(".letter");
		this.$elem.off(".letter");
		this.$elem.remove();
	}
}

appInit.letter = {
	ins: null,
	on: function(prefix) {
		prefix = prefix || "";
		this.ins = new Letter({
			prefix: prefix
		});
	},
	off: function() {
		this.ins.destory();
		this.ins = null;
	},

	init: function(panel, prefix) {

		var that = this;
		if (!this.ins) {
			$("#" + panel).on("loadpanel", function(){
				that.on(prefix) 
			})
			.on("unloadpanel", function(){ 
				that.off(); 
			})
		}
	}
}