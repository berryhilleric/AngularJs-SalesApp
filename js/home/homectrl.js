//wrapped in a Immediately Invoked Function Expression (IIFE) to help avoid variable collisions in the global scope

(function () {

  angular.module('SalesGoalsControllers').controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['$scope', '$location', '$http', '$rootScope', '$window'];

  function HomeCtrl($scope, $location, $http, $rootScope, $window) {
    console.log("start of Home controller");
    var vm = this;

    //comment



    vm.LogOut = function () {
      $rootScope.isAuthenticated = false;

      $location.path('login');
    }

    vm.ChangePassword = function () {
      $location.path('changepassword');
    }

    /////////////////////////////Initial controller logic///////////////////////////////////////////
    $rootScope.isAuthenticated = false;
    $rootScope.apiUrl = 'https://localhost/SalesGoalsApi/';

    $location.path('login');
  }
  console.log("end of Home controller");
})();