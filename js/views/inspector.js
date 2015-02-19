var InspectorView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_inspector').html());
		this.bytes = [];
		this.objectCode = [];
		this.registers = new RegistersView();
		this.$objcode = new ObjectCodeView(this.objectCode);
		this.listenTo(Backbone.Events, 'app:redraw', this.updateRegisters);
		$(window).on('resize', this.resizeObjectView.bind(this));
		this.render();
	},

	render: function () {
		this.$el.empty().html(this.template());

		this.$('.object').append(this.$objcode.$el);
		this.$('.registers-wrapper').append(this.registers.$el);
		window.setTimeout(function () {
			this.resizeObjectView();
		}.bind(this), 0);
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
	},

	resizeObjectView: function () {
		var $lines = this.$objcode.$('.lines-wrapper');
		$lines.css('height', ($(window).height() - $lines.position().top - this.$('.registers-wrapper').height()) + 'px');
	}
});
