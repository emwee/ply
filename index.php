<?php

error_reporting(E_ALL);
// 
// try {
//   // open connection to MongoDB server
//   $conn = new Mongo('localhost');
// 
//   // access database
//   $db = $conn->test;
// 
//   // access collection
//   $collection = $db->items;
// 
//   // execute query
//   // retrieve all documents
//   $cursor = $collection->find();
// 
//   // iterate through the result set
//   // print each document
//   echo $cursor->count() . ' document(s) found. <br/>';  
//   foreach ($cursor as $obj) {
//     echo 'Name: ' . $obj['name'] . '<br/>';
//     echo 'Quantity: ' . $obj['quantity'] . '<br/>';
//     echo 'Price: ' . $obj['price'] . '<br/>';
//     echo '<br/>';
//   }
// 
//   // disconnect from server
//   $conn->close();
// } catch (MongoConnectionException $e) {
//   die('Error connecting to MongoDB server');
// } catch (MongoException $e) {
//   die('Error: ' . $e->getMessage());
// }

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

class UserFacebook {
	
	var $user_id = null;
	var $user = null;
	
	public function __construct($user_id) {
		$this->user_id = $user_id;
		$this->user = $this->getUser();
	}
	
	public function getUser() {
		echo 'ss';
		$facebook = new Facebook(array(
		  'appId'  => '196081467087473',
		  'secret' => '88664c4163ba7befebb83cfa2a6cb610',
		));
		
		return $facebook->api('/me');
	}
}

class UserMongo extends UserFacebook {
	
	public function getUser() {
		$mongo = new Mongo('localhost');
		$db = $mongo->ply;
		
		$fb_users = $ply_db->fb_users;
		$user = $fb_users->findOne(array('id' => $this->user_id));
		
		if (!$user) {
			$user = parent::getUser();
		}
		
		$fb_users->insert($user);
		
		return $user;
	}
}


class UserRedis extends UserMongo {
	
	public function getUser() {
		$redis = new Predis\Client('tcp://localhost:6379');
		$user = $redis->hget('fb_users', 'fb_user:'.$this->user_id);
		
		if ($user) {
			$user = json_decode($user);
		}
		else {
			$user = parent::getUser();
			$redis->hset('fb_users', 'fb_user:'.$this->user_id, json_encode($user));	
		}
		
		return $user;
	}
}

class User extends UserRedis {}

$facebook = new Facebook(array(
  'appId'  => '196081467087473',
  'secret' => '88664c4163ba7befebb83cfa2a6cb610',
));

// Get User ID
$fb_user_id = $facebook->getUser();

$usr = new User($fb_user_id);

echo '<pre>';
var_dump($usr);
var_dump($usr->getUser()->id);
var_dump($usr->getUser()->name);

die();

// Login or logout url will be needed depending on current user state.
if ($fb_user_id) {
  $logoutUrl = $facebook->getLogoutUrl();
} else {
  $loginUrl = $facebook->getLoginUrl();
}

// if ($_SERVER['SERVER_NAME'] == 'dev4.mediamatic.nl') {
// 	ORM::configure('mysql:host=192.168.1.99;dbname=emwee');
// 	ORM::configure('username', 'root');
// 	ORM::configure('password', '');
// }
// else {
// 	ORM::configure('mysql:host=localhost;dbname=ply');
// 	ORM::configure('username', 'root');
// 	ORM::configure('password', 'root');
// }

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