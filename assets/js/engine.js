(function(playersNum, DECK, jQuery){
    'use strict';
    var bnb = angular.module('bnb', ['ngWebsocket']),
        PLAYERS = [],
        ResetLimit = 3;
    
    
    bnb.controller('enemyController', function($scope){
        //debugger;
        $scope.cards = getEnemyCards();
    });
    
    bnb.controller('gameController', function($scope, CardHandler){
        $scope.buffer = [];
        $scope.cards = getRandomCards();
        $scope.clearBuffer = function() {
            $scope.buffer = [];
        }
        
        $scope.send = function() {
            debugger;
            var cHandler;
            if (!$scope.buffer.length) {
                return;
            }
            var cHandler = new CardHandler($scope.cards);
            /*send them via websockets*/
            /*then delete*/
            angular.forEach($scope.buffer, function(card, key){              
                cHandler.deleteCard(card.id);
            });
            $scope.clearBuffer();
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
                if (this.cardSet[pos]) {
                    this.cardSet.splice(pos, 1);
                }
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
    
   /* bnb.run(function ($websocket) {
        //return;
        var ws = $websocket.$new('ws://localhost:12345')
          .$on('$open', function () {
            console.log('Oh my gosh, websocket is really open! Fukken awesome!');

            var data = {
                level: 1,
                text: 'ngWebsocket rocks!',
                array: ['one', 'two', 'three'],
                nested: {
                    level: 2,
                    deeper: [{
                        hell: 'yeah'
                    }, {
                        so: 'good'
                    }]
                }
            };

            ws.$emit('ping', 'hi listening websocket server') // send a message to the websocket server
              .$emit('pong', data);
          })
          .$on('pong', function (data) {
            console.log('The websocket server has sent the following data:');
            console.log(data);

           // ws.$close();
          })
          /*.$on('$close', function () {
            console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
          });*/
   // });
    
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
})(2,DECK,$);
    
    var conn = new WebSocket('ws://localhost:12345');
    conn.onopen = function(e) {
        console.log("Connection established!");
    };

    conn.onmessage = function(e) {
        console.log(e.data);
    };