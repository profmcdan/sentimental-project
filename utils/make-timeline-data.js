/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// Require necessary modules, API keys and instantiate objects
const Tweet = require("../models/Tweet"); // The Tweet model
const sentimentAnalysis = require("sentiment-analysis");
const FetchTweets = require("fetch-tweets");
const twitterKey = require("../config/keys").twitter;
const fetchTweets = new FetchTweets(twitterKey);

var MakeTimeLineData = (function() {
  let formatResultsForTimeLine = undefined;
  let mergeResults = undefined;
  MakeTimeLineData = class MakeTimeLineData {
    static initClass() {
      // Converts ordinary Tweet array to suitable form for word cloud
      formatResultsForTimeLine = function(twitterResults) {
        // Create result structures
        let av;
        const results = { posData: [], negData: [] };
        const posTotals = {
          7: [],
          8: [],
          9: [],
          10: [],
          11: [],
          12: [],
          13: [],
          14: [],
          15: [],
          16: [],
          17: [],
          18: [],
          19: [],
          20: [],
          21: [],
          22: [],
          23: []
        };
        const negTotals = {
          7: [],
          8: [],
          9: [],
          10: [],
          11: [],
          12: [],
          13: [],
          14: [],
          15: [],
          16: [],
          17: [],
          18: [],
          19: [],
          20: [],
          21: [],
          22: [],
          23: []
        };

        // Populate array of list of sentiments for each hour in pos and neg totals
        for (let tweetObj of Array.from(twitterResults)) {
          const tweetHour = new Date(tweetObj.dateTime).getHours();
          if (tweetObj.sentiment > 0) {
            if (posTotals[tweetHour]) {
              posTotals[tweetHour].push(tweetObj.sentiment);
            }
          } else if (tweetObj.sentiment < 0) {
            if (negTotals[tweetHour]) {
              negTotals[tweetHour].push(tweetObj.sentiment);
            }
          }
        }

        // Func to find the positive average of all number elements in a list
        const findAv = function(arr) {
          let total = 0;
          for (let i of Array.from(arr)) {
            total += i;
          }
          const ans = total !== 0 ? total / arr.length : 0;
          return Math.round(ans * 100) / 100;
        };

        // Find the average of pos and neg totals, and assign the value to results
        for (var key in posTotals) {
          if (posTotals.hasOwnProperty(key)) {
            av = findAv(posTotals[key]);
            if (av !== 0) {
              results.posData.push({ x: key, y: av });
            }
          }
        }
        for (key in negTotals) {
          if (negTotals.hasOwnProperty(key)) {
            av = findAv(negTotals[key]);
            if (av !== 0) {
              results.negData.push({ x: key, y: Math.abs(av) });
            }
          }
        }

        // Done :) return populated results object
        return results;
      };

      // Merge two sets of results
      mergeResults = (res1, res2) => res1.concat(res2);
    }

    // Calls methods to fetch and format Tweets from the database
    renderWithDatabaseResults(cb) {
      return Tweet.getAllTweets(tweets => cb(formatResultsForTimeLine(tweets)));
    }

    // Calls methods to fetch fresh Twitter, sentiment, and place data
    renderWithFreshData(searchTerm, cb) {
      return fetchTweets.byTopic(searchTerm, webTweets =>
        Tweet.searchTweets(searchTerm, function(dbTweets) {
          // Fetch matching db results
          const data = mergeResults(webTweets, dbTweets);
          return cb(formatResultsForTimeLine(data, true));
        })
      );
    }
  };
  MakeTimeLineData.initClass();
  return MakeTimeLineData;
})();

const mtld = new MakeTimeLineData();
module.exports.getFreshData = mtld.renderWithFreshData;
module.exports.getDbData = mtld.renderWithDatabaseResults;
