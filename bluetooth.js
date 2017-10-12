const bluetooth = require('node-bluetooth');

// create bluetooth device instance
const device = new bluetooth.DeviceINQ();

device.listPairedDevices(console.log);

device
.on('finished',  console.log.bind(console, 'finished'))
.on('found', function found(address, name){
  console.log('Found: ' + address + ' with name ' + name);
}).inquire();


// device.findSerialPortChannel('88-6b-0f-3d-bd-e1', function(channel){
//   console.log('Found RFCOMM channel for serial port on %s: ', name, channel);

//   // make bluetooth connect to remote device
//   bluetooth.connect(address, channel, function(err, connection){
//     if(err) return console.error(err);
//     connection.write(new Buffer('Hello!', 'utf-8'));
//   });

// });

// make bluetooth connect to remote device
bluetooth.connect('88-6b-0f-3d-bd-e1', '/dev/cu.Bluetooth-Incoming-Port', function(err, connection){
  if(err) return console.error(err);

  connection.on('data', (buffer) => {
    console.log('received message:', buffer.toString());
  });

  connection.write(new Buffer('Hello!', 'utf-8'), () => {
    console.log('wrote');
  });
});