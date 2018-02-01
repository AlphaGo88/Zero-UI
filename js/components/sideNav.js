/*
    Side Navigation
*/


! function($) {
	'use strict';

	Z.initSideNav = function() {
		$(document).on('click', '.z-nav-item', function() {
			var $this = $(this);

			if ($this.hasClass('active')) {
				return;
			}
			$(this).closest('.z-side-nav').find('.active').removeClass('active');
			$this.addClass('active');
		});

		$(document).on('click', '.z-nav-head', function() {
			var $this = $(this);

			$this.toggleClass('active');
		});
	}
}(jQuery);