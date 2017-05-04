String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};
var input = document.getElementById("file");
input.addEventListener( 'change', function( e ){
  document.getElementById("file-label").innerHTML = input.files[0].name;
  document.getElementById("file-button").style.display = 'inline-block';
});


$('#data').stickyTableHeaders();

var app = angular.module('app', ['ngSanitize']);

app.filter('percent', function() {
  return function(number) {
    if(number){
      var t = number*100;
      return parseFloat(t.toFixed(2)) + "%";
    }
    return number;
  };
});

app.controller('controller',['$scope','$filter',function ($scope,$filter) {
  $scope.floatTheadOptions = {
    scrollingTop: 10,
    useAbsolutePositioning: false
  };
  $scope.showResult = false;
  $scope.fileSelected = "Välj fil";
  $scope.useColors = true;
  $scope.showMax = 100;
  $scope.currFilter = new Array();
  $scope.showMoreResults = function(){
    $scope.showMax += 100;
    //show not more than possible
    if($scope.showMax > $scope.bodyDataFiltered.length){
      $scope.showMax = $scope.bodyDataFiltered.length;
    }
  }

  $scope.addFilter = function(){
    $scope.currFilter.push($scope.selectedFilter);
    //call filter function for refiltering
    $scope.filter();
  }

  $scope.removeFilter = function(index){
    var fi = -1;
    for(i=0;i<$scope.currFilter.length;i++){
      if($scope.currFilter[i].index == index){
        fi = i;
        break;
      }
    }
    if(fi != -1){
      $scope.currFilter.splice(fi,1);
    }
    //call filter function for refiltering
    $scope.filter();
  }

  $scope.filter = function(){
    $scope.bodyDataFiltered = new Array();
    var useFilter = new Array();
    for(i=0;i<$scope.currFilter.length;i++){
      if($scope.currFilter[i].min || $scope.currFilter[i].max || $scope.currFilter[i].equal){
        //user that filter!
        useFilter.push($scope.currFilter[i]);
      }
    }
    var include;
    var val;
    for(i=0;i<$scope.bodyData.length;i++){
      include = true;
      for(j=0;j<useFilter.length;j++){
        val = $scope.bodyData[i][useFilter[j].index];

        if(useFilter[j].min){
          if(isNaN(val) || !(parseFloat(val) >= parseFloat(useFilter[j].min))){
            include = false;
          }
        }
        if(useFilter[j].max){
          if(isNaN(val) || !(parseFloat(val) <= parseFloat(useFilter[j].max))){
            include = false;
          }
        }
        //filter string include
        if(useFilter[j].equal && useFilter[j].equal.length > 0){
          var f = useFilter[j].equal;
          f = f.trim();
          f = f.toLowerCase();
          if(val && val.toLowerCase().indexOf(f) == -1){
            include = false;
          }
        }


      }

      if(include){
        $scope.bodyDataFiltered.push($scope.bodyData[i]);
      }
    }
    //reset showmax
    $scope.showMax = 100;
  }
  $scope.getClass = function(cell){
    if($scope.useColors){
      if(!(cell.match(/[a-z]/i)) && !isNaN(parseFloat(cell))){
        if(cell < 0){
          return "red";
        }else{
          return "green";
        }
      }
    }
  }

  $scope.formatCell = function(cell,data){
//    console.log(data);
    var percentCols = ["Kursutveck","tillväxtÅr","Direktav",
    'Utdelningsandel','Soliditet','ROC'];
    for(i=0;i<percentCols.length;i++){
      if(cell.name.indexOf(percentCols[i]) != -1){
        return $filter('percent')(data);
      }
    }
    if(cell.name.indexOf("Bolagsnamn") != -1){
      var url = data.replaceAll(" ","-");
      url = url.replaceAll("Pref","preferensaktie");
      return '<a href="https://borsdata.se/' + url + '/nyckeltal" target="_blank">' + data + '</a>';
    }
    return data;
  }

  $scope.buildFilter = function(){
    //set up filtered data-semver
    $scope.filterData = new Array();
    $scope.currFilter = new Array();
    for(i=0;i<$scope.headerData.length;i++){
      $scope.filterData.push({name:$scope.headerData[i]["name"],index:i,type:$scope.headerData[i]["type"]});
    }
    $scope.bodyDataFiltered = $scope.bodyData;
  }

  $scope.determineCellType = function(cell,index){
    if(cell){
      if((cell.match(/[a-z]/i)) || isNaN(parseFloat(cell))){
        $scope.headerData[index]["type"] = "s";
      }else{
        $scope.headerData[index]["type"] = "f";
      }
    }
  }


  $scope.getFile = function () {
    var input = document.getElementById('file');
    var reader = new FileReader();
    if(input.files[0]){


    var file = input.files[0];
    var vm = $scope;
    reader.onload = function(e) {
      var result = e.target.result;

      vm.$apply(function(){
        $scope.showResult = true;
        $scope.headerData = new Array();
        $scope.bodyData = new Array();
        var lines = result.split(/\r\n|\n/);
        var header = lines[0];
        var headerTwo = lines[1];
        var colNames = header.split(";");
        var colNamesTwo = headerTwo.split(";");
        var tmp;
        for(i=0;i<colNames.length;i++){
          tmp = colNames[i].replaceAll('"','') + colNamesTwo[i].replaceAll('"','');
          tmp = tmp.replace("Info","");
          tmp = tmp.trim();
          $scope.headerData.push({name:tmp,type:null});
        }
       var cell;
        for(i=2;i<lines.length;i++){
          cell = lines[i].split(";");
          row = [];
          for(k=0;k<cell.length;k++){
            var val = cell[k].replaceAll('"','');
            row[k] = val;
            $scope.determineCellType(val,k);
          }
          $scope.bodyData.push(row);
        }
        $scope.buildFilter();
      });

    };

    reader.readAsText(file,'ISO-8859-1');
  }
  };

}]);
