define([
	'jquery',
	'backbone',
	'collections/videos',
	'common'
], function( $, Backbone, Videos, Common ) {

	var Workspace = Backbone.Router.extend({
		
		routes: {
			
			'video/:video_id': 'loadVideo',
		},
		
		loadVideo: function(video_id) {
			//console.log('router:loadVideo');
			//console.log(video_id);
			//Videos.setBla(video_id);
		}
	});

	return Workspace;
});
