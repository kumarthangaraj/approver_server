'use strict';
var NotificationHandler = require("../../server/scripts/NotificationHandler.js");
var loopback = require('loopback');
var clientConfig = loopback.findModel("ClientConfig");
var base64 = require('base-64');
var utf8 = require('utf8');

module.exports = function(TranDtls) {
    TranDtls.afterRemote('create',function(context,modelInstance,next){
        NotificationHandler.sendNotification(context,modelInstance.__data);
        next();
    });
    TranDtls.beforeRemote('create',function(context,modelInstance,next){
        validateClient(context,next);
    });

    TranDtls.afterRemote('find',function(context,modelInstance,next){
        next();
    });

    function validateClient(context,next){
        console.log("Hi inside cotext");
        var authkey = utf8.decode(base64.decode(context.req.headers.authorization.split(" ",2)[1])).split(":",2);
        clientConfig.find({where:{_id:authkey[0]}},context,function(error,data){
            if(error !== null){
                console.log("error");
            }else {
                if(data[0].client_secret === authkey[1]){
                    next();
                }else {
                    errorResponse(context.res,"Invalid Client");
                }
            }
        });
    }

    function errorResponse(res, message){
        var responseObject = {};
        responseObject.statusCode = "404";
        responseObject.code = "INVALID_CLIENT";
        responseObject.message = message;
        var resWrapper = {};
        resWrapper.error = responseObject;
        res.writeHead(300, { "Content-Type": "application/json" });
        res.end(JSON.stringify(resWrapper));
        return;
    }
    /*TranDtls.afterRemote('**',function(context,modelInstance,next){
        var requestUrl = "http://192.168.43.81:3001/api/TranDtls"   
        request({url:requestUrl,method:"POST",json:modelInstance.__data},function(err,response,body){
            if(err){
            next();
        });*
                console.log("error occurred "+err);
            }
    });*/
};