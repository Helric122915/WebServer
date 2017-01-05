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
});

database.connect();

function ManualData(Manual_Direction, Manual_Fan_Speed){
  this.Manual_Direction = Manual_Direction;
  this.Manual_Fan_Speed = Manual_Fan_Speed;
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

//app.get('/', function(request, response) {
//  response.sendFile(__dirname + '/test.html');
//})

app.get('/GetOp', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  
  database.query('SELECT mode FROM OpData WHERE entry_id=1 LIMIT 1', function(err,rows,fields){
    opMode = rows[0]['mode'];

    var json = JSON.stringify({
      data:opMode
    });

    response.end(json);
  })
})

app.post('/PostOp', function(request,response) {
  var opMode = request.body.data;

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
        response.send('Database error');
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
         response.send('Database error');
     });
  }
  else
     response.send('Error, data could not be parsed properly');
});

app.get('/GetSchedule', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});

  var json = JSON.stringify({
    //data:scheduleData
  });

  response.end(json);
})

app.post('/PostSchedule', function(request, response) {
  // define variables

  // if (variables are defined)
  // update schedule class and send success
  // else send failure
});

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
        response.send('Database Error');
    });
  }
  else
    response.send('Error, data could not be parsed properly');
});

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
        response.send('Database error');
    });
  }
  else
    response.send('Error, data could not be parsed properly');
});

app.listen(port, function(err) {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log('Listening on port: ' + port)
})
