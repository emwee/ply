define([
	'underscore',
	'backbone'
], function( _, Backbone ) {
	
	var Player = Backbone.Model.extend({
		
		defaults: {
			state: null,
			youtube_id: null
		},
		
		setState: function(state) {
			this.set('state', state);
		},
		
		toggleState: function() {
			var state = this.get('state');
			
			if (state == 'playing') {
				this.setState('paused');
			} else {
				this.setState('playing');
			}
		},
		
		getYouTubeId: function() {
			return this.get('youtube_id');
		},
		
		setYouTubeId: function(youtube_id) {
			Ply.evt.trigger('ply:player:videoChanged', youtube_id);
			this.set('youtube_id', youtube_id);
		}
	});

	return Player;
});