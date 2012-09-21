
$(function () {

	// Fix background alignment / rounding bug...
	if ($.browser.webkit || ($.browser.msie && $.browser.version <= 7)) {
		function fixWidth() {
			var w = $(window).width();
			if (w % 2 > 0) $('body').width(w - 1);
		}
		$(window).resize(fixWidth);
		fixWidth();
	}

	// Input placeholders (use class="placeholder" on associated label)
	$('label.placeholder').inputPlaceholder();

	// Button caps..
	$('a.button').append('<span class="cap"></span>');

	// Searchbox label
	$('form.searchbox label').addClass('aid');

	// Sharing buttons
	$('#social-share a').click(function (e) {
		e.preventDefault();
		var url = $(this).attr('href');
		window.open(url, 'share', 'toolbar=0,status=0,width=626,height=436');
	});

	// Fix IE7/8 inline-block redraw issues by replacing with block+width
	$(window).load(function(){
		if ($.browser.msie && $.browser.version < 9) {
			$('#media-detail').each(function () {
				var width = 640; // default for video
				var media = $(this).find('>div.media');
				var img = media.find('>img');
				if (img.length > 0) width = img.width();
				media.css({
					display: 'block',
					width: width + 'px'
				});
			});
		}
	});

	// Fix IE7 ribbon z-index
	if ($.browser.msie && $.browser.version <= 7) {
		$('img.ribbon').detach().appendTo('#header-content');
	}

	// Menu tab-navigation
	$('div#nav>ul>li.sub a, div#header-content>ul>li.sub a').focus(function(){
		$(this).parents('li.sub').addClass('focus');
	}).blur(function(){
		$(this).parents('li.sub').removeClass('focus');
	});

	// Download media
	$('#media-detail h2.download-toggle,#media-detail h2.transcription-toggle').wrapInner('<a href=""/>').add('>a').click(function(e){
		e.preventDefault();
		if ($(this).hasClass('active')) {
			$(this).next('div').stop(true, true).slideUp(300,function(){
				$(this).prev('h2').removeClass('active');
			});
		} else {
			$(this).next('div').stop(true, true).slideDown(300,function(){
				$(this).prev('h2').addClass('active');
			});
		}
	});
	$('#download-options li').click(function(e){
		if (e.target.nodeName != 'A')
			$(this).find('a').click();
	});
	
	// Dynamic search-box
	$('#encltoggle').each(function () {
		var encsearch = $('#encyclopedia-search');
		$(this).click(function (e) {
			e.preventDefault();
			if (!encsearch.is(':visible') && !encsearch.is(':animated')) {
				encsearch.show();
			}
		});
		$(document).bind('mousedown', function (e) {
			if ($(e.target).closest('#encyclopedia-search').length == 0) {
				encsearch.fadeOut(400);
			}
		});
	});

	// Overview form (year/month select, submit replacement)
	$('div.overview-header').each(function(){
		$(this).find('form input:submit').each(function(){
			var form = this.form;
			$(this).addClass('aid').after(
				$('<a href="" class="button forward"><span>Toon</span><span class="cap"></span></a>').click(function(e){
					e.preventDefault();
					form.submit();
				})
			);
		});

		$(this).find('#jaar').change(function () {
			var disable = $(this).val() == 'alles';
			var month = $(this.form).find('#maand');
			month.attr('disabled', disable);
			if (disable) month.val('alles');
		}).triggerHandler('change');
	});

	// FAQ
    $('ul.faq-sectioned,ul.faq').find('>li>h2,>li>h3').wrapInner('<a href=""/>').click(function (e) {
		e.preventDefault();
		var li = $(this).closest('li');
		li.toggleClass('active');
	});

	// Home carroussel
	$('#home-carrousel,#intro-carrousel').each(function () {
		var carr = $(this);
		$(window).load(function () {
			var items = carr.find('ul>li');
			if (items.length < 2) return;

			var autoplay = (carr.attr('id') != 'intro-carrousel');

			var currentIndex = 0;
			var timer;
			var nav = $('<div class="_nav">' + (autoplay ? '<span class="pause" title="Start/stop animatie"></span>' : '') + '</div>').appendTo(carr.find('>div'));
			var animating = false;

			for (var i = 0; i < items.length; i++) {
				nav.append((i > 0 ? '<span>/</span>' : '') + '<a href="">' + (i + 1) + '</a>');
			}
			nav.find('a').each(function (i) {
				$(this).data('idx', i);
				if (i == 0) $(this).addClass('active');
			}).click(function (e) {
				e.preventDefault();
				switchTo($(this).data('idx'));
			});

			nav.find('span.pause').click(function () {
				if (carr.hasClass('paused')) {
					carr.removeClass('paused');
					resetTimer();
				} else {
					stopTimer();
				}
			});

			function getNextIndex() {
				return (currentIndex == items.length - 1) ? 0 : currentIndex + 1;
			}

			function switchTo(idx) {
				if (animating || idx == currentIndex) return;
				animating = true;
				var itemOld = $(items[currentIndex]);
				var itemNew = $(items[idx]);

				itemOld.fadeOut(500, function () {
					itemNew.fadeIn(500, function () {
						animating = false;
						resetTimer();
					});
				});

				currentIndex = idx;
				nav.find('a').removeClass('active').filter(':eq(' + idx + ')').addClass('active');
			}

			function resetTimer() {
				if (carr.hasClass('paused')) return;
				clearInterval(timer);
				timer = setInterval(function () {
					switchTo(getNextIndex());
				}, 6000);
			}

			function stopTimer() {
				clearInterval(timer);
				carr.addClass('paused');
			}

			if (autoplay) resetTimer();
			else stopTimer();

		});

		// Add inset shadows to visuals
		$('.shadow-overlay').each(function () {
			$('<span/>').css({
				width: $(this).find('>img').width() + 'px'
			}).appendTo(this);
		});
	});


	// Sliders
	$(window).load(function () {
		$('div.slider').each(function () {
			var slider = $(this).addClass('js');
			var items = slider.find('>ul>li');

			var width = slider.width();
			var height = 0;
			items.each(function () {
				var h = $(this).height();
				if (h > height) height = h;
			});
			slider.css('min-height',height);
			items.width(width);

			if (items.length < 2) return;

			var currentIndex = 0;
			var nav = $('<button class="_prev" title="Vorige">Vorige</button><button class="_next" title="Volgende">Volgende</button>').appendTo(slider);
			var animating = false;

			nav.filter('button._prev').click(function () { switchTo(getPrevIndex(), 'prev'); });
			nav.filter('button._next').click(function () { switchTo(getNextIndex(), 'next'); });

			function getPrevIndex() { return (currentIndex == 0) ? items.length - 1 : currentIndex - 1; }
			function getNextIndex() { return (currentIndex == items.length - 1) ? 0 : currentIndex + 1; }

			function switchTo(idx, dir) {
				if (animating || idx == currentIndex) return;
				animating = true;
				var itemOld = $(items[currentIndex]);
				var itemNew = $(items[idx]);

				itemNew.show().css({
					left: dir == 'next' ? width + 20 : -width - 20
				}).animate({
					left: 0
				}, 700);
				itemOld.animate({
					left: dir == 'next' ? -width - 20 : width + 20
				}, 700, 'swing', function () {
					animating = false;
				});

				currentIndex = idx;
			}
		});
	});

	// Google Map
	$('div.googlemap').each(function () {
		var input = $(this).find('input:hidden');

		var zoom = parseInt(input.filter('[name=zoom]').val(), 10);
		var center = $.map(input.filter('[name=center]').val().split(','), function (val) { return parseFloat(val) });
		var markers = [];

		input.filter('[name^=marker]').each(function () {
			var val = $(this).val().split('|');
			markers.push({
				coords: $.map(val[0].split(','), function (val) { return parseFloat(val) }),
				title: val[1]
			});
		});

		var options = {
			zoom: zoom,
			center: new google.maps.LatLng(center[0], center[1]),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: !$(this).hasClass('simple'),
			streetViewControl: !$(this).hasClass('simple')
		};

		var map = new google.maps.Map(this, options);

		for (var i = 0; i < markers.length; i++) {
			markers[i].marker = new google.maps.Marker({
				position: new google.maps.LatLng(markers[i].coords[0], markers[i].coords[1]),
				title: markers[i].title,
				map: map
			});
		}
	});

	// RSS generator
	$('#rssgen').each(function () {
		var rssbase = $("#feed-url a").text() + "?";
		$(this).find('input:checkbox').change(function () {

			// Top down check
			var ul = $(this).closest('li').find('>ul');
			if (ul.length > 0) ul.find('input:checkbox').attr('checked', $(this).is(':checked'));

			// Bottom up check
			var parent = $(this).closest('ul');
			if (parent.attr('id') != 'rssgen') {
				var checks = parent.find('input:checkbox');
				var checkCount = checks.filter(':checked').length;
				parent.siblings('input:checkbox').attr('checked',checks.length == checkCount);
			}

			generateRSSURL(this.form,rssbase);
		});
		generateRSSURL($(this).closest('form'),rssbase);
	});

	function generateRSSURL(form,rssbase) {
		var rssdata = $(form).find('input:not([name^=chk])').serialize();
		if (rssdata.length > 0) {
			var rssurl = rssbase + rssdata;
			$('#feed-url').html($('<a/>').attr('href', rssurl).html(rssurl));
		} else {
			$('#feed-url').html('Geen opties gekozen');
		}
	}

	// Default form submit replacement
	$('form.default input:submit').each(function () {
		$('<a href="" class="button forward submit"><span class="cap"></span></a>')
			.append('<span>'+$(this).attr('value')+'</span>')
			.click(function (e) {
				e.preventDefault();
				$(this).closest('form')[0].submit();
				var msg = "Bezig met verzenden. Een ogenblik geduld alstublieft.";
				$(this).after('<img src="/images/loader.gif" width="24" height="24" alt="' + msg + '" title="' + msg + '" class="loader" />').remove();
			}).prependTo($(this).closest('li'));
	});

	// Controle submit replacements (custom)
	$('ul.form-check>li.submit>form input:submit').each(function () {
		var dir = ($(this).attr('name') == 'actie_pasaan') ? 'back' : 'forward';
		$('<a href="" class="button ' + dir + ' submit"><span class="cap"></span></a>')
			.append('<span>'+$(this).attr('value')+'</span>')
			.click(function (e) {
				e.preventDefault();
				$(this).closest('form')[0].submit();
				var msg = "Bezig met verzenden. Een ogenblik geduld alstublieft.";
				$(this).after('<img src="/images/loader.gif" width="24" height="24" alt="' + msg + '" title="' + msg + '" />').remove();
			}).prependTo($(this).closest('fieldset'));
	});


	// Footer social icons
	$('#footer ul.social img').hover(function(e){
		var src = $(this).attr('src');
		if (e.type == 'mouseenter') {
			src = src.replace('.png','_hover.png');
		} else {
			src = src.replace('_hover.png','.png');
		}
		$(this).attr('src',src);
	});


	// Sitestat "PDF"-meting hook
	var exts = ['pdf','mp3','mp4','wmv','srt','jpg'];
	for (var ext in exts) {
		$('a[href$=\\.'+exts[ext]+']').click(function(e){
			e.preventDefault();
			var doc = $(this).attr('href').replace(/^.*[\\\/]/,'');
			ns_onclick(this,'','download.'+doc,'pdf');
		});
	}


});


(function($){
	$.fn.inputPlaceholder = function() {
		return this.each(function(){
			var input = $('#'+$(this).attr('for'));
			var text = $(this).text();
			var val = input.val();
			if (val == '' || val == text) input.val(text).addClass('init');
			input.focus(function(){
				if ($(this).val() == text) $(this).val('').removeClass('init');
			}).blur(function(){
				if ($(this).val() == '') $(this).val(text).addClass('init');
			});
		});
	};

})(jQuery);

// Sitestat ns_onclick for "PDF"-meting...
ns_pixelUrl = "http://nl.sitestat.com/minaz/koninklijkhuis/s?";
function ns_onclick(i,b,c,h,j){var e="";if(typeof ns_pixelUrl=="string"){e=ns_pixelUrl.substring(0,ns_pixelUrl.indexOf("?")+1)}e+=c;e+=" &ns_type="+h+"&ns_action=view";e+="&ns__t="+(new Date()).getTime();if(!b){b=i.href}var d=document.referrer;if(d.lastIndexOf("/")==d.length- 1){d=d.substring(d.lastIndexOf("/"),0)}if(d.length>0){e+="&amp;ns_referrer="+escape(d) }j=j||"";var f=(i&&i.target&&i.target!="")?(i.target.substring(0,1)=="_")?i.target.substring(1):i.target:"self";var g=new Image();if(f&&b){if(window[f]){window.ns_softclick_timer=function(k,a){return function(){if(window.ns_softclick_timeout){window.clearTimeout(window.ns_softclick_timeout)}g.onload=g.onerror=function(){};window[((window[k])?k:"self")].location.href=a}}(f,b);ns_softclick_timeout=window.setTimeout("ns_softclick_timer()",5000);g.onload=g.onerror=window.ns_softclick_timer}else{window.open(b,f,j)}}g.src=e;return false}