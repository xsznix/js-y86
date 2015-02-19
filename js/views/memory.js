var MemoryView = Backbone.View.extend({
	template: _.template($('#tmpl_memory').html()),

	initialize: function (options) {
		this.$words = [];
		this.numRendered = 0;

		$(window).on('resize', this.resize.bind(this));

		for (var i = 0; i < MEM_SIZE; i += 4)
			this.$words.push(new MemWordView({
				index: i
			}));

		this.listenTo(Backbone.Events, 'app:redraw', this.updateStackPointers);

		this.render();
	},

	render: function () {
		this.$el.empty().append(this.template());
		this.$ebp = this.$('.ebp');
		this.$esp = this.$('.esp');
		this.$wordContainerWrapper = this.$('.mem-words-wrapper');
		this.$wordContainer = this.$('.mem-words');
		this.$wordContainer.on('scroll', this.autoload.bind(this));
		setTimeout(this.render64.bind(this), 0);
		setTimeout(this.resize.bind(this), 0);
	},

	render64: function () {
		var $word;
		var idx = this.numRendered;

		for (var i = 0; i < 64; i++) {
			$word = new MemWordView({ index: idx });
			this.$words.push($word);
			this.$wordContainer.append($word.$el);
			idx += 4;
		}

		this.numRendered = idx;
	},

	resize: function () {
		this.$wordContainerWrapper.css('height',
			($(window).height() - this.$wordContainerWrapper.position().top) + 'px');
	},

	autoload: function (evt) {
		var scrollTop = this.$wordContainer.scrollTop();
		var height = this.$wordContainer.height();
		var scrollHeight = this.$wordContainer.get(0).scrollHeight;
		if (this.numRendered < MEM_SIZE && (scrollHeight <= height + scrollTop))
			this.render64();
	},

	updateStackPointers: function () {
		var ebp = REG[5] / 4;
		var esp = REG[4] / 4;
		this.$ebp.css('top', (15 * ebp) + 'px');
		this.$esp.css('top', (15 * esp) + 'px');
	}
});

var MemWordView = Backbone.View.extend({
	className: 'word',
	template: _.template($('#tmpl_mem_word').html()),

	initialize: function (options) {
		this.index = options.index;
		this.listenTo(Backbone.Events, 'app:redraw', this.update);
		this.render();
	},

	render: function () {
		var value = this.getValue();
		this.$el.empty().append(this.template({
			address: padHex(this.index, 4),
			value: padHex(value, 8)
		}));
		this.lastValue = value;
	},

	getValue: function () {
		var bytes = [MEMORY[this.index], MEMORY[this.index + 1], MEMORY[this.index + 2], MEMORY[this.index + 3]];
		return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3] << 0)) >>> 0;
	},

	update: function () {
		var newValue = this.getValue();
		if (this.lastValue !== newValue) {
			this.lastValue = newValue;
			this.$('.value').text(padHex(newValue, 8));
		}
	}
});
