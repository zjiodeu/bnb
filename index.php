<?php require('./config.php'); ?>
<html ng-app="bnb">
  <head>
    <title>Believe or not believe</title>
    <link rel="stylesheet" type="text/css" href="node_modules/bootstrap/dist/css/bootstrap.css"/>
    <link rel="stylesheet" type="text/css" href="assets/css/styles.css"/>
    <script>
        window.SERVER_IP = '<?=SERVER_IP;?>';
        window.SERVER_PORT = '<?=SERVER_PORT;?>';
    </script>
    <script src="node_modules/angular/angular.min.js"></script>
    <script src="node_modules/bootstrap-gh-pages/ui-bootstrap-0.12.1.min.js"></script>
    <script src="node_modules/jquery/dist/jquery.min.js"></script>
    <script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="node_modules/bower_components/ng-websocket/ng-websocket.js"></script>
    <script src="assets/js/connection.js"></script>
    <script src="assets/js/engine.js"></script>
    <script src="assets/js/tpl.js"></script>
    <meta content="">
  </head>
  <body ng-controller="gameController as game">
  <leftmenu></leftmenu>
  <desk id="opponent" class="desk" ng-controller="enemyController"></desk>
  
  <field ng-controller="fieldController"></field>
  
  <desk id="me" class="desk"></desk>
  
  <textarea ng-model="userPromises" class="form-control pull-right" 
            style="width:8%;height:90%;resize: none; border:2px solid #1D7C22; font-size:11px;background:rgba(250,250,250,0.5)" readonly>{{userPromises}}</textarea>
  </body>
</html>