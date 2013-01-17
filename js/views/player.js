define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	
	var PlayerView = Backbone.View.extend({
		
		initialize: function() {
			console.log('--PlayerView init');
			
			var self = this;
			
			this.player = null;
			
			Ply.evt.on('ply:playVideo', function(video_id) {
			  self.playVideoById(video_id);
			});
		},
		
		render: function (video_id) {
			console.log('--render PlayerView');
			
			var self = this;
			
			window.YT || function() {
				var s = document.createElement('script');
				s.setAttribute('type', 'text/javascript');
				s.setAttribute('src', 'http://www.youtube.com/player_api?enablejsapi=1&version=3');
				(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
			}();
			
			window.onYouTubePlayerAPIReady = function() {
				console.log('--onYouTubePlayerAPIReady');
				
				self.player = new window.YT.Player('player', {
					width: '300',
					height: '225',
					videoId: video_id,
					events: {
						'onReady': function(event) {
							//first_video.markAsWatched();
							//first_video.set('active', true);
							self.onPlayerReady(event);
						},
						'onStateChange': function(state)  {
							self.onStateChange(state);
						}
					}
				});
			}
			
			return this;
		},
		
		onPlayerReady: function(event) {
			console.log('onPlayerReady')
		},
		
		onStateChange: function(state) {
			
			// if (state.data == YT.PlayerState.BUFFERING) {
			// 	this.updateToggleButton('pause');
			// } else if (state.data == YT.PlayerState.PLAYING) {
			// 	this.updateToggleButton('pause');
			// } else if (state.data == YT.PlayerState.PAUSED) {
			// 	this.updateToggleButton('play');
			// } else if (state.data == YT.PlayerState.ENDED) {
			// 	this.updateToggleButton('stop');
			// 	this.nextVideo();
			// }
		},
		
		playVideoById: function(id) {
			console.log('--playVideoById');
			this.player.loadVideoById(id);
			this.player.pauseVideo();
		}
   });

	return PlayerView;
});