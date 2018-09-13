/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require("express");
const router = express.Router();

const defaultRes = require("../assets/all_sentiment_results_edwardsnowdon.json");

// Renders the layout with the sentiment results passed as param
const renderWithResults = (res, results, searchTerm) =>
  res.send({ results, searchTerm });
//  res.json results

// Root task, called when no params passed, should use default results
router.get("/", (req, res) => renderWithResults(res, defaultRes, ""));

// Fetches Tweets for given query, calculates sentiment then calls render
router.get("/:query", function(req, res) {
  // Node modules
  let fetchTweets = require("fetch-tweets");
  const dictionarySA = require("sentiment-analysis");
  const nluSA = require("haven-sentiment-analysis");

  // Keys and instance variables
  const hpKey = require("../config/keys").hp;
  const twitterKey = require("../config/keys").twitter;
  const results = []; // Will hold list of json objects to be rendered
  let completedRequests = 0; // Counts how many results returned
  const searchTerm = req.params.query; // Get the search term from URL param

  // Method will generate an object with all calculated sentiments for tweet
  const calculateResults = function(searchTerm) {
    const makeSentimentResults = rawTweets =>
      rawTweets.forEach((tweet, index) =>
        nluSA({ text: tweet }, hpKey, function(nluResults) {
          results.push({
            index,
            tweet,
            dictionary_sentiment: dictionarySA(tweet),
            nlu_sentiment: Math.round(nluResults.aggregate.score * 1000) / 1000,
            human_sentiment: null
          });
          completedRequests++;
          if (completedRequests === rawTweets.length) {
            // Everything is done, render
            return renderWithResults(res, results, searchTerm);
          }
        })
      );

    // Fetch the Tweets
    fetchTweets = new fetchTweets(twitterKey);
    const searchOptions = {
      q: searchTerm,
      lang: "en",
      count: 50
    };
    return fetchTweets.byTopic(searchOptions, function(results) {
      const rawTweets = [];
      results.forEach(tweet => rawTweets.push(tweet.body));
      return makeSentimentResults(rawTweets);
    });
  };

  if (searchTerm !== null) {
    return calculateResults(searchTerm);
  } else {
    return renderWithResults(res, defaultRes, "");
  }
});

module.exports = router;
