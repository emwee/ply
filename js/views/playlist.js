define([
	'jquery',
	'underscore',
	'backbone',
	'views/video_item'
], function($, _, Backbone, VideoItemView) {
	
	var PlaylistView = Backbone.View.extend({
		
		events: {
			'click #playlist .video' : 'handleSelectedVideo'
		},
		
		initialize: function() {
			console.log('--VideoListView init');
			
			_(this).bindAll('add', 'nextVideo', 'prevVideo');
			
			// keep track of active video
			this.active_video_pos = 0;
			
			// activate first video
			this.collection.at(this.active_video_pos).setActive();
			
			// create an array of video views to keep track of children
			this.video_item_views = [];
			
			// add videos to the view
			this.collection.each(this.add);
		},
		
		add: function(video) {
			var video_item_view = new VideoItemView({
				model: video
			});
			
			this.video_item_views.push(video_item_view);
		},
		
		handleSelectedVideo: function(e) {
			var id = $(e.currentTarget).data("id");
			var video = this.collection.get(id);
			
			this.setActiveVideo(video);
			
			e.preventDefault();
		},
		
		prevVideo: function() {
			var prev;
			
			if (this.active_video_pos == 0) {
				varprev = this.collection.at(this.collection.length-1);
			} else {
				prev = this.collection.at(this.active_video_pos - 1);
			}
			
			this.setActiveVideo(prev);
		},
		
		nextVideo: function() {
			var next;
			
			if (this.active_video_pos == this.collection.length-1) {
				next = this.collection.at(0);
			} else {
				next = this.collection.at(this.active_video_pos + 1);
			}
			
			this.setActiveVideo(next);
		},
		
		setActiveVideo: function(video) {
			// deactive current active video
			var current = this.collection.at(this.active_video_pos);
			current.setInactive();
			
			// activate new active video
			video.setActive();
			
			// save the position of the new active video
			this.current_position = this.collection.indexOf(video);
			
			// re-render the playlist
			this.render();
			
			// mark the new video as watched
			video.markAsWatched();
			
			this.model.setVideoId(video.get('video_id'));
		},
		
		render: function () {
			var self = this;
			
			_(this.video_item_views).each(function(video_item_view) {
				$(self.el).append(video_item_view.render().el);
			});
			
			return this;
		}
   });

	return PlaylistView;
});