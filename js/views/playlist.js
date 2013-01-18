define([
	'jquery',
	'underscore',
	'backbone',
	'views/video_item'
], function($, _, Backbone, VideoItemView) {
	
	var PlaylistView = Backbone.View.extend({
		
		events: {
			'click #playlist .video' : 'handleClick'
		},
		
		initialize: function() {
			console.log('--VideoListView init');
			
			_(this).bindAll('add', 'nextVideo', 'prevVideo');
			
			// keep track of active video
			this.current_video = null;
			
			this.current_position = 0;
			
			this.collection.at(this.current_position).activate();
			
			// create an array of video views to keep track of children
			this.video_item_views = [];
			
			// add videos to the view
			this.collection.each(this.add);
			
			Ply.evt.on('ply:player_controls:nextVideo', this.nextVideo);
			Ply.evt.on('ply:player_controls:prevVideo', this.prevVideo);
		},
		
		add: function(video) {
			
			var video_item_view = new VideoItemView({
				model: video
			});
			
			this.video_item_views.push(video_item_view);
		},
		
		handleClick: function(e) {
			e.preventDefault();
			var id = $(e.currentTarget).data("id");
			var video = this.collection.get(id);
			this.playVideo(video);
		},
		
		prevVideo: function() {
			var prev;
			
			if (this.current_position == 0) {
				prev = this.collection.at(this.collection.length-1);
			} else {
				prev = this.collection.at(this.current_position-1);
			}
			
			this.playVideo(prev);
		},
		
		nextVideo: function() {
			var next;
			
			if (this.current_position == this.collection.length-1) {
				next = this.collection.at(0);
			} else {
				next = this.collection.at(this.current_position+1);
			}
			
			this.playVideo(next);
		},
		
		playVideo: function(video) {
			
			// deactive current active video
			this.collection.at(this.current_position).deactivate();
			
			// activate new active video
			video.activate();
			
			// save the position of the new active video
			this.current_position = this.collection.indexOf(video);
			
			// re-render the playlist
			this.render();
			
			// mark the new video as watched
			video.markAsWatched();
			
			Ply.evt.trigger('ply:video:play', video.get('video_id'));
		},
		
		render: function () {
			console.log('--render PlaylistView');
			
			var self = this;
			
			_(this.video_item_views).each(function(video_item_view) {
				$(self.el).append(video_item_view.render().el);
			});
			
			return this;
		}
   });

	return PlaylistView;
});