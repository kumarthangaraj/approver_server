'use strict';
var bodyParser = require('body-parser');
var RegisterHandler = require("../scripts/RegisterHandler.js");
var LoginHandler = require("../scripts/LoginHandler.js");
var NotificationHandler = require("../scripts/NotificationHandler.js");
var ApprovalHandler = require("../scripts/ApprovalHandler.js");

module.exports = function(app) {
    //var router = server.loopback.Router();
    app.post('/RegisterDevice', function (req,res,next) {
        console.log("in Routes.js");
        RegisterHandler.RegisterDevice(req,res,next)});

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
    app.use(bodyParser.json()); 
}