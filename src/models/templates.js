var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var tempalte = new Schema({
  name: { type: Object, required: true },
  title: { type: Object, required: true },
  description: { type: Object },
  category: { type: Object },
  icon: { type: String, required: false },
  allowCustomFields: { type: Boolean, default: false },
  fields: [Object]
});

module.exports = mongoose.model("Templates", tempalte);
