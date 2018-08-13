
# RFID JS USB Reader

Scan and read RFID tags through HID USB, passes the tag code read from Python to a local webserver and update content in the browser associated with the tag.  

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. Notes for deployment to a live system WIP

### Prerequisites

What things you need to install the software and how to install them

npm

xcode (if you get an error try running sudo xcode-select --reset)

node-gyp lib available globally before you npm install (sudo if needed)
```
npm install node-gyp -g
```

### Installing

A step by step series of examples that tell you how to get a development env running

Install project dependencies

```
npm install
```

Launch web/ socket server

```
npm start
```

Launch RFID serial port reader

```
node app
```

Tested this with the GEN2 RFID ME USB reader. https://www.mtigroup.com/rfidme/


## Deployment

WIP


