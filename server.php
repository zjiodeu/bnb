<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use backend\Bnb;
define ('PROJECT_PATH', realpath(__DIR__));

require PROJECT_PATH . '/vendor/autoload.php';
require PROJECT_PATH . '/config.php';

    $server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new Bnb()
            )
        ),
        SERVER_PORT
    );

    $server->run();