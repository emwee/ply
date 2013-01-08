define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/video.html',
	'common'
], function($, _, Backbone, videoTemplate, Common) {
	
	var VideoView = Backbone.View.extend({
		
		tagName: "li",
		
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
		},
		
		playVideo: function() {
			console.log('--playVideo')
			console.log(this.$el);
			console.log(this.model);
			
			var video = this.model;
			
			// this.options.router.navigate('video/' + video.id, {
			// 	trigger: true
			// });
			
			this.model.set('active', true);
			this.model.markAsWatched();
		},
   });

	return VideoView;
});
