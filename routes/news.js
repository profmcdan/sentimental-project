const router = require("express").Router();
const keys = require("../config/keys");
const { google } = require("googleapis");
const customSearch = google.customsearch("v1");
const newsAPIKey = require("../config/keys").newApiKey;
const NewsAPI = require("newsapi");

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

router.get("/custom/:keyword", (req, res) => {
	customSearch.cse
		.list({
			cx: keys.googleCustomSearch.engine,
			q: req.params.keyword,
			auth: keys.googleCustomSearch.apiKey
		})
		.then((results) => {
			return res.json(results.data.items);
		})
		.catch((err) => {
			return res.status(400).json(err);
		});
});

router.get("/:keyword", (req, res) => {
	const newsapi = new NewsAPI(newsAPIKey);

	newsapi.v2
		.everything({
			q: req.params.keyword,
			page: 5
		})
		.then((response) => {
			return res.json(response);
		})
		.catch((err) => {
			return res.status(400).json(err);
		});
});

router.get("/:keyword/:from/:to", (req, res) => {
	const newsapi = new NewsAPI(newsAPIKey);

	newsapi.v2
		.everything({
			q: req.params.keyword,
			from: req.params.from,
			to: req.params.to,
			page: 5
		})
		.then((response) => {
			return res.json(response);
		})
		.catch((err) => {
			return res.status(400).json(err);
		});
});

module.exports = router;
