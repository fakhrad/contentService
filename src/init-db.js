    // Set up mongoose connection
var mongoose = require('mongoose');

var init = function()
{
    var db_url = 'mongodb://fakhrad:logrezaee24359@ds026018.mlab.com:26018/content-db'
    var mongoDB = process.env.CONTENT_DB_URL || db_url;
    mongoose.connect(mongoDB);  
    mongoose.Promise = global.Promise;
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('connected', ()=>{
        console.log('MongoDb connected');
    });
}

module.exports = init;