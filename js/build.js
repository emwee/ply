({
	baseUrl: ".",
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		}
	},
	paths: {
		jquery: 'lib/jquery/jquery.min',
		underscore: 'lib/underscore/underscore',
		backbone: 'lib/backbone/backbone',
		text: 'lib/require/text'
	},
	name: "main",
	out: "main-built.js"
})
