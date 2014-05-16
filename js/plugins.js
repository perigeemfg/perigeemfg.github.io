// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(!e)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);


/*
 * jQuery One Page Nav Plugin
 * http://github.com/davist11/jQuery-One-Page-Nav
 *
 * Copyright (c) 2010 Trevor Davis (http://trevordavis.net)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 2.1
 *
 * Example usage:
 * $('#nav').onePageNav({
 *   currentClass: 'current',
 *   changeHash: false,
 *   scrollSpeed: 750
 * });
 */

;(function($, window, document, undefined){

    // our plugin constructor
    var OnePageNav = function(elem, options){
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;
        this.metadata = this.$elem.data('plugin-options');
        this.$nav = this.$elem.find('a');
        this.$win = $(window);
        this.sections = {};
        this.didScroll = false;
        this.$doc = $(document);
        this.docHeight = this.$doc.height();
    };

    // the plugin prototype
    OnePageNav.prototype = {
        defaults: {
            currentClass: 'current',
            changeHash: false,
            easing: 'swing',
            filter: '',
            scrollSpeed: 750,
            scrollOffset: 0,
            scrollThreshold: 0.5,
            begin: false,
            end: false,
            scrollChange: false
        },

        init: function() {
            var self = this;

            // Introduce defaults that can be extended either
            // globally or using an object literal.
            self.config = $.extend({}, self.defaults, self.options, self.metadata);

            //Filter any links out of the nav
            if(self.config.filter !== '') {
                self.$nav = self.$nav.filter(self.config.filter);
            }

            //Handle clicks on the nav
            self.$nav.on('click.onePageNav', $.proxy(self.handleClick, self));

            //Get the section positions
            self.getPositions();

            //Handle scroll changes
            self.bindInterval();

            //Update the positions on resize too
            self.$win.on('resize.onePageNav', $.proxy(self.getPositions, self));

            return this;
        },

        adjustNav: function(self, $parent) {
            self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
            $parent.addClass(self.config.currentClass);
        },

        bindInterval: function() {
            var self = this;
            var docHeight;

            self.$win.on('scroll.onePageNav', function() {
                self.didScroll = true;
            });

            self.t = setInterval(function() {
                docHeight = self.$doc.height();

                //If it was scrolled
                if(self.didScroll) {
                    self.didScroll = false;
                    self.scrollChange();
                }

                //If the document height changes
                if(docHeight !== self.docHeight) {
                    self.docHeight = docHeight;
                    self.getPositions();
                }
            }, 250);
        },

        getHash: function($link) {
            return $link.attr('href').split('#')[1];
        },

        getPositions: function() {
            var self = this;
            var linkHref;
            var topPos;

            self.$nav.each(function() {
                linkHref = self.getHash($(this));
                topPos = $('#' + linkHref).offset().top;

                self.sections[linkHref] = Math.round(topPos) - self.config.scrollOffset;
            });
        },

        getSection: function(windowPos) {
            var returnValue = null;
            var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

            for(var section in this.sections) {
                if((this.sections[section] - windowHeight) < windowPos) {
                    returnValue = section;
                }
            }

            return returnValue;
        },

        handleClick: function(e) {
            var self = this;
            var $link = $(e.currentTarget);
            var $parent = $link.parent();
            var newLoc = '#' + self.getHash($link);

            if(!$parent.hasClass(self.config.currentClass)) {
                //Start callback
                if(self.config.begin) {
                    self.config.begin();
                }

                //Change the highlighted nav item
                self.adjustNav(self, $parent);

                //Removing the auto-adjust on scroll
                self.unbindInterval();

                //Scroll to the correct position
                $.scrollTo(newLoc, self.config.scrollSpeed, {
                    axis: 'y',
                    easing: self.config.easing,
                    offset: {
                        top: -self.config.scrollOffset
                    },
                    onAfter: function() {
                        //Do we need to change the hash?
                        if(self.config.changeHash) {
                            window.location.hash = newLoc;
                        }

                        //Add the auto-adjust on scroll back in
                        self.bindInterval();

                        //End callback
                        if(self.config.end) {
                            self.config.end();
                        }
                    }
                });
            }

            e.preventDefault();
        },

        scrollChange: function() {
            var windowTop = this.$win.scrollTop();
            var position = this.getSection(windowTop);
            var $parent;

            //If the position is set
            if(position !== null) {
                $parent = this.$elem.find('a[href$="#' + position + '"]').parent();

                //If it's not already the current section
                if(!$parent.hasClass(this.config.currentClass)) {
                    //Change the highlighted nav item
                    this.adjustNav(this, $parent);

                    //If there is a scrollChange callback
                    if(this.config.scrollChange) {
                        this.config.scrollChange($parent);
                    }
                }
            }
        },

        unbindInterval: function() {
            clearInterval(this.t);
            this.$win.unbind('scroll.onePageNav');
        }
    };

    OnePageNav.defaults = OnePageNav.prototype.defaults;

    $.fn.onePageNav = function(options) {
        return this.each(function() {
            new OnePageNav(this, options).init();
        });
    };

})( jQuery, window , document );

/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-borderradius-boxshadow-opacity-rgba-textshadow-generatedcontent-csstransitions-canvas-shiv-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function A(a){j.cssText=a}function B(a,b){return A(n.join(a+";")+(b||""))}function C(a,b){return typeof a===b}function D(a,b){return!!~(""+a).indexOf(b)}function E(a,b){for(var d in a){var e=a[d];if(!D(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function F(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:C(f,"function")?f.bind(d||b):f}return!1}function G(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return C(b,"string")||C(b,"undefined")?E(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),F(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={},s={},t={},u=[],v=u.slice,w,x=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},y={}.hasOwnProperty,z;!C(y,"undefined")&&!C(y.call,"undefined")?z=function(a,b){return y.call(a,b)}:z=function(a,b){return b in a&&C(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=v.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(v.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(v.call(arguments)))};return e}),r.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},r.rgba=function(){return A("background-color:rgba(150,255,150,.5)"),D(j.backgroundColor,"rgba")},r.borderradius=function(){return G("borderRadius")},r.boxshadow=function(){return G("boxShadow")},r.textshadow=function(){return b.createElement("div").style.textShadow===""},r.opacity=function(){return B("opacity:.55"),/^0.55$/.test(j.opacity)},r.csstransitions=function(){return G("transition")},r.fontface=function(){var a;return x('@font-face {font-family:"font";src:url("https://")}',function(c,d){var e=b.getElementById("smodernizr"),f=e.sheet||e.styleSheet,g=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"";a=/src/i.test(g)&&g.indexOf(d.split(" ")[0])===0}),a},r.generatedcontent=function(){var a;return x(["#",h,"{font:0/0 a}#",h,':after{content:"',l,'";visibility:hidden;font:3px/1 a}'].join(""),function(b){a=b.offsetHeight>=3}),a};for(var H in r)z(r,H)&&(w=H.toLowerCase(),e[w]=r[H](),u.push((e[w]?"":"no-")+w));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)z(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},A(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.testProp=function(a){return E([a])},e.testAllProps=G,e.testStyles=x,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+u.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

// Â© CodingJack www.codingjack.com
// License: http://creativecommons.org/licenses/by-sa/3.0/
// www.codingjack.com/playground/jacked/
// 16kb minified: www.codingjack.com/playground/jacked/js/codingjack/Jacked.min.js

;(function() {

    var compute = window.getComputedStyle ? document.defaultView.getComputedStyle : null,
    request = timeline("Request", "AnimationFrame"),
    cancel = timeline("Cancel", "AnimationFrame"),
    temp = document.createElement("span").style,
    agent = navigator.userAgent.toLowerCase(),
    defaultEase = "Quint.easeOut",
    defaultDuration = 500,
    speeds = getSpeed(),
    dictionary = [],
    css = getCSS(),
    engineRunning,
    transformProp,
    length = 0,
    skeleton,
    element,
    browser,
    useCSS,
    moved,
    timer,
    trans,
    run,
    leg,
    rip,
    itm,
    clrs,
    mobile,
    gotcha,
    colors,
    borColor,
    accelerate,
    comma = /,/g,
    reg = /[A-Z]/g,
    regT = / cj-tween/g,
    trim = /^\s+|\s+$/g,
    regP = new RegExp("{props}"),
    regE = new RegExp("{easing}"),
    regD = new RegExp("{duration}"),

    positions = /(right|bottom|center)/,

    // credit: http://www.bitstorm.org/jquery/color-animation/
    color2 = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,
    color1 = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/,

    // true = use CSS3 above all else when available, false = use requestAnimationFrame with Timer fallback
    // combining browsers + mobile devices is not currently supported (i.e. all Android browsers will be passed the "android" parameter)
    // Microsoft added for the future, will fallback to request/timer for now
    defaults = {ios: false, android: false, winMobile: false, firefox: false, chrome: false, safari: false, opera: false, ie: false},

    // set timer speed and check for IE
    intervalSpeed = speeds[0],
    version = speeds[1],
    isIE = version !== 0 && version < 9;

    if(!request || !cancel) request = cancel = null;

    // if css3 transitions are supported
    if(css) {

        var pre = css[1], sheet = document.createElement("style");
        transformProp = getTransform();
        mobile = getMobile();

        sheet.type = "text/css";
        sheet.innerHTML = ".cj-tween{" + pre + "-property:none !important;}";
        document.getElementsByTagName("head")[0].appendChild(sheet);

        skeleton = pre + "-property:{props};" + pre + "-duration:{duration}s;" + pre + "-timing-function:cubic-bezier({easing});";
        browser = !mobile ? css[2] : mobile;
        borColor = /(chrome|opera)/.test(browser);

        // force hardware acceleration in safari and ios.
        accelerate = browser === "safari" || browser === "ios";
        css = css[0];

        setDefaults();

    }

    if(!isIE) {

        element = HTMLElement;

        clrs = /(#|rgb)/;
        gotcha = /(auto|inherit|rgb|%|#)/;

    }
    // IE8
    else if(version === 8) {

        element = Element;

        // support for commonly named colors in IE8
        clrs = /(#|rgb|red|blue|green|black|white|yellow|pink|gray|grey|orange|purple)/;
        gotcha = /(auto|inherit|rgb|%|#|red|blue|green|black|white|yellow|pink|gray|grey|orange|purple)/;
        colors = {

            red: "#F00",
            blue: "#00F",
            green: "#0F0",
            black: "#000",
            white: "#FFF",
            yellow: "#FF0",
            pink: "#FFC0CB",
            gray: "#808080",
            grey: "#808080",
            orange: "#FFA500",
            purple: "#800080"

        };

    }
    // Bounce for < IE8
    else {

        return;

    }

    // extend Array if necessary
    if(!Array.prototype.indexOf) {

        Array.prototype.indexOf = function($this) {

            var i = this.length;

            while(i--) {

                if(this[i] === $this) return i;

            }

            return -1;

        };

    }

    // credit https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
    if(!Date.now) {

        Date.now = function now() {

            return +(new Date);

        };

    }

    // static methods
    this.Jacked = {

        ready: function(callback) {

            window.onload = callback;

        },

        setEngines: function(settings) {

            for(var prop in settings) {

                if(defaults.hasOwnProperty(prop)) defaults[prop] = settings[prop];

            }

            setDefaults();

        },

        tween: function(obj, to, settings) {

            if(obj.cj) obj.cj.stop();
            if(!settings) settings = {};

            if(!settings.mode) {

                if(!css || !useCSS) {

                    new CJ(obj, to, settings);

                }
                else {

                    new CJcss(obj, to, settings);

                }

            }
            else if(settings.mode === "timeline" || !css) {

                new CJ(obj, to, settings);

            }
            else {

                new CJcss(obj, to, settings);

            }

        },

        fadeIn: function(obj, settings) {

            if(!settings) settings = {};
            settings.fadeIn = true;

            Jacked.tween(obj, {opacity: 1}, settings);

        },

        fadeOut: function(obj, settings) {

            if(!settings) settings = {};
            settings.fadeOut = true;

            Jacked.tween(obj, {opacity: 0}, settings);

        },

        percentage: function(obj, to, settings) {

            if(obj.cj) obj.cj.stop();
            if(!("from" in to) || !("to" in to)) return;
            if(!settings) settings = {};

            var mode = settings.mode;

            if(!mode) {

                if(css && useCSS) {

                    percCSS(obj, to, settings);

                }
                else {

                    new CJpercentage(obj, to, settings);

                }

                return;

            }

            if(mode === "css3" && css) {

                percCSS(obj, to, settings);
                return;

            }

            new CJpercentage(obj, to, settings);

        },

        special: function(obj, settings) {

            if(obj.cj) obj.cj.stop();

            new CJspecial(obj, settings);

        },

        transform: function(obj, to, settings, fallback) {

            if(obj.cj) obj.cj.stop();

            if(css && transformProp) {

                if(!settings) settings = {};
                settings.mode = "css3";

                if("transform" in to) {

                    to[transformProp] = to.transform;
                    delete to.transform;

                }

                new Jacked.tween(obj, to, settings);

            }
            else if(fallback) {

                new Jacked.tween(obj, fallback, settings);

            }

        },

        stopTween: function(obj, complete, callback) {

            var itm = obj.cj;
            if(!itm) return;

            if(!itm.isCSS) {

                itm.stop(complete, callback);

            }
            else {

                itm.stop(callback);

            }

        },

        stopAll: function(complete) {

            (cancel) ? cancel(engine) : clearInterval(timer);

            var i = dictionary.length, itm;
            length = 0;

            while(i--) {

                itm = dictionary[i];

                if(!itm.isCSS) {

                    itm.stop(complete, false, true, true);

                }
                else {

                    itm.stop(false, true);

                }

            }

            dictionary = [];
            engineRunning = false;
            itm = trans = null;

        },

        setEase: function(easing) {

            var ar = easing.toLowerCase().split(".");

            if(ar.length < 2) return;
            if(!PennerEasing[ar[0]]) return;
            if(!PennerEasing[ar[0]][ar[1]]) return;

            defaultEase = easing;

        },

        setDuration: function(num) {

            if(isNaN(num)) return;

            defaultDuration = num;

        },

        getMobile: function() {

            return mobile;

        },

        getIE: function() {

            return isIE;

        },

        getBrowser: function() {

            return browser;

        },

        getTransition: function() {

            return css;

        },

        getEngine: function() {

            return engineRunning;

        },

        getTransform: function() {

            return transformProp;

        }

    };

    // ticker used for JS animations
    function engine() {

        run = false;
        leg = length;

        while(leg--) {

            itm = dictionary[leg];

            if(!itm) break;
            if(itm.isCSS) continue;

            if(itm.cycle()) {

                run = true;

            }
            else {

                itm.stop(false, itm.complete, false, true);

            }

        }

        if(request) {

            if(run) {

                request(engine);

            }
            else {

                cancel(engine);
                itm = trans = null;

            }

        }
        else {

            if(run) {

                if(!engineRunning) timer = setInterval(engine, intervalSpeed);

            }
            else {

                clearInterval(timer);
                itm = trans = null;

            }

        }

        engineRunning = run;

    }

    // default JS transition
    this.CJ = function(obj, to, sets) {

        length = dictionary.length;

        var $this = obj.cj = dictionary[length++] = this;

        this.runner = function(force) {

            $this.obj = obj;
            $this.complete = sets.callback;
            $this.completeParams = sets.callbackParams;

            if(force === true) {

                $this.transitions = [];
                return;

            }

            var key,
            i = 0,
            tweens = [],
            style = obj.style,
            duration = sets.duration || defaultDuration,
            easing = (sets.ease || defaultEase).toLowerCase().split(".");
            easing = PennerEasing[easing[0]][easing[1]];

            style.visibility = "visible";

            if(sets.fadeIn) {

                style.display = sets.display || "block";
                style.opacity = 0;

            }

            if(isIE && "opacity" in to) {

                style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + (sets.fadeIn ? 0 : 100) + ")";

            }

            if(to.borderColor && !borColor) {

                var clr = to.borderColor;

                to.borderTopColor = clr;
                to.borderRightColor = clr;
                to.borderBottomColor = clr;
                to.borderLeftColor = clr;

                delete to.borderColor;

            }

            for(key in to) {

                if(!to.hasOwnProperty(key)) continue;

                if(key !== "backgroundPosition") {

                    tweens[i++] = $this.animate(obj, key, to[key], duration, easing);

                }
                else {

                    tweens[i++] = $this.bgPosition(obj, key, to[key], duration, easing);

                }

            }

            $this.transitions = tweens;
            (engineRunning) ? setTimeout(checkEngine, 10) : engine();

        };

        if(sets.fadeOut) {

            obj.cjFadeOut = true;

        }
        else if(sets.fadeIn) {

            obj.cjFadeIn = true;

        }

        if(sets.duration === 0) {

            this.runner(true);
            this.stop();
            return;

        }

        if(!sets.delay) {

            this.runner();

        }
        else {

            this.delayed = setTimeout(this.runner, sets.delay);

        }

    };

    // cycles through all JS animations every frame/interval
    CJ.prototype.cycle = function() {

        trans = this.transitions;
        if(!trans) return true;

        rip = trans.length;
        moved = false;

        while(rip--) {

            if(trans[rip]()) moved = true;

        }

        return moved;

    };

    // each JS animation runs through this function
    CJ.prototype.animate = function(obj, prop, value, duration, ease) {

        var tick, style, val, opacity = prop === "opacity", passed = true;

        if(!opacity || !isIE) {

            style = obj.style;
            val = style[prop];

            tick = (val !== "") ? val : compute ? compute(obj, null)[prop] : obj.currentStyle[prop];

        }
        else {

            style = obj.filters.item("DXImageTransform.Microsoft.Alpha");
            prop = "Opacity";
            tick = style[prop];
            value *= 100;

        }

        if(!gotcha.test(tick)) {

            tick = parseFloat(tick);

        }
        else {

            if(!clrs.test(tick)) {

                tick = 0;

            }
            else {

                if(value.search("rgb") === -1) {

                    if(isIE && tick in colors) tick = colors[tick];
                    return this.color(obj, prop, tick, value, duration, ease);

                }
                else {

                    passed = false;

                }

            }

        }

        var px = !opacity ? "px" : 0,
        constant = value - tick,
        range = tick < value,
        then = Date.now(),
        begin = tick,
        timed = 0,
        finish,
        pTick,
        now;

        finish = value + px;

        if(!opacity || isIE) {

            (range) ? value -= 0.25 : value += 0.25;

        }
        else {

            (range) ? value -= 0.025 : value += 0.025;

        }

        function trans() {

            now = Date.now();
            timed += now - then;
            tick = ease(timed, begin, constant, duration);
            then = now;

            if(!opacity || isIE) {

                tick = range ? (tick + 0.5) | 0 : (tick - 0.5) | 0;

            }
            else {

                tick = tick.toFixed(2);

            }

            if(tick === pTick) return true;

            if(range) {

                if(tick >= value) {

                    style[prop] = finish;
                    return false;

                }

            }
            else {

                if(tick <= value) {

                    style[prop] = finish;
                    return false;

                }

            }

            pTick = tick;
            style[prop] = tick + px;

            return true;

        }

        function cancelled() {

            return false;

        }

        if(passed) {

            trans.stored = [prop, finish];
            return trans;

        }
        else {

            cancelled.stored = [prop, finish];
            return cancelled;

        }


    };


    // color transitions
    CJ.prototype.color = function(obj, prop, tick, value, duration, ease) {

        var pound = value.search("#") !== -1 ? "" : "#",
        finish = pound + value,
        then = Date.now(),
        style = obj.style,
        passed = false,
        starts = [],
        ends = [],
        timed = 0,
        i = -1,
        now,
        clr,
        st;

        if(tick.search("rgb") !== -1) {

            i = -1;
            starts = tick.split("(")[1].split(")")[0].split(",");
            while(++i < 3) starts[i] = parseInt(starts[i], 10);

        }
        else {

            starts = getColor(tick);

        }

        ends = getColor(value);
        i = -1;

        while(++i < 3) {

            if(starts[i] !== ends[i]) passed = true;

        }

        function trans() {

            now = Date.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);

            if(tick < 0.99) {

                i = -1;
                st = "rgb(";

                while(++i < 3) {

                    clr = starts[i];
                    st += (clr + tick * (ends[i] - clr)) | 0;
                    if(i < 2) st += ",";

                }

                style[prop] = st + ")";
                return true;

            }
            else {

                style[prop] = finish;
                return false;

            }

        }

        function cancelled() {

            return false;

        }

        if(passed) {

            trans.stored = [prop, finish];
            return trans;

        }
        else {

            cancelled.stored = [prop, finish];
            return cancelled;

        }

    };


    // animates bgPosition
    CJ.prototype.bgPosition = function(obj, prop, value, duration, ease) {

        var style = obj.style,
        val = style[prop],
        then = Date.now(),
        passed = true,
        ie = isIE,
        timed = 0,
        finalX,
        finalY,
        finish,
        prevX,
        prevY,
        hasX,
        hasY,
        difX,
        difY,
        tick,
        now,
        xx,
        yy,
        x,
        y;

        if(!ie) {

            tick = (val !== "") ? val.split(" ") : compute(obj, null).backgroundPosition.split(" ");

            x = tick[0];
            y = tick[1];

        }
        else {

            x = obj.currentStyle.backgroundPositionX;
            y = obj.currentStyle.backgroundPositionY;

            if(positions.test(x) || positions.test(y)) passed = false;

            if(x === "left") x = 0;
            if(y === "top") y = 0;

        }

        if(x.search("%") !== -1) {

            if(x !== "0%") passed = false;

        }

        if(y.search("%") !== -1) {

            if(y !== "0%") passed = false;

        }

        x = parseInt(x, 10);
        y = parseInt(y, 10);

        if(value.hasOwnProperty("x")) {

            xx = value.x;
            hasX = true;

        }
        else {

            xx = x;
            hasX = false;

        }

        if(value.hasOwnProperty("y")) {

            yy = value.y;
            hasY = true;

        }
        else {

            yy = y;
            hasY = false;

        }

        hasX = hasX && x !== xx;
        hasY = hasY && y !== yy;
        if(!hasX && !hasY) passed = false;

        difX = xx - x;
        difY = yy - y;
        finalX = xx + "px";
        finalY = yy + "px";
        finish = !ie ? finalX + " " + finalY : [finalX, finalY];

        function trans() {

            now = Date.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);

            if(tick < 0.99) {

                if(hasX) {

                    xx = ((x + (difX * tick)) + 0.5) | 0;

                }

                if(hasY) {

                    yy = ((y + (difY * tick)) + 0.5) | 0;

                }

                if(xx === prevX && yy === prevY) return true;

                prevX = xx;
                prevY = yy;

                if(!ie) {

                    style.backgroundPosition = xx + "px" + " " + yy + "px";

                }
                else {

                    style.backgroundPositionX = xx + "px";
                    style.backgroundPositionY = yy + "px";

                }

                return true;

            }
            else {

                if(!ie) {

                    style[prop] = finish;

                }
                else {

                    style.backgroundPositionX = finalX;
                    style.backgroundPositionY = finalY;

                }

                return false;

            }

        }

        function cancelled() {

            return false;

        }

        if(passed) {

            trans.stored = [prop, finish];
            return trans;

        }
        else {

            cancelled.stored = [prop, finish];
            return cancelled;

        }

    };

    // stops JS animations
    CJ.prototype.stop = function(complete, callback, popped) {

        var element = this.obj;

        if(!element) {

            clearTimeout(this.delayed);

            this.runner(true);
            this.stop(complete, callback);

            return;

        }

        delete element.cj;

        if(complete) {

            var group = this.transitions, i = group.length, ar, prop;

            while(i--) {

                ar = group[i].stored;
                prop = ar[0];

                if(!isIE) {

                    element.style[prop] = ar[1];

                }
                else {

                    switch(prop) {

                        case "Opacity":

                            element.filters.item("DXImageTransform.Microsoft.Alpha").Opacity = ar[1] * 100;

                        break;

                        case "backgroundPosition":

                            var style = element.style;
                            style.backgroundPositionX = ar[1][0];
                            style.backgroundPositionY = ar[1][1];

                        break;

                        default:

                            element.style[prop] = ar[1];

                        // end default

                    }

                }

            }

        }

        checkElement(element);
        if(callback) callback = this.complete;
        if(!popped) popTween(this, element, callback, this.completeParams);

    };


    // CSS3 Transitions
    this.CJcss = function(obj, to, sets) {

        length = dictionary.length;

        var $this = obj.cj = dictionary[length++] = this, style = obj.style;

        this.isCSS = true;
        this.storage = obj;
        this.complete = sets.callback;
        this.completeParams = sets.callbackParams;

        this.runner = function() {

            if(!sets.cssStep) {

                $this.step();

            }
            else {

                style.visibility = "visible";
                $this.stepped = setTimeout($this.step, 30);

            }

        };

        this.step = function(added) {

            $this.obj = obj;

            if(added === true) {

                $this.moves = "";
                return;

            }

            var j,
            key,
            str,
            cur,
            orig,
            bgPos,
            i = 0,
            total,
            finder,
            moving,
            replaced,
            values = [],
            tweens = [],
            current = obj.getAttribute("style") || "",
            duration = sets.duration || defaultDuration,
            easing = (sets.ease || defaultEase).toLowerCase().split(".");

            for(key in to) {

                if(!to.hasOwnProperty(key)) continue;

                str = key;
                finder = str.match(reg);

                if(finder) {

                    j = finder.length;

                    while(j--) {

                        cur = finder[j];
                        str = str.replace(new RegExp(cur, "g"), "-" + cur.toLowerCase());

                    }

                }

                cur = orig = to[key];
                bgPos = key === "backgroundPosition";

                if(!gotcha.test(cur) && key !== "opacity" && key.search(transformProp) === -1 && !bgPos) {

                    cur += "px;";

                }
                else if(!bgPos) {

                    cur += ";";

                }
                else {

                    var x = orig.x, y = orig.y, isX = isNaN(x), isY = isNaN(y);

                    if(!isX && !isY) {

                        x += "px";
                        y += "px";

                    }
                    else {

                        var val = style.backgroundPosition,
                        tick = (val !== "") ? val.split(" ") : compute(obj, null).backgroundPosition.split(" ");

                        (!isX) ? x += "px" : x = tick[0];
                        (!isY) ? y += "px" : y = tick[1];

                    }

                    cur = x + " " + y + ";";

                }

                values[i] = str + ":" + cur;
                tweens[i++] = str;

                if(!current) continue;
                finder = current.search(str);

                if(finder !== -1) {

                    total = current.length - 1;
                    j = finder - 1;

                    while(++j < total) {

                        if(current[j] === ";") break;

                    }

                    current = current.split(current.substring(finder, j + 1)).join("");

                }

            }

            $this.moves = moving = skeleton.replace(regP, tweens.toString()).replace(regD, (duration * 0.001).toFixed(2)).replace(regE, CeaserEasing[easing[0]][easing[1]]);

            replaced = values.toString();
            replaced = replaced.replace(comma, "");

            obj.className = obj.className.replace(regT, "");
            obj.addEventListener(css, cssEnded, false);
            obj.setAttribute("style", current.replace(trim, "") + moving + replaced);

        };

        if(!sets.fadeIn) {

            if(sets.fadeOut) obj.cjFadeOut = true;

        }
        else {

            obj.cjFadeIn = true;
            style.display = sets.display || "block";
            style.opacity = 0;

        }

        if(sets.duration === 0) {

            this.runner(true);
            this.stop();
            return;

        }

        if(!sets.cssStep) style.visibility = "visible";

        if(accelerate && !(transformProp in to)) {

            style.webkitTransform = "translate3d(0, 0, 0)";
            style.webkitBackfaceVisibility = "hidden";
            style.webkitPerspective = 1000;

        }

        if(!sets.delay) {

            this.delayed = setTimeout(this.runner, 30);

        }
        else {

            this.delayed = setTimeout(this.runner, sets.delay > 30 ? sets.delay : 30);

        }

    };

    // stops a CSS3 Transition
    CJcss.prototype.stop = function(callback, popped) {

        var element = this.obj;

        if(callback) callback = this.complete;

        if(!element) {

            clearTimeout(this.delayed);
            clearTimeout(this.stepped);

            checkElement(this.storage);
            if(!popped) popTween(this, element, callback, this.completeParams);

            return;

        }

        delete element.cj;

        element.removeEventListener(css, cssEnded, false);
        element.className += " cj-tween";
        element.setAttribute("style", element.getAttribute("style").split(this.moves).join(";").split(";;").join(";"));

        checkElement(element);

        if(!popped) popTween(this, element, callback, this.completeParams);

    };

    // special call for animating percentages
    this.CJpercentage = function(obj, to, sets) {

        length = dictionary.length;

        var $this = obj.cj = dictionary[length++] = this;

        this.obj = obj;
        this.complete = sets.callback;
        this.completeParams = sets.callbackParams;

        this.runner = function() {

            var i = 0,
            ar = [],
            prop, begin, end,
            newbs = to.to,
            from = to.from,
            duration = sets.duration || defaultDuration,
            easing = (sets.ease || defaultEase).toLowerCase().split(".");
            easing = PennerEasing[easing[0]][easing[1]];

            for(prop in from) {

                if(!from.hasOwnProperty(prop)) continue;

                end = parseInt(newbs[prop], 10);
                begin = parseInt(from[prop], 10);

                ar[i++] = [end > begin, prop, end, begin];

            }

            obj.style.visibility = "visible";
            $this.transitions = $this.animate(obj, ar, duration, easing);
            (engineRunning) ? setTimeout(checkEngine, 10) : engine();

        };

        if(sets.duration === 0) {

            this.stop();
            return;

        }

        if(!sets.delay) {

            this.runner();

        }
        else {

            this.delayed = setTimeout(this.runner, sets.delay);

        }

    };

    CJpercentage.prototype.cycle = function() {

        return this.transitions();

    };

    // animate percentages
    CJpercentage.prototype.animate = function(obj, to, duration, ease) {

        var tick, timed = 0, then = Date.now(), now, i, style = obj.style, leg = to.length, itm, begin;

        return function(force) {

            now = Date.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);
            i = leg;

            if(tick < 0.99 && !force) {

                while(i--) {

                    itm = to[i];
                    begin = itm[3];

                    if(itm[0]) {

                        style[itm[1]] = (begin + ((itm[2] - begin) * tick)) + "%";

                    }
                    else {

                        style[itm[1]] = (begin - ((begin - itm[2]) * tick)) + "%";

                    }

                }

                return true;

            }
            else {

                while(i--) {

                    itm = to[i];
                    style[itm[1]] = itm[2] + "%";

                }

                return false;

            }

        };

    };

    // stop a percentage animation
    CJpercentage.prototype.stop = function(complete, callback, popped) {

        if("delayed" in this) clearTimeout(this.delayed);
        var element = this.obj;

        delete element.cj;
        if(complete && this.transitions) this.transitions(true);

        if(callback) callback = this.complete;
        if(!popped) popTween(this, element, callback, this.completeParams);

    };

    // extends Jacked
    this.CJspecial = function(obj, sets) {

        if(!sets || !sets.callback) return;

        length = dictionary.length;
        dictionary[length++] = obj.cj = this;

        var callback = this.complete = sets.callback,
        easing = sets.ease || defaultEase;
        easing = easing.toLowerCase().split(".");
        easing = PennerEasing[easing[0]][easing[1]];

        this.obj = obj;
        this.transitions = this.numbers(obj, sets.duration || defaultDuration, easing, callback);

        (engineRunning) ? setTimeout(checkEngine, 10) : engine();

    };

    // extender cycle
    CJspecial.prototype.cycle = function() {

        return this.transitions();

    };

    // extender step
    CJspecial.prototype.numbers = function(obj, duration, ease, callback) {

        var tick, timed = 0, then = Date.now(), now;

        return function() {

            now = Date.now();
            timed += now - then;
            then = now;

            tick = ease(timed, 0, 1, duration);

            if(tick < 0.99) {

                callback(obj, tick);
                return true;

            }
            else {

                return false;

            }

        };

    };

    // stop extender
    CJspecial.prototype.stop = function(complete, callback, popped, finished) {

        var obj = this.obj;

        if(!obj) return;
        delete obj.cj;

        if(!popped) popTween(this);
        if(complete || finished) this.complete(obj, 1, callback);

    };

    // if CSS3 fadeIn/fadeOut gets aborted, restore the properties
    function checkElement(element) {

        if(element.cjFadeIn) {

            delete element.cjFadeIn;
            element.style.opacity = 1;
            element.style.visibility = "visible";

        }
        else if(element.cjFadeOut) {

            delete element.cjFadeOut;
            element.style.display = "none";

        }

    }

    // checks to make sure the timeline engine starts
    function checkEngine() {

        if(!engineRunning) engine();

    }

    // removes the tween from memory when finished
    function popTween($this, element, callback, params) {

        dictionary.splice(dictionary.indexOf($this), 1);
        length = dictionary.length;

        if(callback) callback(element, params);

    }

    // CSS3 onEnded event
    function cssEnded(event) {

        event.stopPropagation();

        var $this = this.cj;

        if($this) $this.stop($this.complete);

    }

    // transform a CSS3 percentage call to a regular tween
    function percCSS(obj, to, settings) {

        var newTo = {}, prop, goTo = to.to;

        for(prop in goTo) {

            if(!goTo.hasOwnProperty(prop)) continue;

            newTo[prop] = goTo[prop];

        }

        Jacked.tween(obj, newTo, settings);

    }

    // checks for requestAnimstionFrame support
    function timeline(req, st) {

        return this["webkit" + req + st] || this["moz" + req + st] || this["o" + req + st] || this[req + st] || null;

    }

    // parse hex color
    // credit: http://www.bitstorm.org/jquery/color-animation/
    function getColor(color) {

        var matched;

        if(matched = color1.exec(color)) {

            return [parseInt(matched[1], 16), parseInt(matched[2], 16), parseInt(matched[3], 16), 1];

        }
        else if(matched = color2.exec(color)) {

            return [parseInt(matched[1], 16) * 17, parseInt(matched[2], 16) * 17, parseInt(matched[3], 16) * 17, 1];

        }

    }

    // IE9 uses a fast timer, legacy IE uses a slow timer
    function getSpeed() {

        var point = agent.search("msie");

        if(point === -1) {

            return [33.3, 0];

        }
        else {

            var ver = parseInt(agent.substr(point + 4, point + 5), 10), speed = ver >= 9 ? 16.6 : 33.3;

            return [speed, ver];

        }

    }

    // sets the default tween behaviour (CSS3, timeline, timer)
    function setDefaults() {

        for(var prop in defaults) {

            if(!defaults.hasOwnProperty(prop)) continue;

            if(prop === browser) {

                useCSS = defaults[prop];
                break;

            }

        }

    }

    // tests for mobile support
    function getMobile() {

        if(!("ontouchend" in document)) {

            return null;

        }
        else {

            if(agent.search("iphone") !== -1 || agent.search("ipad") !== -1) {

                return "ios";

            }
            else if(agent.search("android") !== -1 || agent.search("applewebkit") !== -1) {

                return "android";

            }
            else if(agent.search("msie") !== -1) {

                return "winMobile";

            }

            return null;

        }

    }

    // tests for CSS3 Transition support
    function getCSS() {

        if("WebkitTransition" in temp) {

            return ["webkitTransitionEnd", "-webkit-transition", agent.search("chrome") !== -1 ? "chrome" : "safari"];

        }
        else if("MozTransition" in temp) {

            return ["transitionend", "-moz-transition", "firefox"];

        }
        else if("MSTransition" in temp) {

            return ["msTransitionEnd", "-ms-transition", "ie"];

        }
        else if("transition" in temp) {

            return ["transitionEnd", "transition", null];

        }

        return null;

    }

    // tests for CSS3 transform support
    function getTransform() {

        if("WebkitTransform" in temp) {

            return "WebkitTransform";

        }
        else if("MozTransform" in temp) {

            return "MozTransform";

        }
        else if("msTransform" in temp) {

            return "msTransform";

        }
        else if("transform" in temp) {

            return "transform";

        }

        return null;

    }


    /*
    TERMS OF USE - EASING EQUATIONS

    Open source under the BSD License.

    Copyright Ãƒâ€šÃ‚Â© 2001 Robert Penner
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

        Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
        Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
        Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */

    var PennerEasing = {

        linear: {

            easenone: function(t, b, c, d) {

                return c * t / d + b;

            },

            easein: function(t, b, c, d) {

                return c * t / d + b;

            },

            easeout: function(t, b, c, d) {

                return c * t / d + b;

            },

            easeinout: function(t, b, c, d) {

                return c * t / d + b;

            }

        },

        quint: {

            easeout: function (t, b, c, d) {

                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;

            },

            easein: function(t, b, c, d) {

                return c * (t /= d) * t * t * t * t + b;

            },

            easeinout: function(t, b, c, d) {

                return ((t /= d / 2) < 1) ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;

            }

        },

        quad: {

            easein: function (t, b, c, d) {

                return c * (t /= d) * t + b;

            },

            easeout: function (t, b, c, d) {

                return -c * (t /= d) * (t - 2) + b;

            },

            easeinout: function (t, b, c, d) {

                return ((t /= d / 2) < 1) ? c / 2 * t * t + b : -c / 2 * ((--t) * (t - 2) - 1) + b;

            }

        },

        quart: {

            easein: function(t, b, c, d) {

                return c * (t /= d) * t * t * t + b;

            },

            easeout: function(t, b, c, d) {

                return -c * ((t = t / d - 1) * t * t * t - 1) + b;

            },

            easeinout: function(t, b, c, d) {

                return ((t /= d / 2) < 1) ? c / 2 * t * t * t * t + b : -c / 2 * ((t -= 2) * t * t * t - 2) + b;

            }

        },

        cubic: {

            easein: function(t, b, c, d) {

                return c * (t /= d) * t * t + b;

            },

            easeout: function(t, b, c, d) {

                return c * ((t = t / d - 1) * t * t + 1) + b;

            },

            easeinout: function(t, b, c, d) {

                return ((t /= d / 2) < 1) ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b;

            }

        },

        circ: {

            easein: function(t, b, c, d) {

                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;

            },

            easeout: function(t, b, c, d) {

                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;

            },

            easeinout: function(t, b, c, d) {

                return ((t /= d / 2) < 1) ? -c / 2 * (Math.sqrt(1 - t * t) - 1) + b : c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;

            }

        },

        sine: {

            easein: function(t, b, c, d) {

                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;

            },

            easeout: function(t, b, c, d) {

                return c * Math.sin(t / d * (Math.PI / 2)) + b;

            },

            easeinout: function(t, b, c, d) {

                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;

            }

        },

        expo: {

            easein: function(t, b, c, d) {

                return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;

            },

            easeout: function(t, b, c, d) {

                return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;

            },

            easeinout: function(t, b, c, d) {

                if(t === 0) return b;
                if(t === d) return b + c;
                if((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;

                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;

            }

        }

    },

    // credit: http://matthewlein.com/ceaser/

    CeaserEasing = {

        linear: {

            easenone: "0.250, 0.250, 0.750, 0.750",
            easein: "0.420, 0.000, 1.000, 1.000",
            easeout: "0.000, 0.000, 0.580, 1.000",
            easeinout: "0.420, 0.000, 0.580, 1.000"

        },

        quint: {

            easein: "0.755, 0.050, 0.855, 0.060",
            easeout: "0.230, 1.000, 0.320, 1.000",
            easeinout: "0.860, 0.000, 0.070, 1.000"

        },

        quad: {

            easein: "0.550, 0.085, 0.680, 0.530",
            easeout: "0.250, 0.460, 0.450, 0.940",
            easeinout: "0.455, 0.030, 0.515, 0.955"

        },

        quart: {

            easein: "0.895, 0.030, 0.685, 0.220",
            easeout: "0.165, 0.840, 0.440, 1.000",
            easeinout: "0.770, 0.000, 0.175, 1.000"

        },

        cubic: {

            easein: "0.550, 0.055, 0.675, 0.190",
            easeout: "0.215, 0.610, 0.355, 1.000",
            easeinout: "0.645, 0.045, 0.355, 1.000"

        },

        circ: {

            easein: "0.600, 0.040, 0.980, 0.335",
            easeout: "0.075, 0.820, 0.165, 1.000",
            easeinout: "0.785, 0.135, 0.150, 0.860"

        },

        sine: {

            easein: "0.470, 0.000, 0.745, 0.715",
            easeout: "0.390, 0.575, 0.565, 1.000",
            easeinout: "0.445, 0.050, 0.550, 0.950"

        },

        expo: {

            easein: "0.950, 0.050, 0.795, 0.035",
            easeout: "0.190, 1.000, 0.220, 1.000",
            easeinout: "1.000, 0.000, 0.000, 1.000"

        }

    };

    element.prototype.jacked = function(to, sets) {

        Jacked.tween(this, to, sets);

    };

    element.prototype.fadeInJacked = function(sets) {

        Jacked.fadeIn(this, sets);

    };

    element.prototype.fadeOutJacked = function(sets) {

        Jacked.fadeOut(this, sets);

    };

    element.prototype.transformJacked = function(to, sets, fallback) {

        Jacked.transform(this, to, sets, fallback);

    };

    element.prototype.percentageJacked = function(to, sets) {

        Jacked.percentage(this, to, sets);

    };

    element.prototype.stopJacked = function(complete, callback) {

        Jacked.stopTween(this, complete, callback);

    };

    element = speeds = temp = null;


})(window);


if(typeof jQuery !== "undefined") {

    (function($) {

        $.fn.jacked = function(to, settings) {

            return this.each(createJack, [to, settings]);

        };

        $.fn.fadeInJacked = function(settings) {

            return this.each(showJack, [settings]);

        };

        $.fn.fadeOutJacked = function(settings) {

            return this.each(hideJack, [settings]);

        };

        $.fn.transformJacked = function(to, settings, fallback) {

            return this.each(transformJack, [to, settings, fallback]);

        };

        $.fn.percentageJacked = function(to, settings) {

            return this.each(percentageJack, [to, settings]);

        };

        $.fn.stopJacked = function(complete, callback) {

            return this.each(stopJack, [complete, callback]);

        };

        $.fn.stopJackedSet = function(complete) {

            return this.each(stopSet, [complete]);

        };

        function createJack(to, sets) {

            Jacked.tween(this, to, sets);

        }

        function showJack(sets) {

            Jacked.fadeIn(this, sets);

        }

        function hideJack(sets) {

            Jacked.fadeOut(this, sets);

        }

        function transformJack(to, sets, fallback) {

            Jacked.transform(this, to, sets, fallback);

        }

        function percentageJack(to, sets) {

            Jacked.percentage(this, to, sets);

        }

        function stopJack(complete, callback) {

            Jacked.stopTween(this, complete, callback);

        }

        function stopSet(complete) {

            recursiveStop($(this), complete);

        }

        function recursiveStop($this, complete) {

            $this.children().each(stopItem, [complete]);

        }

        function stopItem(complete) {

            Jacked.stopTween(this, complete);
            recursiveStop($(this), complete);

        }

    })(jQuery);

}

/**
 * Isotope v1.5.21
 * An exquisite jQuery plugin for magical layouts
 * http://isotope.metafizzy.co
 *
 * Commercial use requires one-time license fee
 * http://metafizzy.co/#licenses
 *
 * Copyright 2012 David DeSandro / Metafizzy
 */
(function(a,b,c){"use strict";var d=a.document,e=a.Modernizr,f=function(a){return a.charAt(0).toUpperCase()+a.slice(1)},g="Moz Webkit O Ms".split(" "),h=function(a){var b=d.documentElement.style,c;if(typeof b[a]=="string")return a;a=f(a);for(var e=0,h=g.length;e<h;e++){c=g[e]+a;if(typeof b[c]=="string")return c}},i=h("transform"),j=h("transitionProperty"),k={csstransforms:function(){return!!i},csstransforms3d:function(){var a=!!h("perspective");if(a){var c=" -o- -moz- -ms- -webkit- -khtml- ".split(" "),d="@media ("+c.join("transform-3d),(")+"modernizr)",e=b("<style>"+d+"{#modernizr{height:3px}}"+"</style>").appendTo("head"),f=b('<div id="modernizr" />').appendTo("html");a=f.height()===3,f.remove(),e.remove()}return a},csstransitions:function(){return!!j}},l;if(e)for(l in k)e.hasOwnProperty(l)||e.addTest(l,k[l]);else{e=a.Modernizr={_version:"1.6ish: miniModernizr for Isotope"};var m=" ",n;for(l in k)n=k[l](),e[l]=n,m+=" "+(n?"":"no-")+l;b("html").addClass(m)}if(e.csstransforms){var o=e.csstransforms3d?{translate:function(a){return"translate3d("+a[0]+"px, "+a[1]+"px, 0) "},scale:function(a){return"scale3d("+a+", "+a+", 1) "}}:{translate:function(a){return"translate("+a[0]+"px, "+a[1]+"px) "},scale:function(a){return"scale("+a+") "}},p=function(a,c,d){var e=b.data(a,"isoTransform")||{},f={},g,h={},j;f[c]=d,b.extend(e,f);for(g in e)j=e[g],h[g]=o[g](j);var k=h.translate||"",l=h.scale||"",m=k+l;b.data(a,"isoTransform",e),a.style[i]=m};b.cssNumber.scale=!0,b.cssHooks.scale={set:function(a,b){p(a,"scale",b)},get:function(a,c){var d=b.data(a,"isoTransform");return d&&d.scale?d.scale:1}},b.fx.step.scale=function(a){b.cssHooks.scale.set(a.elem,a.now+a.unit)},b.cssNumber.translate=!0,b.cssHooks.translate={set:function(a,b){p(a,"translate",b)},get:function(a,c){var d=b.data(a,"isoTransform");return d&&d.translate?d.translate:[0,0]}}}var q,r;e.csstransitions&&(q={WebkitTransitionProperty:"webkitTransitionEnd",MozTransitionProperty:"transitionend",OTransitionProperty:"oTransitionEnd otransitionend",transitionProperty:"transitionend"}[j],r=h("transitionDuration"));var s=b.event,t;s.special.smartresize={setup:function(){b(this).bind("resize",s.special.smartresize.handler)},teardown:function(){b(this).unbind("resize",s.special.smartresize.handler)},handler:function(a,b){var c=this,d=arguments;a.type="smartresize",t&&clearTimeout(t),t=setTimeout(function(){jQuery.event.handle.apply(c,d)},b==="execAsap"?0:100)}},b.fn.smartresize=function(a){return a?this.bind("smartresize",a):this.trigger("smartresize",["execAsap"])},b.Isotope=function(a,c,d){this.element=b(c),this._create(a),this._init(d)};var u=["width","height"],v=b(a);b.Isotope.settings={resizable:!0,layoutMode:"masonry",containerClass:"isotope",itemClass:"isotope-item",hiddenClass:"isotope-hidden",hiddenStyle:{opacity:0,scale:.001},visibleStyle:{opacity:1,scale:1},containerStyle:{position:"relative",overflow:"hidden"},animationEngine:"best-available",animationOptions:{queue:!1,duration:800},sortBy:"original-order",sortAscending:!0,resizesContainer:!0,transformsEnabled:!0,itemPositionDataEnabled:!1},b.Isotope.prototype={_create:function(a){this.options=b.extend({},b.Isotope.settings,a),this.styleQueue=[],this.elemCount=0;var c=this.element[0].style;this.originalStyle={};var d=u.slice(0);for(var e in this.options.containerStyle)d.push(e);for(var f=0,g=d.length;f<g;f++)e=d[f],this.originalStyle[e]=c[e]||"";this.element.css(this.options.containerStyle),this._updateAnimationEngine(),this._updateUsingTransforms();var h={"original-order":function(a,b){return b.elemCount++,b.elemCount},random:function(){return Math.random()}};this.options.getSortData=b.extend(this.options.getSortData,h),this.reloadItems(),this.offset={left:parseInt(this.element.css("padding-left")||0,10),top:parseInt(this.element.css("padding-top")||0,10)};var i=this;setTimeout(function(){i.element.addClass(i.options.containerClass)},0),this.options.resizable&&v.bind("smartresize.isotope",function(){i.resize()}),this.element.delegate("."+this.options.hiddenClass,"click",function(){return!1})},_getAtoms:function(a){var b=this.options.itemSelector,c=b?a.filter(b).add(a.find(b)):a,d={position:"absolute"};return this.usingTransforms&&(d.left=0,d.top=0),c.css(d).addClass(this.options.itemClass),this.updateSortData(c,!0),c},_init:function(a){this.$filteredAtoms=this._filter(this.$allAtoms),this._sort(),this.reLayout(a)},option:function(a){if(b.isPlainObject(a)){this.options=b.extend(!0,this.options,a);var c;for(var d in a)c="_update"+f(d),this[c]&&this[c]()}},_updateAnimationEngine:function(){var a=this.options.animationEngine.toLowerCase().replace(/[ _\-]/g,""),b;switch(a){case"css":case"none":b=!1;break;case"jquery":b=!0;break;default:b=!e.csstransitions}this.isUsingJQueryAnimation=b,this._updateUsingTransforms()},_updateTransformsEnabled:function(){this._updateUsingTransforms()},_updateUsingTransforms:function(){var a=this.usingTransforms=this.options.transformsEnabled&&e.csstransforms&&e.csstransitions&&!this.isUsingJQueryAnimation;a||(delete this.options.hiddenStyle.scale,delete this.options.visibleStyle.scale),this.getPositionStyles=a?this._translate:this._positionAbs},_filter:function(a){var b=this.options.filter===""?"*":this.options.filter;if(!b)return a;var c=this.options.hiddenClass,d="."+c,e=a.filter(d),f=e;if(b!=="*"){f=e.filter(b);var g=a.not(d).not(b).addClass(c);this.styleQueue.push({$el:g,style:this.options.hiddenStyle})}return this.styleQueue.push({$el:f,style:this.options.visibleStyle}),f.removeClass(c),a.filter(b)},updateSortData:function(a,c){var d=this,e=this.options.getSortData,f,g;a.each(function(){f=b(this),g={};for(var a in e)!c&&a==="original-order"?g[a]=b.data(this,"isotope-sort-data")[a]:g[a]=e[a](f,d);b.data(this,"isotope-sort-data",g)})},_sort:function(){var a=this.options.sortBy,b=this._getSorter,c=this.options.sortAscending?1:-1,d=function(d,e){var f=b(d,a),g=b(e,a);return f===g&&a!=="original-order"&&(f=b(d,"original-order"),g=b(e,"original-order")),(f>g?1:f<g?-1:0)*c};this.$filteredAtoms.sort(d)},_getSorter:function(a,c){return b.data(a,"isotope-sort-data")[c]},_translate:function(a,b){return{translate:[a,b]}},_positionAbs:function(a,b){return{left:a,top:b}},_pushPosition:function(a,b,c){b=Math.round(b+this.offset.left),c=Math.round(c+this.offset.top);var d=this.getPositionStyles(b,c);this.styleQueue.push({$el:a,style:d}),this.options.itemPositionDataEnabled&&a.data("isotope-item-position",{x:b,y:c})},layout:function(a,b){var c=this.options.layoutMode;this["_"+c+"Layout"](a);if(this.options.resizesContainer){var d=this["_"+c+"GetContainerSize"]();this.styleQueue.push({$el:this.element,style:d})}this._processStyleQueue(a,b),this.isLaidOut=!0},_processStyleQueue:function(a,c){var d=this.isLaidOut?this.isUsingJQueryAnimation?"animate":"css":"css",f=this.options.animationOptions,g=this.options.onLayout,h,i,j,k;i=function(a,b){b.$el[d](b.style,f)};if(this._isInserting&&this.isUsingJQueryAnimation)i=function(a,b){h=b.$el.hasClass("no-transition")?"css":d,b.$el[h](b.style,f)};else if(c||g||f.complete){var l=!1,m=[c,g,f.complete],n=this;j=!0,k=function(){if(l)return;var b;for(var c=0,d=m.length;c<d;c++)b=m[c],typeof b=="function"&&b.call(n.element,a,n);l=!0};if(this.isUsingJQueryAnimation&&d==="animate")f.complete=k,j=!1;else if(e.csstransitions){var o=0,p=this.styleQueue[0],s=p&&p.$el,t;while(!s||!s.length){t=this.styleQueue[o++];if(!t)return;s=t.$el}var u=parseFloat(getComputedStyle(s[0])[r]);u>0&&(i=function(a,b){b.$el[d](b.style,f).one(q,k)},j=!1)}}b.each(this.styleQueue,i),j&&k(),this.styleQueue=[]},resize:function(){this["_"+this.options.layoutMode+"ResizeChanged"]()&&this.reLayout()},reLayout:function(a){this["_"+this.options.layoutMode+"Reset"](),this.layout(this.$filteredAtoms,a)},addItems:function(a,b){var c=this._getAtoms(a);this.$allAtoms=this.$allAtoms.add(c),b&&b(c)},insert:function(a,b){this.element.append(a);var c=this;this.addItems(a,function(a){var d=c._filter(a);c._addHideAppended(d),c._sort(),c.reLayout(),c._revealAppended(d,b)})},appended:function(a,b){var c=this;this.addItems(a,function(a){c._addHideAppended(a),c.layout(a),c._revealAppended(a,b)})},_addHideAppended:function(a){this.$filteredAtoms=this.$filteredAtoms.add(a),a.addClass("no-transition"),this._isInserting=!0,this.styleQueue.push({$el:a,style:this.options.hiddenStyle})},_revealAppended:function(a,b){var c=this;setTimeout(function(){a.removeClass("no-transition"),c.styleQueue.push({$el:a,style:c.options.visibleStyle}),c._isInserting=!1,c._processStyleQueue(a,b)},10)},reloadItems:function(){this.$allAtoms=this._getAtoms(this.element.children())},remove:function(a,b){this.$allAtoms=this.$allAtoms.not(a),this.$filteredAtoms=this.$filteredAtoms.not(a);var c=this,d=function(){a.remove(),b&&b.call(c.element)};a.filter(":not(."+this.options.hiddenClass+")").length?(this.styleQueue.push({$el:a,style:this.options.hiddenStyle}),this._sort(),this.reLayout(d)):d()},shuffle:function(a){this.updateSortData(this.$allAtoms),this.options.sortBy="random",this._sort(),this.reLayout(a)},destroy:function(){var a=this.usingTransforms,b=this.options;this.$allAtoms.removeClass(b.hiddenClass+" "+b.itemClass).each(function(){var b=this.style;b.position="",b.top="",b.left="",b.opacity="",a&&(b[i]="")});var c=this.element[0].style;for(var d in this.originalStyle)c[d]=this.originalStyle[d];this.element.unbind(".isotope").undelegate("."+b.hiddenClass,"click").removeClass(b.containerClass).removeData("isotope"),v.unbind(".isotope")},_getSegments:function(a){var b=this.options.layoutMode,c=a?"rowHeight":"columnWidth",d=a?"height":"width",e=a?"rows":"cols",g=this.element[d](),h,i=this.options[b]&&this.options[b][c]||this.$filteredAtoms["outer"+f(d)](!0)||g;h=Math.floor(g/i),h=Math.max(h,1),this[b][e]=h,this[b][c]=i},_checkIfSegmentsChanged:function(a){var b=this.options.layoutMode,c=a?"rows":"cols",d=this[b][c];return this._getSegments(a),this[b][c]!==d},_masonryReset:function(){this.masonry={},this._getSegments();var a=this.masonry.cols;this.masonry.colYs=[];while(a--)this.masonry.colYs.push(0)},_masonryLayout:function(a){var c=this,d=c.masonry;a.each(function(){var a=b(this),e=Math.ceil(a.outerWidth(!0)/d.columnWidth);e=Math.min(e,d.cols);if(e===1)c._masonryPlaceBrick(a,d.colYs);else{var f=d.cols+1-e,g=[],h,i;for(i=0;i<f;i++)h=d.colYs.slice(i,i+e),g[i]=Math.max.apply(Math,h);c._masonryPlaceBrick(a,g)}})},_masonryPlaceBrick:function(a,b){var c=Math.min.apply(Math,b),d=0;for(var e=0,f=b.length;e<f;e++)if(b[e]===c){d=e;break}var g=this.masonry.columnWidth*d,h=c;this._pushPosition(a,g,h);var i=c+a.outerHeight(!0),j=this.masonry.cols+1-f;for(e=0;e<j;e++)this.masonry.colYs[d+e]=i},_masonryGetContainerSize:function(){var a=Math.max.apply(Math,this.masonry.colYs);return{height:a}},_masonryResizeChanged:function(){return this._checkIfSegmentsChanged()},_fitRowsReset:function(){this.fitRows={x:0,y:0,height:0}},_fitRowsLayout:function(a){var c=this,d=this.element.width(),e=this.fitRows;a.each(function(){var a=b(this),f=a.outerWidth(!0),g=a.outerHeight(!0);e.x!==0&&f+e.x>d&&(e.x=0,e.y=e.height),c._pushPosition(a,e.x,e.y),e.height=Math.max(e.y+g,e.height),e.x+=f})},_fitRowsGetContainerSize:function(){return{height:this.fitRows.height}},_fitRowsResizeChanged:function(){return!0},_cellsByRowReset:function(){this.cellsByRow={index:0},this._getSegments(),this._getSegments(!0)},_cellsByRowLayout:function(a){var c=this,d=this.cellsByRow;a.each(function(){var a=b(this),e=d.index%d.cols,f=Math.floor(d.index/d.cols),g=(e+.5)*d.columnWidth-a.outerWidth(!0)/2,h=(f+.5)*d.rowHeight-a.outerHeight(!0)/2;c._pushPosition(a,g,h),d.index++})},_cellsByRowGetContainerSize:function(){return{height:Math.ceil(this.$filteredAtoms.length/this.cellsByRow.cols)*this.cellsByRow.rowHeight+this.offset.top}},_cellsByRowResizeChanged:function(){return this._checkIfSegmentsChanged()},_straightDownReset:function(){this.straightDown={y:0}},_straightDownLayout:function(a){var c=this;a.each(function(a){var d=b(this);c._pushPosition(d,0,c.straightDown.y),c.straightDown.y+=d.outerHeight(!0)})},_straightDownGetContainerSize:function(){return{height:this.straightDown.y}},_straightDownResizeChanged:function(){return!0},_masonryHorizontalReset:function(){this.masonryHorizontal={},this._getSegments(!0);var a=this.masonryHorizontal.rows;this.masonryHorizontal.rowXs=[];while(a--)this.masonryHorizontal.rowXs.push(0)},_masonryHorizontalLayout:function(a){var c=this,d=c.masonryHorizontal;a.each(function(){var a=b(this),e=Math.ceil(a.outerHeight(!0)/d.rowHeight);e=Math.min(e,d.rows);if(e===1)c._masonryHorizontalPlaceBrick(a,d.rowXs);else{var f=d.rows+1-e,g=[],h,i;for(i=0;i<f;i++)h=d.rowXs.slice(i,i+e),g[i]=Math.max.apply(Math,h);c._masonryHorizontalPlaceBrick(a,g)}})},_masonryHorizontalPlaceBrick:function(a,b){var c=Math.min.apply(Math,b),d=0;for(var e=0,f=b.length;e<f;e++)if(b[e]===c){d=e;break}var g=c,h=this.masonryHorizontal.rowHeight*d;this._pushPosition(a,g,h);var i=c+a.outerWidth(!0),j=this.masonryHorizontal.rows+1-f;for(e=0;e<j;e++)this.masonryHorizontal.rowXs[d+e]=i},_masonryHorizontalGetContainerSize:function(){var a=Math.max.apply(Math,this.masonryHorizontal.rowXs);return{width:a}},_masonryHorizontalResizeChanged:function(){return this._checkIfSegmentsChanged(!0)},_fitColumnsReset:function(){this.fitColumns={x:0,y:0,width:0}},_fitColumnsLayout:function(a){var c=this,d=this.element.height(),e=this.fitColumns;a.each(function(){var a=b(this),f=a.outerWidth(!0),g=a.outerHeight(!0);e.y!==0&&g+e.y>d&&(e.x=e.width,e.y=0),c._pushPosition(a,e.x,e.y),e.width=Math.max(e.x+f,e.width),e.y+=g})},_fitColumnsGetContainerSize:function(){return{width:this.fitColumns.width}},_fitColumnsResizeChanged:function(){return!0},_cellsByColumnReset:function(){this.cellsByColumn={index:0},this._getSegments(),this._getSegments(!0)},_cellsByColumnLayout:function(a){var c=this,d=this.cellsByColumn;a.each(function(){var a=b(this),e=Math.floor(d.index/d.rows),f=d.index%d.rows,g=(e+.5)*d.columnWidth-a.outerWidth(!0)/2,h=(f+.5)*d.rowHeight-a.outerHeight(!0)/2;c._pushPosition(a,g,h),d.index++})},_cellsByColumnGetContainerSize:function(){return{width:Math.ceil(this.$filteredAtoms.length/this.cellsByColumn.rows)*this.cellsByColumn.columnWidth}},_cellsByColumnResizeChanged:function(){return this._checkIfSegmentsChanged(!0)},_straightAcrossReset:function(){this.straightAcross={x:0}},_straightAcrossLayout:function(a){var c=this;a.each(function(a){var d=b(this);c._pushPosition(d,c.straightAcross.x,0),c.straightAcross.x+=d.outerWidth(!0)})},_straightAcrossGetContainerSize:function(){return{width:this.straightAcross.x}},_straightAcrossResizeChanged:function(){return!0}},b.fn.imagesLoaded=function(a){function h(){a.call(c,d)}function i(a){var c=a.target;c.src!==f&&b.inArray(c,g)===-1&&(g.push(c),--e<=0&&(setTimeout(h),d.unbind(".imagesLoaded",i)))}var c=this,d=c.find("img").add(c.filter("img")),e=d.length,f="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",g=[];return e||h(),d.bind("load.imagesLoaded error.imagesLoaded",i).each(function(){var a=this.src;this.src=f,this.src=a}),c};var w=function(b){a.console&&a.console.error(b)};b.fn.isotope=function(a,c){if(typeof a=="string"){var d=Array.prototype.slice.call(arguments,1);this.each(function(){var c=b.data(this,"isotope");if(!c){w("cannot call methods on isotope prior to initialization; attempted to call method '"+a+"'");return}if(!b.isFunction(c[a])||a.charAt(0)==="_"){w("no such method '"+a+"' for isotope instance");return}c[a].apply(c,d)})}else this.each(function(){var d=b.data(this,"isotope");d?(d.option(a),d._init(c)):b.data(this,"isotope",new b.Isotope(a,this,c))});return this}})(window,jQuery);

/*
* Slides, A Slideshow Plugin for jQuery
* Intructions: http://slidesjs.com
* By: Nathan Searles, http://nathansearles.com
* Version: 1.1.9
* Updated: September 5th, 2011
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function($){
	$.fn.slides = function( option ) {
		// override defaults with specified option
		option = $.extend( {}, $.fn.slides.option, option );

		return this.each(function(){
			// wrap slides in control container, make sure slides are block level
			$('.' + option.container, $(this)).children().wrapAll('<div class="slides_control"/>');

			var elem = $(this),
				control = $('.slides_control',elem),
				total = control.children().size(),
				width = control.children().outerWidth(),
				height = control.children().outerHeight(),
				start = option.start - 1,
				effect = option.effect.indexOf(',') < 0 ? option.effect : option.effect.replace(' ', '').split(',')[0],
				paginationEffect = option.effect.indexOf(',') < 0 ? effect : option.effect.replace(' ', '').split(',')[1],
				next = 0, prev = 0, number = 0, current = 0, loaded, active, clicked, position, direction, imageParent, pauseTimeout, playInterval;

			// is there only one slide?
			if (total < 2) {
				// Fade in .slides_container
				$('.' + option.container, $(this)).fadeIn(option.fadeSpeed, option.fadeEasing, function(){
					// let the script know everything is loaded
					loaded = true;
					// call the loaded funciton
					option.slidesLoaded();
				});
				// Hide the next/previous buttons
				$('.' + option.next + ', .' + option.prev).fadeOut(0);
				return false;
			}

			// animate slides
			function animate(direction, effect, clicked) {
				if (!active && loaded) {
					active = true;
					// start of animation
					option.animationStart(current + 1);
					switch(direction) {
						case 'next':
							// change current slide to previous
							prev = current;
							// get next from current + 1
							next = current + 1;
							// if last slide, set next to first slide
							next = total === next ? 0 : next;
							// set position of next slide to right of previous
							position = width*2;
							// distance to slide based on width of slides
							direction = -width*2;
							// store new current slide
							current = next;
						break;
						case 'prev':
							// change current slide to previous
							prev = current;
							// get next from current - 1
							next = current - 1;
							// if first slide, set next to last slide
							next = next === -1 ? total-1 : next;
							// set position of next slide to left of previous
							position = 0;
							// distance to slide based on width of slides
							direction = 0;
							// store new current slide
							current = next;
						break;
						case 'pagination':
							// get next from pagination item clicked, convert to number
							next = parseInt(clicked,10);
							// get previous from pagination item with class of current
							prev = $('.' + option.paginationClass + ' li.'+ option.currentClass +' a', elem).attr('href').match('[^#/]+$');
							// if next is greater then previous set position of next slide to right of previous
							if (next > prev) {
								position = width*2;
								direction = -width*2;
							} else {
							// if next is less then previous set position of next slide to left of previous
								position = 0;
								direction = 0;
							}
							// store new current slide
							current = next;
						break;
					}

					// fade animation
					if (effect === 'fade') {
						// fade animation with crossfade
						if (option.crossfade) {
							// put hidden next above current
							control.children(':eq('+ next +')', elem).css({
								zIndex: 10
							// fade in next
							}).fadeIn(option.fadeSpeed, option.fadeEasing, function(){
								if (option.autoHeight) {
									// animate container to height of next
									control.animate({
										height: control.children(':eq('+ next +')', elem).outerHeight()
									}, option.autoHeightSpeed, function(){
										// hide previous
										control.children(':eq('+ prev +')', elem).css({
											display: 'none',
											zIndex: 0
										});
										// reset z index
										control.children(':eq('+ next +')', elem).css({
											zIndex: 0
										});
										// end of animation
										option.animationComplete(next + 1);
										active = false;
									});
								} else {
									// hide previous
									control.children(':eq('+ prev +')', elem).css({
										display: 'none',
										zIndex: 0
									});
									// reset zindex
									control.children(':eq('+ next +')', elem).css({
										zIndex: 0
									});
									// end of animation
									option.animationComplete(next + 1);
									active = false;
								}
							});
						} else {
							// fade animation with no crossfade
							control.children(':eq('+ prev +')', elem).fadeOut(option.fadeSpeed,  option.fadeEasing, function(){
								// animate to new height
								if (option.autoHeight) {
									control.animate({
										// animate container to height of next
										height: control.children(':eq('+ next +')', elem).outerHeight()
									}, option.autoHeightSpeed,
									// fade in next slide
									function(){
										control.children(':eq('+ next +')', elem).fadeIn(option.fadeSpeed, option.fadeEasing);
									});
								} else {
								// if fixed height
									control.children(':eq('+ next +')', elem).fadeIn(option.fadeSpeed, option.fadeEasing, function(){
										// fix font rendering in ie, lame
										if($.browser.msie) {
											$(this).get(0).style.removeAttribute('filter');
										}
									});
								}
								// end of animation
								option.animationComplete(next + 1);
								active = false;
							});
						}
					// slide animation
					} else {
						// move next slide to right of previous
						control.children(':eq('+ next +')').css({
							left: position,
							display: 'block'
						});
						// animate to new height
						if (option.autoHeight) {
							control.animate({
								left: direction,
								height: control.children(':eq('+ next +')').outerHeight()
							},option.slideSpeed, option.slideEasing, function(){
								control.css({
									left: -width
								});
								control.children(':eq('+ next +')').css({
									left: width,
									zIndex: 5
								});
								// reset previous slide
								control.children(':eq('+ prev +')').css({
									left: width,
									display: 'none',
									zIndex: 0
								});
								// end of animation
								option.animationComplete(next + 1);
								active = false;
							});
							// if fixed height
							} else {
								// animate control
								control.animate({
									left: direction
								},option.slideSpeed, option.slideEasing, function(){
									// after animation reset control position
									control.css({
										left: -width
									});
									// reset and show next
									control.children(':eq('+ next +')').css({
										left: width,
										zIndex: 5
									});
									// reset previous slide
									control.children(':eq('+ prev +')').css({
										left: width,
										display: 'none',
										zIndex: 0
									});
									// end of animation
									option.animationComplete(next + 1);
									active = false;
								});
							}
						}
					// set current state for pagination
					if (option.pagination) {
						// remove current class from all
						$('.'+ option.paginationClass +' li.' + option.currentClass, elem).removeClass(option.currentClass);
						// add current class to next
						$('.' + option.paginationClass + ' li:eq('+ next +')', elem).addClass(option.currentClass);
					}
				}
			} // end animate function

			function stop() {
				// clear interval from stored id
				clearInterval(elem.data('interval'));
			}

			function pause() {
				if (option.pause) {
					// clear timeout and interval
					clearTimeout(elem.data('pause'));
					clearInterval(elem.data('interval'));
					// pause slide show for option.pause amount
					pauseTimeout = setTimeout(function() {
						// clear pause timeout
						clearTimeout(elem.data('pause'));
						// start play interval after pause
						playInterval = setInterval(	function(){
							animate("next", effect);
						},option.play);
						// store play interval
						elem.data('interval',playInterval);
					},option.pause);
					// store pause interval
					elem.data('pause',pauseTimeout);
				} else {
					// if no pause, just stop
					stop();
				}
			}

			// 2 or more slides required
			if (total < 2) {
				return;
			}

			// error corection for start slide
			if (start < 0) {
				start = 0;
			}

			if (start > total) {
				start = total - 1;
			}

			// change current based on start option number
			if (option.start) {
				current = start;
			}

			// randomizes slide order
			if (option.randomize) {
				control.randomize();
			}

			// make sure overflow is hidden, width is set
			$('.' + option.container, elem).css({
				overflow: 'hidden',
				// fix for ie
				position: 'relative'
			});

			// set css for slides
			control.children().css({
				position: 'absolute',
				top: 0,
				left: control.children().outerWidth(),
				zIndex: 0,
				display: 'none'
			 });

			// set css for control div
			control.css({
				position: 'relative',
				// size of control 3 x slide width
				width: (width * 3),
				// set height to slide height
				height: height,
				// center control to slide
				left: -width
			});

			// show slides
			$('.' + option.container, elem).css({
				display: 'block'
			});

			// if autoHeight true, get and set height of first slide
			if (option.autoHeight) {
				control.children().css({
					height: 'auto'
				});
				control.animate({
					height: control.children(':eq('+ start +')').outerHeight()
				},option.autoHeightSpeed);
			}

			// checks if image is loaded
			if (option.preload && control.find('img:eq(' + start + ')').length) {
				// adds preload image
				$('.' + option.container, elem).css({
					background: 'url(' + option.preloadImage + ') no-repeat 50% 50%'
				});

				// gets image src, with cache buster
				var img = control.find('img:eq(' + start + ')').attr('src') + '?' + (new Date()).getTime();

				// check if the image has a parent
				if ($('img', elem).parent().attr('class') != 'slides_control') {
					// If image has parent, get tag name
					imageParent = control.children(':eq(0)')[0].tagName.toLowerCase();
				} else {
					// Image doesn't have parent, use image tag name
					imageParent = control.find('img:eq(' + start + ')');
				}

				// checks if image is loaded
				control.find('img:eq(' + start + ')').attr('src', img).load(function() {
					// once image is fully loaded, fade in
					control.find(imageParent + ':eq(' + start + ')').fadeIn(option.fadeSpeed, option.fadeEasing, function(){
						$(this).css({
							zIndex: 5
						});
						// removes preload image
						$('.' + option.container, elem).css({
							background: ''
						});
						// let the script know everything is loaded
						loaded = true;
						// call the loaded funciton
						option.slidesLoaded();
					});
				});
			} else {
				// if no preloader fade in start slide
				control.children(':eq(' + start + ')').fadeIn(option.fadeSpeed, option.fadeEasing, function(){
					// let the script know everything is loaded
					loaded = true;
					// call the loaded funciton
					option.slidesLoaded();
				});
			}

			// click slide for next
			if (option.bigTarget) {
				// set cursor to pointer
				control.children().css({
					cursor: 'pointer'
				});
				// click handler
				control.children().click(function(){
					// animate to next on slide click
					animate('next', effect);
					return false;
				});
			}

			// pause on mouseover
			if (option.hoverPause && option.play) {
				control.bind('mouseover',function(){
					// on mouse over stop
					stop();
				});
				control.bind('mouseleave',function(){
					// on mouse leave start pause timeout
					pause();
				});
			}

			// generate next/prev buttons
			if (option.generateNextPrev) {
				$('.' + option.container, elem).after('<a href="#" class="'+ option.prev +'">Prev</a>');
				$('.' + option.prev, elem).after('<a href="#" class="'+ option.next +'">Next</a>');
			}

			// next button
			$('.' + option.next ,elem).click(function(e){
				e.preventDefault();
				if (option.play) {
					pause();
				}
				animate('next', effect);
			});

			// previous button
			$('.' + option.prev, elem).click(function(e){
				e.preventDefault();
				if (option.play) {
					 pause();
				}
				animate('prev', effect);
			});

			// generate pagination
			if (option.generatePagination) {
				// create unordered list
				if (option.prependPagination) {
					elem.prepend('<ul class='+ option.paginationClass +'></ul>');
				} else {
					elem.append('<ul class='+ option.paginationClass +'></ul>');
				}
				// for each slide create a list item and link
				control.children().each(function(){
					$('.' + option.paginationClass, elem).append('<li><a href="#'+ number +'">'+ (number+1) +'</a></li>');
					number++;
				});
			} else {
				// if pagination exists, add href w/ value of item number to links
				$('.' + option.paginationClass + ' li a', elem).each(function(){
					$(this).attr('href', '#' + number);
					number++;
				});
			}

			// add current class to start slide pagination
			$('.' + option.paginationClass + ' li:eq('+ start +')', elem).addClass(option.currentClass);

			// click handling
			$('.' + option.paginationClass + ' li a', elem ).click(function(){
				// pause slideshow
				if (option.play) {
					 pause();
				}
				// get clicked, pass to animate function
				clicked = $(this).attr('href').match('[^#/]+$');
				// if current slide equals clicked, don't do anything
				if (current != clicked) {
					animate('pagination', paginationEffect, clicked);
				}
				return false;
			});

			// click handling
			$('a.link', elem).click(function(){
				// pause slideshow
				if (option.play) {
					 pause();
				}
				// get clicked, pass to animate function
				clicked = $(this).attr('href').match('[^#/]+$') - 1;
				// if current slide equals clicked, don't do anything
				if (current != clicked) {
					animate('pagination', paginationEffect, clicked);
				}
				return false;
			});

			if (option.play) {
				// set interval
				playInterval = setInterval(function() {
					animate('next', effect);
				}, option.play);
				// store interval id
				elem.data('interval',playInterval);
			}
		});
	};

	// default options
	$.fn.slides.option = {
		preload: false, // boolean, Set true to preload images in an image based slideshow
		preloadImage: '/img/loading.gif', // string, Name and location of loading image for preloader. Default is "/img/loading.gif"
		container: 'slides_container', // string, Class name for slides container. Default is "slides_container"
		generateNextPrev: false, // boolean, Auto generate next/prev buttons
		next: 'next', // string, Class name for next button
		prev: 'prev', // string, Class name for previous button
		pagination: true, // boolean, If you're not using pagination you can set to false, but don't have to
		generatePagination: true, // boolean, Auto generate pagination
		prependPagination: false, // boolean, prepend pagination
		paginationClass: 'pagination', // string, Class name for pagination
		currentClass: 'current', // string, Class name for current class
		fadeSpeed: 350, // number, Set the speed of the fading animation in milliseconds
		fadeEasing: '', // string, must load jQuery's easing plugin before http://gsgd.co.uk/sandbox/jquery/easing/
		slideSpeed: 350, // number, Set the speed of the sliding animation in milliseconds
		slideEasing: '', // string, must load jQuery's easing plugin before http://gsgd.co.uk/sandbox/jquery/easing/
		start: 1, // number, Set the speed of the sliding animation in milliseconds
		effect: 'slide', // string, '[next/prev], [pagination]', e.g. 'slide, fade' or simply 'fade' for both
		crossfade: false, // boolean, Crossfade images in a image based slideshow
		randomize: false, // boolean, Set to true to randomize slides
		play: 0, // number, Autoplay slideshow, a positive number will set to true and be the time between slide animation in milliseconds
		pause: 0, // number, Pause slideshow on click of next/prev or pagination. A positive number will set to true and be the time of pause in milliseconds
		hoverPause: false, // boolean, Set to true and hovering over slideshow will pause it
		autoHeight: false, // boolean, Set to true to auto adjust height
		autoHeightSpeed: 350, // number, Set auto height animation time in milliseconds
		bigTarget: false, // boolean, Set to true and the whole slide will link to next slide on click
		animationStart: function(){}, // Function called at the start of animation
		animationComplete: function(){}, // Function called at the completion of animation
		slidesLoaded: function() {} // Function is called when slides is fully loaded
	};

	// Randomize slide order on load
	$.fn.randomize = function(callback) {
		function randomizeOrder() { return(Math.round(Math.random())-0.5); }
			return($(this).each(function() {
			var $this = $(this);
			var $children = $this.children();
			var childCount = $children.length;
			if (childCount > 1) {
				$children.hide();
				var indices = [];
				for (i=0;i<childCount;i++) { indices[indices.length] = i; }
				indices = indices.sort(randomizeOrder);
				$.each(indices,function(j,k) {
					var $child = $children.eq(k);
					var $clone = $child.clone(true);
					$clone.show().appendTo($this);
					if (callback !== undefined) {
						callback($child, $clone);
					}
				$child.remove();
			});
			}
		}));
	};
})(jQuery);


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});