<?php

class User {

	private $redis;
	private $mongo;
	private $fb = null;
	private $fb_user_id;
	private $fb_user_data;
	
	public function __construct(&$redis, &$mongo) {
		
		$this->redis = $redis;
		$this->mongo = $mongo;
		
		$this->fb = new Facebook(array(
		  'appId'  => '196081467087473',
		  'secret' => '88664c4163ba7befebb83cfa2a6cb610',
		));
		
		$this->fb_user_id = $this->fb->getUser();
		$this->fb_user_data = $this->getUserData();
	}
	
	public function getUserData() {
		
		$user_data = null;
		
		if (!$this->isLoggedIn()) {
			return;
		}
		
		// try to read from cache
		if ($this->redis->hexists('fb_users', 'fb_user:'.$this->fb_user_id)) {
			$user_data = json_decode($this->redis->hget('fb_users', 'fb_user:'.$this->fb_user_id));
		}
		
		// not in cache, load from database
		if (!$user_data) {
			$user_data = $this->mongo->fb_users->findOne(array('id' => $this->fb_user_id));	
		}
		
		// not in db, load from facebook
		if (!$user_data) {
			
			// query user from facebook
			$user_data = $this->fb->api('/me', 'GET');
			
			// store in mongo
			$this->mongo->fb_users->insert($user_data);
			
			// cache in redis
			$this->redis->hset('fb_users', 'fb_user:'.$this->fb_user_id, json_encode($user_data));
		}
		
		return $user_data;
	}
	
	public function getFriends() {
		
		$fetch_friends = false;
		
		if (!$this->isLoggedIn()) {
			return;
		}
		
		// should be reading from redis instead
		$current_user = $this->mongo->fb_users->findOne(array('id' => $this->fb_user_id));
		
		if ($current_user && array_key_exists('friends_updated', $current_user)) {
			$last_updated = $current_user['friends_updated'];
			$time_ago = time() - $last_updated;
			
			// if longer than one hour ago
			if ($time_ago > 60 * 60) {
				$fetch_friends = true;
			}
		}
		
		$fetch_friends = true;
		
		// return friends from cache
		if (!$fetch_friends) {
			return json_decode($this->redis->get('fb_friends'));
		}
		
		return $this->fetchFriends();
	}
	
	public function getFriendIds() {
		return json_decode($this->redis->get('fb_friend_ids'));
	}
	
	public function fetchFriends() {
		
		$friends = array();
		
		// facebook pagination parameters
		$fields = 'id,name,first_name,last_name,link,username,gender,locale'; // no spaces!
		$offset = 0;
		$limit = 300;
		
		// query facebook friends
		$friends_fetched = $this->fb->api('/me/friends', 'GET', array(
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

			$friends_fetched = $this->fb->api('/me/friends', 'GET', array(
				'fields' => $fields,
				'offset' => $offset,
				'limit' => $limit
			));

			$friends = array_merge($friends, $friends_fetched['data']);
		}
		
		foreach ($friends as $friend) {

			// remove old entry from db
			$this->mongo->fb_users->remove(array('id' => $friend['id']));

			// insert new entry in db
			$this->mongo->fb_users->insert($friend);

			// cache friends
			if (!$this->redis->hexists('fb_users', 'fb_user:'.$friend['id'])) {
				$this->redis->hset('fb_users', 'fb_user:'.$friend['id'], json_encode($friend));
			}
			
			// todo: test this
			// $this->redis->hsetnx('fb_users', 'fb_user:'.$friend['id'], json_encode($friend));
		}
		
		$friend_ids = array_map(function ($friend) {
			return $friend['id'];
		}, $friends);
		
		// update friends entry for logged in user
		$this->mongo->fb_users->update(array('id' => $this->fb_user_id),
		   array(
		     '$set' => array(
					'friends' => $friend_ids,
					'friends_updated' => time()
				)
		   )
		);
		
		// only store the first 10 friends for testing
		$friend_ids = array_slice($friend_ids, 0, 10);
		
		$this->redis->set('fb_friend_ids', json_encode($friend_ids));
		$this->redis->set('fb_friends', json_encode($friends));
		
		return $friends;
	}
	
	public function getYouTubePosts() {
		//return $this->fetchYouTubePosts();
		$posts = $this->redis->hgetall('yt_posts');
		
		$ret = array();
		
		foreach($posts as $post) {
			array_push($ret, json_decode($post));
		}
		
		return $ret;
	}
	
	private function fetchYouTubePosts() {
		
		$posts = array();
		$friend_ids = $this->getFriendIds();
		
		foreach ($friend_ids as $friend_id) {
			
			$friend_feed = $this->fb->api('/'.$friend_id.'/feed');
			
			if (array_key_exists('data', $friend_feed) && is_array($friend_feed['data'])) {	
				foreach ($friend_feed['data'] as $post) {
					if (array_key_exists('caption', $post) && $post['caption'] == 'www.youtube.com') {
						array_push($posts, $post);
						$this->redis->hset('yt_posts', 'yt_post:'.$post['id'], json_encode($post));
					}
				}
			}
		}
		
		return $posts;
	}
	
	public function isLoggedIn() {
		if ($this->fb_user_id) {
			return true;
		}
		return false;
	}
	
	public function getLoginUrl() {
		return $this->fb->getLoginUrl(array(
			'scope' => 'read_stream, friends_likes, publish_actions'
		));
	}
	
	public function getLogoutUrl() {
		return $this->fb->getLogoutUrl();
	}
    
	public function revokePermissions() {
		if ($this->isLoggedIn()) {
			$this->fb->api('/me/permissions', 'delete');
		}  
	}
}