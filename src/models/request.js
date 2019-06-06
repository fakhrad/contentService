var mongoose = require('mongoose');
var sysfld = require('./sys');
var Status = require('./status');
var Schema = mongoose.Schema;
 
var request = new Schema({
    sys : {type : sysfld, required : true},
    title : {type : Object, required : true},
    description : {type : Object},
    longDesc : {type : Object},
    contentType : {type: Schema.Types.ObjectId, ref: 'ContentType' , required : true},
    category : {type: Schema.Types.ObjectId, ref: 'Category'},
    thumbnail : [Object],
    attachments : [Object],
    receiver : {type : String},
    status : {type : String, enum : ['draft', 'published', 'changed', 'archived'], default : 'draft'},
    statusLog : [Status],
    settings : {type : Object}
},);

request.methods.publish = function(user, description, cb) {
    if (this.status != "published")
    {
        var newStatus = {}
        newStatus.code = "published";
        newStatus.applyDate = new Date();
        newStatus.user = user;
        newStatus.description = description;
        this.statusLog.push(newStatus);
        this.status = "published";
        this.save(cb(undefined));
    }
    else
        cb("Item already published!");
};

request.methods.unPublish = function(cb) {
    if (this.status === "published" && this.statusLog.length > 0)
    {
        this.statusLog.pop();
        this.status = this.statusLog[this.statusLog.length - 1].code;
        this.save(cb);
    }
    else
        cb("Error in unPublishing item!");
};

request.methods.archive = function(user, description, cb) {
    if (this.status != "archived")
    {
        var newStatus = {};
        newStatus.code = "archived";
        newStatus.applyDate = new Date();
        newStatus.user = user;
        newStatus.description = description;
        this.status = "archived";
        this.statusLog.push(newStatus);
        this.save(cb);
    }
    else
        cb("Item already archived!");
};

request.methods.unArchive = function(cb) {
    if (this.status === "archived" && this.statusLog.length > 0)
    {
        this.statusLog.pop();
        this.status = this.statusLog[this.statusLog.length - 1].code;
        this.save(cb);
    }
    else
        cb("Error in unArchiving item!");
};

module.exports = mongoose.model("Request", request);