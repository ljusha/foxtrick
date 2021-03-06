'use strict';
/**
 * inject.js
 * Utilities for injecting CSS/JavaScript in a page
 * @author convincedd, ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.inject = {};

Foxtrick.util.inject.cssLink = function(doc, url) {
	if (Foxtrick.arch == 'Sandboxed') {
		var id = url.match(/([^\/]+)\.css$/)[1];
		Foxtrick.util.load.get(url)('success', function(text) {
			Foxtrick.util.inject.css(doc, text, id);
		});
		return;
	}
	var head = doc.getElementsByTagName('head')[0];
	var link = doc.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('media', 'all');
	link.setAttribute('href', url);
	head.appendChild(link);

	return link;
};

Foxtrick.util.inject.css = function(doc, css, id) {
	var sourceName = 'ft.' + id + '.css';
	var head = doc.getElementsByTagName('head')[0];
	var style = doc.createElement('style');
	style.setAttribute('type', 'text/css');
	style.id = id;
	head.appendChild(style);

	var inject = function(css) {
		style.textContent = css + '\n\n/*# sourceURL=' + sourceName + ' */\n';
	};
	Foxtrick.util.css.replaceExtensionDirectory(css, inject);

	return style;
};

// attaches a JavaScript file to the page
// dynamically injected from chrome only
Foxtrick.util.inject.jsLink = function(doc, url) {
	var id = url.match(/([^\/]+)\.js$/)[1];
	Foxtrick.util.load.get(url)('success', function(text) {
		Foxtrick.util.inject.js(doc, text, id);
	});
};

// attaches a JavaScript snippet to the page
Foxtrick.util.inject.js = function(doc, js, id) {
	var sourceName = 'ft.' + id + '.js';
	var head = doc.getElementsByTagName('head')[0];
	var script = doc.createElement('script'); // dynamically injected from chrome only
	script.setAttribute('type', 'text/javascript');
	script.id = id;
	script.textContent = js + '\n\n//# sourceURL=' + sourceName + '\n';
	head.appendChild(script);
	return script;
};
