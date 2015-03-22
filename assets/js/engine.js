(function(jQuery, HOST, PORT){
    'use strict';
    var bnb = angular.module('bnb', ['tpl', 'ui.bootstrap']),
        PLAYERS = [],
        ResetLimit = 3,
        ws = new WS(HOST, PORT);
        
    bnb.controller('enemyController', function($scope){
        $scope.cards = getEnemyCards();
        ws.registerObserver('message', function(){
            //debugger;
            if (ws.response.type === 'cardsReceived' && ws.response.cards && ws.response.cards.length) {
               // $scope.cardsInGame = ws.response.cards;
                $scope.$apply(function(){
                    var len = ws.response.cards.length;                   
                    $scope.cards.splice($scope.cards.length - len, len);                   
               });
            }
        });
    });
    
    bnb.controller('fieldController', function($scope, $timeout){
        $scope.cards = [];
        $scope.clearField = function() {
            $timeout(function(){
               $scope.cards = []; 
            }, 1000);
        };
        ws.registerObserver('message', function(){
            $scope.$apply(function () {
                if ((ws.response.type === 'cardsSent' || ws.response.type === 'cardsReceived')
                        && ws.response.cards && ws.response.cards.length) {
                    // $scope.cardsInGame = ws.response.cards;
                    $scope.cards = $scope.cards.concat(ws.response.cards);
                }
                else if (ws.response.type === 'check') {
                    var len = ws.response.cards.length;
                    $scope.cards.splice($scope.cards.length - len, len);
                    $scope.cards = $scope.cards.concat(ws.response.cards);
                    $scope.clearField();
                }
                else if (ws.response.type === 'checkyou') {
                    $scope.clearField();
                }
            });
        });
    });
    
    bnb.controller('gameController', function($scope, CardHandler){
        $scope.buffer = [];
        $scope.cards = [];
        $scope.yourStep = false;
        $scope.youFirst = false;
        $scope.userPromises = '';
        $scope.cardTypes = [        
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
        $scope.promisedCards = $scope.cardTypes[1];
        $scope.selectWinner = function(playerId) {
            debugger;
            var getAllCards = [];
            var playerNames = ['You', 'Opponent'];
            if (ws.response.cardsontable) {
                angular.forEach(ws.response.cardsontable, function(data, key){
                    getAllCards = getAllCards.concat(data.cards);
                });
                if (playerId === 1) {
                    $scope.userPromises = playerNames[playerId] + ": checking you! You lose!\n";
                    $scope.cards = $scope.cards.concat(getAllCards);
                }
            }
            else {
                $scope.userPromises = playerNames[playerId] + ": checking you! You win!\n";
                $scope.youFirst = true;
            }
            
        };
        
        ws.registerObserver('message', function(){
            $scope.$apply(function(){
                if (ws.response.type === 'init') {
                        $scope.cards = ws.response.cards; 
                }
                else if (ws.response.type === 'cardsReceived') {
                    $scope.yourStep = true;
                    $scope.userPromises += "Opponent: " + ws.response.cards.length +" "+ ws.response.promise + "\n";
                    $scope.promisedCards = ws.response.promise;
                }
                else if (ws.response.type === 'waiting') {
                    $scope.youFirst = true;
                    alert('waiting for another client');
                }

                else if (ws.response.type === 'checkyou') {
                    //$scope.userPromises += "Opponent: checking you! \n";
                    $scope.selectWinner(1);
                }   
                else if (ws.response.type === 'check'){
                    $scope.selectWinner(0);
                }
            });
        });
        
        $scope.clearBuffer = function() {
            $scope.buffer = [];
        }
        
        $scope.send = function() {
            var cHandler;
            if (!$scope.buffer.length) {
                return;
            }
            var cHandler = new CardHandler($scope.cards),
                cardsForSending = {
                    'cards' : [],
                    'type' : 'cardsSent',
                    'promise' : $scope.promisedCards
                };
            $scope.userPromises += "You: " + $scope.buffer.length +" "+ $scope.promisedCards + "\n";
            /*send them via websockets*/
            /*then delete*/
            angular.forEach($scope.buffer, function(card, key){              
                cardsForSending.cards.push(cHandler.deleteCard(card.id));
            });
            $scope.clearBuffer();
            $scope.yourStep = false;
            $scope.youFirst = false;
            ws.send(cardsForSending);
        };
        
        $scope.dontBelieve = function() {
            //debugger;
            ws.send({
                type : 'check',
                'name' : $scope.promisedCards
            });
        };
                
        $scope.setToBuffer = function(card) {
           var buflen = 0;
           buflen = $scope.buffer.push(card) - 1;
           card.inBuffer = true;
           return buflen;
        };
        
        $scope.deleteFromBuffer = function(card) {
            var bufferHandler = new CardHandler($scope.buffer);
            var pos = bufferHandler.getPos(card.id);
            card.inBuffer = false;
            $scope.buffer.splice(pos, 1);
        };
        
        $scope.choose = function(id) {
            var cHandler = new CardHandler($scope.cards);
            var card = cHandler.getCard(id);
            card.active = !card.active;
            if (card.active) {
                if ($scope.buffer.length < ResetLimit) {
                    $scope.setToBuffer(card); 
                }
                else {
                    card.active = !card.active;
                    return;
                }
            }
            else {
                $scope.deleteFromBuffer(card);             
            }
        };
    });
   
    bnb.factory('CardHandler', function () {
        return function(cardSet) {    
            this.getPos = function(id) {
                if (!(this.cardSet && this.cardSet.length)) {
                    throw new Error('Undefined or empty context');
                }
                for (var i = 0; i < this.cardSet.length; ++i) {
                    if (this.cardSet[i].id === id) {
                        return i;
                    }
                }
                return false;
            },
            this.getCard = function (id) {
                var pos = this.getPos(id);
                if (false === pos || !this.cardSet[pos]) {
                    throw new Error('cannot get the cart. ID:' + id);
                }
                return this.cardSet[pos];
            },
            this.deleteCard = function(id) {
                var pos = this.getPos(id);
                return (this.cardSet[pos]) ? this.cardSet.splice(pos, 1)[0]: false;
            }
            
            this.cardSet = cardSet;
    }
});

    function getEnemyCards() {
        var count = 26;
        var set = [];
        while(count--) {
            set.push({
            "id" : 0,
            "name" : "",
            "suit" : "",
            "pic" : "assets/images/cards/back.png"  
        });
        }
        return set;
    }
})($, 'localhost', 12345);