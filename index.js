// use "sudo fuser -k PORTNUM/tcp" to release the port if improperly exited
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var mysql = require('mysql');
var port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var database = mysql.createConnection({
  host : 'localhost',
  user : 'monitor',
  password : 'smartfan',
  database : 'fandb'
})

database.connect();

var weekdays = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
};

function OpMode(Mode){
  this.Mode = Mode
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

app.get('/GetOp', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  
  database.query('SELECT mode FROM OpData WHERE entry_id=1 LIMIT 1', function(err,rows,fields){
    var opMode = new OpMode(rows[0]['mode']);

    var json = JSON.stringify({
      data:opMode
    });

    response.end(json);
  })
})

app.post('/PostOp', function(request,response) {
  var opMode = request.body.Mode;

  if (typeof opMode !== 'undefined')
  {
    var sql = "REPLACE INTO OpData (entry_id, mode) VALUES(1,?)";
    var inserts = [opMode];

    sql = mysql.format(sql, inserts);
    database.query(sql, function(err,rows,fields)
    {
      if(!err)
        response.send('Success');
      else
        response.send('Database error: ' + err);
    });
  }
  else
    response.send('Error, data could not be parsed properly');
})

app.get('/GetManual', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});

  database.query('SELECT direction, fanSpeed FROM ManualData WHERE entry_id=1 LIMIT 1', function(err,rows,fields){
    var manualData = new ManualData(rows[0]['direction'],rows[0]['fanSpeed']);
  
    var json = JSON.stringify({
      data:manualData
    });

    response.end(json);
  })
})

app.post('/PostManual', function(request,response) {
  var Manual_Direction = request.body.Manual_Direction;
  var Manual_Fan_Speed = request.body.Manual_Fan_Speed;
  
  if (typeof Manual_Direction !== 'undefined' && typeof Manual_Fan_Speed !== 'undefined')
  {
     var sql = "REPLACE INTO ManualData (entry_id,direction,fanSpeed) VALUES(1,?,?)";
     var inserts = [Manual_Direction,Manual_Fan_Speed];

     sql = mysql.format(sql,inserts);
     database.query(sql, function(err,rows,fields)
     {
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

  var json = JSON.stringify({
    //data:scheduleData
  });

  response.end(json);
})

app.get('/GetCurrentDaySchedule', function(request, response) {
  var d = new Date();
  //var weekday = new Array(7);
  //weekday[0] = "Sunday";
  //weekday[1] = "Monday";
  //weekday[2] = "Tuesday";
  //weekday[3] = "Wednesday";
  //weekday[4] = "Thursday";
  //weekday[5] = "Friday";
  //weekday[6] = "Satruday";

  var currentDay = weekdays[d.getDay()];
  var currentTime = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString();
  
  console.log(currentDay + " " + currentTime);
})

app.post('/CreateSchedule', function(request, response){
  var Schedule_Id = request.body.Schedule_Id;
  var Begin_Time = request.body.Begin_Time;
  var End_Time = request.body.End_Time;
  var Direction = request.body.Direction;
  var Fan_Speed = request.body.Fan_Speed;
  var Day = request.body.Day;
  var Enabled = request.body.Enabled;

  var success = true;

  if (typeof Schedule_Id !== 'undefined' && typeof Begin_Time !== 'undefined' && typeof End_Time !== 'undefined' && typeof Direction !== 'undefined' && typeof Fan_Speed !== 'undefined' && typeof Day !== 'undefined' && typeof Enabled !== 'undefined')
  {
    for (i = 0; i < Day.length; i++) { 
      if (Day.charAt(i) == "Y"){
        var sql = "INSERT INTO ScheduleData (schedule_id,beginTime,endTime,direction,fanSpeed,day,enabled) VALUES (?,?,?,?,?,weekdays[i],?)";
        var inserts = [Schedule_Id,Begin_Time,End_Time,Direction,Fan_Speed,Enabled];
      
        sql = mysql.format(sql,inserts);
        database.query(sql, function(err,rows,fields)
        {
          if(err)
          {
            response.send('Database Error: ' + err);
            success = false;
          }
        });
      }
    }
                     
    //var sql = "INSERT INTO ScheduleData (schedule_id,beginTime,endTime,direction,fanSpeed,day,enabled) VALUES(?,?,?,?,?,?,?)";
    //var inserts = [Schedule_Id,Begin_Time,End_Time,Direction,Fan_Speed,Day,Enabled];

    //sql = mysql.format(sql,inserts);
    //database.query(sql, function(err,rows,fields)
    //{
    //  if(!err)
    //    response.send('Success');
    //  else
    //    response.send('Database Error: ' + err);
    //});
  }
  else
    response.send('Error, data could not be parse properly');
        
  if (!success)
    response.send('There was at least one Database Error.');
})

app.post('/DeleteSchedule', function(request, response){
  var Schedule_Id = request.body.Schedule_Id;
  var Begin_Time = request.body.Begin_Time;
  var End_Time = request.body.End_Time;
  var Direction = request.body.Direction;
  var Fan_Speed = request.body.Fan_Speed;
  var Day = request.body.Day;
  var Enabled = request.body.Enabled;

  if (typeof Schedule_Id !== 'undefined' && typeof Begin_Time !== 'undefined' && typeof End_Time !== 'undefined' && typeof Direction !== 'undefined' && typeof Fan_Speed !== 'undefined' && typeof Day !== 'undefined' && typeof Enabled !== 'undefined')
  {
    var sql = "DELETE FROM ScheduleData WHERE schedule_id = ?";
    //var inserts = [Schedule_Id,Begin_Time,End_Time,Direction,Fan_Speed,Day,Enabled];
    var inserts = [schedule_id];

    sql = mysql.format(sql,inserts);
    database.query(sql, function(err,rows,fields)
    {
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
    var oneTempData = new OneTempData(rows[0]['direction'],rows[0]['lowSpeed'],rows[0]['lowTemp'],rows[0]['highSpeed'],rows[0]['highTemp']);
    
    var json = JSON.stringify({
      data:oneTempData
    });

    response.end(json);
  })
})

app.post('/PostOneTemp', function(request, response) {
  var One_Temp_Direction = request.body.One_Temp_Direction;
  var One_Temp_Low_Speed = request.body.One_Temp_Low_Speed;
  var One_Temp_Low_Temp = request.body.One_Temp_Low_Temp;
  var One_Temp_High_Speed = request.body.One_Temp_High_Speed;
  var One_Temp_High_Temp = request.body.One_Temp_High_Temp;

  if (typeof One_Temp_Direction !== 'undefined' && typeof One_Temp_Low_Speed !== 'undefined' && typeof One_Temp_Low_Temp !== 'undefined' && typeof One_Temp_High_Speed !== 'undefined' && typeof One_Temp_High_Temp !== 'undefined')
  {
    var sql = "REPLACE INTO OneTempData (entry_id,direction,lowSpeed,lowTemp,highSpeed,highTemp) VALUES(1,?,?,?,?,?)";  
    var inserts = [One_Temp_Direction,One_Temp_Low_Speed,One_Temp_Low_Temp,One_Temp_High_Speed,One_Temp_High_Temp];
    
    sql = mysql.format(sql,inserts);
    database.query(sql, function(err,rows,fields)
    {
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
    var twoTempData = new TwoTempData(rows[0]['lowSpeed'],rows[0]['lowTemp'],rows[0]['highSpeed'],rows[0]['highTemp']);
    
    var json = JSON.stringify({
      data:twoTempData
    });

    response.end(json)
  })
})

app.post('/PostTwoTemp', function(request, response) {
  var Two_Temp_Low_Speed = request.body.Two_Temp_Low_Speed;
  var Two_Temp_Low_Temp = request.body.Two_Temp_Low_Temp;
  var Two_Temp_High_Speed = request.body.Two_Temp_High_Speed;
  var Two_Temp_High_Temp = request.body.Two_Temp_High_Temp;

  if (typeof Two_Temp_Low_Speed !== 'undefined' && typeof Two_Temp_Low_Temp !== 'undefined' && typeof Two_Temp_High_Speed !== 'undefined' && typeof Two_Temp_High_Temp !== 'undefined')
  {
    var sql = "REPLACE INTO TwoTempData (entry_id,lowSpeed,lowTemp,highSpeed,highTemp) VALUES(1,?,?,?,?)";
    var inserts = [Two_Temp_Low_Speed,Two_Temp_Low_Temp,Two_Temp_High_Speed,Two_Temp_High_Temp];

    sql = mysql.format(sql,inserts);
    database.query(sql, function(err,rows,fields)
    {
      if(!err)
        response.send('Success');
      else
        response.send('Database error: ' + err);
    });
  }
  else
    response.send('Error, data could not be parsed properly');
})

app.listen(port, function(err) {
  if (err)
    return console.log('something bad happened', err)
  console.log('Listening on port: ' + port)
})
