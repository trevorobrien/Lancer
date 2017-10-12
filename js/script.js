//var socket = new io.Socket('localhost:8000');
var socket = io.connect('http://localhost:8000')
socket.connect();

socket.on('message', function(data){
  console.log('data' +data)
  console.log('hello form web')

  document.getElementById('textdiv').innerHTML = "" + data;

	if( data ) {
		tagScanned(data)
	}


});

function tagScanned(data) {
	
	 // return (data == null || data.length === 0);
	 document.getElementById('textdiv').innerHTML = "Tag Scanned: <BR>" + data;

	 setTimeout(function () {
	   if (data == '36017171717') {
	     // window.location = "./prod1/prod1.htm";
	     // document.getElementById("yourIFrameid").style.display = "none";
	 	hideProd1()
	   }
	   else if (data == '480485251991723154129') {
	     // window.location = "./prod2/prod2.htm";
	     hideProd2()
	   }
	 }, 3500);

}


function hideProd1(){
	document.getElementById("product1").classList.remove('op-0')
	document.getElementById('main').className += ' invisible';

	setTimeout(function () {
	    document.getElementById('product1').className += ' op-0';
	    document.getElementById('main').classList.remove('invisible');
	    document.getElementById('textdiv').innerHTML = "Tag Scanned: <BR> WAITING FOR RFID THREAD";

	}, 3500);
}


function hideProd2(){
	    document.getElementById("product2").classList.remove('op-0')
	document.getElementById('main').className += ' invisible';

	setTimeout(function () {
	    document.getElementById('product2').className += ' op-0';
	    document.getElementById('main').classList.remove('invisible');
	    document.getElementById('textdiv').innerHTML = "Tag Scanned: <BR> WAITING FOR RFID THREAD";
	}, 3500);
}
