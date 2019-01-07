module.exports = function (options) {
    return function apiPreHandler(req,res,next){
        console.log("inside pre handler");
        console.log("req.url is "+req.url);
        next();
    }
}