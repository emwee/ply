define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/player.html'
], function($, _, Backbone, playerTemplate) {
	
	var PlayerView = Backbone.View.extend({
		
		template: _.template(playerTemplate),
		
		initialize: function() {
			console.log('--PlayerView init');
			
			_(this).bindAll('playVideoById', 'changeState');
			
			this.listenTo(this.model, 'change:video_id', function() {
				this.playVideoById(this.model.get('video_id'));
			});
			
			this.listenTo(this.model, 'change:state', function() {
				this.changeState(this.model.get('state'));
			});
			
			this.player = null;
		},
		
		playVideoById: function(id) {
			if (this.player) {
				this.player.loadVideoById(id);
				this.pauseVideo();
			}
			else {
				this.render(id);	
			}
		},
		
		changeState: function(state) {
			if (state == 'playing') {
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
		},
		
		render: function (video_id) {
			var self = this;
			
			self.$el.html(self.template());
			
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
						},
						'onStateChange': function(state)  {
							//Ply.evt.trigger('ply:player:stateChange', state);
							self.onStateChange(state);
						}
					}
				});
			}
			
			return this;
		},
		
		onStateChange: function(state) {
			if (state.data == YT.PlayerState.BUFFERING) {
				this.model.set('state', 'buffering');
			} else if (state.data == YT.PlayerState.PLAYING) {
				this.model.set('state', 'playing');
			} else if (state.data == YT.PlayerState.PAUSED) {
				this.model.set('state', 'paused');
			} else if (state.data == YT.PlayerState.ENDED) {
				this.model.set('state', 'ended');
			}
		}
		
   });

	return PlayerView;
});