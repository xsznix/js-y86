var InspectorView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_inspector').html());
		this.bytes = [];
		this.registers = new RegistersView();
		// for (var i = 0; i < MEM_SIZE; i++) {
		// 	this.bytes[i] = new MemByteView({
		// 		index: i
		// 	});
		// }
		this.render();
	},

	render: function () {
		this.$el.empty().html(this.template());

		// var bytesContainer = this.$('.memory');
		// var fragment = document.createDocumentFragment();
		// _.each(this.bytes, function (b) {
		// 	fragment.appendChild(b.$el[0]);
		// });
		// bytesContainer.append(fragment);

		this.$el.append(this.registers.$el);
	},

	updateRegisters: function () {
		this.registers.render();
	}
});
