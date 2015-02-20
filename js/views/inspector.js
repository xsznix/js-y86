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
		if (code.substring(0, 5) === 'Error')
			this.objectCode = [{
				lineno: '',
				binary: '',
				source: code
			}];
		else
			this.objectCode = _.map(code.split('\n'), function (line) {
				return {
					lineno: line.substring(2, 8),
					binary: line.substring(9, 22),
					source: line.substring(24)
				}
			});

		this.$objcode.setObjectCode(this.objectCode);
	},

	resizeObjectView: function () {
		var $lines = this.$objcode.$('.lines-wrapper');
		$lines.height($(window).height() - $lines.position().top - this.$('.registers-wrapper').height());
	}
});
