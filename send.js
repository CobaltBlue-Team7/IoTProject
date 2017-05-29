var express = require('express')
var app = express()
var fs = require('fs')

// Connect to mysql
var mysql = require('mysql')
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'sensor2',
	password : 'cse20121608',
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



var initial_amount = new Array(5);
for(var i=0; i<5; i++){
	initial_amount[i] = new Array(10);
	/*for(var j=0;j<initial_amount[i].length;j++){
		initial_amount[i][j]=(Math.random()*30.0)+20;
	}*/
}

connection.query('select * from tbl order by pid desc limit 50',function(err,rows,fields){
	if(err) throw err;
	for (var k in rows) {
		var j=Math.floor(k/10);
		var floor= 4-j;	var bin_no=9-k%10;
		initial_amount[floor][bin_no]=rows[k].amount_trash;
		console.log(rows[k].amount_trash);
	}
});

	

var increase_amount = [4.8,5.3,15.6,1.1,2.3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


count=0; // the number of input temperature data after start server.

//Work with http call command
//Write the trash record in local txt file and DB.
app.get('/', function(req,res){
	
	//Send the current time and the amount of trash to Client.
	if(req.query.temp && typeof req.query.temp!='undefined') {

		var dt = dateTime.create();
		var formatted = dt.format('Y-m-d H:M:S');
		res.send(formatted+' Trash:'+req.query.temp);
	
	

		data={};
	
		// insert data from trash bin #1 in the 1st floor into DB
		data.time = formatted;
		data.amount_trash = req.query.temp;
		data.bin_no = 1;
		data.floor = 1;

		//Insert data to DB by query 
		connection.query('INSERT INTO tbl SET ?',data,function(err,rows,cols){
			if(err) throw err;
		
			console.log('Done Insert Query for trash bin #1 in the 1st floor');	
		});
		
		// create random data and
		// insert data from other trash bins into DB 
		data.time = formatted;
		

		for(var floor = 1; floor <= 5; floor++) {
			for(var bin_no = 1; bin_no <= 10; bin_no++) {
				//data={};
				//data.time=formatted;
				if(floor == 1 && bin_no == 1)	continue;
				data.bin_no = bin_no;
				data.floor = floor;
				// data.amount_trash를 랜덤하게 채우는 부분 구현해야 함
				var index=Math.floor(Math.random()*39)+1;
				initial_amount[floor-1][bin_no-1]=initial_amount[floor-1][bin_no-1]+increase_amount[index];
				data.amount_trash=initial_amount[floor-1][bin_no-1];
				console.log('floor = ? bin_no = ?',floor-1,bin_no-1);
				//Insert data to DB by query 
				connection.query('INSERT INTO tbl SET ?',data,function(err,rows,cols){
					if(err) throw err;
				});
				console.log(floor-1,bin_no-1,initial_amount[floor-1][bin_no-1]);
				if(initial_amount[floor-1][bin_no-1]>90.0)
					initial_amount[floor-1][bin_no-1]=0.0;
			}
		}
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

app.get('/graph',function(req,res){
	
	console.log('Got app.get(graph)');
	var html = fs.readFile('./graph1.html',function(err,html) {
		html=" "+html;
		console.log('read file');

		var qstr = 'SELECT * from tbl where floor=1 and bin_no=5 ORDER BY time desc limit 500';
		connection.query(qstr, function(err, rows, fields){
			if(err) throw err;
																						
			var data="";
			var comma = "";	
			for (var i=0; i<rows.length;i++){
				r = rows[i];	
				var date=new Date(r.time).toLocaleString().split(' ');
				console.log(date);
				var ymd=date[0].split('-');
				var hms=date[1].split(':');
				
				console.log("[new Date("+ymd[0]+","+ymd[1]+","+ymd[2]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.amount_trash + "]");
				data+=comma+"[new Date("+ymd[0]+","+ymd[1]+","+ymd[2]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.amount_trash + "]";
				comma=",";
			}
			var header = "data.addColumn('datetime','Date/Time');";

			header+="data.addColumn('number','trash_amount');";
			
			console.log(header);
			console.log(data);
			html=html.replace("<%COLUMN%>",header);
			html=html.replace("<%DATA%>",data);

			res.writeHeader(200,{"Content-Type": "text/html"});
			res.write(html);
			res.end();			
		});
	});
})

app.listen(5000, function(){
	console.log('Program that Measures The Amount of Trash listening on port 5000')
})
