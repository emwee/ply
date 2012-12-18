<?php

error_reporting(E_ALL);

require 'vendor/autoload.php';

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

$facebook = new Facebook(array(
  'appId'  => '196081467087473',
  'secret' => '88664c4163ba7befebb83cfa2a6cb610',
));

// Get User ID
$fb_user_id = $facebook->getUser();

$redis = new Predis\Client('tcp://localhost:6379');
$mongo = new Mongo('localhost');
$ply_db = $mongo->ply;

if ($fb_user_id) {
	
	$fb_user = null;
	
	// proceed knowing you have a logged in user who's authenticated
	try {
		
		// try to read from cache
		$users_hash = 'fb_users';
		$cache_user_key_prefix = 'fb_user:';
		$cache_user_key = $cache_user_key_prefix.$fb_user_id;
		
		if ($redis->hexists($users_hash, $cache_user_key)) {
			$fb_user = json_decode($redis->hget($users_hash, $cache_user_key));
		}
		
		// not in cache, load from database
		if (!$fb_user) {
			
			// fb users collection
			$fb_user = $ply_db->$users_hash->findOne(array('id' => $fb_user_id));
			
			// unknown user
			if (!$fb_user) {
				
				// query user from Facebook
				$fb_user = $facebook->api('/me');
				
				// store in db
				$ply_db->$users_hash->insert($fb_user);
				
				// cache it
				$redis->hset($users_hash, $cache_user_key_prefix.$fb_user_id, json_encode($fb_user));
			}
		}
	}
	
	catch (FacebookApiException $e) {
		error_log($e);
		$fb_user_id = null;
	}
}

echo '<pre>';
// var_dump($fb_user_id);
// var_dump($fb_user);
// var_dump($fb_user->id);
// var_dump($fb_user->name);

// store all facebook friends
$friends = array();

// facebook pagination parameters
$fields = 'id,name,first_name,last_name,link,username,gender,locale';
$offset = 0;
$limit = 300;

// get friends
$friends_data = $facebook->api('/me/friends', 'GET', array(
	'fields' => $fields,
	'offset' => $offset,
	'limit' => $limit
));

// store friends
if (array_key_exists('data', $friends_data)) {
	$friends = array_merge($friends, $friends_data['data']);
	var_dump(count($friends_data['data']));
}

// paginate + repeat
while (array_key_exists('paging', $friends_data) && array_key_exists('next', $friends_data['paging'])) {
	
	// var_dump('more friends...');
	// var_dump($friends_data['paging']);
	// var_dump($facebook->getAccessToken());
	
	
	$offset += $limit;
	
	$friends_data = $facebook->api('/me/friends', 'GET', array(
		'fields' => $fields,
		'offset' => $offset,
		'limit' => $limit
	));
	
	$friends = array_merge($friends, $friends_data['data']);
}

var_dump(count($friends));

// var_dump($friends);

$friend_ids = array();

// cache friends
foreach($friends as $friend) {
	
	 array_push($friend_ids, $friend['id']);
	
	if (!$redis->hexists($users_hash, $cache_user_key_prefix.$friend['id'])) {
		$redis->hset($users_hash, $cache_user_key_prefix.$friend['id'], json_encode($friend));
	}
}
var_dump(count($friends));
var_dump(count($friend_ids));
var_dump($friend_ids);

$ply_db->$users_hash->update(array('id' => $fb_user_id ),
   array(
     '$set' => array('friends' => $friend_ids)
   )
);

// todo: store friends
//$ply_db->$users_hash->insert($fb_user);

var_dump(':)');

foreach ($redis->hgetall('fb_users') as $fb_user) {
	$fb_user = json_decode($fb_user);
	var_dump($fb_user);
}

die();

// Login or logout url will be needed depending on current user state.
if ($fb_user_id) {
  $logoutUrl = $facebook->getLogoutUrl();
} else {
  $loginUrl = $facebook->getLoginUrl();
}

/*

echo '<pre>';

$books = Model::factory('Book')->find_many();

echo json_encode(array_map(function ($book) {
    return $book->as_array();
}, $books));

echo '</pre>';
*/

// use Assetic\Asset\AssetCollection;
// use Assetic\AssetManager;
// use Assetic\Asset\FileAsset;
// use Assetic\Asset\GlobAsset;
// 
// 
// $js = new AssetCollection(array(
//     new GlobAsset('js/*'),
//     new FileAsset('js/bar.js')
// ));
// 
// $am = new AssetManager();
// $am->set('foo', new FileAsset('js/foo.js'));
// 
// var_dump($am->getNames());
// 
// echo "<script>";
// echo $js->dump();
// echo "</script>";
// 
// die();

$app = new \Slim\Slim(array(
	'view' => new MustacheView()
));

$app->notFound(function () use ($app) {
    echo '404';
});

class Book extends Model
{
	public function index() {
		$books = array_map(function ($book) {
		    return $book->as_array();
		}, Model::factory('Book')->find_many());
		
		return $books;
	}
	
	public function get($id) {
		return Model::factory('Book')->find_one($id)->as_array();
	}
}

$app->get('/books', function () use ($app) {
	
	$books = Book::index();
	foreach ($books as &$book) {
		$book['url'] = $app->urlFor('book_view', array('id' => $book['id']));
	}
	
	$app->render('books/index.mustache', array(
		'books' => $books,
		'books_count' => count($books)
	));
	
})->name('books_index');

$app->get('/book/:id', function ($id) use ($app) {
	
	$book = Book::get($id);
	
	$app->render('books/view.mustache', $book);
})->name('book_view');

$app->run();

// if ($app->response()->isOk()) {
// 	echo '<pre>';
// 	var_dump($app->response());
// 	var_dump($app->response()->status());
// }