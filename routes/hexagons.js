/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// Require necessary modules, API keys and instantiate objects
const fetchSentimentTweets = require("../utils/fetch-sentiment-tweets");
const express = require("express");
const router = express.Router();

// Main route - no search term
router.get("/", (req, res, next) =>
  fetchSentimentTweets("", (
    results,
    average // Fetch all data
  ) =>
    res.send({
      // Render template
      title: "Sentiment Hexagons",
      pageNum: 9,
      data: results,
      averageSentiment: average,
      searchTerm: ""
    })
  )
);

// Route with search term
router.get("/:query", function(req, res) {
  const searchTerm = req.params.query; // Get the search term from URL param
  return fetchSentimentTweets(searchTerm, (
    results,
    average // Fetch all data
  ) =>
    res.send({
      // Render template
      title: searchTerm + " Hexagons results",
      pageNum: 9,
      data: results,
      averageSentiment: average,
      searchTerm
    })
  );
});

module.exports = router;
