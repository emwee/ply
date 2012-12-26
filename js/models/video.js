define([
	'underscore',
	'backbone'
], function( _, Backbone ) {
	
	var Video = Backbone.Model.extend({
		defaults: {
			status: "...",
		},
		
		initialize: function() {
			console.log('video.init');
			this.setVideoIdFromUrl();
		},
		
		validate: function(attributes) {
			if (attributes.name == '') {
				return { name: 'Name '};
			}
		},
		
		save: function() {
			console.log('video.save');
		},
		
		setVideoIdFromUrl: function() {
			this.set({
				video_id: this.getVideoIdByUrl(this.attributes.source)
			})
		},
		
		getVideoIdByUrl: function(url) {	
			// regexp taken from http://stackoverflow.com/a/9102270
			var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
			var match = url.match(regExp);
			if (match && match[2].length == 11) {
			    return match[2];
			}
			
			// error
			return url;
		}
	});
	
	return Video;
});