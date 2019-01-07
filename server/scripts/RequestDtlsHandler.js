var loopback = require('loopback');
var TranDtls = loopback.findModel("TranDtls");
var parseString = require('xml2js').parseString;
var NotificationHandler = require("./NotificationHandler.js");

var storeRequests = function(req,res,next){
	var data = formInsertData(req,res,next, function (req,res,next,data){
		TranDtls.create(data,req.callContext,function(err,output){
			if(err)
				return returnError(res,"error in inserting record");
			else{
				if(output[0] === undefined)
					NotificationHandler.sendNotification(req.callContext,output.__data, null);
				else
					NotificationHandler.sendNotificationList(req.callContext,output);
				return returnSuccess(res,"Record added successfully",next);
			}
		});
	});
};

var formInsertData = function(req,res,next,cb){
	//var inputXML = "<ReferralDetails><ReferralId>ABTEST1</ReferralId><CreatorUserId>RAJA</CreatorUserId><ReferredTo>KRISHNAN</ReferredTo><CreatorSol>603</CreatorSol><RefAmt>100.00</RefAmt><RefCrncy>KWD</RefCrncy><PartTranSrlNo>001</PartTranSrlNo><ReferralCode>999</ReferralCode><ReferralDesc>ABE Exception</ReferralDesc><BODDate></BODDate><CreatorRemarks>MY FIRST REFERRAL</CreatorRemarks><FREETEXT1></FREETEXT1><FREETEXT2></FREETEXT2><BankId>01</BankId></ReferralDetails>"
	//var inputXML = JSON.stringify(req.body).replace('{"','').replace('":""}','');
	//var inputXML = "<Referral><ReferralDetails><ReferralId>AB244099</ReferralId><CreatorUserId>DALAL</CreatorUserId><ReferredTo>FIN23</ReferredTo><CreatorSol>603</CreatorSol><TranAmt>                2,500.000</TranAmt><TranCrncy>KWD</TranCrncy><AuthMatrixId>OPEXC</AuthMatrixId><PartTranSrlNo>0001</PartTranSrlNo><ReferralCode>ABE</ReferralCode><ReferralData>ABE|0000</ReferralData><ReferralDesc>Amount Based Exception</ReferralDesc><BODDate>10-12-2018</BODDate><CreatorRemarks>test 22222</CreatorRemarks><FREETEXT1></FREETEXT1><FREETEXT2></FREETEXT2><BankId>01</BankId><AcctId></AcctId><AcctName></AcctName><TranParticular></TranParticular><CrDrInd>D</CrDrInd></ReferralDetails><ReferralDetails><ReferralId>AB244099</ReferralId><CreatorUserId>DALAL</CreatorUserId><ReferredTo>FIN23</ReferredTo><CreatorSol>603</CreatorSol><TranAmt>0</TranAmt><TranCrncy></TranCrncy><AuthMatrixId>OPEXC</AuthMatrixId><PartTranSrlNo>0000</PartTranSrlNo><ReferralCode>KYC</ReferralCode><ReferralData>KYC|0000|RP1|0000</ReferralData><ReferralDesc>KYC REVIEW DATE EXPIRED FOR CUSTOMER</ReferralDesc><BODDate>10-12-2018</BODDate><CreatorRemarks>test 22222</CreatorRemarks><FREETEXT1></FREETEXT1><FREETEXT2></FREETEXT2><BankId>01</BankId><AcctId></AcctId><AcctName></AcctName><TranParticular></TranParticular><CrDrInd>D</CrDrInd></ReferralDetails></Referral>";
	var inputXML = "<Referral><ReferralDetails><ReferralId>AB244099</ReferralId><CreatorUserId>DALAL</CreatorUserId><ReferredTo>FIN23</ReferredTo><CreatorSol>603</CreatorSol><TranAmt>2,500.000</TranAmt><TranCrncy>KWD</TranCrncy><AuthMatrixId>OPEXC</AuthMatrixId><PartTranSrlNo>0001</PartTranSrlNo><ReferralCode>ABE</ReferralCode><ReferralData>ABE|0000</ReferralData><ReferralDesc>Amount Based Exception</ReferralDesc><BODDate>10-12-2018</BODDate><CreatorRemarks>test 22222</CreatorRemarks><FREETEXT1></FREETEXT1><FREETEXT2></FREETEXT2><BankId>01</BankId><AcctId>123456789012</AcctId><AcctName>MOHAMAD SALAMA</AcctName><TranParticular></TranParticular><CrDrInd>D</CrDrInd></ReferralDetails><ReferralDetails><ReferralId>AB244099</ReferralId><CreatorUserId>DALAL</CreatorUserId><ReferredTo>FIN23</ReferredTo><CreatorSol>603</CreatorSol><TranAmt>0</TranAmt><TranCrncy></TranCrncy><AuthMatrixId>OPEXC</AuthMatrixId><PartTranSrlNo>0000</PartTranSrlNo><ReferralCode>KYC</ReferralCode><ReferralData>KYC|0000|RP1|0000</ReferralData><ReferralDesc>KYC REVIEW DATE EXPIRED FOR CUSTOMER</ReferralDesc><BODDate>10-12-2018</BODDate><CreatorRemarks>test 22222</CreatorRemarks><FREETEXT1></FREETEXT1><FREETEXT2></FREETEXT2><BankId>01</BankId><AcctId>123456789012</AcctId><AcctName>MOHAMAD SALAMA</AcctName><TranParticular></TranParticular><CrDrInd>D</CrDrInd></ReferralDetails></Referral>";
	parseString(inputXML, function (err, outputJsON) {
		console.dir(outputJsON);
		cb(req,res,next,parseData(res,outputJsON));
	});
}

var parseData = function(res,inputJsON){
	var recCount = getRecCount(inputJsON);
	if(recCount === -1)
		return errorResponse(res,"Invalid response from core application");
	if(recCount === 0)
		var parsedData = popParseDataValues(inputJsON, null);
	else {
		var parsedData = [];
		for(var i=0; i<recCount; i++){
			var parsedDataObj = popParseDataValues(inputJsON,i);
			parsedData[i] = parsedDataObj;
		}
	}
	return parsedData;
}

var getRecCount = function(inputJsON) {
	if(inputJsON.Referral.ReferralDetails === undefined)
		return -1;
	else if(inputJsON.Referral.ReferralDetails[0] === undefined)
		return 0;
	else
		return inputJsON.Referral.ReferralDetails.length; 
}

var popParseDataValues = function (inputJsON,seqNum){
	var parsedData = {};
	parsedData.request_id = getValue(inputJsON.Referral.ReferralDetails,"ReferralId",seqNum);
	parsedData.request_date = getValue(inputJsON.Referral.ReferralDetails,"BODDate",seqNum);
	parsedData.org_rec_no = getValue(inputJsON.Referral.ReferralDetails,"PartTranSrlNo",seqNum);
	parsedData.sol_id = getValue(inputJsON.Referral.ReferralDetails,"CreatorSol",seqNum);
	parsedData.bank_id = getValue(inputJsON.Referral.ReferralDetails,"BankId",seqNum);
	parsedData.acct_id = getValue(inputJsON.Referral.ReferralDetails,"AcctId",seqNum);
	parsedData.acct_name = getValue(inputJsON.Referral.ReferralDetails,"AcctName",seqNum);
	parsedData.cr_dr_indicator = getValue(inputJsON.Referral.ReferralDetails,"CrDrInd",seqNum);
	parsedData.currency = getValue(inputJsON.Referral.ReferralDetails,"TranCrncy",seqNum);
	parsedData.amount = getValue(inputJsON.Referral.ReferralDetails,"TranAmt",seqNum);
	parsedData.tran_particulars = getValue(inputJsON.Referral.ReferralDetails,"CreatorRemarks",seqNum);
	parsedData.excp_code = getValue(inputJsON.Referral.ReferralDetails,"ReferralCode",seqNum);
	parsedData.excp_desc = getValue(inputJsON.Referral.ReferralDetails,"ReferralDesc",seqNum);
	parsedData.excp_data = getValue(inputJsON.Referral.ReferralDetails,"ReferralData",seqNum);
	parsedData.created_by = getValue(inputJsON.Referral.ReferralDetails,"CreatorUserId",seqNum);
	parsedData.approver = getValue(inputJsON.Referral.ReferralDetails,"ReferredTo",seqNum);
	parsedData.matrix_id = getValue(inputJsON.Referral.ReferralDetails,"AuthMatrixId",seqNum);
	parsedData.acct_sol = getValue(inputJsON.Referral.ReferralDetails,"AcctSol",seqNum);
	parsedData.tran_remarks1 = getValue(inputJsON.Referral.ReferralDetails,"TranRemarks1",seqNum);
	parsedData.free_text1 = getValue(inputJsON.Referral.ReferralDetails,"FreeText1",seqNum);
	parsedData.free_text2 = getValue(inputJsON.Referral.ReferralDetails,"FreeText2",seqNum);
	parsedData.approver_comments = "";
	return parsedData;
}
var getValue = function(input,fieldName,seqNum){
	if(seqNum == null){
		if(input[fieldName] !== undefined)
			if(input[fieldName][0] !== undefined)
				return input[fieldName][0];
	}else {
		if(input[seqNum][fieldName] !== undefined)
			if(input[seqNum][fieldName][0] !== undefined)
				return input[seqNum][fieldName][0];
	}
	return "";
}

function returnError(res, message){
    var responseObject = {};
    responseObject.statusCode = "300";
    responseObject.code = "INSERT_FAILED";
    responseObject.message = message;
    var resWrapper = {};
    resWrapper.error = responseObject;
    res.writeHead(300, { "Content-Type": "application/xml" });
    res.end(JSON.stringify(resWrapper));
    return;
}

var returnSuccess = function(res,message,next){
	var response = "<STATUS>SUCCESS</STATUS>"
	res.writeHead(200, { "Content-Type": "application/xml" });
	res.end(response);
	return;
}

module.exports = {
	storeRequests : storeRequests
};