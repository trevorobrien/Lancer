var myPythonScriptPath = 'hid.py';
var WebSocketServer = require('ws').Server;
var http = require('http');
var io = require('socket.io');
var tagID = 'WAITING FOR RFID THREAD';

// Use python shell
var PythonShell = require('python-shell');

var pyshell = new PythonShell(myPythonScriptPath, {mode: "text", scriptPath:"./", pythonOptions: ['-u']});


// Setup the server to listen
var server = http.createServer();
	server.listen(8000);

var socket = io.listen(server);


// Listen for message from Python Script
pyshell.on('message', function(message) { 

	//set tagID to number received from python
	var tagID = message;
	var str1 = tagID.toString();
	console.log(str1)
	// tagID.join(' ');


    console.warn('EON-ID2:  ', tagID);
    if (tagID.length == 0) {
    	console.warn('empty')
	}
	else {
		console.warn('not empty')
		socket.sockets.send(tagID);
		tagID = "WAITING FOR RFID THREAD";
	} 


});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    if (err){
        throw err;
    };

    console.log('finished');
});

// listen for client connection
socket.sockets.on('connection', function (client) {
	console.warn('called on connection:  ');
	// console.log(client)
	socket.sockets.send(tagID)

})

