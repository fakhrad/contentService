var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqid = require('uniqid');
var admin = require('./adminusers');

var sys = new Schema({
    link : {type : String},
    type : {type : String},
    spaceId : {type : String, required : true},
    issuer : {type: Schema.Types.ObjectId, ref: 'AdminUsers'},
    issueDate : {type : Date, required : true, default : new Date()},
    lastUpdater : {type : Object},
    lastUpdateTime : {type : Date}
}, {_id : false}, {id : false}, { toJSON: { virtuals: true } });

sys.pre('save', function(next) {
    // do stuff
    if (this.isModified()) return next();
    this.link = uniqid();
    next();
  });
module.exports = sys;