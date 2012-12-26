define([
	'underscore',
	'backbone',
	'models/video'
], function( _, Backbone, Video ) {
	
	var Videos = Backbone.Collection.extend({
		model: Video,
		url: '/ply/me/videos'
	});
	
	return new Videos;
});