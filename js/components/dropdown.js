/*
    Dropdown
    author: zhao xin
    date: 2016.9
*/


! function($) {
    'use strict';

    $.fn.dropdown = function(opt) {
        this.each(function(index, el) {
            var $trigger = $(el);
            var $dropdown = $trigger.closest('.z-dropdown');
            var $menu = $dropdown.find('.z-dropdown-menu');
            var initialized = $trigger.data('dropdown-init'); // if dropdown is already initialized.
            var triggerByHover = typeof opt === 'object' && opt.hover || false;

            if (!initialized) {
                $trigger.on('open', function(e) {
                    $menu.addClass('open');
                });
                $trigger.on('close', function(e) {
                    $menu.removeClass('open');
                });
                $trigger.on('toggle', function(e) {
                    $menu.toggleClass('open');
                });
                if (triggerByHover) {
                    $dropdown.hover(function() {
                        $trigger.trigger('open');
                    }, function() {
                        $trigger.trigger('close');
                    });
                } else {
                    $menu.on('click', function(e) {
                        e.stopPropagation();
                    });
                    $(document).on('click', function(e) {
                        $trigger.trigger('close');
                    });
                }
                $trigger.on('click', function(e) {
                    $trigger.trigger('toggle');
                    if (!triggerByHover) {
                        e.stopPropagation();
                    }
                });
                $trigger.on('keydown', function(e) {
                    switch (e.which) {
                        // TAB - close
                        // ESC - close
                        case 9:
                        case 27:
                            $trigger.trigger('close');
                            break;
                        default:
                    }
                });
                $menu.on('click', '.z-menu-item', function(e) {
                    var $this = $(this);

                    if (!$this.hasClass('disabled')) {
                        $trigger.trigger('close');

                        if ($trigger.hasClass('selectable')) {
                            $trigger.text($this.text());
                        }
                    }
                });
                $trigger.data('dropdown-init', true);
            }

            if (opt === 'open') {
                $trigger.trigger('open');
            } else if (opt === 'close') {
                $trigger.trigger('close');
            }
        });
    }

}(jQuery);