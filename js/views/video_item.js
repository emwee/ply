define([
	'jquery',
	'underscore',
	'backbone',
	'views/player',
	'text!templates/video_item.html'
], function($, _, Backbone, PlayerView, videoTemplate) {
	
	var VideoItemView = Backbone.View.extend({
		
		tagName: 'li',
		
		template: _.template(videoTemplate),
		
		initialize: function() {
		},
		
		render: function () {
			console.log('--render VideoView');
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
   });

	return VideoItemView;
});