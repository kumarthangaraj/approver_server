var app = angular.module('approvApp', ["ngRoute","ui.bootstrap"]);
var scope;
var devices;
var trans;
var hideDisable = true;

app.controller('approvCtrl', ['$scope','$http','$q','$modal',function($scope, $http, $q, $modal) {
	scope = $scope;
	$scope.loggedInUser = true;
	$scope.hideDisable = true;
	$scope.listDevices = function(){
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:"http://localhost:3000/api/devicedtls",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.devices = res.data;
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.loginUser = function(){
		var deferred = $q.defer();
		var loginObj = {}
		loginObj.username = $scope.username;
		loginObj.password = $scope.password;
		$http({
			method: "POST",
			url:"http://localhost:3000/api/BaseUsers/login",
			data: loginObj,
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			deferred.resolve(res.data);
			$scope.loggedInUser = true;
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	}
	$scope.listTrans = function(){
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:"http://localhost:3000/api/TranDtls",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.trans = res.data;
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.listDevices();
	$scope.listTrans();
}]);

app.config(function($routeProvider) {
  $routeProvider
  .when("/add-user", {
    templateUrl : "pages/addUser.htm",
	//templateUrl : "pages/qrCode.htm",
	controller: "approvCtrl",
    controllerAs: "approvApp"
	})
	.when("/add-tran", {
    templateUrl : "pages/tranDtls.htm",
	//templateUrl : "pages/qrCode.htm",
	controller: "approvCtrl",
    controllerAs: "approvApp"
  })
  .when("/list-devices", {
		templateUrl : "pages/listDevices.htm",
		controller: "deviceCtrl",
    controllerAs: "approvApp",
	resolve : {
		init: function(){
			return function($http,$q){
				console.log("inside init");
			}
		}
	}
  })
  .when("/list-tran", {
		templateUrl : "pages/listTrans.htm",
		controller: "approvCtrl",
    controllerAs: "approvApp",
	resolve : {
		init: function(){
			return function($http,$q){
				
			}
		}
	}
  })
  .when("/green", {
    templateUrl : "green.htm"
  })
  .when("/blue", {
    templateUrl : "blue.htm"
  });
});

app.controller('deviceCtrl', ['$scope','$http','$q','$modal',function($scope, $http, $q, $modal) {
	scope = $scope;
	$scope.loggedInUser = true;
	$scope.hideDisable = true;
	$scope.listDevices = function(){
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:"http://localhost:3000/api/devicedtls",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.devices = res.data;
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.enableDisableDevices = function(deviceId,enabled){
		var dataObj = {};
		dataObj.deviceId = deviceId;
		dataObj.enabled = enabled;
		var deferred = $q.defer();
		var devices = $scope.devices;
		$http({
			method: "PUT",
			data:dataObj,
			url:"http://localhost:3000/api/devicedtls",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			console.log(devices);
			for(device in devices){
				if(devices[device].deviceId === res.data.deviceId){
					devices[device].enabled = res.data.enabled;
					break;
				}
			}
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	}
}]);