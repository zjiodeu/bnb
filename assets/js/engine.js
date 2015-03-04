(function(playersNum, DECK, jQuery){
    'use strict';
    var bnb = angular.module('bnb', []),
        PLAYERS = [],
        ResetLimit = 3;
    
    bnb.controller("gameController", function($scope, $http) {
        var card;
        $scope.cards = getRandomCards();
        $scope.buffer = [];
        $scope.choose = function(id) {
            debugger;
            card = $scope.getCard(id);
            card.active = !card.active;
            if (card.active && $scope.buffer.length <= ResetLimit) {
               $scope.setCard(card); 
            }
            else {
               $scope.deleteCard(card);             
            }
            console.log($scope.buffer);
        }
        $scope.getCard = function (id) {
            for (var i = 0; i < $scope.cards.length; ++i) {
                if ($scope.cards[i].id === id) {
                    $scope.cards[i].pos = i;
                    $scope.cards[i].bufferPos = function() {
                        
                    }()
                    return $scope.cards[i];
                }
            }
            return false;
        }
        
        $scope.setCard = function(card) {
           return $scope.buffer.push(card) - 1;
        }
        
        $scope.deleteCard = function(card) {
           var target = $scope.getCard(card.id);
           if (!target) {
               console.log("card "  + card.id + " has already been deleted");
               return false;
           }
           $scope.buffer.splice(target.pos, 1);
        }
    });
    
    bnb.directive('desk', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/cards.html',
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