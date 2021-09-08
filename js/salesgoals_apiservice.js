//wrapped in a Immediately Invoked Function Expression (IIFE) to help avoid variable collisions in the global scope

(function () {

  angular.module('SalesGoalsServices').factory('SalesGoalsApiService', SalesGoalsApiService);

  SalesGoalsApiService.$inject = ['$rootScope', '$window', '$http', '$compile', '$location'];

  function SalesGoalsApiService($rootScope, $window, $http, $compile, $location) {
    var monthEndDays = ['31', '29', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];

    var service = {
      GetProgress: GetProgress,
      GetReportByStoreCode:GetReportByStoreCode,
      GetTerritories: GetTerritories,
      GetTerritoryStates: GetTerritoryStates,
      RemoveTerritory: RemoveTerritory,
      AddTerritory: AddTerritory,
      UpdateStates: UpdateStates,
      UpdateTerritory: UpdateTerritory
    }

    return service;

    //the correct value for month should be the month number - 1 --- for example, January would be 0, Feb would be 1
    //depending on the seqnum value -- returns  progress for 1 month, every territory if seqnum is < 0 or 1 month for 1 territory if a seqnum 0 or greater is provided
    //essentially the value of the seqnum determines if the seqnum query parameter is added to the uri, which affects which endpoint gets hit thus affecting the returned results
    function GetProgress(currentYear, month, seqnum) {
      var seqnumParam = '';
      if (seqnum > -1) {
        var seqnumParam = '&seqnum=' + seqnum;
      }

      var monthString = (month + 1) > 9 ? '' + (month + 1) : '0' + (month + 1); //prepends a 0 (if > 9) for formatting purposes of the backend sql query
      return $http({
        method: 'GET',
        url: $rootScope.apiUrl + 'sales?startdate=' + currentYear + monthString + '01' + '&enddate=' + currentYear + monthString + monthEndDays[month] + seqnumParam,
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      });
    }

    function GetReportByStoreCode(currentYear, month) {
      var monthString = (month + 1) > 9 ? '' + (month + 1) : '0' + (month + 1); //prepends a 0 (if > 9) for formatting purposes of the backend sql query
      return $http({
        method: 'GET',
        url: $rootScope.apiUrl + 'reports/storecode?startdate=' + currentYear + monthString + '01' + '&enddate=' + currentYear + monthString + monthEndDays[month],
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      });
    }

    function GetTerritories() {
      return $http({
        method: 'GET',
        url: $rootScope.apiUrl + 'territories',
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      });
    }

    function GetTerritoryStates() {
      return $http({
        method: 'GET',
        url: $rootScope.apiUrl + 'territories/sales-states',
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      });
    }

    function RemoveTerritory(seqnum) {
      return $http({
        method: 'DELETE',
        url: $rootScope.apiUrl + 'territories/' + seqnum,
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      }).then(success, fail);

      //callback methods -- they're are scoped to this function
      function success(response) {
        console.log("remove territory  success");
      }

      function fail(response) {
        console.log("remove territory  fail");
      }
    }

    function AddTerritory(name, goal, color) {
      color = color.replace('#', ''); //remove hashtage from color string because it was causing the uri to remove the color value
      return $http({
        method: 'POST',
        url: encodeURI($rootScope.apiUrl + 'territories?name=' + name + '&goal=' + goal + '&color=' + color),
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      }).then(success, fail);

      //callback methods -- they're are scoped to this function
      function success(response) {
        console.log("add territory  success");
      }

      function fail(response) {
        console.log("add territory  fail");
      }
    }

    function UpdateStates(territories) {
      return $http({
        method: 'PUT',
        url: encodeURI($rootScope.apiUrl + 'territories/states'),
        data: JSON.stringify(territories),
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      }).then(success, fail);

      //callback methods -- they're are scoped to this function
      function success(response) {
        console.log("update states  success");
      }

      function fail(response) {
        console.log("update states  fail");
      }
    }

    function UpdateTerritory(name, goal, color, seqnum) {
      color = color.replace('#', '');
      return $http({
        method: 'PUT',
        url: encodeURI($rootScope.apiUrl + 'territories?name=' + name + '&goal=' + goal + '&color=' + color + '&seqnum=' + seqnum),
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      }).then(success, fail);

      //callback methods -- they're are scoped to this function
      function success(response) {
        console.log("update territories  success");
      }

      function fail(response) {
        console.log("update territories  fail");
      }
    }

  }
})();