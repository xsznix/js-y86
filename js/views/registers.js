var RegistersView = Backbone.View.extend({
	className: 'registers',

	initialize: function () {
		this.template = _.template($('#tmpl_registers').html());
		this.render();
	},

	render: function () {
		var registers = {
			eax: REG[0].toString(16),
			ecx: REG[1].toString(16),
			ebx: REG[2].toString(16),
			edx: REG[3].toString(16),
			ebp: REG[4].toString(16),
			esp: REG[5].toString(16),
			esi: REG[6].toString(16),
			edu: REG[7].toString(16)
		};

		this.$el.empty().append(this.template(registers));
	}
});
