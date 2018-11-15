const router = require("express").Router();
var NLScraper = require("nairaland-scraper");

router.get("/:keyword", (req, res) => {
	const queryOptions = {
		q: req.params.keyword,
		board: 5,
		limit: 20
	};
	var latest = new NLScraper();

	latest.getSERPScrapedData(queryOptions, function(err, comments) {
		console.log(comments);
		return res.json(comments);
	});
});

module.exports = router;
