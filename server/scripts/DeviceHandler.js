var loopback = require('loopback');
var deviceInfo = loopback.findModel("DeviceInfo");
var deviceConfig = loopback.findModel("DeviceConfig");
var rs = require("randomstring");
const NodeRSA = require('node-rsa');
var crypto = require("crypto");
var urlHandler = require('./RequestUrlHandler.js');

var validateDevice = function(req,res,next){
    console.log("inside validateDevice"); 
    validateDeviceDtls(req,res,next);
};

var validateDeviceDtls = function(req,res,next) {
    var errorMessage ={};
    console.log("validateDeviceDtls");
    deviceConfig.find({},req.callContext,function(err,data){
        if(err)
            return errorResponse(res,"error in inserting device info");
        else{
            if(isValidConfiguration(req.body["device_info"],data[0].__data, errorMessage))
                updateRandomString(req,res,next)
            else {
                return errorResponse(res,errorMessage.message);
            }
        }
    });
};

var isValidConfiguration = function(deviceData, configData, errorMessage){
    /*if(deviceData.app_checksum != configData.app_checksum){
        errorMessage.message = "Tampered app";
        return false;
    }*/
    if(isRestrictedConfig(deviceData.os_version,configData.restricted_sdk_versions)){
        errorMessage.message = "Restricted os version";
        return false;
    }
    if(isRestrictedConfig(deviceData.make,configData.restricted_makes)){
        errorMessage.message = "Restricted make";
        return false;
    }
    if(isRestrictedConfig(deviceData.app_version,configData.restricted_app_versions)){
        errorMessage.message = "Restricted app version";
        return false;
    }
    return true;
}

var isRestrictedConfig = function(deviceInfo, configInfo){
    var locConfigInfo = ","+configInfo+",";
    if(locConfigInfo.indexOf(","+deviceInfo+",") != -1)
        return true;
    return false;
}

var updateRandomString = function(req,res,next){
	var current_time = new Date(); 
    deviceInfoData = req.body["device_info"];
	deviceInfoData["unique_id"] = rs.generate(16);
	deviceInfoData["identifier"] = rs.generate(16);
	deviceInfoData["request_time"] = current_time;
	deviceInfo.upsert(deviceInfoData,req.callContext,function(err,data){
		if(err)
			return errorResponse(res,"error in inserting device info");
		else{
			var publicKey = req.body["public_key"];
            encryptedData = encryptData(deviceInfoData.identifier, publicKey);
            var data = {"symkey":encryptedData,
                        "symkeyOrg":deviceInfoData["identifier"]};
			return successResponse(res,"Validation Success",data);
		}
	});
};

var encryptData = function(keyString, publicKey){
    var components = getComponents(publicKey);
    //var components = {n:Buffer.from('9e81cd4fe24c958c50133385b38dcc38de0fbba153b6c911ae1830f26b1d714a0334114283df2b78501ef54c5d9001f765f3b307b278c56ececdfbb63db7f40b480567ccd99f9c5d2a143a9a12c1aa9314b3c225d2f0fedbc7348e6f40f6ee05be34a147dde623007feb8cc8f98a9ebc4fc09d8dff6122cb34a9a42cdd6c7507695662332ee1e6c90ac95054a1e54dba85979b377f117f0aa5ef4e33f96efe67b08301cdb78343a238150db941757c67ad4e6c25197f0a0c718fb52924ff03003d0c0fdf33683c3cbb7a35ea24fbe00deb1136c7fa68a4b86570c5d02b3d29b0dce258623721d6f4ab3d2a10d8a44d6d7c067f28098401f61a9e63166181a26b','hex'),e:10001};
    const key = new NodeRSA();
    key.importKey(components,'components-public-der');
    var encryptedData = key.encrypt(keyString,"base64");
	console.log("encryptedData is "+encryptedData);
	return encryptedData;
};

function getComponents(publicKey){
    var keyArray = publicKey.split("=");
    var modulus = (keyArray[1].split(","))[0];
    var exponent = (keyArray[2].split("}"))[0];
    var components = {n:Buffer.from(modulus,"base64"),
                      e:10001};
    return components;
}

function errorResponse(res, message){
    var responseObject = {};
    responseObject.statusCode = "500";
    responseObject.code = "VALIDATION_FAILED";
    responseObject.message = message;
    var resWrapper = {};
    resWrapper.error = responseObject;
    res.writeHead(300, { "Content-Type": "application/json" });
    res.end(JSON.stringify(resWrapper));
    return;
}

function successResponse(res,message, data){
    var responseObject = {};
    responseObject.status = "SUCCESS";
    responseObject.message = message;
    responseObject.data = data;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(responseObject));
    return;
}

module.exports = {
    validateDevice : validateDevice
}