<?php

class Video {
	
	private $mongo;
	private $redis;
	
	public function __construct(&$redis, &$mongo) {
		
		$this->redis = $redis;
		$this->mongo = $mongo;
	}
	
	public function getEntriesByUserId($user_id) {
		
		$entries = null;
		
		// // try to read from cache
		// if ($this->redis->hexists('yt_entries', 'yt_entry:'.$user_id)) {
		// 	$entries = json_decode($this->redis->hget('yt_entries', 'yt_entry:'.$user_id), true);
		// }
		
		// not in cache, load from database
		if (!$entries) {
			$db_entries = $this->mongo->yt_entries->find(array('user_id' => $user_id));
			
			foreach ($db_entries as $entry) {
				
				$entries[] = $entry;
				
				// cache the retrieved user profile
				$this->redis->hset('yt_entries', 'yt_entry:'.$user_id, json_encode($entry));
			}
		}
		
		return $entries;
	}
	
	/*
	 * Marks given video as watched by given user
	 */
	public function markAsWatched($video_id, $user_id) {
		
		$watched_videos = array();
		
		$user = $this->mongo->fb_users->findOne(array('id' => $user_id));
		
		if (!$user) {
			$watched_videos = array_push($video_id);
		}
		
		if (array_key_exists('watched', $user)) {
			$watched_videos = $user['watched'];
			array_push($watched_videos, $video_id);
			$watched_videos = array_unique($watched_videos);
		}
		
		$this->mongo->fb_users->update(array('id' => $user_id),
		   array(
		     '$set' => array(
					'watched' => $watched_videos
				)
		   )
		);
	}
}