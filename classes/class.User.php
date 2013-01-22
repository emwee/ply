<?php

class User {

	private $redis;
	private $mongo;
	private $fb;
	private $auth_user_id;
	
	public function __construct(&$redis, &$mongo, &$fb) {
		
		$this->redis = $redis;
		$this->mongo = $mongo;
		$this->fb = $fb;
	}
	
	public function setAuthUserId($user_id) {
		
		$this->auth_user_id = $user_id;
	}
	
	public function getAuthUserId() {
		
		return $this->auth_user_id;
	}
	
	public function isAuthenticated() {
		
		return $this->getAuthUserId();
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
		
		if ($this->isAuthenticated()) {
			return $this->fb->api('/me/permissions', 'delete');
		}  
	}
	
	public function getProfile() {
		
		if (!$this->isAuthenticated()) {
			return;
		}
		
		return $this->getProfileById($this->isAuthenticated());
	}
	
	public function getProfileById($user_id) {
		
		$profile = null;
		
		// try to read from cache
		if ($this->redis->hexists('fb_users', 'fb_user:'.$user_id)) {
			$profile = json_decode($this->redis->hget('fb_users', 'fb_user:'.$user_id), true);
		}
		
		// not in cache, load from database
		if (!$profile) {
			$profile = $this->mongo->fb_users->findOne(array('id' => $user_id));
			
			// cache the retrieved user profile
			$redis->hset('fb_users', 'fb_user:'.$user_id, json_encode($profile));
		}
		
		return $profile;
	}
	
	public function getFriends() {
		
		if (!$this->isAuthenticated()) {
			return;
		}
		
		return json_decode($this->redis->get('fb_friends:'.$this->getAuthUserId()), true);
	}
	
	public function getFeed() {
		
		if (!$this->isAuthenticated()) {
			return;
		}
		
		// $video = new Video($this->redis, $this->mongo);
		// $feed = $video->getFeedForUser($this->getAuthUserId());
		
		$feed = array();
		
		$auth_user = $this->mongo->fb_users->findOne(array('id' => $this->getAuthUserId()));
		
		foreach($auth_user['friends'] as $friend_id) {
			
			$video = new Video($this->redis, $this->mongo);
			
			$entries = $video->getEntriesByUserId($friend_id);
			
			if ($entries) {
				
				foreach($entries as $entry) {
					
					$feed_entry = array(
						'id' => $entry['id'],
						'name' => $entry['name'],
						'user' => $this->getProfileById($friend_id)
					);
					
					$fields = array('message', 'link', 'source', 'description');
					
					foreach ($fields as $field) {
						if (array_key_exists($field, $entry)) {
							$feed_entry[$field] = $entry[$field];
						}
					}
					
					$feed[] = $feed_entry;
				}

			}
		}
		
		return $feed;
	}
}
