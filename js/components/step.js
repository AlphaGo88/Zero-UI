/*
    Step
    author: zhao xin
    date: 2017.5
*/


! function($) {
	'use strict';

	// Go to a specific step.
	$.fn.step = function(toStep) {
		var $this = $(this);

		if (!$this.hasClass('z-steps')) {
			return;
		}

		var $current = $(this).find('.current');

		if (toStep === 'next') {
			$current.removeClass('current').addClass('done');
			$current.next().addClass('current');
		} else if (toStep === 'pre') {
			$current.removeClass('current');
			$current.prev().removeClass('done').addClass('current');
		} else {
			var stepNum;
			var $steps = $this.find('.z-step');

			if (toStep === 'first') {
				stepNum = 0;
			} else if (toStep === 'last') {
				stepNum = $steps.length - 1;
			} else {
				stepNum = parseInt(toStep);
			}
			$steps.each(function(index, el) {
				var $el = $(el);
				if (index < stepNum) {
					$el.removeClass('current').addClass('done');
				} else if (index === stepNum) {
					$el.removeClass('done').addClass('current');
				} else {
					$el.removeClass('done').removeClass('current');
				}
			});
		}
	}
}(jQuery);