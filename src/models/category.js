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
    items : [Object],
    parentId : { type: Schema.Types.ObjectId, ref: 'Category' },
});

category.methods.viewModel = function(){
    return{
        id : this._id,
        sys : this.sys,
        code : this.code,
        name : this.name,
        shortDesc : this.shortDesc,
        image : this.image,
        items : this.items,
        parentId : this.parentId
    }
}
module.exports = mongoose.model("Category", category);