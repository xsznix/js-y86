var ObjectCodeView = Backbone.View.extend({
	className: 'object-code',

	initialize: function (options) {
		this.template = _.template($('#tmpl_object_code').html());
		this.code = options.code;
		this.initLines();
		this.render();
	},

	render: function () {
		this.$el.empty().append(this.template());
		this.$('.lines').append(_.map(this.$lines, function ($line) {
			return $line.$el;
		}));
	},

	setObjectCode: function (code) {
		this.code = code;
		this.initLines();
		this.render();
	},

	initLines: function () {
		this.$lines = [];
		this.linesByLineNo = {};

		_.each(this.code, function (line) {
			var $line = new ObjectCodeLineView(line);
			this.$lines.push($line);
			if (line.lineno) {
				var lineno = parseInt(line.lineno, 16);
				if (this.linesByLineNo[lineno])
					this.linesByLineNo[lineno].push($line);
				else
					this.linesByLineNo[lineno] = [$line];
			}
		}, this);
	}
});

var ObjectCodeLineView = Backbone.View.extend({
	className: 'object-code-line',

	initialize: function (options) {
		this.template = _.template($('#tmpl_object_code_line').html());
		this.updateSource(options);
		this.$lineno = this.$('.lineno');
		this.$binary = this.$('.binary');
		this.$source = this.$('.source');
		this.render();
	},

	updateSource: function (options) {
		this.options = options;
	},

	render: function () {
		this.$el.empty().append(this.template(this.options));
	},

	highlight: function () {
		this.$el.addClass('highlighted');
	},
	unhighlight: function () {
		this.$el.removeClass('highlighted');
	}
})