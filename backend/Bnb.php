<?php
namespace backend;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Bnb implements MessageComponentInterface {
    
    const CLIENT_MAX_NUMBER = 2;

    protected $clients;
    
    protected $cards;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->cards = new Cards(Bnb::CLIENT_MAX_NUMBER);
    }

    public function onOpen(ConnectionInterface $conn) {
        if (count($this->clients) < Bnb::CLIENT_MAX_NUMBER) {
            // Store the new connection to send messages to later
            $this->clients->attach($conn);
            $submission = $this->_prepareSubmission();
            $conn->send($submission);
            //echo "New connection! ({$conn->resourceId})\n";
        }
        else {
            echo "Sorry, game has already started";
        }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $numRecv = count($this->clients) - 1;
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

        foreach ($this->clients as $client) {
            //if ($from !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
           // }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }
    
    protected function _prepareSubmission() {
        $data = [
            'cards' => $this->cards->get(),
            'totalLength' => Cards::CARDS_LENGTH
        ];
        return json_encode($data);
    }
}