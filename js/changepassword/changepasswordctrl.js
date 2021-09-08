//wrapped in a Immediately Invoked Function Expression (IIFE) to help avoid variable collisions in the global scope

(function () {

    angular.module('SalesGoalsControllers').controller('ChangePasswordCtrl', ChangePasswordCtrl);

    ChangePasswordCtrl.$inject = ['$scope', '$location', '$http', '$rootScope', '$window'];

    function ChangePasswordCtrl($scope, $location, $http, $rootScope, $window)
    {

        var vm = this;

        vm.ChangePassword = function () {
            var oldpassword = $('#inputPasswordOld')[0].value;
            var newpassword = $('#inputPasswordNew')[0].value;
            var newpasswordverify = $('#inputPasswordNewVerify')[0].value;

            if (newpassword != newpasswordverify || oldpassword != $rootScope.user.Password) {
                //display alert
                alert("passwords do not match - try again");
                $('#success-alert').text("success").hide();
                $('#fail-alert').text("change password failed").show();
                return;
            }
            
            var data = {
                oldpassword: oldpassword,
                newpassword: newpassword,
                newpasswordverify: newpasswordverify
            }

            return $http({
                method: 'PUT',
                url: $rootScope.apiUrl + 'login',
                data:data,
                withCredentials: false,
                responseType: 'text',
                headers: {
                    Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
                }
            }).then(success, fail);

            function success(response) {
                console.log("update password success");
                $rootScope.user.Password = newpassword;
                $('#fail-alert').text("change password failed").hide();
                $('#success-alert').text("success").show();
            }

            function fail() {
                console.log("update password fail");
                $('#success-alert').text("success").hide();
                $('#fail-alert').text("change password failed").show();

                //display a message to the user that the login attempt failed
            }
        }
    }

})();