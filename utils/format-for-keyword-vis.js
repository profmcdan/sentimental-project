/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Tweet = require("../models/Tweet"); // The Tweet model
const MakeSummarySentences = require("../utils/make-summary-sentences");
const removeWords = require("remove-words");
const sentimentAnalysis = require("sentiment-analysis");
const FetchTweets = require("fetch-tweets");

// API keys
const twitterKey = require("../config/keys").twitter;

const fetchTweets = new FetchTweets(twitterKey);

var FormatWordsForCloud = (function() {
  let formatResultsForCloud = undefined;
  let findTopWords = undefined;
  let findTrendingWords = undefined;
  let makeTweetWords = undefined;
  let mergeResults = undefined;
  let makeSentence = undefined;
  FormatWordsForCloud = class FormatWordsForCloud {
    static initClass() {
      // Converts ordinary Tweet array to suitable form for word cloud
      formatResultsForCloud = function(twitterResults, allWords) {
        if (allWords == null) {
          allWords = false;
        }
        const results = [];
        const tweetWords = makeTweetWords(twitterResults);
        for (var word of Array.from(tweetWords)) {
          const sent = sentimentAnalysis(word);
          if (allWords || sent !== 0) {
            const f = results.filter(item => item.text === word);
            if (f.length === 0) {
              results.push({ text: word, sentiment: sent, freq: 1 });
            } else {
              for (let res of Array.from(results)) {
                if (res.text === word) {
                  res.freq++;
                }
              }
            }
          }
        }
        return results;
      };

      findTopWords = function(cloudWords) {
        let posData = cloudWords.filter(cw => cw.sentiment > 0);
        let negData = cloudWords.filter(cw => cw.sentiment < 0);
        let neutData = cloudWords.filter(cw => cw.sentiment === 0);

        posData.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
        posData = posData.reverse().slice(0, 5);
        negData.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
        negData = negData.reverse().slice(0, 5);
        neutData.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
        neutData = neutData.reverse().slice(0, 5);

        return {
          topPositive: posData,
          topNegative: negData,
          topNeutral: neutData
        };
      };

      findTrendingWords = function(cloudWords) {
        cloudWords.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
        return (cloudWords = cloudWords.reverse().slice(0, 10));
      };

      // Make a paragraph of keywords
      makeTweetWords = function(twitterResults) {
        let para = "";
        for (let tweet of Array.from(twitterResults)) {
          para += tweet.body + " ";
        }
        return removeWords(para, false);
      };

      // Merge two sets of results
      mergeResults = (res1, res2) => res1.concat(res2);

      // Make sentence description for map
      makeSentence = (data, searchTerm) =>
        new MakeSummarySentences(data, searchTerm).makeMapSentences();
    }

    // Calls methods to fetch and format Tweets from the database
    renderWithDatabaseResults(cb) {
      return Tweet.getAllTweets(function(tweets) {
        const cloudData = formatResultsForCloud(tweets);
        const sentence = makeSentence(tweets, null);
        sentence.topWords = findTopWords(cloudData);
        return cb(cloudData, sentence);
      });
    }

    // Calls methods to fetch fresh Twitter, sentiment, and place data
    renderWithFreshData(searchTerm, cb) {
      return fetchTweets.byTopic(searchTerm, webTweets =>
        Tweet.searchTweets(searchTerm, function(dbTweets) {
          // Fetch matching db results
          const data = mergeResults(webTweets, dbTweets);
          const cloudData = formatResultsForCloud(data, true);
          const sentence = makeSentence(data, searchTerm);
          sentence.topWords = findTopWords(cloudData);
          sentence.trending = findTrendingWords(cloudData);
          return cb(cloudData, sentence);
        })
      );
    }

    findTrends(tweets) {
      return findTopWords(formatResultsForCloud(tweets, true));
    }
  };
  FormatWordsForCloud.initClass();
  return FormatWordsForCloud;
})();

const fwfc = new FormatWordsForCloud();
module.exports.getFreshData = fwfc.renderWithFreshData;
module.exports.getDbData = fwfc.renderWithDatabaseResults;
module.exports.findTopWords = fwfc.findTrends;
