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
			console.log('--PlaylistView init');
			
			_(this).bindAll('add', 'nextVideo', 'prevVideo');
			
			// create an array of video views to keep track of children
			this.video_item_views = [];
			
			// add videos to the view
			this.collection.each(this.add);
			
			// let's use a better reference name
			this.player = this.model;
			
			this.listenTo(this.model, 'change:youtube_id', function() {
				var youtube_id = this.model.getYouTubeId();
				var active_video = this.collection.where({ 'youtube_id': youtube_id })[0];
				this.highlight(active_video);
			});
		},
		
		highlight: function(video) {
			var active_index, last_active, last_active_index;
			
			// get index of active video
			active_index = this.collection.indexOf(video);
			
			// re-render the corresponding view
			this.video_item_views[active_index].setActive();
			
			// see if there was a previously selected video
			last_active = this.collection.getLastActiveVideo();
			
			// re-render the corresponding view if there is one
			if (last_active) {
				last_active_index = this.collection.indexOf(last_active);
				this.video_item_views[last_active_index].removeActive();
			}
			
			// mark this video as watched
			video.markAsWatched();
			
			this.render();
		},
		
		add: function(video) {
			var video_item_view = new VideoItemView({
				model: video
			});
			
			this.video_item_views.push(video_item_view);
			
			return this;
		},
		
		handleSelectedVideo: function(e) {
			var id, selected;
			
			e.preventDefault();
			
			// get the id of the clicked video
			id = $(e.currentTarget).data("id");
			selected = this.collection.get(id);
			
			// mark this video as selected
			//this.collection.setActiveVideo(selected);
			
			this.options.router.navigate('video/' + selected.get('youtube_id'))
			
			// tell the player to play this item
			this.model.setYouTubeId(selected.get('youtube_id'));
		},
		
		prevVideo: function() {
		// 	var prev_video;
		// 	this.collection.prev();
		// 	prev_video = this.collection.getActiveVideo();
		// 	this.setYouTubeId(next_video.get('youtube_id'));
		},
		
		nextVideo: function() {
		// 	var next_video;
		// 	this.collection.next();
		// 	next_video = this.collection.getActiveVideo();
		// 	this.setYouTubeId(next_video.get('youtube_id'));
		},
		// 
		// setYouTubeId: function(youtube_id) {
		// 	this.player.setYouTubeId(youtube_id);
		// },
		
		
		render: function () {
			var self = this;
			
			_(this.video_item_views).each(function(video_item_view) {
				self.$el.append(video_item_view.render().el);
			});
			
			return this;
		}
   });

	return PlaylistView;
});