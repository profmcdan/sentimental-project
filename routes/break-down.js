const Tweet = require("../models/Tweet"); // The Tweet model
const moment = require("moment");
const FetchTweets = require("fetch-tweets");
const twitterKey = require("../config/keys").twitter;
const fetchTweets = new FetchTweets(twitterKey);
const removeWords = require("remove-words");
const hpSentimentAnalysis = require("haven-sentiment-analysis");
const hpKey = require("../config/keys").hp;
const express = require("express");
const router = express.Router();

const fetchAndFormatTweets = (searchTerm, cb) =>
  fetchTweets.byTopic(searchTerm, results => cb(formatTweets(results)));

var formatTweets = function(twitterResults) {
  let results = "";
  for (let tweet of Array.from(twitterResults)) {
    results += tweet.body + " ";
  }
  results = results.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
  results = results.replace(/[^A-Za-z0-9 ]/g, "");
  return (results = results.substring(0, 5000));
};

const getHpSentimentResults = (tweetBody, cb) =>
  hpSentimentAnalysis(tweetBody, hpKey, results => cb(results));

const formatResultsForChart = function(hpResults) {
  let score;
  const data = {
    name: "sentiment-tree",
    children: [
      { name: "positive", children: [] },
      { name: "negative", children: [] }
    ]
  };
  let i = 1;
  while (i <= 10) {
    data.children[0].children.push({ name: i / 10, children: [] });
    data.children[1].children.push({ name: i / -10 + "", children: [] });
    i++;
  }

  for (let posRes of Array.from(hpResults.positive)) {
    score = Math.round(posRes.score * 10) / 10;
    for (i of Array.from(data.children[0].children)) {
      if (i.name === score) {
        i.children.push({
          name: posRes.sentiment,
          size: posRes.score,
          topic: posRes.topic
        });
      }
    }
  }

  for (let negRes of Array.from(hpResults.negative)) {
    score = Math.round(negRes.score * 10) / 10 + "";
    for (let index = 0; index < data.children[1].children.length; index++) {
      i = data.children[1].children[index];
      if (i.name === score) {
        i.children.push({
          name: negRes.sentiment,
          size: Math.abs(negRes.score),
          topic: negRes.topic
        });
      }
    }
  }
  return data;
};

// @desc  Route with search term
// @route GET /format/:query
// Public
router.get("/:query", function(req, res) {
  const searchTerm = req.params.query; // Get the search term from URL param

  return fetchAndFormatTweets(searchTerm, tweetBody =>
    getHpSentimentResults(tweetBody, function(hpResults) {
      const results = formatResultsForChart(hpResults);
      return res.send({
        title: searchTerm + " Sentiment Trees",
        pageNum: -1,
        data: results,
        searchTerm
      });
    })
  );
});

// @desc  Formatted Tweets
// @route GET /format
// Public
router.get("/", (req, res) =>
  Tweet.getAllTweets(function(tweets) {
    const tweetBody = formatTweets(tweets);
    return getHpSentimentResults(tweetBody, function(hpResults) {
      const results = formatResultsForChart(hpResults);
      return res.send({
        title: "Sentiment Trees",
        pageNum: -1,
        data: results,
        searchTerm: ""
      });
    });
  })
);

module.exports = router;
