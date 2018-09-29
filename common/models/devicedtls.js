'use strict';

var loopback = require('loopback');
var BankUser = loopback.findModel("BankUser");

module.exports = function(devicedtls) {
    var deleteLinkedUser = function(req,next){
        console.log("inside deleteLinkedUser");
        var deviceId = req.body.deviceId;
        devicedtls.find({_id:deviceId},req.callContext,function(err,data){
            if(err){
                console.log(error);
                next(formInvalidDeviceErrorObj());
            }
            else {
                //if(data.length == 0)
                  //  return next(formInvalidDeviceErrorObj());
                BankUser.deleteAll({deviceId:deviceId},req.callContext,function(err,data){
                    if(err){
                        console.log(error);
                        next(formInvalidUserErrorObj());
                        next(errorObj);
                    }else {
                        next();
                    }
                });
            }
        });   
    };
    var formInvalidDeviceErrorObj = function(){
        var error = new Error();
        error.status = 401;
        error.message = 'Invalid device';
        error.code = 'APP_INVALID'; 
        return error;
    };
    var formInvalidUserErrorObj = function(){
        var error = new Error();
        error.status = 401;
        error.message = 'Invalid User mapped';
        error.code = 'APP_INVALIDUSER'; 
        return error;
    };
    devicedtls.beforeRemote('delete',function(context,modelInstance,next){
        deleteLinkedUser(context.req,next);
    });
};
