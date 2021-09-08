
//wrapped in a Immediately Invoked Function Expression (IIFE) to help avoid variable collisions in the global scope

(function () {
    console.log("start of services");
    angular.module('SalesGoalsServices', []);
    console.log("end of services");

})();