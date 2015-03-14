var WS = (function(){
'use strict';
return function(host, port) {
        var connection = new WebSocket('ws://' + host + ':' + port),
                scope = this;
        connection.onopen = function () {
        };

        connection.onmessage = function (e) {
            try {
                scope.response = JSON.parse(e.data);
            }
            catch (e) {
                console.log(e);
                throw new Error('Cannot decode server response');
            }
            finally {

            }
            //console.log(e.data);
        };
    }
/*var conn = angular.module('Connection', []);
conn.factory('WS', function () {
    return function(host, port) {
            var connection = new WebSocket('ws://' + host + ':' + port),
                    scope = this;
            connection.onopen = function () {
            };

            connection.onmessage = function (e) {
                try {
                    scope.response = JSON.parse(e.data);
                }
                catch (e) {
                    console.log(e);
                    throw new Error('Cannot decode server response');
                }
                finally {

                }
                //console.log(e.data);
            };
        }
        });
*/
})()

