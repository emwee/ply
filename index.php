<?php

error_reporting(E_ALL);

require 'vendor/autoload.php';

require 'foo.php';

class MustacheView extends \Slim\View
{
	public function render($template)
	{
		$m = new \Mustache_Engine;
		$m->setPartialsLoader(new \Mustache_Loader_FilesystemLoader('templates'));
		$m->addHelper('test', function($text) {
			return 'test!';
		});
					
		$contents = file_get_contents($this->getTemplatesDirectory() . '/' . ltrim($template, '/'));
		return $m->render($contents, $this->data);
    }
}

$redis = new Predis\Client('tcp://localhost:6379');
$mongo = new Mongo('localhost');
$mongodb = $mongo->ply;

$usr = new User($redis, $mongodb);

$app = new \Slim\Slim(array(
	'view' => new MustacheView()
));

$app->get('/me/profile', function () use ($app, $usr) {
	
	if ($usr->isLoggedIn()) {
		echo $usr->getLogoutUrl();
		echo '<pre>';
		var_dump($usr->getUserData());
		$friends = $usr->getFriends();
	}
	else {
		echo $usr->getLoginUrl();
	}
});

$app->get('/me/revoke_fb_permissions', function () use ($app, $usr) {
	if (!$usr->isLoggedIn()) {
		$usr->revokePermissions();
	}
});

$app->get('/me/videos', function () use ($app, $usr) {
	
	if ($app->request()->isAjax()) {
		$app->contentType('application/json');
		echo json_encode($usr->getYouTubePosts());
	}
});

$app->get('/home', function () use ($app) {
	$app->render('home.mustache');
});

$app->notFound(function () use ($app) {
    echo '404';
});

$app->run();
