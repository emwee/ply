define([
	'jquery',
	'underscore',
	'backbone',
	'models/video',
	'collections/videos',
	'views/player',
	'views/player_controls',
	'views/video_list',
	'routers/router'
], function($, _, Backbone, Video, Videos, PlayerView, PlayerControlsView, VideoListView, Workspace) {

	var AppView = Backbone.View.extend({
		
		el: $("#app"),
		
		player_state: -1,
		
		initialize: function () {	
			console.log('--init app');
			var self = this;
			
			Ply = {};
			Ply.evt = _.extend({}, Backbone.Events);
			
			var player_view = new PlayerView()
			
			Videos.fetch({
				success: function(videos) {
					
					self.videoViewList = new VideoListView({
						collection: videos,
						el: $('#playlist ul')
					});
					
					player_view.render(
						videos.models[0].get('video_id')
					);
					
					self.videoViewList.render();
				}
			});
		},
		
		getCurrentVideo: function() {
			return Videos.models[this.video_current];
		},
		
		toggleVideo: function() {
			if (this.player) {
				console.log(this.player_state);
				if (this.player_state != 'play') {
					this.updateToggleButton('play');
					this.player.pauseVideo();
				} else {
					this.updateToggleButton('pause');
					this.player.playVideo();
				}
			}
		},
		
		updateToggleButton: function(state) {
			var current_state = this.player_state;
			$('#toggle-video span')
				.removeClass('icon-' + current_state)
				.addClass('icon-' + state)
			;
			
			this.player_state = state;
		},
		
		loadSelectedVideo: function(e) {
			var video_el, video_id;
			
			if ($(e.target).is('.video')) {
				video_el = $(e.target);
			} else {
				video_el = $(e.target).parents('.video');
			}
			
			video_id = video_el.data('video-id');
			
			// this.options.router.navigate('video/' + id, {
			// 	trigger: true
			// });
			
			// this.options.router.on("route:loadVideo", function(video_id) {
			// 	console.log('hjk')
			// 	console.log(video_id);
			// });
			
			this.video_current = video_el.data('index');
			this.loadVideoById(video_id);
		},
		
		nextVideo: function() {
			this.loadVideoByDirection('next');
		},
		
		prevVideo: function() {
			this.loadVideoByDirection('prev');
		},
		
		loadVideoByDirection: function(direction) {
			var video;
			if (direction == 'next') {
				this.video_current = (this.video_current == Videos.length - 1) ? 0 : this.video_current + 1;
			}
			else if (direction == 'prev') {
				this.video_current = (this.video_current == 0) ? Videos.length - 1 : this.video_current - 1;
			}
			video = this.getCurrentVideo();
			this.loadVideoById(video.attributes.video_id);
		}
	});
	
	return AppView;
});