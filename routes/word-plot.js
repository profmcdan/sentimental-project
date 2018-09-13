/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require("express");
const router = express.Router();

const tweetWordFormatter = require("../utils/format-for-keyword-vis");

router.get("/", (req, res) =>
  tweetWordFormatter.getDbData((data, txt) =>
    res.send({
      title: "Word Scatter Plot",
      pageNum: 5,
      summary_text: txt,
      data
    })
  )
);

router.get("/:query", function(req, res) {
  const searchTerm = req.params.query; // Get the search term from URL param
  return tweetWordFormatter.getFreshData(searchTerm, (data, txt) =>
    res.json({
      title: "Word Scatter Plot",
      pageNum: 5,
      summary_text: txt,
      data
    })
  );
});

module.exports = router;
