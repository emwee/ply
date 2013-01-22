({
	baseUrl: ".",
	shim: {
		'underscore': {
			exports: '_'
		},
		'facebook': {
			exports: 'FB'
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
		facebook : 'lib/facebook/all',
		text: 'lib/require/text'
	},
	name: "main",
	out: "main-built.js"
})
