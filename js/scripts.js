var $ = jQuery.noConflict();
$(document).ready(function(){

	/* TOUCH SAVERS */

	var touchM = "ontouchstart" in window;

	if(touchM){
		$('.socialIcons a').css('opacity', 1);
		$('a').each(function(){
			$(this).css('color', $(this).css('color'));
		})
	}

	/* PROJECT HISTORY */

	var projectBase = 'project';
	var iH = document.location.hash;

    var openedP = false;
    $projectHolder = $('#portfolioSliderBk');
    $folioMenu = $('.portfolioMenu');
    $loader = $('#folioPreloader');

	if(iH.indexOf(projectBase) > 0){
		var iT = iH.slice(iH.indexOf(projectBase) + projectBase.length + 1, iH.length);
		$('.portfolioContainer').find('a').each(function(){
			if(iT == $(this).data('title')){
				startLoading($(this).attr('href'), $(this).data('title'));
			}
		});
	};

	/* INITS AND SMALL STUFF */

	/* MENU */

	$('#menu ul').onePageNav({
	 	currentClass: 'selected',
	 	changeHash: true,
	 	scrollSpeed: 750
 	});

    var mSel = null;
	$('#menu').find('ul').children('li').each(function(){
		if($($(this).find('a').attr('href')).offset().top < getTopScroll()-50){
			if(mSel != null)
				mSel.removeClass('selected');
			mSel = $(this);
			mSel.addClass('selected');
		}
	});

	$('.rMenu').find('select').bind('change', function(){
		$('html, body').stop().animate({scrollTop: $($(this).find('option:selected').data('href')).offset().top}, 1000);
	});

	$('#menu').css({'marginTop': -Math.round($('#menu').height()/2)});

	/* HEADER - LAYERS ANIMATION */
	var lL = 4, lI = 0;
	$('#home').find('img').each(function(){

		if($(this)[0].complete){
			if(++lI == lL) doLayers();
		} else {
			$(this).load(function(){
				if(++lI == lL) doLayers();
			});
		}

	});

	function doLayers(){
		$('#home #back').animate({'opacity': 0.5}, 600);
		$('#home #layer1').css('marginTop', -300).delay(500).animate({'marginTop': 0, 'opacity': 1}, 600, 'easeInQuad');
		$('#home #layer2').css('marginTop', 200).delay(1000).animate({'marginTop': 0, 'opacity': 1}, 400, 'easeInQuad');
		$('#home #layer3').css('marginTop', 200).delay(1200).animate({'marginTop': 0, 'opacity': 1}, 400, 'easeInQuad');
	}

	/* PORTFOLIO - SINGLE PROJECT PAGES */

    function initFolioSlider(){
        $("#portfolioSlider").slides({
        	effect: 'fade',
        	crossfade: true,
        	container: 'slidesContainer',
			animationStart:function(){
				$('#portfolioSlider .caption').stop().fadeOut(200);
			},
			animationComplete:function(){
				$('#portfolioSlider .caption').stop().fadeIn(200);
			},
			slidesLoaded:function(){
				$('#portfolioSlider .caption').stop().fadeIn(200);
			}
        });
    }

    $('.portfolioContainer').find('li').click(function(){
    	startLoading($(this).find('a').attr('href'), $(this).find('a').data('title'));
    	return false;
    });

    function startLoading(href, title){

    	if(href != '#'){

    		document.location.href = '#' + projectBase + '/' + title;

	    	if(!openedP){

	    		$projectHolder.css('height', 500);
				$folioMenu.animate({'marginTop': 500+90}, 300, 'easeInQuad');
				$projectHolder.slideDown(300, 'easeInQuad');
				$('html, body').animate({'scrollTop': $projectHolder.offset().top-20}, 500, 'easeInQuad');

				$loader.delay(300).fadeIn(150);

				openedP = true;

				setTimeout(function(){
					continueLoading(href);
				}, 450);

	    	} else {

				$projectHolder.children('div').animate({'opacity': 0}, 300, function(){
					$(this).remove();
				});

				$('html, body').animate({'scrollTop': $projectHolder.offset().top-20}, 300, 'easeInQuad');

				$loader.delay(600).fadeIn(150);

				setTimeout(function(){
					continueLoading(href);
				}, 459);

	    	}

	    } else {

	    	openedP = false;

			$projectHolder.children('div').animate({'opacity': 0}, 300, function(){
				$projectHolder.slideUp(300, 'easeOutQuad');
				$folioMenu.animate({'marginTop': 0}, 300, 'easeOutQuad');
				$(this).remove();
			});

    		document.location.href = '#/';

	    }

    }

    function continueLoading(href){
    	$('body').append('<div id="tempLoading" style="display:none;"></div>');
    	$('#tempLoading').load(href + ' #portfolioBox', function(){
    		finishLoading($('#tempLoading').html());
    		$('#tempLoading').remove();
    	})
    }

    function finishLoading(html){

		$projectHolder.append(html);

		var oH = $projectHolder.height();
		$projectHolder.css('height', 'auto');
		var menuMargin = $projectHolder.outerHeight();
		var holderSize = $projectHolder.height();
		$projectHolder.css('height', oH);

		initFolioSlider();

		$('.portfolioNavigation').find('a').click(function(){
    		startLoading($(this).attr('href'), $(this).data('title'));
    		return false;
   		});

		$folioMenu.animate({'marginTop': menuMargin+90}, 400, 'easeInQuad');
		$projectHolder.animate({'height': holderSize}, 400, 'easeInQuad');

		$loader.fadeOut(100);

		$projectHolder.children('div').delay(400).animate({'opacity': 1}, 600);

    }

    /* PORTFOLIO GRID + FILTERS */

    var $fContainer =  $('.portfolioContainer');
    $fContainer.isotope({
	  // options
	  itemSelector : '.project',
	  resizabe: false,
	  animationEngine: 'jquery'
	});

    var $fS = $('.portfolioMenu').find('li.selected');
    $('.portfolioMenu').find('li').click(function(){
    	if(!$(this).hasClass('selected')) {
	    	var filter = $(this).data('filter');
	    	$fContainer.isotope({
	    		'filter': filter
	    	});
	    	$fS.removeClass('selected');
	    	$fS = $(this);
	    	$fS.addClass('selected');
    	}
    	return false;
    });

    /* RESIZE */

    $('body').append('<span class="prag" id="pPrag0"><!-- code insertion --></span><span class="prag" id="pPrag1"><!-- code insertion --></span><span class="prag" id="pPrag2"><!-- code insertion --></span><span class="prag" id="pPrag3"><!-- code insertion --></span><span class="prag" id="pPrag4"><!-- code insertion --></span>');

    var $pPrag0 = $('#pPrag0');
    var $pPrag1 = $('#pPrag1');
    var $pPrag2 = $('#pPrag2');
    var $pPrag3 = $('#pPrag3');
    var $pPrag4 = $('#pPrag4');
    var pPrag = 0;

    if($pPrag0.css('display') == 'block') pPrag = 0;
    else if($pPrag1.css('display') == 'block') pPrag = 1;
    else if($pPrag2.css('display') == 'block') pPrag = 2;
    else if($pPrag3.css('display') == 'block') pPrag = 3;
    else if($pPrag4.css('display') == 'block') pPrag = 4;

    $(window).bind('resize', function(){

    	if($pPrag0.css('display') == 'block' && pPrag != 0){
			pPrag = 0;
			handleResize();
    	} else if($pPrag1.css('display') == 'block' && pPrag != 1){
			pPrag = 1;
			handleResize();
    	} else if($pPrag2.css('display') == 'block' && pPrag != 2){
			pPrag = 2;
			handleResize();
    	} else if($pPrag3.css('display') == 'block' && pPrag != 3){
			pPrag = 3;
			handleResize();
    	} else if($pPrag4.css('display') == 'block' && pPrag != 4){
			pPrag = 4;
			handleResize();
    	}

    });

    handleResize();

    function handleResize(){

	    $fContainer.isotope();

		$('#menu').css('marginTop', -Math.round($('#menu').height()/2));

		var oH = $projectHolder.height();
		$projectHolder.css('height', 'auto');
		var menuMargin = $projectHolder.outerHeight();
		var holderSize = $projectHolder.height();
		$projectHolder.css('height', oH);

		if(menuMargin >= 300){
			$folioMenu.css('marginTop', menuMargin+90);
			$projectHolder.css('height', holderSize);
		}

		$folioMenu.css('marginLeft', Math.round(($folioMenu.parent().width()-$folioMenu.outerWidth())/2));

		if(pPrag > 0)
			$('#menu ul').css({'marginLeft': -Math.round($('#menu ul').width()/2), 'paddingLeft':'50%'});
		else
			$('#menu ul').css({'marginLeft': 'auto', 'paddingLeft': 0});

    }

    var cmpI;
    function getTopScroll(){
    	return $('html').scrollTop() > 0 ? $('html').scrollTop() : $('body').scrollTop();
    }

    /* FORMS HANDLING */

	$('input, textarea').each(function(){

		if(!$(this).hasClass('submit') && $(this).attr('id') != 'submit' && $(this).attr('type') != 'submit'){
			$(this).attr('data-value', $(this).val())
				.focus(function(){
					//console.log('focus');
					$(this).removeClass('s-inactive');
					$(this).removeClass('focusInput');
					$(this).addClass('focusInput');
					if($(this).val() == $(this).attr('data-value')){
						$(this).val('');
					} else {
						$(this).select();
					}
				})
				.blur(function(){
					//console.log('blur');
					if($(this).attr('id') == 's') $(this).addClass('s-inactive');
					if($(this).val() == ''){
						$(this).val($(this).attr('data-value'));
					}
				});
		}

	});

	if($('#contact').length > 0){

		var $name = $('#formName');
		var $email = $('#formEmail');
		var $budget = $('#formBudget');
		var $time = $('#formTime');
		var $message = $('#formMessage');
		var $error = $('p.contactError');

		$('#formSubmit').click(function(){

			var ok = true;
			var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

			if($name.val().length < 3 || $name.val() == $name.data('value')){
				showError($name);
				ok = false;
			}

			if($email.val() == '' || $email.val() == $email.data('value') || !emailReg.test($email.val())){
				showError($email);
				ok = false;
			}

			if($message.val().length < 5 || $message.val() == $message.data('value')){
				showError($message);
				ok = false;
			}

			function showError($input){
				$input.val($input.data('value'));
				$input.addClass('contactErrorBorder');
				$error.fadeIn();
			}

			if(ok){
				$('.contactSucces').fadeIn();
			}

		});

		$name.focus(function(){resetError($(this))});
		$email.focus(function(){resetError($(this))});
		$message.focus(function(){resetError($(this))});

		function resetError($input){
			$input.removeClass('contactErrorBorder');
			$error.fadeOut();
		}

	}

    /* HEXAGON SHAPES & ANIMATIONS */

	var aI = 0, aArr = new Array(), currentI = 0, tweens = new Array();

	if(!$('html').hasClass('ie'))

		$('.portfolioContainer').find('li').each(function(){

			if($(this).find('img')[0].complete){
				$(this).append('<canvas class="hex" width="200" height="195"></canvas><canvas class="circ" width="200" height="195"></canvas><canvas class="bang" width="200" height="195"></canvas><span class="icon"></span>');
				maskImage($(this));
			} else {
				$(this).find('img').load(function(){
					$(this).parent().append('<canvas class="hex" width="200" height="195"></canvas><canvas class="circ" width="200" height="195"></canvas><canvas class="bang" width="200" height="195"></canvas><span class="icon"></span>');
					maskImage($(this).parent());
				});
			}

		});

	function maskImage($item){

		createMaskHex($item.find('canvas.hex')[0].getContext('2d'), $item.find('img')[0], 0);
		if(!touchM) createMaskHex($item.find('canvas.circ')[0].getContext('2d'), $item.find('img')[0], 0);
		if(!touchM) createShapeHex($item.find('canvas.bang')[0].getContext('2d'), $item.find('img')[0], 0);
		$item.find('img').css('display', 'none');

		$item.data({'step': 0});

		if(!touchM)

			$item.hover(function(){

				var ctx = $item.find('canvas.hex')[0].getContext('2d'),
				img = $item.find('img')[0],
				step = $item.data('step'),
				$this = $(this);

				Jacked.special(this, {

					callback: function(el, tick) {

						step = tick * 70;
						createMaskHex(ctx, img, step);
						$this.data("step", step);

					}

				});

			}, function(){

				var ctx = $item.find('canvas.hex')[0].getContext('2d'),
				img = $item.find('img')[0],
				step = $item.data('step'),
				$this = $(this);

				Jacked.special(this, {

					callback: function(el, tick) {

						step = 70 - (tick * 70);
						createMaskHex(ctx, img, step);
						$this.data("step", step);

					}

				});

			});

	};

	function createMaskHex(ctx, img, a){

		ctx.clearRect(0, 0, 200, 195);
		ctx.save();

	    ctx.beginPath();

		var w = 173;
		var h = 190;
		var x = 13;
		var y = 2;
		var r = 24;

		ctx.moveTo(x+w/2+r/4+3, y+2);
		/*1*/ctx.arcTo(x+w, y+h/4, x+w, y+h/4+r, r);
		/*2*/ctx.arcTo(x+w-a/2, y+h*.75-a/2, x+w-r-a, y+h*.75+r-a/2, r);
		/*3*/ctx.arcTo(x+w/2-a, y+h+6-a/2-a/8.75, x+w/2-10-a, y+h-a/2, r);
		/*4*/ctx.arcTo(x, y+h*.75+4, x, y+h*.75-r, r);
		/*5*/ctx.arcTo(x, y+h/4+2, x+r, y+h/4-r+5, r);
		/*6*/ctx.arcTo(x+w/2-6, y, x+w/2+r/4+4, y, r);

	    ctx.closePath();

	    ctx.clip();
	    ctx.drawImage(img, 0, 0);
	    ctx.restore();

	}


	function createShapeHex(ctx, img, a){

		ctx.clearRect(0, 0, 200, 195);
		ctx.save();

	    ctx.beginPath();

		var w = 173;
		var h = 190;
		var x = 13;
		var y = 2;
		var r = 24;

		ctx.moveTo(x+w/2+r/4+3, y+2);
		/*1*/ctx.arcTo(x+w, y+h/4, x+w, y+h/4+r, r);
		/*2*/ctx.arcTo(x+w-a, y+h*.75-a/2, x+w-r-a, y+h*.75+r-a/2, r);
		/*3*/ctx.arcTo(x+w/2-a, y+h+6-a/2, x+w/2-10-a, y+h-a/2, r);
		/*4*/ctx.arcTo(x, y+h*.75+4, x, y+h*.75-r, r);
		/*5*/ctx.arcTo(x, y+h/4+2, x+r, y+h/4-r+5, r);
		/*6*/ctx.arcTo(x+w/2-6, y, x+w/2+r/4+4, y, r);

	    ctx.closePath();

	    ctx.clip();
	    ctx.fillStyle = 'rgba(0,0,0,.85)';
	    ctx.fill();
	    ctx.restore();

	}

	if(!$('html').hasClass('ie'))

		$('.teamList').children('li').each(function(){

			if($(this).find('img')[0].complete){
				$(this).append('<canvas class="hex" width="200" height="195"></canvas>');
				createMaskHex($(this).find('canvas')[0].getContext('2d'), $(this).find('img')[0], 0);
				$(this).find('img').css('display','none');
			} else {
				$(this).find('img').load(function(){
					$(this).parent().append('<canvas class="hex" width="200" height="195"></canvas>');
					createMaskHex($(this).parent().find('canvas')[0].getContext('2d'), $(this).parent().find('img')[0], 0);
					$(this).css('display','none');
				});
			}

		});

});
