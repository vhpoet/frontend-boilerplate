require('./app.controller');

var appDependencies = [
  'ng',
  'ngRoute',
  // Controllers
  'app'
];

var app = angular.module('frontendboilerplate', appDependencies);

$('body').prepend(require('../views/index.jade')());

app.config(['$routeProvider', function ($routeProvider) {
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
}]);

app.run(['$rootScope', '$routeParams', function ($rootScope, $routeParams)
{
  $rootScope.routeParams = $routeParams;
}]);
