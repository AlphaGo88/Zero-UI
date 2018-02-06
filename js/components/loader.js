/*
    Loader
*/


! function($) {
    'use strict';

    $.fn.load = function(opt) {
    	var $this = $(this);

    	if ($this.find('.z-loading-mask').length) {
    		console.warn('Do not load repeatedly on the same div!');
    		return;
    	}

        var icon = opt && opt.icon || '<i class="fa fa-spinner fa-spin"></i>';
    	var msg = opt && opt.msg || '';
    	var darkClass = opt && opt.color === 'dark' ? ' dark' : '';
    	var _html = '<div class="z-loading-mask' + darkClass + '">'
    	+ '<div class="z-loading-content">'
    	+ icon
    	+ '<span class="z-loading-text">' + msg + '</span>'
    	+ '</div></div>';

    	if ($this.css('position') === 'static') {
    		$this.css('position', 'relative');
    	}
    	$(_html).appendTo($(this));
    }

	$.fn.unLoad = function() {
		$(this).find('.z-loading-mask').remove();
	}

    Z.load = function(opt) {
        var icon = opt && opt.icon || '<i class="fa fa-spinner fa-spin"></i>';
        var msg = opt && opt.msg || '';
        var _html = '<div class="z-g-loading-wrapper">'
        + '<div class="z-g-loading">'
        + icon
        + '<span class="z-loading-text">' + msg + '</span>'
        + '</div></div>';

        $(_html).appendTo($('body'));
    }

    Z.unLoad = function(opt) {
        $('.z-g-loading-wrapper').remove();
    }
}(jQuery);