/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const watson = require("watson-developer-cloud");
const watsonCredentials = require("../config/keys").watson;

// Format tone data
const formatResults = function(toneResults) {
  const results = [];
  const toneCategories = toneResults.document_tone.tone_categories;
  for (let toneCategory of Array.from(
    toneCategories.slice(0, toneCategories.length - 1)
  )) {
    for (let tone of Array.from(toneCategory.tones)) {
      results.push({ name: tone.tone_name, score: tone.score });
    }
  }
  return results;
};

// Fetch tone analyser results from BlueMix instance
const fetchToneAnalyzerResults = function(tweetsArr, callback) {
  let text = "";
  for (let tweet of Array.from(tweetsArr)) {
    text += tweet.body + " ";
  }
  const tone_analyzer = watson.tone_analyzer({
    username: watsonCredentials.username,
    password: watsonCredentials.password,
    version: "v3-beta",
    version_date: "2016-02-11"
  });
  return tone_analyzer.tone({ text }, function(err, tone) {
    if (err) {
      console.log(err);
      return callback({});
    } else {
      return callback(formatResults(tone));
    }
  });
};

module.exports = fetchToneAnalyzerResults;
