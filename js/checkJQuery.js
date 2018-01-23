/*
    Check jQuery
*/


if (!window.jQuery) {
	throw "Error: jQuery Not Found. Zui needs jQuery to run."
}

window.Z = {};

Z.version = '2.0.0';

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