const router = require("express").Router();
const sentimentAnalysis = require("sentiment-analysis");
const removeWords = require("remove-words");
const FetchTweets = require("fetch-tweets");
const twitterKey = require("../config/keys").twitter;
const fetchTweets = new FetchTweets(twitterKey);
const Tweet = require("../models/Tweet");

const formatTweet = tweets => {
  const pos = [];
  const neg = [];

  tweets.sort((b, a) => {
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });
  tweets.slice(0, 350);

  for (let t of tweets) {
    const r = {
      body: t.body,
      location: t.location.place_name,
      sentiment: t.sentiment ? t.sentiment : sentimentAnalysis(body),
      keywords: removeWords(body)
    };
    if (r.sentiment > 0) {
      pos.push(r);
    } else if (r.sentiment < 0) {
      neg.push(r);
    }

    pos.sort((b, a) => {
      return parseFloat(a.sentiment) - parseFloat(b.sentiment);
    });
    neg.sort((a, b) => {
      return parseFloat(a.sentiment) - parseFloat(b.sentiment);
    });

    return {
      positive: pos.slice(0, 100),
      negative: neg.slice(0, 100)
    };
  }
};

// @desc GET All tweets
// @route /tweet/
// Public
router.get("/", (req, res) => {
  Tweet.find()
    .then(tweets => {
      if (!tweets) {
        return res.status(404).json({ errors: "Tweets not found" });
      }
      const data = {
        title: "Raw Tweets",
        pageNum: 7,
        data: formatTweet(tweets),
        searchTerm: ""
      };
      res.send(data);
    })
    .catch(err => {
      console.log(err);
    });
});

// @desc GET All related tweets
// @route /tweet/:query
// Public
router.get("/:query", (req, res) => {
  const searchTerm = req.params.query;
  fetchTweets.byTopic(searchTerm, results => {
    if (!results) {
      return res.status(404).json({ errors: "Tweets not found" });
    }

    const data = {
      title: "Raw Tweets",
      pageNum: 7,
      data: formatTweet(results),
      searchTerm: searchTerm
    };
    res.send(data);
  });
});

module.exports = router;
