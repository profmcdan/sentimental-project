const express = require("express");
const router = express.Router();
const fetchSentimentTweets = require("../utils/fetch-sentiment-tweets");

const entityExtraction = require("haven-entity-extraction");
const hpKey = require("../config/keys").hp;
const watson = require("watson-developer-cloud");
const watsonCredentials = require("../config/keys").watson;

const FetchTweets = require("fetch-tweets");
const twitterKey = require("../config/keys").twitter;
const asyncTweets = require("../utils/async-tweets");
const placeLookup = require("place-lookup");
const placesKey = require("../config/keys").googlePlaces;

const fetchTweets = new FetchTweets(twitterKey);

const findAverageSentiment = function(tweetArr) {
  let totalSentiment = 0;
  for (let tweet of Array.from(tweetArr.tweets)) {
    totalSentiment += tweet.sentiment;
  }
  return totalSentiment / tweetArr.tweets.length;
};

const findOriginalTrend = function(searchTerm, searchTerms, trends) {
  for (let i = 0; i < searchTerms.length; i++) {
    const st = searchTerms[i];
    if (st === searchTerm) {
      return trends[i];
    }
  }
  return {};
};

const makeTrendRequest = (woeid, cb) =>
  fetchTweets.trending(woeid, function(trendingResults) {
    // Make a list of searchTerms from the trending topics
    let trend;
    const searchTerms = [];
    const originalTrends = [];
    let i = 0;
    while (searchTerms.length < 10) {
      if (trendingResults[i] == null) {
        cb({});
        return;
      }
      trend = trendingResults[i].trend.replace(/[\W_]+/g, "");
      if (trend.length > 0) {
        searchTerms.push(trend);
        originalTrends.push(trendingResults[i]);
      }
      i++;
    }

    // Make the actual request
    return asyncTweets(searchTerms, function(twitterResults) {
      //Make the results array
      const results = [];
      for (let tweetArr of Array.from(twitterResults)) {
        const t = findOriginalTrend(
          tweetArr.searchTerm,
          searchTerms,
          trendingResults
        );
        results.push({
          topic: t.trend,
          sentiment: findAverageSentiment(tweetArr),
          volume: t.volume
        });
      }
      return cb(results);
    });
  });

router.post("/trending-api", function(req, res) {
  const woeid = 1;
  return makeTrendRequest(woeid, results => res.json({ trends: results }));
});

router.post("/trending-api/:location", function(req, res) {
  const fuzzyLocation = req.params.location;
  return placeLookup(fuzzyLocation, placesKey, function(placeResults) {
    if (placeResults.error == null) {
      const { lat } = placeResults.location;
      const { lng } = placeResults.location;
      return fetchTweets.closestTrendingWoeid(lat, lng, function(places) {
        const { woeid } = places[0];
        return makeTrendRequest(woeid, function(results) {
          if (results === {}) {
            res.json({});
          }
          return res.json({
            trends: results,
            location: placeResults.place_name
          });
        });
      });
    } else {
      return res.json({});
    }
  });
});

// Formats tweets into a massive tweet body
const formatText = function(tweetBody) {
  tweetBody = tweetBody.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
  tweetBody = tweetBody.replace(/[^A-Za-z0-9 ]/g, "");
  return (tweetBody = tweetBody.substring(0, 5000));
};

const formatData = function(data) {
  let results = [];
  if (data === null) {
    return [];
  }
  for (let key of Array.from(Object.keys(data))) {
    const category = key.charAt(0).toUpperCase() + key.split("_")[0].slice(1);
    results.push({ name: category, items: data[key] });
  }
  return (results = results.sort((a, b) => b.items.length - a.items.length));
};

const toneAnalyzer = watson.tone_analyzer({
  url: "https://gateway.watsonplatform.net/tone-analyzer/api",
  username: watsonCredentials.username,
  password: watsonCredentials.password,
  version_date: "2016-11-02",
  version: "v3"
});

const noBodyProvided = function(req, res) {
  const makeBody = function(twAr) {
    let tweetBody = "";
    for (let tw of Array.from(twAr)) {
      tweetBody += tw.body + " ";
    }
    tweetBody = tweetBody.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
    return (tweetBody = tweetBody
      .replace(/[^A-Za-z0-9 ]/g, "")
      .substring(0, 5000));
  };

  const toneRes = body =>
    toneAnalyzer.tone({ text: body }, function(err, data) {
      if (err) {
        return next(err);
      } else {
        return res.json(data);
      }
    });

  if (req.body.searchTerm != null && req.body.searchTerm !== "") {
    return fetchSentimentTweets(req.body.searchTerm, r => toneRes(makeBody(r)));
  } else {
    return fetchSentimentTweets("", r => toneRes(makeBody(r)));
  }
};

router.post("/tone-api", function(req, res, next) {
  if (req.body.text == null || req.body.text === "") {
    return noBodyProvided(req, res);
  } else {
    return toneAnalyzer.tone(req.body, function(err, data) {
      if (err) {
        return next(err);
      } else {
        return res.json(data);
      }
    });
  }
});

router.post("/entity-api", (req, res) =>
  entityExtraction(formatText(req.body.text), hpKey, function(data) {
    console.log(data);
    return res.json(formatData(data));
  })
);

router.post("/db-api", (req, res) =>
  fetchSentimentTweets("", (data, average) => res.json({ data, average }))
);

module.exports = router;
