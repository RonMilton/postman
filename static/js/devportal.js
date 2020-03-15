// Custom js


// MODIFICATIONS TO SCROLLSPY PLUGIN
/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.6
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+ function($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
      this.$body = $(document.body);
      this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
      this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
      this.selector = (this.options.target || '') + ' .nav li > a';
      this.offsets = [];
      this.targets = [];
      this.activeTarget = null;
      this.scrollHeight = 0;

      this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
      this.refresh();
      this.process();
  }

  ScrollSpy.VERSION = '3.3.6';

  ScrollSpy.DEFAULTS = {
      offset: 10
  };

  ScrollSpy.prototype.getScrollHeight = function() {
      return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
  };

  ScrollSpy.prototype.refresh = function() {
      var that = this;
      var offsetMethod = 'offset';
      var offsetBase = 0;

      this.offsets = [];
      this.targets = [];
      this.scrollHeight = this.getScrollHeight();

      if (!$.isWindow(this.$scrollElement[0])) {
          offsetMethod = 'position';
          offsetBase = this.$scrollElement.scrollTop();
      }

      this.$body
        .find(this.selector)
        .map(function() {
            var $el = $(this);
            var href = $el.data('target') || $el.attr('href');
            var $href = /^#./.test(href) && $(href);

            return ($href && $href.length && $href.is(':visible') && [
                  [$href[offsetMethod]().top + offsetBase, href]
              ]) || null;
        })
        .sort(function(a, b) {
            return a[0] - b[0];
        })
        .each(function() {
            that.offsets.push(this[0]);
            that.targets.push(this[1]);
        })
  };

  ScrollSpy.prototype.process = function() {
      var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
      var scrollHeight = this.getScrollHeight();
      // var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
      var offsets = this.offsets;
      var targets = this.targets;
      var activeTarget = this.activeTarget;
      var i;

      if (this.scrollHeight != scrollHeight) {
          this.refresh();
      }

      // BDE - commented this out to get it to work
      // if (scrollTop >= maxScroll) {
      //   return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
      // }

      if (activeTarget && scrollTop < offsets[0]) {
          this.activeTarget = null;
          return this.clear();
      }

      for (i = offsets.length; i--;) {
          activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i]);
      }
  };

  ScrollSpy.prototype.activate = function(target) {
      this.activeTarget = target;

      this.clear();

      var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]';

      var active = $(selector)
      // BDE - changed this to only refer to single parent. Also changed class to 'active2'
      // .parents('li')
      // .addClass('active')
        .parent('li')
        .addClass('active2');

      if (active.parent('.dropdown-menu').length) {
          active = active
            .closest('li.dropdown')
            .addClass('active')
      }

      active.trigger('activate.bs.scrollspy');
  };

  ScrollSpy.prototype.clear = function() {
      $(this.selector)
      // BDE - changed class to 'active2'
      // .parentsUntil(this.options.target, '.active')
      // .removeClass('active')
        .parentsUntil(this.options.target, '.active2')
        .removeClass('active2');
  };


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
      return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.scrollspy');
          var options = typeof option == 'object' && option;

          if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)));
          if (typeof option == 'string') data[option]();
      })
  }

  var old = $.fn.scrollspy;

  $.fn.scrollspy = Plugin;
  $.fn.scrollspy.Constructor = ScrollSpy;


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function() {
      $.fn.scrollspy = old;
      return this;
  };


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function() {
      $('[data-spy="scroll"]').each(function() {
          var $spy = $(this);
          Plugin.call($spy, $spy.data());
      })
  });

}(jQuery);

// this is executed when the reCAPTCHA script has loaded; contains feedback logic
var recaptchaReadyCallback = function() {
var recaptchaWidget = null;

var resetRecaptchaWidget = function() {
  var container = $('#devp-recaptcha-container');
  container.empty();
  container.append('<div id="devp-recaptcha-widget" class="g-recaptcha"></div>');
  recaptchaWidget = null;
};

var postFeedback = function(el, vote, comment, recaptchaResponse) {
  console.log('feedback received', vote, comment, recaptchaResponse);
  $('.devp-feedback-error-container').hide();
  $('.devp-feedback-error-message').empty();
  $('.devp-feedback-waiting').show();
  $('.devp-feedback-submit').prop("disabled", true);
  $.ajax({
    method: 'POST',
    url: window.dp.FEEDBACK_SERVICE_ENDPOINT,
    accepts: 'application/json',
    contentType: 'application/json',
    headers: {
      Accept: 'application/json'
    },
    data: JSON.stringify({
      url: document.URL,
      vote: vote,
      comment: comment,
      recaptchaResponse: recaptchaResponse
    }),
    dataType: 'json',
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('error submitting feedback', jqXHR, textStatus, errorThrown);
      $('.devp-feedback-waiting').hide();
      $('.devp-feedback-submit').prop("disabled", false);
      $('.devp-feedback-error-container').show();
      if (jqXHR.responseJSON) {
        $('.devp-feedback-error-message').append(jqXHR.responseJSON.errors);
      } else {
        $('.devp-feedback-error-message').append('Unknown error (possibly a CORS error)');
      }
      grecaptcha.reset(recaptchaWidget);
    },
    success: function(data) {
      console.log('feedback posted', data);
      $('.devp-feedback-submit').prop("disabled", false);
      acknowledgeFeedback(el);
      resetRecaptchaWidget();
    }
  });
};

var acknowledgeFeedback = function(popoverEl) {
  var popover = popoverEl.data('bs.popover');
  var newContent = $('#devp-feedback-success-content');
  popover.tip().find('.popover-content').html(newContent.html());
  popover.tip().addClass(popover.options.placement);
  var calculated_offset = popover.getCalculatedOffset(
    popover.options.placement, popover.getPosition(),
    popover.$tip[0].offsetWidth, popover.$tip[0].offsetHeight
  );
  popover.applyPlacement(calculated_offset, popover.options.placement);
};

var thumbsUp = $('.devp-feedback-up');
var upVoteCallback = function(recaptchaResponse) {
  var comment = window.dp.up.comment;
  postFeedback(thumbsUp, 'up', comment, recaptchaResponse);
};
var upVoteRecaptchaOptions = {
  sitekey: window.dp.RECAPTCHA_SITE_KEY,
  size: 'invisible',
  theme: 'light',
  callback: upVoteCallback
};

var thumbsDown = $('.devp-feedback-down');
var downVoteCallback = function(recaptchaResponse) {
  var comment = window.dp.down.comment;
  postFeedback(thumbsDown, 'down', comment, recaptchaResponse);
};
var downVoteRecaptchaOptions = {
  sitekey: window.dp.RECAPTCHA_SITE_KEY,
  size: 'invisible',
  theme: 'light',
  callback: downVoteCallback
};

thumbsUp.on('click', function() {
  $('.devp-feedback-down').popover('hide');
  $('.devp-feedback-up').popover('toggle');
  $('.devp-feedback-waiting').hide();
  $('.devp-feedback-error-container').hide();
  recaptchaWidget = grecaptcha.render('devp-recaptcha-widget', upVoteRecaptchaOptions);
});

thumbsDown.on('click', function() {
  $('.devp-feedback-up').popover('hide');
  $('.devp-feedback-down').popover('toggle');
  $('.devp-feedback-waiting').hide();
  $('.devp-feedback-error-container').hide();
  recaptchaWidget = grecaptcha.render('devp-recaptcha-widget', downVoteRecaptchaOptions);
});

$(document).on('click', '#devp-feedback-up-submit', function() {
  var comment = $('.popover #devp-feedback-up-comment').val();
  window.dp.up = {
    comment: comment
  };
  grecaptcha.execute(recaptchaWidget);
});

$(document).on('click', '#devp-feedback-up-cancel', function() {
  resetRecaptchaWidget();
  $(this).parents(".popover").popover('hide');
});

$(document).on('click', '#devp-feedback-down-submit', function() {
  var comment = $('.popover #devp-feedback-down-comment').val();
  window.dp.down = {
    comment: comment
  };
  grecaptcha.execute(recaptchaWidget);
});

$(document).on('click', '#devp-feedback-down-cancel', function() {
  resetRecaptchaWidget();
  $(this).parents(".popover").popover('hide');
});
};

// this runs on document load
var documentReadyCallback = function() {
// POPOVERS
// ========

// enable display of bootstrap popovers and tooltips
$(function() {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
});

$('.pager a').popover({
  container: 'body',
  trigger: 'hover',
  placement: 'auto top'
});

$('a').popover({
  container: 'body',
  trigger: 'hover',
  placement: 'auto right'
});

// handle closing a popover from the Cancel button
$(document).on("click", ".popover .close-popover", function() {
  $(this).parents(".popover").popover('hide');
});

// FEEDBACK
// ========

var thumbsUp = $('.devp-feedback-up');
var thumbsDown = $('.devp-feedback-down');

thumbsUp.popover({
  container: 'body',
  trigger: 'manual',
  placement: 'bottom',
  html: true,
  content: function() {
    return $('#devp-feedback-up-content').html();
  }
});

thumbsDown.popover({
  container: 'body',
  trigger: 'manual',
  placement: 'bottom',
  html: true,
  content: function() {
    return $('#devp-feedback-down-content').html();
  }
});

// NAVIGATION
// ==========

// handle shifting left navigation to the top of the page and collapsing it or moving
// it to the left and expanding depending on screen width
$(window).resize(function() {
  if ($(window).width() <= 991) {
    $('#leftnav-list').addClass('collapse');
  } else {
    $('#leftnav-list').removeClass('collapse');
  }
}).trigger('resize');

// expand and collapse tree elements
$('.tree-toggler').click(function() {
  $(this).parent().children('ul.tree').toggle(100);
  if ($(this).hasClass('nodeOpen')) {
    $(this).removeClass('nodeOpen')
  } else {
    $(this).addClass('nodeOpen')
  }
});

//Apply active class if one does not exist
//TODO: Consider making this the 'active' application process for all
if ($('#leftnav-list .active').length == 0){
  var curUrl = window.location.href;
  var urlRay = curUrl.split('/');
  var curId = urlRay[urlRay.length-1];
  if (curId === ""){
    curId = urlRay[urlRay.length-2];
  }
  var findId = '#leftnav-list #' + curId;
  if($(findId).length > 0 && curId !== ""){
    $(findId).addClass('active');
  }
}

// If on top level, change icon to minus
if ($('#leftnav-list > li.active').length > 0){
  $('#leftnav-list > li.active').children('i.menu-toggle').removeClass('fa-chevron-right').addClass('fa-chevron-down');
}

//Expand leftnav. If a cookie exists, use it to open correct navs, otherwise open collapsed sections for current topic
if (typeof(Cookies.get('p14ctocstate')) !== 'undefined'){
  var idray = Cookies.get('p14ctocstate').split(';');
  // Ignore the last item which will be null
  for (x = 0; x < idray.length - 1; x++){
    $('#' + idray[x] + ' > .toggle-list').toggle();
    $('#' + idray[x] + ' > i').removeClass('fa-chevron-right').addClass('fa-chevron-down');
  }
  Cookies.remove('p14fctocstate');
}
// If current page is hidden in toc, then show
if ($('.toggle-list .active:hidden').length > 0) {
  $('.toggle-list .active:hidden').parents('ul.toggle-list').each(function(){
    if ($(this).is(':hidden')){
      $(this).css('display', 'block');
    }
    $(this).parent().children('i').removeClass('fa-chevron-right').addClass('fa-chevron-down');
  });
}

//Expand child topics
if ($('.active > .toggle-list').is(':hidden')){
  $('.toggle-list .active').children('i.fa-chevron-right').removeClass('fa-chevron-right').addClass('fa-chevron-down');
  $('.active > .toggle-list').show();
}

// Force large images to stay within boundaries
if ($('#template-main-center img').length > 0){
  $('#template-main-center img').each(function(){
    if ($(this).width() > $('#template-main-center').width()){
      $(this).css({'width': '100%', 'height': 'auto'});
    }
  });
}

// Open/close submenus and update cookie to remember state between page views

$('.menu-toggle').click(function(){
  $(this).siblings('.toggle-list').toggle();
  if ($(this).hasClass('fa-chevron-right')){
    $(this).removeClass('fa-chevron-right').addClass('fa-chevron-down');
  } else {
    $(this).removeClass('fa-chevron-down').addClass('fa-chevron-right');
  }
  if ($('i.fa-chevron-down').parent('li').length > 0){
    var tocstate = "";
    $('i.fa-chevron-down').parent('li').each(function(){
      tocstate += $(this).attr('id') + ";";
    })
    Cookies.set('p14ctocstate', tocstate)
  } else {
    Cookies.remove('p14ctocstate');
  }
})

// Scroll current active toc to middle

if ($('#leftnav-list .active').length > 0){
  var activePos = $('#leftnav-list .active')[0].getBoundingClientRect().top;
  var windowHt = $(window).height()/2;
  $('#template-main-left').scrollTop(activePos - windowHt);
}


// fixes for scrollspy to get it to reliably highlight clicked items
var pagetocClicked = 0;
var pageTocOuter = $('#devp-context-toc');
pageTocOuter.on('activate.bs.scrollspy', function() {
  if (pagetocClicked != 0) {
    activateClicked(pagetocClicked);
    pagetocClicked = 0;
  }
});

pageTocOuter.find('a').click(function() {
  pagetocClicked = $(this).parent();
  activateClicked(pagetocClicked);
});

function activateClicked(item) {
  pageTocOuter.find('li').removeClass('active2');
  item.addClass('active2');
  item.parent('li').addClass('active');
}

// show or hide left nav based on screenwidth
if ($(window).width() <= 991) {
  $('#leftnav-list').addClass('collapse');
} else {
  $('#leftnav-list').removeClass('collapse');
}
// collapse the nav tree if there is one
$('ul.tree').toggle();
// define scrollspy behavior
$('body').scrollspy({
  target: '#devp-context-toc',
  offset: 0
});
// define left nav affix behavior
$('#leftnav-list').affix({
  offset: {
    top: 180,
    bottom: function() {
      return (this.bottom = $('.devp-footer-contents').outerHeight(true) + 40)
    }
  }
});
// this will allow long non-breaking code strings to wrap in tables
$('td code').html(function(index, text) {
  // add zero-width space to . / : characters
  return text.replace(/\./g, '.&#8203;').replace(/\//g, '/&#8203;').replace(/\:/g, ':&#8203;');
});
};



(function() {
$(document).ready(documentReadyCallback());
})();
