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

$app = new \Slim\Slim(array(
	'view' => new \Slim\Extras\Views\Mustache()
));

$app->get('/hello/:name', function ($name) use ($app) {
    $app->render('hello.mustache', array( 'name' => $name ));
});

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

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();
