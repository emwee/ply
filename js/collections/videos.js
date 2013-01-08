define([
	'underscore',
	'backbone',
	'models/video'
], function( _, Backbone, Video ) {
	
	var Videos = Backbone.Collection.extend({
		
		model: Video,
		
		url: '/ply/me/videos',
		
		getActive: function() {
			console.log('--getActive');
			return this.models[0];
		}
	});
	
	return new Videos;
});