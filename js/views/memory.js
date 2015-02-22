var MemoryView = Backbone.View.extend({
	template: _.template($('#tmpl_memory').html()),

	initialize: function (options) {
		this.$words = [];
		this.numRendered = 0;

		$(window).on('resize', this.resize.bind(this));

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
		setTimeout(function () {
			// Load as many words as we need to fill the screen, and then some.
			var windowHeight = $(window).height();
			while (this.numRendered / 4 * 15 < windowHeight)
				this.render64();

			this.resize();

			// Widen the memory panel if there's a scroll bar.
			var width = 386 - this.$('.stack-pointers').width()
			this.$el.width(width);
			this.$el.parent().width(width);
		}.bind(this), 0);
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
		this.$wordContainerWrapper.height(
			$(window).height() - this.$wordContainerWrapper.position().top);
	},

	autoload: function (evt) {
		var scrollTop = this.$wordContainer.scrollTop();
		var height = this.$wordContainer.height();
		var scrollHeight = this.$wordContainer.get(0).scrollHeight;
		if (this.numRendered < MEM_SIZE && (scrollHeight <= height + scrollTop))
			this.render64();
	},

	updateStackPointers: function () {
		var ebp = REG[5] / 4 * 15;
		var esp = REG[4] / 4 * 15;
		var old_ebp = this.$ebp.position().top;
		var old_esp = this.$esp.position().top;
		var ebp_changed = false, esp_changed = false;

		if (ebp !== old_ebp && (ebp_changed = true))
			this.$ebp.css('top', ebp + 'px');
		if (esp !== old_esp && (esp_changed = true))
			this.$esp.css('top', esp + 'px');
		
		if (ebp_changed || esp_changed) {
			var containerHeight = this.$wordContainer.height();
			var scrollTop = this.$wordContainer.scrollTop();
			var newScroll = null;

			var max = ebp_changed ? esp_changed ? Math.max(ebp, esp) : ebp : esp;
			if (max > scrollTop + containerHeight - 15)
				newScroll = max - containerHeight + 55;

			// Load more memory if needed to show the stack pointers.
			while (this.numRendered < MEM_SIZE && this.numRendered < max / 15 * 4 + 4)
				this.render64();

			// Prefer scrolling to the higher of the two possible changed
			// values, if necessary.
			var min = ebp_changed ? esp_changed ? Math.min(ebp, esp) : ebp : esp;
			if (min < scrollTop + 15)
				newScroll = min - 40;

			if (newScroll !== null)
				this.$wordContainer.scrollTop(newScroll);
		}
	}
});

var MemWordView = Backbone.View.extend({
	className: 'word',

	initialize: function (options) {
		this.index = options.index;
		this.listenTo(Backbone.Events, 'app:redraw', this.update);
		this.render();
	},

	render: function () {
		var value = this.getValue();
		var address_str = padHex(this.index, 4);
		var value_str = padHex(value, 8);

		// Template is too slow. Create the nodes manually.
		var frag = document.createDocumentFragment();
		var $address = document.createElement('div');
		$address.className = 'address';
		$address.innerText = address_str;
		var $value = document.createElement('div');
		$value.className = 'value';
		$value.innerText = value_str;
		frag.appendChild($address);
		frag.appendChild($value);
		this.$el[0].appendChild(frag);

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
