(function () {

  angular.module('SalesGoalsControllers').controller('MonthlyGoalsCtrl', MonthlyGoalsCtrl);

  MonthlyGoalsCtrl.$inject = ['$scope','$http', '$rootScope', '$q', 'SalesGoalsApiService', '$window'];

  function MonthlyGoalsCtrl($scope, $http, $rootScope, $q, SalesGoalsApiService, $window) {
    console.log("montly goals controller start");
    Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;
    var vm = this;
    vm.monthEndDays = ['31', '29', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
    vm.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //vm.currentTerritory = "NorthEast Territory";
    vm.chartType = 'month';
    vm.territorySalesNumbers = []; //holds territory name, written and delivered 
    vm.labels = [];
    vm.territoryWritten = []; //holds the written numbers that are displayed in the bar chart 
    vm.territoryDelivered = []; //holds the delivered numbers that are displayed in the bar chart 
    vm.goals = []; //holds the goals that are displayed in the bar chart 
    vm.goalPercentages = []; //holds the goal progress percentages that are displayed in the table below the bar chart 
    vm.currentTerritoryIndex = 0;
    vm.writtenTotal = 0; //holds the written total that is displayed in the table below the bar chart
    vm.deliveredTotal = 0; //holds the delivered total that is displayed in the table below the bar chart
    vm.goalsTotal = 0; //holds the goals total that is displayed in the table below the bar chart
    vm.goalsWrittenDifference = 0; //holds the difference of writtenTotal - deliveredTotal that is displayed as under/over in the table below the bar chart
    var date = new Date()
    vm.maxYear = date.getFullYear();    //used to set the max value on the year input element
    vm.thisMonth = date.getMonth();     //an integer that is the (month - 1) -- used to disable the goal input fields when the month has passed
    vm.thisYear = vm.maxYear;      //an integer representing the year -- used to disable the goal input fields when the year has passed
    vm.currentYear = date.getFullYear(); //an integer that represents the year - the current year in focus on the chart
    vm.currentMonth = date.getMonth(); //an integer that is the month - 1 -- used to index into monthEndDays and months arrays for the api call uri -- the current month in focus on the chart
    vm.currentMonthString = vm.months[vm.currentMonth]; //used to display the month name on the dropdown box above the chart
    vm.isLoadingData = false;
    vm.windowWidth = $window.innerWidth; //this is used in a condition in the dom to display data based on screen size
    vm.statesstring = "";

    //vm.AddCommasToNumber = function (index) {
    //  vm.territorySalesNumbers[index].displayValue = vm.territorySalesNumbers[index].goal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //}
    //always follow up with a call to UpdateChartData
    vm.GetProgressForOneTerritoryForEveryMonth = function (index) { //always followed up with a call to UpdateChartData
      vm.isLoadingData = true;
      vm.currentTerritoryIndex = index;
      var seqnum = vm.territories[index].seqnum;
      //vm.territorySalesNumbers = [];
      var tempTerritorySalesNumbers = []; //use a temp array to set the value of territorySalesNumbers all at once instead of pushing results one at a time as the promises resolve -- allows view  to update smoothly
      vm.chartType = 'year';
      
      if(vm.territories[index].name.includes('-'))
      {
        var tempstrings = vm.territories[index].name.split('-');
        vm.dropdownDisplayString = tempstrings[0];
        vm.statesstring = tempstrings[1];
      }
      else{
        vm.dropdownDisplayString = vm.territories[index].name;
      }
      
      var promises = [];
      for (var i = 0; i < 12; i++) {
        promises.push(SalesGoalsApiService.GetProgress(vm.currentYear, i, seqnum).then(function (response) {
          //fill the territory sales by just pushing the returned object into the tempTerritorySalesNumbers array
          tempTerritorySalesNumbers.push(response.data);
        }));
      }


      return $q.all(promises).then(function () {
        vm.isLoadingData = false;
        console.log("all months returned");
        //use a temp array to set the value of territorySalesNumbers all at once instead of pushing results one at a time as the promises resolve -- allows view  to update smoothly
        vm.territorySalesNumbers = tempTerritorySalesNumbers;   
        SortTerritorySalesNumbers();
      });

    }

    //always follow up with a call to UpdateChartData
    vm.GetProgressForOneMonthForEveryTerritory = function (month) { 
      vm.isLoadingData = true;
      vm.currentMonth = month;
      vm.chartType = 'month';
      vm.currentMonthString = vm.months[vm.currentMonth]; //display the correct month on the view in the dropdown box
      vm.dropdownDisplayString = vm.currentMonthString;

      return SalesGoalsApiService.GetProgress(vm.currentYear, month, -1).then(function (response) {
        vm.isLoadingData = false;
        console.log("monthly progress success");
        vm.territorySalesNumbers = response.data;
        SortTerritorySalesNumbers();
      });
    }

    vm.GetReportByStoreCode = function(){
      return SalesGoalsApiService.GetReportByStoreCode(vm.currentYear,vm.currentMonth).then(function(response){
        var csvstring = "sc,written,delivered\n";
        var data = response.data;
        var i;
        for(i = 0; i < data.length - 1; i++){
          csvstring += data[i]["sc"] + "," + data[i]["written"] + "," + data[i]["delivered"] + "\n";
        }

        csvstring += "Written_Total" + ',' + "Delivered_Total\n";
        csvstring += data[i]["Written_Total"] + ',' + data[i]["Delivered_Total"]

        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvstring);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'report_' + vm.currentYear + '-' + vm.currentMonth + '.csv';
        hiddenElement.click();
        hiddenElement.remove();
      });
    }

    //evaluates the chartType and calls the function to get the correct data 
    vm.UpdateChart = function () {
      if (vm.chartType == 'year')
        vm.GetProgressForOneTerritoryForEveryMonth(vm.currentTerritoryIndex).then(vm.UpdateChartData);
      else
        vm.GetProgressForOneMonthForEveryTerritory(vm.currentMonth).then(vm.UpdateChartData);
    }

    //window resize event trigger that stack the states list for the chart labels when screen gets smallers
    // angular.element($window).bind('resize', function(){
    //     vm.labels = [];
    //     for(let territory of vm.territorySalesNumbers){
    //       FormatChartLabels(territory);

    //     vm.salesProgress.update();
    //     $scope.$digest();
    //   }
    // });

    //this method is used to update the chart data after a database call has been made to get fresh data or update data
    vm.UpdateChartData = function () {

      vm.labels = [];
      vm.territoryWritten = [];
      vm.territoryDelivered = [];
      vm.goals = [];
  
      if (vm.chartType == 'month') {
        //update all chart info 
        for (var i = 0; i < vm.territorySalesNumbers.length; i++) {
          FormatChartLabels(vm.territorySalesNumbers[i])
          vm.goals.push(vm.territorySalesNumbers[i].goal);
          vm.territoryWritten.push(Round(vm.territorySalesNumbers[i].Written, 2));
          vm.territoryDelivered.push(Round(vm.territorySalesNumbers[i].Delivered, 2));
        }

        CalculateAllTotals();
      }
      else {
        //update all chart info but the labels -- bc the labels are just the names of months in order
        for (var i = 0; i < vm.territorySalesNumbers.length; i++) {
          vm.goals.push(vm.territorySalesNumbers[i].goal);
          //reset the following lists so that the values in the graph  are in the correct order
          vm.territoryWritten.push(Round(vm.territorySalesNumbers[i].Written, 2));
          vm.territoryDelivered.push(Round(vm.territorySalesNumbers[i].Delivered, 2));
        }
        vm.labels = vm.months;
        CalculateTotalsMonthToDate(); //calculates numbers only up to and including the current month of sales
      }

      GenerateProgressPercentages();

      vm.salesProgress.data.labels = vm.labels;
      vm.salesProgress.data.datasets[0].data = vm.goals;
      vm.salesProgress.data.datasets[1].data = vm.territoryWritten;
      vm.salesProgress.data.datasets[2].data = vm.territoryDelivered;
      vm.salesProgress.update();
    }


    function FormatChartLabels(territory){
      var [name,states] = territory.name.split("-"); 
      name = name.trim(); states = states.replace(/\s+/g,'');
      var labelarray = [];      
      var j;
      var offset;
      var label;
      if($window.innerWidth < 1026){
        j = 1;
        offset = 1;
        label = name;
      }
      else if($window.innerWidth < 1318){
        labelarray.push(name);
        j = 6;
        offset = 6;
        label = states;
      }
      else{
        labelarray.push(name);
        j = 9;
        offset = 9;
        label = states;
      }

      for(j; j < label.length; j+=offset){
        labelarray.push(label.substring(j-offset, j));
      }
      

      labelarray.push(label.substring(j-offset, label.length));
      vm.labels.push(labelarray);
    }

    vm.UpdateMonthlyGoal = function (index, month) { //no need to adjust the month here because it is correct and not used for indexing purposes
      vm.isLoadingData = true;
      var seqnum = vm.territorySalesNumbers[index].territory_id;
      var value = $("#" + vm.chartType + "-goals-input" + index)[0].value.replace(/,/g, "");
      vm.territorySalesNumbers[index].goal = parseInt(value);

      //percent is usually calculated in the database query, but since we dont return anything from an update, it needs to be calculated here in javascript
      vm.territorySalesNumbers[index].percent = Round(vm.territorySalesNumbers[index].Written / vm.territorySalesNumbers[index].goal * 100, 2);

      return $http({
        method: 'PUT',
        url: $rootScope.apiUrl + 'sales?seqnum=' + seqnum + '&year=' + vm.currentYear + '&month=' + month + '&value=' + value,
        withCredentials: false,
        responseType: 'text',
        headers: {
          Authorization: 'Basic ' + btoa($rootScope.user.Name + ':' + $rootScope.user.Password)
        }
      }).then(success, fail);


      function success(response) {
        vm.isLoadingData = false;
        SortTerritorySalesNumbers();
        console.log("update goal success");
      }
      function fail() {
        vm.isLoadingData = false;
        console.log("update goal fail");
      }
    }

    
    angular.element($window).bind('resize', function(){
        vm.windowWidth = $window.innerWidth;
        $scope.$apply();
    });
    

    //sums up every value in the goals, territoryWritten, territoryDelivered arrays -- values are displayed in the total written, delivered and goals table
    function CalculateAllTotals() {
      //use temp variables to prevent multiple dom updates
      var wt = 0;
      var dt = 0;
      var gt = 0;
      for (var i = 0; i < vm.territorySalesNumbers.length; i++) {
        wt += vm.territoryWritten[i];
        dt += vm.territoryDelivered[i];
        gt += vm.goals[i];
      }

      vm.writtenTotal = Round(wt, 2);
      vm.deliveredTotal = Round(dt, 2);
      vm.goalsTotal = Round(gt, 2);
      vm.goalsWrittenDifference = Round(vm.writtenTotal - vm.goalsTotal, 2);

      if (vm.goalsWrittenDifference > 0)
        vm.goalsWrittenDifference = '+' + vm.goalsWrittenDifference;

    }

    //calculates numbers only up to and including the current month of sales -- unless its a previous year, then it calculates all 12 months
    //Example: if the current month is June, then only goals from January thru June are calculated
    function CalculateTotalsMonthToDate() {
      //use temp variables to prevent multiple dom updates
      var wt = 0; //written total
      var dt = 0; //delivered total
      var gt = 0; //goals total
      for (var i = 0; i < vm.territorySalesNumbers.length; i++) {
        wt += vm.territoryWritten[i];
        dt += vm.territoryDelivered[i];
      }

      var indexMonth = (vm.currentYear == vm.maxYear) ? vm.thisMonth:11; //this holds the month (as a 0-based integer) that will be used to loop through and add all the goals together


      for (var i = 0; i <= indexMonth; i++) {
        gt += vm.goals[i];
      }

      vm.writtenTotal = Round(wt, 2);
      vm.deliveredTotal = Round(dt, 2);
      vm.goalsTotal = Round(gt, 2);
      vm.goalsWrittenDifference = Round(vm.writtenTotal - vm.goalsTotal, 2);

      if (vm.goalsWrittenDifference > 0)
        vm.goalsWrittenDifference = '+' + vm.goalsWrittenDifference;
    }

    //fills the goalPercentages array that is displayed in the goal progress table below the bar chart
    function GenerateProgressPercentages() {
      vm.goalPercentages = [];
      for (var i = 0; i < vm.territorySalesNumbers.length; i++) {
        var newGoalPercentage = { };
        if (vm.territorySalesNumbers[i].goal != 0)  {
          newGoalPercentage.label = vm.territorySalesNumbers[i].name;
          newGoalPercentage.value = Round((vm.territorySalesNumbers[i].Written / vm.territorySalesNumbers[i].goal * 100), 2) + '%';
          newGoalPercentage.delivered = vm.territorySalesNumbers[i].Delivered;
          newGoalPercentage.written = vm.territorySalesNumbers[i].Written;
          vm.goalPercentages.push(newGoalPercentage);
        }    
        else  {
          newGoalPercentage.label = vm.territorySalesNumbers[i].name;
          newGoalPercentage.value = 0.00 + '%';
          newGoalPercentage.delivered = vm.territorySalesNumbers[i].Delivered;
          newGoalPercentage.written = vm.territorySalesNumbers[i].Written;
          vm.goalPercentages.push(newGoalPercentage);
        }          
      }
    }

    function Round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    vm.FormatNumbers = function (index) {
      var value = $("#" + vm.chartType + "-goals-input" + index)[0].value.toString().replace(/,/g, "");
      $("#" + vm.chartType + "-goals-input" + index)[0].value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //sorts the territorySalesNumbers array based on the chart -- percent if the chart in monthly or month if the chart is yearly
    function SortTerritorySalesNumbers() {

      //sort the territories in descending order based on percent
      if (vm.chartType == 'month') {
        vm.territorySalesNumbers.sort(function (a, b) { return b.percent - a.percent }); //descending order
      }
      //sort the territories in ascending order based on month -- 1 = january to 12 = december
      else {
        vm.territorySalesNumbers.sort(function (a, b) { return a.month - b.month }); //ascending order
      }
    }

    /////////////////////////////Initial Controller Logic///////////////////////////////////

    var promise1 = vm.GetProgressForOneMonthForEveryTerritory(vm.currentMonth);

    var promise2 = SalesGoalsApiService.GetTerritories().then(function (response) {
      vm.territories = response.data;
      return Promise.resolve();
    }); //We go ahead an get every territory to reference in the dropdown menu -- the view populates the goal input boxes weird and choppy if not done this way
    

    $q.all([promise1, promise2]).then(BuildChart).then(vm.UpdateChartData);

    


    //function to generate the html chart - reference https://www.chartjs.org/docs/latest/
    function BuildChart() {
      vm.ctx = document.getElementById('myChart').getContext('2d');
      vm.salesProgress = new Chart(vm.ctx, {
        type: 'bar',
        data: {
          labels: vm.labels,
          datasets: [{
            label: 'goal',
            data: vm.goals,
            backgroundColor: [
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          },
          {
            label: 'written',
            data: vm.territoryWritten,

            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          },
          {
            label: 'delivered',
            data: vm.territoryDelivered,
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(54, 162, 235, 0.6)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
          }
          ]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
            //xAxes: [{

            //    gridLines: {
            //        lineWidth: 1.5,
            //        //color: 'rgba(25, 25, 25, 0.4)',
            //        drawBorder: true
            //    }
            //}]

          }
          //animation: {
          //    onProgress: function (animation) {
          //        progress.value = animation.animationObject.currentStep / animation.animationObject.numSteps;
          //    }
          //}

        }
      });
    }



    console.log("montly goals controller start");
  }

})();