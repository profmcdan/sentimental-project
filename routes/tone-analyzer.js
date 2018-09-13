/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require("express");
const router = express.Router();
router.get("/", (req, res) =>
  res.send({
    title: "Tone Analyzer",
    searchTerm: "",
    pageNum: 9
  })
);

router.get("/:query", (req, res, next) =>
  res.send({
    title: "Tone Analyzer",
    searchTerm: req.params.query,
    pageNum: 9
  })
);
module.exports = router;
