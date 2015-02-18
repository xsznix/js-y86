var EditorView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_editor').html());
		$(window).on('resize', this.resizeEditor.bind(this));
		this.render();
	},

	render: function () {
		this.$el.empty().append(this.template({
			code: $('#default_y86_code').html()
		}));

		this.$editor = this.$('.code');
		this.editor = ace.edit(this.$editor.get(0));
		this.editor.setTheme('ace/theme/textmate');
		this.editor.getSession().setMode('ace/mode/y86');
		this.resizeEditor();
	},

	getSource: function () {
		return this.editor.getValue();
	},

	resizeEditor: function () {
		this.$editor.css('height', ($(window).height() - this.$editor.position().top) + 'px');
	}
});
