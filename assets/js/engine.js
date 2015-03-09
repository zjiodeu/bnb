(function(playersNum, DECK, jQuery){
    'use strict';
    var bnb = angular.module('bnb', []),
        PLAYERS = [],
        ResetLimit = 3;
    
    bnb.controller("gameController", function($scope) {      
        $scope.cards = [];
        $scope.buffer = [];
        $scope.init = function() {
            $scope.cards = getRandomCards();            
        };
        $scope.getPos = function(id, context) {
            var cardSet = $scope[context];
            if (!(cardSet && cardSet.length)) {
                throw new Error('Undefined or empty context');
            }
            for (var i = 0; i < cardSet.length; ++i) {
                if (cardSet[i].id === id) {
                    return i;
                }
            }
            return false;
        }
        
        $scope.send = function() {
            if (!$scope.buffer.length) {
                return;
            }
            /*send them via websockets*/
            /*then delete*/
            angular.forEach($scope.buffer, function(card, key){
                //debugger;
                $scope.deleteCard(card.id);
            });
            $scope.clearBuffer();
        }
        $scope.getCard = function (id) {
            var pos = $scope.getPos(id, 'cards');
            if (false === pos || !$scope.cards[pos]) {
                throw new Error('cannot get the cart. ID:' + id);
            }
            return $scope.cards[pos];
        }
        $scope.deleteCard = function(id) {
            var pos = $scope.getPos(id, 'cards');
            if ($scope.cards[pos]) {
                $scope.cards.splice(pos, 1);
            }
        }
                
        $scope.setToBuffer = function(card) {
           card.inBuffer = true;
           return $scope.buffer.push(card) - 1;
        }
        
        $scope.deleteFromBuffer = function(card) {
            var pos = $scope.getPos(card.id, 'buffer');
            card.inBuffer = false;
            $scope.buffer.splice(pos, 1);
        }
        
        $scope.clearBuffer = function() {
            $scope.buffer = [];
        }
    });
    
    bnb.controller('enemyController', function($scope){
        $scope.cards = [];
    });
    
    bnb.controller('meController', function($scope){
        $scope.init();
        
        $scope.choose = function(id) {
            var card = $scope.getCard(id);
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
            console.log($scope.buffer);
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
        var total = Math.floor(DECK.totalLength / playersNum),
            set = [],
            random = 0;
        for (var i = 0; i < total; ++i) {
            random = Math.floor(Math.random() * DECK.cards.length);
            set.push(DECK.cards.splice(random,1)[0]);
        }
        return set;
        
    }
    /*bnb.directive('me', function() {
        return {
            restrict : 'E',
            templateUrl : 'tpl/cards.html'
        }
    });*/
})(2,DECK,$);