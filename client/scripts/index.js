var app = angular.module('approvApp', ["ngRoute","ui.bootstrap"]);
var scope;
var devices;
var trans;
var hideDisable = true;
var httpMode = "http://";
var serverDomain = "localhost:3000"

app.controller('approvCtrl', ['$rootScope','$scope','$http','$q','$modal',function($rootScope,$scope, $http, $q, $modal) {
	scope = $scope;
	$scope.loggedInUser = true;
	$scope.hideDisable = true;
	$scope.accessToken = "";
	$scope.listDevices = function(){
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:httpMode+serverDomain+"/api/devicedtls",
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
			url:httpMode+serverDomain+"/api/BaseUsers/login",
			data: loginObj,
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$rootScope.accessToken = res.data.id;
			deferred.resolve(res.data);
			$scope.loggedInUser = true;
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.testFI = function(){
			var deferred = $q.defer();
			var qrcodeObj = {}
			qrcodeObj.code = "_01012019194201217549";
			$http({
				method: "POST",
				url:httpMode+serverDomain+"/TestFI",
				data: qrcodeObj,
				headers: {'Content-Type': 'application/json'}
			}).then(function (res) {
				console.log(res);
				$rootScope.accessToken = res.data.id;
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
			url:httpMode+serverDomain+"/api/TranDtls",
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
  }).when("/client-config", {
	templateUrl : "pages/clientConfig.htm",
	controller: "clientCtrl",
	controllerAs: "approvApp",
	resolve : {
		init: function(){
			console.log("inside init");
		}
	}
	}).when("/device-config", {
		templateUrl : "pages/deviceConfig.htm",
		controller: "deviceConfigCtrl",
		controllerAs: "approvApp",
		resolve : {
			init: function(){
				console.log("inside init");
			}
		}
	}).when("/android-config", {
		templateUrl : "pages/androidConfig.htm",
		controller: "androidCtrl",
		controllerAs: "approvApp",
		resolve : {
			init: function(){
				console.log("inside init");
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

app.controller('deviceConfigCtrl', ['$rootScope','$scope','$http','$q','$modal',function($rootScope,$scope, $http, $q, $modal) {
	scope = $scope;
	$scope.loggedInUser = true;
	$scope.hideDisable = true;
	$scope.configObj = {};
	$scope.clients = {};
	$scope.addNewClient = false;
	$scope.getClients = function(){
		console.log("inside init");
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:httpMode+serverDomain+"/api/ClientConfigs",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.clients = res.data;
			deferred.resolve(res.data);
			$scope.configObj = {};
			$scope.addNewClient = false;
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.addClient = function(){
		$scope.addNewClient = true;
	}

	$scope.addConfig = function(){
		var deferred = $q.defer();
		$http({
			method: "POST",
			data:$scope.configObj,
			url:httpMode+serverDomain+"/api/ClientConfigs",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			deferred.resolve(res.data);
			$scope.getClients();
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};

	$scope.deleteClient = function(appName){
		var deferred = $q.defer();
		$http({
			method: "DELETE",
			url:httpMode+serverDomain+"/api/ClientConfigs/"+appName+"?access_token="+$rootScope.accessToken,
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			deferred.resolve(res.data);
			$scope.getClients();
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.getClients();
}]);

app.controller('clientCtrl', ['$rootScope','$scope','$http','$q','$modal',function($rootScope,$scope, $http, $q, $modal) {
	scope = $scope;
	$scope.loggedInUser = true;
	$scope.hideDisable = true;
	$scope.configObj = {};
	$scope.clients = {};
	$scope.addNewClient = false;
	$scope.getClients = function(){
		console.log("inside init");
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:httpMode+serverDomain+"/api/ClientConfigs",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.clients = res.data;
			deferred.resolve(res.data);
			$scope.configObj = {};
			$scope.addNewClient = false;
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.addClient = function(){
		$scope.addNewClient = true;
	}

	$scope.addConfig = function(){
		var deferred = $q.defer();
		$http({
			method: "POST",
			data:$scope.configObj,
			url:httpMode+serverDomain+"/api/ClientConfigs",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			deferred.resolve(res.data);
			$scope.getClients();
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};

	$scope.deleteClient = function(appName){
		var deferred = $q.defer();
		$http({
			method: "DELETE",
			url:httpMode+serverDomain+"/api/ClientConfigs/"+appName+"?access_token="+$rootScope.accessToken,
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			deferred.resolve(res.data);
			$scope.getClients();
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.getClients();
}]);

app.controller('deviceCtrl', ['$scope','$http','$q','$modal',function($scope, $http, $q, $modal) {
	scope = $scope;
	$scope.loggedInUser = true;
	$scope.hideDisable = true;
	$scope.listDevices = function(){
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:httpMode+serverDomain+"/api/devicedtls",
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
			url:httpMode+serverDomain+"/api/devicedtls",
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
	$scope.deregisterDevices = function(deviceId){
		var dataObj = {};
		dataObj.deviceId = deviceId;
		var deferred = $q.defer();
		var devices = $scope.devices;
		var requestUrl = httpMode+serverDomain+"/api/devicedtls/"+deviceId;
		$http({
			method: "DELETE",
			data:dataObj,
			url:requestUrl,
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			console.log(devices);
			for(device in devices){
				if(devices[device].deviceId === deviceId){
					$scope.devices = devices.splice(device,1);
				}
			}
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	}
}]);

app.controller('androidCtrl', ['$scope','$http','$q','$modal',function($scope, $http, $q, $modal) {
	scope = $scope;
	$scope.androidObj = {};
	$scope.listDeviceConfig = function(){
		var deferred = $q.defer();
		$http({
			method: "GET",
			url:httpMode+serverDomain+"/api/deviceConfig",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.deviceConfigs = res.data;
			for(config in res.data){
				if(config.device_os = "android")
					$scope.androidObj = res.data[config];
			}
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.updateAndroidConfig = function(){
		$scope.androidObj["device_os"] = "android"
		var deferred = $q.defer();
		$http({
			method: "PUT",
			data:$scope.androidObj,
			url:httpMode+serverDomain+"/api/deviceConfig",
			headers: {'Content-Type': 'application/json'}
		}).then(function (res) {
			console.log(res);
			$scope.hideAndroidConfig();
			$scope.listDeviceConfig();
			deferred.resolve(res.data);
		}, function(errData){
			console.log(errData);
			deferred.resolve(errData);
		});
	};
	$scope.showAndroidConfig = function() {
		$scope.androidConfigList = true;
		$scope.editAndroidConfig = true;
	};
	$scope.hideAndroidConfig = function() {
		$scope.androidConfigList = false;
		$scope.editAndroidConfig = false;
	};
	$scope.listDeviceConfig();
}]);