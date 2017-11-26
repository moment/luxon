// This is a plugin for ESDoc that modifies the docs output to look how we want
const cheerio = require('cheerio'),
  path = require('path');

exports.onHandleHTML = function(ev) {
  if (path.extname(ev.data.fileName) !== '.html') return;

  const $ = cheerio.load(ev.data.html);

  // The original titles are the section name, which are unhelpful
  $('head title').text('Luxon');

  // Add Luxon to the page so you can play with it while browsing the docs
  $('body').append("<script src='https://moment.github.io/luxon/global/luxon.js'/>");

  // The little 100% documented badge was too prominent.
  $('p.manual-badge').remove();

  // Identify that this page is about Luxon
  $('header').prepend('<span class="luxon-title">Luxon</span>');

  // I didn't like the terminology it used for the API ref links
  $('.manual-color-reference > span').text('API reference');
  $('.manual-color-reference > a').text('API reference');

  ev.data.html = $.html();
};
