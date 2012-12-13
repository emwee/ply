<?php

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

if ($_SERVER['SERVER_NAME'] == 'dev4.mediamatic.nl') {
	ORM::configure('mysql:host=192.168.1.99;dbname=emwee');
	ORM::configure('username', 'root');
	ORM::configure('password', '');
}
else {
	ORM::configure('mysql:host=localhost;dbname=ply');
	ORM::configure('username', 'root');
	ORM::configure('password', 'root');
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