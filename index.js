const Metalsmith = require('metalsmith'),
      assets = require('metalsmith-static'),
      markdown = require('metalsmith-markdownit'),
      chalk = require('chalk'),
      sass = require('metalsmith-sass'),
      discPartials = require('metalsmith-discover-partials'),
      permalinks = require('metalsmith-permalinks'),
      markdownAlerts = require('./lib/markdown-it-alerts'),
      registerHelpers = require('metalsmith-register-helpers'),
      postmanReader = require('./lib/pingid-postman-api'),
      metallic = require('metalsmith-metallic'),
      msIf = require('metalsmith-if'),
      jquery = require('metalsmith-jquery'),
      serve = require('metalsmith-serve'),
      watch = require('metalsmith-watch');

/*
 * Configure the Markdown parser here.
 */
var md = markdown('default', {
  typographer: true, // Enable smart quotes, etc.
  html: true // Allow inline HTML.
})

// Enable Markdown extensions.
md.parser.use(markdownAlerts, {
  icons: true
});

/*
 * How this works: The publishing system is a simple processing pipeline. Each
 * plugin is invoked one by one and given the set of files in the 'src'
 * directory. The results of each plugin are passed to the next until the
 * build() method is finally reached.
 */
console.log(chalk.green('Building developer documentation...'));


Metalsmith(__dirname)
  .concurrency(768)
  .clean(true)
  .source('src')
  .destination('output')

  /***********************************************************************
   *
   * At this point in processing, all articles are in raw Markdown format.
   *
   ***********************************************************************/
  
  /*
   * Load sass styles
   */
  .use(sass({
    outputStyle: "expanded",
    outputDir: "css"
  }))

  .use(registerHelpers({
    directory: "helpers"
  }))

  /*
   * Perform in-place Handlebars template rendering.
   * This allows doc navigation to be generated.
  */
  .use(discPartials({
    directory: 'partials',
    pattern: /\.hbs$/
  }))
 
  // Process postman json using the ref'd template
  .use(postmanReader({
    template: 'templates/postman-guide.hbs'
  }))
  /*
   * Enable code syntax highlighting.
   * For this to work, the Markdown parser must accept inline HTML in the
   * Markdown source.
   */
  .use(metallic(null))

  /*
   * Process *.md files as Markdown and output as .html files.
   */
  .use(md)

 /************************************************************************
  *
  * At this point in processing, plugins should expect files to be HTML.
  *
  ************************************************************************/


  /*
   * Use JQuery to manipulate the DOMs of generated HTML files. This allows
   * specific CSS classes to be added without needing to add style
   * information directly to the Markdown source, for example.
   */
  .use(jquery('**/*.html', 'config/customize-dom.js'))

  /*
   * This copies each article to a directory of its own with an index file.
   * For example, "how-to-do-something.html" becomes "how-to-do-something/index.html".
   * This makes URI portability possible by not forcing us to link to documents
   * with file extensions.
   */
  .use(permalinks(null))

  
  /***********************************************************************
   *
   * At this point in processing, all article processing is complete.
   *
   ***********************************************************************/

  /*
   * Copy static assets.
   */
  .use(assets([
    {
      src: "static/css",
      dest: 'css'
    },
    {
      src: "static/ico",
      dest: 'ico'
    },
    {
      src: "static/img",
      dest: 'img'
    },
    {
      src: "static/js",
      dest: 'js'
    },
    {
      src: "static/vendor",
      dest: 'vendor'
    },
    {
    src: "static/fonts",
    dest: 'fonts'
  },
  ]))

  /*
   * Reload local server when content changes. Changes to partials and
   * templates are NOT watched.
   */
  
  .use(
    watch({
      paths: {
        "${source}/**/*": true
      },
      livereload: false
    })
  )

  /*
   * Run local server.
   */
  .use(
    serve({
      port: 4001,
      verbose: true,
      http_error_files: {
        404: "/errors/404/"
      }
    })
  )
    /*
   * Run local server.
   */
  .use(msIf(
    DEPLOYMENT_STAGE === 'development',
    serve({
      port: 4001,
      verbose: true,
      http_error_files: {
        404: "/errors/404.html"
      }
    })
  ))

  .use(msIf(
    DEPLOYMENT_STAGE === 'docker',
    serve({
      host: "0.0.0.0",
      port: 4001,
      verbose: true,
      http_error_files: {
        404: "/errors/404.html"
      }
    })
  ))

  .build((err, files) => {
    if (err) throw err;
  });
