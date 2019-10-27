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
var contentSubmitted = require("../events/contents/OnContentSubmitted");

var newfilter = function(req, res, next) {
  if (!req.body.contentType) throw new Error("Invalid contentType");
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
  var skip = req.query ? req.query.skip || 0 : 0;
  var limit = req.query ? req.query.limit || 10000 : 10000;
  var sort = req.query ? req.query.sort || "-sys.issueDate" : "-sys.issueDate";
  if (req.query) {
    delete req.query.skip;
    delete req.query.limit;
    delete req.query.sort;
  }
  var c = undefined,
    ct,
    st;
  if (req.body.contentType) ct = req.body.contentType.split(",");
  if (req.body.status) st = req.body.status.split(",");
  var flt = {
    "sys.spaceId": req.spaceId,
    contentType: { $in: ct },
    status: { $in: st }
  };
  if (req.body.name)
    flt["fields.name"] = { $regex: ".*" + req.body.name + ".*" };
  if (!req.body.contentType) delete flt.contentType;
  if (!req.body.status) delete flt.status;
  console.log(flt);
  Contents.find(flt)
    .populate("contentType", "title media")
    .select("fields.name fields.description status sys contentType")
    .skip(skip)
    .limit(limit)
    .sort(sort)
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
  var skip = req.query ? req.query.skip || 0 : 0;
  var limit = req.query ? req.query.limit || 10000 : 10000;
  var sort = req.query ? req.query.sort || "-sys.issueDate" : "-sys.issueDate";
  if (req.query) {
    delete req.query.skip;
    delete req.query.limit;
    delete req.query.sort;
  }
  Contents.find({ "sys.spaceId": req.spaceId })
    .populate("contentType", "title media")
    .select("fields.name fields.description status sys contentType")
    .skip(skip)
    .limit(limit)
    .sort(sort)
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
  var skip = req.query ? req.query.skip || 0 : 0;
  var limit = req.query ? req.query.limit || 10000 : 10000;
  var sort = req.query ? req.query.sort || "-sys.issueDate" : "-sys.issueDate";
  if (req.query) {
    delete req.query.skip;
    delete req.query.limit;
    delete req.query.sort;
  }
  Contents.find({ "sys.spaceId": req.spaceId })
    .populate("contentType", "title media")
    .select("fields.name fields.description status sys contentType")
    .skip(skip)
    .limit(limit)
    .sort(sort)
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

      switch (field.type) {
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
    var d = req.body;
    var content = new Contents({
      sys: {},
      fields: {},
      contentType: req.body.contentType,
      status: "published",
      statusLog: []
    });

    var newStatus = {};
    newStatus.code = "published";
    newStatus.applyDate = new Date();
    newStatus.user = req.userId;
    newStatus.description = "Item created";
    content.status = "published";
    content.statusLog.push(newStatus);

    content.sys.type = "content";
    content.sys.link = uniqid();
    content.sys.spaceId = req.spaceId;
    content.sys.issuer = req.userId;
    content.sys.issueDate = new Date();
    if (body) content.fields = body;
    var sendMail = false;
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
  });
};

var submit = function(req, cb) {
  console.log("submit content started");
  addContent(req, data => {
    //Publish content submitted event
    console.log("publish submit content event");
    contentSubmitted.OnContentSubmitted().call(data);
    if (cb) cb(data);
  });
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

var partialUpdateContent = function(req, cb) {
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

exports.query = function(req, cb) {
  console.log(req.body);
  var skip = parseInt(req.body.skip) || 0;
  delete req.body.skip;
  var limit = parseInt(req.body.limit) || 100;
  delete req.body.limit;
  var sort = req.body.sort || "-sys.issueDate";
  delete req.body.sort;
  Contents.find(req.body)
    .select("fields sys.issuer, sys.issueDate _id, status")
    .populate("contentType", "_id title")
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec((err, cts) => {
      if (err) {
        cb({ success: false, error: err });
        return;
      }
      try {
        var ctypes = [];
        for (var i = 0; i < cts.length; i++) {
          var ct = cts[i].contentType._id.toString();
          if (ctypes.indexOf(ct) == -1) ctypes.push(ct);
        }
        var relfieldarr = {};
        var ids = [];
        ContentTypes.find({ _id: { $in: ctypes } }).exec((err, ttypes) => {
          if (err) {
            cb(cts);
            return;
          } else {
            ttypes.forEach(ctype => {
              var relfields = [];
              for (var field in ctype.fields) {
                if (ctype.fields[field].type === "reference") {
                  var references = ctype.fields[field].references;
                  if (references) {
                    references.forEach(ref => {
                      relfields.push({
                        name: ctype.fields[field].name,
                        ctype: ref,
                        select: ctype.fields[field].fields
                      });
                    });
                  }
                }
              }
              relfieldarr[ctype._id.toString()] = relfields;
              for (var i = 0; i < cts.length; i++) {
                content = cts[i];
                if (
                  content.contentType._id.toString() == ctype._id.toString()
                ) {
                  if (relfields.length > 0) {
                    relfields.forEach(fld => {
                      if (
                        content.fields[fld.name] &&
                        content.fields[fld.name].length > 0
                      ) {
                        if (isArray(content.fields[fld.name])) {
                          content.fields[fld.name].forEach(item => {
                            if (item.length > 0 && ids.indexOf(item) == -1)
                              ids.push(item);
                          });
                        } else {
                          if (ids.indexOf(content.fields[fld.name]) == -1)
                            ids.push(content.fields[fld.name]);
                        }
                      }
                    });
                  }
                }
              }
            });
            Contents.find({
              _id: { $in: ids }
            })
              .select("fields _id")
              .exec((err, rels) => {
                if (err) {
                  cb(cts);
                  return;
                }
                for (var l = 0; l < ttypes.length; l++) {
                  var ctype = ttypes[l];
                  relfields = relfieldarr[ctype._id.toString()];
                  console.log(relfields);
                  relfields.forEach(fld => {
                    for (var s = 0; s < cts.length; s++) {
                      content = cts[s];
                      if (
                        content.contentType._id.toString() ==
                        ctype._id.toString()
                      ) {
                        if (
                          content.fields[fld.name] &&
                          content.fields[fld.name].length > 0
                        ) {
                          if (isArray(content.fields[fld.name])) {
                            for (
                              i = 0;
                              i < content.fields[fld.name].length;
                              i++
                            ) {
                              var item = content.fields[fld.name][i];
                              var row = rels.filter(
                                a => a._id.toString() === item.toString()
                              );
                              if (
                                row.length > 0 &&
                                fld.select &&
                                fld.select.length > 0
                              ) {
                                var rw = {};
                                rw._id = row[0]._id;
                                rw.fields = {};
                                for (var j = 0; j < fld.select.length; j++) {
                                  f = fld.select[j];
                                  var c = row[0].fields[f];
                                  rw.fields[f] = c;
                                }
                                content.fields[fld.name][i] = rw;
                              }
                            }
                          } else {
                            var row = rels.filter(
                              a =>
                                a._id.toString() ===
                                content.fields[fld.name].toString()
                            );
                            if (
                              row.length > 0 &&
                              fld.select &&
                              fld.select.length > 0
                            ) {
                              var rw = {};
                              rw.fields = {};

                              rw._id = row[0]._id;
                              for (var j = 0; j < fld.select.length; j++) {
                                f = fld.select[j];
                                rw.fields[f] = row[0].fields[f];
                              }
                              console.log(rw);
                              content.fields[fld.name] = rw;
                            }
                          }
                        }
                      }
                    }
                  });
                }
                cb(cts);
              });
          }
        });
      } catch (e) {
        console.log(e);
        cb(cts);
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
exports.partialupdate = partialUpdateContent;
exports.submit = submit;
exports.load = loadContents;
exports.publish = publishContent;
exports.unPublish = unPublishContent;
exports.archive = archiveContent;
exports.unArchive = unArchiveContent;
