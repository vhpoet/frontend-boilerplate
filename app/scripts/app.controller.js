/**
 * APP
 *
 * The app controller manages the global scope.
 */

angular
  .module('app', [])
  .controller('AppController', AppController);

AppController.$inject = ['$rootScope', '$location'];

function AppController ($scope, $location)
{

}