/*
    Upload
    author: zhao xin
    date: 2017.4
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