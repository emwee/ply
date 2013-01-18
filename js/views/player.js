define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	
	var PlayerView = Backbone.View.extend({
		
		initialize: function() {
			console.log('--PlayerView init');
			
			_(this).bindAll('playVideoById', 'changeState');
			
			this.player = null;
			
			Ply.evt.on('ply:video:play', this.playVideoById);
			
			Ply.evt.on('ply:player_controls:changeState', this.changeState);
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
			
		},
		
		onStateChange: function(state) {
			Ply.evt.trigger('ply:player:stateChange', state);
		},
		
		playVideoById: function(id) {
			console.log('--playVideoById');
			this.player.loadVideoById(id);
			this.pauseVideo();
		},
		
		changeState: function(state) {
			if (state == 'play') {
				this.playVideo();
			} else {
				this.pauseVideo();
			}
		},
		
		playVideo: function() {
			this.player.playVideo();
		},
		
		pauseVideo: function() {
			this.player.pauseVideo();
		}
   });

	return PlayerView;
});