'use strict';
/**
 * Transfer list deadline
 * @author spambot, ryanli
 */

Foxtrick.modules['TransferDeadline'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transferSearchResult', 'playerDetails', 'transfer', 'bookmarks'],
	CSS: Foxtrick.InternalPath + 'resources/css/transfer-deadline.css',

	run: function(doc) {
		// Check if deadline already set
		if (doc.getElementsByClassName('ft-deadline').length > 0)
			return;

		if (Foxtrick.isPage(doc, 'transferSearchResult'))
			this.runTransferResult(doc);
		else if (Foxtrick.isPage(doc, 'playerDetails'))
			this.runPlayerDetail(doc);
		else if (Foxtrick.isPage(doc, 'transfer'))
			this.runPlayerList(doc);
		else if (Foxtrick.isPage(doc, 'bookmarks'))
			this.runTransferResult(doc);
	},

	change: function(doc) {
		if (Foxtrick.isPage(doc, 'playerDetails'))
			this.runPlayerDetail(doc);
		else if (Foxtrick.isPage(doc, 'bookmarks'))
			this.runTransferResult(doc);
	},

	processNode: function(node, htTime) {
		var doc = node.ownerDocument;
		var dateNode = Foxtrick.hasClass(node, 'date') ? node :
			node.getElementsByClassName('date')[0];
		if (!dateNode)
			return;
		var deadline;
		if (dateNode.hasAttribute('x-ht-date')) {
			// node displays local time instead of HT time as modified
			// in LocalTime, HT time is saved in attribute x-ht-date
			deadline = new Date();
			deadline.setTime(dateNode.getAttribute('x-ht-date'));
		}
		else
			deadline = Foxtrick.util.time.getDateFromText(dateNode.textContent);

		if (deadline) {
			var countdown = Math.floor((deadline.getTime() - htTime) / 1000);
			if (!isNaN(countdown) && countdown >= 0) {
				var countdownNode = doc.createElement('span');
				countdownNode.className = 'smallText ft-deadline nowrap';
				countdownNode.textContent = '(' +
					Foxtrick.util.time.timeDifferenceToElement(doc, countdown).textContent + ')';
				Foxtrick.makeFeaturedElement(countdownNode, this);
				node.appendChild(countdownNode);
			}
		}
	},

	runTransferResult: function(doc) {
		var htDate = Foxtrick.util.time.getHtDate(doc);
		var htTime = htDate.getTime();
		var dates = doc.getElementsByClassName('date');
		for (var i = 0; i < dates.length; ++i)
			this.processNode(dates[i], htTime);
	},

	runPlayerList: function(doc) {
		var htDate = Foxtrick.util.time.getHtDate(doc);
		var htTime = htDate.getTime();
		var i = 0;
		var MAIN = Foxtrick.getMainIDPrefix();
		var idPrefix = MAIN + 'lstBids_ctrl';
		var element;
		while ((element = doc.getElementById(idPrefix + (i++) + '_jsonDeadLine')))
			this.processNode(element, htTime);
	},

	runPlayerDetail: function(doc) {
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		var htDate = Foxtrick.util.time.getHtDate(doc);
		var htTime = htDate.getTime();
		var selltime_elm;
		try {
			var div = Foxtrick.Pages.Player.getBidInfo(doc);
			var alert = div.getElementsByClassName('alert')[0];
			selltime_elm = alert.getElementsByTagName('p')[0];
		}
		catch (e) {
			// these may not be present
		}
		if (!selltime_elm)
			return;

		// remove old deadlines
		var oldDeadline = selltime_elm.getElementsByClassName('ft-deadline');
		for (var i = 0; i < oldDeadline.length; ++i)
			oldDeadline[i].parentNode.removeChild(oldDeadline[i]);

		this.processNode(selltime_elm, htTime);
	}
};
