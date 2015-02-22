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
		this.objectCode = _.clone(code);

		this.objectCode.obj = _.map(code.obj.split('\n'));

		this.$objcode.setObjectCode(this.objectCode);
	},

	resizeObjectView: function () {
		var $lines = this.$objcode.$('.lines-wrapper');
		$lines.height($(window).height() - $lines.position().top - this.$('.registers-wrapper').height());
	}
});
