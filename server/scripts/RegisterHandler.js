var loopback = require('loopback');
var devices = loopback.findModel("devicedtls");
var BankUser = loopback.findModel("BankUser");
var randomString = require('randomstring');
var querystring = require('querystring');
var http = require('http');
var request = require('request');

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

function returnSuccess(res,message, data){
    var responseObject = {};
    var clientKey = randomString.generate();
    responseObject.status = "SUCCESS";
    responseObject.message = message;
    responseObject.clientId = data.username;
    responseObject.clientKey = data.clientKey;
    responseObject.user_name = data.username;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(responseObject));
    return;
}

function processDeviceDtls(req,res,next,userDtls){
    devices.find({},req.callContext,function(err,data){
        if(err){
            console.log(error);
            return returnError(res,"Unable to fetch data");
        }
        if(data.length > 0) {
            if(data[0].clientId !== userDtls.user_id){
                return returnError(res,"Device already registered");                
            }
        }
        req.body.config.enabled = "Y";
        req.body.clientId = userDtls.user_id;
        devices.upsert(req.body.config,req.callContext,function(err,data){
            if(err)
                return returnError(res,"error in inserting record");
            else{
                var bankUserObj = populateBankUserObj(data,userDtls);
                BankUser.upsert(bankUserObj,req.callContext,function(err,data){
                    if(err){
                        return returnError(res,"User creation failed");
                    }else 
                        return returnSuccess(res,"Device registered successfully",bankUserObj);
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
    BankUser.clientKey = randomString.generate();
    popDataFromCoreDB(BankUser,userDtls);
    return BankUser;
}

function popDataFromCoreDB(BankUser,userDtls){
    BankUser.bankUserId = userDtls.user_id;
    BankUser.password = BankUser.clientKey;
    BankUser.username = userDtls.user_id;
    BankUser.bankId = userDtls.bank_id;
    BankUser.solId = userDtls.sol_id;
    BankUser.empId = userDtls.emp_id;
    BankUser.mobileNumber = userDtls.mobile_number;
    BankUser.email = userDtls.email_id;
    BankUser.userDtls = userDtls;
}

function validateRequest(req,res,next){
    if(req.body.code === undefined || req.body.code === "")
        return false;

    var requestUrl = "http://localhost:3001/validateQRCode"   
    var input = {"qrcode":req.body.code}; 
    request({url:requestUrl,method:"POST",json:input},function(err,response,body){
        if(err){
            return returnError(res,"Failure in QR Code Validation");
        }
        processDeviceDtls(req,res,next,body.data[0]);
    });
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
}

module.exports = {
    RegisterDevice : RegisterDevice
};