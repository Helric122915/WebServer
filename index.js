var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var port = 80

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

function fanData(Room_Temp, Fan_Speed){
  this.Room_Temp = Room_Temp;
  this.Fan_Speed = Fan_Speed;
}

var data = new fanData("73", "3600");

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
})

app.get('/CurrentFanData', (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  
  var json = JSON.stringify({
    Class:data
  });
  
  response.end(json);
})

app.post('/UpdateFanData', function(request, response) {
  var Room_Temp = request.body.Room_Temp;
  var Fan_Speed = request.body.Fan_Speed;
  
  data = new fanData(Room_Temp, Fan_Speed);
  
  response.send('Success');
});
