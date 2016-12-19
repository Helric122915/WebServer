#!/usr/bin/env python

import MySQLdb

db = MySQLdb.connect("localhost","monitor","smartfan","temps")
curs = db.cursor()

curs.execute("SELECT * FROM tempdat")

print "\nDATE		TIME		Zone		Temperature"
print "============================================================"

for reading in curs.fetchall():
  print str(reading[0]) + "	" + str(reading[1])+"		"+\
		str(reading[2]) + "		" + str(reading[3])
