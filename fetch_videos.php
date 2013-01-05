<?php

$app->get('/fetch/videos', function() use ($app, $user, $video, $redis, $mongodb, $fb) {
	
	function isYouTubeEntry ($entry) {
		if ((array_key_exists('link', $entry) && stristr($entry['link'], 'youtube.')) ||
		    (array_key_exists('caption', $entry) && $entry['caption'] == 'www.youtube.com')) {
			return true;
		}
		
		echo '<p>not a youtube entry: '.json_encode($entry).'</p>';
		
		return false;
	}
	
	dump('about to re-fetch videos for all users');
	
	// read all users from db
	$fb_users_all = $mongodb->fb_users->find();
	
	$fb_users = array();
	
	foreach ($fb_users_all as $fb_user) {
	  array_push($fb_users, $fb_user);
	}
	
	// for testing, take first X users only
	$fb_users = array_slice($fb_users, 0, 20);
	
	foreach ($fb_users as $fb_user) {
		
		$fetch_entries = false;
		
		dump($fb_user);
		dump(array_key_exists('yt_entries_updated', $fb_user));
		
		if (array_key_exists('yt_entries_updated', $fb_user)) {
			$last_updated = $fb_user['yt_entries_updated'];
			$time_ago = time() - $last_updated;
			$time_limit = 60 * 60; // an hour

			// if longer than one hour ago
			if ($time_ago > $time_limit) {
				$fetch_entries = true;
			}
			else {
				echo '<br>entries for user '.$fb_user['id'].' last fetched less than an hour ago';
			}
		}
		else {
			$fetch_entries = true;
		}

		if (!$fetch_entries) {
			continue;
		}
		
		$feed_entries = array();
		$youtube_entries = array();
		$youtube_entry_ids = array();
		
		// fetch friend's feed
		$friend_feed = $fb->api('/'.$fb_user['id'].'/feed');
		
		// as long as there are wall posts to fetch
		if (array_key_exists('data', $friend_feed) && is_array($friend_feed['data'])) {
			$feed_entries = array_merge($feed_entries, $friend_feed['data']);
		}
		
		$i = 0;
		
		while (array_key_exists('paging', $friend_feed) && array_key_exists('next', $friend_feed['paging'])) {
			
			$i++;
			
			$url = parse_url($friend_feed['paging']['next']);
			parse_str($url['query'], $query_params);
			
			$friend_feed = $fb->api('/'.$fb_user['id'].'/feed', 'GET', array(
				'limit' => $query_params['limit'],
				'until' => $query_params['until']
			));
			
			$feed_entries = array_merge($feed_entries, $friend_feed['data']);
			
			// for testing
			if ($i == 2) {
				break;
			}
		}
		
		// filter out the youtube entries
		foreach ($feed_entries as $feed_entry) {			
			if (isYouTubeEntry($feed_entry)) {
				array_push($youtube_entries, $feed_entry);
			}
		}
		
		foreach ($youtube_entries as $entry) {
			
			$entry['user_id'] = $fb_user['id'];
			
			// store the entry
			$mongodb->yt_entries->insert($entry);
			
			// cache the entry
			$redis->hset('yt_entries', 'yt_entry:'.$fb_user['id'], json_encode($entry));
			
			// echo '<p>feed:'.$user->getAuthUserId().' / '.'yt_entry:'.$entry['id'].'</p>';
			// $redis->hset('feed:'.$user->getAuthUserId(), 'yt_entry:'.$entry['id'], json_encode($entry));
			array_push($youtube_entry_ids, $entry['id']);
		}

		// update 'yt_entries' key for this user
		$mongodb->fb_users->update(array('id' => $fb_user['id']),
		   array(
		     '$set' => array(
					'yt_entries' => $youtube_entry_ids,
					'yt_entries_updated' => time()
				)
		   )
		);
	}
	// end friends loop
	
});