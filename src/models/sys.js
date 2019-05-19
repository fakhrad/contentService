var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqid = require('uniqid');

var sys = new Schema({
    link : {type : String, default : uniqid()},
    type : {type : String},
    spaceId : {type : String, required : true},
    issuer : {type : Object},
    issueDate : {type : Date, required : true, default : new Date()},
    lastUpdater : {type : Object},
    lastUpdateTime : {type : Date}
}, {_id : false}, {id : false}, { toJSON: { virtuals: true } });
  
module.exports = sys;