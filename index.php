<?php

require 'vendor/autoload.php';

class MustacheView extends \Slim\View
{
    /**
     * @var string The path to the directory containing Mustache.php
     */
    public static $mustacheDirectory = null;

    /**
     * Renders a template using Mustache.php.
     *
     * @see View::render()
     * @param string $template The template name specified in Slim::render()
     * @return string
     */
    public function render($template)
    {
        require_once self::$mustacheDirectory . '/Autoloader.php';
        \Mustache_Autoloader::register(dirname(self::$mustacheDirectory));
			$m = new \Mustache_Engine;
			$m->setPartialsLoader(new \Mustache_Loader_FilesystemLoader('templates/partials'));
			$m->addHelper('_i18n', function($text) {
				// IRL, you would use something far more robust :)
				$dictionary = array(
					'Hello.' => 'Hola.',
					'My name is {{ name }}.' => 'Me llamo {{ name }}.'
				);
				return array_key_exists($text, $dictionary) ? $dictionary[$text] : $text;
			});
			$m->addHelper('test', function($text) {
				return 'test!';
			});
			
			
        $contents = file_get_contents($this->getTemplatesDirectory() . '/' . ltrim($template, '/'));
        return $m->render($contents, $this->data);
    }
}

MustacheView::$mustacheDirectory = 'vendor/mustache/mustache/src/Mustache';

// ActiveRecord\Config::initialize(function($cfg) {
// 	$cfg->set_model_directory('models');
// 	$cfg->set_connections(array(
//         'development' => 'mysql://root:root@localhost/ply'
//     ));
// });

ORM::configure('mysql:host=localhost;dbname=ply');
ORM::configure('username', 'root');
ORM::configure('password', 'root');

class Book extends Model
{
}

echo '<pre>';

$books = Model::factory('Book')->find_many();

echo json_encode(array_map(function ($book) {
    return $book->as_array();
}, $books));

echo '</pre>';

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
	'log.enabled' => true,
	'view' => new MustacheView()
));

$app->hook('slim.before', function () {
   echo 'slim rolling..<hr />';
});

$app->notFound(function () use ($app) {
    echo '404';
});

class ViewModel {
	
	public $name = 'Maarten';
	public $date = 'Maarten';
	
	public function name() {
		return 'MaartenWierda';
	}
	
	public function setDate($date) {
		$this->date = $date;
	}
}

$app->get('/test', function () use ($app) {
	$bla = new \ViewModel;
	$app->render('hello.mustache', array('data' => $bla));
});

$app->get('/hello/:name+/archive(/:year(/:month(/:day)))', function ($name, $year = 2010, $month = 12, $day = 05) use ($app) {
	
	$bla = new \ViewModel;
	$bla->setDate(sprintf('%s-%s-%s', $year, $month, $day));
	
	if ( is_array($name) && $name[0] === 'Waldo' ) {
		$app->notFound();
	} else {
		//$app->render('hello.mustache', array( 'name' => $name ));
		
		$view = $app->view();
		$view->setData(array(
		    'color' => 'red',
		    'size' => 'medium'
		));
		
		$view->appendData(array(
		    'size' => 'large'
		));
		
		$app->render('hello.mustache', array('data' => $bla ));
	}
})->name('hello');

var_dump($app->urlFor('hello', array('name' => 'Joe/Hoe', 'year' => '2006')));

$app->run();

// if ($app->response()->isOk()) {
// 	echo '<pre>';
// 	var_dump($app->response());
// 	var_dump($app->response()->status());
// }
