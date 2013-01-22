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
			console.log('--PlayerControlsView init');
			
			_(this).bindAll('toggleVideo', 'nextVideo', 'prevVideo');
			
			var self = this
			
			this.listenTo(this.model, 'change:state', function() {
				this.render();
			});
		},
		
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		
		toggleVideo: function() {
			this.model.toggleState();
		},
		
		nextVideo: function() {
			Ply.evt.trigger('ply:player_controls:nextVideo');
		},
		
		prevVideo: function() {
			Ply.evt.trigger('ply:player_controls:prevVideo');
		}
		
   });

	return PlayerControlsView;
});