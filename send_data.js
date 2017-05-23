var express = require('express')
var app = express()
var fs = require('fs')

// Connect to mysql
var mysql = require('mysql')
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'sensor2',
	password : 'Qw123456!@#$',
	database : 'capstone'
});

connection.connect();	

//To Write the current time.
var dateTime = require('node-datetime');

//To Get IP addr.
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

count=0; // the number of input temperature data after start server.

//Work with http call command
//Write the trash record in local txt file and DB.
app.get('/', function(req,res){
	
	//Send the current time and the amount of trash to Client.
	if(req.query.temp && typeof req.query.temp!='undefined') {

		var dt = dateTime.create();
		var formatted = dt.format('Y-m-d H:M:S');
		res.send(formatted+' Trash:'+req.query.temp);
		console.log(formatted+' Trash:'+req.query.temp);
	
		//Write to local TXT file.
		fs.appendFile('log_trash.txt',req.query.temp+' '+formatted+'\n', function(err){
			if(err) throw err;
		});
			
		data={};
		/*data.seq=count++;
		data.type='T';		//Means 'Temperature'
		data.device='102';	
		data.unit='0';
		data.ip=addresses;
		data.value=req.query.temp;
		*/
		data.time = formatted;
		data.amount_trash = req.query.temp;
		data.bin_no = Math.floor(Math.random() * 10 + 1);
		data.floor = Math.floor(Math.random() * 5 + 1);

		//Insert data to DB by query 
		connection.query('INSERT INTO tbl SET ?',data,function(err,rows,cols){
			if(err) throw err;
		
			console.log('Done Insert Query');	
		});
	}
	else{
		res.send('Unauthorized Access');
	}
})

//Work with dump command
//Show recent 1440(one day) trash records.

app.get('/dump',function(req,res){
	//Get Recent data from DB by query
	connection.query('SELECT * from tbl',function(err,rows,cols){
		if(err)	throw err;
		res.write('<html><head><title>The Amount of Trash in Trash Bin</title></head><body>');	
		res.write('<p><h1>Measured Amount of Trash @ AS 714, Sogang Univ.</h1></p>');
		res.write('<p>Developed By Cobalt Blue Team</p>');	
		var dt = dateTime.create();
		var formatted = dt.format('Y-m-d H:M:S');
		res.write('<p>Dump '+rows.length+' data at '+formatted+'</p>');
		
		//Parse data to send Client

		//Send text-plain data
		/*var dumpdata = '';	
		for(var i=0; i<rows.length;i++){
			var row = rows[i];
			dumpdata=dumpdata+i+'\t: Time:'+row.time+'\t Temp:'+row.temperature+'\n';
		}
		res.set('Content-Type','text/plain');
		res.send(dumpdata);
		*/
		
		//Send HTML table
		res.write('<table border="1">');
		res.write('<tr><th>Seq.</th><th>Time</th><th>Trash</th></tr>');
		for(var i=0;i<rows.length;i++){
			var row=rows[i];
			res.write('<tr>');
			res.write('<td>'+i+'</td><td>'+row.time+'</td><td>'+row.amount_trash+'</td>');
			res.write('</tr>');
		}	
		res.end('</table></body></html>');
		console.log('Dump Complete');
	});
})

/*app.get('/graph',function(req,res){
	console.log('Got app.get(graph)');
	var html = fs.readFile('./graph1.html',function(err,html) {
		html=" "+html;
		console.log('read file');

		var qstr = 'SELECT * from table1 ORDER BY time';
		connection.query(qstr, function(err, rows, cols){
			if(err) throw err;
																						
			var data="";
			var comma = "";	
			for (var i=0; i<rows.length;i++){
				r = rows[i];	
				var date=new Date(r.time).toLocaleString().split(' ');
				//console.log(date);
				var ymd=date[0].split('-');
				var hms=date[1].split(':');
				data+=comma+"[new Date("+ymd[0]+","+ymd[1]+","+ymd[2]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.value + "]";
				comma=",";
			}
			var header = "data.addColumn('date','Date/Time');";
			header+="data.addColumn('number','Temp');";
			html=html.replace("<%COLUMN%>",header);
			html=html.replace("<%DATA%>",data);

			res.writeHeader(200,{"Content-Type": "text/html"});
			res.write(html);
			res.end();			
		});
	});
})*/

app.listen(5000, function(){
	//console.log('Temperature Measuring Program listening on port 5000')
	console.log('Program that Measures The Amount of Trash listening on port 5000')
})
