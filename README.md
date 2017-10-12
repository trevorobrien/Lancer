Simple startup project using NPM scripts to get your project setup.

Run NPM Install
Then poke are package.json to see basic modules.

npm start will run a server instance
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.0.20:8080
Hit CTRL-C to stop the server

npm run build
Will run tests, minify and move assets to dist folder.

#The App Flow

User scans RFID tag
The Ardunio Uno passes the tag ID to serial port.
The ID is received in Node which passes to the EvryThng API
