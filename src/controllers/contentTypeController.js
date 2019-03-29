var ContentTypes = require('../models/contentTypes'); 
var ContentTypes = require('../models/contentType'); 

var getContentTypes = function(req, cb)
{
     ContentTypes.find({"clientId" : req.body.clientId}).exec(function(err, contentTypes){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        result.success = true;
        result.error = undefined;
        var rootc = [];
        categories.forEach(cat => {
            if (cat.parentId === undefined)
            {
                rootc.push(cat);
                buildTree(cat, contentTypes);
            }
            cat.clientId = undefined
            cat.longDesc = undefined;
        });
        result.data = rootc;
        cb(result); 
    });
};

var findById = function(req, cb)
{
    ContentTypes.findById(req.body.id).exec(function(err, contentTypes){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (contentTypes)
        {
            result.success = true;
            result.error = undefined;
            result.data =  contentTypes;
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

var addContentTypes = function(req, cb)
{
    var cat = new ContentTypes({
        displayName : req.body.displayName,
        name : req.body.name,
        description : req.body.description,
        localize : req.body.localize,
        template : req.body.template,
        image : req.body.image,
        fields : req.body.fields
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

var updateContentType = function(req, cb)
{
     ContentTypes.findById(req.body.id).exec(function(err, contentType){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (contentType)
        {
            contentType.displayName = req.body.displayName;
            contentType.name = req.body.name;
            contentType.description = req.body.description;
            contentType.localize = req.body.localize;
            contentType.template = req.body.template;
            contentType.image = req.body.image;
            contentType.fields = req.body.fields;
            contentType.save(function(err){
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
                ContentType.findById(req.body.id).exec(function(err, contentType){
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
                    result.data =  contentType;
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
var deleteContentTypes = function(req, cb)
{
     ContentTypes.findByIdAndDelete(req.body.id).exec(function(err, result){
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
exports.getContentTypes = getContentTypes;
exports.findbyid = findById;
exports.addContentTypes = addContentTypes;
exports.updateContentType = updateContentType;
exports.deleteContentTypes = deleteContentTypes;