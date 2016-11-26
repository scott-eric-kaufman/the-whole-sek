#!/usr/bin/nodejs
// LGM conversion script
//
// This should allow a downloaded copy of a LGM blog entry
// to be converted to standard Markdown format.
// It's not foolproof (far from it) and has to be iterated per file,
// but this *should* do it.
//
// github.com/jbuchbinder
//
// Installation:
// 	npm install jsdom optimist dateformat
//
// Execution:
// 	node (scriptname) --file=./path/to/file.html
//

var jsdom = require('jsdom'),
    fs = require('fs'),
    argv = require('optimist').argv,
    dateFormat = require('dateformat');

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
	'<em>' : '*',
	'</em>' : '*',
	'<strong>' : '**',
	'</strong>' : '**',
	'<br.?>' : "\n",
	'<a id="more"></a>' : '',
	'<a href="([^"]+)">([^<]+)</a>' : '[$2]($1)',
	'<a href="([^"]+)"><span[^>]+>([^<]+)</span></a>' : '[$2]($1)',
	'<a href="([^"]+)" target="_self">([^<]+)</a>' : '[$2]($1)',
	// <p style="text-align: center;"><a href="http://acephalous.typepad.com/.a/6a00d8341c2df453ef01116888bbf3970c-pi" style="display: inline;"><img alt="1" class="at-xid-6a00d8341c2df453ef01116888bbf3970c " src="http://acephalous.typepad.com/.a/6a00d8341c2df453ef01116888bbf3970c-320wi"></a>
	'<a href="([^"]+)".*><img.*src="http://acephalous.typepad.com/.a/([^"]+)-[a-z0-9]+"></a>' : '\n\n![$2](images/film//$2.jpg)\\ \n\n',
	// <a class="asset-img-link" href="http://acephalous.typepad.com/.a/6a00d8341c2df453ef017d3c71ba3d970c-popup" onclick="window.open( this.href, &#39;_blank&#39;, &#39;width=640,height=480,scrollbars=no,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0&#39; ); return false"><img alt="Lord of the rings - fellowship of the ring00001" class="asset  asset-image at-xid-6a00d8341c2df453ef017d3c71ba3d970c" src="http://acephalous.typepad.com/.a/6a00d8341c2df453ef017d3c71ba3d970c-500wi" style="display: block; margin-left: auto; margin-right: auto;" title="Lord of the rings - fellowship of the ring00001" /></a>
	'<a class="asset-img-link" href="[^"]+" onclick="[^"]+"><img alt="[^"]+" class="[^"]+" src="http://acephalous.typepad.com/.a/([a-f0-9]+)-(500wi|pi)" style="[^"]+" title="[^"]+" ?/?></a>' : '\n\n![$1](images/film//$1.jpg)\\ \n\n',
	// <a href="http://acephalous.typepad.com/.a/6a00d8341c2df453ef015391e2702a970b-popup" onclick="window.open( this.href, &#39;_blank&#39;, &#39;width=640,height=480,scrollbars=no,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0&#39; ); return false"><img alt="Superman00001" class="asset  asset-image at-xid-6a00d8341c2df453ef015391e2702a970b" src="http://acephalous.typepad.com/.a/6a00d8341c2df453ef015391e2702a970b-500wi" style="display: block; margin-left: auto; margin-right: auto;" title="Superman00001" /></a>
	'<a href="[^"]+" onclick="[^"]+"><img alt="[^"]+" class="[^"]+" src="http://acephalous.typepad.com/.a/([0-9a-f]+)-(500wi|pi)"[^>]+></a>' : '\n\n![$1](images/film//$1.jpg)\\ \n\n',
	'<a href="([^"]+)".*><img.*src="([^"]+)"></a>' : '\n\n![$1]($1)\\ \n\n',
	'<p.*>' : '\n',
	'<span.*>' : '',
	'</span>' : '',
	'<div.*>' : '',
	'</div>' : '',
	'</?blockquote>' : '',
	'\n\n\n' : '\n',
	// Get rid of author line
	'.*<a href="http://www.lawyersgunsmoneyblog.com/author/sek" title="Posts by SEK" rel="author">SEK</a>' : '',
	// Get rid of javascript trailer
	'<script type="text/javascript">.*' : '',
	'wpa2a.script_load.*' : '',
	'//--></script>' : '',
	// Kill bookmark links
	'<a href="[^"]+" rel="bookmark".*>.*</a>' : '',
	// Kill bookmark links
	'<h1 class="post-title">.*</h1>': '',
	// Only spaces
	'^\s+$': ''
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

//src: [ fs.readFileSync(__dirname + '/jquery-3.1.1.min.js').toString() ],
jsdom.env({
	file: argv.file,
	scripts: [ 'https://code.jquery.com/jquery-3.1.1.js' ],
	done: function(errors, window) {
		var $ = window.$;

		var foundTitle = false, foundUrl = false;

		// Get, sanitize, and print the actual entry
		$('link[rel=canonical]').attr('href', function(idx, elem) {
			//console.log('SLUG : ' + convertToFileName(elem.split('www.ginandtacos.com/')[1]));
		});
		// <meta property="article:published_time" content="2016-06-29T09:17:29+00:00" />
		var stamp = '';
		$('meta[property="article:published_time"]').attr('content', function(idx, elem) {
			stamp = Date.parse(elem);
		});
		$('h1[class="post-title"] a').html(function(idx, elem) {
			if (!foundTitle) {
				console.log('## ' + sanitize(elem) + ' (' + dateFormat(stamp, 'mmmm d, yyyy') + ')');
				console.log('');
			}
			foundTitle = true;
		});
		$('meta[property="og:url"]').attr('content', function(idx, elem) {
			if (!foundUrl) {
				console.log(' * Originally located at ' + elem);
			}
			foundUrl = true;
		});
		$('div.entry').each(function(idx, elem) {
			//console.log('IMAGES:');
			//console.log(images($(elem).html()));
			//console.log('CONTENT:');
			console.log(sanitize($(elem).html()));
		});
	}
});
