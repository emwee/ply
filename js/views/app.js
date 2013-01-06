define([
	'jquery',
	'underscore',
	'backbone',
	'models/video',
	'collections/videos',
	'views/video',
	'common'
], function($, _, Backbone, Video, Videos, VideoView, Common) {

	var AppView = Backbone.View.extend({
		
		el: $("#app"),
		
		player: null,
		
		player_state: -1,
		
		video_current: 0,
		
		events: {
			'click #toggle-video'		: 'toggleVideo',
			'click #next-video'			: 'nextVideo',
			'click #prev-video'			: 'prevVideo',
			'click #playlist .video'	: 'loadSelectedVideo',
		},
		
		initialize: function () {	
			console.log('--init app');
			var self = this;
			
			window.YT && this.fetchVideos() || function() {
				var s = document.createElement('script');
				s.setAttribute('type', 'text/javascript');
				s.setAttribute('src', 'http://www.youtube.com/player_api?enablejsapi=1&version=3');
				(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
			}();

			window.onYouTubePlayerAPIReady = function() {
				self.fetchVideos();
			}
			
			function setupPlayer () {
				console.log('---setupPlayer');
			}
		},
		
		fetchVideos: function() {
			
			var self = this;
			
			Videos.fetch({
				success: function(videos) {
					videos.each(function(video, index) {
						video.set({
							'index': index
						});
						
						self.addVideo(video);
					});
					
					var first_video = self.getCurrentVideo();

					self.player = new window.YT.Player('player', {
						width: '300',
						height: '225',
						videoId: first_video.attributes.video_id,
						events: {
							'onReady': function(event) {
								first_video.markAsWatched();
								self.setActiveVideo();
								self.onPlayerReady(event);
							},
							'onStateChange': function(state)  {
								self.onStateChange(state);
							}
						}
					});
				}
			});
		},
		
		addVideo: function(video) {
			var view = new VideoView({ model: video });
			$("#playlist ul").append(view.render().el);
		},
		
		getCurrentVideo: function() {
			return Videos.models[this.video_current];
		},
		
		setActiveVideo: function() {
			var index = this.video_current;
			$("#playlist").find('.video.active').removeClass('active');
			$("#playlist").find('.video').eq(index).addClass('active');
		},
		
		markVideoAsWatched: function() {
			console.log('markVideoAsWatched');
			this.getCurrentVideo().markAsWatched();
		},
		
		onPlayerReady: function(event) {
			console.log('onPlayerReady')
			console.log(event);
		},
		
		onStateChange: function(state) {
			console.log('onStateChange');
			console.log(state.data);
			
			if (state.data == YT.PlayerState.BUFFERING) {
				this.updateToggleButton('pause');
			} else if (state.data == YT.PlayerState.PLAYING) {
				this.updateToggleButton('pause');
			} else if (state.data == YT.PlayerState.PAUSED) {
				this.updateToggleButton('play');
			} else if (state.data == YT.PlayerState.ENDED) {
				this.updateToggleButton('stop');
				this.nextVideo();
			}
		},
		
		toggleVideo: function() {
			console.log('toggleVideo');
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
			var video_el;
			
			if ($(e.target).is('.video')) {
				video_el = $(e.target);
			} else {
				video_el = $(e.target).parents('.video');
			}
			
			this.video_current = video_el.data('index');
			this.loadVideoById(video_el.data('video-id'));
			this.player.pauseVideo();
		},
		
		nextVideo: function() {
			this.loadVideoByDirection('next');
		},
		
		prevVideo: function() {
			this.loadVideoByDirection('prev');
		},
		
		loadVideoByDirection: function(direction) {
			
			if (direction == 'next') {
				if (this.video_current == Videos.length - 1) {
					this.video_current = 0
				} else {
					this.video_current++;
				}
			}
			else if (direction == 'prev') {
				if (this.video_current == 0) {
					this.video_current = Videos.length - 1;
				} else {
					this.video_current--;
				}
			}
			
			var video_id = Videos.models[this.video_current].attributes.video_id;
			this.loadVideoById(video_id);
		},
		
		loadVideoById: function(id) {
			this.player.loadVideoById(id);
			this.setActiveVideo();
			this.markVideoAsWatched();
		}
	});
	
	return AppView;
});