//wrapped in a Immediately Invoked Function Expression (IIFE) to help avoid variable collisions in the global scope

(function (){
    console.log("start of controllers");
    angular.module('SalesGoalsControllers', []);
    console.log("end of controllers");
})();









