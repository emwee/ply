define([
	'underscore',
	'backbone'
], function( _, Backbone ) {
	
	var Player = Backbone.Model.extend({
		
		defaults: {
			state: null,
			video_id: null
		},
		
		initialize: function() {
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
		
		setVideoId: function(video_id) {
			this.set('video_id', video_id);
		}
	});

	return Player;
});