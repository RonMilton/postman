$(function() {
    var reqmodel = function() {
        var self = this;
        self.URLPATTERN = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm
        self.ids = [];
        self.protocols = ko.observableArray(["https://", "http://"]);
        self.selprotocol = ko.observable("https://");
        self.url = ko.observable();
        self.reqbody = ko.observable();
        self.urlvars = ko.observableArray();
        self.urlvarsstore = ko.observableArray();
        self.headers = ko.observableArray();
        self.sendtried = ko.observable(false);
  
        self.resheaders = ko.observableArray();
        self.resbody = ko.observable();
        self.xhrstatus = ko.observable();
        self.xhrstatustext = ko.observable();
        self.method = ko.observable("GET");
        self.authtoken = ko.observable();
        self.authtokeninitial = ko.observable();
        self.authheader = ko.observable(0);
        self.authtype = ko.observable();

        self.emptyvar = ko.pureComputed(function(){
            let truth = false;
            $.each(self.urlvars(), function(index, data){
                if (!data.obs()) truth = true;
            })
            return truth;
        }, this);

        self.showreqbody = ko.pureComputed(function(){
            return self.method() == "GET";
        }, this);

        self.totalheaders = ko.pureComputed(function(){
            return self.headers().length + self.authheader();
        }, this);
        
        self.urlcheck = ko.pureComputed(function(){
            //return self.URLPATTERN.test(self.computedUrl().trim());
            return true;
        }, this);
        self.computedUrl = ko.computed(function(){

            let returl = self.selprotocol() + self.url();
            let regex = '';
            
            self.urlvars().forEach(function(val, index){
                regex = new RegExp(val.raw, "g");
                if (typeof(self.urlvars()[index].obs) != 'undefined') {
                    if (typeof(self.urlvars()[index].obs()) == "undefined" || self.urlvars()[index].obs() === "" ){
                        returl = returl.replace(regex, self.urlvars()[index].raw);
                    } else {
                        returl = returl.replace(regex, self.urlvars()[index].obs());
                    }
                }
                
                
            })
            return returl;
        }, this);
        self.sendreqcheck = ko.computed(function(){
            valid = true;
            if (!self.urlcheck()){
                valid = false;
            }
            return valid;
        }, this);
        
        self.openTry = function(data, event){
            
            self.refresh();
            let target = $(event.target);
            let reqcard = target.next('.tryitcard');
            let caret = target.children('i');
            let rawurl = reqcard.find('.rawurl').val().replace(/(http)s?:\/\//, '');
            let headers = reqcard.find('.headGroup');
            let body = reqcard.find('.reqbody').val();
            let resp = reqcard.find('.testres');
            let rescontent = reqcard.find('.rescontent').children('.tabcontent');
            let restabs = reqcard.find('.restabs .nav-link');

            self.method(reqcard.find('.ajaxmethod').text());
            
            if (caret.hasClass("fa-caret-right")) { 

                // Any button with tertiary class will have been open
                $('.tryit.button--tertiary').children('i').removeClass('fa-caret-down').addClass('fa-caret-right');
                $('.tryit.button--tertiary').addClass('button--primary').removeClass('button--tertiary');
                

                // Open and initiate card
                self.resetui(reqcard);

                // Apply different style
                target.removeClass('button--primary').addClass('button--tertiary');
                
                $('h4 i.fa-caret-down').removeClass('fa-caret-down').addClass('fa-caret-right');
                caret.removeClass('fa-caret-right').addClass('fa-caret-down');
                $('.tryitcard').addClass('hidden');
                reqcard.removeClass('hidden');
                self.url(rawurl);
                
                self.buildurlvars(rawurl); 

                //if (headers.length){
                self.buildheaders(headers);
                //}
                
                self.reqbody(body)
                
                
            } else {
                caret.removeClass('fa-caret-down').addClass('fa-caret-right');
                target.removeClass('button--tertiary').addClass('button--primary');
                reqcard.addClass('hidden');
                resp.addClass('hidden');
                rescontent.addClass('hidden');
                restabs.removeClass('active');
                $(restabs[0]).addClass('active');
                /*self.urlvars.removeAll();
                self.headers.removeAll();
                self.reqbody();
                self.url();*/
                $('.testres').addClass('hidden');
            }

        }
        self.indexof = function (array, predicate, predicateOwner) {
            for (var i = 0, j = array.length; i < j; i++) {
                if (predicate.call(predicateOwner, array[i])) {
                    return i;
                }
            }
            return -1;
        }
        self.urlupdate = function(data, event){
            let target = $(event.target);
            let replaceval = target.prev('span').text();
            alert(replaceval);
            self.url(self.url.replace(replaceval, data));
        }
        self.addHeader = function(data, event){
            self.headers.push({key: ko.observable(''), value: ko.observable('')});
        }
        self.trashHeader = function(data, event){
            let target = $(event.target);
            let trashindex = $(target.parents('ul').children('li')).index($(event.target).parent());
            self.headers.splice(trashindex, 1);
        }
        
        self.sendreq = function(data, event){
            let target = $(event.target);
            let card = target.parents('.tryitcard');
            let testres = card.find('.testres');
            let spinner = testres.find('.spinner-grow');
            let resdata = testres.find('.rescontent .body');
            let resheadarray = [];
            let ajaxhead = {};

            self.sendtried(true);
            self.resheaders.removeAll();
            self.resbody('');
            self.xhrstatus('');
            self.xhrstatustext('');

           if (self.sendreqcheck()){
                
                testres.removeClass('hidden');

                spinner.removeClass('hidden');
                ajaxhead["Authorization"] = "Bearer " + self.authtoken();
                //ajaxhead += "'Authorization': 'Bearer " + self.authtoken() + (self.headers().length > 0 ? "'," : "'");
                for (head in self.headers()){
                    ajaxhead[self.headers()[head].key()] = self.headers()[head].value();
                }
                $.ajax({
                    //url: self.computedUrl(),
                    url: self.computedUrl(),
                    method: self.method(),
                    data: self.reqbody(),
                    headers: ajaxhead,
                    //headers: {"Authorization": "Bearer " + self.authtoken()},
                    success: function(res, status, xhr){
                        let resheadarray = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
                        resheadarray.forEach(function(val){
                            self.resheaders.push(val)
                        });
                        //spinner.addClass('hidden');
                        self.resbody(JSON.stringify(res, null, 1));
                        self.xhrstatus(xhr.status);
                        self.xhrstatustext(xhr.statusText);
    
                    },
                    error: function(xhr, textStatus, thrownErr) {

                        if (xhr.status){
                            let resheadarray = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
                            resheadarray.forEach(function(val){
                                self.resheaders.push(val)
                            });
                        }
                        
                        spinner.addClass('hidden');
                        
                        //self.resbody(JSON.stringify(xhr.responseText, null, 1));
                        
                        if (xhr.status == 401) {
                            self.resbody(JSON.stringify(JSON.parse(xhr.responseText), null, 1));
                        } else {
                            self.resbody(xhr.responseText);
                        }
                        
                        self.xhrstatus(xhr.status);
                        self.xhrstatustext(xhr.statusText);
                        resdata.removeClass('hidden');
                    }
                }).done(function(data){
                    spinner.addClass('hidden');
                    resdata.removeClass('hidden');
                });
            } else {
                testres.addClass('hidden');
            }
            
        }
       /* $('h3.method').each(function() {
            self.ids.push(this.id);
        });*/
        for (id in self.ids){
            console.log(self.ids[id])
        }

        self.copytoclipboard = function(data, event){
            let target = $(event.target);
            let copytext = target.parents('.devp-code-block')[0];
            let range = document.createRange();
            range.selectNode(copytext); 
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            document.execCommand("copy");
            window.getSelection().removeAllRanges();
            alert("Copied");
        }

        self.selectall = function(data, event){
            let target = $(event.target);
            let parent = target.parent();
            let ta = parent.children('textarea');

            ta.select();
        }

        self.clearreqdata = function(data, event){
            //self.clearRoot();
            let target = $(event.target);
            let card = target.parent('.tryitcard');
            let rawurl = card.find('input.rawurl').val();
            let headers = card.find('.headGroup');
            let body = card.find('.reqbody').val();
            //let headersection = card.find('.tabcontent.headers');

            self.headers.removeAll();
            self.urlvars.removeAll();
            self.urlvarsstore.removeAll();
            self.reqbody(body);
            self.authheader(0);
        
            self.buildurlvars(rawurl);
            self.buildheaders(headers);
            self.authtoken('');
        }

        self.clearRoot = function(){
            self.urlvars.removeAll();
            self.headers.removeAll();
            //self.headers.push({key: 'Authorization', value: ko.observable('')});
            self.resheaders.removeAll();
            self.reqbody('');
            self.url('');
            self.resbody('');
            self.xhrstatus('');
            self.xhrstatustext('');
        }

        self.refresh = function(){
            self.url('');
            self.headers.removeAll();
            self.resheaders.removeAll();
            self.reqbody('');
            self.resbody('');
            self.xhrstatus('');
            self.xhrstatustext('');
            self.authheader(0);
            self.sendtried(false);
            
        }

        self.resetui = function(card){
            let req = card.find('.testreq');
            let reqtabs = card.find('.reqtabs .nav-link');
            let reqcontent = card.find('.reqcontent').children('.tabcontent');
            let resp = card.find('.testres');
            let rescontent = card.find('.rescontent').children('.tabcontent');
            let restabs = card.find('.restabs .nav-link');
            card.addClass('hidden');
            resp.addClass('hidden');
            reqcontent.addClass('hidden');
            $(reqcontent[0]).removeClass('hidden');
            reqtabs.removeClass('active');
            $(reqtabs[0]).addClass('active');
            rescontent.addClass('hidden');
            restabs.removeClass('active');
            $(restabs[0]).addClass('active');
        }

        self.buildurlvars = function(rawurl) {
            let suburlvars = rawurl.match(/{{[\w-]+}}/g);
            let total = suburlvars.length;

            suburlvars.forEach(function(val, index){
                let inarray = self.indexof(self.urlvars(), function(v){return v.raw === val});
                let instorearray = self.indexof(self.urlvarsstore(), function(v){return v.raw === val});
                
                if ( inarray < 0) {
                    if (instorearray >= 0){
                        let obsval = self.urlvarsstore()[instorearray].obs();
                        self.urlvars.unshift({raw: val, obs: ko.observable(obsval)});
                    } else {
                        self.urlvars.unshift({raw: val, obs: ko.observable()});
                    }
                    
                    if ( instorearray < 0 ){
                        self.urlvarsstore.push(self.urlvars()[0]);
                    }
                } else {
                    let item = self.urlvars()[inarray];
                    self.urlvars.unshift(item);
                    if ( instorearray < 0){
                        self.urlvarsstore.push(self.urlvars()[0]);
                    }
                }
            });

            self.urlvars(self.urlvars().splice(0, total));

            self.urlvars(self.urlvars().reverse());
        }

        self.buildheaders = function(headers){
            
            $(headers).each(function(index, element){
                let k = $(element).find('.headKey').val();
                let v = $(element).find('.headVal').val();
                if ( k == "" ){
                    k = $(element).find('.headKey').text();
                }
                
                if (k == "authorization"){
                    self.authheader(1);
                    
                    self.authtokeninitial(v.replace(/^[Bb]earer\s/, ""));
                    
                    //self.authtoken(v.replace(/[Bb]earer\s/, ""));
                } else {
                    self.headers.push({ key: ko.observable(k), value: ko.observable(v) });
                }
                

            });
        }

        
    };
    ko.applyBindings(new reqmodel());
});