var Category = require('../models/category'); 
var async = require('async')

function buildTree(parent, list, contentTypes)
{
    if (parent == undefined || list == undefined || (list != undefined && list.length == 0))
        return;
    parent.items = [];
    parent.data = [];
    list.forEach(cat => {
        if (cat.parentId == parent.id)
        {
            parent.items.push(cat);
            parent.data = [];
            buildTree(cat, list, products);
        }
    });
    contentTypes.forEach(ct => {
        if (ct.categoryId == parent.id)
        {
            var obj = {};
            obj.sys = ct.sys;
            obj.name = ct.name;
            obj.displayName = ct.displayName;
            parent.data.push(obj);
        }
    });
}

var getcatgories = function(req, cb)
{
    async.parallel(
        {
            categories : function(callback) {Category.find({clientId : req.body.clientId}).exec(callback)},
            contentTypes : function(callback) {Product.find({clientId : req.body.clientId}).exec(callback)}
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
            var categories = results.categories;
            var rootc = [];
            var contentTypes = results.contentTypes;
            
            if (contentTypes && categories)
            {
                categories.forEach(cat => {
                    if (cat.parentId === undefined)
                    {
                        rootc.push(cat);
                        buildTree(cat, categories, contentTypes);
                    }
                    cat.clientId = undefined
                    cat.longDesc = undefined;
                });
                result.success = true;
                result.error = undefined;
                result.data =  rootc;
                cb(result); 
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
            result.data =  category;
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
    Category.find({"code" : "^" + req.body.code, "clientId" : req.body.clientId}).exec(function(err, category){
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
            result.data =  category;
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

var findByParentId = function(req, cb)
{
    Category.find({"parentId" : req.body.parentId, "clientId" : req.body.clientId}).exec(function(err, categories){
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
            result.error = undefined;
            result.data =  categories;
            cb(result); 
        }
    });
};

var addCategory = function(req, cb)
{
    var cat = new Category({
        code : req.body.code,
        name : req.body.name,
        shortDesc : req.body.shortDesc,
        longDesc : req.body.longDesc,
        parentId : req.body.parentId,
        image : req.body.image
    });
    cat.save(function(err){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        //Successfull. 
        //Publish product registered event
        result.success = true;
        result.error = undefined;
        result.data =  cat;
        cb(result); 
    });
};

var deleteCategory = function(req, cb)
{
     Category.findByIdAndDelete(req.body.id).exec(function(err, result){
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
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result);       
            return; 
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
            category.parentId = req.body.parentId;
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
                    result.data =  category;
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
exports.getcatgories = getcatgories;
exports.findbyid = findById;
exports.findbycode = findByCode;
exports.findbyparentid = findByParentId;
exports.addcategory = addCategory;
exports.deletecategory = deleteCategory;
exports.updatecategory = updateCategory;