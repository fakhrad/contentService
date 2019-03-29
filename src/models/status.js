var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var status = new Schema({
    code : {type : String, enum : ["draft", "published", "changed", "archived"], default : 'draft'},
    applyDate : {type : Date},
    user : {type : Object},
    description : {type : Object}
}, { toJSON: { virtuals: true } });
  
module.exports = status;