const express = require("express");
const router = express.Router();

const tweetTimeFormatter = require("../utils/make-timeline-data");

router.get("/", (req, res) => {
  tweetTimeFormatter.getDbData((data, txt) =>
    res.send({
      title: "Time Line",
      pageNum: 3,
      data,
      searchTerm: ""
    })
  );
});

router.get("/:query", function(req, res) {
  const searchTerm = req.params.query; // Get the search term from URL param
  return tweetTimeFormatter.getFreshData(searchTerm, (data, txt) =>
    res.send({
      title: "Time Line",
      pageNum: 3,
      data,
      searchTerm
    })
  );
});

module.exports = router;
