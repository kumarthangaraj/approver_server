'use strict';
var bodyParser = require('body-parser');
var RegisterHandler = require("../scripts/RegisterHandler.js");
var LoginHandler = require("../scripts/LoginHandler.js");
var NotificationHandler = require("../scripts/NotificationHandler.js");
var ApprovalHandler = require("../scripts/ApprovalHandler.js");
var DeviceHandler = require("../scripts/DeviceHandler.js");
var urlHandler = require("../scripts/RequestUrlHandler.js");
var requestDtlsHandler = require("../scripts/RequestDtlsHandler.js");

module.exports = function(app) {
    //var router = server.loopback.Router();
	app.post('/validateDevice', function (req,res,next) {
        console.log("in Routes.js");
        DeviceHandler.validateDevice(req,res,next)});
    app.post('/RegisterDevice', function (req,res,next) {
        console.log("in Routes.js");
		RegisterHandler.RegisterDevice(req,res,next)});
		
	app.post('/validateQRCode', function (req,res,next) {
			console.log("in Routes.js");
			RegisterHandler.validateQRCode(req,res,next)});

    app.post('/Login', function (req,res,next) {
        console.log("in Routes.js");
        LoginHandler.LoginDevice(req,res,next)});

    app.post('/UpdateFCMToken', function (req,res,next) {
        console.log("in Routes.js");
        NotificationHandler.updateFCMToken(req,res,next)});
    //server.use(router);
    app.post('/GetApprovalRequests', function (req,res,next) {
        console.log("in Routes.js");
        ApprovalHandler.getApprovalRequests(req,res,next)});
    app.post('/UpdateApprovalRequest', function (req,res,next) {
        console.log("in Routes.js");
		ApprovalHandler.updateApprovalRequest(req,res,next)});
	app.get('/UpdateApprovalRequestTest', function (req,res,next) {
			console.log("in Routes.js");
			ApprovalHandler.updateApprovalRequestTest(req,res,next)});
    app.post('/TestFI', function (req,res,next) {
		console.log("in Routes.js TestFI");
		if(req.body.code === undefined || req.body.code === "")
			return returnError(res,"Invalid code passed");
		    var registerEvent = "fi.test";
		    urlHandler.executeRequest(registerEvent,req,res,function(err,response,resObj){
		        if(err){
					console.log("error is "+err);
		            var responseObject = {};
					responseObject.statusCode = "300";
					responseObject.code = "REGISTER_FAILED";
					responseObject.message = message;
					var resWrapper = {};
					resWrapper.error = responseObject;
					res.writeHead(300, { "Content-Type": "application/json" });
					res.end(JSON.stringify(resWrapper));
					return;
		        }else {
		        	res.writeHead(200, { "Content-Type": "application/json" });
    				res.end();
				}
    		});
	});
	app.post('/RequestDtls', function (req,res,next) {
		requestDtlsHandler.storeRequests(req,res,next);
	});
	app.post('/validateRegister', function (req,res,next) {
		RegisterHandler.validateRegister(req,res,next);
	});
	app.get('/validateRegister', function (req,res,next) {
		RegisterHandler.validateRegister(req,res,next);
	});
	app.get('/RequestDtls', function (req,res,next) {
			/*console.log("in Routes.js RequestDtls get");
			var response = "<STATUS>SUCCESS</STATUS>"
			res.writeHead(200, { "Content-Type": "application/xml" });
			res.end(response);*/
			requestDtlsHandler.storeRequests(req,res,next);
	});
    app.use(bodyParser.json());
}