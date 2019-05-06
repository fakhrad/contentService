var mongoose = require('mongoose');
var field = require('./field');
var sysfld = require('./sys');
var Schema = mongoose.Schema;

var contentType = new Schema({
    sys : {type:Object, required : true},
    name : {type : Object, required : true},
    title : {type : Object, required : true},
    description : {type : Object},
    versioning : {type : Boolean, default : true},
    template : {type : String, required : true},
    media : [Object],
    fields : [field],
    status : {type : Boolean, required : true, default : true}
});

module.exports = mongoose.model("ContentType", contentType);