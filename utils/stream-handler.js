/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Tweet = require("../models/Tweet");

const removeWords = require("remove-words");
const sentimentAnalysis = require("sentiment-analysis");
const moment = require("moment");
const placeLookup = require("place-lookup");

const placesApiKey = require("../config/keys").googlePlaces;
const blankPlace = { place_name: "", location: { lat: 0.0, lng: 0.0 } };

const makeTweetObj = (data, location) => ({
  body: data.body,
  dateTime: data.date,
  keywords: removeWords(data.body),
  sentiment: sentimentAnalysis(data.body),
  location
});

// Determines if a Tweet object is complete & if it should be saved in the db
const isSuitableForDb = function(tweetData) {
  if (tweetData.sentiment === 0) {
    return false;
  } // Reject neutral tweets
  if (tweetData.location.error != null) {
    return false;
  } // Reject no location tweets
  // Double check location is actually there, and reject if not
  if (tweetData.location.location.lat == null) {
    return false;
  }
  if (tweetData.location.location.lng == null) {
    return false;
  }
  // new! to make the db fill up more slowly, reject all slightly neutral tweets
  if (tweetData.sentiment < 0.4 && tweetData.sentiment > -0.4) {
    return false;
  }
  // And reject tweets that out URL's - they're usually crap!
  if (tweetData.body.indexOf("http") !== -1) {
    return false;
  }
  return true;
};

module.exports = function(data, io) {
  // Emit all tweets to the anyTweet listener
  const anyTweet = makeTweetObj(data, data.location);
  anyTweet.dateTime = moment(new Date(anyTweet.dateTime)).fromNow();
  io.emit("anyTweet", anyTweet);

  if (data.location.location.lat !== 0) {
    const tweet = makeTweetObj(data, data.location);
    io.emit("tweet", tweet);
    if (isSuitableForDb(tweet)) {
      return Tweet.findOneAndUpdate(
        { body: tweet.body },
        tweet,
        { upsert: true },
        function(err) {
          if (err) {
            return console.log(`ERROR UPDATING TWEET - ${err}`);
          }
        }
      );
    }
  }
};

// // Uncomment this to stream live geo-accurate tweets- it will drain API usage
// if ((data.location.location.lat === 0) && (data.location.place_name !== '')) {
//   placeLookup(data.location.place_name, placesApiKey, function(placeResults) {
//     const tweetLocation = !placeResults.error ? placeResults : blankPlace;
//     const tweet = makeTweetObj(data, tweetLocation);

//     if (isSuitableForDb(tweet)) {
//       Tweet.findOneAndUpdate(
//         {body: tweet.body},
//         tweet,
//         {upsert: true},
//         function(err) { if (err) { return console.log(`ERROR UPDATING TWEET - ${err}`); } });
//     }

//     return io.emit('tweet', tweet);
//   }); // If everythinks cool, emit the tweet
// }
