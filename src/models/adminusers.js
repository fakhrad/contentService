var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqid = require('uniqid');
var space = require('./content');

var adminuser = new Schema({

});
module.exports = mongoose.model("AdminUsers", adminuser);