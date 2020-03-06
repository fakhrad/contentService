const Assets = require("../models/asset");
const Status = require("../models/status");
var uniqid = require("uniqid");

var findAll = function (req, cb) {
  if (!req.spaceId) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
  }
  var skip = req.query ? req.query.skip || 0 : 0;
  var limit = req.query ? req.query.limit || 10000 : 10000;
  var sort = req.query ? req.query.sort || "-sys.issueDate" : "-sys.issueDate";
  if (req.query) {
    delete req.query.skip;
    delete req.query.limit;
    delete req.query.sort;
  }
  Assets.find({
      "sys.spaceId": req.spaceId
    })
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec(function (err, assets) {
      console.log(assets);
      var result = {
        success: false,
        data: null,
        error: null
      };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (assets) {
        result.success = true;
        result.error = undefined;
        result.data = assets;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};

var filter = function (req, cb) {
  var skip = req.query ? parseInt(req.query.skip) || 0 : 0;
  if (skip == undefined)
    skip = 0;
  var limit = req.query ? parseInt(req.query.limit) || 10000 : 10000;
  if (limit == undefined)
    limit = 10000;
  var sort = req.query ? req.query.sort || "-sys.issueDate" : "-sys.issueDate";
  if (req.query) {
    delete req.query.skip;
    delete req.query.limit;
    delete req.query.sort;
  }
  var st = "",
    ft = "";
  if (req.query.fileType) ft = req.query.fileType.split(",");
  if (req.query.status) st = req.query.status.split(",");
  var flt = {
    "sys.spaceId": req.spaceId,
    fileType: {
      $in: ft
    },
    status: {
      $in: st
    }
  };
  if (!req.query.fileType) delete flt.fileType;
  if (!req.query.status) delete flt.status;
  console.log(flt);
  Assets.find(flt)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec(function (err, Assets) {
      var result = {
        success: false,
        data: null,
        error: null
      };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (Assets) {
        result.success = true;
        result.error = undefined;
        result.data = Assets;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};

var findById = function (req, cb) {
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      result.success = true;
      result.error = undefined;
      result.data = asset;
      cb(result);
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
    }
  });
};

var addAsset = function (req, cb) {
  var asset = new Assets({
    sys: {},
    name: req.body.name,
    title: req.body.title,
    fileType: req.body.fileType,
    description: req.body.description,
    url: req.body.url,
    statusLog: []
  });

  var newStatus = {};
  newStatus.code = "draft";
  newStatus.applyDate = new Date();
  newStatus.user = req.userId;
  newStatus.description = "Item created";
  asset.status = "draft";
  asset.statusLog.push(newStatus);

  asset.sys.type = "asset";
  asset.sys.link = uniqid();
  asset.sys.issuer = req.userId;
  asset.sys.issueDate = new Date();
  asset.sys.spaceId = req.spaceId;

  asset.save(function (err) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    //Successfull.
    //Publish user registered event
    result.success = true;
    result.error = undefined;
    result.data = asset;
    cb(result);
  });
};

var deleteAsset = function (req, cb) {
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      Assets.remove({
        _id: asset._id
      }, function (err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        }
        //Successfull.
        //Publish user account deleted event
        result.success = true;
        result.data = {
          message: "Deleted successfully"
        };
        result.error = undefined;
        cb(result);
        return;
      });
      return;
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
      return;
    }
  });
};

var updateAsset = function (req, cb) {
  console.log("asset update started");
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      (asset.name = req.body.name), (asset.title = req.body.title);
      (asset.fileType = req.body.fileType),
      (asset.description = req.body.description),
      (asset.url = req.body.url);

      if (asset.status != "draft") {
        var newStatus = {};
        newStatus.code = "changed";
        newStatus.applyDate = new Date();
        newStatus.user = req.userId;
        newStatus.description = "Item updated";
        asset.status = "changed";
        asset.statusLog.push(newStatus);
      }
      asset.sys.lastUpdater = req.userId;
      asset.sys.lastUpdateTime = new Date();
      console.log(req);

      asset.save(function (err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          result.success = true;
          result.data = asset;
          result.error = undefined;
          cb(result);
          return;
        }
      });
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
      return;
    }
  });
};

var publishAsset = function (req, cb) {
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      console.log(req);
      asset.publish(req.body.userId, req.body.description, function (err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          result.success = true;
          result.data = asset;
          result.error = undefined;
          cb(result);
          return;
        }
      });
      return;
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
      return;
    }
  });
};
var unPublishAsset = function (req, cb) {
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      asset.unPublish(function (err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          result.success = true;
          result.data = asset;
          result.error = undefined;
          cb(result);
          return;
        }
      });
      return;
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
      return;
    }
  });
};
var archiveAsset = function (req, cb) {
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      asset.archive(req.userId, req.body.description, function (err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          result.success = true;
          result.data = asset;
          result.error = undefined;
          cb(result);
          return;
        }
      });
      return;
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
      return;
    }
  });
};
var unArchiveAsset = function (req, cb) {
  Assets.findById(req.body.id).exec(function (err, asset) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (asset) {
      asset.unArchive(function (err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          result.success = true;
          result.data = asset;
          result.error = undefined;
          cb(result);
          return;
        }
      });
      return;
    } else {
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      cb(result);
      return;
    }
  });
};

var countAll = function (req, cb) {
  Assets.where({
      "sys.spaceId": req.spaceId
    })
    .countDocuments(function (err, contentTypes) {
      var result = {
        success: false,
        data: null,
        error: null
      };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      result.success = true;
      result.error = undefined;
      result.data = {
        count: contentTypes,
        limits: 1000
      };
      cb(result);
    });
};

var assetsByType = function (req, cb) {
  var query = {
    "sys.spaceId": req.spaceId
  }
  const aggregatorOpts = [{
      $match: query
    }, {
      $unwind: "$fileType"
    },
    {
      $group: {
        _id: "$fileType",
        count: {
          $sum: 1
        }
      }
    }
  ]
  console.log(aggregatorOpts)
  Assets.aggregate(aggregatorOpts, function (err, contents) {
    var result = {
      success: false,
      data: null,
      error: null
    };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    result.success = true;
    result.error = undefined;
    result.data = contents;
    cb(result);
  });
};

var getRecentItems = function (req, cb) {
  var query = {
    "sys.spaceId": req.spaceId
  }
  var skip = req.body ? req.body.skip || 0 : 0;
  var limit = req.body ? req.body.limit || 10 : 10;
  var sort = req.body ? req.body.sort || "-sys.issueDate" : "-sys.issueDate";
  if (req.body) {
    delete req.body.skip;
    delete req.body.limit;
    delete req.body.sort;
  }
  Assets.find(query)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort(sort)
    .exec(function (err, assets) {
      var result = {
        success: false,
        data: null,
        error: null
      };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (assets) {
        result.success = true;
        result.error = undefined;
        result.data = assets;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
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
exports.count = countAll;
exports.assetsbytype = assetsByType;
exports.getRecentItems = getRecentItems;