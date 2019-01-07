var xml2js = require('xml2js');
var urlHandler = require("./RequestUrlHandler.js");

var utils = {
    popInputForValidateQRCode : function(req,res,cb,xmlRequestObj,eventName){
        var httpHandler = urlHandler.getHttpRequestHandler(eventName);
        var xmlRequest = httpHandler.request;
        var parser = new xml2js.Parser();
        parser.parseString(xmlRequest, function (err, result) {
            if (err) {
                err.methodName = "xmltojsparser.parseString"
                log.error(request.callContext, err);
            }
            console.log("result is "+result);
            result.FIXML['Header'][0]['RequestHeader'][0]['MessageKey'][0].RequestUUID[0] = "12345";
            result.FIXML['Header'][0]['RequestHeader'][0]['RequestMessageInfo'][0]['MessageDateTime'][0] = "2019-01-01T15:00:35.198";
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['qrCodeStr'][0] = req.body.code;
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(result);
            xmlRequestObj(eventName,xml,res,cb);
        });
    },
    popOutputForValidateQRCode : function(res,resBody,resObj,cb){
        if(resObj === null || resObj === undefined)
            resObj = {};
        if (!resBody.error && resBody.code == 200) {
            try {
                var responseText = resBody.body;

                if (responseText) {
                    responseText = responseText.replace("(<\\?[^<]*\\?>)?", ""). /* remove preamble */
                        replace("xmlns.*?(\"|\').*?(\"|\')", "") /* remove xmlns declaration */
                        .replace("(<)(\\w+:)(.*?>)", "$1$3") /* remove opening tag prefix */
                        .replace("(</)(\\w+:)(.*?>)", "$1$3"); /* remove closing tags prefix */
                }
                console.log(responseText);
                var parser = new xml2js.Parser();
                parser.parseString(responseText, function (err, result) {
                    console.log("result is ************* "+result);						
                    if(isUserIdExist(result)){
                        err=null;
                        var userDetails = {
                            user_id: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['userId'][0],
                            user_name: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['userName'][0],
                            work_class: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['workClass'][0],
                            role_id: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['roleId'][0],
                            otp_value: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['otpCode'][0],
                            otp_handle: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['otpHandle'][0],
                            sol_id: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['solId'][0],
                            bank_id: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['bankId'][0]
                        };
                    }
                    else {
                        err = "Failed to resgister";
                    }
                    cb(err,res,userDetails);
                });
            }
            catch (err) {
                console.log('User details service did not send expected response. Following error occured in code');
                console.log(err);
                console.log("XML requests dint not send expected response");
                cb(err,res,null);
            }
        }
    },
    popInputForApproveRequest : function(req,res,cb,xmlRequestObj,eventName){
        var httpHandler = urlHandler.getHttpRequestHandler(eventName);
        var xmlRequest = httpHandler.request;
        var parser = new xml2js.Parser();
        parser.parseString(xmlRequest, function (err, result) {
            if (err) {
                err.methodName = "xmltojsparser.parseString"
                log.error(request.callContext, err);
            }
            console.log("result is "+result);
            result.FIXML['Header'][0]['RequestHeader'][0]['MessageKey'][0].RequestUUID[0] = "12345";
            result.FIXML['Header'][0]['RequestHeader'][0]['RequestMessageInfo'][0]['MessageDateTime'][0] = "2019-01-01T15:00:35.198";
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['referral_id'][0] = req.request_id;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['approver_id'][0] = req.approver;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['approver_remarks'][0] = req.approver_comments;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['matrix_id'][0] = req.matrix_id;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['part_tran_num'][0] = req.org_rec_no;
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(result);
            xmlRequestObj(eventName,xml,res,cb);
        });
    },
    popOutputOfApproveRequest : function(res,resBody,resObj,cb){
        if(resObj === null || resObj === undefined)
            resObj = {};
        if (!resBody.error && resBody.code == 200) {
            try {
                var responseText = resBody.body;

                if (responseText) {
                    responseText = responseText.replace("(<\\?[^<]*\\?>)?", ""). /* remove preamble */
                        replace("xmlns.*?(\"|\').*?(\"|\')", "") /* remove xmlns declaration */
                        .replace("(<)(\\w+:)(.*?>)", "$1$3") /* remove opening tag prefix */
                        .replace("(</)(\\w+:)(.*?>)", "$1$3"); /* remove closing tags prefix */
                }
                console.log(responseText);
                var parser = new xml2js.Parser();
                parser.parseString(responseText, function (err, result) {
                    console.log("result is ************* "+result);						
                    if(isStatusExist(result)){
                        err=null;
                        var resObj = {
                            status: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['STATUS'][0],
                            reason: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['REASON'][0]
                        };
                    }
                    else {
                        err = "Failed to update in core";
                    }
                    cb(err,res,resObj);
                });
            }
            catch (err) {
                console.log('User details service did not send expected response. Following error occured in code');
                console.log(err);
                console.log("XML requests dint not send expected response");
                cb(err,res,null);
            }
        }
    },
    popInputForRejectRequest : function(req,res,cb,xmlRequestObj,eventName){
        var httpHandler = urlHandler.getHttpRequestHandler(eventName);
        var xmlRequest = httpHandler.request;
        var parser = new xml2js.Parser();
        parser.parseString(xmlRequest, function (err, result) {
            if (err) {
                err.methodName = "xmltojsparser.parseString"
                log.error(request.callContext, err);
            }
            console.log("result is "+result);
            result.FIXML['Header'][0]['RequestHeader'][0]['MessageKey'][0].RequestUUID[0] = "12345";
            result.FIXML['Header'][0]['RequestHeader'][0]['RequestMessageInfo'][0]['MessageDateTime'][0] = "2019-01-01T15:00:35.198";
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['referral_id'][0] = req.request_id;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['approver_id'][0] = req.approver;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['approver_remarks'][0] = req.approver_comments;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['matrix_id'][0] = req.matrix_id;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['part_tran_num'][0] = req.org_rec_no;
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(result);
            xmlRequestObj(eventName,xml,res,cb);
        });
    },
    popOutputOfRejectRequest : function(res,resBody,resObj,cb){
        if(resObj === null || resObj === undefined)
            resObj = {};
        if (!resBody.error && resBody.code == 200) {
            try {
                var responseText = resBody.body;

                if (responseText) {
                    responseText = responseText.replace("(<\\?[^<]*\\?>)?", ""). /* remove preamble */
                        replace("xmlns.*?(\"|\').*?(\"|\')", "") /* remove xmlns declaration */
                        .replace("(<)(\\w+:)(.*?>)", "$1$3") /* remove opening tag prefix */
                        .replace("(</)(\\w+:)(.*?>)", "$1$3"); /* remove closing tags prefix */
                }
                console.log(responseText);
                var parser = new xml2js.Parser();
                parser.parseString(responseText, function (err, result) {
                    console.log("result is ************* "+result);						
                    if(isStatusExist(result)){
                        err=null;
                        var resObj = {
                            status: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['STATUS'][0],
                            reason: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['REASON'][0]
                        };
                    }
                    else {
                        err = "Failed to Update in Core";
                    }
                    cb(err,res,resObj);
                });
            }
            catch (err) {
                console.log('User details service did not send expected response. Following error occured in code');
                console.log(err);
                console.log("XML requests dint not send expected response");
                cb(err,res,null);
            }
        }
    },
    popInputForValidateRegister : function(req,res,cb,xmlRequestObj,eventName){
        var httpHandler = urlHandler.getHttpRequestHandler(eventName);
        var xmlRequest = httpHandler.request;
        var parser = new xml2js.Parser();
        parser.parseString(xmlRequest, function (err, result) {
            if (err) {
                err.methodName = "xmltojsparser.parseString"
                log.error(request.callContext, err);
            }
            console.log("result is "+result);
            result.FIXML['Header'][0]['RequestHeader'][0]['MessageKey'][0].RequestUUID[0] = "12345";
            result.FIXML['Header'][0]['RequestHeader'][0]['RequestMessageInfo'][0]['MessageDateTime'][0] = "2019-01-01T15:00:35.198";
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['otp_handle'][0] = req.body.reqObj.otp_handle;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['user_id'][0] = req.body.reqObj.user_id;
            result.FIXML['Body'][0]['executeFinacleScriptRequest'][0]['executeFinacleScript_CustomData'][0]['device_id'][0] = req.body.reqObj.device_id;
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(result);
            xmlRequestObj(eventName,xml,res,cb);
        });
    },
    popOutputOfValidateRegister : function(res,resBody,resObj,cb){
        if(resObj === null || resObj === undefined)
            resObj = {};
        if (!resBody.error && resBody.code == 200) {
            try {
                var responseText = resBody.body;

                if (responseText) {
                    responseText = responseText.replace("(<\\?[^<]*\\?>)?", ""). /* remove preamble */
                        replace("xmlns.*?(\"|\').*?(\"|\')", "") /* remove xmlns declaration */
                        .replace("(<)(\\w+:)(.*?>)", "$1$3") /* remove opening tag prefix */
                        .replace("(</)(\\w+:)(.*?>)", "$1$3"); /* remove closing tags prefix */
                }
                console.log(responseText);
                var parser = new xml2js.Parser();
                parser.parseString(responseText, function (err, result) {
                    console.log("result is ************* "+result);						
                    if(isStatusExist(result)){
                        err=null;
                        var resObj = {
                            status: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['STATUS'][0],
                            reason: result.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['REASON'][0]
                        };
                    }
                    else {
                        err = "Failed to Update in Core";
                    }
                    cb(err,res,resObj);
                });
            }
            catch (err) {
                console.log('User details service did not send expected response. Following error occured in code');
                console.log(err);
                console.log("XML requests dint not send expected response");
                cb(err,res,null);
            }
        }
    }
};
var parseResObj = function(funcName,res,resBody,resObj,cb){
    return utils[funcName](res,resBody,resObj,cb);
};

var  isUserIdExist = function(input){
    if(input.FIXML !== undefined)
        if(input.FIXML['Body'][0]['executeFinacleScriptResponse'] !== undefined)
            if(input.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'] != undefined)
                if(input.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['userId'] != undefined)
                    return true;
    return false;
};

var  isStatusExist = function(input){
    if(input.FIXML !== undefined)
        if(input.FIXML['Body'][0]['executeFinacleScriptResponse'] !== undefined)
            if(input.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'] != undefined)
                if(input.FIXML['Body'][0]['executeFinacleScriptResponse'][0]['executeFinacleScript_CustomData'][0]['STATUS'] != undefined)
                    return true;
    return false;
};


var prepareReqObj = function(funcName, req,res,cb,xmlRequestCb,eventName){
    return utils[funcName](req,res,cb,xmlRequestCb,eventName);
};

module.exports = {
    prepareReqObj : prepareReqObj,
    parseResObj : parseResObj
};