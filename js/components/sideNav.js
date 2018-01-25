/*
    Side Navigation
*/


! function($) {
    'use strict';

    // Init sub menu toggling
    Z.initSideNav = function() {
        $(document).on('click', '.z-nav-head', function() {
            var $this = $(this);

            $this.toggleClass('active');
            $this.siblings('.z-sub-nav').toggleClass('open');
        });
    }
}(jQuery);