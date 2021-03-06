from __future__ import print_function
from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import EditorParser
import os
import json
import getpass

try:
	input = raw_input
except NameError:
	pass

def login(username, password):
	#use stage for now
	ht = HattrickWeb(username, password, stage=True)
	try:
		ht.login()
	except Exception as e:
		return False, None

	return True, ht;

def getList(username, password):
	success, ht = login(username, password)
	if success:
		ht.open("/Community/Crew/default.aspx")
		ht.setFormValue("ctl00$ctl00$CPContent$CPMain$ucLeagues$ddlLeagues", -1)
		ht.setFormValue("ctl00$ctl00$CPContent$CPMain$ddlWorkerTypes", 48)
		editorParser = EditorParser.EditorParser()
		editorParser.feed(ht.body)
		return editorParser.get()
	else:
		print('Login failed!')
		return []

def saveJson(list, filename):
	file = open( filename, "w")
	file.write('{\n')
	file.write('\t"type": "%s",\n' % "editor")
	file.write('\t"internal": "true",\n')
	file.write('\t"list": [\n')
	file.write('\t\t' + ',\n\t\t'.join(['{ "id": %d, "name": "%s" }' % (a["id"], a["name"].encode('utf-8')) for a in list]))
	file.write('\n\t]\n}')
	file.close()
	print(filename, 'written')

def run(username, password):
	editors = getList(username, password);
	editors = sorted(editors, key=lambda x: x["name"])
	if len(editors):
		saveJson(editors, os.path.expanduser('~/trunk/res/staff/editor.json'))

if __name__ == "__main__":
	user = input("Login:");
	pw = getpass.getpass("Password:");
	run(user, pw);
