/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const Twit = require("twit");
const streamHandler = require("../utils/stream-handler");

class streamer {
  constructor(credentials, io1) {
    this.credentials = credentials;
    this.io = io1;
    this.stream = null;

    const T = new Twit({
      consumer_key: this.credentials.consumer_key,
      consumer_secret: this.credentials.consumer_secret,
      access_token: this.credentials.token,
      access_token_secret: this.credentials.token_secret,
      timeout_ms: 60 * 1000
    });

    const formatResults = function(twitterResults) {
      const prepareLocation = function(body) {
        let location = undefined;
        location = {
          place_name: "_",
          location: {
            lat: 0.0,
            lng: 0.0
          }
        };
        if (body.coordinates !== null) {
          location.location.lat = body.coordinates.coordinates[1];
          location.location.lng = body.coordinates.coordinates[0];
        } else if (body.geo !== null) {
          location.location.lat = body.geo.coordinates[0];
          location.location.lng = body.geo.coordinates[1];
        }
        if (body.place !== null) {
          location.place_name = body.place.name;
        } else if (body.user !== null) {
          location.place_name = body.user.location;
        }
        return location;
      };

      return {
        date: twitterResults.created_at,
        body: twitterResults.text,
        location: prepareLocation(twitterResults),
        "retweet-count": twitterResults.retweet_count,
        "favorited-count": twitterResults.favorite_count,
        lang: twitterResults.lang
      };
    };

    const { io } = this;
    let { stream } = this;

    const world = [-180, -90, 180, 90];
    stream = T.stream("statuses/filter", { locations: world });

    stream.on("tweet", tweet => streamHandler(formatResults(tweet), io));

    stream.on("disconnect", function(disconnectMessage) {
      console.log("Twitter Stream Disconnected");
      console.log(disconnectMessage);
      return (stream = T.stream("statuses/filter", { locations: world }));
    });

    stream.on("connected", response => console.log("Twitter Stream Connected"));

    this.stream = stream;
  }

  checkStillConnected() {
    if (this.stream.response.statusCode !== 200) {
      console.log("Stream doesn't appear to be connected; I'll just start it.");
      return this.stream.start();
    }
  }
}

module.exports = streamer;
