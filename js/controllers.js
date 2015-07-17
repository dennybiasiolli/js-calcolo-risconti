'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('myCtrl', ['$scope', '$window', function($scope, $window) {
        $scope.calcolaRisconti = function(){
            $scope.arrValori = [];
            $scope.ImportoTotCalcolato = 0;
            $scope.diffAnni = 0;
            $scope.diffGiorni = 0;
            if(!$scope.Importo) $scope.Importo = 0;

            if($scope.DataInizio && $scope.DataFine){
                var annoInizio = $scope.DataInizio.getFullYear();
                var annoFine = $scope.DataFine.getFullYear();
                $scope.diffAnni = annoFine - annoInizio + 1;
                var timeDiff = ($scope.DataFine.getTime() - $scope.DataInizio.getTime());
                $scope.diffGiorni = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                if($scope.diffGiorni > 0){
                    var i = 0;
                    for(var annoAttuale = annoInizio; annoAttuale <= annoFine; annoAttuale++){
                        var myDataInizio = new Date(annoAttuale, 0, 1, 0, 0, 0);
                        //se sono nel primo anno del ciclo, considero la data di inizio ufficiale
                        if(annoAttuale == annoInizio)
                            myDataInizio = $scope.DataInizio;

                        var myDataFine = new Date(annoAttuale, 11, 31, 0, 0, 0);
                        //se sono nell'ultimo anno del ciclo, considero la data di fine ufficiale
                        if(annoAttuale == annoFine)
                            myDataFine = $scope.DataFine;

                        var addGiornoCalc = (annoAttuale == annoInizio ? 0 : 1);
                        var myGiorni = Math.ceil((myDataFine.getTime() - myDataInizio.getTime()) / (1000 * 3600 * 24)) + addGiornoCalc;
                        var myImporto = ($scope.Importo * myGiorni) / $scope.diffGiorni;
                        $scope.ImportoTotCalcolato += myImporto;

                        $scope.arrValori[$scope.arrValori.length] = {
                            Anno: annoAttuale,
                            DataInizio: myDataInizio,
                            DataFine: myDataFine,
                            Giorni: myGiorni,
                            Importo: myImporto
                        };
                        i++;
                    }
                    $scope.ImportoDaSuddividere = Math.abs($scope.Importo - $scope.ImportoTotCalcolato);
                }
            }
        };

        var dataAttuale = new Date();
        $scope.DataInizio = new Date(dataAttuale.getFullYear(), dataAttuale.getMonth(), dataAttuale.getDate());
        $scope.DataFine = new Date(dataAttuale.getFullYear() + 1, dataAttuale.getMonth(), dataAttuale.getDate());
        //$scope.DataInizio = new Date(2014, 6, 1);
        //$scope.DataFine = new Date(2015, 5, 30);
        $scope.Importo = 123;
        $scope.calcolaRisconti();
    }]);
