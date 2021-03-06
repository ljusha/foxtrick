'use strict';
/**
 * copy-ratings.js
 * Copies match ratings (HT-ML style)
 * @author spambot, ryanli
 */

Foxtrick.modules['CopyRatings'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],

	NICE: 1, // after MatchReportFormat.

	CSS: Foxtrick.InternalPath + 'resources/css/copy-ratings.css',

	run: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc))
			return;

		var table = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (!table)
			return;

		var createRatings = function(place, teams) {
			try {
				var insertBefore = null;
				if (place == 'table')
					insertBefore = doc.getElementById('oldMatchRatings');

				var team1 = (teams == 'both') || (teams == 'home');
				var team2 = (teams == 'both') || (teams == 'away');

				var _d = Foxtrick.L10n.getString('match.ratings.defence') + ':';
				var _m = Foxtrick.L10n.getString('match.ratings.midfield') + ':';
				var _a = Foxtrick.L10n.getString('match.ratings.attack') + ':';
				var _t = Foxtrick.L10n.getString('match.ratings.total') + ':';

				var headder = doc.querySelector('#mainBody h1').textContent;
				headder = headder.trim();
				var start = Foxtrick.strrpos(headder, '<span>(') + 7;
				var end = Foxtrick.strrpos(headder, ')</span>');

				var matchlink = Foxtrick.Pages.All.getBreadCrumbs(doc)[0];
				var gameid = Foxtrick.util.id.getMatchIdFromUrl(matchlink.href);
				// headder.substr(start, end-start);

				start = Foxtrick.strrpos(headder, ' - ');
				var gameresult_h = headder.substr(start - 2, 2).trim();
				var gameresult_a = headder.substr(start + 3, 2).trim();

				var ad = '\n[table]\n';
				var table = Foxtrick.Pages.Match.getRatingsTable(doc).cloneNode(true);
				for (var row = 0; row < table.rows.length; ++row) {
					if (!team1 && table.rows[row].cells.length >= 2)
						table.rows[row].cells[1].textContent = '###';
					if (!team2 && table.rows[row].cells.length >= 3)
						table.rows[row].cells[2].textContent = '###';
				}

				var youth = '';
				if (matchlink.href.search(/isYouth=true|SourceSystem=Youth/i) != -1)
					youth = 'youth';

				var HTO = '';
				if (matchlink.href.search(/SourceSystem=HTOIntegrated/i) != -1)
					HTO = 'tournament';

				var toggleTabHolder = doc.getElementsByClassName('toggleTabHolder')[0];
				var copyTextRating = Foxtrick.hasClass(doc.getElementById('sortByNumberIcon'),
				                                       'disabled') ? false : true;
				var copyNumRating = Foxtrick.hasClass(doc.getElementById('sortByTextIcon'),
				                                      'disabled') ? false : true;

				/* needs to be in mouseover or click
				var copylinks = doc.getElementsByClassName('ft_copy_rating');
				for (var j = 0; j < copylinks.length; ++j) {
					if (copyTextRating)
						copylinks.title = Foxtrick.L10n.getString('ratings.text');
					if (copyTextRating)
						copylinks.title += ' ' + Foxtrick.L10n.getString('ratings.number');
				}*/

				// head row
				ad += '[tr]\n\n[th]';
				if ((table.rows[0].cells[0])) {
					ad += '[' + youth + HTO + 'matchid=' + gameid + ']';
				}
				ad += '[/th]\n[th]';
				if (team1 && table.rows[0].cells[1]) {
					var body = doc.getElementById('mainBody');
					var teamlink = body.querySelectorAll('h1 > a, h1 > span > a')[0];
					if (teamlink)
						ad += teamlink.textContent + ((team2) ? (' - ' + gameresult_h) : '') +
							'[br][' + youth + 'teamid=' +
							Foxtrick.util.id.getTeamIdFromUrl(teamlink.href) + ']';
				}
				if (team1 && team2)
					ad += '[/th]\n[th]';
				if (team2 && table.rows[0].cells[2]) {
					var body = doc.getElementById('mainBody');
					var teamlink = body.querySelectorAll('h1 > a, h1 > span > a')[1];
					if (teamlink)
						ad += teamlink.textContent + ((team1) ? (' - ' + gameresult_a) : '') +
							'[br][' + youth + 'teamid=' +
							Foxtrick.util.id.getTeamIdFromUrl(teamlink.href) + ']';
				}
				ad += '[/th]\n\n[/tr]\n';

				for (var row = 1; row < table.rows.length; ++row) {
					try {
						ad += '[tr]\n\n[th]';
						if (table.rows[row].cells[0]) {
							ad += table.rows[row].cells[0].textContent;
						}
						ad += '[/th]\n[td]';

						/*var copyTextRating = table.rows[row].cells[1] !== undefined
										&& (table.rows[row].cells[1].getAttribute('style') == null
											|| table.rows[row].cells[1].getAttribute('style')
											.indexOf('display: none') == -1
											|| table.rows[row].cells[5].getAttribute('style')
											.indexOf('display: none') == -1);

						var copyNumRating = table.rows[row].cells[4] !== undefined
										&& (table.rows[row].cells[4].getAttribute('style') == null
											|| table.rows[row].cells[4].getAttribute('style')
											.indexOf('display: none') == -1
											|| table.rows[row].cells[6].getAttribute('style')
											.indexOf('display: none') == -1);
						*/
						if (team1) {
							if (Foxtrick.hasClass(table.rows[row], 'ft_rating_table_row'))
								ad += table.rows[row].cells[1].textContent.replace(_d, '[br]' + _d)
									.replace(_m, '[br]' + _m).replace(_a, '[br]' + _a)
									.replace(_t, '[br]' + _t);
							else {
								if (copyTextRating && table.rows[row].cells[1] !== undefined) {
									ad += table.rows[row].cells[1].textContent
										.replace(_d, '[br]' + _d).replace(_m, '[br]' + _m)
										.replace(_a, '[br]' + _a).replace(_t, '[br]' + _t);
								}
								if (copyNumRating && table.rows[row].cells[3] !== undefined) {
									ad += ' (' + table.rows[row].cells[3].textContent
									         .replace(',', '.') + ')';
								}
							}
						}
						if (team1 && team2)
							ad += '[/td]\n[td]';
						if (team2) {
							if (Foxtrick.hasClass(table.rows[row], 'ft_rating_table_row'))
								ad += table.rows[row].cells[2].textContent.replace(_d, '[br]' + _d)
									.replace(_m, '[br]' + _m).replace(_a, '[br]' + _a)
									.replace(_t, '[br]' + _t);
							else {
								if (copyTextRating && table.rows[row].cells[2] !== undefined) {
									ad += table.rows[row].cells[2].textContent
									.replace(_d, '[br]' + _d).replace(_m, '[br]' + _m)
									.replace(_a, '[br]' + _a).replace(_t, '[br]' + _t);
								}
								if (copyNumRating && table.rows[row].cells[4] !== undefined) {
									ad += ' (' + table.rows[row].cells[4].textContent + ')';
								}
							}
						}
						ad += '[/td]\n\n[/tr]\n';
					} catch (e) { Foxtrick.log(e); }
				}
				ad = ad.replace(/\[td\]###\[\/td\]/gi, '');
				ad += '\n[/table]\n';

				// copy htms prediction.
				if (team1 && team2) {
					var htmsMatchDivId = doc.getElementById('htmsMatchDivId');
					if (htmsMatchDivId) {
						ad += Foxtrick.modules['HTMSPrediction'].copy(htmsMatchDivId);
					}
				}

				Foxtrick.copyStringToClipboard(ad);
				Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('copy.ratings.copied'),
				                       'ft-ratings-copy-note', { at: insertBefore });
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		// Copy links inside the table
		var tableHeader = doc.querySelector('#oldMatchRatings .tblBox');
		var homeHeader = table.getElementsByTagName('th')[1];
		var awayHeader = table.getElementsByTagName('th')[2];

		var copyBoth = Foxtrick.createFeaturedElement(doc, this, 'span');
		copyBoth.className = 'ft_copy_rating';
		copyBoth.appendChild(doc.createTextNode(Foxtrick.L10n.getString('button.copy')));
		copyBoth.setAttribute('teams', 'both');
		copyBoth.setAttribute('place', 'table');
		Foxtrick.onClick(copyBoth, function() { createRatings('table', 'both'); });
		tableHeader.appendChild(copyBoth);

		var copyHome = Foxtrick.createFeaturedElement(doc, this, 'span');
		copyHome.className = 'ft_copy_rating';
		copyHome.appendChild(doc.createTextNode('(' + Foxtrick.L10n.getString('button.copy') + ')'));
		copyHome.setAttribute('teams', 'home');
		copyHome.setAttribute('place', 'table');
		Foxtrick.onClick(copyHome, function() { createRatings('table', 'home'); });
		homeHeader.appendChild(copyHome);

		var copyAway = Foxtrick.createFeaturedElement(doc, this, 'span');
		copyAway.className = 'ft_copy_rating';
		copyAway.appendChild(doc.createTextNode('(' + Foxtrick.L10n.getString('button.copy') + ')'));
		copyAway.setAttribute('teams', 'away');
		copyAway.setAttribute('place', 'table');
		Foxtrick.onClick(copyAway, function() { createRatings('table', 'away'); });
		awayHeader.appendChild(copyAway);

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrick.L10n.getString('copy.ratings.both'));
		if (button) {
			button.title = '';
			button = Foxtrick.makeFeaturedElement(button, this);
			Foxtrick.addClass(button, 'ft-copy-ratings ft-pop-up-container');

			var versions = ['both', 'home', 'away'];
			var list = doc.createElement('ul');
			list.className = 'ft-pop';
			for (var j = 0; j < versions.length; ++j) {
				var item = doc.createElement('li');
				var link = doc.createElement('span');
				Foxtrick.onClick(link, (function(team) {
					// to keep team variable here
					return function() { createRatings('box', team); };
				})(versions[j]));
				link.setAttribute('teams', versions[j]);
				link.textContent = Foxtrick.L10n.getString('copy.ratings.' + versions[j]);
				item.appendChild(link);
				list.appendChild(item);
			}
			button.appendChild(list);
		}
	}
};
