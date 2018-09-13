/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Include relevant node modules
const FetchTweets = require("fetch-tweets");
const placeLookup = require("place-lookup");
const sentiment = require("sentiment-analysis");
const removeWords = require("remove-words");
const q = require("q");

var GetGeoSentimentTweets = (function() {
  let fetchFromTwitter = undefined;
  let findPlaceInfo = undefined;
  GetGeoSentimentTweets = class GetGeoSentimentTweets {
    static initClass() {
      // Function fetches Tweets from Twitter API, returning a deferred promise
      fetchFromTwitter = function(query, twitterApiKeys) {
        const fetchTweets = new FetchTweets(twitterApiKeys);
        const deferredTweets = q.defer();
        fetchTweets.byTopic(query, results => deferredTweets.resolve(results));
        return deferredTweets.promise;
      };

      // Fetches place data (lat and long) from Google places api, return promise
      findPlaceInfo = function(locationObject, placesApiKey) {
        const deferredLocation = q.defer();
        if (locationObject.place_name !== "") {
          placeLookup(locationObject.place_name, placesApiKey, placeData =>
            deferredLocation.resolve(placeData)
          );
        } else {
          deferredLocation.resolve({ error: "no place available" });
        }
        return deferredLocation.promise;
      };
    }

    constructor(twitterApiKeys, placesApiKey) {
      this.twitterApiKeys = twitterApiKeys;
      this.placesApiKey = placesApiKey;
    }

    // Main
    go(searchQuery, completeAction) {
      const { placesApiKey } = this;
      return fetchFromTwitter(searchQuery, this.twitterApiKeys).then(function(
        twitterResults
      ) {
        const promises = []; // array of google places promises
        for (var tweet of Array.from(twitterResults)) {
          promises.push(findPlaceInfo(tweet.location, placesApiKey));
        }
        return q.all(promises).spread(function() {
          // When all the places promises have returned
          for (let index = 0; index < twitterResults.length; index++) {
            tweet = twitterResults[index];
            tweet.location = arguments[index]; // Attach new location to Tweet
            tweet.sentiment = sentiment(tweet.body); // Attach sentiment to Tweet
            tweet.keywords = removeWords(tweet.body);
          } // Attach keywords to Tweet
          return completeAction(twitterResults);
        });
      });
    }
  };
  GetGeoSentimentTweets.initClass();
  return GetGeoSentimentTweets; // Done!
})();

module.exports = GetGeoSentimentTweets;
