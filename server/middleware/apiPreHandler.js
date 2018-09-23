module.exports = function (options) {
    return function apiPreHandler(req,res,next){
        console.log("inside pre handler");
        next();
    }
}