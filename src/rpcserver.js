var amqp = require('amqplib/callback_api');
var db = require('./init-db');
const contentController = require('./controllers/contentController');
const ctypeController = require('./controllers/contentTypeController');
const assetController = require('./controllers/assetController');
const categoriesController = require('./controllers/categoryController');

var rabbitHost = process.env.RABBITMQ_HOST || "amqp://fwhebseo:Q3Ft5NUyFNBniua53p_bV8u-w3KVfmsK @wildboar.rmq.cloudamqp.com/fwhebseo ";
//var rabbitHost = process.env.RABBITMQ_HOST || "amqp://localhost:5672";

var amqpConn = null;
function start() {
    console.log('Start connecting : ' + process.env.RABBITMQ_HOST );;
  amqp.connect(rabbitHost, (err, conn)=>{
    if (err) {
        console.error("[AMQP]", err.message);
        return setTimeout(start, 1000);
      }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected();
  });
}
function whenConnected() {
    amqpConn.createChannel( (err, ch) => {
        if (err) {
            console.error("[AMQP]", err.message);
            //return setTimeout(start, 1000);
        }
        ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
        //return setTimeout(start, 1000);
        });
        ch.on("close", function() {
        console.log("[AMQP] channel closed");
        //return setTimeout(start, 1000);
        });
        console.log('Client connected.');
        this.channel = ch;

        ch.prefetch(10);
        console.log('Content service broker started!');
      //Login API
      ch.assertQueue("getcontents", {durable: false}, (err, q)=>{
          ch.consume(q.queue, function reply(msg) {
              var req = JSON.parse(msg.content.toString('utf8'));
              contentController.getAll(req, (result)=>{
                  ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                  ch.ack(msg);
              });
          });
      });
      ch.assertQueue("addcontenttype", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            console.log(req);
            ctypeController.addContentTypes(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("updatecontenttype", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            ctypeController.updateContentType(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("removecontenttype", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            ctypeController.deleteContentTypes(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("getcontenttypes", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            ctypeController.getContentTypes(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });

      ch.assertQueue("getcontenttypesbyid", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            ctypeController.findbyid(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      
      ch.assertQueue("addasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.add(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("updateasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.update(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("removeasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.remove(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("getallassets", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.getAll(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });

      ch.assertQueue("filterassets", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.filter(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });

      ch.assertQueue("getassetbyid", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.findById(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("publishasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.publish(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("unpublishasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.unPublish(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("archiveasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.archive(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("unarchiveasset", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            assetController.unArchive(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });

      //Contents Api
      ch.assertQueue("addcontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.add(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("updatecontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.update(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("removecontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.remove(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("getallcontents", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.getAll(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("publishcontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.publish(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("unpublishcontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.unPublish(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("archivecontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.archive(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("unarchivecontent", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            contentController.unArchive(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });

      //Category Api
      ch.assertQueue("addcategory", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            categoriesController.addcategory(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("updatecategory", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            categoriesController.updatecategory(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("removecategory", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            categoriesController.deletecategory(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
      ch.assertQueue("getallcategories", {durable: false}, (err, q)=>{
        ch.consume(q.queue, function reply(msg) {
            var req = JSON.parse(msg.content.toString('utf8'));
            categoriesController.getcategories(req, (result)=>{
                ch.sendToQueue(msg.properties.replyTo, new Buffer.from(JSON.stringify(result)), { correlationId: msg.properties.correlationId } );
                ch.ack(msg);
            });
          });
      });
    });
  };
start();
// initialize database
db();