<?php

// autoload_real.php generated by Composer

class ComposerAutoloaderIniteee5ba069b6c513d0714118aef0d5730
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __DIR__ . '/ClassLoader.php';
        }
    }

    public static function getLoader()
    {
        if (null !== static::$loader) {
            return static::$loader;
        }

        spl_autoload_register(array('ComposerAutoloaderIniteee5ba069b6c513d0714118aef0d5730', 'loadClassLoader'));
        static::$loader = $loader = new \Composer\Autoload\ClassLoader();
        spl_autoload_unregister(array('ComposerAutoloaderIniteee5ba069b6c513d0714118aef0d5730', 'loadClassLoader'));

        $vendorDir = dirname(__DIR__);
        $baseDir = dirname($vendorDir);

        $map = require __DIR__ . '/autoload_namespaces.php';
        foreach ($map as $namespace => $path) {
            $loader->add($namespace, $path);
        }

        $classMap = require __DIR__ . '/autoload_classmap.php';
        if ($classMap) {
            $loader->addClassMap($classMap);
        }

        $loader->register();

        return $loader;
    }
}
