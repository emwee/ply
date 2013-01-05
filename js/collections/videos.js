define([
	'underscore',
	'backbone',
	'models/video'
], function( _, Backbone, Video ) {
	
	var Videos = Backbone.Collection.extend({
		model: Video,
		url: '/ply/me/videos'
	});
	
	var bla = new Videos;
	
	window.bla  = bla;
	
	return bla;
});