/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require("express");
const router = express.Router();

const mapTweetFormatter = require("../utils/format-tweets-for-map");

// Render to page
const render = (res, data, title, summaryTxt) =>
  res.send({
    data, // The map data
    summary_text: summaryTxt, // Summary of results
    title, // The title of the rendered map
    pageNum: 1
  }); // The position in the application

// Call render with search term
const renderSearchTerm = (res, searchTerm) =>
  mapTweetFormatter.getFreshData(searchTerm, (mapData, summaryTxt) =>
    render(res, mapData, searchTerm + " Map", summaryTxt)
  );

// Call render for database data
const renderAllData = res =>
  mapTweetFormatter.getDbData((data, txt) => render(res, data, "Map", txt));

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

module.exports = router;
