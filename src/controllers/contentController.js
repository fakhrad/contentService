const Contents = require('../models/content');

var filter = function(req, cb)
{
    var c= undefined, ct, st;
    if (req.body.category)
        c = req.body.category.split(',');
    if (req.body.contentType)
        ct = req.body.contentType.split(',');
    if (req.body.status)
        st = req.body.status.split(',');
    var flt = {
        'sys.spaceId' : req.spaceId,
        name : req.body.name ,
        category : { $in : c} ,
        contentType : { $in : ct},
        status : { $in : st} 
    };
    if (!req.body.name)
        delete flt.name;
    if (!req.body.category)
        delete flt.category;
    if (!req.body.contentType)
        delete flt.contentType;
    if (!req.body.status)
        delete flt.status;
    console.log(flt);
    Contents.find(flt).populate('contentType', "title").populate('category', 'name').select("name status sys category contentType").exec(function(err, contents){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (contents)
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

var loadContents = function(req, cb)
{
    Contents.find({"sys.spaceId" : req.spaceId}).populate('contentType', "title").populate('category', 'name').select("name status sys category contentType")
    .exec(function(err, contents){
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
    Contents.find({"sys.spaceId" : req.spaceId}).populate('contentType', "title").populate('category', 'name').select("name status sys category contentType").exec(function(err, contents){
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
    Contents.findById(req.body.id).populate('contentType').populate('category').exec(function(err, content){
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
        requestId : req.body.requestId,
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
            Contents.remove({_id : content._id}, function(err){
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
    if (!req.body)
    {
        var result = {success : false, data : null, error : null };
            if (err)
            {
                result.success = false;
                result.data =  undefined;
                result.error = "Invalid request";
                cb(result);       
                return; 
            }
    }
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
             if (req.body.contentType)
                content.contentType = req.body.contentType;
            content.sys.lastUpdateTime = new Date();
            content.requestId = req.body.requestId;
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
                Contents.findById(req.body.id).exec(function(err, content){
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
                    return
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
exports.filter = filter;
exports.findById = findById;
exports.add = addContent;
exports.delete = deleteContent;
exports.update = updateContent;
exports.load = loadContents;
exports.publish = publishContent;
exports.unPublish = unPublishContent;
exports.archive = archiveContent;
exports.unArchive = unArchiveContent;