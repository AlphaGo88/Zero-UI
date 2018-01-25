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

    	var content = opt && opt.content || '';
    	var darkClass = opt && opt.color === 'dark' ? ' dark' : '';
    	var _html = '<div class="z-loading-mask' + darkClass + '">'
    	+ '<div class="z-loading-content">'
    	+ '<i class="fa fa-spinner fa-spin z-loading-icon"></i><span class="z-loading-text">'
    	+ content + '</span>'
    	+ '</div></div>';

    	if ($this.css('position') === 'static') {
    		$this.css('position', 'relative');
    	}
    	$(_html).appendTo($(this));
    }

	$.fn.unLoad = function() {
		$(this).find('.z-loading-mask').remove();
	}
}(jQuery);