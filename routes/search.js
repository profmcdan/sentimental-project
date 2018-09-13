const fetchSentimentTweets = require("../utils/fetch-sentiment-tweets");
const wordFormatter = require("../utils/format-for-keyword-vis").findTopWords;
//toneAnalyzer = require('../utils/watson-tone-analyzer')
const makeClickWords = require("../utils/make-click-words");

const express = require("express");
const router = express.Router();

// Converts Tweet objects into the right format
const formatResults = function(tweetArr) {
  const results = {};
  // Add keywords list
  const wrdsjs = wordFormatter(tweetArr, true);
  let topData = wrdsjs.topPositive.concat(
    wrdsjs.topNegative,
    wrdsjs.topNeutral
  );
  topData = topData.sort((a, b) => parseFloat(b.freq) - parseFloat(a.freq));
  topData = topData.splice(0, 10);
  results.keywordData = topData = topData.sort(() => 0.5 - Math.random());

  // Find average sentiment
  let totalSentiment = 0;
  for (var tweet of Array.from(tweetArr)) {
    totalSentiment += tweet.sentiment;
  }
  results.averageSentiment = totalSentiment / tweetArr.length;

  // Find percentage positive, negative and neutral
  const pieChart = { positive: 0, neutral: 0, negative: 0 };
  for (tweet of Array.from(tweetArr)) {
    if (tweet.sentiment > 0) {
      pieChart.positive += 1;
    } else if (tweet.sentiment < 0) {
      pieChart.negative += 1;
    } else {
      pieChart.neutral += 1;
    }
  }
  results.pieChart = pieChart;
  results.tweets = tweetArr;
  return results;
};

const getTopTweets = function(tweetArr) {
  tweetArr = JSON.parse(JSON.stringify(tweetArr)); // Clone tweetArr
  const results = {};
  const topPositiveTweets = tweetArr
    .sort((b, a) => a.sentiment - b.sentiment)
    .slice(0, 5);
  const topNegativeTweets = tweetArr
    .sort((a, b) => a.sentiment - b.sentiment)
    .slice(0, 5);
  for (var tweet of Array.from(topPositiveTweets)) {
    tweet.body = makeClickWords(tweet.body);
  }
  for (tweet of Array.from(topNegativeTweets)) {
    tweet.body = makeClickWords(tweet.body);
  }
  results.topPositive = topPositiveTweets;
  results.topNegative = topNegativeTweets;
  return results;
};

const makeTweetBody = function(tweetArr) {
  let results = "";
  for (let tweet of Array.from(tweetArr)) {
    results += tweet.body + " ";
  }
  return results;
};

// @desc GET searched tweets
// @route /search
// Public
router.get("/", (req, res, next) => {
  return fetchSentimentTweets("", (
    results,
    average // Fetch all data
  ) =>
    res.send({
      // Render template
      title: " results",
      pageNum: -1,
      data: formatResults(results),
      averageSentiment: average,
      searchTerm: "",
      topTweets: getTopTweets(results),
      tweetBody: makeTweetBody(results)
    })
  );
});

// @desc GET searched tweets
// @route /search/:query
// Public
router.get("/:query", function(req, res) {
  const searchTerm = req.params.query; // Get the search term from URL param

  return fetchSentimentTweets(searchTerm, (
    results,
    average // Fetch all data
  ) =>
    res.send({
      // Render template
      title: searchTerm + " results",
      pageNum: -1,
      data: formatResults(results),
      averageSentiment: average,
      searchTerm,
      topTweets: getTopTweets(results),
      tweetBody: makeTweetBody(results)
    })
  );
});

module.exports = router;
