/* Include necessary node modules */
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
// const Crawler = require("crawler");
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

// Connect to db
mongoose.connect(
  keys.mongodb.dbURI,
  { useNewUrlParser: true },
  () => {
    console.log("Database Connected");
  }
);

app.listen(app.get("port"), () => {
  console.log("Listening on port " + app.get("port"));
  // console.log(sentimentAnalysis(words));
});
