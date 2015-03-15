(function(){
    var tpl = angular.module('tpl', []);
    tpl.directive('desk', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/cards.html',
        };
    });

    tpl.directive('leftmenu', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/leftmenu.html',
        };
    });
    
    tpl.directive('field', function () {
        return {
            restrict: "E",
            templateUrl: 'tpl/field.html',
        };
    });
})()