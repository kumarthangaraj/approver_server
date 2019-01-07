var fcmEndPoint = "https://fcm.googleapis.com/fcm/send";
var secureKey = "key=AAAAA66XMDk:APA91bGtTR02P4pmbJ9CgDfOWh7pfe4VkRUE_saSZRrmLpubm6UxrRosvvYPxn_qnTJrc1kS_o9-Y9_4SEPrB0THaM5TdzIYMPZSwwygoiUH3ZLoNQbo50B-6jY1-o25x3FUA5ncu886"
var loopback = require('loopback');
var devices = loopback.findModel("devicedtls");
var request = require("request");

var updateFCMToken = function(req,res,next){
    console.log("inside RegisterDevice");
    updateDevice(req,res,next);
}

function updateDevice(req,res,next){
    devices.find({where: {_id: req.body.deviceId}},req.callContext,function(err,data){
        if(err){
            console.log(error);
            return errorResponse(res,"Unable to fetch data");
        }
        var newData = data[0].__data;
        newData.clientId = req.body.clientId;
        newData.fcmtoken = req.body.token;
        devices.upsert(newData,req.callContext,function(err,data){
            if(err)
                return errorResponse(res,"error in inserting record");
            else
                return successResponse(res,"FCM token updated successfully");
            });
        });
}

function errorResponse(res, message){
    var responseObject = {};
    responseObject.statusCode = "300";
    responseObject.code = "REGISTER_FAILED";
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
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(responseObject));
    return;
}
 
var sendNotificationList = function(context,trandata){
    var count = 0;
    sendNotificationRecursive(context,trandata,count,sendNotificationRecursive);
}

var sendNotificationRecursive = function(context,trandata,count, cb){
    if(count == trandata.length)
        return;
    sendNotification(context,trandata[count++].__data,function(){
        cb(context,trandata,count,cb);
    });
}

var sendNotification = function(context,trandata,cb){
    devices.find({"where":{"clientId":trandata.approver}},context,function(err,data){
        if(err)
            console.log("No device registered");
        if(data.length == 0) {
            if(cb !== null)    
                cb(); 
        }
        else {
            var input = formNotificationInput(trandata,data[0].__data);
            /*var input = { 
                "notification":{
                    "title": "Approver App",
                    "text": "You may have new requests for approval"
                },
                "to":"dmjWH5K8hW0:APA91bFdxiIMG36N4qBXBBBIfgMZmeWtUfvjnOgJNgQ2YBSvOZ3RBueMKlt84z8OsDiMHNyVB4YrnjehGo9rl2cKwZOigfWRXX17wvHiQEqZH-TCXmhUELztKhDbNupl8k_JRCCk_z5P4BQzkhFM9C5VeQl4-Ub1Vw"
            };*/
            request({url:fcmEndPoint,method:"POST",json:input,
                headers: {
                    Authorization: secureKey,
                    'Content-Type': 'application/json'
                }
            },function(err,response,body){
                if(err){
                    console.log("Error in send Notification "+err);
                }
                if(cb !== null)
                    cb();
            });
        }
    })
}

function formNotificationInput(trandata,data){
    var input = { 
        "data":{
            "ttl": 52000,
            "title": "Approval Request",
            "content": trandata.excp_desc,
            "requestId":trandata.id.toString(),
        },
        "to":data.fcmtoken
    };
    return input;
}

module.exports = {
    sendNotification : sendNotification,
    updateFCMToken : updateFCMToken,
    sendNotificationList : sendNotificationList
}