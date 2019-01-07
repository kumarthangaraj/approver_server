var utils = {
    popInputForValidateQRCode : function(req,res,cb,xmlRequestCb,eventName){
        var reqObj =  {"qrcode":req.body.code}; 
        return reqObj;
    },
    popOutputForValidateQRCode : function(res,resBody,resObj){
        if(resObj === null || resObj === undefined)
            resObj = {};
        resObj = resBody.data[0];
        return resObj;
    },
    popInputForValidateRegister : function(req,res,cb,xmlRequestCb,eventName){
        var reqObj =  req.body.reqObj;
        return reqObj;
    },
    popOutputOfValidateRegister : function(res,resBody,resObj){
        if(resObj === null || resObj === undefined)
            resObj = {};
        resObj = resBody.data[0];
        return resObj;
    }
};
var parseResObj = function(funcName,res,resBody,resObj){
    return utils[funcName](res,resBody,resObj);
};

var prepareReqObj = function(funcName, req,res,cb,xmlRequestCb,eventName){
    return utils[funcName](req,res,cb,xmlRequestCb,eventName);
};

module.exports = {
    prepareReqObj : prepareReqObj,
    parseResObj : parseResObj
};