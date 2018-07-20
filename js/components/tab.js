/*
    Dropdown
*/

! function($) {
    'use strict';

    Z.initTabs = function() {
        $(document).on('click', '.z-tab', function() {
            var $tab = $(this);

            if ($tab.hasClass('disabled') || $tab.hasClass('active')) {
                return;
            }

            $tab.addClass('active').siblings('.active').removeClass('active');

            var $content = $($tab.data('content'));
            $content.addClass('active').siblings('.active').removeClass('active');
        });

        $(document).on('keydown', '.z-tab', function(event) {
            if (event.which === 13 || event.which === 32) {
                event.preventDefault();
                $(this).click();
            }
        })
    }

    // $.fn.tab = function() {
    //     this.each(function(index, el) {
    //         var $el = $(el);

    //         if ($el.data('tab-init')) {
    //             return;
    //         }

    //         var $con = $el.siblings('.z-tab-content');
    //         var $activeLink = $el.children('.active');

    //         if ($activeLink.length && $con.length) {
    //             $($activeLink.attr('href')).addClass('active');
    //         }

    //         $el.on('click', '.z-tab', function() {
    //             var $tab = $(this);

    //             if ($tab.hasClass('disabled')) {
    //                 return false;
    //             }

    //             var href = $tab.attr('href');

    //             if (!$tab.hasClass('active')) {
    //                 $el.children('.active').removeClass('active');
    //                 $tab.addClass('active');
    //                 if (href && href[0] === '#') {
    //                     $con.children('.active').removeClass('active');
    //                     $($tab.attr('href')).addClass('active');
    //                 }
    //             }
    //             if (href && href[0] === '#') {
    //                 return false;
    //             }
    //         });

    //         $el.data('tab-init', true);
    //     });
    // }

}(jQuery);