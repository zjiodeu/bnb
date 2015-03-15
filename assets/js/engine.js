(function(jQuery, HOST, PORT){
    'use strict';
    var bnb = angular.module('bnb', []),
        PLAYERS = [],
        ResetLimit = 3,
        ws = new WS(HOST, PORT);
        
    bnb.controller('enemyController', function($scope){
        //debugger;
        $scope.cards = getEnemyCards();
    });
    
    bnb.controller('gameController', function($scope, $interval, CardHandler){
        $scope.buffer = [];
        $scope.cards = [];
        $scope.cardsInGame = [];
        
        ws.registerObserver('message', function(){
            if (ws.response.type === 'init') {
                $scope.cards = ws.response.cards;
            }
            if (ws.response.type === 'cardsSent') {
                $scope.cardsInGame = ws.response.cards;
            }
        });
        
        $scope.clearBuffer = function() {
            $scope.buffer = [];
        }
        
        $scope.send = function() {
            debugger;
            var cHandler;
            if (!$scope.buffer.length) {
                return;
            }
            var cHandler = new CardHandler($scope.cards),
                cardsForSending = [];
            /*send them via websockets*/
            /*then delete*/
            angular.forEach($scope.buffer, function(card, key){              
                cardsForSending.push(cHandler.deleteCard(card.id));
            });
            $scope.clearBuffer();
            ws.send(cardsForSending);
        }
                
        $scope.setToBuffer = function(card) {
           card.inBuffer = true;
           return $scope.buffer.push(card) - 1;
        }
        
        $scope.deleteFromBuffer = function(card) {
            var bufferHandler = new CardHandler($scope.buffer);
            var pos = bufferHandler.getPos(card.id);
            card.inBuffer = false;
            $scope.buffer.splice(pos, 1);
        }
        
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
        }
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
                return (this.cardSet[pos]) ? this.cardSet.splice(pos, 1): false;
            }
            
            this.cardSet = cardSet;
    }
});
    
    
    bnb.directive('desk', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/cards.html',
        };
    });
    
    bnb.directive('leftmenu', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/leftmenu.html',
            controller : function($scope) {
                
            }
        };
    });
    
    function getRandomCards() {
       /* var total = Math.floor(DECK.totalLength / playersNum),
            set = [],
            random = 0;
        for (var i = 0; i < total; ++i) {
            random = Math.floor(Math.random() * DECK.cards.length);
            set.push(DECK.cards.splice(random,1)[0]);
        }
        return set;*/
        
    }
    
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