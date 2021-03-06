/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */
'use strict';
const { classes: Cc, interfaces: Ci, utils: Cu, manager: Cm, results: Cr } = Components;
const PATH = 'chrome://foxtrick/content/';

let _gLoader;

Cu.import('resource://gre/modules/Services.jsm');

function isFennecNative() {
	return Services.appinfo.ID == '{aa3c5121-dab2-40e2-81ca-7ea25febc110}';
}


// load prefs into default prefs branch
function setDefaultPrefs(pathToDefault, branch) {
	// Load default preferences and set up properties for them
	let defaultBranch = Services.prefs.getDefaultBranch(branch);
	let scope = {
		pref: function(key, val) {
			if (key.substr(0, branch.length) != branch) {
				Cu.reportError(new Error('Ignoring default preference ' +
				               key + ', wrong branch.'));
				return;
			}
			key = key.substr(branch.length);
			switch (typeof val) {
				case 'boolean':
					defaultBranch.setBoolPref(key, val);
					break;
				case 'number':
					defaultBranch.setIntPref(key, val);
					break;
				case 'string':
					defaultBranch.setCharPref(key, val);
					break;
			}
		}
	};
	Services.scriptloader.loadSubScript(pathToDefault, scope);
}


// bootstrap.js API
let windowListener = {
	onOpenWindow: function(aWindow) {
		// Wait for the window to finish loading
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIDOMWindow);
		domWindow.addEventListener('DOMContentLoaded', function waitForWindowload() {
			domWindow.removeEventListener('DOMContentLoaded', waitForWindowload, false);
			_gLoader.loadIntoWindow(domWindow);
		}, false);
	},
	onCloseWindow: function(aWindow) {},
	onWindowTitleChange: function(aWindow, aTitle) {}
};

function initAustralisUI() {
	try {
		Cu.import('resource:///modules/CustomizableUI.jsm');
	}
	catch (e) {
		return;
	}
	CustomizableUI.createWidget({
		id: 'foxtrick-toolbar-button',
		type: 'view',
		viewId: 'foxtrick-toolbar-view',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		label: 'Foxtrick',
		tooltiptext: 'Foxtrick',
		onCreated: function(aNode) {
			let win = aNode.ownerDocument.defaultView;
			win.Foxtrick.modules.UI._updateSingle(win);
		},
		// onViewShowing: function(ev) {
		// 	// initialize code
		// },
		// onViewHiding: function(ev) {
		// 	// cleanup code
		// }
	});
}

function startup(aData, aReason) {
	// prefs branch
	const branch = 'extensions.foxtrick.prefs.';

	_gLoader = {};

	let pathToDefault;
	// load specific startup stripts
	if (isFennecNative()) {
		// old FF loads anything that ends with .js
		// so we can't name this one foxtrick-android.js
		pathToDefault = aData.resourceURI.spec + 'defaults/preferences/foxtrick-android';
		setDefaultPrefs(pathToDefault, branch);
		Services.scriptloader.loadSubScript(PATH + 'bootstrap-fennec.js', _gLoader, 'UTF-8');
	}
	else {
		pathToDefault = aData.resourceURI.spec + 'defaults/preferences/foxtrick.js';
		setDefaultPrefs(pathToDefault, branch);
		Services.scriptloader.loadSubScript(PATH + 'bootstrap-firefox.js', _gLoader, 'UTF-8');
	}

	// Load into any existing windows
	let enumerator = Services.wm.getEnumerator('navigator:browser');
	let win;
	while (enumerator.hasMoreElements()) {
		win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
		_gLoader.loadIntoWindow(win);
	}
	if (typeof win !== 'undefined') {
		// during FF startup bootstrap runs before any windows are created,
		// hence win is undefined
		// this is not the case if FT is re-enabled from add-ons menu, though
		// probably same thing with upgrades
		win.Foxtrick.reloadAll();
	}

	// Load into any new windows
	Services.wm.addListener(windowListener);

	if (!isFennecNative()) {
		// this needs to run after existed windows were loaded into
		initAustralisUI();
	}
}

function shutdown(aData, aReason) {
	// When the application is shutting down we normally don't have to clean
	// up any UI changes made
	if (aReason == APP_SHUTDOWN)
		return;

	// Stop listening for new windows
	Services.wm.removeListener(windowListener);

	// Unload from any existing windows
	let windows = Services.wm.getEnumerator('navigator:browser');
	while (windows.hasMoreElements()) {
		let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		_gLoader.unloadFromWindow(win);
	}

	if (typeof CustomizableUI !== 'undefined') {
		// this needs to run after existed windows were loaded into
		CustomizableUI.destroyWidget('foxtrick-toolbar-button');
	}

	// Flush string bundle cache
	Services.strings.flushBundles();

	// flush jar cache
	// this should prevent cache issues
	let addOnDir = aData.installPath.clone();
	addOnDir.append('chrome');
	let jarFile = addOnDir.clone();
	jarFile.append('foxtrick.jar');
	try {
		Cu.import('resource://gre/modules/XPIProvider.jsm').flushJarCache(jarFile);
	}
	catch (e) {
		// FF30
		Cu.import('resource://gre/modules/addons/XPIProvider.jsm').flushJarCache(jarFile);
	}

	// destroy scope
	_gLoader = undefined;
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
