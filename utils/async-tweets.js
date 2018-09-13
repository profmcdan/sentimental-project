/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const fetchSentimentTweets = require("../utils/fetch-sentiment-tweets");
const q = require("q");

const makeTweetPromiseArr = function(searchTerm) {
  const deferredTweetResults = q.defer();
  fetchSentimentTweets(searchTerm, (
    results // Fetch all data for one Tweet
  ) => deferredTweetResults.resolve(results));
  return deferredTweetResults.promise;
};

const makeRequests = function(searchTerms, completeAction) {
  const results = [];
  const promises = [];
  for (let term of Array.from(searchTerms)) {
    promises.push(makeTweetPromiseArr(term));
  }
  return q.all(promises).spread(function() {
    // When all the twitter promises have returned
    for (let index = 0; index < arguments.length; index++) {
      const argument = arguments[index];
      results.push({ searchTerm: searchTerms[index], tweets: argument });
    }
    return completeAction(results);
  }); // Done!
};

module.exports = makeRequests;
