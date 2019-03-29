var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sys = new Schema({
    id : {type:String, required :true, unique:true},
    clientId : {type : String, required : true},
    issuer : {type : Object},
    issueDate : {type : Date, required : true, default : new Date()},
    lastUpdater : {type : Object},
    lastUpdateTime : {type : Date}
}, { toJSON: { virtuals: true } });
  
module.exports = sys;