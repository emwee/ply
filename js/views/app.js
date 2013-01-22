define([
	'jquery',
	'underscore',
	'backbone',
	'models/session',
	'models/player',
	'models/video',
	'collections/videos',
	'views/user',
	'views/player',
	'views/player_controls',
	'views/playlist',
	'routers/router'
], function($, _, Backbone, Session, Player, Video, Videos, UserView, PlayerView, PlayerControlsView, PlaylistView, Workspace) {

	var AppView = Backbone.View.extend({
		
		el: $("#app"),
		
		player_state: -1,
		
		initialize: function () {	
			var self = this;
			
			var session = new Session();
			
			var user_view = new UserView({
				el: $('#account'),
				model: session
			});
			
			Ply.evt.on('ply:user:status', function(status) {
				
				user_view.render();
				
				if (status == 'authenticated') {
					Videos.fetch({
						success: function(videos) {
							
							// views
							var player_view, player_controls_view, playlist_view;
							
							// models
							var player = new Player();
							
							// YouTube player
							player_view = new PlayerView({
								el: $('#player2'),
								model: player
							});
							
							// player control buttons
							player_controls_view = new PlayerControlsView({
								el: $('#controls'),
								model: player
							});
							
							// playlist
							playlist_view = new PlaylistView({
								collection: videos,
								el: $('#playlist ul'),
								model: player
							});
							
							Ply.evt.on('ply:player_controls:nextVideo', playlist_view.nextVideo);
							Ply.evt.on('ply:player_controls:prevVideo', playlist_view.prevVideo);
							
							var video_id = videos.models[0].get('video_id');
							
							player_view.render(video_id);
							player_controls_view.render();
							playlist_view.render();
						}
					});
				}
				else if (status == 'not_authenticated') {
					console.log('not_authenticated');
				}
			});
		},
		
		render: function() {
		}
	});
	
	return AppView;
});