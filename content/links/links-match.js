'use strict';
/**
 * links-match.js
 * Foxtrick add links to played matches pages
 * @author convinced
 */

Foxtrick.modules['LinksMatch'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['match'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksMatch', [
			'playedmatchlink',
			'playedyouthmatchlink',
			'nextmatchlink',
			'matchlink'
		], callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		// get ids
		var youthmatch = Foxtrick.util.id.findIsYouthMatch(doc.location.href);
		var teamid, teamid2;

		var alldivs = doc.getElementsByTagName('div');
		var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
		var isarchivedmatch = !Foxtrick.Pages.Match.isPrematch(doc);

		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var main = Foxtrick.Pages.All.getMainHeader(doc);
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';
		var ownyouthteamid = Foxtrick.util.id.getOwnYouthTeamId();

		if (isarchivedmatch) {
			teamid = Foxtrick.Pages.Match.getHomeTeamId(doc);
			teamid2 = Foxtrick.Pages.Match.getAwayTeamId(doc);
		}
		else {
			var sidediv = Foxtrick.Pages.Match.getPreMatchSummary(doc);
			if (!sidediv) sidediv = doc.getElementById('sidebar');
			teamid = Foxtrick.util.id.findTeamId(sidediv);
			teamid2 = Foxtrick.util.id.findSecondTeamId(sidediv, teamid);
		}
		var links, links2;
		var add_links = false;
		//addExternalLinksToPlayedMatch
		if (isarchivedmatch) {
			if (youthmatch) {
				links = Foxtrick.modules['Links'].getLinks('playedyouthmatchlink', {
					'ownyouthteamid': ownyouthteamid,
					'matchid': matchid,
					'teamid': teamid,
					'teamid2': teamid2,
					'server': server
				}, doc, this); }
			else {
				links = Foxtrick.modules['Links'].getLinks('playedmatchlink', {
					'matchid': matchid,
					'teamid': teamid,
					'teamid2': teamid2
				}, doc, this);
			}
			if (links.length > 0)
				add_links = true;
		}
		//addExternalLinksToCommingMatch
		if (!isarchivedmatch && !youthmatch) {
			links = Foxtrick.modules['Links'].getLinks('nextmatchlink', {
				'matchid': matchid,
				'teamid': teamid,
				'teamid2': teamid2
			}, doc, this);
			links2 = Foxtrick.modules['Links'].getLinks('matchlink', {
				'matchid': matchid,
				'teamid': teamid,
				'teamid2': teamid2
			}, doc, this);
			if (links.length + links2.length > 0)
				add_links = true;
		}
		// add links box
		var ownBoxBody = null;
		if (add_links) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			if (links2) {
				for (var k = 0; k < links2.length; k++) {
					links2[k].link.className = 'inner';
					ownBoxBody.appendChild(links2[k].link);
				}
			}
			var box = Foxtrick.Pages.Match.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}

		// add custom links
		if (isarchivedmatch) {
			var prefset = this.MODULE_NAME + '.played';
			if (youthmatch)
				prefset = this.MODULE_NAME + '.youth.played';

			Foxtrick.util.links.add(doc, ownBoxBody, prefset, {
				'matchid': matchid,
				'teamid': teamid,
				'teamid2': teamid2
			}, true);
		}
		if (!isarchivedmatch && !youthmatch) {
			Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME + '.coming', {
				'matchid': matchid,
				'teamid': teamid,
				'teamid2': teamid2
			});
		}
	}
};
