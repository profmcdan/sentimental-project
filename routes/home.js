/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require("express");
const router = express.Router();
const fetchSentimentTweets = require("../utils/fetch-sentiment-tweets");
const Tweet = require("../models/Tweet");
// @desc GET about info
// @route /home/about
// Public
router.get("/about", (req, res) => res.json({ title: "About", pageNum: -1 }));

// @desc GET All tweets
// @route /home
// Public
router.get("/", (req, res) =>
  fetchSentimentTweets("", (
    results,
    average // Fetch all data
  ) =>
    res.send({
      // Render template
      title: "Sentiment Sweep",
      pageNum: 0,
      data: results,
      averageSentiment: average
    })
  )
);

router.get("/now", (req, res) =>
  res.send({
    title: "The world right now | Sentiment Sweep",
    pageNum: 15
  })
);

router.post("/new", (req, res) => {
  const { body, dateTime, keywords } = req.body;
  const newTweet = new Tweet({
    body,
    dateTime,
    keywords
  });

  newTweet
    .save()
    .then(result => {
      return res.json(result);
    })
    .catch(err => {
      return res.status(400).json({ errors: "An error occurred" });
    });
});

module.exports = router;
