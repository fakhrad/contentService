var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var field = new Schema({
    name : {type:Object, required :true},
    title : {type : Object, required : true},
    desc : {type : Object},
    type : {type : Object, required : true},
    localize : {type : Boolean, default : false}
}, { toJSON: { virtuals: true } });
  
module.exports = field;