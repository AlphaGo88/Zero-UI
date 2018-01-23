/*
    Message
    author: zhao xin
    date: 2016.9
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
        var $el = $('<div class="z-msg ' + defaults.type + '">' + '<i class="fa fa-close z-msg-close"></i>' + defaults.content + '</div>');

        $container.append($el);

        var exitTimeOut = null;

        // auto close
        if (defaults.autoClose) {
            exitTimeOut = setTimeout(function() {
                $el.addClass('exit');
            }, defaults.duration);
        }

        // Manually close
        $el.find('.z-msg-close').on('click', function() {
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
        },

        loading: function(msg) {
            var msg = msg || '加载中';
            var _html = '<div class="z-loading-wrapper"><div class="z-loading-msg">' + '<i class="fa fa-circle-o-notch fa-spin z-loading-icon"></i><span class="z-loading-text">' + msg + '</span></div></div>';

            $('body').append($(_html));
        },

        unLoading: function(container) {
            $('.z-loading-wrapper').remove();
        }
    }

}(jQuery);