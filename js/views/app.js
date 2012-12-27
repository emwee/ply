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
			
			function setupPlayer () {
				console.log('---setupPlayer');
				Videos.fetch({
					success: function(videos) {
						console.log('fetched videos')
						videos.each(function(video, index) {
							video.set({
								'index': index
							});
						});
						
						self.addAll();
					}
				});
			}
			
			window.onYouTubePlayerAPIReady = function() {
				setupPlayer();
			}
			
			window.YT && setupPlayer() || function() {
				var s = document.createElement('script');
				s.setAttribute('type', 'text/javascript');
				s.setAttribute('src', 'http://www.youtube.com/player_api?enablejsapi=1&version=3');
				
				/*
				s.onload = setupPlayer;
				s.onreadystatechange = function() {
					if (this.readyState == 'complete' || this.readyState == 'loaded') {
						setupPlayer();
					}
				};
				*/
				
				(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
			}();
		},
		
		addAll: function() {
			console.log('--addAll')
			console.log(Videos.length)
			
			var self = this, video_id;
			
			Videos.each(this.addVideo, this);
			
			video_id = Videos.models[this.video_current].attributes.video_id;
			
			var bla = Videos.models[this.video_current];
			
			console.log('-----')
			bla.markAsWatched();
			
			this.setActiveVideo();
			
			self.player = new window.YT.Player('player', {
				width: '480',
				height: '360',
				videoId: video_id,
				events: {
					'onReady': this.onPlayerReady,
					'onStateChange': function(state)  {
						self.onStateChange(state);
					}
				}
			});
		},
		
		setActiveVideo: function() {
			var index = this.video_current;
			$("#playlist").find('.video.active').removeClass('active');
			$("#playlist").find('.video').eq(index).addClass('active');
		},
		
		onPlayerReady: function(event) {
			console.log('onPlayerReady')
			console.log(event)
		},
		
		onStateChange: function(state) {
			console.log('onStateChange');
			console.log(state.data);
			
			if (state.data == YT.PlayerState.BUFFERING) {
				this.updateToggleButton('pause');
			}
			else if (state.data == YT.PlayerState.PLAYING) {
				this.updateToggleButton('pause');
			}
			else if (state.data == YT.PlayerState.PAUSED) {
				this.updateToggleButton('play');
			}
			else if (state.data == YT.PlayerState.ENDED) {
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
				}
				else {
					this.updateToggleButton('pause');
					this.player.playVideo();
				}
			}
		},
		
		updateToggleButton: function(state) {
			console.log('updateToggleButton');
			console.log(state);
			var current_state = this.player_state;
			$('#toggle-video').removeClass('icon-' + current_state).addClass('icon-' + state);
			this.player_state = state;
		},
		
		loadSelectedVideo: function(e) {
			console.log('loadSelectedVideo');
			
			var el;
			
			if ($(e.target).is('.video')) {
				el = $(e.target);
			}
			else {
				el = $(e.target).parents('.video');
			}
			
			this.video_current = el.data('index');
			this.loadVideoById(el.data('video-id'));	
		},
		
		addVideo: function(video) {
			var view = new VideoView({ model: video });
			$("#playlist ul").append(view.render().el);
		},
		
		nextVideo: function() {
			var self = this, video_url;
			
			if (this.video_current == Videos.length - 1) {
				this.video_current = 0
			}
			else {
				this.video_current++;
			}
			
			video_id = Videos.models[this.video_current].attributes.video_id;
			this.loadVideoById(video_id);
		},
		
		prevVideo: function() {
			var self = this, video_url;
			
			if (this.video_current == 0) {
				this.video_current = Videos.length - 1;
			}
			else {
				this.video_current--;
			}
			
			video_id = Videos.models[this.video_current].attributes.video_id;
			this.loadVideoById(video_id);
		},
		
		loadVideoById: function(id) {
			this.player.loadVideoById(id);
			this.setActiveVideo();
		}
	});
	
	return AppView;
});