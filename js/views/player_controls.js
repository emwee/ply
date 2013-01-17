define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/player_controls.html'
], function($, _, Backbone, playerControlsTemplate) {
	
	var PlayerControlsView = Backbone.View.extend({
		
		template: _.template(playerControlsTemplate),
		
		events: {
			'click #toggle-video'		: 'toggleVideo',
			'click #next-video'			: 'nextVideo',
			'click #prev-video'			: 'prevVideo'
		},
		
		initialize: function() {
			console.log('--PlayerControlsView init');
		},
		
		render: function () {
			console.log('--PlayerControlsView render');
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
   });

	return PlayerControlsView;
});