var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

function fanData(Room_Temp, Fan_Speed){
  this.Room_Temp = Room_Temp;
  this.Fan_Speed = Fan_Speed;
}

var data = new fanData("73", "3600");

app.get('/CurrentFanData', function(request, response) {
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

app.listen(port, function(err) {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log('Listening on port: ' + port)
})
