var mongoose = require('mongoose');
var field = require('./field');
var sysfld = require('./sys');
var Schema = mongoose.Schema;

var contentType = new Schema({
    sys : {type:Object},
    name : {type : Object, required : true},
    title : {type : Object, required : true},
    description : {type : Object},
    versioning : {type : Boolean, default : true},
    template : {type : String, required : true},
    media : [Object],
    fields : [field],
    status : {type : Boolean, required : true, default : true}
});

contentType.pre('save', function(next) {

    console.log('sys initiated')
    var cont = this;
    var sys = {}
    if (cont.sys != undefined)
    {
            sys = cont.sys;
            sys.lastUpdater= "";
            sys.lastUpdateTime = new Date();
    }
    else
    {
        sys.id = this.id;
        sys.type = "contentType";
        sys.issuer = "";
        sys.issueDate = new Date();
        sys.clientId = "";
    }
    
    cont.sys = sys;
    next();
});
module.exports = mongoose.model("ContentType", contentType);