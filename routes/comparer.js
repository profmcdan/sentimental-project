const express = require("express");
const router = express.Router();
const asyncTweets = require("../utils/async-tweets");
const wordFormatter = require("../utils/format-for-keyword-vis").findTopWords;

const formatResults = function(data) {
  for (let tweetArr of Array.from(data)) {
    // Add keywords list
    const wrdsjs = wordFormatter(tweetArr.tweets, true);
    let topData = wrdsjs.topPositive.concat(
      wrdsjs.topNegative,
      wrdsjs.topNeutral
    );
    topData = topData.sort((a, b) => parseFloat(b.freq) - parseFloat(a.freq));
    topData = topData.splice(0, 10);
    tweetArr.keywordData = topData = topData.sort(() => 0.5 - Math.random());

    // Find average sentiment
    let totalSentiment = 0;
    for (var tweet of Array.from(tweetArr.tweets)) {
      totalSentiment += tweet.sentiment;
    }
    tweetArr.averageSentiment = totalSentiment / tweetArr.tweets.length;

    // Find percentage positive, negative and neutral
    const pieChart = { positive: 0, neutral: 0, negative: 0 };
    for (tweet of Array.from(tweetArr.tweets)) {
      if (tweet.sentiment > 0) {
        pieChart.positive += 1;
      } else if (tweet.sentiment < 0) {
        pieChart.negative += 1;
      } else {
        pieChart.neutral += 1;
      }
    }
    tweetArr.pieChart = pieChart;
  }

  return data;
};

// Main route - with search terms
router.get("/:query", function(req, res, next) {
  const searchTerms = req.params.query.split(",").splice(0, 4);
  return asyncTweets(searchTerms, results =>
    res.send({
      // Render template
      title: "Comparer",
      pageNum: 10,
      data: formatResults(results),
      searchTerm: searchTerms
    })
  );
});

// Main route - no search term
router.get("/", (req, res, next) =>
  res.send({
    // Render template
    title: "Comparer",
    pageNum: 10,
    data: "",
    searchTerm: ""
  })
);

module.exports = router;
