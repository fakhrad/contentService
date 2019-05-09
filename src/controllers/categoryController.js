var Category = require('../models/category'); 
var sys = require('../models/sys'); 
var async = require('async')

var getcatgories = function(req, cb)
{
    async.parallel(
        {
            categories : function(callback) {Category.find({"sys.spaceId" : req.spaceId}).exec(callback)},
        }, function( err, results){
            var result = {success : false, data : null, error : null };
            if (err)
            {
                result.success = false;
                result.data =  undefined;
                result.error = err;
                cb(result);       
                return; 
            }
            var rootc = [];
            var categories = results.categories;
            result.success = false;
            result.data =  categories;
            result.error = undefined;
            cb(result);       
            return; 
            });
};

var findById = function(req, cb)
{
    Category.findById(req.body.id).exec(function(err, category){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (category)
        {
            result.success = true;
            result.error = undefined;
            result.data =  category.viewModel();
            cb(result); 
        }
        else
        {
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result); 
        }
    });
};

var findByCode = function(req, cb)
{
    Category.find({"code" : "^" + req.body.code, "spaceId" : req.spaceId}).exec(function(err, category){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (category)
        {
            result.success = true;
            result.error = undefined;
            result.data =  category.viewModel();
            cb(result); 
        }
        else
        {
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result); 
        }
    });
};

var addCategory = function(req, cb)
{
    var cat = new Category({
        sys : {},
        code : req.body.code,
        name : req.body.name,
        shortDesc : req.body.shortDesc,
        longDesc : req.body.longDesc,
        items : req.body.items,
        image : req.body.image
    });
    cat.sys.type = "category";
    cat.sys.issuer = req.userId;
    cat.sys.issueDate = new Date();
    cat.sys.spaceId = req.spaceId;
    cat.save(function(err){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            console.log(result);
            cb(result);       
            return; 
        }
        //Successfull. 
        result.success = true;
        result.error = undefined;
        result.data =  cat.viewModel();
        cb(result); 
    });
};

var deleteCategory = function(req, cb)
{
    Category.findById(req.body.id).exec(function(err, category){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        else
        {
            if (!category)
            {
                result.success = false;
                result.data =  undefined;
                result.error = undefined;
                cb(result);       
                return; 
            }
            Category.remove({_id : req.body.id}, (err)=>{
                var result = {success : false, data : null, error : null };
                if (err)
                {
                    result.success = false;
                    result.data =  undefined;
                    result.error = err;
                    cb(result);       
                    return; 
                }
                else
                {
                    result.success = true;
                    result.data =  undefined;
                    result.error = undefined;
                    cb(result);       
                    return; 
                }
            });
        }
    });
};

var updateCategory = function(req, cb)
{
     Category.findById(req.body.id).exec(function(err, category){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (category)
        {
            category.code = req.body.code;
            category.name = req.body.name;
            category.shortDesc = req.body.shortDesc;
            category.longDesc = req.body.longDesc;
            category.items = req.body.items;
            category.image = req.body.image;
            category.contentTypes = req.body.contentTypes;
            category.save(function(err){
                if(err)
                {
                    result.success = false;
                    result.data =  undefined;
                    result.error = err;
                    cb(result);       
                    return; 
                }
                //Successfull. 
                //Publish user profile updated event
                Category.findById(req.body.id).exec(function(err, category){
                    if(err)
                    {
                        result.success = false;
                        result.data =  undefined;
                        result.error = err;
                        cb(result);       
                        return; 
                    }
                    result.success = true;
                    result.error = undefined;
                    result.data =  category.viewModel();
                    cb(result); 
                });
            });
            return;
        }
        else
        {
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result);       
            return; 
        }
    });
};
exports.getcategories = getcatgories;
exports.findbyid = findById;
exports.findbycode = findByCode;
exports.addcategory = addCategory;
exports.deletecategory = deleteCategory;
exports.updatecategory = updateCategory;