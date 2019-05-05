var mongoose = require('mongoose');
var sysfld = require('./sys');
var Schema = mongoose.Schema;
 
var category = new Schema({
    sys : {type : sysfld, required : true},
    code : {type:Number},
    name : {type : Object, required:true},
    shortDesc : {type : Object},
    longDesc : {type : Object},
    image : {type : Object},
    parentId : { type: Schema.Types.ObjectId, ref: 'Category' },
    contentTypes : [Object]
});

category.pre('save', function(next) {
    var cont = this;
    if (cont.sys != undefined)
    {
            sys = cont.sys;
            sys.lastUpdater= "";
            sys.lastUpdateTime = new Date();
    }
    cat.sys = sys;
    next();
});
module.exports = mongoose.model("Category", category);