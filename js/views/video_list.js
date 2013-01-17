define([
	'jquery',
	'underscore',
	'backbone',
	'views/video_item'
], function($, _, Backbone, VideoItemView) {
	
	var VideoListView = Backbone.View.extend({
		
		events: {
			'click #playlist .video' : 'playVideo'
		},
		
		initialize: function() {
			console.log('--VideoListView init');
			
			// bind method 'add' to the view
			_(this).bindAll('add');
			
			// keep track of active video
			this.active_video = null;
			
			// create an array of video views to keep track of children
			this.video_item_views = [];
			
			// add videos to the view
			this.collection.each(this.add);
			
			this.setActive(
				this.collection.models[0]
			);
		},
		
		add: function(video) {
			
			var video_item_view = new VideoItemView({
				model: video,
				parent_view: this
			});
			
			this.video_item_views.push(video_item_view);
		},
		
		setActive: function(video) {
			
			// deactivate current active video
			if (this.active_video) {
				this.active_video.set('active', false);
			}
			
			// set new active vdeo
			this.active_video = video;
			this.active_video.set('active', true);
			
			// re-render the items
			this.render();
		},
		
		playVideo: function(e) {
			console.log('--playVideo');
			e.preventDefault();
			var id = $(e.currentTarget).data("id");
			var video = this.collection.get(id);
			
			console.log(video);
			
			video.markAsWatched();
			
			this.setActive(video);
			
			Ply.evt.trigger('ply:playVideo', video.get('video_id'));
		},
		
		render: function () {
			console.log('--render VideoListView');
			
			var self = this;
			
			_(this.video_item_views).each(function(video_view) {
				$(self.el).append(video_view.render().el);
			});
			
			return this;
		}
   });

	return VideoListView;
});