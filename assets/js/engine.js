(function(jQuery, HOST, PORT){
    'use strict';
    var bnb = angular.module('bnb', ['tpl', 'ui.bootstrap']),
        PLAYERS = [],
        ResetLimit = 3,
        ws = new WS(HOST, PORT);
        
    bnb.controller('enemyController', function($scope){
        $scope.cards = getEnemyCards();
        ws.registerObserver('message', function(){
            debugger;
            if (ws.response.type === 'cardsReceived' && ws.response.cards && ws.response.cards.length) {
               // $scope.cardsInGame = ws.response.cards;
                $scope.$apply(function(){
                    var len = ws.response.cards.length;                   
                    $scope.cards.splice($scope.cards.length - len, len);                   
               });
            }
        });
    });
    
    bnb.controller('fieldController', function($scope){
        $scope.cards = [];
        ws.registerObserver('message', function(){
            //debugger;
            if ((ws.response.type === 'cardsSent' || ws.response.type === 'cardsReceived')
                    && ws.response.cards && ws.response.cards.length) {
               // $scope.cardsInGame = ws.response.cards;
                $scope.$apply(function(){
                    $scope.cards = $scope.cards.concat(ws.response.cards);                   
               });
            }
        });
    });
    
    bnb.controller('gameController', function($scope, $interval, CardHandler, $modal){
        $scope.buffer = [];
        $scope.cards = [];
        $scope.notBelieveFlag = false;
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
        $scope.providedCards = $scope.cardTypes[1];
                
        ws.registerObserver('message', function(){
            var modalInstance;
            if (ws.response.type === 'init') {
                $scope.$apply(function(){
                    $scope.cards = ws.response.cards; 
                    $modal.close(modalInstance || modalInstance.result);
                });
            }
            else if (ws.response.type === 'cardsReceived') {
                $scope.notBelieveFlag = true;
            }
            else if (ws.response.type === 'waiting') {
                alert('waiting for another client');
                    /*var modalInstance = $modal.open({
                        templateUrl: 'tpl/waiting.html',
                        size: 'lg',
                        backdrop : false,
                        windowTemplateUrl : 'tpl/window.html'
                    });*/
            }
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
                    'type' : 'cardsSent'
                };
            /*send them via websockets*/
            /*then delete*/
            angular.forEach($scope.buffer, function(card, key){              
                cardsForSending.cards.push(cHandler.deleteCard(card.id));
            });
            $scope.clearBuffer();
            ws.send(cardsForSending);
        }
                
        $scope.setToBuffer = function(card) {
           var buflen = 0;
           buflen = $scope.buffer.push(card) - 1;
           /*$scope.$apply(function(){
               buflen = $scope.buffer.push(card) - 1;
           });*/
           card.inBuffer = true;
           return buflen;
        }
        
        $scope.deleteFromBuffer = function(card) {
            var bufferHandler = new CardHandler($scope.buffer);
            var pos = bufferHandler.getPos(card.id);
            card.inBuffer = false;
            $scope.buffer.splice(pos, 1);
            /*$scope.$apply(function(){
                $scope.buffer.splice(pos, 1);
            });*/
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