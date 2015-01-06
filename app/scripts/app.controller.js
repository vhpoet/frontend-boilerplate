'use strict';

/**
 * @ngdoc function
 * @name app.controller:AppController
 * @description
 * # AppController
 * Controller of the app
 */

angular
  .module('app', [])
  .controller('AppController', AppController);

AppController.$inject = ['$rootScope', '$location'];

function AppController ($scope, $location)
{

}
