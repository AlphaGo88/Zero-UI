/*
    Check jQuery
*/


if (!window.jQuery) {
	throw "Error: jQuery Not Found. Zui needs jQuery to run."
}

window.Z = {};

Z.version = '0.1.0';

Z.locales = {
	'en': {
		'OK': 'OK',
		'Cancel': 'Cancel',
		'Page': 'Page',
		'Goto': 'Goto'		
	},

	'zh-CN': {
		'OK': '确认',
		'Cancel': '取消',
		'Page': '页',
		'Goto': '跳至'
	}
};

Z.locale = 'en';

Z.guid = function() {
	return Math.random().toString().substring(2);
};
/* =========================================================
 * bootstrap-datetimepicker.js
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Improvements by Andrew Rowls
 * Improvements by Sébastien Malot
 * Improvements by Yun Lai
 * Improvements by Kenneth Henderick
 * Improvements by CuGBabyBeaR
 * Improvements by Christian Vaas <auspex@auspex.eu>
 *
 * Project URL : http://www.malot.fr/bootstrap-datetimepicker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function(factory){
    if (typeof define === 'function' && define.amd)
      define(['jquery'], factory);
    else if (typeof exports === 'object')
      factory(require('jquery'));
    else
      factory(jQuery);

}(function($, undefined){

  // Add ECMA262-5 Array methods if not supported natively (IE8)
  if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf = function (find, i) {
      if (i === undefined) i = 0;
      if (i < 0) i += this.length;
      if (i < 0) i = 0;
      for (var n = this.length; i < n; i++) {
        if (i in this && this[i] === find) {
          return i;
        }
      }
      return -1;
    }
  }

  // Add timezone abbreviation support for ie6+, Chrome, Firefox
  function timeZoneAbbreviation() {
    var abbreviation, date, formattedStr, i, len, matchedStrings, ref, str;
    date = (new Date()).toString();
    formattedStr = ((ref = date.split('(')[1]) != null ? ref.slice(0, -1) : 0) || date.split(' ');
    if (formattedStr instanceof Array) {
      matchedStrings = [];
      for (var i = 0, len = formattedStr.length; i < len; i++) {
        str = formattedStr[i];
        if ((abbreviation = (ref = str.match(/\b[A-Z]+\b/)) !== null) ? ref[0] : 0) {
          matchedStrings.push(abbreviation);
        }
      }
      formattedStr = matchedStrings.pop();
    }
    return formattedStr;
  }

  function UTCDate() {
    return new Date(Date.UTC.apply(Date, arguments));
  }

  // Picker object
  var Datetimepicker = function (element, options) {
    var that = this;

    this.element = $(element);

    // add container for single page application
    // when page switch the datetimepicker div will be removed also.
    this.container = options.container || 'body';

    this.language = options.language || this.element.data('date-language') || 'en';
    this.language = this.language in dates ? this.language : this.language.split('-')[0]; // fr-CA fallback to fr
    this.language = this.language in dates ? this.language : 'en';
    this.isRTL = dates[this.language].rtl || false;
    this.formatType = options.formatType || this.element.data('format-type') || 'standard';
    this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || dates[this.language].format || DPGlobal.getDefaultFormat(this.formatType, 'input'), this.formatType);
    this.isInline = false;
    this.isVisible = false;
    this.isInput = this.element.is('input');
    // this.fontAwesome = options.fontAwesome || this.element.data('font-awesome') || false;
    this.fontAwesome = true;
    this.bootcssVer = options.bootcssVer || (this.isInput ? (this.element.is('.form-control') ? 3 : 2) : ( this.bootcssVer = this.element.is('.input-group') ? 3 : 2 ));

    this.component = this.element.is('.date') ? ( this.bootcssVer === 3 ? this.element.find('.input-group-addon .glyphicon-th, .input-group-addon .glyphicon-time, .input-group-addon .glyphicon-remove, .input-group-addon .glyphicon-calendar, .input-group-addon .fa-calendar, .input-group-addon .fa-clock-o').parent() : this.element.find('.add-on .icon-th, .add-on .icon-time, .add-on .icon-calendar, .add-on .fa-calendar, .add-on .fa-clock-o').parent()) : false;
    this.componentReset = this.element.is('.date') ? ( this.bootcssVer === 3 ? this.element.find('.input-group-addon .glyphicon-remove, .input-group-addon .fa-times').parent():this.element.find('.add-on .icon-remove, .add-on .fa-times').parent()) : false;
    this.hasInput = this.component && this.element.find('input').length;
    if (this.component && this.component.length === 0) {
      this.component = false;
    }
    this.linkField = options.linkField || this.element.data('link-field') || false;
    this.linkFormat = DPGlobal.parseFormat(options.linkFormat || this.element.data('link-format') || DPGlobal.getDefaultFormat(this.formatType, 'link'), this.formatType);
    this.minuteStep = options.minuteStep || this.element.data('minute-step') || 5;
    this.pickerPosition = options.pickerPosition || this.element.data('picker-position') || 'bottom-right';
    this.showMeridian = options.showMeridian || this.element.data('show-meridian') || false;
    this.initialDate = options.initialDate || new Date();
    this.zIndex = options.zIndex || this.element.data('z-index') || undefined;
    this.title = typeof options.title === 'undefined' ? false : options.title;
    this.timezone = options.timezone || timeZoneAbbreviation();

    this.icons = {
      leftArrow: this.fontAwesome ? 'fa-angle-left' : (this.bootcssVer === 3 ? 'glyphicon-arrow-left' : 'icon-arrow-left'),
      rightArrow: this.fontAwesome ? 'fa-angle-right' : (this.bootcssVer === 3 ? 'glyphicon-arrow-right' : 'icon-arrow-right')
    }
    this.icontype = this.fontAwesome ? 'fa' : 'glyphicon';

    this._attachEvents();

    this.clickedOutside = function (e) {
        // Clicked outside the datetimepicker, hide it
        if ($(e.target).closest('.datetimepicker').length === 0) {
            that.hide();
        }
    }

    this.formatViewType = 'datetime';
    if ('formatViewType' in options) {
      this.formatViewType = options.formatViewType;
    } else if ('formatViewType' in this.element.data()) {
      this.formatViewType = this.element.data('formatViewType');
    }

    this.minView = 0;
    if ('minView' in options) {
      this.minView = options.minView;
    } else if ('minView' in this.element.data()) {
      this.minView = this.element.data('min-view');
    }
    this.minView = DPGlobal.convertViewMode(this.minView);

    this.maxView = DPGlobal.modes.length - 1;
    if ('maxView' in options) {
      this.maxView = options.maxView;
    } else if ('maxView' in this.element.data()) {
      this.maxView = this.element.data('max-view');
    }
    this.maxView = DPGlobal.convertViewMode(this.maxView);

    this.wheelViewModeNavigation = false;
    if ('wheelViewModeNavigation' in options) {
      this.wheelViewModeNavigation = options.wheelViewModeNavigation;
    } else if ('wheelViewModeNavigation' in this.element.data()) {
      this.wheelViewModeNavigation = this.element.data('view-mode-wheel-navigation');
    }

    this.wheelViewModeNavigationInverseDirection = false;

    if ('wheelViewModeNavigationInverseDirection' in options) {
      this.wheelViewModeNavigationInverseDirection = options.wheelViewModeNavigationInverseDirection;
    } else if ('wheelViewModeNavigationInverseDirection' in this.element.data()) {
      this.wheelViewModeNavigationInverseDirection = this.element.data('view-mode-wheel-navigation-inverse-dir');
    }

    this.wheelViewModeNavigationDelay = 100;
    if ('wheelViewModeNavigationDelay' in options) {
      this.wheelViewModeNavigationDelay = options.wheelViewModeNavigationDelay;
    } else if ('wheelViewModeNavigationDelay' in this.element.data()) {
      this.wheelViewModeNavigationDelay = this.element.data('view-mode-wheel-navigation-delay');
    }

    this.startViewMode = 2;
    if ('startView' in options) {
      this.startViewMode = options.startView;
    } else if ('startView' in this.element.data()) {
      this.startViewMode = this.element.data('start-view');
    }
    this.startViewMode = DPGlobal.convertViewMode(this.startViewMode);
    this.viewMode = this.startViewMode;

    this.viewSelect = this.minView;
    if ('viewSelect' in options) {
      this.viewSelect = options.viewSelect;
    } else if ('viewSelect' in this.element.data()) {
      this.viewSelect = this.element.data('view-select');
    }
    this.viewSelect = DPGlobal.convertViewMode(this.viewSelect);

    this.forceParse = true;
    if ('forceParse' in options) {
      this.forceParse = options.forceParse;
    } else if ('dateForceParse' in this.element.data()) {
      this.forceParse = this.element.data('date-force-parse');
    }
    var template = this.bootcssVer === 3 ? DPGlobal.templateV3 : DPGlobal.template;
    while (template.indexOf('{iconType}') !== -1) {
      template = template.replace('{iconType}', this.icontype);
    }
    while (template.indexOf('{leftArrow}') !== -1) {
      template = template.replace('{leftArrow}', this.icons.leftArrow);
    }
    while (template.indexOf('{rightArrow}') !== -1) {
      template = template.replace('{rightArrow}', this.icons.rightArrow);
    }
    this.picker = $(template)
      .appendTo(this.isInline ? this.element : this.container) // 'body')
      .on({
        click:     $.proxy(this.click, this),
        mousedown: $.proxy(this.mousedown, this)
      });

    if (this.wheelViewModeNavigation) {
      if ($.fn.mousewheel) {
        this.picker.on({mousewheel: $.proxy(this.mousewheel, this)});
      } else {
        console.log('Mouse Wheel event is not supported. Please include the jQuery Mouse Wheel plugin before enabling this option');
      }
    }

    if (this.isInline) {
      this.picker.addClass('datetimepicker-inline');
    } else {
      this.picker.addClass('datetimepicker-dropdown-' + this.pickerPosition + ' z-dropdown-menu');
    }
    if (this.isRTL) {
      this.picker.addClass('datetimepicker-rtl');
      var selector = this.bootcssVer === 3 ? '.prev span, .next span' : '.prev i, .next i';
      this.picker.find(selector).toggleClass(this.icons.leftArrow + ' ' + this.icons.rightArrow);
    }

    $(document).on('mousedown touchend', this.clickedOutside);

    this.autoclose = true;
    if ('autoclose' in options) {
      this.autoclose = options.autoclose;
    } else if ('dateAutoclose' in this.element.data()) {
      this.autoclose = this.element.data('date-autoclose');
    }

    this.keyboardNavigation = true;
    if ('keyboardNavigation' in options) {
      this.keyboardNavigation = options.keyboardNavigation;
    } else if ('dateKeyboardNavigation' in this.element.data()) {
      this.keyboardNavigation = this.element.data('date-keyboard-navigation');
    }

    this.todayBtn = (options.todayBtn || this.element.data('date-today-btn') || false);
    this.clearBtn = (options.clearBtn || this.element.data('date-clear-btn') || false);
    this.todayHighlight = (options.todayHighlight || this.element.data('date-today-highlight') || true);

    this.weekStart = 1;
    if (typeof options.weekStart !== 'undefined') {
      this.weekStart = options.weekStart;
    } else if (typeof this.element.data('date-weekstart') !== 'undefined') {
      this.weekStart = this.element.data('date-weekstart');
    } else if (typeof dates[this.language].weekStart !== 'undefined') {
      this.weekStart = dates[this.language].weekStart;
    }
    this.weekStart = this.weekStart % 7;
    this.weekEnd = ((this.weekStart + 6) % 7);
    this.onRenderDay = function (date) {
      var render = (options.onRenderDay || function () { return []; })(date);
      if (typeof render === 'string') {
        render = [render];
      }
      var res = ['day'];
      return res.concat((render ? render : []));
    };
    this.onRenderHour = function (date) {
      var render = (options.onRenderHour || function () { return []; })(date);
      var res = ['hour'];
      if (typeof render === 'string') {
        render = [render];
      }
      return res.concat((render ? render : []));
    };
    this.onRenderMinute = function (date) {
      var render = (options.onRenderMinute || function () { return []; })(date);
      var res = ['minute'];
      if (typeof render === 'string') {
        render = [render];
      }
      if (date < this.startDate || date > this.endDate) {
        res.push('disabled');
      } else if (Math.floor(this.date.getUTCMinutes() / this.minuteStep) === Math.floor(date.getUTCMinutes() / this.minuteStep)) {
        res.push('active');
      }
      return res.concat((render ? render : []));
    };
    this.onRenderYear = function (date) {
      var render = (options.onRenderYear || function () { return []; })(date);
      var res = ['year'];
      if (typeof render === 'string') {
        render = [render];
      }
      if (this.date.getUTCFullYear() === date.getUTCFullYear()) {
        res.push('active');
      }
      var currentYear = date.getUTCFullYear();
      var endYear = this.endDate.getUTCFullYear();
      if (date < this.startDate || currentYear > endYear) {
        res.push('disabled');
      }
      return res.concat((render ? render : []));
    }
    this.onRenderMonth = function (date) {
      var render = (options.onRenderMonth || function () { return []; })(date);
      var res = ['month'];
      if (typeof render === 'string') {
        render = [render];
      }
      return res.concat((render ? render : []));
    }
    this.startDate = new Date(-8639968443048000);
    this.endDate = new Date(8639968443048000);
    this.datesDisabled = [];
    this.daysOfWeekDisabled = [];
    this.setStartDate(options.startDate || this.element.data('date-startdate'));
    this.setEndDate(options.endDate || this.element.data('date-enddate'));
    this.setDatesDisabled(options.datesDisabled || this.element.data('date-dates-disabled'));
    this.setDaysOfWeekDisabled(options.daysOfWeekDisabled || this.element.data('date-days-of-week-disabled'));
    this.setMinutesDisabled(options.minutesDisabled || this.element.data('date-minute-disabled'));
    this.setHoursDisabled(options.hoursDisabled || this.element.data('date-hour-disabled'));
    this.fillDow();
    this.fillMonths();
    this.update();
    this.showMode();

    if (this.isInline) {
      this.show();
    }
  };

  Datetimepicker.prototype = {
    constructor: Datetimepicker,

    _events:       [],
    _attachEvents: function () {
      this._detachEvents();
      if (this.isInput) { // single input
        this._events = [
          [this.element, {
            focus:   $.proxy(this.show, this),
            keyup:   $.proxy(this.update, this),
            keydown: $.proxy(this.keydown, this)
          }]
        ];
      }
      else if (this.component && this.hasInput) { // component: input + button
        this._events = [
          // For components that are not readonly, allow keyboard nav
          [this.element.find('input'), {
            focus:   $.proxy(this.show, this),
            keyup:   $.proxy(this.update, this),
            keydown: $.proxy(this.keydown, this)
          }],
          [this.component, {
            click: $.proxy(this.show, this)
          }]
        ];
        if (this.componentReset) {
          this._events.push([
            this.componentReset,
            {click: $.proxy(this.reset, this)}
          ]);
        }
      }
      else if (this.element.is('div')) {  // inline datetimepicker
        this.isInline = true;
      }
      else {
        this._events = [
          [this.element, {
            click: $.proxy(this.show, this)
          }]
        ];
      }
      for (var i = 0, el, ev; i < this._events.length; i++) {
        el = this._events[i][0];
        ev = this._events[i][1];
        el.on(ev);
      }
    },

    _detachEvents: function () {
      for (var i = 0, el, ev; i < this._events.length; i++) {
        el = this._events[i][0];
        ev = this._events[i][1];
        el.off(ev);
      }
      this._events = [];
    },

    show: function (e) {
      // this.picker.show();
      this.picker.addClass('open');
      this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
      if (this.forceParse) {
        this.update();
      }
      this.place();
      $(window).on('resize', $.proxy(this.place, this));
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.isVisible = true;
      this.element.trigger({
        type: 'show',
        date: this.date
      });
    },

    hide: function () {
      if (!this.isVisible) return;
      if (this.isInline) return;
      // this.picker.hide();
      this.picker.removeClass('open');
      $(window).off('resize', this.place);
      this.viewMode = this.startViewMode;
      this.showMode();
      if (!this.isInput) {
        $(document).off('mousedown', this.hide);
      }

      if (
        this.forceParse &&
          (
            this.isInput && this.element.val() ||
              this.hasInput && this.element.find('input').val()
            )
        )
        this.setValue();
      this.isVisible = false;
      this.element.trigger({
        type: 'hide',
        date: this.date
      });
    },

    remove: function () {
      this._detachEvents();
      $(document).off('mousedown', this.clickedOutside);
      this.picker.remove();
      delete this.picker;
      delete this.element.data().datetimepicker;
    },

    getDate: function () {
      var d = this.getUTCDate();
      if (d === null) {
        return null;
      }
      return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
    },

    getUTCDate: function () {
      return this.date;
    },

    getInitialDate: function () {
      return this.initialDate
    },

    setInitialDate: function (initialDate) {
      this.initialDate = initialDate;
    },

    setDate: function (d) {
      this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
    },

    setUTCDate: function (d) {
      if (d >= this.startDate && d <= this.endDate) {
        this.date = d;
        this.setValue();
        this.viewDate = this.date;
        this.fill();
      } else {
        this.element.trigger({
          type:      'outOfRange',
          date:      d,
          startDate: this.startDate,
          endDate:   this.endDate
        });
      }
    },

    setFormat: function (format) {
      this.format = DPGlobal.parseFormat(format, this.formatType);
      var element;
      if (this.isInput) {
        element = this.element;
      } else if (this.component) {
        element = this.element.find('input');
      }
      if (element && element.val()) {
        this.setValue();
      }
    },

    setValue: function () {
      var formatted = this.getFormattedDate();
      if (!this.isInput) {
        if (this.component) {
          this.element.find('input').val(formatted);
        }
        this.element.data('date', formatted);
      } else {
        this.element.val(formatted);
      }
      if (this.linkField) {
        $('#' + this.linkField).val(this.getFormattedDate(this.linkFormat));
      }
    },

    getFormattedDate: function (format) {
      format = format || this.format;
      return DPGlobal.formatDate(this.date, format, this.language, this.formatType, this.timezone);
    },

    setStartDate: function (startDate) {
      this.startDate = startDate || this.startDate;
      if (this.startDate.valueOf() !== 8639968443048000) {
        this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language, this.formatType, this.timezone);
      }
      this.update();
      this.updateNavArrows();
    },

    setEndDate: function (endDate) {
      this.endDate = endDate || this.endDate;
      if (this.endDate.valueOf() !== 8639968443048000) {
        this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language, this.formatType, this.timezone);
      }
      this.update();
      this.updateNavArrows();
    },

    setDatesDisabled: function (datesDisabled) {
      this.datesDisabled = datesDisabled || [];
      if (!$.isArray(this.datesDisabled)) {
        this.datesDisabled = this.datesDisabled.split(/,\s*/);
      }
      var mThis = this;
      this.datesDisabled = $.map(this.datesDisabled, function (d) {
        return DPGlobal.parseDate(d, mThis.format, mThis.language, mThis.formatType, mThis.timezone).toDateString();
      });
      this.update();
      this.updateNavArrows();
    },

    setTitle: function (selector, value) {
      return this.picker.find(selector)
        .find('th:eq(1)')
        .text(this.title === false ? value : this.title);
    },

    setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
      this.daysOfWeekDisabled = daysOfWeekDisabled || [];
      if (!$.isArray(this.daysOfWeekDisabled)) {
        this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
      }
      this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, function (d) {
        return parseInt(d, 10);
      });
      this.update();
      this.updateNavArrows();
    },

    setMinutesDisabled: function (minutesDisabled) {
      this.minutesDisabled = minutesDisabled || [];
      if (!$.isArray(this.minutesDisabled)) {
        this.minutesDisabled = this.minutesDisabled.split(/,\s*/);
      }
      this.minutesDisabled = $.map(this.minutesDisabled, function (d) {
        return parseInt(d, 10);
      });
      this.update();
      this.updateNavArrows();
    },

    setHoursDisabled: function (hoursDisabled) {
      this.hoursDisabled = hoursDisabled || [];
      if (!$.isArray(this.hoursDisabled)) {
        this.hoursDisabled = this.hoursDisabled.split(/,\s*/);
      }
      this.hoursDisabled = $.map(this.hoursDisabled, function (d) {
        return parseInt(d, 10);
      });
      this.update();
      this.updateNavArrows();
    },

    place: function () {
      if (this.isInline) return;

      if (!this.zIndex) {
        var index_highest = 0;
        $('div').each(function () {
          var index_current = parseInt($(this).css('zIndex'), 10);
          if (index_current > index_highest) {
            index_highest = index_current;
          }
        });
        this.zIndex = index_highest + 10;
      }

      var offset, top, left, containerOffset;
      if (this.container instanceof $) {
        containerOffset = this.container.offset();
      } else {
        containerOffset = $(this.container).offset();
      }

      if (this.component) {
        offset = this.component.offset();
        left = offset.left;
        if (this.pickerPosition === 'bottom-left' || this.pickerPosition === 'top-left') {
          left += this.component.outerWidth() - this.picker.outerWidth();
        }
      } else {
        offset = this.element.offset();
        left = offset.left;
        if (this.pickerPosition === 'bottom-left' || this.pickerPosition === 'top-left') {
          left += this.element.outerWidth() - this.picker.outerWidth();
        }
      }

      var bodyWidth = document.body.clientWidth || window.innerWidth;
      if (left + 220 > bodyWidth) {
        left = bodyWidth - 220;
      }

      if (this.pickerPosition === 'top-left' || this.pickerPosition === 'top-right') {
        top = offset.top - this.picker.outerHeight();
      } else {
        top = offset.top + this.height;
      }

      top = top - containerOffset.top;
      left = left - containerOffset.left;

      this.picker.css({
        top:    top,
        left:   left,
        zIndex: this.zIndex
      });
    },

    hour_minute: "^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]",

    update: function () {
      var date, fromArgs = false;
      if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
        date = arguments[0];
        fromArgs = true;
      } else {
        date = (this.isInput ? this.element.val() : this.element.find('input').val()) || this.element.data('date') || this.initialDate;
        if (typeof date === 'string') {
          date = date.replace(/^\s+|\s+$/g,'');
        }
      }

      if (!date) {
        date = new Date();
        fromArgs = false;
      }

      if (typeof date === "string") {
        if (new RegExp(this.hour_minute).test(date) || new RegExp(this.hour_minute + ":[0-5][0-9]").test(date)) {
          date = this.getDate()
        }
      }

      this.date = DPGlobal.parseDate(date, this.format, this.language, this.formatType, this.timezone);

      if (fromArgs) this.setValue();

      if (this.date < this.startDate) {
        this.viewDate = new Date(this.startDate);
      } else if (this.date > this.endDate) {
        this.viewDate = new Date(this.endDate);
      } else {
        this.viewDate = new Date(this.date);
      }
      this.fill();
    },

    fillDow: function () {
      var dowCnt = this.weekStart,
        html = '<tr>';
      while (dowCnt < this.weekStart + 7) {
        html += '<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>';
      }
      html += '</tr>';
      this.picker.find('.datetimepicker-days thead').append(html);
    },

    fillMonths: function () {
      var html = '';
      var d = new Date(this.viewDate);
      for (var i = 0; i < 12; i++) {
        d.setUTCMonth(i);
        var classes = this.onRenderMonth(d);
        html += '<span class="' + classes.join(' ') + '">' + dates[this.language].monthsShort[i] + '</span>';
      }
      this.picker.find('.datetimepicker-months td').html(html);
    },

    fill: function () {
      if (!this.date || !this.viewDate) {
        return;
      }
      var d = new Date(this.viewDate),
        year = d.getUTCFullYear(),
        month = d.getUTCMonth(),
        dayMonth = d.getUTCDate(),
        hours = d.getUTCHours(),
        startYear = this.startDate.getUTCFullYear(),
        startMonth = this.startDate.getUTCMonth(),
        endYear = this.endDate.getUTCFullYear(),
        endMonth = this.endDate.getUTCMonth() + 1,
        currentDate = (new UTCDate(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())).valueOf(),
        today = new Date();
      this.setTitle('.datetimepicker-days', dates[this.language].months[month] + ' ' + year)
      if (this.formatViewType === 'time') {
        var formatted = this.getFormattedDate();
        this.setTitle('.datetimepicker-hours', formatted);
        this.setTitle('.datetimepicker-minutes', formatted);
      } else {
        this.setTitle('.datetimepicker-hours', dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
        this.setTitle('.datetimepicker-minutes', dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
      }
      this.picker.find('tfoot th.today')
        .text(dates[this.language].today || dates['en'].today)
        .toggle(this.todayBtn !== false);
      this.picker.find('tfoot th.clear')
        .text(dates[this.language].clear || dates['en'].clear)
        .toggle(this.clearBtn !== false);
      this.updateNavArrows();
      this.fillMonths();
      var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0),
        day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
      prevMonth.setUTCDate(day);
      prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
      var nextMonth = new Date(prevMonth);
      nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
      nextMonth = nextMonth.valueOf();
      var html = [];
      var classes;
      while (prevMonth.valueOf() < nextMonth) {
        if (prevMonth.getUTCDay() === this.weekStart) {
          html.push('<tr>');
        }
        classes = this.onRenderDay(prevMonth);
        if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() === year && prevMonth.getUTCMonth() < month)) {
          classes.push('old');
        } else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() === year && prevMonth.getUTCMonth() > month)) {
          classes.push('new');
        }
        // Compare internal UTC date with local today, not UTC today
        if (this.todayHighlight &&
          prevMonth.getUTCFullYear() === today.getFullYear() &&
          prevMonth.getUTCMonth() === today.getMonth() &&
          prevMonth.getUTCDate() === today.getDate()) {
          classes.push('today');
        }
        if (prevMonth.valueOf() === currentDate) {
          classes.push('active');
        }
        if ((prevMonth.valueOf() + 86400000) <= this.startDate || prevMonth.valueOf() > this.endDate ||
          $.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1 ||
          $.inArray(prevMonth.toDateString(), this.datesDisabled) !== -1) {
          classes.push('disabled');
        }
        html.push('<td class="' + classes.join(' ') + '">' + prevMonth.getUTCDate() + '</td>');
        if (prevMonth.getUTCDay() === this.weekEnd) {
          html.push('</tr>');
        }
        prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
      }
      this.picker.find('.datetimepicker-days tbody').empty().append(html.join(''));

      html = [];
      var txt = '', meridian = '', meridianOld = '';
      var hoursDisabled = this.hoursDisabled || [];
      d = new Date(this.viewDate)
      for (var i = 0; i < 24; i++) {
        d.setUTCHours(i);
        classes = this.onRenderHour(d);
        if (hoursDisabled.indexOf(i) !== -1) {
          classes.push('disabled');
        }
        var actual = UTCDate(year, month, dayMonth, i);
        // We want the previous hour for the startDate
        if ((actual.valueOf() + 3600000) <= this.startDate || actual.valueOf() > this.endDate) {
          classes.push('disabled');
        } else if (hours === i) {
          classes.push('active');
        }
        if (this.showMeridian && dates[this.language].meridiem.length === 2) {
          meridian = (i < 12 ? dates[this.language].meridiem[0] : dates[this.language].meridiem[1]);
          if (meridian !== meridianOld) {
            if (meridianOld !== '') {
              html.push('</fieldset>');
            }
            html.push('<fieldset class="hour"><legend>' + meridian.toUpperCase() + '</legend>');
          }
          meridianOld = meridian;
          txt = (i % 12 ? i % 12 : 12);
          if (i < 12) {
            classes.push('hour_am');
          } else {
            classes.push('hour_pm');
          }
          html.push('<span class="' + classes.join(' ') + '">' + txt + '</span>');
          if (i === 23) {
            html.push('</fieldset>');
          }
        } else {
          txt = i + ':00';
          html.push('<span class="' + classes.join(' ') + '">' + txt + '</span>');
        }
      }
      this.picker.find('.datetimepicker-hours td').html(html.join(''));

      html = [];
      txt = '';
      meridian = '';
      meridianOld = '';
      var minutesDisabled = this.minutesDisabled || [];
      d = new Date(this.viewDate);
      for (var i = 0; i < 60; i += this.minuteStep) {
        if (minutesDisabled.indexOf(i) !== -1) continue;
        d.setUTCMinutes(i);
        d.setUTCSeconds(0);
        classes = this.onRenderMinute(d);
        if (this.showMeridian && dates[this.language].meridiem.length === 2) {
          meridian = (hours < 12 ? dates[this.language].meridiem[0] : dates[this.language].meridiem[1]);
          if (meridian !== meridianOld) {
            if (meridianOld !== '') {
              html.push('</fieldset>');
            }
            html.push('<fieldset class="minute"><legend>' + meridian.toUpperCase() + '</legend>');
          }
          meridianOld = meridian;
          txt = (hours % 12 ? hours % 12 : 12);
          html.push('<span class="' + classes.join(' ') + '">' + txt + ':' + (i < 10 ? '0' + i : i) + '</span>');
          if (i === 59) {
            html.push('</fieldset>');
          }
        } else {
          txt = i + ':00';
          html.push('<span class="' + classes.join(' ') + '">' + hours + ':' + (i < 10 ? '0' + i : i) + '</span>');
        }
      }
      this.picker.find('.datetimepicker-minutes td').html(html.join(''));

      var currentYear = this.date.getUTCFullYear();
      var months = this.setTitle('.datetimepicker-months', year)
        .end()
        .find('.month').removeClass('active');
      if (currentYear === year) {
        // getUTCMonths() returns 0 based, and we need to select the next one
        // To cater bootstrap 2 we don't need to select the next one
        months.eq(this.date.getUTCMonth()).addClass('active');
      }
      if (year < startYear || year > endYear) {
        months.addClass('disabled');
      }
      if (year === startYear) {
        months.slice(0, startMonth).addClass('disabled');
      }
      if (year === endYear) {
        months.slice(endMonth).addClass('disabled');
      }

      html = '';
      year = parseInt(year / 10, 10) * 10;
      var yearCont = this.setTitle('.datetimepicker-years', year + '-' + (year + 9))
        .end()
        .find('td');
      year -= 1;
      d = new Date(this.viewDate);
      for (var i = -1; i < 11; i++) {
        d.setUTCFullYear(year);
        classes = this.onRenderYear(d);
        if (i === -1 || i === 10) {
          classes.push(old);
        }
        html += '<span class="' + classes.join(' ') + '">' + year + '</span>';
        year += 1;
      }
      yearCont.html(html);
      this.place();
    },

    updateNavArrows: function () {
      var d = new Date(this.viewDate),
        year = d.getUTCFullYear(),
        month = d.getUTCMonth(),
        day = d.getUTCDate(),
        hour = d.getUTCHours();
      switch (this.viewMode) {
        case 0:
          if (year <= this.startDate.getUTCFullYear()
            && month <= this.startDate.getUTCMonth()
            && day <= this.startDate.getUTCDate()
            && hour <= this.startDate.getUTCHours()) {
            this.picker.find('.prev').css({visibility: 'hidden'});
          } else {
            this.picker.find('.prev').css({visibility: 'visible'});
          }
          if (year >= this.endDate.getUTCFullYear()
            && month >= this.endDate.getUTCMonth()
            && day >= this.endDate.getUTCDate()
            && hour >= this.endDate.getUTCHours()) {
            this.picker.find('.next').css({visibility: 'hidden'});
          } else {
            this.picker.find('.next').css({visibility: 'visible'});
          }
          break;
        case 1:
          if (year <= this.startDate.getUTCFullYear()
            && month <= this.startDate.getUTCMonth()
            && day <= this.startDate.getUTCDate()) {
            this.picker.find('.prev').css({visibility: 'hidden'});
          } else {
            this.picker.find('.prev').css({visibility: 'visible'});
          }
          if (year >= this.endDate.getUTCFullYear()
            && month >= this.endDate.getUTCMonth()
            && day >= this.endDate.getUTCDate()) {
            this.picker.find('.next').css({visibility: 'hidden'});
          } else {
            this.picker.find('.next').css({visibility: 'visible'});
          }
          break;
        case 2:
          if (year <= this.startDate.getUTCFullYear()
            && month <= this.startDate.getUTCMonth()) {
            this.picker.find('.prev').css({visibility: 'hidden'});
          } else {
            this.picker.find('.prev').css({visibility: 'visible'});
          }
          if (year >= this.endDate.getUTCFullYear()
            && month >= this.endDate.getUTCMonth()) {
            this.picker.find('.next').css({visibility: 'hidden'});
          } else {
            this.picker.find('.next').css({visibility: 'visible'});
          }
          break;
        case 3:
        case 4:
          if (year <= this.startDate.getUTCFullYear()) {
            this.picker.find('.prev').css({visibility: 'hidden'});
          } else {
            this.picker.find('.prev').css({visibility: 'visible'});
          }
          if (year >= this.endDate.getUTCFullYear()) {
            this.picker.find('.next').css({visibility: 'hidden'});
          } else {
            this.picker.find('.next').css({visibility: 'visible'});
          }
          break;
      }
    },

    mousewheel: function (e) {

      e.preventDefault();
      e.stopPropagation();

      if (this.wheelPause) {
        return;
      }

      this.wheelPause = true;

      var originalEvent = e.originalEvent;

      var delta = originalEvent.wheelDelta;

      var mode = delta > 0 ? 1 : (delta === 0) ? 0 : -1;

      if (this.wheelViewModeNavigationInverseDirection) {
        mode = -mode;
      }

      this.showMode(mode);

      setTimeout($.proxy(function () {

        this.wheelPause = false

      }, this), this.wheelViewModeNavigationDelay);

    },

    click: function (e) {
      e.stopPropagation();
      e.preventDefault();
      var target = $(e.target).closest('span, td, th, legend');
      if (target.is('.' + this.icontype)) {
        target = $(target).parent().closest('span, td, th, legend');
      }
      if (target.length === 1) {
        if (target.is('.disabled')) {
          this.element.trigger({
            type:      'outOfRange',
            date:      this.viewDate,
            startDate: this.startDate,
            endDate:   this.endDate
          });
          return;
        }
        switch (target[0].nodeName.toLowerCase()) {
          case 'th':
            switch (target[0].className) {
              case 'switch':
                this.showMode(1);
                break;
              case 'prev':
              case 'next':
                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
                switch (this.viewMode) {
                  case 0:
                    this.viewDate = this.moveHour(this.viewDate, dir);
                    break;
                  case 1:
                    this.viewDate = this.moveDate(this.viewDate, dir);
                    break;
                  case 2:
                    this.viewDate = this.moveMonth(this.viewDate, dir);
                    break;
                  case 3:
                  case 4:
                    this.viewDate = this.moveYear(this.viewDate, dir);
                    break;
                }
                this.fill();
                this.element.trigger({
                  type:      target[0].className + ':' + this.convertViewModeText(this.viewMode),
                  date:      this.viewDate,
                  startDate: this.startDate,
                  endDate:   this.endDate
                });
                break;
              case 'clear':
                this.reset();
                if (this.autoclose) {
                  this.hide();
                }
                break;
              case 'today':
                var date = new Date();
                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);

                // Respect startDate and endDate.
                if (date < this.startDate) date = this.startDate;
                else if (date > this.endDate) date = this.endDate;

                this.viewMode = this.startViewMode;
                this.showMode(0);
                this._setDate(date);
                this.fill();
                if (this.autoclose) {
                  this.hide();
                }
                break;
            }
            break;
          case 'span':
            if (!target.is('.disabled')) {
              var year = this.viewDate.getUTCFullYear(),
                month = this.viewDate.getUTCMonth(),
                day = this.viewDate.getUTCDate(),
                hours = this.viewDate.getUTCHours(),
                minutes = this.viewDate.getUTCMinutes(),
                seconds = this.viewDate.getUTCSeconds();

              if (target.is('.month')) {
                this.viewDate.setUTCDate(1);
                month = target.parent().find('span').index(target);
                day = this.viewDate.getUTCDate();
                this.viewDate.setUTCMonth(month);
                this.element.trigger({
                  type: 'changeMonth',
                  date: this.viewDate
                });
                if (this.viewSelect >= 3) {
                  this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                }
              } else if (target.is('.year')) {
                this.viewDate.setUTCDate(1);
                year = parseInt(target.text(), 10) || 0;
                this.viewDate.setUTCFullYear(year);
                this.element.trigger({
                  type: 'changeYear',
                  date: this.viewDate
                });
                if (this.viewSelect >= 4) {
                  this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                }
              } else if (target.is('.hour')) {
                hours = parseInt(target.text(), 10) || 0;
                if (target.hasClass('hour_am') || target.hasClass('hour_pm')) {
                  if (hours === 12 && target.hasClass('hour_am')) {
                    hours = 0;
                  } else if (hours !== 12 && target.hasClass('hour_pm')) {
                    hours += 12;
                  }
                }
                this.viewDate.setUTCHours(hours);
                this.element.trigger({
                  type: 'changeHour',
                  date: this.viewDate
                });
                if (this.viewSelect >= 1) {
                  this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                }
              } else if (target.is('.minute')) {
                minutes = parseInt(target.text().substr(target.text().indexOf(':') + 1), 10) || 0;
                this.viewDate.setUTCMinutes(minutes);
                this.element.trigger({
                  type: 'changeMinute',
                  date: this.viewDate
                });
                if (this.viewSelect >= 0) {
                  this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                }
              }
              if (this.viewMode !== 0) {
                var oldViewMode = this.viewMode;
                this.showMode(-1);
                this.fill();
                if (oldViewMode === this.viewMode && this.autoclose) {
                  this.hide();
                }
              } else {
                this.fill();
                if (this.autoclose) {
                  this.hide();
                }
              }
            }
            break;
          case 'td':
            if (target.is('.day') && !target.is('.disabled')) {
              var day = parseInt(target.text(), 10) || 1;
              var year = this.viewDate.getUTCFullYear(),
                month = this.viewDate.getUTCMonth(),
                hours = this.viewDate.getUTCHours(),
                minutes = this.viewDate.getUTCMinutes(),
                seconds = this.viewDate.getUTCSeconds();
              if (target.is('.old')) {
                if (month === 0) {
                  month = 11;
                  year -= 1;
                } else {
                  month -= 1;
                }
              } else if (target.is('.new')) {
                if (month === 11) {
                  month = 0;
                  year += 1;
                } else {
                  month += 1;
                }
              }
              this.viewDate.setUTCFullYear(year);
              this.viewDate.setUTCMonth(month, day);
              this.element.trigger({
                type: 'changeDay',
                date: this.viewDate
              });
              if (this.viewSelect >= 2) {
                this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
              }
            }
            var oldViewMode = this.viewMode;
            this.showMode(-1);
            this.fill();
            if (oldViewMode === this.viewMode && this.autoclose) {
              this.hide();
            }
            break;
        }
      }
    },

    _setDate: function (date, which) {
      if (!which || which === 'date')
        this.date = date;
      if (!which || which === 'view')
        this.viewDate = date;
      this.fill();
      this.setValue();
      var element;
      if (this.isInput) {
        element = this.element;
      } else if (this.component) {
        element = this.element.find('input');
      }
      if (element) {
        element.change();
      }
      this.element.trigger({
        type: 'changeDate',
        date: this.getDate()
      });
      if(date === null)
        this.date = this.viewDate;
    },

    moveMinute: function (date, dir) {
      if (!dir) return date;
      var new_date = new Date(date.valueOf());
      //dir = dir > 0 ? 1 : -1;
      new_date.setUTCMinutes(new_date.getUTCMinutes() + (dir * this.minuteStep));
      return new_date;
    },

    moveHour: function (date, dir) {
      if (!dir) return date;
      var new_date = new Date(date.valueOf());
      //dir = dir > 0 ? 1 : -1;
      new_date.setUTCHours(new_date.getUTCHours() + dir);
      return new_date;
    },

    moveDate: function (date, dir) {
      if (!dir) return date;
      var new_date = new Date(date.valueOf());
      //dir = dir > 0 ? 1 : -1;
      new_date.setUTCDate(new_date.getUTCDate() + dir);
      return new_date;
    },

    moveMonth: function (date, dir) {
      if (!dir) return date;
      var new_date = new Date(date.valueOf()),
        day = new_date.getUTCDate(),
        month = new_date.getUTCMonth(),
        mag = Math.abs(dir),
        new_month, test;
      dir = dir > 0 ? 1 : -1;
      if (mag === 1) {
        test = dir === -1
          // If going back one month, make sure month is not current month
          // (eg, Mar 31 -> Feb 31 === Feb 28, not Mar 02)
          ? function () {
          return new_date.getUTCMonth() === month;
        }
          // If going forward one month, make sure month is as expected
          // (eg, Jan 31 -> Feb 31 === Feb 28, not Mar 02)
          : function () {
          return new_date.getUTCMonth() !== new_month;
        };
        new_month = month + dir;
        new_date.setUTCMonth(new_month);
        // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
        if (new_month < 0 || new_month > 11)
          new_month = (new_month + 12) % 12;
      } else {
        // For magnitudes >1, move one month at a time...
        for (var i = 0; i < mag; i++)
          // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
          new_date = this.moveMonth(new_date, dir);
        // ...then reset the day, keeping it in the new month
        new_month = new_date.getUTCMonth();
        new_date.setUTCDate(day);
        test = function () {
          return new_month !== new_date.getUTCMonth();
        };
      }
      // Common date-resetting loop -- if date is beyond end of month, make it
      // end of month
      while (test()) {
        new_date.setUTCDate(--day);
        new_date.setUTCMonth(new_month);
      }
      return new_date;
    },

    moveYear: function (date, dir) {
      return this.moveMonth(date, dir * 12);
    },

    dateWithinRange: function (date) {
      return date >= this.startDate && date <= this.endDate;
    },

    keydown: function (e) {
      if (this.picker.is(':not(:visible)')) {
        if (e.keyCode === 27) // allow escape to hide and re-show picker
          this.show();
        return;
      }
      var dateChanged = false,
        dir, newDate, newViewDate;
      switch (e.keyCode) {
        case 27: // escape
          this.hide();
          e.preventDefault();
          break;
        case 37: // left
        case 39: // right
          if (!this.keyboardNavigation) break;
          dir = e.keyCode === 37 ? -1 : 1;
          var viewMode = this.viewMode;
          if (e.ctrlKey) {
            viewMode += 2;
          } else if (e.shiftKey) {
            viewMode += 1;
          }
          if (viewMode === 4) {
            newDate = this.moveYear(this.date, dir);
            newViewDate = this.moveYear(this.viewDate, dir);
          } else if (viewMode === 3) {
            newDate = this.moveMonth(this.date, dir);
            newViewDate = this.moveMonth(this.viewDate, dir);
          } else if (viewMode === 2) {
            newDate = this.moveDate(this.date, dir);
            newViewDate = this.moveDate(this.viewDate, dir);
          } else if (viewMode === 1) {
            newDate = this.moveHour(this.date, dir);
            newViewDate = this.moveHour(this.viewDate, dir);
          } else if (viewMode === 0) {
            newDate = this.moveMinute(this.date, dir);
            newViewDate = this.moveMinute(this.viewDate, dir);
          }
          if (this.dateWithinRange(newDate)) {
            this.date = newDate;
            this.viewDate = newViewDate;
            this.setValue();
            this.update();
            e.preventDefault();
            dateChanged = true;
          }
          break;
        case 38: // up
        case 40: // down
          if (!this.keyboardNavigation) break;
          dir = e.keyCode === 38 ? -1 : 1;
          viewMode = this.viewMode;
          if (e.ctrlKey) {
            viewMode += 2;
          } else if (e.shiftKey) {
            viewMode += 1;
          }
          if (viewMode === 4) {
            newDate = this.moveYear(this.date, dir);
            newViewDate = this.moveYear(this.viewDate, dir);
          } else if (viewMode === 3) {
            newDate = this.moveMonth(this.date, dir);
            newViewDate = this.moveMonth(this.viewDate, dir);
          } else if (viewMode === 2) {
            newDate = this.moveDate(this.date, dir * 7);
            newViewDate = this.moveDate(this.viewDate, dir * 7);
          } else if (viewMode === 1) {
            if (this.showMeridian) {
              newDate = this.moveHour(this.date, dir * 6);
              newViewDate = this.moveHour(this.viewDate, dir * 6);
            } else {
              newDate = this.moveHour(this.date, dir * 4);
              newViewDate = this.moveHour(this.viewDate, dir * 4);
            }
          } else if (viewMode === 0) {
            newDate = this.moveMinute(this.date, dir * 4);
            newViewDate = this.moveMinute(this.viewDate, dir * 4);
          }
          if (this.dateWithinRange(newDate)) {
            this.date = newDate;
            this.viewDate = newViewDate;
            this.setValue();
            this.update();
            e.preventDefault();
            dateChanged = true;
          }
          break;
        case 13: // enter
          if (this.viewMode !== 0) {
            var oldViewMode = this.viewMode;
            this.showMode(-1);
            this.fill();
            if (oldViewMode === this.viewMode && this.autoclose) {
              this.hide();
            }
          } else {
            this.fill();
            if (this.autoclose) {
              this.hide();
            }
          }
          e.preventDefault();
          break;
        case 9: // tab
          this.hide();
          break;
      }
      if (dateChanged) {
        var element;
        if (this.isInput) {
          element = this.element;
        } else if (this.component) {
          element = this.element.find('input');
        }
        if (element) {
          element.change();
        }
        this.element.trigger({
          type: 'changeDate',
          date: this.getDate()
        });
      }
    },

    showMode: function (dir) {
      if (dir) {
        var newViewMode = Math.max(0, Math.min(DPGlobal.modes.length - 1, this.viewMode + dir));
        if (newViewMode >= this.minView && newViewMode <= this.maxView) {
          this.element.trigger({
            type:        'changeMode',
            date:        this.viewDate,
            oldViewMode: this.viewMode,
            newViewMode: newViewMode
          });

          this.viewMode = newViewMode;
        }
      }
      /*
       vitalets: fixing bug of very special conditions:
       jquery 1.7.1 + webkit + show inline datetimepicker in bootstrap popover.
       Method show() does not set display css correctly and datetimepicker is not shown.
       Changed to .css('display', 'block') solve the problem.
       See https://github.com/vitalets/x-editable/issues/37

       In jquery 1.7.2+ everything works fine.
       */
      //this.picker.find('>div').hide().filter('.datetimepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
      this.picker.find('>div').hide().filter('.datetimepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
      this.updateNavArrows();
    },

    reset: function () {
      this._setDate(null, 'date');
    },

    convertViewModeText:  function (viewMode) {
      switch (viewMode) {
        case 4:
          return 'decade';
        case 3:
          return 'year';
        case 2:
          return 'month';
        case 1:
          return 'day';
        case 0:
          return 'hour';
      }
    }
  };

  var old = $.fn.datetimepicker;
  $.fn.datetimepicker = function (option) {
    var args = Array.apply(null, arguments);
    args.shift();
    var internal_return;
    this.each(function () {
      var $this = $(this),
        data = $this.data('datetimepicker'),
        options = typeof option === 'object' && option;
      if (!data) {
        $this.data('datetimepicker', (data = new Datetimepicker(this, $.extend({}, $.fn.datetimepicker.defaults, {language: Z.locale}, options))));
      }
      if (typeof option === 'string' && typeof data[option] === 'function') {
        internal_return = data[option].apply(data, args);
        if (internal_return !== undefined) {
          return false;
        }
      }
    });
    if (internal_return !== undefined)
      return internal_return;
    else
      return this;
  };

  $.fn.datetimepicker.defaults = {
    minView: 2,
    format: 'yyyy-mm-dd'
  };
  $.fn.datetimepicker.Constructor = Datetimepicker;
  var dates = $.fn.datetimepicker.dates = {
    en: {
      days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      meridiem:    ['am', 'pm'],
      suffix:      ['st', 'nd', 'rd', 'th'],
      today:       'Today',
      clear:       'Clear'
    }
  };

  $.fn.datetimepicker.dates['zh-CN'] = {
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    meridiem: ["上午", "下午"],
    suffix: [],
    today: "今天",
    clear: '清空'
  };

  var DPGlobal = {
    modes:            [
      {
        clsName: 'minutes',
        navFnc:  'Hours',
        navStep: 1
      },
      {
        clsName: 'hours',
        navFnc:  'Date',
        navStep: 1
      },
      {
        clsName: 'days',
        navFnc:  'Month',
        navStep: 1
      },
      {
        clsName: 'months',
        navFnc:  'FullYear',
        navStep: 1
      },
      {
        clsName: 'years',
        navFnc:  'FullYear',
        navStep: 10
      }
    ],
    isLeapYear:       function (year) {
      return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
    },
    getDaysInMonth:   function (year, month) {
      return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
    },
    getDefaultFormat: function (type, field) {
      if (type === 'standard') {
        if (field === 'input')
          return 'yyyy-mm-dd hh:ii';
        else
          return 'yyyy-mm-dd hh:ii:ss';
      } else if (type === 'php') {
        if (field === 'input')
          return 'Y-m-d H:i';
        else
          return 'Y-m-d H:i:s';
      } else {
        throw new Error('Invalid format type.');
      }
    },
    validParts: function (type) {
      if (type === 'standard') {
        return /t|hh?|HH?|p|P|z|Z|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g;
      } else if (type === 'php') {
        return /[dDjlNwzFmMnStyYaABgGhHis]/g;
      } else {
        throw new Error('Invalid format type.');
      }
    },
    nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
    parseFormat: function (format, type) {
      // IE treats \0 as a string end in inputs (truncating the value),
      // so it's a bad format delimiter, anyway
      var separators = format.replace(this.validParts(type), '\0').split('\0'),
        parts = format.match(this.validParts(type));
      if (!separators || !separators.length || !parts || parts.length === 0) {
        throw new Error('Invalid date format.');
      }
      return {separators: separators, parts: parts};
    },
    parseDate: function (date, format, language, type, timezone) {
      if (date instanceof Date) {
        var dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
        dateUTC.setMilliseconds(0);
        return dateUTC;
      }
      if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
        format = this.parseFormat('yyyy-mm-dd', type);
      }
      if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
        format = this.parseFormat('yyyy-mm-dd hh:ii', type);
      }
      if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
        format = this.parseFormat('yyyy-mm-dd hh:ii:ss', type);
      }
      if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
        var part_re = /([-+]\d+)([dmwy])/,
          parts = date.match(/([-+]\d+)([dmwy])/g),
          part, dir;
        date = new Date();
        for (var i = 0; i < parts.length; i++) {
          part = part_re.exec(parts[i]);
          dir = parseInt(part[1]);
          switch (part[2]) {
            case 'd':
              date.setUTCDate(date.getUTCDate() + dir);
              break;
            case 'm':
              date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
              break;
            case 'w':
              date.setUTCDate(date.getUTCDate() + dir * 7);
              break;
            case 'y':
              date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
              break;
          }
        }
        return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), 0);
      }
      var parts = date && date.toString().match(this.nonpunctuation) || [],
        date = new Date(0, 0, 0, 0, 0, 0, 0),
        parsed = {},
        setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH', 'p', 'P', 'z', 'Z'],
        setters_map = {
          hh:   function (d, v) {
            return d.setUTCHours(v);
          },
          h:    function (d, v) {
            return d.setUTCHours(v);
          },
          HH:   function (d, v) {
            return d.setUTCHours(v === 12 ? 0 : v);
          },
          H:    function (d, v) {
            return d.setUTCHours(v === 12 ? 0 : v);
          },
          ii:   function (d, v) {
            return d.setUTCMinutes(v);
          },
          i:    function (d, v) {
            return d.setUTCMinutes(v);
          },
          ss:   function (d, v) {
            return d.setUTCSeconds(v);
          },
          s:    function (d, v) {
            return d.setUTCSeconds(v);
          },
          yyyy: function (d, v) {
            return d.setUTCFullYear(v);
          },
          yy:   function (d, v) {
            return d.setUTCFullYear(2000 + v);
          },
          m:    function (d, v) {
            v -= 1;
            while (v < 0) v += 12;
            v %= 12;
            d.setUTCMonth(v);
            while (d.getUTCMonth() !== v)
              if (isNaN(d.getUTCMonth()))
                return d;
              else
                d.setUTCDate(d.getUTCDate() - 1);
            return d;
          },
          d:    function (d, v) {
            return d.setUTCDate(v);
          },
          p:    function (d, v) {
            return d.setUTCHours(v === 1 ? d.getUTCHours() + 12 : d.getUTCHours());
          },
          z:    function () {
            return timezone
          }
        },
        val, filtered, part;
      setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
      setters_map['dd'] = setters_map['d'];
      setters_map['P'] = setters_map['p'];
      setters_map['Z'] = setters_map['z'];
      date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
      if (parts.length === format.parts.length) {
        for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
          val = parseInt(parts[i], 10);
          part = format.parts[i];
          if (isNaN(val)) {
            switch (part) {
              case 'MM':
                filtered = $(dates[language].months).filter(function () {
                  var m = this.slice(0, parts[i].length),
                    p = parts[i].slice(0, m.length);
                  return m === p;
                });
                val = $.inArray(filtered[0], dates[language].months) + 1;
                break;
              case 'M':
                filtered = $(dates[language].monthsShort).filter(function () {
                  var m = this.slice(0, parts[i].length),
                    p = parts[i].slice(0, m.length);
                  return m.toLowerCase() === p.toLowerCase();
                });
                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                break;
              case 'p':
              case 'P':
                val = $.inArray(parts[i].toLowerCase(), dates[language].meridiem);
                break;
              case 'z':
              case 'Z':
                timezone;
                break;

            }
          }
          parsed[part] = val;
        }
        for (var i = 0, s; i < setters_order.length; i++) {
          s = setters_order[i];
          if (s in parsed && !isNaN(parsed[s]))
            setters_map[s](date, parsed[s])
        }
      }
      return date;
    },
    formatDate:       function (date, format, language, type, timezone) {
      if (date === null) {
        return '';
      }
      var val;
      if (type === 'standard') {
        val = {
          t:    date.getTime(),
          // year
          yy:   date.getUTCFullYear().toString().substring(2),
          yyyy: date.getUTCFullYear(),
          // month
          m:    date.getUTCMonth() + 1,
          M:    dates[language].monthsShort[date.getUTCMonth()],
          MM:   dates[language].months[date.getUTCMonth()],
          // day
          d:    date.getUTCDate(),
          D:    dates[language].daysShort[date.getUTCDay()],
          DD:   dates[language].days[date.getUTCDay()],
          p:    (dates[language].meridiem.length === 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
          // hour
          h:    date.getUTCHours(),
          // minute
          i:    date.getUTCMinutes(),
          // second
          s:    date.getUTCSeconds(),
          // timezone
          z:    timezone
        };

        if (dates[language].meridiem.length === 2) {
          val.H = (val.h % 12 === 0 ? 12 : val.h % 12);
        }
        else {
          val.H = val.h;
        }
        val.HH = (val.H < 10 ? '0' : '') + val.H;
        val.P = val.p.toUpperCase();
        val.Z = val.z;
        val.hh = (val.h < 10 ? '0' : '') + val.h;
        val.ii = (val.i < 10 ? '0' : '') + val.i;
        val.ss = (val.s < 10 ? '0' : '') + val.s;
        val.dd = (val.d < 10 ? '0' : '') + val.d;
        val.mm = (val.m < 10 ? '0' : '') + val.m;
      } else if (type === 'php') {
        // php format
        val = {
          // year
          y: date.getUTCFullYear().toString().substring(2),
          Y: date.getUTCFullYear(),
          // month
          F: dates[language].months[date.getUTCMonth()],
          M: dates[language].monthsShort[date.getUTCMonth()],
          n: date.getUTCMonth() + 1,
          t: DPGlobal.getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth()),
          // day
          j: date.getUTCDate(),
          l: dates[language].days[date.getUTCDay()],
          D: dates[language].daysShort[date.getUTCDay()],
          w: date.getUTCDay(), // 0 -> 6
          N: (date.getUTCDay() === 0 ? 7 : date.getUTCDay()),       // 1 -> 7
          S: (date.getUTCDate() % 10 <= dates[language].suffix.length ? dates[language].suffix[date.getUTCDate() % 10 - 1] : ''),
          // hour
          a: (dates[language].meridiem.length === 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
          g: (date.getUTCHours() % 12 === 0 ? 12 : date.getUTCHours() % 12),
          G: date.getUTCHours(),
          // minute
          i: date.getUTCMinutes(),
          // second
          s: date.getUTCSeconds()
        };
        val.m = (val.n < 10 ? '0' : '') + val.n;
        val.d = (val.j < 10 ? '0' : '') + val.j;
        val.A = val.a.toString().toUpperCase();
        val.h = (val.g < 10 ? '0' : '') + val.g;
        val.H = (val.G < 10 ? '0' : '') + val.G;
        val.i = (val.i < 10 ? '0' : '') + val.i;
        val.s = (val.s < 10 ? '0' : '') + val.s;
      } else {
        throw new Error('Invalid format type.');
      }
      var date = [],
        seps = $.extend([], format.separators);
      for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
        if (seps.length) {
          date.push(seps.shift());
        }
        date.push(val[format.parts[i]]);
      }
      if (seps.length) {
        date.push(seps.shift());
      }
      return date.join('');
    },
    convertViewMode:  function (viewMode) {
      switch (viewMode) {
        case 4:
        case 'decade':
          viewMode = 4;
          break;
        case 3:
        case 'year':
          viewMode = 3;
          break;
        case 2:
        case 'month':
          viewMode = 2;
          break;
        case 1:
        case 'day':
          viewMode = 1;
          break;
        case 0:
        case 'hour':
          viewMode = 0;
          break;
      }

      return viewMode;
    },
    headTemplate: '<thead>' +
                '<tr>' +
                '<th class="prev"><i class="{iconType} {leftArrow}"/></th>' +
                '<th colspan="5" class="switch"></th>' +
                '<th class="next"><i class="{iconType} {rightArrow}"/></th>' +
                '</tr>' +
      '</thead>',
    headTemplateV3: '<thead>' +
                '<tr>' +
                '<th class="prev"><span class="{iconType} {leftArrow}"></span> </th>' +
                '<th colspan="5" class="switch"></th>' +
                '<th class="next"><span class="{iconType} {rightArrow}"></span> </th>' +
                '</tr>' +
      '</thead>',
    contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
    footTemplate: '<tfoot>' + 
                    '<tr><th colspan="7" class="today"></th></tr>' +
                    '<tr><th colspan="7" class="clear"></th></tr>' +
                  '</tfoot>'
  };
  DPGlobal.template = '<div class="datetimepicker">' +
    '<div class="datetimepicker-minutes">' +
    '<table class=" z-table">' +
    DPGlobal.headTemplate +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-hours">' +
    '<table class=" z-table">' +
    DPGlobal.headTemplate +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-days">' +
    '<table class=" z-table">' +
    DPGlobal.headTemplate +
    '<tbody></tbody>' +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-months">' +
    '<table class="z-table">' +
    DPGlobal.headTemplate +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-years">' +
    '<table class="z-table">' +
    DPGlobal.headTemplate +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '</div>';
  DPGlobal.templateV3 = '<div class="datetimepicker">' +
    '<div class="datetimepicker-minutes">' +
    '<table class=" z-table">' +
    DPGlobal.headTemplateV3 +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-hours">' +
    '<table class=" z-table">' +
    DPGlobal.headTemplateV3 +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-days">' +
    '<table class=" z-table">' +
    DPGlobal.headTemplateV3 +
    '<tbody></tbody>' +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-months">' +
    '<table class="z-table">' +
    DPGlobal.headTemplateV3 +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '<div class="datetimepicker-years">' +
    '<table class="z-table">' +
    DPGlobal.headTemplateV3 +
    DPGlobal.contTemplate +
    DPGlobal.footTemplate +
    '</table>' +
    '</div>' +
    '</div>';
  $.fn.datetimepicker.DPGlobal = DPGlobal;

  /* DATETIMEPICKER NO CONFLICT
   * =================== */

  $.fn.datetimepicker.noConflict = function () {
    $.fn.datetimepicker = old;
    return this;
  };

  /* DATETIMEPICKER DATA-API
   * ================== */

  $(document).on(
    'focus.datetimepicker.data-api click.datetimepicker.data-api',
    '[data-provide="datetimepicker"]',
    function (e) {
      var $this = $(this);
      if ($this.data('datetimepicker')) return;
      e.preventDefault();
      // component click requires us to explicitly show it
      $this.datetimepicker('show');
    }
  );
  $(function () {
    $('[data-provide="datetimepicker-inline"]').datetimepicker();
  });

}));

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
        var lang = Z.locales[Z.locale];
        this.blocker = getBlocker();

        if (this.blocker.find('.dlg').length) {
            console.warn('Only one dialog can be opened at the same time!');
            return;
        }

        this.defaults = {
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
        var config = $.extend(true, {}, this.defaults, opt);

        // support width: 100 and width: '100'
        if (config.width) {
            config.width = parseInt(config.width) + 'px';
        }

        // add ok & cancel button by default
        this.actions = [];
        if (config.actions.length > 0) {
            this.actions = config.actions;
        } else {
            if (config.cancelButton !== false) {
                this.actions.push({
                    tmplt: '<button class="z-btn red">' + lang['Cancel'] + '</button>',
                    onClick: this.close.bind(this)
                });
            }
            if (config.okButton !== false) {
                this.actions.push({
                    tmplt: '<button class="z-btn primary">' + lang['OK'] + '</button>',
                    onClick: config.onOK
                });
            }
        }

        this.positionDialog = this.positionDialog.bind(this);
        this.config = config;
        this.generateHtml();
        this.open();
    }

    Dialog.prototype.generateHtml = function() {
        var me = this;
        var config = this.config;
        var container = $('<div class="z-dlg-container"></div>');
        var dlgHtml = '<div class="z-dlg" tabindex="0" style="width:' + config.width + '">';

        dlgHtml += '<i class="fa fa-close z-dlg-close"></i>';

        // title
        if (config.title) {
            dlgHtml += '<div class="z-dlg-title">' + config.title + '</div>';
        }

        // dialog content
        dlgHtml += '<div class="z-dlg-content">' + config.content + '</div>';

        // action buttons
        if (this.actions.length > 0) {
            dlgHtml += '<div class="z-dlg-foot">';
            this.actions.forEach(function(action) {
                dlgHtml += '<div class="z-dlg-action-wrapper">' + action.tmplt + '</div>';
            });
            dlgHtml += '</div>';
        }

        dlgHtml += '</div>';

        // mount dom node
        this.container = container;
        this.el = $(dlgHtml);
        container.append(this.el);
        this.blocker.append(container);

        // bind click events for the buttons
        if (this.actions.length > 0) {
            this.el.find('.z-dlg-action-wrapper').each(function(index, item) {
                $(item).on('click', function(event) {
                    me.actions[index].onClick(me);
                });
            });
        }
        this.el.find('.z-dlg-close').on('click', function(event) {
            me.close();
        });

        this.el.on('keydown', function(e) {
            if (e.which === 27) {
                me.close();
            }
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
/*
    Dropdown
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
/*
    Loader
*/


! function($) {
    'use strict';

    $.fn.load = function(opt) {
    	var $this = $(this);

    	if ($this.find('.z-loading-mask').length) {
    		console.warn('Do not load repeatedly on the same div!');
    		return;
    	}

    	var content = opt && opt.content || '';
    	var darkClass = opt && opt.color === 'dark' ? ' dark' : '';
    	var _html = '<div class="z-loading-mask' + darkClass + '">'
    	+ '<div class="z-loading-content">'
    	+ '<i class="fa fa-spinner fa-spin z-loading-icon"></i><span class="z-loading-text">'
    	+ content + '</span>'
    	+ '</div></div>';

    	if ($this.css('position') === 'static') {
    		$this.css('position', 'relative');
    	}
    	$(_html).appendTo($(this));
    }

	$.fn.unLoad = function() {
		$(this).find('.z-loading-mask').remove();
	}
}(jQuery);
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
/*
    Pagination
*/


! function($) {
    'use strict';

    $.fn.pagination = function(opt) {
        var lang = Z.locales[Z.locale];
        var container = this;
        var total = opt.total || 0;

        container.off().html('');
        if (total < 1) {
            return;
        }

        var pageSize = opt.pageSize || 10;
        var pageDisplay = opt.pageDisplay || 10;
        var current = opt.current || 1;
        var showJumper = opt.showJumper || false;
        var showSizer = opt.showSizer || false;
        var pageSizeOptions = opt.pageSizeOptions || [10, 20, 30];
        var onPageChange = opt.onPageChange || $.noop;
        var pageCount = Math.ceil(total / pageSize);

        generateHtml();

        // to previous page
        container.on('click', '.z-page-prev', function(e) {
            if (current !== 1) {
                current--;
                updatePages();
                onPageChange(current, pageSize);
            }
        });

        // to first page
        container.on('click', '.z-page-first', function(e) {
            if (current !== 1) {
                current = 1;
                updatePages();
                onPageChange(1, pageSize);
            }
        });

        // to next page
        container.on('click', '.z-page-next', function(e) {
            if (current !== pageCount) {
                current++;
                updatePages();
                onPageChange(current, pageSize);
            }
        });

        // to last page
        container.on('click', '.z-page-last', function(e) {
            if (current !== pageCount) {
                current = pageCount;
                updatePages();
                onPageChange(pageCount, pageSize);
            }
        });

        // to a specific page
        container.on('click', '.z-page', function(e) {
            var newCurrent = parseInt(this.innerText);

            if (current !== newCurrent) {
                current = newCurrent;
                updatePages();
                onPageChange(newCurrent, pageSize);
            }
        });

        // quick jump
        container.on('keydown', '.z-page-quick-input', function(event) {
            if (event.which === 13) {
                var newCurrent = parseInt(this.value);

                if (!isNaN(newCurrent)) {
                    if (newCurrent < 0) {
                        current = 0;
                    } else if (newCurrent > pageCount) {
                        current = pageCount;
                    } else {
                        current = newCurrent;
                    }
                    updatePages();
                    onPageChange(current, pageSize);
                }
            }
        });

        // page sizer
        if (showSizer) {
            var options = pageSizeOptions.map(function(value) {
                return {
                    value: value,
                    text: value + '/' + lang['Page']
                };
            })
            container.find('.z-page-sizer').select({
                initialValue: pageSize,
                data: options,
                onChange: function(size) {
                    pageSize = size;
                    pageCount = Math.ceil(total / pageSize);
                    updatePages();
                    onPageChange(current, pageSize);
                }
            });
        }

        function generateHtml() {
            var _html = '<div class="z-pagination"><div class="z-pages"></div>';

            // sizer for page size change.
            if (showSizer) {
                _html += '<input type="text" class="z-page-sizer small">';
            }

            // quick jump button
            if (showJumper) {
                _html += '<div class="z-page-quick">' + lang['Goto'] + '<input type="text" class="z-input small z-page-quick-input"></div>';
            }

            _html += '</div>';

            container.html(_html);
            updatePages();
        }

        function updatePages() {
            var _html = '';
            var pageCount = Math.ceil(total / pageSize);
            var half = parseInt(pageDisplay / 2);
            var leftPageNo = current - half > 0 ? current - half : 1;
            var rightPageNo = leftPageNo + pageDisplay - 1 < pageCount ? leftPageNo + pageDisplay - 1 : pageCount;            

            // pre button
            if (current === 1) {
                _html += '<a class="z-page-first disabled"><i class="fa fa-angle-double-left"></i></a><a class="z-page-prev disabled"><i class="fa fa-angle-left"></i></a>';
            } else {
                _html += '<a class="z-page-first"><i class="fa fa-angle-double-left"></i></a><a class="z-page-prev"><i class="fa fa-angle-left"></i></a>';
            }

            // page buttons
            for (var i = leftPageNo; i <= rightPageNo; i++) {
                _html += (i === current ?
                    '<a class="z-page active">' + i + '</a>' :
                    '<a class="z-page">' + i + '</a>');
            }

            // next button
            if (current === pageCount) {
                _html += '<a class="z-page-next disabled"><i class="fa fa-angle-right"></i></a><a class="z-page-last disabled"><i class="fa fa-angle-double-right"></i></a>';
            } else {
                _html += '<a class="z-page-next"><i class="fa fa-angle-right"></i></a><a class="z-page-last"><i class="fa fa-angle-double-right"></i></a>';
            }

            container.find('.z-pages').html(_html);
        }
    }
}(jQuery);
/*
    Pop Confirm
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
/*
    Select
*/

! function($) {
    'use strict';

    function Select(element, opt) {
        this.defaults = {
            position: '', // support: ['top']
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
        var $newSelect = $('<input type="text" class="z-input z-select-trigger" readonly' + ($select.is(':disabled') ? ' disabled' : '') + '>');

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
            'toggle': function(e) {
                $(this).toggleClass('open');
                options.toggleClass('open');
            },
            'open': function(e) {
                options.addClass('open');
                $(this).addClass('open');
            },
            'close': function(e) {
                options.removeClass('open');
                $(this).removeClass('open');
            }
        });

        var mouseIn = false;
        $wrapper.on({
            'mouseenter': function() {
                mouseIn = true;
            },
            'mouseleave': function() {
                mouseIn = false;
            },
            'click': function() {
                if (!$newSelect.is(':disabled')) {
                    $newSelect.trigger('toggle');
                }
            }
        });

        dropdownIcon.on('click', function(e) {
            if (!dropdownIcon.hasClass('up')) {
                $newSelect.focus();
            }
        });

        options.on('click', function(e) {
            e.stopPropagation();
        });

        options.on('click', '.z-select-option', function(e) {
            var $this = $(this);

            // Check if the option element is disabled
            if (!$this.hasClass('disabled')) {
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
                        me.valueSelected = [$this.data('value')];
                        me.textSelected = [$this.text()];
                        me._updateValue();
                    }
                    $newSelect.trigger('close');
                    $this.addClass('selected');
                }
            }
        });

        // click elsewhere to close
        $(document).on('click', function(e) {
            if (!mouseIn) {
                $newSelect.trigger('close');
            }
        });

        $wrapper.on('keydown', function(e) {
            switch (e.which) {
                // TAB - close
                // ESC - close
                case 9:
                case 27:
                    $newSelect.trigger('close');
                    break;

                // ENTER - select current option and close
                case 13:
                    if (!options.hasClass('open')) {
                        $newSelect.trigger('open');
                    }
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

        this.$newSelect.val(text);
        this.$select.val(this.valueSelected.join(','));
        if (!firstInit) {
            this.$select.trigger('change');
        }

        if (this.config.multiple) {
            this.$wrapper.attr('title', text);
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
        this.$newSelect.attr('disabled', true);
        this.$select.attr('disabled', true);
    };

    Select.prototype.enable = function() {
        this.$newSelect.removeAttr('disabled');
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
/*
    Side Navigation
*/


! function($) {
    'use strict';

    Z.initSideNav = function() {
    	$(document).on('click', '.z-nav-item', function() {
    	    var $this = $(this);

    	    if ($this.hasClass('active')) {
    	    	return;
    	    }
    	    $(this).closest('.z-side-nav').find('.active').removeClass('active');
    	    $this.addClass('active');
    	});

        $(document).on('click', '.z-nav-head', function() {
            var $this = $(this);

            $this.toggleClass('active');
        });
    }
}(jQuery);
/*
    Step
*/


! function($) {
	'use strict';

	// Go to a specific step.
	$.fn.step = function(toStep) {
		var $this = $(this);

		if (!$this.hasClass('z-steps')) {
			return;
		}

		var $current = $(this).find('.current');

		if (toStep === 'next') {
			$current.removeClass('current').addClass('done');
			$current.next().addClass('current');
		} else if (toStep === 'pre') {
			$current.removeClass('current');
			$current.prev().removeClass('done').addClass('current');
		} else {
			var stepNum;
			var $steps = $this.find('.z-step');

			if (toStep === 'first') {
				stepNum = 0;
			} else if (toStep === 'last') {
				stepNum = $steps.length - 1;
			} else {
				stepNum = parseInt(toStep);
			}
			$steps.each(function(index, el) {
				var $el = $(el);
				if (index < stepNum) {
					$el.removeClass('current').addClass('done');
				} else if (index === stepNum) {
					$el.removeClass('done').addClass('current');
				} else {
					$el.removeClass('done').removeClass('current');
				}
			});
		}
	}
}(jQuery);
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
/*
    Tooltip
*/


! function($) {
	'use strict';

	Z.initTooltip = function() {
		$(document).on('mouseenter', '[data-tooltip]', function() {
			var $trigger = $(this);
			var tooltipId = Z.guid();
			var $tooltip = $('<div class="z-pop z-tooltip"></div>');
			var content = $trigger.data('tooltip');
			var $arrow = $('<div class="z-pop-arrow"></div>');

			$tooltip.attr('id', tooltipId).text(content);
			$trigger.data('tooltip-id', tooltipId);
			$arrow.appendTo($tooltip);
			$tooltip.appendTo('body');

			var position = $trigger.data('position') || 'top',
				triggerTop = $trigger.offset().top,
				triggerLeft = $trigger.offset().left,
				triggerWidth = $trigger.outerWidth(),
				triggerHeight = $trigger.outerHeight(),
				popWidth = $tooltip.outerWidth(),
				popHeight = $tooltip.outerHeight(),
				top, left;

			switch (position) {
				case 'top':
					top = triggerTop - popHeight - 8;
					left = triggerLeft - popWidth / 2 + triggerWidth / 2;
					break;
				case 'bottom':
					top = triggerTop + triggerHeight + 8;
					left = triggerLeft - popWidth / 2 + triggerWidth / 2;
					break;
				case 'left':
					top = triggerTop - popHeight / 2 + triggerHeight / 2;
					left = triggerLeft - popWidth - 8;
					break;
				case 'right':
					top = triggerTop - popHeight / 2 + triggerHeight / 2;
					left = triggerLeft + triggerWidth + 8;
					break;
				default:
			}
			$tooltip.addClass(position);
			$tooltip.css({
				'top': top,
				'left': left
			});
		});

		$(document).on('mouseleave', '[data-tooltip]', function() {
			var $trigger = $(this);
			var tooltipId = $trigger.data('tooltip-id');

			$('#' + tooltipId).remove();
			$trigger.data('tooltip-id', '');
		});
	}

}(jQuery);
/*
    Upload
*/


! function($) {
    'use strict';

    Z.initUploader = function() {
        $(document).on('change', '.z-input-file', function(event) {
            var files = event.target.files;
            var $filePath = $(this).children('.z-input');
            var $close = $(this).children('.z-remove-file');

            if (files.length === 0) {
                $filePath.val('');
                $close.hide();
            } else if (files.length === 1) {
                var filePath = files[0].name;

                $filePath.val(filePath);
                $close.show();
            } else {
                var fileNames = [];

                for (var k = 0; k < files.length; k++) {
                    fileNames.push(files[k].name);
                }
                $filePath.val(fileNames.join(', '));
                $close.show();
            }
        });

        $(document).on('click', '.z-remove-file', function() {
            var $this = $(this);
            var $file = $this.siblings('[type=file]');

            $this.siblings('.z-input').val('');
            $file.after($file.clone().val(''));
            $file.remove();
            $this.hide();
        });
    }

}(jQuery);
/*
	Initialize components	
*/

(function($) {
	'use strict';

	$(function() {
		$('.z-dropdown-trigger').dropdown();
		// $('[data-tooltip]').tooltip();
		Z.initSideNav();
		Z.initTabs();
		Z.initTooltip();
		Z.initUploader();
	});
})(jQuery);