var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var hits = new Schema({
  type: {
    type: String,
    enum: ["contents", "assets"],
    default: "contents"
  },
  caller: {
    type: String
  },
  objectId: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  issueDate: {
    type: Date,
    required: true,
    default: new Date()
  },
});

module.exports = mongoose.model("Hits", hits);