#!/usr/bin/env python

import MySQLdb

db = MySQLdb.connect("localhost","monitor","smartfan","fandb")
curs = db.cursor()

with db:
  curs.execute("""INSERT INTO variables
	values(CURRENT_DATE(),NOW(),'kitchen',21.7)""")

db.close()
