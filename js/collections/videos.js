define([
	'underscore',
	'backbone',
	'models/video'
], function( _, Backbone, Video ) {
	
	var Videos = Backbone.Collection.extend({
		
		model: Video,
		
		url: '/ply/me/videos',
		
		initialize:function () {
			this.active_video = null;
			this.last_active_video = null;
		},
		
		comparator: function(model) {
			return model.get('id');
		},
		
		getActiveVideo: function() {
			return this.active_video;
		},
		
		getLastActiveVideo: function() {
			return this.last_active_video;
		},
		
		setActiveVideo: function(video) {
			
			if (this.active_video) {
				this.last_active_video = this.active_video;
			}
			
			this.active_video = video;
		},
		
		getNextVideo: function() {
			var index = this.indexOf(this.getActiveVideo()) + 1;
			
			if (index == this.length) {
				index = 0;
			}
			
			return this.at(index);
		},
		
		getPrevVideo: function() {
			var index = this.indexOf(this.getActiveVideo()) - 1;
			
			if (index < 0) {
				index = this.length - 1;
			}
			
			return this.at(index);
		}
	});
	
	return Videos;
});