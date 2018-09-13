/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// Require necessary modules, API keys and instantiate objects
const Tweet = require("../models/Tweet"); // The Tweet model
const FetchTweets = require("fetch-tweets");
const twitterKey = require("../config/keys").twitter;
const fetchTweets = new FetchTweets(twitterKey);
const entityExtraction = require("haven-entity-extraction");
const hpKey = require("../config/keys").hp;
const express = require("express");
const router = express.Router();

// Formats tweets into a massive tweet body
const formatTweets = function(twitterResults) {
  let results = "";
  for (let tweet of Array.from(twitterResults)) {
    results += tweet.body + " ";
  }
  results = results.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
  results = results.replace(/[^A-Za-z0-9 ]/g, "");
  return (results = results.substring(0, 5000));
};

const makeSankeyData = function(startNode, data) {
  const results = { links: [], nodes: [] };

  results.nodes.push({ name: startNode });

  for (let key of Array.from(Object.keys(data))) {
    const nodeName = key.charAt(0).toUpperCase() + key.split("_")[0].slice(1);
    results.nodes.push({ name: nodeName });
    results.links.push({
      source: startNode,
      target: nodeName,
      value: data[key].length
    });

    for (let entity of Array.from(data[key])) {
      const entityName = entity.normalized_text;
      results.nodes.push({ name: entityName });
      results.links.push({
        source: nodeName,
        target: entityName,
        value: entity.matches.length
      });

      for (let match of Array.from(entity.matches)) {
        let canInsert = true;
        for (let m of Array.from(results.nodes)) {
          if (m.name === match) {
            canInsert = false;
          }
        }
        if (canInsert) {
          results.nodes.push({ name: match });
          results.links.push({ source: entityName, target: match, value: 0.5 });
        } else {
          for (let l of Array.from(results.links)) {
            if (l.target === match) {
              l.value += 0.5;
            }
          }
        }
      }
    }
  }

  return results;
};

// Main route - no search term
router.get("/", (req, res, next) =>
  Tweet.getAllTweets(tweets =>
    entityExtraction(formatTweets(tweets), hpKey, results =>
      res.render("page_entityExtraction", {
        title: "Entity Extraction",
        pageNum: 8,
        data: results,
        searchTerm: "",
        sankeyData: makeSankeyData("Recent Tweets", results)
      })
    )
  )
);

// Route with search term
router.get("/:query", function(req, res) {
  const searchTerm = req.params.query.toLowerCase(); // Get the search term of URL param
  return fetchTweets.byTopic(searchTerm, tweets =>
    entityExtraction(formatTweets(tweets), hpKey, results =>
      res.render("page_entityExtraction", {
        title: searchTerm + " | Entity Extraction",
        pageNum: 8,
        data: results,
        searchTerm,
        sankeyData: makeSankeyData(searchTerm, results)
      })
    )
  );
});

module.exports = router;
