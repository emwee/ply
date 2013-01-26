define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/player_controls.html'
], function($, _, Backbone, playerControlsTemplate) {
	
	var PlayerControlsView = Backbone.View.extend({
		
		template: _.template(playerControlsTemplate),
		
		events: {
			'click #toggle-video'	: 'toggleVideo',
			'click #next-video'		: 'nextVideo',
			'click #prev-video'		: 'prevVideo'
		},
		
		initialize: function() {
			_(this).bindAll('toggleVideo', 'nextVideo', 'prevVideo');
			
			this.listenTo(this.model, 'change:state', function() {
				this.render();	
			});
			
			this.render();
		},
		
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		
		toggleVideo: function() {
			this.model.toggleState();
		},
		
		nextVideo: function() {
			var video = this.collection.getNextVideo();
			this.model.setYouTubeId(video.get('youtube_id'));
		},
		
		prevVideo: function() {
			var video = this.collection.getPrevVideo();
			this.model.setYouTubeId(video.get('youtube_id'));
		}
   });

	return PlayerControlsView;
});