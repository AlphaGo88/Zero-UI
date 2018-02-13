/*
    Select
*/

! function($) {
    'use strict';

    function Select(element, opt) {
        this.defaults = {
            position: '', // ['top']
            multiple: false, // support multiple selection
            search: false,
            data: null,
            initialValue: '',
            onChange: $.noop
        };

        this.$select = element; // original element
        this.config = $.extend(true, {}, this.defaults, opt);
        this.valueSelected = [];
        this.textSelected = [];
        this.init();
    }

    Select.prototype.init = function() {
        var me = this;
        var $select = me.$select;
        var multiple = me.config.multiple;

        // Tear down structure if Select needs to be rebuilt
        if ($select.siblings('.z-select-trigger').length > 0) {
            $select.siblings('.z-select-trigger').remove();
            $select.siblings('.z-select-caret').remove();
            $select.siblings('.z-select-options').remove();
            $select.unwrap();
        }

        // Create new element as select trigger
        var disableClass = $select.is(':disabled') ? ' disabled' : '';
        var $newSelect = $('<div class="z-select-trigger' + disableClass + '"></div>');

        me.$select = $select;
        me.$newSelect = $newSelect;

        // Generate options
        var optionsClasses = 'z-dropdown-menu z-select-options ' + me.config.position;
        var options = $('<div class="' + optionsClasses + '"></div>');
        var data = me.config.data;
        var optionListHtml;

        if (data) {
            optionListHtml = me._genOptionsFromData(data);
        } else {
            optionListHtml = me._genOptionsFromHtml($select);
        }
        options.html(optionListHtml);
        me.$options = options;
        me.$optionList = options.children('.z-select-option');

        // Wrap Elements
        var wrapperClasses = 'z-select-wrapper' + (multiple ? ' multiple' : '');
        var wrapper = $('<div class="' + wrapperClasses + '" tabindex="0"></div>');
        wrapper.css('width', $select.outerWidth() + 'px');
        wrapper.addClass($select.attr('class')).removeClass('z-input').removeClass('z-select');

        // Arrow
        var dropdownIcon = $('<span class="z-select-caret"></span>');

        $select.wrap(wrapper);
        $select.before($newSelect);
        $select.hide(); // hide the original <select> or <input>
        $newSelect.after(options);
        $newSelect.after(dropdownIcon);

        var $wrapper = me.$wrapper = $newSelect.parent();

        // initial html of the select trigger
        if (multiple) {
            var _html = '';

            me.textSelected.forEach(function(text, i) {
                var _value = me.valueSelected[i];

                _html += '<span class="z-selected-item" data-value="' + _value + '">' + text + '</span>';
            });
            me.$newSelect.html(_html);
        } else {
            me.$newSelect.html(me.textSelected[0]);
        }
        // initial value of the original element
        me.$select.val(me.valueSelected.join(','));

        $newSelect.on({
            'toggle': function() {
                $(this).toggleClass('open');
                options.toggleClass('open');
            },
            'open': function() {
                options.addClass('open');
                $(this).addClass('open');
            },
            'close': function() {
                options.removeClass('open');
                $(this).removeClass('open');
                me.$options.children('.hover').removeClass('hover');
            },
            'click': function() {
                if (!$(this).hasClass('disabled')) {
                    $(this).trigger('toggle');
                }
            }
        });

        dropdownIcon.on('click', function() {
            $newSelect.trigger('click');
        });

        // click elsewhere to close
        var mouseIn = false;
        $wrapper.on({
            'mouseenter': function() {
                mouseIn = true;
            },
            'mouseleave': function() {
                mouseIn = false;
            }
        });
        options.on('click', function(event) {
            event.stopPropagation();
        });
        $(document).on('click', function() {
            if (!mouseIn) {
                $newSelect.trigger('close');
            }
        });

        // Click to select the item
        options.on('click', '.z-select-option', function() {
            var $this = $(this);
            var value = $this.data('value');
            var text = $this.html();

            if ($this.hasClass('disabled')) return;
            if (multiple) {
                if ($this.hasClass('selected')) {
                    $this.removeClass('selected');
                    me.$newSelect.children('[data-value=' + value + ']').remove();
                    me._updateValue(value, text, true);
                } else {
                    var itemHtml = '<span class="z-selected-item" data-value="' + value + '">' + text + '</span>';

                    $(itemHtml).appendTo(me.$newSelect);
                    $this.addClass('selected');
                    me._updateValue(value, text);
                }
            } else {
                if (!$this.hasClass('selected')) {
                    options.find('.selected').removeClass('selected');
                    $this.addClass('selected');
                }
                me.$newSelect.html(text);
                $newSelect.trigger('close');
                me._updateValue(value, text);
            }
        });

        // deselect the item
        if (multiple) {
            $newSelect.on('click', '.z-selected-item', function(event) {
                event.stopPropagation();

                var $this = $(this);
                var value = $this.data('value');
                var text = $this.text();

                $this.remove();
                me.$options.find('[data-value=' + value + ']').removeClass('selected');
                me._updateValue(value, text, true);
            });
        }

        var len = this.$optionList.length;

        $wrapper.on('keydown', function(event) {
            switch (event.which) {
                // TAB - close
                // ESC - close
                case 9:
                case 27:
                    $newSelect.trigger('close');
                    break;

                    // ENTER - select current option and close
                case 13:
                    if (options.hasClass('open')) {
                        options.children('.hover').trigger('click');
                    } else {
                        $newSelect.trigger('open');
                    }
                    break;

                    // Direction keys
                    // Up - select previous menu
                case 38:
                    event.preventDefault();

                    var i = me.getInitialIndex();

                    if (i === -1) {
                        i = len;
                    } else {
                        me.$optionList.eq(i).removeClass('hover');
                    }

                    var j = me.findPrev(i);
                    me.$optionList.eq(j).addClass('hover');

                    break;

                    // Down - select next menu
                case 40:
                    event.preventDefault();

                    var i = me.getInitialIndex();

                    if (i != -1) {
                        me.$optionList.eq(i).removeClass('hover');
                    }

                    var j = me.findNext(i);
                    me.$optionList.eq(j).addClass('hover');

                    break;

                default:
            }
        });
    };

    Select.prototype._genOptionsFromData = function(data) {
        var me = this,
            optionList = '',
            multiple = this.config.multiple,
            valueSelected = [],
            textSelected = [];

        var appendOptions = function(data, type) {
            data.forEach(function(item, idx, data) {
                var disabledClass = item.disabled ? ' disabled' : '';
                var selectedClass = '';
                var optgroupClass = (type === 'group-option') ? ' group-option' : '';

                if (item.selected || item.value === me.config.initialValue) {
                    selectedClass = ' selected';
                    if (multiple) {
                        valueSelected.push(item.value);
                        textSelected.push(item.text);
                    } else {
                        valueSelected = [item.value];
                        textSelected = [item.text];
                    }
                }

                optionList += '<div class="z-select-option' + disabledClass + selectedClass + optgroupClass + '" data-value=' + item.value + '>' + item.text + '</div>';
            });
        }

        if (Array.isArray(data)) {
            appendOptions(data);
        } else {
            for (var i in data) {
                optionList += '<div class="z-select-group-label">' + i + '</div>';
                appendOptions(data[i], 'group-option');
            }
        }

        this.valueSelected = valueSelected;
        this.textSelected = textSelected;

        return optionList;
    };

    Select.prototype._genOptionsFromHtml = function($select) {
        var optionList = '',
            multiple = this.config.multiple;

        var selectChildren = $select.children('option, optgroup'),
            valueSelected = [],
            textSelected = [];

        var appendOption = function(option, type) {
            var disabledClass = (option.is(':disabled')) ? ' disabled' : '';
            var selectedClass = '';
            var optgroupClass = (type === 'group-option') ? ' group-option' : '';

            if (option.is(':selected')) {
                var value = option.attr('value');
                var text = option.text();

                selectedClass = ' selected';
                if (multiple) {
                    valueSelected.push(value);
                    textSelected.push(text);
                } else {
                    valueSelected = [value];
                    textSelected = [text];
                }
            }

            optionList += '<div class="z-select-option' + disabledClass + selectedClass + optgroupClass + '" data-value=' + option.attr('value') + '>' + option.html() + '</div>';
        };

        /* Create dropdown structure. */
        selectChildren.each(function() {
            var $this = $(this);

            if ($this.is('option')) {
                appendOption($this, 'option');
            } else if ($this.is('optgroup')) {
                // Optgroup.
                var selectOptions = $this.children('option');
                optionList += '<div class="z-select-group-label">' + $this.attr('label') + '</div>';

                selectOptions.each(function() {
                    appendOption($(this), 'group-option');
                });
            }
        });

        this.valueSelected = valueSelected;
        this.textSelected = textSelected;

        return optionList;
    };

    Select.prototype._updateValue = function(value, text, remove) {
        var me = this;
        var multiple = me.config.multiple;

        if (multiple) {
            if (remove) {
                me.valueSelected.splice(me.valueSelected.indexOf(value), 1);
                me.textSelected.splice(me.textSelected.indexOf(text), 1);
            } else {
                me.valueSelected.push(value);
                me.textSelected.push(text);
            }
        } else {
            me.valueSelected = [value];
            me.textSelected = [text];
        }

        me.$select.val(me.valueSelected.join(','));
        me.$select.trigger('change');
        if (multiple) {
            me.config.onChange(me.valueSelected, me.textSelected);
        } else {
            me.config.onChange(me.valueSelected[0], me.textSelected[0]);
        }
    };

    Select.prototype.getInitialIndex = function() {
        var i = this.$options.children('.hover').index();

        if (i === -1) {
            if (this.config.multiple) {
                i = -1;
            } else {
                i = this.$options.children('.selected').index();
            }
        }

        return i;
    };

    Select.prototype.findPrev = function(i) {
        var len = this.$optionList.length;
        var j;

        if (i === 0) {
            j = len - 1;
        } else {
            j = i - 1;
        }

        var $cur = this.$optionList.eq(j);
        if ($cur.hasClass('disabled')) {
            return this.findPrev(j);
        }
        return j;
    };

    Select.prototype.findNext = function(i) {
        var len = this.$optionList.length;
        var j;

        if (i >= len - 1) {
            j = 0;
        } else {
            j = i + 1;
        }

        var $cur = this.$optionList.eq(j);
        if ($cur.hasClass('disabled')) {
            return this.findNext(j);
        }
        return j;
    };

    // set data of select options
    Select.prototype.setData = function(data) {
        var optionList = this._genOptionsFromData(data);
        this.$options.html(optionList);
        this._updateValue();
    };

    Select.prototype.setValue = function(value) {
        if (this.config.multiple) {
            this.valueSelected = [];
            this.textSelected = [];
            this.$options.find('.z-select-option').each(function(index, el) {
                var $el = $(el);
                var optionValue = $el.data('value');
                var optionText = $el.text();

                if (value.indexOf(optionValue) > -1) {
                    this.valueSelected.push(optionValue);
                    this.textSelected.push(optionText);
                    $el.addClass('selected');
                } else {
                    $el.removeClass('selected');
                }
            });
            this._updateValue();
        } else {
            if (this.valueSelected[0] === value) {
                return;
            }

            var $newOption = this.$options.find('[data-value=' + value + ']');

            this.$options.find('.selected').removeClass('selected');
            $newOption.addClass('selected');
            this.valueSelected = [value];
            this.textSelected = [$newOption.text()];
            this._updateValue();
        }
    };

    Select.prototype.disable = function() {
        this.$newSelect.addClass('disabled');
        this.$select.attr('disabled', true);
    };

    Select.prototype.enable = function() {
        this.$newSelect.removeClass('disabled');
        this.$select.removeAttr('disabled');
    };

    $.fn.select = function(opt) {
        var args = Array.apply(null, arguments);
        args.shift();

        this.each(function(index, el) {
            var $el = $(el),
                data = $el.data('select');

            if (!opt || typeof opt === 'object') {
                data = new Select($el, opt);
                $el.data('select', data);
            }
            if (typeof opt === 'string' && typeof data[opt] === 'function') {
                data[opt].apply(data, args);
            }
        });
    }

}(jQuery);