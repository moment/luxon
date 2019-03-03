// This is a plugin for ESDoc that modifies the docs output to look how we want
const cheerio = require("cheerio"),
  path = require("path");

exports.onHandleContent = function(ev) {
  if (path.extname(ev.data.fileName) !== ".html") return;

  const $ = cheerio.load(ev.data.content);

  // Add Luxon to the page so you can play with it while browsing the docs
  $("body").append("<script src='https://moment.github.io/luxon/global/luxon.js'/>");
  $("body").append(
    "<script>console.log('You can try Luxon right here using the `luxon` global, like `luxon.DateTime.local()`.')</script>"
  );

  // The little "100% documented" badge was too prominent.
  $("p.manual-badge").remove();

  // Identify that this page is about Luxon
  $("header").prepend('<a href="../index.html" class="luxon-title">Luxon</a>');
  $("head").append("<style>.luxon-title {font-size: 22px; color: black;}</style>");

  // Naming things better
  $('header > a:contains("Home")').text("Manual");

  // Read the source on Github, yo
  $('header > a:contains("Source")').remove();

  // Grammar snobbery
  $('h1:contains("References")').text("Reference");

  ev.data.content = $.html();
};
