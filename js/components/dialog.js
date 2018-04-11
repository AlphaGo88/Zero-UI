/*
    Dialog
*/


! function($) {
    'use strict';
    
    var noop = $.noop;
    var blockerCreated = false;

    function getBlocker() {
        var blocker;

        if (!blockerCreated) {
            // create blocker for all dialogs pops.
            blocker = $('<div id="z-dlg-blocker"></div>').appendTo('body');
            blockerCreated = true;
        } else {
            blocker = $('#z-dlg-blocker');
        }

        return blocker;
    }

    function Dialog(opt) {
        var me = this;
        var lang = Z.locales[Z.locale];
        me.blocker = getBlocker();

        if (me.blocker.find('.dlg').length) {
            console.warn('Only one dialog can be opened at the same time!');
            return;
        }

        me.defaults = {
            title: '',
            width: '',
            content: '',
            okButton: true,
            cancelButton: true,
            actions: [],
            onOpen: noop,
            onClose: noop,
            onOK: noop
        };
        var config = $.extend(true, {}, me.defaults, opt);

        // support width: 100 and width: '100'
        if (config.width) {
            config.width = parseInt(config.width) + 'px';
        }

        // add ok & cancel button by default
        me.actions = [];
        if (config.actions.length > 0) {
            me.actions = config.actions;
        } else {
            if (config.cancelButton !== false) {
                me.actions.push({
                    tmplt: '<button class="z-btn default">' + lang['Cancel'] + '</button>',
                    onClick: me.close.bind(me)
                });
            }
            if (config.okButton !== false) {
                me.actions.push({
                    tmplt: '<button class="z-btn green">' + lang['OK'] + '</button>',
                    onClick: config.onOK
                });
            }
        }

        me.positionDialog = me.positionDialog.bind(me);
        me.config = config;
        me.generateHtml();
        me.open();
    }

    Dialog.prototype.generateHtml = function() {
        var me = this;
        var config = me.config;
        var container = $('<div class="z-dlg-container"></div>');
        var dlgHtml = '<div class="z-dlg" tabindex="0" style="width:' + config.width + '">';

        // title
        if (config.title) {
            dlgHtml += '<div class="z-dlg-title">' + config.title + '</div>';
        }

        // dialog content
        dlgHtml += '<div class="z-dlg-content">' + config.content + '</div>';

        // action buttons
        if (me.actions.length > 0) {
            dlgHtml += '<div class="z-dlg-foot">';
            me.actions.forEach(function(action) {
                dlgHtml += '<div class="z-dlg-action-wrapper">' + action.tmplt + '</div>';
            });
            dlgHtml += '</div>';
        }

        dlgHtml += '</div>';

        // mount dom node
        me.container = container;
        me.el = $(dlgHtml);
        container.append(me.el);
        me.blocker.append(container);

        // bind click events for the buttons
        if (me.actions.length > 0) {
            me.el.find('.z-dlg-action-wrapper').each(function(index, item) {
                $(item).on('click', function(event) {
                    me.actions[index].onClick(me);
                });
            });
        }

        me.el.on('keydown', function(e) {
            if (e.which === 27) {
                me.close();
            }
        });
        me.el.on('click', function(event) {
            event.stopPropagation();
        });
        me.blocker.on('click', function() {
            me.close();
        });
    };

    Dialog.prototype.positionDialog = function() {
        var space = this.blocker[0].offsetHeight - 24;
        var dialogHeight = this.el[0].offsetHeight;
        var top = (space - dialogHeight) / 2;

        if (top > 0) {
            this.el.css('margin-top', top);
        } else {
            this.el.css('margin-top', 0);
        }
    };

    Dialog.prototype.open = function() {
        var bodyWidth = $('body').outerWidth();

        $('body').addClass('z-body-dlg-open').css('width', bodyWidth);
        this.blocker.addClass('open');
        this.positionDialog();
        this.el.addClass('open').focus();
        $(window).on('resize', this.positionDialog);
        this.config.onOpen(this);
    };

    Dialog.prototype.close = function() {
        this.config.onClose(this);
        $('body').removeClass('z-body-dlg-open').removeAttr('style');
        this.blocker.removeClass('open');
        this.container.remove();
        $(window).off('resize', this.positionDialog);
        delete this;
    };

    Z.dialog = function(opt) {
        new Dialog(opt);
    };

}(jQuery);