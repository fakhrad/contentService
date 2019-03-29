var mongoose = require('mongoose');
var field = require('./field');
var sysfld = require('./sys');
var Schema = mongoose.Schema;

var contentType = new Schema({
    sys : {type:Object, required :true},
    name : {type : Object, required : true},
    displayName : {type : Object, required : true},
    description : {type : Object},
    localize : {type : Boolean, default : true},
    template : {type : String, required : true},
    image : {type : Object},
    fields : [field],
    status : {type : Object, required : true}
});

contentType.pre('save', function(next) {
    var cont = this;
    var sys = new sysfld();
    sys.id = this.id;
    sys.type = "contentType";
    sys.issuer = "";
    sys.issueDate = new Date();
    sys.clientId = "";
    if (cont.isModified()) 
    {
        cont.sys.lastUpdater= "";
        cont.sys.lastUpdateTime = new Date();
    }
    cont.sys = sys;
    next();
});
module.exports = mongoose.model("ContentType", contentType);