/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Tweet = require("../models/Tweet"); // The Tweet model
const CompleteTweets = require("../utils/get-complete-tweets"); // Fetches & formats data
const MakeSummarySentences = require("../utils/make-summary-sentences");

// API keys
const twitterKey = require("../config/keys").twitter;
const googlePlacesKey = require("../config/keys").googlePlaces;

var FormatTweetsForMap = (function() {
  let blurLocationData = undefined;
  let formatResultsForMap = undefined;
  let insertTweetsIntoDatabase = undefined;
  let isSuitableForDb = undefined;
  let mergeResults = undefined;
  let makeSentence = undefined;
  FormatTweetsForMap = class FormatTweetsForMap {
    static initClass() {
      // Slightly blur location data, as to not reveal users exact position
      blurLocationData = function(loc) {
        loc = loc + ""; // Convert location part into a string
        const accuracy = 3; // -1 = 110km, 1 = 10km, 2 = 1km, 3 = 100m, 4 = 10m ...
        const digitIndex = loc.indexOf(".") + accuracy; // Find index of digit to modify
        const randomDigit = Math.floor(Math.random() * 10);
        if (loc.length > digitIndex) {
          loc =
            loc.substr(0, digitIndex) +
            randomDigit +
            loc.substr(digitIndex + 1);
        }
        return Number(loc); // Convert result back to a number, and return
      };

      // Converts ordinary Tweet array to lat + lng array for the heat map
      formatResultsForMap = function(twitterResults) {
        const mapData = [];
        for (let tweet of Array.from(twitterResults)) {
          if (tweet.location.error == null) {
            mapData.push({
              sentiment: tweet.sentiment,
              location: {
                // lat: blurLocationData(tweet.location.location.lat),
                // lng: blurLocationData(tweet.location.location.lng)
              },
              tweet: tweet.body
            });
          }
        }
        return mapData;
      };

      // Inserts an array of valid Tweets into the database, if not already
      insertTweetsIntoDatabase = twitterResults =>
        (() => {
          const result = [];
          for (let tweet of Array.from(twitterResults)) {
            const tweetData = {
              body: tweet.body,
              dateTime: tweet.date,
              sentiment: tweet.sentiment,
              location: tweet.location
            };
            if (isSuitableForDb(tweetData)) {
              result.push(
                Tweet.findOneAndUpdate(
                  { body: tweetData.body },
                  tweetData,
                  { upsert: true },
                  function(err) {
                    if (err) {
                      return console.log(`ERROR UPDATING TWEET - ${err}`);
                    }
                  }
                )
              );
            } else {
              result.push(undefined);
            }
          }
          return result;
        })();

      // Determines if a Tweet object is complete & if it should be saved in the db
      isSuitableForDb = function(tweetData) {
        if (tweetData.sentiment === 0) {
          return false;
        }
        if (tweetData.location.error != null) {
          return false;
        }
        if (tweetData.location.location.lat == null) {
          return false;
        }
        if (tweetData.location.location.lng == null) {
          return false;
        }
        return true;
      };

      // Merge two sets of results
      mergeResults = (res1, res2) => res1.concat(res2);

      // Make sentence description for map
      makeSentence = (data, searchTerm) =>
        new MakeSummarySentences(data, searchTerm).makeMapSentences();
    }

    // Calls methods to fetch and format Tweets from the database
    renderWithDatabaseResults(cb) {
      return Tweet.getAllTweets(tweets =>
        cb(formatResultsForMap(tweets), makeSentence(tweets, null))
      );
    }

    // Calls methods to fetch fresh Twitter, sentiment, and place data
    renderWithFreshData(searchTerm, cb) {
      const completeTweets = new CompleteTweets(twitterKey, googlePlacesKey);
      return completeTweets.go(searchTerm, function(webTweets) {
        insertTweetsIntoDatabase(webTweets); // Add new Tweets to the db
        return Tweet.searchTweets(searchTerm, function(dbTweets) {
          // Fetch matching db results
          const data = mergeResults(webTweets, dbTweets);
          return cb(formatResultsForMap(data), makeSentence(data, searchTerm));
        });
      });
    }
  };
  FormatTweetsForMap.initClass();
  return FormatTweetsForMap;
})();

const ftfm = new FormatTweetsForMap();
module.exports.getFreshData = ftfm.renderWithFreshData;
module.exports.getDbData = ftfm.renderWithDatabaseResults;
