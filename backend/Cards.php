<?php
namespace backend;

class Cards {
    
    const CARDS_LENGTH = 52;
    
    const PIC_STORAGE = 'assets/images/cards';
    
    protected $_names = [
        'ace',
        'king',
        'queen',
        'wallet',
        'ten',
        'nine',
        'eight',
        'seven',
        'six',
        'five',
        'four',
        'three',
        'two'
    ];
    protected $_suits = [
        'cross',
        'hearts',
        'peak',
        'tambourine'
    ];
    
    protected static $_deck = [];
    
    protected $_submission;
    
    public function __construct($users = 2) {
        if ($users < 1) {
            throw new \Exception("wrong user number: {$users}");
        }
        $this->_submission = floor(Cards::CARDS_LENGTH / $users);
        $this->_generate();
    }
    
    protected function _generate() {
        $suitsCount = count($this->_suits);
        $available = floor(Cards::CARDS_LENGTH / $suitsCount);
        for ($i = 0; $i < $available; ++$i) {
            foreach ($this->_suits as $index => $suit) {
                static::$_deck[] = (object)[
                    'id' => $suitsCount * $i + $index,
                    'name' => $this->_names[$i],
                    'suit' => $suit,
                    'pic' => Cards::PIC_STORAGE . "/" . $this->_names[$i] . "_" . $suit . ".png"
                ];
            }
        }
        shuffle(self::$_deck);
        self::$_deck = array_values(self::$_deck);
    }
    
    
    public function get() {
      if (empty(static::$_deck)) {
          throw new \Exception('All cards were submitted');
      }
      return array_splice(static::$_deck, 0, $this->_submission);
    }
}

?>