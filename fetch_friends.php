<?php

$app->get('/fetch/friends(/:force)', function ($force = false) use ($app, $user, $mongodb, $redis, $fb) {
	
	dump('fetch friends');
	
	$fetch_friends = false;
	
	// note: should be reading from redis instead
	$auth_user = $mongodb->fb_users->findOne(array('id' => $user->getAuthUserId()));
	
	if (!$force) {
		
		if ($auth_user && array_key_exists('friends_updated', $auth_user)) {
			$last_updated = $auth_user['friends_updated'];
			$time_ago = time() - $last_updated;
			$time_limit = 60 * 60; // an hour
		
			// if longer than one hour ago
			if ($time_ago > $time_limit) {
				$fetch_friends = true;
			}
		}
		
		if (!$fetch_friends) {
			echo '<p>friends were fetched less than an hour ago. continue?</p>';
			die();
		}
	}
	
	$friends = array();
	$friend_ids = array();
	
	// facebook pagination parameters
	$fields = 'id,name,first_name,last_name,link,username,gender,locale'; // no spaces!
	$offset = 0;
	$limit = 300;
	
	// query facebook friends
	$friends_fetched = $fb->api('/me/friends', 'GET', array(
		'fields' => $fields,
		'offset' => $offset,
		'limit' => $limit
	));
	
	if (array_key_exists('data', $friends_fetched)) {
		$friends = array_merge($friends, $friends_fetched['data']);
	}
	
	// paginate + repeat
	while (array_key_exists('paging', $friends_fetched) && array_key_exists('next', $friends_fetched['paging'])) {
		
		$offset += $limit;
		
		$friends_fetched = $fb->api('/me/friends', 'GET', array(
			'fields' => $fields,
			'offset' => $offset,
			'limit' => $limit
		));
		
		$friends = array_merge($friends, $friends_fetched['data']);
	}
	
	foreach ($friends as $friend) {
		
		// remove old entry from db
		$mongodb->fb_users->remove(array('id' => $friend['id']));
		
		// insert new entry in db
		$mongodb->fb_users->insert($friend);
		
		// cache friends
		if (!$redis->hexists('fb_users', 'fb_user:'.$friend['id'])) {
			$redis->hset('fb_users', 'fb_user:'.$friend['id'], json_encode($friend));
		}
		
		array_push($friend_ids, $friend['id']);
	}
	
	// update friends entry for logged in user
	$mongodb->fb_users->update(array('id' => $user->getAuthUserId()),
	   array(
	     '$set' => array(
				'friends' => $friend_ids,
				'friends_updated' => time()
			)
	   )
	);
	
	$redis->set('fb_friends:'.$user->getAuthUserId(), json_encode($friends));
	
	dump($friends);
	die('done fetching friends');
	
});