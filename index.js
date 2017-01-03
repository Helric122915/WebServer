// use "sudo fuser -k PORTNUM/tcp" to release the port if improperly exited

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

function fanData(Op_Mode, Direction, Manual_Fan_Speed){
  this.Op_Mode = Op_Mode
  this.Direction = Direction;
  this.Manual_Fan_Speed = Manual_Fan_Speed;
}

var data = new fanData("No_Mode", "Clockwise", "33");

//app.get('/', function(request, response) {
//  response.sendFile(__dirname + '/test.html');
//})

app.get('/CurrentFanData', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  
  var json = JSON.stringify({
    Class:data
  });
  
  response.end(json);
})

app.post('/UpdateFanData', function(request, response) {
  var Op_Mode = request.body.Op_Mode
  var Direction = request.body.Direction;
  var Manual_Fan_Speed = request.body.Manual_Fan_Speed;
  
  if (typeof Op_Mode !== 'undefined' && typeof Direction !== 'undefined' && typeof Manual_Fan_Speed !== 'undefined')
  {
    data = new fanData(Op_Mode, Direction, Manual_Fan_Speed);
    response.send('Success');
  }
  else
  {
    response.send('Error, data could not be parsed properly');
  }
});

app.listen(port, function(err) {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log('Listening on port: ' + port)
})
