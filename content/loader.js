/**
 * loader.js
 * Foxtrick loader
 * @author kolmis
 */

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader);
var scripts = [
    'preferences.js',
    'const.js',
    'module.js',
    'stats.js',
    'l10n.js',

    // individual modules
    'forum/forumtemplates.js',
    'forum/forumleaveconfbutton.js',
    'forum/forumhideavatar.js',
    'forum/forummovelinks.js',
    'forum/forumstaffmarker.js',
	'forum/forumalltidflags.js',
	'forum/forumtruncatelongnicks.js',
    'matches/matches.js',
    'matches/matchOrdersFlipSides.js',
    'matches/matchOrdersFormationBox.js',
	'matches/starscounter.js',
	'shortcuts_and_tweaks/bookmarkadjust.js',
    'shortcuts_and_tweaks/flagCollectionToMap.js',
    'shortcuts_and_tweaks/mediantransferprice.js',
    'shortcuts_and_tweaks/teampopuplinks.js',
    'shortcuts_and_tweaks/transferListSearchFilters.js',
    'shortcuts_and_tweaks/youthskillnotes.js',
    'shortcuts_and_tweaks/foxtrickalert.js',
    'shortcuts_and_tweaks/facePlugin.js',
	'shortcuts_and_tweaks/showmessagebutton.js',
    'links/linksleague.js',

	    
    'modules_list.js',
    'foxtrick.js',
];

for each (var script in scripts) {
    try {
        loader.loadSubScript('chrome://foxtrick/content/' + script);
    } catch (e) {
        dump('Script loading failed - ' + script + '\n  ' + e + '\n');
    }
};

FoxtrickMain.init();
