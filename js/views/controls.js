define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/video.html',
	'common'
], function($, _, Backbone, videoTemplate, Common) {
	
	var ControlsView = Backbone.View.extend({
		
		//tagName: "ul",
		
		template: _.template(videoTemplate),
		
		events: {
			'click #playlist .video' : 'playVideo',
		},
		
		initialize: function() {
			this.model.bind('add', this.addMember, this);
			this.model.on('change', this.render, this);
		},
		
		render: function () {
			console.log('--render VideoView');
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
   });

	return VideoListView;
});