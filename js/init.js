/*
	Initialize components	
*/


(function($) {
	'use strict';

	$(function() {
		$('.z-dropdown-trigger').dropdown();
		// $('[data-tooltip]').tooltip();
		Z.initSideNav();
		Z.initTabs();
		Z.initTooltip();
		Z.initUploader();
	});
})(jQuery);