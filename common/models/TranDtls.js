'use strict';
var NotificationHandler = require("../../server/scripts/NotificationHandler.js");

module.exports = function(TranDtls) {
    TranDtls.afterRemote('create',function(context,modelInstance,next){
        NotificationHandler.sendNotification(context,modelInstance.__data);
        next();
    });
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