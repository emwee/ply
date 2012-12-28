<?php

class Video {
	
	private $mongo;
	
	public function __construct(&$mongo) {
		$this->mongo = $mongo;
	}
	
	public function markAsWatched($video_id, $user_id) {
		
		$user = $this->mongo->fb_users->findOne(array('id' => $user_id));
		
		if (!array_key_exists('watched', $user)) {
			$watched_videos = array($video_id);
		}
		else {
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