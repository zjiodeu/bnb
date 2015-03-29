<?php
namespace backend;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Bnb implements MessageComponentInterface {
    
    const CLIENT_MAX_NUMBER = 2;

    protected $clients;
    
    protected $cards;
    
    protected static $cardsOnTable = [];

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->cards = new Cards(Bnb::CLIENT_MAX_NUMBER);
    }

    public function onOpen(ConnectionInterface $conn) {
        if (count($this->clients) < Bnb::CLIENT_MAX_NUMBER) {
            // Store the new connection to send messages to later
            $this->clients->attach($conn);
            if (count($this->clients) > 1) {
                foreach ($this->clients as $client) {
                    $submission = $this->_prepareSubmission();
                    $client->send($submission);
                }
            }
            else {
                $waitResponse = $this->_makeClientWaiting();
                $conn->send($waitResponse);
            }
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

        $msgData = static::parseMessage($msg);
        $selfResponse = '';
        $clientResponse = '';
        
        switch($msgData['type']) {
            case 'cardsSent' : {
                $clientResponse = static::encodedCards($msgData);
                static::$cardsOnTable[] = $selfResponse = $msgData;
                break;
            }
            case 'check' : {
                $selfResponse = end(static::$cardsOnTable);
                $selfResponse['type'] = 'check';
                $clientResponse = ['type' => 'checkyou'];   
                $selfResponse['cardsontable'] = $clientResponse['cardsontable'] = $this->getUniqCards(static::$cardsOnTable);
                if ($this->check($msgData['name'])) {
                   $selfResponse['lost'] = true; 
                }
                else {
                   $clientResponse['lost'] = true;
                }
                static::$cardsOnTable = [];
                break;
            }
            case 'drop' : {
                $clientResponse = $msgData;
                break;
            }
            default : break;
        }
        foreach ($this->clients as $client) {            
                $client->send(
                        ($from !== $client)? 
                        json_encode($clientResponse):
                        json_encode($selfResponse)
                        );
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
            'totalLength' => Cards::CARDS_LENGTH,
            'type' => 'init'
        ];
        return json_encode($data);
    }
    
    protected static function parseMessage($msg) {
        $data = [];
        try {
            $data = json_decode($msg, TRUE);
            if (isset($data['cards'])) {
                $data['cards'] = array_map(function($el){                
                    $el['inBuffer'] = $el['active'] = false; 
                    return $el;
                },$data['cards']);
            }
            //print_r($data);
            if (!isset($data['type'])) {
                $data['type'] = '';
                throw new \Exception("wrong message format {$msg}");
            }
        } catch (Exception $e) {
            echo $e->getMessage();
        }
        return $data;
    }
    
    protected static function encodedCards(array $msgData) { 
        $msgData['type'] = 'cardsReceived';
        $msgData['cards'] = array_map(function($el) {
            $el['id'] = 0;
            $el['name'] = 'unknown';
            $el['suit'] = 'unknown';
            $el['pic'] = 'assets/images/cards/back.png';
            return $el;
        },$msgData['cards']);
        return $msgData;
    }
    
    protected function _makeClientWaiting() {
        $data = [
            'type' => 'waiting'
        ];
        return json_encode($data);
    }
    
    protected function check($name) {
        $cards = end(static::$cardsOnTable)['cards'];
        foreach ($cards as $card) {
            //print_r($card);
            if ($card['name'] !== $name) {
                return false;
            }
        }
            
        return true;
    }
    
    public function getUniqCards() {
        $cardsOnTable = static::$cardsOnTable;
        $buffer = [];
        foreach ($cardsOnTable as &$set) {
            foreach ($set['cards'] as $key => &$card) {
                if (in_array($card, $buffer)) {
                    unset($set['cards'][$key]);
                }
                else {
                    $buffer[] = $card;
                }
            }
        }
        print_r($cardsOnTable);
        return $cardsOnTable;
    }

}