var MemByteView = Backbone.View.extend({
	className: 'byte',

	initialize: function (options) {
		this.index = options.index;
		this.render();
	},

	render: function () {
		this.lastValue = MEMORY[this.index];

		var fragment = document.createDocumentFragment();

		var address = document.createElement('div');
		address.className = 'address';
		address.innerText = padHex(this.index, 4);
		fragment.appendChild(address);

		var value = document.createElement('div');
		value.className = 'value';
		value.innerText = padHex(MEMORY[this.index], 2);
		fragment.appendChild(value);

		this.$el.empty().append(fragment);
	},

	update: function () {
		var newValue = MEMORY[this.index];
		if (this.lastValue !== newValue) {
			this.lastValue = newValue;
			this.$('.value').text(newValue);
		}
	}
});
