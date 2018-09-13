const fs = require("fs");
const express = require("express");
const router = express.Router();

const findRegion = require("find-region-from-location");

const mapTweetFormatter = require("../utils/format-tweets-for-map");

const makeRegionMapData = function(tweets) {
  // Finds the average value for an array of numbers
  const findAv = function(arr) {
    let t = 0;
    for (let i of Array.from(arr)) {
      t += i;
    }
    return Math.round((t / arr.length) * 100) / 100;
  };

  // Group together the sentiments to their regions
  const prelimResults = {};
  for (let tweet of Array.from(tweets)) {
    const region = findRegion.country(tweet.location.lat, tweet.location.lng);
    if (prelimResults[region]) {
      prelimResults[region].sentiments.push(tweet.sentiment);
    } else {
      prelimResults[region] = { region, sentiments: [tweet.sentiment] };
    }
  }

  // Make the results array, by finding the average sentiment for each region
  const results = [];
  for (let regionKey in prelimResults) {
    if (prelimResults.hasOwnProperty(regionKey)) {
      results.push([regionKey, findAv(prelimResults[regionKey].sentiments)]);
    }
  }

  // Order results by sentiment, then append colounm headings and min/max values
  const sortFunc = function(a, b) {
    if (a[1] === b[1]) {
      return 0;
    } else if (a[1] < b[1]) {
      return -1;
    } else {
      return 1;
    }
  };
  results.sort(sortFunc);
  results.unshift(["Country", "Sentiment"], ["", -0.8], ["", 0.8]);
  return results;
};

const getRegions = () =>
  fs
    .readFileSync(__dirname + "/../public/data/regions.csv", "utf8")
    .split("\r\n");

// Render to page
const render = function(res, data, title, summaryTxt, location) {
  if (location == null) {
    location = "";
  }
  summaryTxt.searchRegion = location;
  return res.send({
    // Call res.render for the map page
    data, // The map data
    summary_text: summaryTxt, // Summary of results
    title, // The title of the rendered map
    pageNum: 6, // The position in the application
    csvRegions: getRegions()
  }); // List of all regions
};

// Call render with search term
const renderSearchTerm = function(res, searchTerm, location) {
  if (location == null) {
    location = "";
  }
  return mapTweetFormatter.getFreshData(searchTerm, function(
    twitterData,
    summaryTxt
  ) {
    const regionData = makeRegionMapData(twitterData);
    return render(
      res,
      regionData,
      searchTerm + " Region Map",
      summaryTxt,
      location
    );
  });
};

// Call render for database data
const renderAllData = function(res, location) {
  if (location == null) {
    location = "";
  }
  return mapTweetFormatter.getDbData((data, txt) =>
    render(res, makeRegionMapData(data), "Map", txt, location)
  );
};

// Path for main map root page
router.get("/", (req, res) => renderAllData(res));

// Path for map sub-page
router.get("/:query", function(req, res) {
  const searchTerm = req.params.query; // Get the search term from URL param
  if (searchTerm !== null) {
    return renderSearchTerm(res, searchTerm);
  } else {
    return renderAllData(res);
  }
});

// Path for map location sub-page
router.get("/location/:query", function(req, res) {
  const location = req.params.query; // Get the location from URL param
  return renderAllData(res, location);
});

module.exports = router;
