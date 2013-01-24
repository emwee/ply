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
		
		setActive: function() {
			this.active = true;
		},
		
		removeActive: function() {
			this.active = false;
		},
		
		render: function () {
			var data = {
				active: this.active,
				video: this.model.toJSON()
			}
			
			this.$el.html(this.template(data));
			return this;
		}
   });

	return VideoItemView;
});