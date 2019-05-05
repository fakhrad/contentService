const Assets = require('../models/asset');

var findAll = function(req, cb)
{
    Assets.find({"sys.spaceId" : req.spaceId}).exec(function(err, Assets){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (Assets)
        {
            result.success = true;
            result.error = undefined;
            result.data =  Assets;
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

var filter = function(req, cb)
{
    var flt = {};
    if (req.body.fileType)
        flt.fileType = req.body.fileType;
    if (req.body.status)
        flt.status = req.body.status;
    Assets.find(flt).exec(function(err, Assets){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (Assets)
        {
            result.success = true;
            result.error = undefined;
            result.data =  Assets;
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
    Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            result.success = true;
            result.error = undefined;
            result.data =  asset;
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

var addAsset = function(req, cb)
{
    var asset = new Assets({
        sys : {},
        name: req.body.name,
        title : req.body.title,
        fileType: req.body.fileType,
        description: req.body.description,
        url : req.body.url
    });

    asset.sys.type = "asset";
    asset.sys.spaceId = req.spaceid;
    asset.sys.issuer = req.userId;
    asset.sys.issueDate = new Date();
    asset.sys.spaceId = req.spaceId;
    asset.save(function(err){
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
        result.data =  asset;
        cb(result); 
    });
};

var deleteAsset = function(req, cb)
{
     Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            Assets.deleteOne(asset, function(err){
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

var updateAsset = function(req, cb)
{
    console.log(req);
     Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            asset.name =  req.body.name,
            asset.title = req.body.title;
            asset.fileType = req.body.fileType,
            asset.description = req.body.description,
            asset.url = req.body.url
            asset.save(function(err){
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
                    result.data =  asset;
                    result.error = undefined;
                    cb(result);       
                    return; 
                }
            });
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

var publishAsset = function(req, cb)
{
     Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            console.log(req);
            asset.publish(req.body.userId, req.body.description, function(err){
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
                    result.data =  asset;
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
var unPublishAsset = function(req, cb)
{
     Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            asset.unPublish(function(err){
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
                    result.data =  asset;
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
var archiveAsset = function(req, cb)
{
     Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            asset.archive(function(err){
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
                    result.data =  asset;
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
var unArchiveAsset = function(req, cb)
{
     Assets.findById(req.body.id).exec(function(err, asset){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (asset)
        {
            asset.unArchive(function(err){
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
                    result.data =  asset;
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
exports.add = addAsset;
exports.remove = deleteAsset;
exports.update = updateAsset;
exports.publish = publishAsset;
exports.unPublish = unPublishAsset;
exports.archive = archiveAsset;
exports.unArchive = unArchiveAsset;
exports.filter = filter;