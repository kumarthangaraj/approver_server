var loopback = require('loopback');
var devices = loopback.findModel("devicedtls");
var BankUser = loopback.findModel("BankUser");
var randomString = require('randomstring');

var LoginDevice = function(req,res,next){
    console.log("inside LoginDevice");
    var responseObject = {};
    //if(!validateRequest(req)){
        responseObject.status = "FAILURE";
        responseObject.message = "Invalid Input";
        res.writeHead(300, { "Content-Type": "application/json" });
        res.end(JSON.stringify(responseObject));
        return;
    //}   
}


module.exports = {
    LoginDevice : LoginDevice
};