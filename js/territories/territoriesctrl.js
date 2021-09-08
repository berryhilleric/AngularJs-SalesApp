(function () {

    angular.module('SalesGoalsControllers').controller('TerritoriesCtrl', TerritoriesCtrl);

    TerritoriesCtrl.$inject = ['$scope', '$location', '$http', '$rootScope', '$window', '$q', 'SalesGoalsApiService'];

    function TerritoriesCtrl($scope, $location, $http, $rootScope, $window, $q, SalesGoalsApiService) {

        var vm = this;
        vm.territories = [];
        vm.rowBeingEdited = -1;
        // reference -- https://mdbootstrap.com/plugins/jquery/color-picker/
        //const pickr1 = new Pickr({
        //    el: '#color-picker-1',
        //    default: "203030",
        //    components: {
        //        preview: true,
        //        opacity: true,
        //        hue: true,

        //        interaction: {
        //            hex: true,
        //            rgba: true,
        //            hsla: true,
        //            hsva: true,
        //            cmyk: true,
        //            input: true,
        //            clear: true,
        //            save: true
        //        }
        //    }
        //});

        //var modalConfirm = function(callback){
  
        //    $("#btn-confirm").on("click", function(){
        //        $("#mi-modal").modal('show');
        //    });

        //    $("#modal-btn-si").on("click", function(){
        //        callback(true);
        //        $("#mi-modal").modal('hide');
        //    });
  
        //    $("#modal-btn-no").on("click", function(){
        //        callback(false);
        //        $("#mi-modal").modal('hide');
        //    });
        //};

        //modalConfirm(function(confirm){
        //    if(confirm){
        //        //Acciones si el usuario confirma
        //        $("#result").html("CONFIRMADO");
        //    }else{
        //        //Acciones si el usuario no confirma
        //        $("#result").html("NO CONFIRMADO");
        //    }
        //});

        vm.UpdateTerritory = function (name, goal, color, seqnum) {
            return SalesGoalsApiService.UpdateTerritory(name, goal, color, seqnum);
        }

        vm.isEditing = false;

        vm.EnableEdit = function (rowIndex) {
            if (vm.rowBeingEdited == -1)
                vm.rowBeingEdited = rowIndex;
            else
                return;

            var row = $('.territory-table-row')[rowIndex]; // GET THE row

            //get the rows data cells
            //var dataCell0 = row.children[0];
            //var dataCell1 = row.children[1];
            //var dataCell2 = row.children[2];

            var children = [];

            //substract 1 from row.length so you do push the data cell with the trash and edit icons
            for (var i = 0; i < row.children.length - 1; i++) {
                children.push(row.children[i]);
            }

            //substract 1 from children.length to avoid hitting the color picker
            for (var i = 0; i < children.length - 1; i++) {
                children[i].setAttribute("contenteditable", "true");
                children[i].setAttribute("style", "background-color:#cfcfcf;");
            }

            //set the colorpicker datacell to the appropriate values
            children[children.length - 1].children[0].disabled =  false; //index 0 to target the button child element
            children[children.length - 1].setAttribute("style", "background-color:#cfcfcf;");


            children[0].focus();

            //var editableTableCells = $('.territory-table-data');

            //for (var i = 0; i < editableTableCells.length; i++) {
            //    editableTableCells[i].setAttribute("contenteditable", "true");
            //    editableTableCells[i].setAttribute("style", "background-color:grey;")
            //}
        }

        vm.SaveEdits = function (rowIndex) {
            vm.rowBeingEdited = -1;
            var row = $('.territory-table-row')[rowIndex]; // GET THE row
            var children = [];

            //substract 1 from row.length so you do push the data cell with the trash and edit icons
            for (var i = 0; i < row.children.length - 1; i++) {
                children.push(row.children[i]);
            }

            for (var i = 0; i < children.length -1 ; i++) {
                children[i].setAttribute("contenteditable", "false");
                children[i].setAttribute("style", "background-color:white;");
            }



            //set the colorpicker datacell to the appropriate values
            children[children.length - 1].children[0].disabled = true; //index 0 to target the button child element
            children[children.length - 1].setAttribute("style", "background-color:white;");

            
            
            
            vm.UpdateTerritory(children[0].textContent, children[1].textContent, children[children.length - 1].children[0].value, vm.territories[rowIndex].seqnum).then(function () {
                vm.territories[rowIndex].name = children[0].textContent; //name
                vm.territories[rowIndex].goal = children[1].textContent;
                vm.territories[rowIndex].color = children[children.length - 1].children[0].value;
            },
            function () {
                   //if update territory fails
            });

            //var editableTableCells = $('.territory-table-data');

            //for (var i = 0; i < editableTableCells.length; i++) {
            //    editableTableCells[i].setAttribute("contenteditable", "false");
            //    editableTableCells[i].setAttribute("style", "background-color:white;")
            //}
        }

        vm.RemoveTerritory = function (seqnum) {
            //remove the row from the table
            var territoriesLength = vm.territories.length;
            for (var i = 0; i < territoriesLength; i++) {
                if (vm.territories[i].seqnum == seqnum) {
                    vm.territories.splice(i, 1);
                    break;
                }
            }

            SalesGoalsApiService.RemoveTerritory(seqnum).then(function () {
                
            },
            function () {

            });
        };

        vm.AddTerritory = function () {
            var name = $('#Name')[0].value;
            var goal = $('#Goal')[0].value;
            var color = $('#Colorpicker')[0].value;

            var newTerritory = {
                seqnum: 0,
                name: name,
                color: color,
                salesperson: '',
                goal: goal,
                salesStates: []
            }

            SalesGoalsApiService.AddTerritory(name, goal, color).then(function () {
                vm.territories.push(newTerritory);
            },
            function () {
                //what to do when adding new territory fails on the backend??
            });
            
        }

        vm.ChangePath = function (path) {
            $location.path(path);
        }

      SalesGoalsApiService.GetTerritories().then(function (response) {
        vm.territories = response.data;
      });

    }

})();