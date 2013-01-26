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
			
			Ply.evt.on('ply:user:status', function(status) {
				
				user_view.render();
				
				// user is authenticated
				if (status == 'authenticated') {
					
					vids.fetch({
						success: function(videos) {
							
							// views
							var player_view, player_controls_view, playlist_view;
														
							// models
							var player = new Player();
							
							player.on('change:youtube_id', function(video) {
								var youtube_id = video.get('youtube_id')
								var active_video = vids.where({ 'youtube_id': youtube_id })[0];
								vids.setActiveVideo(active_video);
							});
							
							// routers
							var player_router = new Router();

							// YouTube player
							player_view = new PlayerView({
								el: $('#player2'),
								model: player
							});
							
							// player control buttons
							player_controls_view = new PlayerControlsView({
								model: player,
								collection: videos,
								el: $('#controls')
							});
							
							// playlist
							playlist_view = new PlaylistView({
								el: $('#playlist ul'),
								model: player,
								collection: videos,
								router: player_router
							});
							
							Ply.evt.on('ply:router:defaultRoute', function() {
								console.log('--defaultRoute matched')
								var first_video = vids.at(0);
								var youtube_id = first_video.get('youtube_id');
								player.setYouTubeId(youtube_id);
							});
							
							Ply.evt.on('ply:router:loadVideo', function(youtube_id) {
								console.log('--loadVideo route matched')
								player.setYouTubeId(youtube_id);
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