var EditorView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_editor').html());
		this.annotate = this._annotate.bind(this);
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
		this.editor.on('change', this.deferredRecompile.bind(this));
		this.resizeEditor();
	},

	getSource: function () {
		return this.editor.getValue();
	},

	setSource: function (raw) {
		this.editor.setValue(raw);
	},

	resizeEditor: function () {
		this.$editor.height($(window).height() - this.$editor.position().top);
	},

	deferredRecompile: function () {
		if (this.recompileTimeout)
			window.clearTimeout(this.recompileTimeout);
		this.recompileTimeout = window.setTimeout(this.annotate, 500);
	},

	_annotate: function () {
		var value = this.getSource();

		var errors = ASSEMBLE(value, true).errors;

		var errorObjs = _.map(errors, function (error) {
			return {
				row: error[0] - 1,
				column: 0, // not supported
				text: error[1],
				type: 'error'
			}
		});

		this.editor.getSession().setAnnotations(errorObjs);
	}
});