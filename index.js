var WebSocketServer = require('ws').Server;

var SERVER_PORT = 8080;               // port number for the webSocket server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;          // list of connections to the server


var serialport = require('serialport');// include the library
   SerialPort = serialport.SerialPort; // make a local instance of it
   // get port name from the command line:
   portName = process.argv[2];
// Then you open the port using new() like so:

var myPort = new SerialPort(portName, {
   baudRate: 115200,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\n")
 });

	myPort.on('open', showPortOpen);
	// myPort.on('data', sendSerialData);

	myPort.on('data', function (data) {
	  console.log('Data:', data);
	});

	function showPortOpen() {
   		console.log('port open. Data rate: ' + myPort.options.baudRate);
	}
	 
	function sendSerialData(data) {
	   console.log("sending to serial: ", data);
		myPort.write(data);
	}


	wss.on('connection', handleConnection);
	 
	function handleConnection(client) {
	 console.log("New Connection"); // you have a new client
	 connections.push(client); // add this client to the connections array
	 
	 client.on('message', sendSerialData); // when a client sends a message,
	 
	 client.on('close', function() { // when a client closes its connection
	 console.log("connection closed"); // print it out
	 var position = connections.indexOf(client); // get the client's position in the array
	 connections.splice(position, 1); // and delete it from the array
	 });
	}


// 	// This function broadcasts messages to all webSocket clients
// 	function broadcast(data) {
// 	 for (myConnection in connections) {   // iterate over the array of connections
// 	  connections[myConnection].send(data); // send the data to each connection
// 	 }
// }

// function saveLatestData(data) {
//    console.log(data);
//    // if there are webSocket connections, send the serial data
//    // to all of them:
//    if (connections.length > 0) {
//      broadcast(data);
//    }
// }