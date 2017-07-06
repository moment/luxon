const cheerio = require('cheerio'),
      path = require('path');

exports.onHandleHTML = function(ev) {
 if (path.extname(ev.data.fileName) !== '.html') return;

  const $ = cheerio.load(ev.data.html);

  $('head title').text('Luxon');

  $('p.manual-badge').remove();

  $('header').prepend('<span class="luxon-title">Luxon</span>');

  $('.manual-color-reference > span').text('API reference');
  $('.manual-color-reference > a').text('API reference');

  ev.data.html = $.html();
};
