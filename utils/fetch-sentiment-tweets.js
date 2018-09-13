/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Include relevant node modules
const FetchTweets = require("fetch-tweets");
const sentiment = require("sentiment-analysis");
const removeWords = require("remove-words");
const twitterKey = require("../config/keys").twitter;
const Tweet = require("../models/Tweet");

module.exports = function(searchTerm, callback) {
  let format;
  if (searchTerm === "") {
    Tweet.getAllTweets(results => format(results, callback));
  } else {
    new FetchTweets(twitterKey).byTopic(searchTerm, results =>
      format(results, callback)
    );
  }

  return (format = function(results, callback) {
    // Assign Sentiments
    for (var tweet of Array.from(results)) {
      tweet.sentiment = sentiment(tweet.body);
    }

    // Assign keywords
    for (tweet of Array.from(results)) {
      tweet.keywords = removeWords(tweet.body);
    }

    // Find average sentiment
    let total = 0;
    for (tweet of Array.from(results)) {
      total += tweet.sentiment;
    }
    let averageSentiment = total / results.length;
    averageSentiment = Math.round(averageSentiment * 100) / 100;

    // Done, call callback with results and sentiment average
    return callback(results, averageSentiment);
  });
};
