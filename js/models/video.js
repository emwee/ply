define([
	'underscore',
	'backbone'
], function( _, Backbone ) {
	
	var Video = Backbone.Model.extend({
		
		defaults: {
			'active': false
		},
		
		initialize: function() {
			console.log('video.init');
			this.set({
				video_id: this.getVideoIdByUrl(this.get('source'))
			});
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
		},
		
		setActive: function() {
			this.set('active', true);
		},
		
		setInactive: function() {
			this.set('active', false);
		},
		
		markAsWatched: function() {
			console.log('markAsWatched');
			Backbone.sync('create', this, {
				method: 'POST',
				url: '/ply/me/video/' + this.get('id') + '/watched'
			});	
		}
	});
	
	return Video;
});