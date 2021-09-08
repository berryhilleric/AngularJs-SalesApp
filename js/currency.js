angular.module('SalesGoals').directive('maCurrencyInput', maCurrencyInput);

maCurrencyInput.$inject = ['$filter'];

function maCurrencyInput($filter) {
  var directive = {
    link: link,
    scope: {
      "number": '='
    }
  }

  return directive;

  function link(scope, elem, attrs, ctrl) {
    if (!ctrl) return;
    scope.$watch("elem[0].value", FormatNumber);
    FormatNumber(elem[0].value, elem[0].value);

    function FormatNumber(oldalue, elem[0].value) {
      var r, i;
      r = "" + v; //turn number into string
      for (i = r.length - 3; i > 0; i -= 3) {
        r = r.substr(0, i) + "," + r.substr(i);
      }
      elem[0].value = r;
    }
  }
}