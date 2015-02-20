var AppView = Backbone.View.extend({
	initialize: function () {
		this.template = _.template($('#tmpl_app').html());
		this.editor = new EditorView();
		this.inspector = new InspectorView();
		this.memview = new MemoryView();

		this.listenTo(Backbone.Events, 'app:redraw', this.redrawButtons);

		this.render();
	},

	events: {
		'click .compile': 'compile',
		'click .reset': 'reset',
		'click .continue': 'continue',
		'click .step': 'step'
	},

	render: function () {
		this.$el.empty().append(this.template());
		this.$('.editor').empty().append(this.editor.$el);
		this.$('.inspector').empty().append(this.inspector.$el);
		this.$('.memory').empty().append(this.memview.$el);
		this.redrawButtons();
	},

	compile: function () {
		var obj = ASSEMBLE(this.editor.getSource());
		this.inspector.setObjectCode(obj);
		try { INIT(obj); } catch (e) {} // TODO

		Backbone.Events.trigger('app:redraw');
		this.$('.continue span').text('Start');
	},

	reset: function () {
			RESET();
			this.$('.continue span').text('Start');

			Backbone.Events.trigger('app:redraw');
	},

	continue: function () {
		if (STAT === 'AOK' || STAT === 'DBG') {
			RUN();
			Backbone.Events.trigger('app:redraw');
		}
	},

	step: function () {
		if (STAT === 'AOK' || STAT === 'DBG') {
			STEP();
			Backbone.Events.trigger('app:redraw');
		}
	},

	redrawButtons: function () {
		if (STAT === 'AOK' || STAT === 'DBG') {
			this.$('.continue span').text('Continue');
			this.$('.step, .continue').removeClass('disabled');
		} else {
			this.$('.step, .continue').addClass('disabled');
		}
	}
});
