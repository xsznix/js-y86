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

	continue: function () {
		RUN();
		Backbone.Events.trigger('app:redraw');
	},

	step: function () {
		STEP();
		Backbone.Events.trigger('app:redraw');
	},

	redrawContinueButton: function () {
		this.$('.continue span').text('Continue');
	}
});
