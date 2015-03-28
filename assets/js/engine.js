(function(jQuery, HOST, PORT){
    'use strict';
    var bnb = angular.module('bnb', ['tpl', 'ui.bootstrap']),
        PLAYERS = [],
        ResetLimit = 3,
        ws = new WS(HOST, PORT);
        
    bnb.controller('enemyController', function($scope){
        $scope.cards = getEnemyCards(26);
        $scope.checkCards = function() {
            var cardsCount = 0;
            if (!ws.response.lost) {
                angular.forEach(ws.response.cardsontable, function(data, key){
                    cardsCount += data.cards.length;
                });
                $scope.cards = $scope.cards.concat(getEnemyCards(cardsCount));
            }      
        };
        ws.registerObserver('message', function(){
            $scope.$apply(function () {
                if (ws.response.type === 'cardsReceived' && ws.response.cards && ws.response.cards.length) {
                    var len = ws.response.cards.length;
                    $scope.cards.splice($scope.cards.length - len, len);
                }
                else if (ws.response.type === 'checkyou' || ws.response.type === 'check'){
                    $scope.checkCards();
                }
                else if (ws.response.type === 'drop' && ws.response.count) {
                    $scope.cards.splice($scope.cards.length - ws.response.count, ws.response.count);
                }
            });
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
        $scope.checkCards = function() {
            var getAllCards = [];
            if (ws.response.lost) {
                angular.forEach(ws.response.cardsontable, function(data, key){
                    getAllCards = getAllCards.concat(data.cards);
                });
                $scope.userPromises += "You have lost!\n";
                $scope.cards = $scope.cards.concat(getAllCards);
            }
            else {
                $scope.userPromises += "You have won!\n";
                $scope.youFirst = true;
            }
            
        };
        
        $scope.dropTheQuartet = function() {
            debugger;
            var total = {},
                cHandler = new CardHandler($scope.cards),
                dropCount = 0;
            $scope.cardTypes.forEach(function(name) {
                if (typeof total[name] === 'undefined') {
                    total[name] = [];
                }
                $scope.cards.forEach(function(card) {
                    if (card.name === name) {
                        total[name].push(card);                 
                    }
                });
                if (total[name].length === 4) {
                   dropCount +=4;
                   for (var i = 0; i < 4; ++i) {
                       cHandler.deleteCard(total[name][i].id);
                   }
                }
            });
            if (dropCount) {
                ws.send({
                    'type' : 'drop',
                    'count' : dropCount
                });
            }
        }
        
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

                else if (ws.response.type === 'checkyou' || ws.response.type === 'check'){
                    $scope.checkCards();
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
            
            this.cardSet = cardSet || [];
    }
});

    function getEnemyCards(count) {
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