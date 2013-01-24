define([
	'jquery',
	'backbone'
], function($, Backbone) {

	var PlayerRouter = Backbone.Router.extend({
		
		routes: {
			'video/:youtube_id': 'loadVideo',
		}
	});
	
	return PlayerRouter;
});