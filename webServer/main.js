var http = require('http');
var fs = require('fs');

//connect to mysql
var mysql=require('mysql');
var connection=mysql.createConnection({
	host : 'localhost',
	user : 'sensor2',
	password : 'Qw123456!@#$',
	database : 'capstone'
});

connection.connect();

var dateTime=require('node-datetime');

var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for(var k in interfaces){
	for(var k2 in interfaces[k]){
		var address = interfaces[k][k2];
		if(address.family=== 'IPv4' && !address.internal){
			addresses.push(address.address);
		}
	}
}

var server = http.createServer(function (req, resp) {
	//console.log(req.url);
	var str = req.url.split('?');
	//console.log(str[0], str[1]);
	var redIndex = new Array(50);
	for (var i = 0; i < 50; i++)
		redIndex[i] = 0;

	console.log("******* HERE ********" + req.url);
	if (req.url == "/create") {
	//	console.log(pgResp);
		/*fs.readFile("./button.html", function (error, pgResp) {
		//	console.log(pgResp);
			if (error) {
				resp.writeHead(404);
				resp.write('Contents are not found');
			}
			else {
				resp.writeHead(200, { 'Content-Type': 'text/html' });
				resp.write(pgResp);
			}
			resp.end();
		});*/
		resp.write('<div style="padding-top: 100px; padding-left: 100px">');

		/*
		resp.write('<button id="Refresh" onclick="button_reflesh();" style="height: 150px; width: 150px; margin: 20px 10px 20px 10px; padding: 100px 100px 50px 100px"> Reflesh </button>');

		resp.write('<script language="javascript">');
		resp.write('function button_reflesh() { } </script>');
		resp.write('<br>');*/	

	//	var redIndex = new Array(50);
	//
		var connected = 0;
		var qstr1='SELECT * from tbl ORDER by time desc limit 50';
		connection.query(qstr1, function(err, rows, fields) {
			if(err) {
				throw err;
			}
			//console.log("DB!");
			connected = 1;
			var cnt = 1;
			for (var k in rows) {
				//console.log('rows['+k+'].amount_trash: '+rows[k].amount_trash);
				if (rows[k].amount_trash > 65.0) {
					//console.log('****' + rows[k].floor + ':' + rows[k].bin_no);
					redIndex[(rows[k].floor-1) * 10 + rows[k].bin_no] = 1;
					var i = rows[k].floor * 10 + rows[k].bin_no;
					//resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');

				}
				else {
					redIndex[(rows[k].floor-1) * 10 + rows[k].bin_no] = 0;
					var i = rows[k].floor * 10 + rows[k].bin_no;
					//resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');

				}
			}
			//console.log('****** Connected *******');
			for (var i = 50; i >= 1; i--) {
			//console.log(redIndex[i]);
			if (redIndex[i] == 1) {
				//console.log('red');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			else if (redIndex[i] == 0){
				//console.log('green');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			if (i % 10 == 1)
				resp.write('<br>');
		}
		resp.write('</div>');	
		});
		//for(var i = 1; i <= 50; i++) {
		//	console.log('redIndex['+i+']: '+redIndex[i]);
		//}
		//
		//console.log('check redIndex[i]s');
		/*for (var i = 1; i <= 50; i++) {
			console.log(redIndex[i]);
			if (redIndex[i] == 1) {
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			else if (redIndex[i] == 0){
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			if (i % 10 == 0)
				resp.write('<br>');
		}
		resp.write('</div>');	*/

		resp.write('<button id="route" onclick="button_route(51);" style="height: 150px; width: 150px; margin: 20px 10px 20px 10px; padding: 100px 30px 50px 100px"> Route </button>');

		resp.write('<script language="javascript">');
		resp.write('function button_click(s) { \
			var digit1; var digit2;	\
			if ((s % 10 == 0) ) {digit1 = (s / 10); digit2 = 10;} \
			else {digit1 = (s / 10 + 1); digit2 = s % 10;} \
			location.href="/show_graph?" + Math.floor(digit1) + ":" + (digit2); } </script>');
		resp.write('<br>');


		resp.write('<script language="javascript">');
		resp.write('function button_route(s) { location.href="/show_route" } </script>');
		//resp.write('<br>');
		//resp.write('</body></html>');
	}



	/***********************************************

					Routing Process

	************************************************/
	else if(str[0] == "/show_route") {
		var begin = -1, end = -1;
		var routeInput = req.url.split(':');

		console.log(routeInput[0] + ' : ' + routeInput[1]);
		if(routeInput[0].indexOf('?') != -1) {
			var input = routeInput[0].split('?');
			console.log(input[1] + ' : ' + routeInput[1]);
			begin = input[1];
			end = routeInput[1];
		}
		console.log('Routing');	
		resp.write('<html><head><title>Routing</title></head><body>');
		resp.write('routing');
		resp.write('<div style="padding-top: 100px; padding-left: 100px">');

		/*
		resp.write('<button id="Refresh" onclick="button_reflesh();" style="height: 150px; width: 150px; margin: 20px 10px 20px 10px; padding: 100px 100px 50px 100px"> Reflesh </button>');

		resp.write('<script language="javascript">');
		resp.write('function button_reflesh() { } </script>');
		resp.write('<br>');*/	

	//	var redIndex = new Array(50);
	//
		var connected = 0;
		var qstr1='SELECT * from tbl ORDER by time desc limit 50';
		connection.query(qstr1, function(err, rows, fields) {
			if(err) {
				throw err;
			}
			//console.log("DB!");
			connected = 1;
			var cnt = 1;
			for (var k in rows) {
				//console.log('rows['+k+'].amount_trash: '+rows[k].amount_trash);
				if (rows[k].amount_trash > 65.0) {
				//	console.log('****' + rows[k].floor + ':' + rows[k].bin_no);
					redIndex[(rows[k].floor-1) * 10 + rows[k].bin_no] = 1;
					var i = (rows[k].floor-1) * 10 + rows[k].bin_no;
					//resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');

				}
				else {
					redIndex[(rows[k].floor-1) * 10 + rows[k].bin_no] = 0;
					var i = (rows[k].floor-1) * 10 + rows[k].bin_no;
					//resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');

				}
			}
			//console.log('****** Connected *******');
			for (var i = 50; i >= 1; i--) {
			//console.log(redIndex[i]);
			if (redIndex[i] == 1) {
			//	console.log('red');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ', ' + redIndex[i] + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			else if (redIndex[i] == 0){
			//	console.log('green');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ', ' + redIndex[i] + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			if (i % 10 == 1)
				resp.write('<br>');
			}
			resp.write('</div>');
			if(begin != -1 && end != -1) {	// start routing
				console.log('Begin, End!');
				var yPos = new Array(51);
				var xPos = new Array(51);
				var binNum = 1;
				yPos[0] = Math.floor((begin-1) / 10 + 1);
				xPos[0] = (begin-1) % 10 + 1;
				for(var i = 1; i <= 50; i++) {
					if(i == begin || i == end)	continue;
					if(redIndex[i] == 1) {
						yPos[binNum] = Math.floor((i-1) / 10 + 1);
						xPos[binNum++] = (i-1) % 10 + 1;
					}
				}
				yPos[binNum] = Math.floor((end-1) / 10 + 1);
				xPos[binNum++] = (end-1) % 10 + 1;
				for(var i = 0; i < binNum; i++) {
					console.log(yPos[i] + ' ' + xPos[i]);
				}
				var adjMatrix = new Array(binNum);
				var cache = new Array(binNum);
				var bestChoice = new Array(binNum);
				var path = new Array(binNum);
				var cntPath = 0, sumCost = 0, cnt = 0, INF = 9999999, floorCost = 9;

				distance = function(y1, x1, y2, x2) {
					if(y1 != y2)	
						return Math.abs(y1-y2) * floorCost + x1 + x2;
					else
						return Math.abs(x1-x2);
				}
				TSP = function(cur, visited) {
					if(visited == (1 << binNum) - 1)	return 0;
					if(cache[cur][visited] != 0)	return cache[cur][visited];
					cache[cur][visited] = INF;
					for(var next = 0; next < binNum; next++) {
						if(visited & (1 << next))	continue;
						if(adjMatrix[cur][next] == 0)	continue;
						var cost = TSP(next, visited | (1 << next)) + adjMatrix[cur][next];
						if(cost < cache[cur][visited]) {
							cache[cur][visited] = cost;
							bestChoice[cur][visited] = next;
						}
					}
					return cache[cur][visited];
				}
				findPath = function(cur, visited) {
					if(visited == (1 << binNum) - 1)	return;
					var next = bestChoice[cur][visited];
					path[cntPath++] = next;
					sumCost += adjMatrix[cur][next];
					findPath(next, visited | (1 << next));
				}
				for(var i = 0; i < binNum; i++) {
					adjMatrix[i] = new Array(binNum);
					adjMatrix[i][i] = 0;
				}
				for(var i = 0; i < binNum; i++) {
					cache[i] = new Array(65536);
					bestChoice[i] = new Array(65536);
					for(var j = 0; j < 65536; j++) {
						cache[i][j] = 0;
						bestChoice[i][j] = 0;
					}
				}
				
				for(var i = 0; i < binNum-1; i++) {
					for(var j = i+1; j < binNum; j++) {
						var dist = distance(yPos[i], xPos[i], yPos[j], xPos[j]);
						adjMatrix[i][j] = adjMatrix[j][i] = dist;
					}
				}
				var ans = TSP(0, 1);
				console.log('ans: ', ans);
				path[0] = 0;
				cntPath = 1;
				findPath(0, 1);
				console.log("path: ");
				for(var i = 0; i < cntPath; i++) {
					console.log(path[i]);
				}
				console.log("cost: ", sumCost);
				
				resp.write('<div style="padding-top: 100px; padding-left: 100px">');
				
				var pathIndex = new Array(51);
				for (var i = 0; i < binNum; i++) {
					pathIndex[i] = (yPos[i] - 1) * 10 + xPos[i];
				}

				for (var i = 50; i >= 1; i--) {
					var flag = -1;
					for (var j = 0; j < binNum; j++) {
						if (pathIndex[j] == i)
							flag = j + 1;
					}

					if (flag > 0) {
						resp.write('<button id="b' + i + '" onclick="button_click('+ i + ', ' + redIndex[i] + ');" style="color:white; font-size: 30pt; background-color:#0066CC; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> ' + flag + '</button>');
					}
					else {
						resp.write('<button id="b' + i + '" onclick="button_click('+ i + ', ' + redIndex[i] + ');" style="height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
					}
					if (i % 10 == 1)
						resp.write('<br>');
				}	
			
				resp.write('</div>');

			}
		});
	
		resp.write('<button id="route" onclick="button_route(51);" style="height: 150px; width: 150px; margin: 20px 10px 20px 10px; padding: 100px 30px 50px 100px"> Route </button><br>');

		resp.write('<script language="javascript"> var buttonClicked = 0, begin = -1, end = -1;');
		resp.write('function button_click(s, red) \
				{ if(!red) { alert("Click a red bin"); } \
				  else { alert("Fine");  \
					  if(!buttonClicked) { \
						  begin = s; buttonClicked = 1; \
						} else { end = s; } } \
				  alert("begin: " + begin + " end: " + end);\
				  if(begin != -1 && end != -1) {	\
					location.href = "/show_route?"+begin+":"+end;	\
				  }	\
				} </script>');
		//var sample = require("./sample");
		//resp.write('<script> console.log("Please");	</script>');
		//resp.write('<script> var fs=require("fs"); fs.writeFileSync("./input.txt", "Hello", "utf8"); </script>');
		//fs.writeFileSync("./input.txt", "Hello", "utf8");
		//var input = fs.readFileSync('input.txt', 'utf8');
		//console.log(input);
		//sample.a();
		//resp.write('<script language="javascript" src="routing.js"> </script>'); 
		/*var buttonClicked = 0, begin = -1, end = -1;');
		resp.write('function button_click(s, red) \
		{ if(!red) { alert("Click a red bin"); } \
				  else { alert("Fine");  \
					  if(!buttonClicked) { \
						  begin = s; buttonClicked = 1; \
						} else { end = s; } } \
				  alert("begin: " + begin + " end: " + end);\
		}');*/
		//resp.write('');
		//console.log('begin: ' + begin + 'end: ' + end);
		/*if(begin != -1 && end != -1) {	// start routing
			console.log('Begin, End!');
			var yPos = new Array(51);
			var xPos = new Array(51);
			var binNum = 0;
			for(var i = 1; i <= 50; i++) {
				if(redIndex[i] == 1) {
					yPos[binNum] = (i-1) / 10 + 1;
					xPos[binNum++] = (i-1) % 10 + 1;
				}
			}
			for(var i = 0; i < binNum; i++) {
				console.log(yPos[i] + ' ' + xPos[i]);
			}
		}*/
		resp.write('<script language="javascript">');
		resp.write('function button_route(s) { location.href="/show_route"}</script>');
		resp.write('</body></html>');
	}
	else if(str[0] =="/show_graph") {
		var floor = str[1].split(':');
			console.log(floor[0]);
			console.log(floor[1]);
			var html = fs.readFile("./graph1.html", function (error, html) {
				html = " "+html;
				console.log('read file');
				var qstr='SELECT * from tbl where floor='+floor[0]+' and bin_no='+floor[1]+' ORDER BY time desc limit 50';
				connection.query(qstr,function(err,rows,fields){
					if(err) throw err;
					var data="";
					var comma = "";
					for(var i=0; i<rows.length;i++){
						r=rows[i];
						var date=new Date(r.time).toLocaleString().split(' ');
						var month=date[1];

						if(month=='May'){
							month=4;
						}
						else if(month=='June'){
							month=5;
						}
						//console.log(month);
						//console.log(date[2]);
						//console.log(date[3]);
						//console.log(date);
						//var ymd=date[0].split('-');
						var hms=date[4].split(':');

						console.log("[new Date("+date[3]+","+month+","+date[2]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.amount_trash+"]");
						data+=comma+"[new Date("+date[3]+","+month+","+date[2]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.amount_trash+"]";
						comma=",";
					}
					var header = "data.addColumn('datetime','Date/Time');";
					header+="data.addColumn('number','trash_amount');";
			//		console.log(header);
			//		console.log(data);
					html=html.replace("<%COLUMN%>",header);
					html=html.replace("<%DATA%>",data);
					resp.writeHead(200, { 'Content-Type': 'text/html' });
					resp.write(html);
					resp.end();

			//	if (error) {
			//		resp.writeHead(404);
			//		resp.write('Contents are not found');
			//	}
			//	else {
			//		resp.writeHead(200, { 'Content-Type': 'text/html' });
			//		resp.write(html);
			//	}
				//resp.end();
			});
		});
	}
	else {
		resp.writeHead(200, { 'Content-Type': 'text/html' });
		resp.write('<h1>Product Manager</h1><br /><br />To create product please enter: ' + req.url);
		resp.end();
	}
});

server.listen(5050);
console.log('Server Started listening on 5050');
