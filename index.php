<?php

error_reporting(E_ALL);

function dump($obj) {
	echo '<pre>';
	var_dump($obj);
	echo '</pre>';
}

require 'vendor/autoload.php';

require 'classes/class.User.php';
require 'classes/class.Video.php';
require 'classes/class.MustacheView.php';

$redis = new Predis\Client('tcp://localhost:6379');
$mongo = new Mongo('localhost');
$mongodb = $mongo->ply;

$fb = new Facebook(array(
  'appId'  => '119834638185495',
  'secret' => '24fe3107c9510cce4dc9ca84155d6483',
));

$user = new User($redis, $mongodb, $fb);
$user->setAuthUserId($fb->getUser());
$video = new Video($redis, $mongodb);

$app = new \Slim\Slim(array(
	'view' => new MustacheView()
));

$app->notFound(function() use ($app) {
	
  	$app->render('404.mustache');
});

$app->get('/home', function() use ($app) {
	
	$app->render('home.mustache');
});

$app->get('/me/profile', function() use ($app, $user, $fb) {
	
	echo '<p>'.$fb->getAccessToken().'</p>';
	echo '<p>'.$fb->getUser().'</p>';
	
	if ($user->isAuthenticated()) {
		echo 'logged in<br />';
		echo $user->getLogoutUrl();
		dump($user->getProfile());
	}
	else {
		echo 'logged out<br />';
		echo $user->getLoginUrl();
	}
});

$app->get('/me/revoke_fb_permissions', function() use ($app, $user) {
	
	if (!$user->isAuthenticated()) {
		$user->revokePermissions();
	}
});

$app->get('/me/friends', function() use ($app, $user) {
	
	$friends = $user->getFriends();
	dump(count($friends));
	dump($friends);
	die();
	
	if ($app->request()->isAjax()) {
		$app->contentType('application/json');
		echo $friends;
	}
});

$app->get('/me/videos', function() use ($app, $user) {
	$feed = $user->getFeed();
	
	if ($app->request()->isAjax()) {
		$app->contentType('application/json');
		echo json_encode($feed, true);
	}
});

// marks given video as watched
$app->post('/me/video/:id/watched', function ($id) use ($app, $user, $video) {
	
	if ($app->request()->isAjax()) {
		$video->markAsWatched($id, $user->getAuthUserId());
		$app->contentType('application/json');
		echo 'ok';
	}
});

require_once('fetch_profile.php');
require_once('fetch_friends.php');
require_once('fetch_videos.php');

$app->run();