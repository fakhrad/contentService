var mongoose = require('mongoose');
var sysfld = require('./sys');
var ctype = require('./contentType');
var status = require('./status');
var Schema = mongoose.Schema;

var content = new Schema({
    sys : {type:sysfld, required :true},
    fields : {type : Object},
    status : {type : String, enum : ['draft', 'published', 'changed', 'archived'], default : 'draft'},
    statusLog : [status],
    versions : [Object],
    contentType : {type: Schema.Types.ObjectId, ref: 'ContentType' , required : true},
    category : {type: Schema.Types.ObjectId, ref: 'Category'}
});

content.methods.publish = function(user, description, cb) {
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

content.methods.unPublish = function(cb) {
  if (this.status === "published" && this.statusLog.length > 0)
  {
      this.statusLog.pop();
      this.status = this.statusLog[statusLog.length - 1].code;
      this.save(cb);
  }
  else
      cb("Error in unPublishing item!");
};

content.methods.archive = function(cb) {
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

content.methods.unArchive = function(cb) {
  if (this.status === "archived" && this.statusLog.length > 0)
  {
      this.statusLog.pop();
      this.status = this.statusLog[statusLog.length - 1].code;
      this.save(cb);
  }
  else
      cb("Error in unArchiving item!");
};

content.methods.count = function(cb) {
    
};
module.exports = mongoose.model("Content", content);