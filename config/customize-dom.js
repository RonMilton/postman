/**
 * Directives in this file apply DOM post-processing to HTML files that
 * have been generated from Markdown. For example, you can use this to
 * apply style changes that cannot be expressed with Markdown's basic
 * formatting syntax.
 *
 * This uses the Cheerio <https://cheerio.js.org/> API, which should be
 * the same as jQuery in most respects.
 */
module.exports = ($, filename, files) => {
  const type = files[filename].type;
  if (type && type === 'api') {
    $('table').addClass('table table-bordered table-striped table-hover');
  }
  if (type && type === 'guide') {
    $('table').addClass('table table-condensed devp-basic-table');
  }
  // Wrap Markdown code blocks. It would be better to select 'pre > code',
  // but that will wrap the code element rather than the pre element.
  $('pre').not('.req').wrap('<div class="devp-code-block"></div>');
};