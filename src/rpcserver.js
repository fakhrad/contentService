var amqp = require('amqplib/callback_api');
var db = require('./init-db');
const contentController = require('./controllers/contentController');
const ctypeController = require('./controllers/contentTypeController');
const assetController = require('./controllers/assetController');
var spaceController = require('./controllers/spaceController');
var adminController = require('./controllers/adminController');
var async = require('async');

var rabbitHost = process.env.RABBITMQ_HOST || "amqp://gvgeetrh:6SyWQAxDCpcdg1S0Dc-Up0sUxfmBUVZU@chimpanzee.rmq.cloudamqp.com/gvgeetrh";
//var rabbitHost = process.env.RABBITMQ_HOST || "amqp://localhost:5672";

var amqpConn = null;

function start() {
  console.log('Start connecting : ' + process.env.RABBITMQ_HOST);;
  amqp.connect(rabbitHost, (err, conn) => {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 5000);
    }
    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function () {
      console.error("[AMQP] reconnecting");
      //return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected();
  });
}

function whenConnected() {
  amqpConn.createChannel((err, ch) => {
    if (err) {
      console.error("[AMQP]", err.message);
      //return setTimeout(start, 1000);
    }
    ch.on("error", function (err) {
      console.error("[AMQP] channel error", err.message);
      //return setTimeout(start, 1000);
    });
    ch.on("close", function () {
      console.log("[AMQP] channel closed");
      //return setTimeout(start, 1000);
    });
    console.log('Client connected.');
    this.channel = ch;

    ch.prefetch(1);
    console.log('Content service broker started!');
    //Login API
    ch.assertQueue("getcontents", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.getAll(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });


    ch.assertQueue("getstats", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        console.log(req);
        try {
          async.parallel({
            contentTypes: function (callback) {
              ctypeController.count(req, (result) => {
                if (result.success)
                  callback(undefined, result.data)
                else
                  callback(result.error, undefined)
              });
            },
            contents: function (callback) {
              contentController.count(req, (result) => {
                if (result.success)
                  callback(undefined, result.data)
                else
                  callback(result.error, undefined)
              });
            },
            media: function (callback) {
              assetController.count(req, (result) => {
                if (result.success)
                  callback(undefined, result.data)
                else
                  callback(result.error, undefined)
              });
            }
          }, (err, results) => {
            if (err && err.length > 0) {
              onsole.log(ex);
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(err)), {
                correlationId: msg.properties.correlationId
              });
              ch.ack(msg);
            } else {
              ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(results)), {
                correlationId: msg.properties.correlationId
              });
              ch.ack(msg);
            }
          })

        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("getcontenttypescount", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.count(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("addcontenttype", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.addContentTypes(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("updatecontenttype", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.updateContentType(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("removecontenttype", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.deleteContentTypes(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getcontenttemplates", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.getContentTemplates(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("getcontenttypes", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.getContentTypes(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getcontenttypesbyid", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          ctypeController.findbyid(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("addasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.add(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("updateasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.update(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("removeasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.remove(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("getallassets", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.getAll(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("filterassets", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.filter(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getassetbyid", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.findById(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("publishasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.publish(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("unpublishasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.unPublish(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("archiveasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.archive(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("unarchiveasset", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.unArchive(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getrecentassets", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.getRecentItems(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("assetsbytype", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.assetsbytype(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getassetscount", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          assetController.count(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    //Contents Api

    ch.assertQueue("contentsbystatus", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.contentsByStatus(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getcontentsdailyinputs", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.dailyInputs(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getrecentcontents", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.getRecentItems(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("getcontentscount", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.count(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("querycontents", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.query(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("filtercontents", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.filter(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("getcontentbyid", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.findById(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("getcontentbylink", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.findByLink(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("addcontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.add(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("updatecontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.update(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("partialupdatecontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.partialupdate(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("removecontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.delete(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("removecontentbyfilter", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.deleteMany(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("getallcontents", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.getAll(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("publishcontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.publish(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("unpublishcontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.unPublish(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("archivecontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.archive(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    ch.assertQueue("unarchivecontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.unArchive(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });

    ch.assertQueue("submitcontent", {
      durable: false
    }, (err, q) => {
      ch.consume(q.queue, function reply(msg) {
        var req = JSON.parse(msg.content.toString('utf8'));
        try {
          contentController.submit(req, (result) => {
            ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), {
              correlationId: msg.properties.correlationId
            });
            ch.ack(msg);
          });
        } catch (ex) {
          console.log(ex);
          ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), {
            correlationId: msg.properties.correlationId
          });
          ch.ack(msg);
        }

      });
    });
    // //Requests Api

    // ch.assertQueue("filterrequests", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.filter(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("getrequestbyid", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.findById(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("getrequestbylink", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.findByLink(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("addrequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.add(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("updaterequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.update(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("removerequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.delete(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("getrequests", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.getAll(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("publishrequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.publish(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("unpublishrequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.unPublish(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("archiverequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.archive(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });
    // ch.assertQueue("unarchiverequest", {durable: false}, (err, q)=>{
    //   ch.consume(q.queue, function reply(msg) {
    //       var req = JSON.parse(msg.content.toString('utf8'));
    //       try{
    //         requestController.unArchive(req, (result)=>{
    //             ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //         });
    //       }
    //       catch(ex)
    //       {
    //         console.log(ex);
    //         ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(ex)), { correlationId: msg.properties.correlationId } );
    //             ch.ack(msg);
    //       } 

    //     });
    // });      

    //Exchanges
    var exchange = 'contentservice';

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    channel.assertExchange("adminauth", 'direct', {
      durable: false
    });

    ch.assertQueue("", {
      durable: false,
      exclusive: true
    }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "adminauth", "adminuserregistered")
        ch.consume(q.queue, function (msg) {
          // console.log(msg);
          var req = JSON.parse(msg.content.toString('utf8'));
          console.log("Admin user registered. creating space");
          try {
            async.parallel({
              "space": function (callback) {
                spaceController.createuserspace(req, callback)
              },
              "adminuser": function (callback) {
                adminController.registeruser(req, callback)
              },
            }, (err, results) => {

            });
          } catch (ex) {
            console.log(ex);
          }
        }, {
          noAck: true
        });
      }
    });

    ch.assertQueue("", {
      durable: false,
      exclusive: true
    }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "adminauth", "adminuserloggedout")
        ch.consume(q.queue, function (msg) {
          // console.log(msg);
          var req = JSON.parse(msg.content.toString('utf8'));
          console.log("Admin user logged out. deleting tokens");
          try {
            adminController.logout(req, () => {});
          } catch (ex) {
            console.log(ex);
          }
        }, {
          noAck: true
        });
      }
    });
    ch.assertQueue("", {
      durable: false,
      exclusive: true
    }, (err, q) => {
      if (!err) {
        ch.bindQueue(q.queue, "adminauth", "admintokencreated")
        ch.consume(q.queue, function (msg) {
          // console.log(msg);
          var req = JSON.parse(msg.content.toString('utf8'));
          console.log("Admin user token created. adding tokens");
          try {
            adminController.savetoken(req, () => {});
          } catch (ex) {
            console.log(ex);
          }
        }, {
          noAck: true
        });
      }
    });
  });


};
start();
// initialize database
db();
exports.publish = function (exchange, queue, message) {
  console.log(message);
  channel.publish(exchange, queue, Buffer.from(JSON.stringify({
    body: message
  })));
  console.log('publishing message to : ' + exchange + " : " + queue);
}