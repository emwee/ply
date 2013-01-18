define([
	'jquery',
	'underscore',
	'backbone',
	'models/video',
	'collections/videos',
	'views/player',
	'views/player_controls',
	'views/playlist',
	'routers/router'
], function($, _, Backbone, Video, Videos, PlayerView, PlayerControlsView, PlaylistView, Workspace) {

	var AppView = Backbone.View.extend({
		
		el: $("#app"),
		
		player_state: -1,
		
		initialize: function () {	
			var self = this;
			
			var player_view = new PlayerView();
			
			var player_controls_view = new PlayerControlsView({
				el: $('.bar-inner')[0]
			});
			
			Videos.fetch({
				success: function(videos) {
					
					var playlist_view = new PlaylistView({
						collection: videos,
						el: $('#playlist ul')
					});
					
					// can be done more elegant.. anyway, the player needs some youtube id
					player_view.render(
						videos.models[0].get('video_id')
					);
					
					player_controls_view.render();
					
					playlist_view.render();
				}
			});
		}
	});
	
	return AppView;
});