/*
    Dropdown
*/


! function($) {
    'use strict';

    function Dropdown(element) {
        var me = this;
        var $dropdownTrigger = me.$dropdownTrigger = element;
        var $dropdown = me.$dropdown = element.parent();
        var $menu = me.$menu = $dropdown.children('.z-dropdown-menu');

        $dropdownTrigger.on('click', me.toggle.bind(me));

        // click elsewhere to close
        var mouseIn = false;
        $dropdown.on({
            'mouseenter': function() {
                mouseIn = true;
            },
            'mouseleave': function() {
                mouseIn = false;
            }
        });
        $menu.on('click', function(event) {
            event.stopPropagation();
        });
        $(document).on('click', function() {
            if (!mouseIn) {
                me.close();
            }
        });

        // click on menu item to close
        $menu.on('click', '.z-menu-item', function() {
            if (!$(this).hasClass('disabled')) {
                me.close();
            }
        });

        $dropdownTrigger.on('keydown', function(event) {
            switch (event.which) {
                // Enter - If there's a selected menu, trigger its click event.
                case 13:
                    event.preventDefault();
                    if ($menu.hasClass('open')) {
                        $menu.find('.z-menu-item.selected').trigger('click');
                    } else {
                        me.open();
                    }
                    break;

                // TAB - close
                // ESC - close
                case 9:
                case 27:
                    me.close();
                    break;

                // Direction keys
                // Up - select previous menu
                case 38:
                    event.preventDefault();

                    var $menuItems = me.getCurMenuItems();
                    var len = $menuItems.length;
                    var i = 0;

                    while (i < len) {
                        if ($menuItems.eq(i).hasClass('selected')) break;
                        i++;
                    }
                    if (i === len) {
                        i = len - 1;
                    } else {
                        $menuItems.eq(i).removeClass('selected');
                        i = i === 0 ? len - 1 : i - 1;
                    }
                    $menuItems.eq(i).addClass('selected');
                    break;

                // Down - select next menu
                case 40:
                    event.preventDefault();

                    var $menuItems = me.getCurMenuItems();
                    var len = $menuItems.length;
                    var i = 0;

                    while (i < len) {
                        if ($menuItems.eq(i).hasClass('selected')) break;
                        i++;
                    }
                    if (i === len) {
                        i = 0;
                    } else {
                        $menuItems.eq(i).removeClass('selected');
                        i = i === len - 1 ? 0 : i + 1;
                    }
                    $menuItems.eq(i).addClass('selected');
                    break;

                // Right - toggle sub menu
                case 39:
                    event.preventDefault();

                    if ($menu.hasClass('top-left') || $menu.hasClass('bottom-left')) {
                        me.closeSubMenu();
                    } else {
                        me.openSubMenu();
                    }
                    break;

                // Left - toggle sub menu
                case 37:
                    event.preventDefault();

                    if ($menu.hasClass('top-left') || $menu.hasClass('bottom-left')) {
                        me.openSubMenu();
                    } else {
                        me.closeSubMenu();
                    }
                    break;

                default:
            }
        });

        $dropdownTrigger.data('dropdown-init', true);
    }

    Dropdown.prototype.open = function() {
        this.$menu.addClass('open');
    };

    Dropdown.prototype.close = function() {
        this.$menu.removeClass('open');
        this.$menu.find('.selected').removeClass('selected');
        this.$menu.find('.open').removeClass('open');
    };

    Dropdown.prototype.toggle = function() {
        if (this.$menu.hasClass('open')) {
            this.close();
        } else {
            this.open();
        }
    };

    Dropdown.prototype.getCurMenuItems = function() {
        var $selectedItem = this.$menu.find('.z-menu-item.selected');
        var $menuItems;

        if ($selectedItem.length) {
            $menuItems = $selectedItem.parent().children('.z-menu-item,.z-menu-head');
        } else {
            $menuItems = this.$menu.children('.z-menu-item,.z-menu-head');
        }
        return $menuItems;
    };

    Dropdown.prototype.openSubMenu = function() {
        var $menuHead = this.$menu.find('.z-menu-head.selected').last();

        if ($menuHead.length) {
            $menuHead.children('.z-sub-menu').addClass('open').children('.z-menu-item,.z-menu-head').eq(0).addClass('selected');
        }
    };

    Dropdown.prototype.closeSubMenu = function() {
        var $menuHead = this.$menu.find('.z-menu-head.selected').last();

        if ($menuHead.length) {
            $menuHead.children('.z-sub-menu').removeClass('open').find('.selected').removeClass('selected');
        }
    };

    $.fn.dropdown = function() {
        this.each(function(index, el) {
            if (!$(el).data('dropdown-init')) {
                new Dropdown($(el));
            }
        });
    };
    
}(jQuery);