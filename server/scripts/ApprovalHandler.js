var loopback = require('loopback');
var TranDtls = loopback.findModel("TranDtls");
var request = require("request");

var updateApprovalRequest = function(req,res,next){
    console.log("inside getPendingRequests");   
    updatePendingApprovalRequests(req,res,next);
}

var getApprovalRequests = function(req,res,next){
    console.log("inside getPendingRequests");   
    getPendingApprovalRequests(req,res,next);
}

function getPendingApprovalRequests(req,res,next){
    TranDtls.find({where: {_id: req.body.requestId,approval_status:"N"}},req.callContext,function(err,data){
        if(err){
            console.log(error);
            return errorResponse(res,"Unable to fetch data");
        }
        if(data.length === 0){
            return errorResponse(res,"No record available");
        }
        var requestData = data[0].__data;
        return successResponse(res,"Approval request data feteched successfully",requestData);
        });
}

function updatePendingApprovalRequests(req,res,next){
    TranDtls.find({where: {_id: req.body.requestId}},req.callContext,function(err,data){
        if(err){
            console.log(error);
            return errorResponse(res,"Unable to fetch data");
        }
        if(data.length === 0)
            return errorResponse(res,"No record available");
        var requestData = data[0].__data;
        if(requestData.approval_status === "A" || requestData.approval_status === "R"){
            return errorResponse(res,"Record already actioned");
        }
        var approvalAction = req.body.action;
        console.log("approvalAction is "+approvalAction);
        requestData.approval_status = req.body.action;
        requestData.approver_comments = req.body.approver_comments;
        TranDtls.upsert(requestData,req.callContext,function(err,data){
            if(err)
                return errorResponse(res,"error in inserting record");
            else{
                var requestUrl = "http://localhost:3001/api/TranDtls/update?where=%7B%22_id%22%3A%22"
                requestUrl = requestUrl+data.__data.id+"%22%7D"
                request({url:requestUrl,method:"POST",json:data.__data},function(err,response,body){
                    if(err){
                        console.log("error occurred "+err);
                        return errorResponse(res,"Unable to connect to core server");
                    }
                // Make calls to core server to update the status
                var msg = "";
                if(approvalAction === "A")
                    msg = "Record approved successfully"
                else if(approvalAction === "R")
                    msg = "Record rejected successfully"
                return successResponse(res,msg,approvalAction);
                });
            }
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
    responseObject.data = data;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(responseObject));
    return;
}

module.exports = {
    getApprovalRequests : getApprovalRequests,
    updateApprovalRequest : updateApprovalRequest
}