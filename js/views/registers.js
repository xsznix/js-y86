var RegistersView = Backbone.View.extend({
	className: 'registers',

	initialize: function () {
		this.template = _.template($('#tmpl_registers').html());
		this.render();
	},

	render: function () {
		var registers = {
			eax_hex: '0x' + REG[0].toString(16),
			eax_dec: (REG[0] >> 0).toString(10),
			ecx_hex: '0x' + REG[1].toString(16),
			ecx_dec: (REG[1] >> 0).toString(10),
			ebx_hex: '0x' + REG[2].toString(16),
			ebx_dec: (REG[2] >> 0).toString(10),
			edx_hex: '0x' + REG[3].toString(16),
			edx_dec: (REG[3] >> 0).toString(10),
			ebp_hex: '0x' + REG[4].toString(16),
			ebp_dec: (REG[4] >> 0).toString(10),
			esp_hex: '0x' + REG[5].toString(16),
			esp_dec: (REG[5] >> 0).toString(10),
			esi_hex: '0x' + REG[6].toString(16),
			esi_dec: (REG[6] >> 0).toString(10),
			edu_hex: '0x' + REG[7].toString(16),
			edu_dec: (REG[7] >> 0).toString(10),

			sf: SF,
			zf: ZF,
			of: OF,
			stat: STAT,
			pc: '0x' + PC.toString(16)
		};

		this.$el.empty().append(this.template(registers));
	}
});
