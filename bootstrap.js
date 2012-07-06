/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var _gLoader;

Cu.import("resource://gre/modules/Services.jsm");

function isFennecNative() {
  let appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
  return (appInfo.ID == "{aa3c5121-dab2-40e2-81ca-7ea25febc110}");
};
		

// load prefs into default prefs branch
function setDefaultPrefs(pathToDefault, branch) {
	// Load default preferences and set up properties for them
	let defaultBranch = Services.prefs.getDefaultBranch(branch);
	let scope =
	{
		pref: function(key, val)
		{
			if (key.substr(0, branch.length) != branch)
			{
				Cu.reportError(new Error("Ignoring default preference " + key + ", wrong branch."));
				return;
			}
			key = key.substr(branch.length);
			switch (typeof val) {
			  case "boolean":
				defaultBranch.setBoolPref(key, val);
				break;
			  case "number":
				defaultBranch.setIntPref(key, val);
				break;
			  case "string":
				defaultBranch.setCharPref(key, val);
				break;
			}
		}
	};
	Services.scriptloader.loadSubScript(pathToDefault, scope);
};


// bootstrap.js API
var windowListener = {
	onOpenWindow: function(aWindow) {
		// Wait for the window to finish loading
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		domWindow.addEventListener("load", function() {
				domWindow.removeEventListener("load", arguments.callee, false);
				_gLoader.loadIntoWindow(domWindow);
			}, false);
	},
	onCloseWindow: function(aWindow) { },
	onWindowTitleChange: function(aWindow, aTitle) { }
};

function startup(aData, aReason) {
	var pathToDefault = aData.resourceURI.spec + "defaults/preferences/foxtrick.js"
	const branch = "extensions.foxtrick.prefs.";
	setDefaultPrefs(pathToDefault, branch);

	_gLoader = {};
	if (isFennecNative())
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/bootstrap-fennec.js", _gLoader, "UTF-8");
	else
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/bootstrap-firefox.js", _gLoader, "UTF-8");
	
	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	// Load into any existing windows
	let enumerator = wm.getEnumerator("navigator:browser");
	while (enumerator.hasMoreElements()) {
		let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
		_gLoader.loadIntoWindow(win);
	}

	// Load into any new windows
	wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
	// When the application is shutting down we normally don't have to clean
	// up any UI changes made
	if (aReason == APP_SHUTDOWN)
		return;

	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

	// Stop listening for new windows
	wm.removeListener(windowListener);

	// Unload from any existing windows
	let windows = wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements()) {
		let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		_gLoader.unloadFromWindow(domWindow);
	}
	_gLoader = undefined;
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}