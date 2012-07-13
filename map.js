var geoip = require('geoip-lite');
var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);

app.listen(8080);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

console.log("To view the map visit http://localhost:8080");

process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', function (chunk) {
  var login_success_regexp = /Login successful./;
  var login_failed_regexp = /Login failed/;

  if(login_success_regexp.test(chunk) || login_failed_regexp.test(chunk)){
    if(login_success_regexp.test(chunk)){
      var account_and_camera_regexp = /USER (\w*):/;
      var action = 'login';
    } else if (login_failed_regexp.test(chunk)){
      var account_and_camera_regexp = /USER (\w*)/;
      var action = 'login_failed';
    }

    var username = account_and_camera_regexp.exec(chunk)[1];

    var ip_address_regexp = /\[((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\]/;
    var ip_address = ip_address_regexp.exec(chunk)[1];

    var geo = geoip.lookup(ip_address);

    var update = new Object;
    update.username = username;
    update.ip_address= ip_address;
    update.ll = geo.ll;
    update.action = action;
    io.sockets.emit('update', update);
  }
});
