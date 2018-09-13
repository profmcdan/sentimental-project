/* Include necessary node modules */
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const Crawler = require("crawler");
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

// Connect to db
mongoose.connect(
  keys.mongodb.dbURI,
  { useNewUrlParser: true },
  () => {
    console.log("Database Connected");
  }
);

var c = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      console.log($("title").text());
    }
    done();
  }
});

// Queue just one URL, with default callback
c.queue("http://www.amazon.com");

// Queue a list of URLs
c.queue([
  "http://www.google.com/",
  "http://www.yahoo.com",
  "https://www.npmjs.com/package/node-webcrawler"
]);

// Queue URLs with custom callbacks & parameters
c.queue([
  {
    uri: "https://www.npmjs.com/package/node-webcrawler",
    jQuery: false,

    // The global callback won't be called
    callback: function(error, res, done) {
      if (error) {
        console.log(error);
      } else {
        console.log("Grabbed", res.body.length, "bytes");
      }
      done();
    }
  }
]);

// Queue some HTML code directly without grabbing (mostly for tests)
c.queue([
  {
    html: "<p>This is a <strong>test</strong></p>"
  }
]);

app.listen(app.get("port"), () => {
  console.log("Listening on port " + app.get("port"));
  // console.log(sentimentAnalysis(words));
});
