define([
	'jquery',
	'underscore',
	'backbone',
	'views/video'
], function($, _, Backbone, VideoView) {
	
	var VideoListView = Backbone.View.extend({
		
		initialize: function() {
			console.log('--VideoListView init');
			
			var self = this;
			
			this.collection.each(function(video) {
				self.add(video);
			});
			
		},
		
		add: function(video) {
			
			var video_view = new VideoView({
				model: video,
				parent_view: this
			});
			
			$(this.el).append(video_view.render().el);
		},
		
		setActiveVideoItem: function() {
			console.log('--setActiveVideoItem');
		},
		
		addVideoItem: function(video_item) {
			this.$el.append(video_item);
		},
		
		render: function () {
			console.log('--render VideoListView');
			var self = this;
			$("#playlist").append(self.el);
			return this;
		}
   });

	return VideoListView;
});