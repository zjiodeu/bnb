var WS = (function(){
'use strict';
function Connection(host, port) {
        var conn = new WebSocket('ws://' + host + ':' + port),
                scope = this;
        this.observers = {
            'open' : [],
            'message' : [],
            'send' : []
        },
        conn.onopen = function () {
        };

        conn.onmessage = function (e) {
            try {
                debugger;
                scope.response = JSON.parse(e.data);
                scope.exec.call(scope, 'message', scope.response);
            }
            catch (e) {
                console.log(e);
                throw new Error('Cannot decode server response');
            }
            finally {

            }
        };
        this.send = function(data) {
            try {
              data = JSON.stringify(data);
              conn.send(data);
            }catch(e) {
                console.log(e);
                throw new Error('Cannot encode client request');  
            }
            finally {
                
            }           
        };
    }
    Connection.prototype = {
        
        registerObserver : function(event,handle) {
            if (!angular.isDefined(this.observers[event])) {
                throw new Error('Observer was added to undefined function');
            }
            this.observers[event].push(handle);
            return this;
        },
        
        unregisterObserver : function(event, handle) {
            if (!angular.isDefined(this.observers[event])) {
                throw new Error('Try to unsubscribe undefined function');
            }       
            this.observers[event] = this.observers[event].filter(function(item){
                return (item !== handle);
            });
            return this;
        },
        
        exec : function(observer, data) {
            var fnSet = this.observers && this.observers[observer];
            if (!fnSet) {
                console.log('No observers registered for ' + observer);
            }
            angular.forEach(fnSet, function(fn, key){
                fn(data);
            });
        }
        
    };
    
    return Connection;
})()

