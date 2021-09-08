(function () {

  angular.module('SalesGoalsControllers').controller('LoginGoalsCtrl', LoginGoalsCtrl);

  LoginGoalsCtrl.$inject = ['$scope', '$location', '$http', '$rootScope', '$window', '$q', 'SalesGoalsApiService'];

  function LoginGoalsCtrl($scope, $location, $http, $rootScope, $window, $q, SalesGoalsApiService) {
    console.log("login controller start");

    var vm = this;

    vm.isAuthenticatingUser = false;

    vm.Login = function () {

      vm.isAuthenticatingUser = true;
      var email = $('#login-email')[0].value;
      var password = $('#login-password')[0].value;



      //var data = {
      //    Username: email,
      //    Password: password
      //}

      return $http({
        method: 'GET',
        url: $rootScope.apiUrl + 'login',
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa(email + ':' + password)
        }
      }).then(success, fail);

      function success(response) {
        vm.isAuthenticatingUser = false;
        console.log("login success");

        //need some logic to decide what to do with the user result
        $location.path('monthlygoals');
        $rootScope.isAuthenticated = true;
        $rootScope.user = response.data.Identity;
        $rootScope.user.Password = password;
      }

      function fail() {
        vm.isAuthenticatingUser = false;
        console.log("login fail");

        //display a message to the user that the login attempt failed
      }
    }

    console.log("login controller end");
  }

})();