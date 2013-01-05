<?php

$app->get('/fetch/profile', function() use ($app, $user, $fb, $mongodb, $redis) {
	
	dump('fetch profile');
	
	$profile = array();
	
	if (!$user->isAuthenticated()) {
		return;
	}
	
	// query user from facebook
	$profile = $fb->api('/me', 'GET');
	
	// store in mongo
	$mongodb->fb_users->insert($profile);
	
	// cache in redis
	$redis->hset('fb_users', 'fb_user:'.$user->getAuthUserId(), json_encode($profile));
	
	die('done fetching profile');
	
});
