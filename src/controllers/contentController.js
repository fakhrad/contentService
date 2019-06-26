const Contents = require('../models/content');
var uniqid = require('uniqid');
var contentCreated = require('../events/contents/OnContentCreated');
var contentPublised = require('../events/contents/OnContentPublished');
var contentArchived = require('../events/contents/OnContentArchived');
var contentRemoved = require('../events/contents/OnContentRemoved');
var contentUnArchived = require('../events/contents/OnContentUnArchived');
var contentUnPublished = require('../events/contents/OnContentUnPublished');
var contentUpdated = require('../events/contents/OnContentUpdated');

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
    Contents.find(flt).populate('contentType', "title media").populate('category', 'name').select("fields.name fields.description status sys category contentType").exec(function(err, contents){
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
    Contents.find({"sys.spaceId" : req.spaceId}).populate('contentType', "title media").populate('category', 'name').select("fields.name fields.description status sys category contentType")
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
    Contents.find({"sys.spaceId" : req.spaceId}).populate('contentType', "title media").populate('category', 'name').select("fields.name fields.description status sys category contentType").exec(function(err, contents){
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

var findByLink = function(req, cb)
{
    console.log(req);
    Contents.findOne({"sys.link" : req.body.link}).populate('contentType').populate('category').populate("sys.issuer").exec(function(err, content){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (request)
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
    console.log(req);
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
    content.sys.link = uniqid();
    content.sys.spaceId = req.spaceId;
    content.sys.issuer = req.userId;
    content.sys.issueDate = new Date();

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
        //Publish content created event
        contentCreated.OnContentCreated().call(content);
        result.success = true;
        result.error = undefined;
        result.data =  content;
        cb(result); 
    });
};

var submit = function(req, cb)
{
    if (request.body.content)
        this.update(req, cb);
    else
        this.addContent(req, cb);
}

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
                contentRemoved.OnContentCreated().call(content);
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
            content.category = req.body.category;
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
                contentUpdated.OnContentUpdated.call(content);
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
                    contentPublised.OnContentPublished.call(content);
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
                    contentUnPublished.OnContentUnPublished.call(content);
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
                    archiveContent.contentArchived.call(content);
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
                    contentUnArchived.OnContentUnArchived.call(content);
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
exports.findByLink = findByLink;
exports.add = addContent;
exports.delete = deleteContent;
exports.update = updateContent;
exports.submit = submit;
exports.load = loadContents;
exports.publish = publishContent;
exports.unPublish = unPublishContent;
exports.archive = archiveContent;
exports.unArchive = unArchiveContent;