require('./app.controller');

$('body').prepend(require('../views/index.jade')());

var appDependencies = [
  'ng',
  'ngRoute',
  // Controllers
  'app'
];

angular
  .module('frontendboilerplate', appDependencies)
  .config(appConfig);

appConfig.$nject = ['$routeProvider'];

function appConfig ($routeProvider) {
  var routes = [
    {
      path: '/',
      template: 'index'
    }
  ];

  routes.forEach(function(route){
    $routeProvider.when(route.path, {template: require('../views/' + route.template + '.jade')()});
  });

  $routeProvider.otherwise({redirectTo: '/404'});
}