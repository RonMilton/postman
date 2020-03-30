$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};



$(document).ready(function(){

    setIcons();

    $('body').scrollspy({ target: '#nav-list' });

    $(window).on('activate.bs.scrollspy', function (e) {
        openNav($('a.nav-link.active'));
        var hiddennavs = $('#nav-list ul:hidden').length;
        var totnavs = $('#nav-list ul').length;
        if( hiddennavs == 0){
            $('.expand.all').addClass('disabled');
        } else if (hiddennavs == totnavs) {
            $('.collapse.all').addClass('disabled');
        } else {
            $('.all').removeClass('disabled');
        }
    });

    function setIcons(){
        pretext = "Language - ";
        langdisplay = $('.dropdown-item.activelang').text();
        langsel = "." + $('.dropdown-item.activelang').attr('class').split(/\s+/)[0];
        blockinview = $('.exampleReq .devp-code-block.inview');
        blocknotinview = $('.exampleReq .devp-code-block').not('.inview');

        // tag 
        $('.inview').removeClass('inview');
        $('.samples .devp-code-block').filter(function(){
            return $(this).isInViewport();
        }).parent().addClass("inview");

        if ($('#dropdownMenuButton').hasClass('changed')){
            $('.spinner-border.text-light').addClass('hidden');
            $('.exampleReq').find('code').removeClass('invisible');
            blockinview.children(langsel).removeClass('hidden');
            blockinview.parent().find('.wrap-icon, .expand-icon').addClass('hidden');
            blockinview.find('pre').not('.hidden').each(function(){
                if($(this).height() >= 180){
                    $(this).parent().prevAll('.iconrow').children('.expand-icon').removeClass('hidden');
                }
                if($(this).innerWidth() < $(this)[0].scrollWidth){
                    $(this).parent().prevAll('.iconrow').children('.wrap-icon').removeClass('hidden');
                }
            });
            $('#dropdownMenuButton').text(pretext + langdisplay);
            blocknotinview.children('.req').addClass('hidden');
            blocknotinview.children(langsel).removeClass('hidden');
            blocknotinview.parent('.exampleReq').find('.wrap-icon, .expand-icon').addClass('hidden');
            blocknotinview.children(langsel).each(function(){
                if($(this).height() >= 180){
                    $(this).parent().prevAll('.iconrow').children('.expand-icon').removeClass('hidden');
                }
                if($(this).innerWidth() < $(this)[0].scrollWidth){
                    $(this).parent().prevAll('.iconrow').children('.wrap-icon').removeClass('hidden');
                }
            });
            $('#dropdownMenuButton').removeClass('changed');
        } else {
            $('.samples .devp-code-block.inview').parent().parent().find('pre').not('.hidden').each(function(){
                if($(this).height() >= 180){
                    $(this).parent().prevAll('.iconrow').children('.expand-icon').removeClass('hidden');
                }
                if($(this).innerWidth() < $(this)[0].scrollWidth){
                    $(this).parent().prevAll('.iconrow').children('.wrap-icon').removeClass('hidden');
                }
            });
            $('.samples .devp-code-block').not('.inview').parent().parent().find('pre').each(function(){
                if($(this).height() >= 180){
                    $(this).parent().prevAll('.iconrow').children('.expand-icon').removeClass('hidden');
                }
                if($(this).innerWidth() < $(this)[0].scrollWidth){
                    $(this).parent().prevAll('.iconrow').children('.wrap-icon').removeClass('hidden');
                }
            });
            
        }
        
        
        
    }

    $('.nav-item i').click(function(e){
        let target = $(e.target);
        openNav(target);
    })

    function openNav(target){
        if (target.length){
            var parent = target.parent();
            const childul = parent.children('ul').first();
        
            // Only close nav section if user clicked icon.
            if (target[0].nodeName == "I" || childul.is(':hidden')){
                childul.toggle();
                if (parent.children('i').hasClass('fa-angle-right')){
                    parent.children('i').removeClass('fa-angle-right').addClass('fa-angle-down');
                } else {
                    if (target[0].nodeName == "I"){
                        parent.children('i').removeClass('fa-angle-down').addClass('fa-angle-right');
                    }
                }
            }
            while (parent.is(':hidden')){
                var ul = $(parent).parent();
                var parentli = $(ul).parent();
                ul.slideDown();

                if (parentli.hasClass('folder')){
                    if (parentli.children('i').hasClass('fa-angle-right')){
                        parentli.children('i').removeClass('fa-angle-right').addClass('fa-angle-down');
                    } else {
                        // Only change icon if user clicked icon, since anchor doesn't close nav section.
                        if (target[0].nodeName == "I"){
                            parentli.children('i').removeClass('fa-angle-down').addClass('fa-angle-right');
                        }
                    }
                }
                parent = parentli;
            }
            toggleAllCheck();
        }
    };

    function toggleAllCheck(target){
        //console.log(target);
        var allcollapsed = ($('#nav-list li.nav-item').length - $('#nav-list > li.nav-item').length) == $('#nav-list li.nav-item:hidden').length;
        var collapsebutton = target?target.hasClass('collapse all'):false;
        var expandbutton = target?target.hasClass('expand all'):false;
        if ($('li.nav-item:hidden').length){
            $('.expand.all').removeClass('disabled');
            if (allcollapsed || collapsebutton){
                $('.collapse.all').addClass('disabled');
            } else {
                $('.collapse.all').removeClass('disabled');
            }
            if (expandbutton){
                $('.expand.all').addClass('disabled');
            }
        } else {
            if (expandbutton){
                $('.expand.all').addClass('disabled');
            }
            $('.collapse.all').removeClass('disabled');
        }
    }

    var list = '<li class="nav-item toplevel"><a class="nav-link" href="#top">Introduction</a></li>';
    $('.description h1').each(function(){
        var id = $(this).text().replace(/\s/, '-');
        $(this).attr('id', id);
        list += '<li class="nav-item toplevel"><a class="nav-link" href="#' + id + '">' + $(this).text() + '</a></l1>';
    });
    $('#navigation ul#nav-list').prepend(list);
    $('#nav-list-offpage').prepend(list);
    var slist = list.replace(/ class="nav-item toplevel"/g, '');
    $('#nav-search-list').prepend(slist);

    $('[data-toggle="tooltip"]').tooltip({boundary: 'window'});

    $('.iconrow i').click(function(e){
        var clicktarget = $(e.target);
        var target = clicktarget.parent().next('.devp-code-block');
        if (clicktarget.hasClass('fa-expand')){
            clicktarget.removeClass('fa-expand').addClass('fa-compress');
            target.css('max-height', 'max-content');
        } else if (clicktarget.hasClass('fa-compress')) {
            clicktarget.removeClass('fa-compress').addClass('fa-expand');
            target.css('max-height', '180px');
        } else if (clicktarget.hasClass('fa-align-justify')) {
            clicktarget.removeClass('fa-align-justify').addClass('fa-align-left');
            target.children('pre').css('white-space', 'pre-wrap');
        } else if (clicktarget.hasClass('fa-align-left')){
            clicktarget.removeClass('fa-align-left').addClass('fa-align-justify');
            target.children('pre').css('white-space', 'pre');
        }
        
    })

    $('#nav-search-list li a').click(function(e){
        e.preventDefault();
        var target = $(e.target);
        
        var targetid = target.attr("href");
        var liststart = $('#nav-list > li').first().offset().top - $(window).scrollTop();
        var menuanchor = $('#nav-list a[href="' + targetid + '"]');
        var refanchor = $('#nav-list-offpage a[href="' + targetid + '"]');
        var refitem = refanchor.parent();

        var scrolled = $(window).scrollTop() - $('#navigation').offset().top;

        menuanchor[0].click();
        
        // Open all visible uls in offpage list
        var visibleuls = $('#nav-list').find('ul:visible');

        visibleuls.each(function() {
            var index = $('#nav-list ul').index($(this));
            $('#nav-list-offpage ul').eq(index).removeClass('hidden');
        })
        var fromtop = refitem.offset().top - $('#nav-list-offpage li').first().offset().top;
        
        var firstvisibleparent = menuanchor.parents('li').not(':hidden').first();
        var firstvisibleindex = $("#nav-list li").index(firstvisibleparent);
        var firstvisibleref = $("#nav-list-offpage li").eq(firstvisibleindex);

        var offsetresult = (firstvisibleref.offset().top - refanchor.offset().top) + firstvisibleparent.offset().top;
        
        
        $("#template-main-nav").animate({
            scrollTop: offsetresult - $("#template-main-nav").offset().top - $('#navigation').position().top
        }, 600);

        toggleAllCheck();
        $('#nav-list-offpage ul').addClass('hidden');
    });

    $('#toggle-all .all').click(function(e){
        e.preventDefault();
        var target = $(e.target);
        if(! target.hasClass('disabled')){
            if (target.hasClass('collapse')){
                $('#nav-list ul').slideUp();
                $('#nav-list li.folder i.fas').removeClass('fa-angle-down').addClass('fa-angle-right');
            } else {
                $('#nav-list ul').slideDown();
                $('#nav-list li.folder i.fas').removeClass('fa-angle-right').addClass('fa-angle-down');        
            }
            toggleAllCheck(target);
        }
        
    })

    $('#search-box').keyup(function(){
        var input, filter, ul, li, a, i;
        input = $('#nav-search input');
        filter = input.val().toUpperCase();
        ul = $("#nav-search-list");
        li = $('#nav-search ul li');

        if (filter == ""){
            ul.addClass('hidden');
            $("#search-close").addClass('hidden');
        } else {
            ul.removeClass('hidden');
            $("#search-close").removeClass('hidden');
        }

        for (i = 0; i < li.length; i++){
            a = li[i].textContent;
            if (a.toUpperCase().indexOf(filter) > -1){
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    })

    $("#search-close i").click(function(){
        $('#nav-search input').val('');
        $('#search-box').trigger('keyup');
    })

    $('h3.method').click(function(e){
        var target = $(e.target);
        var targetid = target.attr("id");
        var anchor = $('a[href^="#' + targetid +'"]');
        //var parentitem = anchor.parent('li').parent('ul').parent('li');
        //var icon = parentitem.children('i');
        //var parenturls = parentitem.parents("ul");
        var parentlis = anchor.parents('ul').children('li.folder').has(anchor);
        $.each(parentlis, function(i, v){
            if (anchor.is(":hidden")){
                var icon = $(v).children('i').first();
                openNav(icon);
            }
        })
        
        $('#template-main-nav').animate({scrollTop:anchor.offset().top}, 500);
        anchor.parent().fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
        
    })

   
    $('.dropdown-item').click(function(e){
        e.preventDefault();
        target = $(e.target);
        
        $('#dropdownMenuButton').addClass('changed');
        $('.exampleReq').find('code').addClass('invisible');
        $('.spinner-border.text-light').removeClass('hidden');
        $('.dropdown-item').removeClass('activelang');
        $(e.target).addClass('activelang');
        
        
    });

    $('.dropdown').on('hide.bs.dropdown', function(){
        
        // Delay to stop dropdown from staying visible. Need a promise()?
        setTimeout(function() {
            setIcons();
          }, 100);
        
    });
    

    $('#col-select').click(function(e){
        e.preventDefault();
        if ($('#template-main-content').hasClass('single-column')){
            $('#template-main-content').removeClass('single-column');
            $(this).children('i').removeClass().addClass('far fa-window-maximize');
            //$('#sample-toolbar').removeClass('col-md-10').addClass('col-md-4');
            $('#sample-toolbar').removeClass('solid-left-pane-bg').addClass('faded-left-pane-bg');
        } else {
            $('#template-main-content').addClass('single-column');
            $(this).children('i').removeClass().addClass('fas fa-columns');
            //$('#sample-toolbar').removeClass('col-md-4').addClass('col-md-10');
            $('#sample-toolbar').removeClass('faded-left-pane-bg').addClass('solid-left-pane-bg');
        }
        setIcons();
    })

    // Request testers

    $('.reqtabs .nav-tabs .nav-item').click(function(e){
        e.preventDefault();
        let text = $(e.target).text();
        $(e.target).parent().siblings().children().removeClass('active');
        $(e.target).addClass('active');
        $('.reqcontent > .tabcontent').addClass('hidden');
        switch (text.split(' ')[0]){
            case "Settings":
                $('.reqcontent > .tabcontent.settings').removeClass('hidden');
                break;
            case "Headers":
                $('.reqcontent > .tabcontent.headers').removeClass('hidden');
                break;
            case "Body":
                $('.reqcontent > .tabcontent.body').removeClass('hidden');
                break;
            case "Code":
                $('.reqcontent > .tabcontent.code-generation').removeClass('hidden');
                break;
            default:
                $('.reqcontent > .tabcontent.settings').removeClass('hidden');

        }
    })

    $('.restabs .nav-tabs .nav-item').click(function(e){
        e.preventDefault();
        let text = $(e.target).text();
        $(e.target).parent().siblings().children().removeClass('active');
        $(e.target).addClass('active');
        $('.rescontent > .tabcontent').addClass('hidden');
        switch (text.split(' ')[0]){
            case "Headers":
                $('.rescontent > .tabcontent.headers').removeClass('hidden');
                break;
            case "Body":
                $('.rescontent > .tabcontent.body').removeClass('hidden');
                break;
            default:
                $('.rescontent > .tabcontent.settings').removeClass('hidden');

        }
    })

    $('#barwrapper .slider').click(function(e){
        if ($('#barwrapper').css('right') == '0px'){
            $('#barwrapper').animate({
                right: "-350px"
            }, 500);
        } else {
            $('#barwrapper').animate({
                right: "0px"
            }, 500);
        }

    });
});

