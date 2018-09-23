'use strict';

var loopback = require('loopback');
var devices = loopback.findModel("devicedtls");

module.exports = function(BankUser) {
    var isUserEnabled = function(req,next) {
        BankUser.find({username:req.body.username},req.callContext,function(err,data){
            if(err){
                console.log(error);
                next(formInvalidUserErrorObj());
                next(errorObj);
            }else {
                devices.find({_id:data[0].deviceId},req.callContext,function(err,data){
                    if(err){
                        console.log(error);
                        next(formInvalidUserErrorObj());
                    }
                    if(data[0].enabled === 'Y')
                        next();
                    else 
                        next(formDisabledErrorObj());
                });   
            }
        });
    };
    var formDisabledErrorObj = function(){
        var error = new Error();
        error.status = 401;
        error.message = 'App has been disabled';
        error.code = 'APP_DISABLED'; 
        return error;
    };
    var formInvalidUserErrorObj = function(){
        var error = new Error();
        error.status = 401;
        error.message = 'App is not registered';
        error.code = 'APP_NOTREGISTERED'; 
        return error;
    };
    BankUser.beforeRemote('login',function(context,modelInstance,next){
        console.log("logined called");
        var error = null;
        isUserEnabled(context.req,next);
    });
};
