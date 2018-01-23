/*
    Pop Confirm
    author: zhao xin
    date: 2017.4
*/


! function($) {
    'use strict';

    $.fn.popConfirm = function(opt) {
        var lang = Z.locales[Z.locale];
        var $trigger = $(this);

        // if the pop is open, close it.
        var oldPopId = $trigger.data('pop-id');
        if (oldPopId) {
            $('#' + oldPopId).remove();
            $trigger.data('pop-id', '');
            return;
        }

        var defaults = {
            position: 'bottom',
            content: '',
            onOK: $.noop
        };
        var config = $.extend({}, defaults, opt);

        // root element of the pop confirm.
        var $pop = $('<div class="z-pop z-pop-confirm"></div>');

        // unique id of the pop.
        // save it on the trigger so that it can be closed when clicking the trigger.
        var popId = 'z-pop' + Math.random().toString().slice(2);
        $pop.attr('id', popId);
        $trigger.data('pop-id', popId);

        // Generate html.
        var _innerHtml = '<div><i class="fa fa-info-circle z-pop-icon"></i><span class="z-pop-text">' 
            + config.content + '</span></div>' 
            + '<div class="z-pop-actions"><span class="z-pop-cancel">' + lang['Cancel'] + '</span>' 
            + '<span class="z-pop-ok">' + lang['OK'] + '</span></div>';
        var $arrow = $('<div class="z-pop-arrow"></div>');
        $pop.html(_innerHtml);
        $arrow.appendTo($pop);
        $pop.appendTo('body');

        var close = function() {
            $pop.remove();
            $trigger.data('pop-id', null);
        };
        $pop.on('click', '.z-pop-cancel', function(event) {
            close();
        });
        $pop.on('click', '.z-pop-ok', function(event) {
            close();
            config.onOK();
        });
        
        var triggerTop = $trigger.offset().top;
        var triggerLeft = $trigger.offset().left;
        var triggerWidth = $trigger.outerWidth();
        var triggerHeight = $trigger.outerHeight();
        var popWidth = $pop.outerWidth();
        var popHeight = $pop.outerHeight();
        var top, left;

        switch (config.position) {
            case 'top':
                top = triggerTop - popHeight - 12;
                left = triggerLeft - popWidth / 2 + triggerWidth / 2;
                break;
            case 'bottom':
                top = triggerTop + triggerHeight + 12;
                left = triggerLeft - popWidth / 2 + triggerWidth / 2;
                break;
            case 'left':
                top = triggerTop - popHeight / 2 + triggerHeight / 2;
                left = triggerLeft - popWidth - 12;
                break;
            case 'right':
                top = triggerTop - popHeight / 2 + triggerHeight / 2;
                left = triggerLeft + triggerWidth + 12;
                break;
            default:
        }
        $pop.addClass(config.position);
        $pop.css({
            'top': top,
            'left': left
        });
    }
}(jQuery);