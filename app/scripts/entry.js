'use strict';

require('./app.controller');
require('./about.controller');

$('body').prepend(require('../views/index.jade')());

var appDependencies = [
  'ng',
  'ui.router',
  // Controllers
  'app'
];

angular
  .module('frontendboilerplate', appDependencies)
  .config(appConfig);

appConfig.$nject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

function appConfig ($stateProvider, $urlRouterProvider, $locationProvider) {
  var routes = [
    {
      name: 'main',
      path: ''
    },
    {
      name: 'about',
      path: 'about'
    }
  ];

  routes.forEach(function(route){
    var template = require('../views/' + route.name + '.jade')();

    $stateProvider.state(route.name, {
      url: '/' + route.path,
      views: {
        guest: { template: template }
      }
    });
  });

  $urlRouterProvider.otherwise("/404");
  $locationProvider.html5Mode(true);
}
