const Contents = require('../models/content');

var loadContents = function(req, cb)
{
    Contents.find({"sys.spaceId" : req.spaceId}).exec(function(err, contents){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (Contents)
        {
            result.success = true;
            result.error = undefined;
            result.data =  contents;
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

var findAll = function(req, cb)
{
    Contents.find({"sys.spaceId" : req.spaceId}).exec(function(err, contents){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (Contents)
        {
            result.success = true;
            result.error = undefined;
            result.data =  contents;
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
var findById = function(req, cb)
{
    Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            result.success = true;
            result.error = undefined;
            result.data =  content;
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

var addContent = function(req, cb)
{
    var content = new Contents({
        sys : {},
        fields: req.body.fields,
        contentType : req.body.contentType,
        category : req.body.category,
        status : "draft",
        statusLog : []
    });

    var newStatus = {}
    newStatus.code = "draft";
    newStatus.applyDate = new Date();
    newStatus.user = req.userId;
    newStatus.description = "Item created";
    content.status = "draft";
    content.statusLog.push(newStatus);

    content.sys.type = "content";
    content.sys.spaceId = req.spaceid;
    content.sys.issuer = req.userId;
    content.sys.issueDate = new Date();
    content.sys.spaceId = req.spaceId;

    content.save(function(err){
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
        //Publish user registered event
        result.success = true;
        result.error = undefined;
        result.data =  content;
        cb(result); 
    });
};

var deleteContent = function(req, cb)
{
     Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            Content.deleteOne(content, function(err){
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

var updateContent = function(req, cb)
{
     Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            content.fields = req.body.fields;
            content.category = req.body.catgory;
            if (content.status != "draft")
            {
                var newStatus = {}
                newStatus.code = "changed";
                newStatus.applyDate = new Date();
                newStatus.user = req.userId;
                newStatus.description = "Item updated";
                content.status = "changed";
                content.statusLog.push(newStatus);
            }
            content.sys.lastUpdater = req.userId;
            content.sys.lastUpdateTime = new Date();
            content.save(function(err){
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
                Content.findById(req.body.id).exec(function(err, content){
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
                    result.data =  content;
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

var publishContent = function(req, cb)
{
     Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            console.log(req);
            content.publish(req.body.userId, req.body.description, function(err){
                if(err)
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
                    result.data =  content;
                    result.error = undefined;
                    cb(result);       
                    return; 
                }
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
var unPublishContent = function(req, cb)
{
     Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            content.unPublish(function(err){
                if(err)
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
                    result.data =  content;
                    result.error = undefined;
                    cb(result);       
                    return; 
                }
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
var archiveContent = function(req, cb)
{
     Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            content.archive(req.userId, req.body.description, function(err){
                if(err)
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
                    result.data =  content;
                    result.error = undefined;
                    cb(result);       
                    return; 
                }
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
var unArchiveContent = function(req, cb)
{
     Contents.findById(req.body.id).exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (content)
        {
            content.unArchive(function(err){
                if(err)
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
                    result.data =  content;
                    result.error = undefined;
                    cb(result);       
                    return; 
                }
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

exports.getAll = findAll;
exports.findById = findById;
exports.add = addContent;
exports.delete = deleteContent;
exports.update = updateContent;
exports.load = loadContents;
exports.publish = publishContent;
exports.unPublish = unPublishContent;
exports.archive = archiveContent;
exports.unArchive = unArchiveContent;