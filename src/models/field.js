var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var field = new Schema({
    name : {type:String, required :true, unique:true},
    title : {type : String, required : true},
    desc : {type : Object},
    dataType : {type : Object, required : true},
    localize : {type : Boolean, default : false}
}, { toJSON: { virtuals: true } });
  
module.exports = field;