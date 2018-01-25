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