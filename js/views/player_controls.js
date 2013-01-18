define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/player_controls.html'
], function($, _, Backbone, playerControlsTemplate) {
	
	var PlayerControlsView = Backbone.View.extend({
		
		template: _.template(playerControlsTemplate),
		
		events: {
			'click #toggle-video'	: 'toggleVideo',
			'click #next-video'		: 'nextVideo',
			'click #prev-video'		: 'prevVideo'
		},
		
		initialize: function() {
			console.log('--PlayerControlsView init');
			
			_(this).bindAll('onPlayerStateChange', 'toggleVideo', 'nextVideo', 'prevVideo');
			
			this.player_state = -1;
			
			var self = this;
			
			Ply.evt.on('ply:player:stateChange', this.onPlayerStateChange);
		},
		
		render: function () {
			console.log('--PlayerControlsView render');
			this.$el.html(this.template());
			return this;
		},
		
		onPlayerStateChange: function(state) {
			
			this.player_state = state.data;
			
			// -1 (unstarted)
			// 0 (ended)
			// 1 (playing)
			// 2 (paused)
			// 3 (buffering)
			// 5 (video cued)
			
			if (state.data == YT.PlayerState.BUFFERING) {
				console.log('state: buffering');
			} else if (state.data == YT.PlayerState.PLAYING) {
				console.log('state: playing');
			} else if (state.data == YT.PlayerState.PAUSED) {
				console.log('state: paused');
			} else if (state.data == YT.PlayerState.ENDED) {
				console.log('state: ended');
			}
		},
		
		toggleVideo: function() {
			if (this.player_state != YT.PlayerState.PLAYING) {
				Ply.evt.trigger('ply:player_controls:changeState', 'play');
			} else {
				Ply.evt.trigger('ply:player_controls:changeState', 'pause');
			}
		},
		
		nextVideo: function() {
			Ply.evt.trigger('ply:player_controls:nextVideo');
		},
		
		prevVideo: function() {
			Ply.evt.trigger('ply:player_controls:prevVideo');
		}
		
   });

	return PlayerControlsView;
});