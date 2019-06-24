var ContentTypes = require('../models/contentType'); 
var Space = require('../models/space'); 
var uniqid = require('uniqid');

var getContentTypes = function(req, cb)
{
     ContentTypes.find({"sys.spaceId" : req.spaceId}).exec(function(err, contentTypes){
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
        result.data = contentTypes;
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
    var result = {success : false, data : null, error : null };
    if (!req.body.name) 
    {
        result.success = false;
        result.data =  undefined;
        result.error = "Name cannot have empty value";
        cb(result);       
        return; 
    }  
    var cat = new ContentTypes({
        sys : {},
        displayName : req.body.displayName,
        name : req.body.name,
        title : req.body.title,
        description : req.body.description,
        versioning : req.body.versioning,
        template : req.body.template,
        media : req.body.media,
        allowCustomFields : req.body.allowCustomFields,
        accessRight : req.body.accessRight,
        categorization : req.body.categorization,
        fields : req.body.fields
    });
    cat.sys.type = "contentType";
    cat.sys.link = uniqid();
    cat.sys.issuer = req.userId;
    cat.sys.issueDate = new Date();
    cat.sys.spaceId = req.spaceId;
    console.log(cat);
    cat.save(function(err){
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            console.log(err);
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
    // ContentTypes.find({"sys.spaceId" : req.spaceId, name : req.body.name}).exec((err, res)=>{
    //     if (err || res)
    //     {
    //         console.log(res);
    //         result.success = false;
    //         result.data =  undefined;
    //         result.error = "Name must be unique.";
    //         cb(result);       
    //         return; 
    //     } 
    //     else
    //     {
            
    //     } 
    // }); 
};

var updateContentType = function(req, cb)
{
    console.log(req.body);
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
            contentType.name = req.body.name;
            contentType.title = req.body.title;
            contentType.description = req.body.description;
            contentType.versioning = req.body.versioning;
            contentType.template = req.body.template;
            contentType.media = req.body.media;
            contentType.allowCustomFields = req.body.allowCustomFields,
            contentType.accessRight = req.body.accessRight;
            contentType.categorization = req.body.categorization,
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
                ContentTypes.findById(req.body.id).exec(function(err, contentType){
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
            ContentTypes.remove({_id : contentType._id}, function(err){
                if(err)
                {
                    result.success = false;
                    result.data =  undefined;
                    result.error = err;
                    cb(result);       
                    return; 
                }
                //Successfull. 
                //Publish user account deleted event
                result.success = true;
                result.data =  {"message" : "Deleted successfully"};
                result.error = undefined;
                cb(result);       
                return; 
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
exports.getContentTypes = getContentTypes;
exports.findbyid = findById;
exports.addContentTypes = addContentTypes;
exports.updateContentType = updateContentType;
exports.deleteContentTypes = deleteContentTypes;