var mongoose = require('mongoose');
var sysfld = require('./sys');
var status = require('./status');
var Schema = mongoose.Schema;
 
var asset = new Schema({
    sys : {type : sysfld, required : true},
    name : {type : Object, required:true},
    description : {type : Object},
    url : {type : Object},
    fileType : {type: Object},
    status : {type : String, enum : ['draft', 'published', 'changed', 'archived'], default : 'draft'},
    statusLog : [status]
});

asset.pre('save', function(next) {
    ///Initiate sys field
    var cont = this;
    if (cont.sys != undefined)
    {
            sys = cont.sys;
            sys.lastUpdater= "";
            sys.lastUpdateTime = new Date();
    }
    else
    {
        //initiate status
        var newStatus = new status();
        newStatus.code = "draft";
        newStatus.applyDate = new Date();
        newStatus.user = "";
        newStatus.description = "Item created";
        this.status = "draft";
        this.statusLog.push(newStatus);
    }
    cont.sys = sys;

    next();
});

asset.methods.publish = function(user, description, cb) {
    if (this.status != "published")
    {
        var newStatus = new status();
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

asset.methods.unPublish = function(cb) {
    if (this.status === "published" && this.statusLog.length > 0)
    {
        this.statusLog.pop();
        this.status = this.statusLog[statusLog.length - 1].code;
        this.save(cb);
    }
    else
        cb("Error in unPublishing item!");
};

asset.methods.archive = function(cb) {
    if (this.status != "archived")
    {
        var newStatus = new status();
        newStatus.code = "archived";
        newStatus.applyDate = new Date();
        newStatus.user = user;
        newStatus.description = description;
        this.status = "archived";
        this.statusLog.push(newStatus);
        cb(newStatus);
    }
    else
        cb("Item already archived!");
};

asset.methods.unArchive = function(cb) {
    if (this.status === "archived" && this.statusLog.length > 0)
    {
        this.statusLog.pop();
        this.status = this.statusLog[statusLog.length - 1].code;
        this.save(cb);
    }
    else
        cb("Error in unArchiving item!");
};

module.exports = mongoose.model("Asset", asset);