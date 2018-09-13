/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    body: String,
    dateTime: String,
    sentiment: Number,
    keywords: String,
    location: { type: Object, default: {} }
  },
  { capped: { size: 491520, max: 1500, autoIndexId: true } }
);

schema.statics.getAllTweets = callback =>
  Tweet.find({}, (err, results) => callback(results));

schema.statics.searchTweets = (searchTerm, callback) =>
  Tweet.find({ keywords: searchTerm }, (err, results) => callback(results));

module.exports = Tweet = mongoose.model("Tweet", schema);
