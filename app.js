/* Include necessary node modules */
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
// const config = require("./config/app-config");

var sentimentAnalysis = require("sentiment-analysis");

const keys = require("./config/keys");

/* Create Express server and configure socket.io */
var app = express();
// var server = http.createServer(app);
// var io = require("sock").listen(server);
// server.listen(config.server.port, function() {
//   console.log("Express server listening on port " + config.server.port);
// });

/* Set up other Express bits and bobs */
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 8004);

const mainRoute = require("./routes/home");
const searchRoutes = require("./routes/search");
const formattedRoutes = require("./routes/break-down");
const compareRoutes = require("./routes/comparer");
const entityRoutes = require("./routes/entity-extraction");
const globeRoutes = require("./routes/globe");
const hexagonRoutes = require("./routes/hexagons");
const mapRoutes = require("./routes/map");
const regionMapRoutes = require("./routes/region-map");

// Connect to db
mongoose.connect(
  keys.mongodb.dbURI,
  { useNewUrlParser: true },
  () => {
    console.log("Database Connected");
  }
);

/* Specify which route files to use */
// Route Setup
app.use("/home", mainRoute);
app.use("/search", searchRoutes);
app.use("/format", formattedRoutes);
app.use("/compare", compareRoutes);
app.use("/entity", entityRoutes);
app.use("/globe", globeRoutes);
app.use("/hexagon", hexagonRoutes);
app.use("/map", mapRoutes);
// app.use("/region", regionMapRoutes);
app.use("/text-tweets", require("./routes/text-tweet"));

// Create home route
app.get("/", (req, res) => {
  res.send({
    message: "Sentiment Analysis API Backend",
    author: "Daniel Ale",
    version: "1.0.0"
  });
});

/* catch 404 and forward to error handler */
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/*-- error handlers -- */

/* development error handler (will print stacktrace) */
if (app.get("env") === "development") {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

/* production error handler (no stacktraces leaked to user) */
app.use(function(err, req, res) {
  res.status(500).json({
    message: err.message,
    error: {}
  });
});

// NairaLand Scrapper
const NlScraper = require("nairaland-scraper");

const latest = new NlScraper();

// latest.getScrapedData({ limit: 10 }, function(err, topics) {
//   if (err) {
//     console.log(err);
//   }
//   console.log(topics);
//   return topics;
// });

// const queryOptions = {
//   q: "Buhari",
//   board: 2,
//   limit: 3
// };

// latest.getSERPScrapedData(queryOptions, function(err, comments) {
//   console.log(comments);
//   return;
// });

// Listen to a port number
app.listen(app.get("port"), () => {
  console.log("Listening on port " + app.get("port"));
  // console.log(sentimentAnalysis(words));
});
