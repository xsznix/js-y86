var AppView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_app').html());
		this.editor = new EditorView();
		this.inspector = new InspectorView();

		this.render();
	},

	events: {
		'click .compile': 'compile',
		'click .continue': 'continue',
		'click .step': 'step'
	},

	render: function () {
		this.$el.empty().append(this.template());
		this.$('.editor').empty().append(this.editor.$el);
		this.$('.inspector').empty().append(this.inspector.$el);
	},

	compile: function () {
		var obj = ASSEMBLE(this.editor.getSource());
		this.inspector.setObjectCode(obj);
		INIT(obj);

		Backbone.Events.trigger('app:redraw');
		this.$('.continue span').text('Start');
		this.listenToOnce(Backbone.Events, 'app:redraw', this.redrawContinueButton);
	},

	// TODO: this method is too complex. figure out another way to do this.
	continue: function () {
		if (STAT === 'HLT') {
			RESET();
			this.$('.continue span').text('Start');

			Backbone.Events.trigger('app:redraw');
			this.listenToOnce(Backbone.Events, 'app:redraw', this.redrawContinueButton);
		} else {
			RUN();
			Backbone.Events.trigger('app:redraw');
			if (STAT === 'HLT')
				this.redrawContinueButton();
		}
	},

	step: function () {
		STEP();
		Backbone.Events.trigger('app:redraw');
	},

	redrawContinueButton: function () {
		if (STAT === 'HLT')
			this.$('.continue span').text('Reset');
		else
			this.$('.continue span').text('Continue');
	}
});
