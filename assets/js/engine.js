(function(playersNum, DECK, jQuery){
    'use strict';
    var bnb = angular.module('bnb', []),
        PLAYERS = [];
    
    /*bnb.controller("gameController", function($scope, $http) {
        $scope.cards = getRandomCards();
        $scope.choose = function(id) {
            var card = $scope.cards[id];
            card.active = !card.active;
        }
    });*/
    
    bnb.directive('desk', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/cards.html',
            controller: function ($scope) {
                $scope.cards = getRandomCards();
                $scope.choose = function (id) {
                    var card = $scope.cards[id];
                    card.active = !card.active;
                }
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