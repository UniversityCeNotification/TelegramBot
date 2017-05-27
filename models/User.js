var mongoose = require('mongoose')
var Schema = mongoose.Schema

// create a schema
var userSchema = new Schema({
  id: Number,
  username: String,
  firstname: String,
  lastname: String,
  trackSite: String,
  createdAt: String
})

userSchema.methods.addTrackSite = function (site) {
  this.trackSite = site
  return this.trackSite
}

var User = mongoose.model('User', userSchema)

module.exports = User
