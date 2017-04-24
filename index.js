// use "sudo fuser -k PORTNUM/tcp" to release the port if improperly exited
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var mysql = require('mysql');
var port = 3000
var ip = require('ip');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var database = mysql.createConnection({
    host : 'localhost',
    user : 'monitor',
    password : 'smartfan',
    database : 'fandb'
})

database.connect();

function Message(Message) {
    this.Message = Message;
}

var message = new Message("");

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

function Temp(Temp) {
    this.Temp = Temp;
}

function OpMode(Mode,Power,RPM){
    this.Mode = Mode;
    this.Power = Power;
    this.RPM = RPM;
}

var power = "false";

function LocationData(Address, Latitude, Longitude){
    this.Address = Address;
    this.Latitude = Latitude;
    this.Longitude = Longitude;
}

function ManualData(Manual_Direction, Manual_Fan_Speed){
    this.Manual_Direction = Manual_Direction;
    this.Manual_Fan_Speed = Manual_Fan_Speed;
}

function ScheduleData(Schedule_ID, Begin_Time, End_Time, Direction, Fan_Speed, Day, Enabled){
    this.Schedule_ID = Schedule_ID;
    this.Begin_Time = Begin_Time;
    this.End_Time = End_Time;
    this.Direction = Direction;
    this.Fan_Speed = Fan_Speed;
    this.Day = Day;
    this.Enabled = Enabled;
}

function CurrentScheduleData(Begin_Time, End_Time, Direction, Fan_Speed){
    this.Begin_Time = Begin_Time;
    this.End_Time = End_Time;
    this.Direction = Direction;
    this.Fan_Speed = Fan_Speed;
}

function OneTempData(One_Temp_Direction, One_Temp_Low_Speed, One_Temp_Low_Temp, One_Temp_High_Speed, One_Temp_High_Temp){
    this.One_Temp_Direction = One_Temp_Direction
    this.One_Temp_Low_Speed = One_Temp_Low_Speed
    this.One_Temp_Low_Temp = One_Temp_Low_Temp
    this.One_Temp_High_Speed = One_Temp_High_Speed
    this.One_Temp_High_Temp = One_Temp_High_Temp
}

function TwoTempData(Two_Temp_Low_Speed, Two_Temp_Low_Temp, Two_Temp_High_Speed, Two_Temp_High_Temp){
    this.Two_Temp_Low_Speed = Two_Temp_Low_Speed
    this.Two_Temp_Low_Temp = Two_Temp_Low_Temp
    this.Two_Temp_High_Speed = Two_Temp_High_Speed
    this.Two_Temp_High_Temp = Two_Temp_High_Temp
}

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
})

app.get('/GetTemp', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});

    database.query('SELECT temp FROM TempData WHERE entry_id=1 LIMIT 1', function(err,rows,fields) {
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var temp = new Temp(rows[0]['temp']);

	    var json = JSON.stringify({
		data:temp
	    });

	    response.end(json);
	}
	else
	    response.end('Error, no results from Database.');
    })
})

app.post('/PostTemp', function(request, response) {
    var temp = request.body.Temp;

    if (typeof temp !== 'undefined') {
	var sql = "REPLACE INTO TempData (entry_id, temp) VALUES(1,?)";
	var inserts = [temp];

	sql = mysql.format(sql, inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database error: ' + err);
	});
    }
    else
	response.send('Error, data could not be parsed properly.');
})

app.get('/GetOp', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});
    
    database.query('SELECT mode, rpm FROM OpData WHERE entry_id=1 LIMIT 1', function(err,rows,fields){
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var opMode = new OpMode(rows[0]['mode'],power,rows[0]['rpm']);

	    var json = JSON.stringify({
		data:opMode
	    });

	    response.end(json);
	}
	else
	    response.end('Error, no results from Database.');
    })
})

app.post('/PostOp', function(request,response) {
    var opMode = request.body.Mode;
    
    if (typeof opMode !== 'undefined') {
	var rpmSql = "SELECT rpm FROM OpData where entry_id = 1";
	var rpm = 0;
	
	database.query(rpmSql, function(err,rows,fields) {
	    rpm = parseInt(rows[0]['rpm']);

	    var sql = "REPLACE INTO OpData (entry_id, mode, rpm) VALUES(1,?,?)";
	    var inserts = [opMode,rpm];
	    
	    sql = mysql.format(sql, inserts);
	    database.query(sql, function(err,rows,fields) {
		if(!err)
		    response.send('Success');
		else
		    response.send('Database error: ' + err);
	    });
	});
    }
    else
 	response.send('Error, data could not be parsed properly');
})

app.post('/PostOpRPi', function(request,response) {
    var opMode = request.body.Mode;
    var rpm = request.body.RPM;
    
    if (typeof opMode !== 'undefined' && typeof rpm !== 'undefined') {
	var sql = "REPLACE INTO OpData (entry_id, mode, rpm) VALUES(1,?,?)";
	var inserts = [opMode, rpm];

	sql = mysql.format(sql, inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database error: ' + err);
	});
    }
    else
	response.send('Error, data could not be parsed properly');
})

app.post('/PostPower', function(request,response) {
    var pwr = request.body.Power;

    if (typeof pwr !== 'undefined') {
	power = pwr;

	response.send('Success');
    }
    else
	response.send('Error, data could not be parsed properly');
})

app.get('/GetAddress', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});

    database.query('SELECT address, latitude, longitude FROM AddressData WHERE entry_id=1 LIMIT 1', function(err,rows,fields) {
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var locationData = new LocationData(rows[0]['address'],rows[0]['latitude'],rows[0]['longitude']);
	    
	    var json = JSON.stringify({
		data:locationData
	    });
	    
	    response.end(json);
	}
	else
	    response.end('Error, no results from Database.');
    })
})

app.post('/PostAddress', function(request, response) {
    var Address = request.body.Address;
    var Latitude = request.body.Latitude;
    var Longitude = request.body.Longitude;

    if (typeof Address !== 'undefined' && typeof Latitude !== 'undefined' && typeof Longitude !== 'undefined') {
	var sql = "REPLACE INTO AddressData (entry_id,address,latitude,longitude) VALUES(1,?,?,?)";
	var inserts = [Address,Latitude,Longitude];

	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database error: ' + err);
	});
    }
    else
	response.send('Error, data could not be parsed properly');	
})

app.get('/GetMessage', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});

    var json = JSON.stringify({
	data:message
    });

    response.end(json);
})

app.post('/PostMessage', function(request, response) {
    var Message = request.body.Message;

    if (typeof message !== 'undefined') {
	message.Message = Message;
	response.send('Success');
    }
    else
	response.send('Error, data could not be parsed properly');
})

app.get('/GetManual', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});

    database.query('SELECT direction, fanSpeed FROM ManualData WHERE entry_id=1 LIMIT 1', function(err,rows,fields) {
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var manualData = new ManualData(rows[0]['direction'],rows[0]['fanSpeed']);
	    
	    var json = JSON.stringify({
		data:manualData
	    });

	    response.end(json);
	}
	else
	    response.end('Error, no results from Database.');
    })
})

app.post('/PostManual', function(request,response) {
    var Manual_Direction = request.body.Manual_Direction;
    var Manual_Fan_Speed = request.body.Manual_Fan_Speed;
    
    if (typeof Manual_Direction !== 'undefined' && typeof Manual_Fan_Speed !== 'undefined') {
	var sql = "REPLACE INTO ManualData (entry_id,direction,fanSpeed) VALUES(1,?,?)";
	var inserts = [Manual_Direction,Manual_Fan_Speed];

	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database error: ' + err);
	});
    }
    else
	response.send('Error, data could not be parsed properly');
})

app.get('/GetSchedule', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});

    var schedules = new Array();

    database.query("SELECT schedule_id,TIME_FORMAT(beginTime,'%H:%i'),TIME_FORMAT(endTime,'%H:%i'),direction,fanSpeed,day,enabled FROM ScheduleData ORDER BY schedule_id", function(err,rows,fields){
	if (rows) {
	    for (var row in rows) {
		var scheduleData = new ScheduleData(rows[row]['schedule_id'],rows[row]['TIME_FORMAT(beginTime,\'%H\:%i\')'],rows[row]['TIME_FORMAT(endTime,\'%H\:%i\')'],rows[row]['direction'],rows[row]['fanSpeed'],rows[row]['day'],rows[row]['enabled']);

		schedules.push(scheduleData);
	    }
	    var json = JSON.stringify({ data:schedules });

	    response.end(json);
	}
	else
	    response.end('Error, no results from Database.');
    })
})

app.get('/GetCurrentSchedule', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});  

    var d = new Date();
    var currentDay = weekday[d.getDay()];
    var currentTime = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString();
    
    var sql = "Select TIME_FORMAT(beginTime,'%H:%i'),TIME_FORMAT(endTime,'%H:%i'),direction,fanSpeed FROM ScheduleData WHERE day = ? AND enabled = 'Yes' AND beginTime < ? AND endTime > ?";
    var inserts = [currentDay,currentTime,currentTime];

    sql = mysql.format(sql,inserts);
    database.query(sql, function(err,rows,fields){
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var scheduleData = new CurrentScheduleData(rows[0]['TIME_FORMAT(beginTime,\'%H\:%i\')'],rows[0]['TIME_FORMAT(endTime,\'%H\:%i\')'],rows[0]['direction'],rows[0]['fanSpeed']);

	    var json = JSON.stringify({
		data:scheduleData
	    });

	    response.end(json);
	}
	else 
	    response.end('Error, no results from Database.');
    })
})

app.post('/CreateSchedule', function(request, response){
    var Schedule_ID = request.body.Schedule_ID;
    var Begin_Time = request.body.Begin_Time;
    var End_Time = request.body.End_Time;
    var Direction = request.body.Direction;
    var Fan_Speed = request.body.Fan_Speed;
    var Day = request.body.Day;
    var Enabled = request.body.Enabled;

    var success = true;

    var res = "Success";  

    if (typeof Schedule_ID !== 'undefined' && typeof Begin_Time !== 'undefined' && typeof End_Time !== 'undefined' && typeof Direction !== 'undefined' && typeof Fan_Speed !== 'undefined' && typeof Day !== 'undefined' && typeof Enabled !== 'undefined' && (Day.includes("N") || Day.includes("Y"))) {
	for (i = 0; i < Day.length; i++) { 
	    if (Day.charAt(i) == "Y"){
		var sql = "INSERT INTO ScheduleData (schedule_id,beginTime,endTime,direction,fanSpeed,day,enabled) VALUES (?,?,?,?,?,?,?)";
		var inserts = [Schedule_ID,Begin_Time,End_Time,Direction,Fan_Speed,weekday[i],Enabled];
		
		sql = mysql.format(sql,inserts);
		database.query(sql, function(err,rows,fields) {
		    if(err) {
			res = 'Database Error: ' + err;
			success = false;
		    }
		});
	    }
	}
    }
    else
	res = "Error, data could not be parse properly";

    response.send(res);
})

app.post('/UpdateSchedule', function(request, response){
    var Schedule_ID = request.body.Schedule_ID;
    var Begin_Time = request.body.Begin_Time;
    var End_Time = request.body.End_Time;
    var Direction = request.body.Direction;
    var Fan_Speed = request.body.Fan_Speed;
    var Day = request.body.Day;
    var Enabled = request.body.Enabled;

    var success = true;

    var res = "Success";  

    if (typeof Schedule_ID !== 'undefined') {
	var sql = "DELETE FROM ScheduleData WHERE schedule_id = ?";
	var inserts = [Schedule_ID];

	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err) {
		res = 'Success';
	    }
	    else
	    {
		success = false;
		res = 'Database Error: ' + err;
	    }
	});
    }
    else {
	success = false;
	res = 'Error, data could not be parse properly';
    }
    
    if (success && typeof Begin_Time !== 'undefined' && typeof End_Time !== 'undefined' && typeof Direction !== 'undefined' && typeof Fan_Speed !== 'undefined' && typeof Day !== 'undefined' && typeof Enabled !== 'undefined' && (Day.includes("N") || Day.includes("Y"))) {
	for (i = 0; i < Day.length; i++) { 
	    if (Day.charAt(i) == "Y"){
		var sql = "INSERT INTO ScheduleData (schedule_id,beginTime,endTime,direction,fanSpeed,day,enabled) VALUES (?,?,?,?,?,?,?)";
		var inserts = [Schedule_ID,Begin_Time,End_Time,Direction,Fan_Speed,weekday[i],Enabled];
		
		sql = mysql.format(sql,inserts);
		database.query(sql, function(err,rows,fields) {
		    if(err) {
			res = 'Database Error: ' + err;
			success = false;
		    }
		});
	    }
	}
    }
    else
	res = "Error, data could not be parse properly";

    response.send(res);
})

app.post('/ToggleSchedule', function(request, response){
    var Schedule_ID = request.body.Schedule_ID;
    var Toggle = request.body.Toggle;

    if (typeof Schedule_ID !== 'undefined' && typeof Toggle !== 'undefined' && (Toggle == "Yes" || Toggle == "No")) {
	var sql = "UPDATE ScheduleData SET enabled=?  WHERE schedule_id = ?";
	var inserts = [Toggle, Schedule_ID];

	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err) {
		if (Toggle == 'No')
		    response.send('Disabled Successfully');
		else
		    response.send('Enabled Successfully');
	    }
	    else
		response.send('Database Error: ' + err);
	});
    }  
    else
	response.send('Error, data could not be parsed properly');
})

app.post('/DeleteSchedule', function(request, response){
    var Schedule_ID = request.body.Schedule_ID;

    if (typeof Schedule_ID !== 'undefined') {
	var sql = "DELETE FROM ScheduleData WHERE schedule_id = ?";
	var inserts = [Schedule_ID];

	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database Error: ' + err);
	});
    }  
    else
	response.send('Error, data could not be parsed properly');
})

app.get('/GetOneTemp', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});
    
    database.query('SELECT direction,lowSpeed,lowTemp,highSpeed,highTemp FROM OneTempData WHERE entry_id=1 LIMIT 1', function(err,rows,fields){
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var oneTempData = new OneTempData(rows[0]['direction'],rows[0]['lowSpeed'],rows[0]['lowTemp'],rows[0]['highSpeed'],rows[0]['highTemp']);
	    
	    var json = JSON.stringify({
		data:oneTempData
	    });

	    response.end(json);
	}
	else
	    reponse.end('Error, no results from Database');
    })
})

app.post('/PostOneTemp', function(request, response) {
    var One_Temp_Direction = request.body.One_Temp_Direction;
    var One_Temp_Low_Speed = request.body.One_Temp_Low_Speed;
    var One_Temp_Low_Temp = request.body.One_Temp_Low_Temp;
    var One_Temp_High_Speed = request.body.One_Temp_High_Speed;
    var One_Temp_High_Temp = request.body.One_Temp_High_Temp;

    if (typeof One_Temp_Direction !== 'undefined' && typeof One_Temp_Low_Speed !== 'undefined' && typeof One_Temp_Low_Temp !== 'undefined' && typeof One_Temp_High_Speed !== 'undefined' && typeof One_Temp_High_Temp !== 'undefined') {
	var sql = "REPLACE INTO OneTempData (entry_id,direction,lowSpeed,lowTemp,highSpeed,highTemp) VALUES(1,?,?,?,?,?)";  
	var inserts = [One_Temp_Direction,One_Temp_Low_Speed,One_Temp_Low_Temp,One_Temp_High_Speed,One_Temp_High_Temp];
	
	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database Error: ' + err);
	});
    }
    else
	response.send('Error, data could not be parsed properly');
})

app.get('/GetTwoTemp', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});

    database.query('SELECT lowSpeed,lowTemp,highSpeed,highTemp FROM TwoTempData WHERE entry_id=1 LIMIT 1', function(err,rows,fields){
	if (typeof rows !== 'undefined' && rows.length > 0) {
	    var twoTempData = new TwoTempData(rows[0]['lowSpeed'],rows[0]['lowTemp'],rows[0]['highSpeed'],rows[0]['highTemp']);
	    
	    var json = JSON.stringify({
		data:twoTempData
	    });

	    response.end(json)
	}
	else
	    response.end('Error, no results from Database.');
    })
})

app.post('/PostTwoTemp', function(request, response) {
    var Two_Temp_Low_Speed = request.body.Two_Temp_Low_Speed;
    var Two_Temp_Low_Temp = request.body.Two_Temp_Low_Temp;
    var Two_Temp_High_Speed = request.body.Two_Temp_High_Speed;
    var Two_Temp_High_Temp = request.body.Two_Temp_High_Temp;

    if (typeof Two_Temp_Low_Speed !== 'undefined' && typeof Two_Temp_Low_Temp !== 'undefined' && typeof Two_Temp_High_Speed !== 'undefined' && typeof Two_Temp_High_Temp !== 'undefined') {
	var sql = "REPLACE INTO TwoTempData (entry_id,lowSpeed,lowTemp,highSpeed,highTemp) VALUES(1,?,?,?,?)";
	var inserts = [Two_Temp_Low_Speed,Two_Temp_Low_Temp,Two_Temp_High_Speed,Two_Temp_High_Temp];

	sql = mysql.format(sql,inserts);
	database.query(sql, function(err,rows,fields) {
	    if(!err)
		response.send('Success');
	    else
		response.send('Database error: ' + err);
	});
    }
    else
	response.send('Error, data could not be parsed properly');
})

app.listen(port, function(request,response,err) {
    if (err)
	return console.log('something bad happened', err)
    console.log('Listening on port: ' + port + ' at IP: ' + ip.address())
})
