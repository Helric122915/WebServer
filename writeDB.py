#!/usr/bin/env python

import MySQLdb

db = MySQLdb.connect("localhost","monitor","smartfan","fandb")
curs = db.cursor()

with db:
  curs.execute("SELECT direction, fanSpeed FROM ManualData WHERE entry_id = 1 LIMIT 1")

  row = curs.fetchone()

  while row is not None:
    print(row)
    row = curs.fetchone()

  #curs.execute("""REPLACE INTO ManualData (entry_ID,direction,fanSpeed)
  #	VALUES(1,'Clockwise',25)""")
  #curs.execute("""INSERT INTO ManualData (direction,fanSpeed)
  #	VALUES('Clockwise',37)""")
  #curs.execute("DELETE FROM ManualData WHERE entry_id=2")

db.close()
