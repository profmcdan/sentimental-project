/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var MakeSummarySentences = (function() {
  let findAv = undefined;
  let getAverageSentiments = undefined;
  let getOverallSentimentName = undefined;
  let makeTxtStyle = undefined;
  let makeGlobeSentence = undefined;
  let makeMapSentences = undefined;
  MakeSummarySentences = class MakeSummarySentences {
    static initClass() {
      // Finds the average value for an array of numbers
      findAv = function(arr) {
        let t = 0;
        for (let i of Array.from(arr)) {
          t += i;
        }
        return t / arr.length;
      };

      // Finds average positive, negative and overall sentiment from list of tweets
      getAverageSentiments = function(tweetObjects) {
        const posSent = [];
        const negSent = [];
        const neuSent = [];

        for (let item of Array.from(tweetObjects)) {
          if (item.sentiment > 0) {
            posSent.push(item.sentiment);
          } else if (item.sentiment < 0) {
            negSent.push(item.sentiment);
          } else {
            neuSent.push(0);
          }
        }

        return {
          avPositive: Math.round(findAv(posSent) * 100),
          avNegative: Math.round(findAv(negSent) * -100),
          avSentiment: Math.round(
            findAv(posSent.concat(negSent).concat(neuSent)) * 100
          ),
          totalPositive: posSent.length,
          totalNegative: negSent.length
        };
      };

      // Determines if the overall sentiment is "Positive", "Negative" or "Neutral"
      getOverallSentimentName = function(avSentiment) {
        if (avSentiment > 0) {
          return "Positive";
        } else if (avSentiment < 0) {
          return "Negative";
        } else {
          return "Neutral";
        }
      };

      makeTxtStyle = function(sentiment) {
        const col =
          sentiment > 0 || sentiment === "Positive"
            ? "green"
            : sentiment < 0 || sentiment === "Negative"
              ? "darkred"
              : "gray";
        return ` style='font-weight: bold; color: ${col}' `;
      };

      makeGlobeSentence = function(tweetObjects, relTo, averages, overallSent) {
        const numRes = `<b><span id='numRes'>${tweetObjects.length}</span></b>`;
        let overallSentTxt = `<span ${makeTxtStyle(
          overallSent
        )} >${overallSent}`;
        overallSentTxt += `(${averages.avSentiment}%)</span>`;
        const positivePercent = `<span ${makeTxtStyle(1)}>${
          averages.avPositive
        }%</span>`;
        const negativePercent = `<span ${makeTxtStyle(-1)}>${
          averages.avNegative
        }%</span>`;
        let s = `Globe displaying ${numRes} sentiment values calculated `;
        s += `from Twitter results ${relTo} `;
        s += `the overall sentiment is ${overallSentTxt}.`;
        s += "<br><br>";
        s += `${averages.totalPositive} Tweets are positive `;
        s += `with an average sentiment of ${positivePercent} `;
        s += `and ${averages.totalNegative} Tweets are negative `;
        s += `with an average sentiment of ${negativePercent}.`;
        return s;
      };

      makeMapSentences = function(tweetObjects, averages, overallSent, relTo) {
        const numRes = `<b><span id='numRes'>${tweetObjects.length}</span></b>`;
        let mapShowing = `Map showing ${numRes} `;
        mapShowing += `of the latest Twitter results ${relTo}<br>`;
        mapShowing += "Overall sentiment is: ";
        mapShowing += `<span ${makeTxtStyle(overallSent)} >${overallSent} `;
        mapShowing += `(${averages.avSentiment}%)</span>`;

        const p = makeTxtStyle(1);
        const n = makeTxtStyle(-1);

        let sentimentSummary = `Average positive: <b ${p}>${
          averages.avPositive
        }%</b>.<br>`;
        sentimentSummary += `Average negative: <b ${n}>${
          averages.avNegative
        }%</b>.`;

        return {
          mapShowing,
          sentimentSummary
        };
      };
    }

    constructor(tweetObjects, searchTerm = null) {
      this.tweetObjects = tweetObjects;
      this.searchTerm = searchTerm;
    }

    // Makes the sentences for the map
    makeMapSentences() {
      const averages = getAverageSentiments(this.tweetObjects);
      const overallSent = getOverallSentimentName(averages.avSentiment);
      const relTo =
        this.searchTerm != null ? `relating to <b>${this.searchTerm}</b>` : "";

      const mapSentences = makeMapSentences(
        this.tweetObjects,
        averages,
        overallSent,
        relTo
      );
      return {
        mapShowing: mapSentences.mapShowing,
        sentimentSummary: mapSentences.sentimentSummary,
        globeSentence: makeGlobeSentence(
          this.tweetObjects,
          relTo,
          averages,
          overallSent
        ),
        searchTerm: this.searchTerm ? this.searchTerm : ""
      };
    }
  };
  MakeSummarySentences.initClass();
  return MakeSummarySentences;
})();

module.exports = MakeSummarySentences;
