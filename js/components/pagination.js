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