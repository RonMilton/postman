'use strict';

const container = require('markdown-it-container');

module.exports = function alerts_plugin(md, options) {
  let containerOpenCount = 0;
  
  const links = options ? options.links : true;
  const icons = options ? options.icons : false;
  init();

  function setupContainer(name) {
    md.use(container, name, {
      validate: function(params){
        return params.trim() == name;
      },
      render: function (tokens, idx) {
        let html;
        if (tokens[idx].nesting === 1) {
          containerOpenCount += 1;
          html = '<div class="alert alert-' + name + '" role="alert">\n';
          if (icons) {
            html += '<div class="alert-inner">\n';
            html += '<div class="alert-icon"><i class="' + icon(name) +
              '" aria-hidden="true"></i></div>';
            html += '<div class="alert-message">';
          }
          return html;
        } else {
          containerOpenCount -= 1;
          html = '</div>\n';
          if (icons) {
            html += '</div>\n</div>\n';
          }
          return html;
        }
      }
    });
  }

  function isContainerOpen() {
    return containerOpenCount > 0;
  }

  function selfRender(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  }

  function setupLinks() {
    const defaultRender = md.renderer.rules.link_open || selfRender;

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      if (isContainerOpen()) {
        tokens[idx].attrPush(['class', 'alert-link']);
      }

      return defaultRender(tokens, idx, options, env, self);
    };
  }

  function icon(name) {
    switch(name) {
      case "warning":
        return "fas fa-exclamation-triangle";
      case "danger":
        return "fas fa-exclamation-circle";
      case "success":
        return "fas fa-check-circle";
      default:
        return "fas fa-info-circle";
    }
  }

  function init() {
    setupContainer('success');
    setupContainer('info');
    setupContainer('warning');
    setupContainer('danger');

    if (links) {
      setupLinks();
    }
  }
};