var mongoose = require('mongoose')
var Schema = mongoose.Schema

// create a schema
var crawlerSchema = new Schema({
  'site': String,
  'authorName': String,
  'authorLink': String,
  'titleName': String,
  'titleLink': String,
  'content': String,
  'id': String,
  'date': String,
  'clock': String,
  'status': String
})

var Crawler = mongoose.model('Crawler', crawlerSchema)

module.exports = Crawler
