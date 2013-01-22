define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/user_badge.html'
], function($, _, Backbone, userBadgeTemplate) {
	
	var UserView = Backbone.View.extend({
		
		template: _.template(userBadgeTemplate),
		
		events: {
			'click #login': 'login',
			'click #logout': 'logout'
		},
		
		initialize: function() {
			this.listenTo(this.model, 'change', function() {
				this.render();
			});
		},
		
		login: function(e) {
			this.model.login();
			e.preventDefault();
		},
		
		logout: function(e) {
			this.model.logout();
			e.preventDefault();
		},
		
		render: function () {
			var data = {
				user: this.model.toJSON()
			}
			
			this.$el.html(this.template(data));
			return this;
		}
   });

	return UserView;
});