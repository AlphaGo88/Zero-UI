/*
    Select
*/

! function($) {
    'use strict';

    function Select(element, opt) {
        this.defaults = {
            position: '', // ['top']
            multiple: false, // support multiple selection
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
        var me = this,
            $select = this.$select,
            multiple = this.config.multiple;

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

        this.$select = $select;
        this.$newSelect = $newSelect;

        // Generate options
        var optionsClasses = 'z-dropdown-menu z-select-options ' + this.config.position,
            options = $('<div class="' + optionsClasses + '"></div>'),
            data = this.config.data,
            optionList;

        if (data) {
            optionList = this._genOptionsFromData(data);
        } else {
            optionList = this._genOptionsFromHtml($select);
        }
        options.html(optionList);
        this.$options = options;

        // Wrap Elements
        var wrapper = $('<div class="z-select-wrapper" tabindex="0"></div>');
        wrapper.css('width', $select.outerWidth() + 'px');
        wrapper.addClass($select.attr('class')).removeClass('z-input').removeClass('z-select');

        // Arrow
        var dropdownIcon = $('<span class="z-select-caret"></span>');

        $select.wrap(wrapper);
        $select.before($newSelect);
        $select.hide(); // hide original element
        $newSelect.after(options);
        $newSelect.after(dropdownIcon);

        var $wrapper = $newSelect.closest('.z-select-wrapper');
        this.$wrapper = $wrapper;
        this._updateValue(true);

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

        options.on('click', '.z-select-option', function() {
            var $this = $(this);

            if ($this.hasClass('disabled')) return;
            if (multiple) {
                if ($this.hasClass('selected')) {
                    var idx = me.valueSelected.indexOf($this.data('value'));

                    $this.removeClass('selected');
                    me.valueSelected.splice(idx, 1);
                    me.textSelected.splice(idx, 1);
                } else {
                    $this.addClass('selected');
                    me.valueSelected.push($this.data('value'));
                    me.textSelected.push($this.text());
                }
                me._updateValue();
            } else {
                if (!$this.hasClass('selected')) {
                    options.find('.selected').removeClass('selected');
                }
                me.valueSelected = [$this.data('value')];
                me.textSelected = [$this.text()];
                me._updateValue();
                $newSelect.trigger('close');
                $this.addClass('selected');
            }
        });

        var optionsList = options.children('.z-select-option');
        var len = optionsList.length;
        var className = multiple ? 'hover' : 'selected';

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
                        options.children('.' + className).trigger('click');
                    } else {
                        $newSelect.trigger('open');
                    }
                    break;

                    // Direction keys
                    // Up - select previous menu
                case 38:
                    event.preventDefault();

                    var i = 0;
                    while (i < len) {
                        if (optionsList.eq(i).hasClass(className)) break;
                        i++;
                    }
                    if (i === len) {
                        i = len - 1;
                    } else {
                        optionsList.eq(i).removeClass(className);
                        i = i === 0 ? len - 1 : i - 1;
                    }
                    optionsList.eq(i).addClass(className);
                    break;

                    // Down - select next menu
                case 40:
                    event.preventDefault();

                    var i = 0;
                    while (i < len) {
                        if (optionsList.eq(i).hasClass(className)) break;
                        i++;
                    }
                    if (i === len) {
                        i = 0;
                    } else {
                        optionsList.eq(i).removeClass(className);
                        i = i === len - 1 ? 0 : i + 1;
                    }
                    optionsList.eq(i).addClass(className);
                    break;

                default:
            }
        });
    }

    Select.prototype._genOptionsFromData = function(data) {
        var me = this,
            optionList = '',
            multiple = this.config.multiple,
            valueSelected = [],
            textSelected = [];

        var appendOptions = function(data, type) {
            data.forEach(function(item, idx, data) {
                var disabledClass = item.disabled ? 'disabled ' : '';
                var selectedClass = '';
                var optgroupClass = (type === 'group-option') ? 'group-option ' : '';

                if (item.selected || item.value === me.config.initialValue) {
                    selectedClass = 'selected ';
                    if (multiple) {
                        valueSelected.push(item.value);
                        textSelected.push(item.text);
                    } else {
                        valueSelected = [item.value];
                        textSelected = [item.text];
                    }
                }

                optionList += '<div class="z-select-option ' + disabledClass + selectedClass + optgroupClass + '" data-value=' + item.value + '>' + item.text + '</div>'
            })
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
            // Add disabled attr if disabled
            var disabledClass = (option.is(':disabled')) ? 'disabled ' : '';
            var selectedClass = '';
            var optgroupClass = (type === 'group-option') ? 'group-option ' : '';

            if (option.is(':selected')) {
                var value = option.attr('value'),
                    text = option.text();

                selectedClass = 'selected ';
                if (multiple) {
                    valueSelected.push(value);
                    textSelected.push(text);
                } else {
                    valueSelected = [value];
                    textSelected = [text];
                }
            }

            optionList += '<div class="z-select-option ' + disabledClass + selectedClass + optgroupClass + '" data-value=' + option.attr('value') + '>' + option.html() + '</div>';
        }

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

    Select.prototype._updateValue = function(firstInit) {
        var text = this.textSelected.join(',');

        this.$newSelect.html(text);
        this.$select.val(this.valueSelected.join(','));
        if (!firstInit) {
            this.$select.trigger('change');
        }

        if (this.config.multiple) {
            this.$newSelect.attr('title', text);
            if (!firstInit) {
                this.config.onChange(this.valueSelected, this.textSelected);
            }
        } else {
            if (!firstInit) {
                this.config.onChange(this.valueSelected[0], this.textSelected[0]);
            }
        }
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