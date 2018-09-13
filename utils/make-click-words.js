/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const removeWords = require("remove-words");

// Makes keywords click-able hyperlinks, returns HTML
const makeClickWords = function(body) {
  const clWord = word => `${word}`.toLowerCase().replace(/\W/g, "");
  const clickWords = removeWords(body); // Array of keywords
  let htmlTweet = "";
  const aStyle = 'style="color: black; font-weight: bold;" '; // style for hyperlinks
  for (let word of Array.from(body.split(" "))) {
    var needle;
    if (((needle = clWord(word)), Array.from(clickWords).includes(needle))) {
      htmlTweet += `<a ${aStyle} href='/text-tweets/${clWord(
        word
      )}'>${word}</a> `;
    } else {
      htmlTweet += `${word} `;
    }
  }
  return htmlTweet;
};

module.exports = makeClickWords;
