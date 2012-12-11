<?php

require 'vendor/autoload.php';

\Slim\Extras\Views\Mustache::$mustacheDirectory = 'vendor/mustache/mustache/src/Mustache';
\Slim\Extras\Views\Mustache::$mustacheEngineOptions = array(
	'partials_loader' => new \Mustache_Loader_FilesystemLoader('templates/partials'),
	'escape' => function($value) {
		return htmlspecialchars($value, ENT_COMPAT, 'UTF-8');
	},
	'charset' => 'ISO-8859-1'
);

ActiveRecord\Config::initialize(function($cfg) {
    $cfg->set_model_directory('models');
    $cfg->set_connections(array(
        'development' => 'mysql://root:root@localhost/ply'
    ));
});

class AllCapsMiddleware extends \Slim\Middleware
{
    public function call()
    {
        // Get reference to application
        $app = $this->app;

        // Run inner middleware and application
        $this->next->call();

        // Capitalize response body
        $res = $app->response();
        $body = $res->body();
        $res->body(strtoupper($body));
    }
}

$app = new \Slim\Slim(array(
	'log.enabled' => true,
	'view' => new \Slim\Extras\Views\Mustache()
));

class Book extends ActiveRecord\Model { }

$book = new Book(array('name' => 'Jax'));
$book->save();

var_dump($data); 

//$app->add(new \AllCapsMiddleware());

$app->hook('slim.before', function () {
   echo 'rolling..<hr />';
});

$log = $app->getLog();
$log->setLevel(\Slim\Log::WARN);

$app->notFound(function () use ($app) {
    echo '404';
});

class Bla {
	
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
	$bla = new \Bla;
	$app->render('hello.mustache', array('data' => $bla));
});

$app->get('/hello/:name+/archive(/:year(/:month(/:day)))', function ($name, $year = 2010, $month = 12, $day = 05) use ($app) {
	
	$bla = new \Bla;
	$bla->setDate(sprintf('%s-%s-%s', $year, $month, $day));
	
	if ( $name === 'Waldo' ) {
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

// POST route
$app->post('/post', function () {
    echo 'This is a POST route';
});

// PUT route
$app->put('/put', function () {
    echo 'This is a PUT route';
});

// DELETE route
$app->delete('/delete', function () {
    echo 'This is a DELETE route';
});

$app->run();

if ($app->response()->isOk()) {
	echo '<pre>';
	var_dump($app->response());
	var_dump($app->response()->status());
}