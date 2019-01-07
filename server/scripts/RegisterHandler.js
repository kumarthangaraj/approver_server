var loopback = require('loopback');
var devices = loopback.findModel("devicedtls");
var BankUser = loopback.findModel("BankUser");
var randomString = require('randomstring');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var urlHandler = require('./RequestUrlHandler.js');

var RegisterDevice = function(req,res,next){
    console.log("inside RegisterDevice");
    //var responseObject = {};
    validateRequest(req,res,next);
    /*if(!validateRequest(req,res)){
        responseObject.status = "FAILURE";
        responseObject.message = "Invalid Input";
        res.writeHead(300, { "Content-Type": "application/json" });
        res.end(JSON.stringify(responseObject));
        return;
    } */
    //processDeviceDtls(req,res,next);
}

function returnError(res, message){
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

function popResponseData(userData, userDtls){
    var data = {};
    data.client_id = userData.__data.clientId;
    data.otp_value = userDtls.otp_value;
    data.message = "Registered and Pending for OTP validation";
    data.status = "SUCCESS";
    return data;
}

function returnSuccess(res,message, data){
    var responseObject = {};
    responseObject.message = message;
    responseObject.data = data;
    /*var clientKey = randomString.generate();
    responseObject.status = "SUCCESS";
    responseObject.client_id = data.username;
    responseObject.clientKey = data.clientKey;
    responseObject.user_name = data.username;
    responseObject.otp_value = data.otpCode;*/
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(responseObject));
    return;
}

function processDeviceDtls(req,res,next,userDtls){
    if(userDtls === null || userDtls === undefined)
        return returnError(res,"Register failed");
    devices.find({where:{_id:req.body.config.deviceId}},req.callContext,function(err,data){
        if(err){
            console.log(error);
            return returnError(res,"Unable to fetch data");
        }
        if(data.length > 0) {
            if(data[0].__data.clientId !== userDtls.username){
                return returnError(res,"Device already registered");
            }
        }
        req.body.config.enabled = "Y";
        req.body.clientId = userDtls.username;
        devices.upsert(req.body.config,req.callContext,function(err,data){
            if(err)
                return returnError(res,"error in inserting record");
            else{
                var bankUserObj = populateBankUserObj(data,userDtls);
                console.log("bankUserObj = "+bankUserObj);
                BankUser.upsert(bankUserObj,req.callContext,function(err,data){
                    if(err){
                        return returnError(res,"User creation failed with err "+err);
                    }else{
                        var resObj = popResponseData(data,userDtls);
                        return returnSuccess(res,"Device registered successfully",resObj);
                    }
                });
            }
        });
        //return returnSuccess(res,"Registered Successfully");
    });
}

function populateBankUserObj(data,userDtls){
    var BankUser = {};
    BankUser.deviceId = data.deviceId;
    BankUser.clientId = randomString.generate();
    BankUser.username = BankUser.clientId;
    BankUser.clientKey = randomString.generate();
    popDataFromCoreDB(BankUser,userDtls);
    return BankUser;
}

function popDataFromCoreDB(BankUser,userDtls){
    BankUser.bankUserId = userDtls.user_id;
    BankUser.password = BankUser.clientKey;
    BankUser.userShortname = userDtls.user_name;
    BankUser.bankId = userDtls.bank_id;
    BankUser.solId = userDtls.sol_id;
    BankUser.empId = userDtls.emp_id;
    BankUser.workClass = userDtls.work_class;
    BankUser.roleId = userDtls.role_id;
    BankUser.otpHandle = userDtls.otp_handle,
    BankUser.mobileNumber = userDtls.mobile_number;
    BankUser.email = getRandomEmail();
    BankUser.userDtls = userDtls;
}

function getRandomEmail(){
    var locString = randomString.generate({length: 6,
        charset: 'alphabetic'
      })
    return locString+"@gmail.com"
}

function validateRequest(req,res,next){
    if(req.body.code === undefined || req.body.code === "")
        return returnError(res,"Invalid code passed");
    var registerEvent = "users.register";
    urlHandler.executeRequest(registerEvent,req,res,function(err,response,resObj){
        if(err){
            return returnError(res,"Failure in QR Code Validation");
        }
        processDeviceDtls(req,res,next,resObj);
    });
    /*var httpRequestHandler = urlHandler.getHttpRequestHandler("users.register");
    var requestInput = httpRequestHandler.popRequestInput(req);
    //var input = {"qrcode":req.body.code};
    requestHandler.executeRequest(httpRequestHandler,requestInput,function(err,httpResponse,body){
    //request({url:requestUrl,method:"POST",json:input},function(err,response,body){
        if(err){
            return returnError(res,"Failure in QR Code Validation");
        }
        //processDeviceDtls(req,res,next,body.data[0]);
        responseOutput = httpRequestHandler.popResponseOutput(httpResponse);
        processDeviceDtls(req,res,next,responseOutput);
    });*/
    /*var input = {
        'qrcode' : req.body.code
    }

    var post_data = querystring.stringify(input);
    //var post_data = input;

    var post_options = {
        host: "192.168.43.81",
        port: "3001",
        path: "/validateQRCode",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };

    var post_req = http.request(post_options, function (response) {
        response.setEncoding('utf8');
        var data = '';
        response.on('data', function (chunk) {
            data = data + chunk;
        });

        response.on('end', function () {
            if (data === 'Error') {
                console.log("Unable to verify the QR Code");
                return returnError("Unable to verify the QR Code");
            }
            var userObj = JSON.parse(data);
            processDeviceDtls(req,res,next);
        });
    });
    post_req.on('error', function (e) {
        console.log("error in accessing the service");
        return returnError(req,"Error in accessing the service");
    });
    post_req.write(post_data);
    post_req.end();*/
};

function validateQRCode(req,res,next){
    if(req.body.code === undefined || req.body.code === "")
        return returnError(res,"Invalid code passed");
    var registerEvent = "users.register";
    urlHandler.executeRequest(registerEvent,req,res,function(err,response,resObj){
        if(err){
            return returnError(res,"Failure in QR Code Validation");
        }
        processDeviceDtls(req,res,next,resObj);
    });
};

var validateRegister = function(req,res,next){
    BankUser.find({where:{deviceId:req.body.deviceId}},req.callContext,function(err,data){
        if(err){
            console.log(error);
            return returnError(res,"Unable to fetch data");
        }
        if(data.length > 0) {
            if(data[0].__data.clientId !== req.body.clientId){
                return returnError(res,"Device User mismatch found");
            }
        }
        var reqObj = populateRequestObj(req,data[0].__data);
        var outputObj = popOutput(data[0].__data);
        devices.find({where:{deviceId:req.body.deviceId}},req.callContext,function(err,data){
            if(err)
                return returnError(res,"error in inserting record");
            else{
                console.log("reqObj = "+reqObj);
                req.body.reqObj = reqObj;
                var registerEvent = "users.validateRegister";
                urlHandler.executeRequest(registerEvent,req,res,function(err,response,resObj){
                    if(err){
                        return returnError(res,"Failure in QR Code Validation");
                    }
                    return returnSuccess(res,"Registeration validated Successfully",outputObj);
                });
            }
        });
        //return returnSuccess(res,"Registered Successfully");
    });
}

var populateRequestObj = function(req,userData){
    var reqObj = {};
    reqObj.user_id = userData.bankUserId;
    reqObj.otp_handle = userData.otpHandle;
    reqObj.device_id = req.body.deviceId;
    return reqObj;
}

var popOutput = function(userObj){
    var resObj = {};
    resObj.clientId = userObj.username;
    resObj.clientKey = userObj.clientKey;
    resObj.userShortName = userObj.userShortname;
    resObj.bankUserId = userObj.bankUserId;
    return resObj;
}

module.exports = {
    RegisterDevice : RegisterDevice,
    validateQRCode : validateQRCode,
    validateRegister : validateRegister
};