// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
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
	}
});

require([
	'views/app',
	'routers/router'
], function( AppView, Workspace ) {
	
	// Initialize routing and start Backbone.history()
	var router = new Workspace();
	
	Backbone.history.start();

	// Initialize the application view
	new AppView({
		router: router
	});
});
