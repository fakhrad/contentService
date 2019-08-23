const Contents = require("../models/content");
const ContentTypes = require("../models/contentType");
var uniqid = require("uniqid");
var contentCreated = require("../events/contents/OnContentCreated");
var contentPublised = require("../events/contents/OnContentPublished");
var contentArchived = require("../events/contents/OnContentArchived");
var contentRemoved = require("../events/contents/OnContentRemoved");
var contentUnArchived = require("../events/contents/OnContentUnArchived");
var contentUnPublished = require("../events/contents/OnContentUnPublished");
var contentUpdated = require("../events/contents/OnContentUpdated");

var newfilter = function(req, res, next) {
  if (!req.query.contentType) throw new Error("Invalid contentType");
  console.log(req.query);
  Contents.find(req.query)
    .select("fields sys.issuer, sys.issueDate _id, status")
    .exec((err, cts) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }
      res.send({ success: true, error: undefined, data: cts });
    });
};
var filter = function(req, cb) {
  var c = undefined,
    ct,
    st;
  if (req.body.contentType) ct = req.body.contentType.split(",");
  if (req.body.status) st = req.body.status.split(",");
  var flt = {
    "sys.spaceId": req.spaceId,
    name: req.body.name,
    contentType: { $in: ct },
    status: { $in: st }
  };
  if (!req.body.name) delete flt.name;
  if (!req.body.contentType) delete flt.contentType;
  if (!req.body.status) delete flt.status;
  console.log(flt);
  Contents.find(flt)
    .populate("contentType", "title media")
    .select("fields.name fields.description status sys contentType")
    .exec(function(err, contents) {
      var result = { success: false, data: null, error: null };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (contents) {
        result.success = true;
        result.error = undefined;
        result.data = contents;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};

var loadContents = function(req, cb) {
  Contents.find({ "sys.spaceId": req.spaceId })
    .populate("contentType", "title media")
    .select("fields.name fields.description status sys contentType")
    .exec(function(err, contents) {
      var result = { success: false, data: null, error: null };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (Contents) {
        result.success = true;
        result.error = undefined;
        result.data = contents;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};

var findAll = function(req, cb) {
  Contents.find({ "sys.spaceId": req.spaceId })
    .populate("contentType", "title media")
    .select("fields.name fields.description status sys contentType")
    .exec(function(err, contents) {
      var result = { success: false, data: null, error: null };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (Contents) {
        result.success = true;
        result.error = undefined;
        result.data = contents;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};
var findById = function(req, cb) {
  Contents.findById(req.body.id)
    .populate("contentType")
    .exec(function(err, content) {
      var result = { success: false, data: null, error: null };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (content) {
        result.success = true;
        result.error = undefined;
        result.data = content;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};

var findByLink = function(req, cb) {
  console.log(req);
  Contents.findOne({ "sys.link": req.body.link })
    .populate("contentType")
    .populate("sys.issuer")
    .exec(function(err, content) {
      var result = { success: false, data: null, error: null };
      if (err) {
        result.success = false;
        result.data = undefined;
        result.error = err;
        cb(result);
        return;
      }
      if (request) {
        result.success = true;
        result.error = undefined;

        result.data = content;
        cb(result);
      } else {
        result.success = false;
        result.data = undefined;
        result.error = undefined;
        cb(result);
      }
    });
};

/* 
{
    "_id": {
        "$oid": "5d3af3a1a9602900177a5056"
    },
    "versioning": true,
    "media": [
        {
            "en": "https://app-spanel.herokuapp.com/asset/download/file-1560064758966.jpg",
            "fa": "https://app-spanel.herokuapp.com/asset/download/file-1560064758966.jpg",
            "id": 0.08671568372870908
        }
    ],
    "allowCustomFields": true,
    "accessRight": false,
    "fields": [
        {
            "name": "name",
            "title": {
                "fa": "نام حوزه",
                "en": "نام حوزه"
            },
            "description": {
                "fa": "نام حوزه فعالیت",
                "en": "نام حوزه فعالیت"
            },
            "type": "string",
            "isBase": true,
            "isTranslate": true,
            "isRequired": true,
            "allowEdit": false,
            "inVisible": false,
            "appearance": "text",
            "isMultiLine": false
        },
        {
            "name": "thubmnail",
            "title": {
                "fa": "تصویر نمایه",
                "en": "تصویر نمایه"
            },
            "description": {
                "fa": "تصویر نمایه مربوط به حوزه فعالیت",
                "en": "تصویر نمایه مربوط به حوزه فعالیت"
            },
            "type": "media",
            "isTranslate": false,
            "appearance": "default",
            "isRequired": false,
            "inVisible": false,
            "isList": false,
            "mediaType": [
                "image"
            ]
        }
    ],
    "status": true,
    "sys": {
        "issueDate": {
            "$date": "2019-07-26T12:35:45.595Z"
        },
        "type": "contentType",
        "link": "fyga7injyk39zjv",
        "issuer": {
            "$oid": "5cf3883dafd0b9001708b27e"
        },
        "spaceId": "5cf3883dcce4de00174d48cf"
    },
    "name": "businessfields",
    "title": {
        "fa": "حوزه های فعالیت تجاری",
        "en": "حوزه های فعالیت تجاری"
    },
    "description": {
        "fa": "حوزه های فعالیت تجاری",
        "en": "حوزه های فعالیت تجاری"
    },
    "template": "dataCollection",
    "__v": 9
}
*/

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

var checkGeneralFieldValidation = function(field, value, errors) {
  if (
    field.isRequired &&
    (value == undefined || value == null || value == "undefined")
  ) {
    var isRequired = {
      field: field.name,
      message: field.name + " is required"
    };
    errors.push(isRequired);
    return false;
  }
  return true;
};

var checkStringFieldValidation = function(field, value, errors) {
  if (
    field.isRequired &&
    (value == undefined ||
      value == null ||
      value == "undefined" ||
      (value != undefined && value != null && value.length == 0))
  ) {
    var isRequired = {
      field: field.name,
      message: field.name + " is required"
    };
    errors.push(isRequired);
    return false;
  }
  return true;
};
var addContent = function(req, cb) {
  console.log(JSON.stringify(req));
  ContentTypes.findById(req.body.contentType).exec((err, ctype) => {
    if (err) {
      cb({ success: false, error: err });
      return;
    }
    if (!ctype) {
      cb({
        success: false,
        error: "ContentType not found for this space"
      });
      return;
    }
    var body = {};
    for (i = 0; i < ctype.fields.length; i++) {
      var field = ctype.fields[i];
      var value = req.body.fields[field.name];
      var errors = [];

      switch (ctype.fields[field].type) {
        case "string":
          checkStringFieldValidation(field, value, errors);
          break;
        default:
          checkGeneralFieldValidation(field, value, errors);
      }
      if (value == undefined || value == "undefined") value = null;
      body[field["name"]] = value;
    }
    console.log(body);
    if (errors.length > 0) {
      cb({ success: false, error: errors, code: 422 });
      return;
    }
  });
  var d = req.body;
  var content = new Contents({
    sys: {},
    fields: {},
    contentType: req.body.contentType,
    status: "draft",
    statusLog: []
  });

  var newStatus = {};
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
  if (req.body) content.fields = body;
  content.save(function(err) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    //Successfull.
    //Publish content created event
    contentCreated.OnContentCreated().call(content);
    result.success = true;
    result.error = undefined;
    result.data = content;
    //content.setfields(d);
    cb(result);
  });
};

var submit = function(req, cb) {
  if (request.body.content) this.update(req, cb);
  else this.addContent(req, cb);
};

var deleteContent = function(req, cb) {
  Contents.findById(req.body.id).exec(function(err, content) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (content) {
      Contents.remove({ _id: content._id }, function(err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        }
        //Successfull.
        //Publish user account deleted event
        contentRemoved.OnContentRemoved.call(content);
        result.success = true;
        result.data = { message: "Deleted successfully" };
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

var updateContent = function(req, cb) {
  if (!req.body) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = "Invalid request";
      cb(result);
      return;
    }
  }
  Contents.findById(req.body.id).exec(function(err, content) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (content) {
      var set = {};
      for (var fld in content.fields) {
        set[fld] = content.fields[fld];
      }
      for (var fld in req.body.fields) {
        set[fld] = req.body.fields[fld];
      }
      content.fields = set;
      if (content.status != "draft") {
        var newStatus = {};
        newStatus.code = "changed";
        newStatus.applyDate = new Date();
        newStatus.user = req.userId;
        newStatus.description = "Item updated";
        content.status = "changed";
        content.statusLog.push(newStatus);
      }
      content.sys.lastUpdater = req.userId;
      if (req.body.contentType) content.contentType = req.body.contentType;
      content.sys.lastUpdateTime = new Date();
      content.requestId = req.body.requestId;
      content.save(function(err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        }
        //Successfull.
        //Publish user profile updated event
        contentUpdated.OnContentUpdated.call(content);
        Contents.findById(req.body.id).exec(function(err, content) {
          if (err) {
            result.success = false;
            result.data = undefined;
            result.error = err;
            cb(result);
            return;
          }
          result.success = true;
          result.error = undefined;
          result.data = content;
          cb(result);
          return;
        });
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

var publishContent = function(req, cb) {
  Contents.findById(req.body.id).exec(function(err, content) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (content) {
      console.log(req);
      content.publish(req.body.userId, req.body.description, function(err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          contentPublised.OnContentPublished.call(content);
          result.success = true;
          result.data = content;
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
var unPublishContent = function(req, cb) {
  Contents.findById(req.body.id).exec(function(err, content) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (content) {
      content.unPublish(function(err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          contentUnPublished.OnContentUnPublished.call(content);
          result.success = true;
          result.data = content;
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
var archiveContent = function(req, cb) {
  Contents.findById(req.body.id).exec(function(err, content) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (content) {
      content.archive(req.userId, req.body.description, function(err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          contentArchived.OnContentArchived.call(content);
          result.success = true;
          result.data = content;
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
var unArchiveContent = function(req, cb) {
  Contents.findById(req.body.id).exec(function(err, content) {
    var result = { success: false, data: null, error: null };
    if (err) {
      result.success = false;
      result.data = undefined;
      result.error = err;
      cb(result);
      return;
    }
    if (content) {
      content.unArchive(function(err) {
        if (err) {
          result.success = false;
          result.data = undefined;
          result.error = err;
          cb(result);
          return;
        } else {
          contentUnArchived.OnContentUnArchived.call(content);
          result.success = true;
          result.data = content;
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
