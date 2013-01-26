define([
	'jquery',
	'backbone'
], function($, Backbone) {

	var PlayerRouter = Backbone.Router.extend({
		
		routes: {
			'video/:youtube_id'	: 'loadVideo',
			'*path'					: 'defaultRoute'
		},
		
		loadVideo: function(youtube_id) {
			Ply.evt.trigger('ply:router:loadVideo', youtube_id);
		},
		
		defaultRoute: function() {
			Ply.evt.trigger('ply:router:defaultRoute');
		}
	});
	
	return PlayerRouter;
});