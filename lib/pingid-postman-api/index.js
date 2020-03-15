const _ = require('lodash');
const debug = require('debug')('pingid-postman-api');
const FP = require('lodash/fp');
const fs = require('fs');
const handlebars = require('handlebars');
const markdown = require('markdown-it')({
  html: true
});
const yaml = require('js-yaml');
const codegen = require('postman-code-generators');
const sdk = require('postman-collection');
const chalk = require('chalk');
const path = require('path');
const hljs = require('highlight.js/lib/highlight.js');
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('http', require('highlight.js/lib/languages/http'));
hljs.registerLanguage('go', require('highlight.js/lib/languages/go'));
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
hljs.registerLanguage('php', require('highlight.js/lib/languages/php'));
const markdownAlerts = require('../markdown-it-alerts');

/**
 * Code highlighter
 */
const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
loadLanguages(['json']);

/**
 * Default plugin options
 */
const defaults = {
  template: path.join(__dirname, 'templates/postman-guide.hbs'),
};

// Enable Markdown extensions.
markdown.use(markdownAlerts, {
  icons: true
});

/**
 * Check if a file Postman Collection
 */
function isPostmanApi(file) {
  return /.*(postman_collection).*\.json/.test(path.parse(file).base);
} 

/**
 * Process Postman files
 */
function processFiles(options, files, metalsmith, done) {
  // Set the template for Postman files
  const template = handlebars.compile(fs.readFileSync(metalsmith.path(options.template), 'utf8'));
  // Define arrays that will hold object paths that lodash will use for object reference
  var keyArray, refArray, mdArray, headArray, bodyArray = [];
  // Flatten keys into string paths
  const flattenPostman = (obj, path = []) => {
    return (FP.isPlainObject(obj) || FP.isArray(obj))
      ? FP.reduce((acc, [k, v]) => FP.merge(acc, flattenPostman(v, [...path, k])), {}, FP.toPairs(obj))
      : {[path.join('.')]: obj}
  }

  Object.keys(files).filter(isPostmanApi).forEach((file) => {
    const data = Object.assign({}, files[file]);

    const html = path.format({
      dir: path.dirname(file),
      name: path.basename(file, path.extname(file)),
      ext: '.html',
    });

    data.postman = yaml.safeLoad(fs.readFileSync("src/" + file), 'utf8');

    // Build array of object paths that need markdown rendering
    keyArray = _.keys(flattenPostman(data.postman));
    mdArray = _.remove(keyArray, function(val) { return val.indexOf('description') > 0 || val.indexOf('raw') > 0 || _.endsWith(val, 'body') ? val : false});

    // Build array of methods and headings
    keyArray = _.keys(flattenPostman(data.postman));
    headArray = _.remove(keyArray, function(val) {
      keepit = false; 
      if (val.indexOf('name') > 0 && val.indexOf('request') < 0 && val.indexOf('response') < 0){
        parentitem = val.replace('.name', '');
        parentval = _.get(data.postman, parentitem);
        if (! parentval.hasOwnProperty('request')){
          keepit = val;
        }
      }

      return keepit;
    });

    methArray = _.remove(keyArray, function(val) {
      keepit = false; 
      if (val.indexOf('name') > 0){
        parentitem = val.replace('.name', '');
        parentval = _.get(data.postman, parentitem);
        if (parentval.hasOwnProperty('request')){
          keepit = val;
        }
      }
      
      return keepit;
    });


    _.forEach(methArray, function(val, index){
        var nameray = [];
        var reqval = val.replace('name', 'request');
        var methodval = val.replace('name', 'request.method');
        var anchorval = val.replace('name', 'htmlindex');
        var headval = val.replace('name', 'isHeading');

        // create code languages
        var jsonmethod = _.get(data.postman, reqval);

        // Testing postman codegen
        var pmreq = new sdk.Request(jsonmethod);
        var pmoptions = {
          indentCount: 3,
          indentType: 'Space',
          trimRequestBody: true,
          followRedirect: true
        };

        var curlcmd = "Could not generate";
        codegen.convert("cURL", "cURL", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            curlcmd = snippet;
          }
        });
        var cmdpath = reqval + ".commands.curl";
        const curlhi = hljs.highlight('html', curlcmd).value;
        _.set(data.postman, cmdpath, curlhi);
        
        var pycmd = "Could not generate";
        codegen.convert("Python", "Requests", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            pycmd = snippet;
          }
        });
        var pycmdpath = reqval + ".commands.python";
        const pyhi = hljs.highlight('python', pycmd).value;
        _.set(data.postman, pycmdpath, pyhi);

        var phpcmd = "Could not generate";
        codegen.convert("PHP", "HTTP_Request2", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            phpcmd = snippet;
          }
          //console.log(jsonmethod);
        });
        phpcmdpath = reqval + ".commands.php";
        const phphi = hljs.highlight('php', phpcmd).value;
        _.set(data.postman, phpcmdpath, phphi);

        var jqcmd = "Could not generate";
        codegen.convert("JavaScript", "jQuery", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            jqcmd = snippet;
          }
          //console.log(jsonmethod);
        })
        jqcmdpath = reqval + ".commands.jquery";
        const jqhi = hljs.highlight('javascript', jqcmd).value;
        _.set(data.postman, jqcmdpath, jqhi);

        var nodecmd = "Could not generate";
        codegen.convert("NodeJs", "Request", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            nodecmd = snippet;
          }
          //console.log(jsonmethod);
        })
        nodecmdpath = reqval + ".commands.node";
        const nodehi = hljs.highlight('javascript', nodecmd).value;
        _.set(data.postman, nodecmdpath, nodehi);

        var gocmd = "Could not generate";
        codegen.convert("Go", "Native", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            gocmd = snippet;
          }
          //console.log(jsonmethod);
        })
        gocmdpath = reqval + ".commands.go";
        const gohi = hljs.highlight('go', gocmd).value;
        _.set(data.postman, gocmdpath, gohi);

        var httpcmd = "Could not generate";
        codegen.convert("HTTP", "HTTP", pmreq, pmoptions, function(error, snippet){
          if(error) {
            console.log('Could not generate ' + error);
          } else {
            httpcmd = snippet;
          }
          //console.log(jsonmethod);
        });
        httpcmdpath = reqval + ".commands.http";
        const httphi = hljs.highlight('javascript', httpcmd).value;
        _.set(data.postman, httpcmdpath, httphi);
      
      nameray = _.get(data.postman, val).split(' ');
      nameray.unshift(_.get(data.postman, methodval));
      cleanid = nameray.join('-').replace(/[^\w-]+/g, '').toLowerCase();
      _.set(data.postman, anchorval, cleanid);
      _.set(data.postman, headval, false);
    })
   //console.log(JSON.stringify(codegen.getLanguageList()));

    _.forEach(headArray, function(val, index){

      var item = val.replace('name', 'item');
      var nameray = _.get(data.postman, val).split(' ');
      var anchorval = val.replace('name', 'htmlindex');
      var headval = val.replace('name', 'isHeading');
      if (item.indexOf('info') < 0) {
      // If the current item object contains an item, it's a folder. Create isFolder and set to true.
        if (typeof(_.get(data.postman, item)) !== 'undefined'){
          
            childitem = item + ".item";
            childitems = _.get(data.postman, item);
            //console.log(childitems);
            if (childitems.length > 0){
              var isFolderPath = val.substring(0, val.length - 4) + 'isFolder';
              _.set(data.postman, isFolderPath, true)
            }
        }
      }
      val = val.replace(/\.\d/g, function(x) {
        return '[' + x.substr(1) + ']';
      })

      cleanid = nameray.join('-').replace(/[^\w-]+/g, '').toLowerCase()

      // Create an htmlindex value to use as html id for navigation
      _.set(data.postman, anchorval, cleanid);
      _.set(data.postman, headval, true);

    })

    _.forEach(mdArray, function(val){
      var schema = data.postman;
      var pList = val.split('.');
      var len = pList.length;
      var content = _.get(data.postman, val);

      for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
      }
      if (pList[i] == 'raw'){
        schema[pList[len-1]] = content.replace(/\</g, "&lt;");
        //schema[pList[len-1]] = _.replace(markdown.render(content), /^(<p>)|(<\/p>\s*)$/g, '');   
      } else if (pList[i] == 'body'){
        
        content = hljs.fixMarkup(content);
        //content = content.replace(/[^\S\r\n]/g, '');
        //schema[pList[len-1]] = Prism.highlight(content, Prism.languages.json, 'json');
        schema[pList[len-1]] = hljs.highlight('json', content).value;
      } else {
        schema[pList[len-1]] = markdown.render(hljs.fixMarkup(content));
      }
    })

    // Grab obj paths for all $refs, then sort to have Components first. Sufficient for nested refs?
    refArray = _.remove(keyArray, function(val) { return val.indexOf('$ref') > 0 ? val : false}).sort();
    
    _.forEach(refArray, function(val) {
      var rootPath = "postman." + _.replace(val, /\.\$ref$/, '');
      var valPath = _.get(data.postman, val);
      var dataVal = "postman." + val;
      var schema = data;
      var pList = rootPath.split('.');
      var len = pList.length;

      if (valPath.indexOf('#') === 0 ){
        valPath = 'postman.' + _.replace(valPath.substr(2, valPath.length), /\//g, '.');
      }
      for(var i = 0; i < len-1; i++) {
          var elem = pList[i];
          if( !schema[elem] ) schema[elem] = {}
          schema = schema[elem];
      }
    
      schema[pList[len-1]] = _.get(data, valPath);

    })
    
    refArray = _.remove(keyArray, function(val) { return val.indexOf('responses') > 0 ? val : false});

    data.contents = new Buffer(template(data));

    files[html] = data;

    if(/\.postman$/.test(path.extname(file))) delete files[file];

  });

  done();
}

/**
 * Metalsmith plugin to parse OpenAPI specs with Swagger-Ui
 */
module.exports = (opt) => {
  const options = Object.assign({}, defaults, opt);

  return (files, metalsmith, done) => {
    processFiles(options, files, metalsmith, done);
  };
};