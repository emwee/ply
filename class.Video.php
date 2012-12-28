<?php

class Video {
	
	private $mongo;
	
	public function __construct(&$mongo) {
		$this->mongo = $mongo;
	}
	
	public function markAsWatched($video_id, $user_id) {
		$this->mongo->fb_users->update(array('id' => $user_id),
		   array(
		     '$set' => array(
					'watched' => $video_id
				)
		   )
		);
	}
}