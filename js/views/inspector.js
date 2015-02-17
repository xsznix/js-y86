var InspectorView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_inspector').html());
		this.bytes = [];
		this.objectCode = [];
		this.registers = new RegistersView();
		this.$objcode = new ObjectCodeView(this.objectCode);
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

		this.$('.object').append(this.$objcode.$el);

		this.$('.registers-wrapper').append(this.registers.$el);
	},

	updateRegisters: function () {
		this.registers.render();
	},

	setObjectCode: function (code) {
		this.objectCode = _.map(code.split('\n'), function (line) {
			var hasCode = true;

			var lineno_idx = line.indexOf(':');
			var lineno = '';
			if (lineno_idx !== -1)
				lineno = line.substring(1, lineno_idx);
			else
				hasCode = false;

			var source_idx = line.indexOf('|');
			var source = '';
			if (source_idx + 1 < line.length)
				source = line.substr(source_idx + 2);
			else
				hasCode = false;

			var binary = '';
			if (hasCode)
				binary = line.substring(lineno_idx + 2, source_idx - 1);

			return {
				lineno: lineno,
				binary: binary,
				source: source
			}
		});

		this.$objcode.setObjectCode(this.objectCode);
	}
});
