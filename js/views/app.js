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
], function($, _, Backbone, Session, Player, Video, Videos, UserView, PlayerView, PlayerControlsView, PlaylistView, Router) {

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
			
			var vids = new Videos();
			
			vids.on('reset', function(videos) {
				vids.setActiveVideo(videos.at(0))
			})
			
			Ply.evt.on('ply:user:status', function(status) {
				
				user_view.render();
				
				// user is authenticated
				if (status == 'authenticated') {
					
					vids.fetch({
						success: function(videos) {
							
							// views
							var player_view, player_controls_view, playlist_view;
							
							var player_router = new Router();
														
							// models
							var player = new Player();

							// YouTube player
							player_view = new PlayerView({
								el: $('#player2'),
								model: player
							});
							
							// player control buttons
							player_controls_view = new PlayerControlsView({
								model: player,
								el: $('#controls'),
							});
							
							// playlist
							playlist_view = new PlaylistView({
								model: player,
								collection: videos,
								el: $('#playlist ul')
							});
							
							
							Ply.evt.on('ply:player_controls:nextVideo', playlist_view.nextVideo);
							Ply.evt.on('ply:player_controls:prevVideo', playlist_view.prevVideo);
							
							Ply.evt.on('ply:player:videoChanged', function(youtube_id) {
								player_router.navigate('video/' + youtube_id)
							});
							
							var first_video = vids.at(0);
							var youtube_id = first_video.get('youtube_id');
							
							player.setYouTubeId(youtube_id);
							player_view.render(youtube_id);
							playlist_view.setSelected(first_video);
							
							player_controls_view.render();
							
							player_router.on("route:loadVideo", function(youtube_id) {
								player.setYouTubeId(youtube_id);
								var video = vids.where({'youtube_id': youtube_id})[0];
								vids.setActiveVideo(video);
								playlist_view.setSelected(video);
							});

							Backbone.history.start();
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