define([
	'underscore',
	'backbone',
	'facebook'
], function(_, Backbone, FB) {
	
	var Session = Backbone.Model.extend({
		
		defaults: {
			id: 0,
			username: null,
			name: null,
			first_name: null,
			access_token: null
		},
		
		initialize: function() {
			FB.init({
				appId: '119834638185495',
				//channelUrl: '//your/path/to/channel.php',
				status: true, // check login status
				cookie: true, // enable cookies to allow the server to access the session
				xfbml: true // parse XFBML
			});
			
			this.getLoginStatus();
		},
		
		getLoginStatus: function() {
			console.log('--getLoginStatus')
			var self = this;
			FB.getLoginStatus(function(response) {
				self.handleLoginStatus(response);
			});
		},
		
		login: function () {
			var self = this;
			FB.login(function(response) {
				self.handleLoginStatus(response);
			});
		},
		
		handleLoginStatus: function(response) {
			var self = this;
			
			if (response.status === 'connected') {
				// the user is logged in and has authenticated your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var access_token = response.authResponse.accessToken;
				
				FB.api('/me', function(response) {
					console.log('Good to see you, ' + response.first_name + '.');
					self.set({
						id: uid,
						username: response.username,
						name: response.name,
						first_name: response.first_name,
						access_token: access_token
					});
					
					Ply.evt.trigger('ply:user:status', 'authenticated');
		     });
			} else if (response.status === 'not_authorized') {
				// the user is logged in to Facebook, 
				// but has not authenticated your app
				Ply.evt.trigger('ply:user:status', 'not_authorized');
			} else {
				// the user isn't logged in to Facebook.
				Ply.evt.trigger('ply:user:status', 'not_authenticated');
			}
		},

		logout: function () {
			this.clear();
			// FB.logout();
			Ply.evt.trigger('ply:user:status', 'not_authenticated');
		},
	});

	return Session;
});