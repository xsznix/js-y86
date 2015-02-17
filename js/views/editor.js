var EditorView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_editor').html());
		this.render();
	},

	render: function () {
		this.$el.empty().append(this.template({
			code: $('#default_y86_code').html()
		}));
		this.editor = CodeMirror.fromTextArea(this.$('.code').get(0));
	},

	getSource: function () {
		return this.editor.getValue();
	}
});
