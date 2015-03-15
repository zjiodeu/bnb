(function(){
    var strategyApp = angular.module('strategy', []),
        strategy = function(type) {
            if (!this.type) {
                return function() {};
            }
            
           /* this.cardsSent = function(data) {
                var 
            }*/
        }
    
    strategyApp.factory('Strategy', function () {
        return strategy;
    });
})()
