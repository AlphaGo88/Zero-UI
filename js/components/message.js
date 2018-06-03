/*
    Message
*/


! function($) {
    'use strict';

    var containerCreated = false;

    function getContainer() {
        var container;

        if (!containerCreated) {
            // create container for message popups
            container = $('<div id="z-msg-container"></div>').appendTo('body');
            container.on('transitionend', '.z-msg', function() {
                $(this).remove();
            });
            containerCreated = true;
        } else {
            container = $('#z-msg-container');
        }

        return container;
    }

    function _msg(opt) {
        var defaults = {
            type: 'msg',
            autoClose: true,
            duration: 3600,
            content: '',
        };

        $.extend(defaults, opt);

        var $container = getContainer();
        var $el = $('<div class="z-msg ' + defaults.type + '">' + defaults.content + '</div>');

        $container.append($el);

        var exitTimeOut = null;

        // auto close
        if (defaults.autoClose) {
            exitTimeOut = setTimeout(function() {
                $el.addClass('exit');
            }, defaults.duration);
        }

        // Manually close
        $el.on('click', function() {
            $el.addClass('exit');
            clearTimeout(exitTimeOut);
        });
    }

    Z.Message = {
        show: function(opt) {
            _msg(opt);
        },

        msg: function(content) {
            _msg({
                type: 'msg',
                content: content
            });
        },

        dark: function(content) {
            _msg({
                type: 'dark',
                content: content
            });
        },

        success: function(content) {
            _msg({
                type: 'success',
                content: content
            });
        },

        warning: function(content) {
            _msg({
                type: 'warning',
                content: content
            });
        },

        error: function(content) {
            _msg({
                type: 'error',
                content: content
            });
        }
    }

}(jQuery);