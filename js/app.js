//wrapped in a Immediately Invoked Function Expression (IIFE) to help avoid variable collisions in the global scope

(function () {

    angular.module('SalesGoals', ['ngRoute', 'SalesGoalsControllers', 'SalesGoalsServices']);

    angular.module('SalesGoals').config(['$routeProvider', '$locationProvider', config]);

    function config($routeProvider, $locationProvider)
    {
        console.log("app module start");

        $routeProvider.when('/login', {
            templateUrl: 'login.html',
            controller: 'LoginGoalsCtrl',
            controllerAs: 'login'
        });

        $routeProvider.when('/monthlygoals', {
            templateUrl: 'monthlygoals.html',
            controller: 'MonthlyGoalsCtrl',
            controllerAs: 'monthlygoals'
        });

        $routeProvider.when('/assignment', {
            templateUrl: 'assignment.html',
            controller: 'AssignmentCtrl',
            controllerAs: 'assignment'
        });

        $routeProvider.when('/territories', {
            templateUrl: 'territories.html',
            controller: 'TerritoriesCtrl',
            controllerAs: 'territories'
        });

        $routeProvider.when('/changepassword', {
            templateUrl: 'changepassword.html',
            controller: 'ChangePasswordCtrl',
            controllerAs: 'changepassword'
        });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        });
        console.log("app module finish");
    }

})();
