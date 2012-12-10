<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
// require 'Slim/Slim.php';
// 
// \Slim\Slim::registerAutoloader();

$app_root = '/Applications/MAMP/htdocs/ply/';

require $app_root.'vendor/autoload.php';

\Slim\Extras\Views\Mustache::$mustacheDirectory = $app_root.'vendor/mustache/mustache/src/Mustache';
\Slim\Extras\Views\Mustache::$mustacheEngineOptions = array(
	'partials_loader' => new \Mustache_Loader_FilesystemLoader('templates/partials'),
	'escape' => function($value) {
		return htmlspecialchars($value, ENT_COMPAT, 'UTF-8');
	},
	'charset' => 'ISO-8859-1'
);

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