define([
	'jquery',
	'underscore',
	'backbone',
	'models/video',
	'collections/videos',
	'views/video_list',
	'views/video',
	'routers/router'
], function($, _, Backbone, Video, Videos, VideoListView, VideoView, Workspace) {

	var AppView = Backbone.View.extend({
		
		el: $("#app"),
		
		player: null,
		
		player_state: -1,
		
		video_current: 0,
		
		viewList: null,
		
		events: {
			'click #toggle-video'		: 'toggleVideo',
			'click #next-video'			: 'nextVideo',
			'click #prev-video'			: 'prevVideo',
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
		},
		
		fetchVideos: function() {
			
			var self = this;
			
			Videos.fetch({
				success: function(videos) {
					
					self.videoViewList = new VideoListView({
						collection: videos,
						el: $('#playlist ul')
					});
					
					// var first_video = self.getCurrentVideo();
					// 
					// console.log(Videos.getActive())
					// 
					// self.player = new window.YT.Player('player', {
					// 	width: '300',
					// 	height: '225',
					// 	videoId: first_video.attributes.video_id,
					// 	events: {
					// 		'onReady': function(event) {
					// 			first_video.markAsWatched();
					// 			first_video.set('active', true);
					// 			self.onPlayerReady(event);
					// 		},
					// 		'onStateChange': function(state)  {
					// 			self.onStateChange(state);
					// 		}
					// 	}
					// });
				}
			});
			// 
			// Videos.bind('change:active', function(video) {
			// 	self.loadVideoById(video.attributes.video_id);
			// });
		},
		
		getCurrentVideo: function() {
			return Videos.models[this.video_current];
		},
		
		onPlayerReady: function(event) {
			console.log('onPlayerReady')
		},
		
		onStateChange: function(state) {
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
		},
		
		loadVideoById: function(id) {
			this.player.loadVideoById(id);
			this.player.pauseVideo();
		}
	});
	
	return AppView;
});