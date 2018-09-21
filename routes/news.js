const router = require("express").Router();
const keys = require("../config/keys");
const { google } = require("googleapis");
const customSearch = google.customsearch("v1");

async function runSample(options) {
  console.log(options);
  const res = await customSearch.cse.list({
    cx: options.cx,
    q: options.q,
    auth: options.apiKey
  });
  console.log(res.data);
  return res.data;
}

router.get("/:keyword", (req, res) => {
  customSearch.cse
    .list({
      cx: keys.googleCustomSearch.engine,
      q: req.params.keyword,
      auth: keys.googleCustomSearch.apiKey
    })
    .then(results => {
      return res.json(results.data.items);
    })
    .catch(err => {
      return res.status(400).json(err);
    });
});

module.exports = router;
