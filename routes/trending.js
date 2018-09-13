/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) =>
  res.send({
    title: "Trending Now",
    pageNum: 11,
    location: ""
  })
);

router.get("/:query", function(req, res) {
  const location = req.params.query; // Get the search term from URL param
  return res.send({
    title: `Trending in ${location}`,
    pageNum: 11,
    location
  });
});

module.exports = router;
