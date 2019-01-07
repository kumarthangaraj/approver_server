/*var httpMode = "http";
var serverIp = "localhost";
var serverPort = "3001";
var requestUrls = {
	"validateQRCode" : "validateQRCode",
	"approvalUpdate" : "api/TranDtls/update"
}*/

var configData = require('../config.json');
var requestConfigFile = "requestConfig.json";
var requestHandlerFile = "requestHandler.js";
var http = require('http');
var request = require('request');
var unirest = require('unirest');
var xml2js = require('xml2js');
var USER_DETAIL_TIMEOUT = 90000;
var requestHandlers = {};

/*var getRequestUrl = function(eventName){
	var url = httpMode+"://"+serverIp+":"+serverPort+"/"+requestUrls[eventName];
	return url;
}*/

var getRequestUrl = function(eventName){
	var handler = getRequestHandler(getAppName());
	var httpHandler = getHttpRequestHandler(eventName);
	eventNameArr = eventName.split(".");
	var url = handler.httpMode+"://"+handler.serverDomain+"/"+httpHandler.url;
	console.log("url is "+url);
	return url;
};

var getIpType = function(eventName){
	var httpHandler = getHttpRequestHandler(eventName);
	return httpHandler.iptype;
};

var getHttpRequestHandler = function(eventName){
	var handler = getRequestHandler(getAppName());
	eventNameArr = eventName.split(".");
	return handler[eventNameArr[0]][eventNameArr[1]];
};

var getAppName = function(){
	var appName = configData["defaultApp"];
	return appName;
};

var getRequestHandler = function(appName){
	if(requestHandlers[appName] === null || requestHandlers[appName] === undefined){
		requestHandlers[appName] = require("../"+getAppName()+"_"+requestConfigFile);
		requestHandlers[appName]["handle"] = require("./"+getAppName()+"_"+requestHandlerFile);
	}
	return requestHandlers[appName];
};

var executePrepareRequestObj = function(eventName,req,res,cb,xmlRequestCb){
	var handler = getHttpRequestHandler(eventName);
	var requestHandler = getRequestHandler(getAppName());
	return requestHandler.handle.prepareReqObj(handler.prepareRequest,req,res,cb,xmlRequestCb,eventName);
};

var executeParseResponseObj = function(eventName,res,resBody,resObj,cb){
	var handler = getHttpRequestHandler(eventName);
	var requestHandler = getRequestHandler(getAppName());
	return requestHandler.handle.parseResObj(handler.parseResponse,res,resBody,resObj,cb);
};

var executeJSONRequest = function(eventName,req,res,cb){
	var reqObj = executePrepareRequestObj(eventName,req);
	request({url:getRequestUrl(eventName),method:getRequestMethod(eventName),json:reqObj},function(err,response,body){
		var resObj = null;
		if(err === null)
			resObj = executeParseResponseObj(eventName,response,body,resObj,cb);
		cb(err,res,resObj);
	});
};

var executeUniRequestCallForXMLReq = function(eventName,reqObj,res,cb){
	unirest.post(getRequestUrl(eventName)).headers({ 'IPTYPE': getIpType(eventName), 'User-Agent': 'trying for node.js',
	'Content-Type': 'application/xml', 'Connection': 'Keep-ALive' }).timeout(USER_DETAIL_TIMEOUT).send(reqObj).end(function(xmlResponse,err){
		var resObj = null;
		if(err !== null || err !== undefined)
			resObj = executeParseResponseObj(eventName,res,xmlResponse,resObj,cb);
		else
			cb(err,res,resObj)
	});
}

var executeXMLRequest = function(eventName,req,res,cb){
	executePrepareRequestObj(eventName,req,res,cb,executeUniRequestCallForXMLReq);
};



var executeRequest = function(eventName,req,res,cb){
	if(getIpType(eventName) === "JSON"){
		executeJSONRequest(eventName,req,res,cb);
	}else if(getIpType(eventName) === "XML"){
		executeXMLRequest(eventName,req,res,cb);
	}else {
		var err={"errMsg" : "Invalid request type"};
		cb(err);
	}
}

var getRequestMethod = function(eventName){
	var handler = getHttpRequestHandler(eventName);
	return handler.method;
}

module.exports = {
	executeRequest : executeRequest,
	getHttpRequestHandler : getHttpRequestHandler
}