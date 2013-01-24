// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
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
	}
});

require([
	'views/app'
], function(AppView) {
	
	// Event aggregator
	Ply = {};
	Ply.evt = _.extend({}, Backbone.Events);
	
	// Initialize the application view
	new AppView();
});
