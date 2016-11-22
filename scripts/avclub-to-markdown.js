#!/usr/bin/nodejs
// Typepad conversion script
//
// This should allow a downloaded copy of a Typepad blog entry
// to be converted to standard Markdown format.
// It's not foolproof (far from it) and has to be iterated per file,
// but this *should* do it.
//
// github.com/jbuchbinder
//
// Installation:
// 	npm install jsdom optimist
//
// Execution:
// 	node (scriptname) --file=./path/to/file.html
//

var jsdom = require('jsdom'),
    argv = require('optimist').argv;

if (!argv.file) {
	throw new Error("--file must be specified");
}

// List of replacements for common things. Bad quoting, etc.
var sanitizeReplacements = {
	'…' : '...',
	'&nbsp;' : ' ',
	'<p>' : '\n',
	'</p>' : '\n',
	'<b>' : '**',
	'</b>' : '**',
	'<i>' : '*',
	'<i[^>]+>' : '*',
	'</i>' : '*',
	'<em>' : '*',
	'</em>' : '*',
	'<strong>' : '**',
	'</strong>' : '**',
	'<br.?>' : "\n",
	'<ul class="unstyled" data-ct_section_name="social">.*</ul>' : '',
	'<a id="more"></a>' : '',
	'<a href="([^"]+)">([^<]+)</a>' : '[$2]($1)',
	'<a href="([^"]+)"[^>]+>([^<]+)</a>' : '[$2]($1)',
	'<a href="([^"]+)"><span[^>]+>([^<]+)</span></a>' : '[$2]($1)',
	'<a href="([^"]+)" target="_self">([^<]+)</a>' : '[$2]($1)',
	'<a href="([^"]+)".*><img.*src="([^"]+)"></a>' : '\n\n![$1]($1)\\ \n\n',
	'<div[^d]+dava-image-id="([^"]+)"> </div>' : '\n\n![$1]($1)\\ \n\n',
	'<div data-type="image" contenteditable="false" class="onion-image image inline size-big crop-original" data-image-id="([0-9]+)" data-size="big" data-crop="original"> <div>' : '\n\n![$1](images/film//$1.jpg)\\ \n\n',
	'<div data-type="image" class="[a-z\-\ 0-9]+" data-image-id="([0-9]+)" data-size="big" data-crop="original">': '\n\n![$1](images/film//$1.jpg)\\ \n\n',
  '<div data-type="image" class="[a-z\-\ 0-9]+" data-image-id="([0-9]+)" data-size="big" data-crop="original" data-format="([a-z]+)" contenteditable="false">': '\n\n![$1](images/film//$1.$2)\\ \n\n',
	'<p.*>' : '\n',
	'<span.*>' : '',
	'</span>' : '',
	'<div.*>' : '',
	'</div>' : '',
	'\n\n\n' : '\n\n'
};

// Extract all images
function images(s) {
	var re = /<a href="([^"]+)"[^>]+><img.*src="[^"]+"><\/a>/gmi;
	var x = s.match(re);
	var r = [ ];
	var re2 = /<a href="([^"]+)"[^>]+>/;
	for (var i=1; i<x.length; i++) {
		r.push(re2.exec(x[i])[1]);
	}
	return r;
}

// Sanitize text of post
function sanitize(s) {
	var t = s;
	Object.keys(sanitizeReplacements).forEach(function(key) {
		var val = sanitizeReplacements[key];
		t = t.replace(new RegExp(key, 'gmi'), val);
	});
	return t;
}

// Convert to Octopress filename convention
function convertToFileName(s) {
	var c = s.split('/');
	return c[0] + '-' + c[1] + '-' + c[2] + '-' + c[3] + '.md';
}


jsdom.env({
	file: argv.file,
	scripts: [
		'http://code.jquery.com/jquery.js'
	],
	done: function(errors, window) {
		var $ = window.$;

		// Get, sanitize, and print the actual entry
		//$('link[rel=canonical]').attr('href', function(idx, elem) {
		//	console.log('SLUG : ' + convertToFileName(elem.split('www.ginandtacos.com/')[1]));
		//});
		$('meta[property="og:title"]').attr('content', function(idx, elem) {
			console.log('## ' + elem);
			console.log('');
		});
		$('meta[property="og:url"]').attr('content', function(idx, elem) {
			console.log(' * Originally located at ' + elem);
		});
		$('section.article-text').each(function(idx, elem) {
			//console.log('IMAGES:');
			//console.log(images($(elem).html()));
			//console.log('CONTENT:');
			console.log(sanitize($(elem).html()));
		});
	}
});
