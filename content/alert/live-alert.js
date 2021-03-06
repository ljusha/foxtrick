'use strict';
/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

Foxtrick.modules['LiveAlert'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.ALERT,
	PAGES: ['matchesLive'],
	OPTIONS: ['Sound', 'home', 'away', 'own'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false, false, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS: [false, true, true, true],
	OPTION_EDITS_DATAURL_IS_SOUND: [false, true, true, true],

	store: {},

	run: function(doc) {
		this.alert(doc);
		var results = Foxtrick.getMBElement(doc, 'UpdatePanelPopupMessages');
		Foxtrick.onChange(results, this.alert.bind(this));
	},

	onChange: function(doc) {
		this.alert(doc);
	},

	getScoreFromTab: function(tab) {
		try {
			var doc = tab.ownerDocument;
			if (tab.getElementsByClassName('liveTabScore').length > 0) {
				var score = tab.getElementsByClassName('liveTabScore')[0].textContent;
				if (score === '')
					return;
				var scoreRe = /(\d+)\s*-\s*(\d+)/;
				var scoreMatch = score.match(scoreRe);
				if (!Foxtrick.util.layout.isRtl(doc))
					return [parseInt(scoreMatch[1], 10), parseInt(scoreMatch[2], 10)];
				else
					return [parseInt(scoreMatch[2], 10), parseInt(scoreMatch[1], 10)];
			}
			return null;
		}
		catch (e) {
			Foxtrick.log('Cannot parse score \'', score, '\'');
			return null;
		}
	},

	getTeamsFromTab: function(tab) {
		var links = tab.getElementsByTagName('a');
		if (links.length) {
			// expanded tab with team names as links
			links = Foxtrick.Pages.Match.getTeams(tab.ownerDocument);
			return Foxtrick.map(function(link) {
				return link.textContent;
			}, links);
		}
		else {
			var teams = tab.lastChild.textContent;
			teams = teams.trim();
			return teams.split(' - ');
		}
	},

	alert: function(doc) {
		var tabs = doc.getElementsByClassName('liveTabText');
		for (var i = 0; i < tabs.length; ++i) {
			var tab = tabs[i];
			var score = this.getScoreFromTab(tab);
			if (score === null)
				continue;

			var teams = this.getTeamsFromTab(tab);
			var teamsText = teams[0] + '-' + teams[1]; // used as index
			if (typeof this.store[teamsText] === 'undefined') {
				this.store[teamsText] = score;
				continue;
			}
			var homeScored = this.store[teamsText][0] < score[0];
			var awayScored = this.store[teamsText][1] < score[1];
			if (homeScored || awayScored) {
				// score has changed, alert
				var own = Foxtrick.modules.Core.TEAM.shortTeamName;
				var ownScored = own && (
					own == teams[0] && homeScored ||
					own == teams[1] && awayScored
				);

				this.store[teamsText] = score;
				// show notification
				var txt = '%h %H - %A %a'.replace(/%h/, teams[0]).replace(/%H/, score[0]).
					replace(/%A/, score[1]).replace(/%a/, teams[1]);
				var url = doc.location.href;
				var noop = function(response) {};

				Foxtrick.util.notify.create(txt, url, noop, { id: teamsText });
				// play sound if enabled
				if (Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'Sound')) {
					var sound = null;

					if (ownScored &&
					    Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'own'))
						sound = Foxtrick.Prefs.getString('module.LiveAlert.own_text');
					else if (homeScored &&
					         Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'home'))
						sound = Foxtrick.Prefs.getString('module.LiveAlert.home_text');
					else if (awayScored &&
					         Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'away'))
						sound = Foxtrick.Prefs.getString('module.LiveAlert.away_text');

					if (sound)
						Foxtrick.playSound(sound, doc);
				}
			}
		}
	}
};
