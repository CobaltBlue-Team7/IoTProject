var http = require('http');
var fs = require('fs');

//connect to mysql
var mysql=require('mysql');
var connection=mysql.createConnection({
	host : 'localhost',
	user : 'sensor2',
	password : 'cse20121608',
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

	console.log(req.url);
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
			console.log("DB!");
			connected = 1;
			var cnt = 1;
			for (var k in rows) {
				console.log('rows['+k+'].amount_trash: '+rows[k].amount_trash);
				if (rows[k].amount_trash > 50.0) {
					console.log('****' + rows[k].floor + ':' + rows[k].bin_no);
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
			console.log('****** Connected *******');
			for (var i = 1; i <= 50; i++) {
			console.log(redIndex[i]);
			if (redIndex[i] == 1) {
				console.log('red');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			else if (redIndex[i] == 0){
				console.log('green');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			if (i % 10 == 0)
				resp.write('<br>');
		}
		resp.write('</div>');	
		});
		//for(var i = 1; i <= 50; i++) {
		//	console.log('redIndex['+i+']: '+redIndex[i]);
		//}
		//
		console.log('check redIndex[i]s');
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
			console.log("DB!");
			connected = 1;
			var cnt = 1;
			for (var k in rows) {
				console.log('rows['+k+'].amount_trash: '+rows[k].amount_trash);
				if (rows[k].amount_trash > 50.0) {
					console.log('****' + rows[k].floor + ':' + rows[k].bin_no);
					redIndex[rows[k].floor * 10 + rows[k].bin_no] = 1;
					var i = rows[k].floor * 10 + rows[k].bin_no;
					//resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');

				}
				else {
					redIndex[rows[k].floor * 10 + rows[k].bin_no] = 0;
					var i = rows[k].floor * 10 + rows[k].bin_no;
					//resp.write('<button id="b' + i + '" onclick="button_click('+ i + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');

				}
			}
			console.log('****** Connected *******');
			for (var i = 1; i <= 50; i++) {
			console.log(redIndex[i]);
			if (redIndex[i] == 1) {
				console.log('red');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ', ' + redIndex[i] + ');" style="background-color:#f44336; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			else if (redIndex[i] == 0){
				console.log('green');
				resp.write('<button id="b' + i + '" onclick="button_click('+ i + ', ' + redIndex[i] + ');" style="background-color:#4CAF50; height: 120px; width: 80px; margin: 20px 10px 20px 10px; padding: 50px 30px 50px 30px"> Bin ' + i + '</button>');
			}
			if (i % 10 == 0)
				resp.write('<br>');
		}
		resp.write('</div>');	
		});
		//for(var i = 1; i <= 50; i++) {
		//	console.log('redIndex['+i+']: '+redIndex[i]);
		//}
		//
		console.log('check redIndex[i]s');
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

		resp.write('<button id="route" onclick="button_route(51);" style="height: 150px; width: 150px; margin: 20px 10px 20px 10px; padding: 100px 30px 50px 100px"> Route </button><br>');

		resp.write('<script language="javascript"> var buttonClicked = 0, begin = -1, end = -1;');
		resp.write('function button_click(s, red) \
				{ if(!red) { alert("Click a red bin"); } \
				  else { alert("Fine");  \
					  if(!buttonClicked) { \
						  begin = s; buttonClicked = 1; \
						} else { end = s; } } \
				  alert("begin: " + begin + " end: " + end);\
				}');

		resp.write('\
			var yPos = new Array(1, 1, 2); \
			var xPos = new Array(1, 2, 1); \
			var binNum = xPos.length+1;	\
			yPos[binNum-1] = 1;		\
			xPos[binNum-1] = 0;		\
			var binAdjMatrix = new Array(binNum);		\
			var cache = new Array(binNum);				\
			var bestChoice = new Array(binNum);			\
			var path = new Array(binNum);				\
			var cntPath = 0;							\
			var sumCost = 0;							\
			var cnt = 0;								\
			var FLOOR_COST = 100;						\
			var INFINITE = 9999999;						\
			var nodeVisited = new Array(binNum);	\
			Distance = function(firstBin_Ypos, firstBin_Xpos, secondBin_Ypos, secondBin_Xpos) {		\
				if (firstBin_Ypos != secondBin_Ypos) {		\
					return Math.abs(firstBin_Ypos - secondBin_Ypos) * FLOOR_COST + firstBin_Xpos + secondBin_Xpos;	\
				}		\
				else {	\
					return Math.abs(firstBin_Xpos - secondBin_Xpos);	\
				}	\
			} </script>');
		/*
			shortestPath = function(cur, cnt){
				var ret = INFINITE, cost;	\
				if(cnt == binNum - 2) {	\
					bestChoice[cur][cnt] = binNum-1;		\
					return binAdjMatrix[cur][binNum-1];		\
				}				\
				if(cache[cur][cnt]) {		\
					return cache[cur][cnt];	\
				}		\
				for(var next = 0; next <= binNum-2; next++) {	\
					if(!nodeVisited[next]) {					\
						nodeVisited[next] = 1;					\
						cost = binAdjMatrix[cur][next] + shortestPath(next, cnt+1);		\
						if(cost < ret) {			\
							ret = cost;				\
							bestChoice[cur][cnt] = next;	\
						}			\
						nodeVisited[next] = 0;	\
					}	\
				}	\
				cache[cur][cnt] = ret;	\
				return ret;	\
			}	*/
			
			//resp.write('findPath = function(cur, cnt) {\
			//	if(cnt == binNum-1)\
			//		return;\
			//	var next = bestChoice[cur][cnt];\
			//	path[cntPath++] = next;\
			//	console.log("cur: ", cur, " cnt: ", cnt, " next: ",  next);\
			//	console.log("cost: ", binAdjMatrix[cur][next]);\
			//	sumCost += binAdjMatrix[cur][next];\
			//	findPath(next, cnt+1);\
			//};	\
			//for (var i = 0; i < binNum; i++) {	\
				//binAdjMatrix[i] = new Array(binNum);\
				//binAdjMatrix[i][i] = 0;\
			//} \
			/*
			for (var i = 0; i < binNum; i++) {\
				nodeVisited[i] = 0;				\
				cache[i] = new Array(65536);	\
				bestChoice[i] = new Array(65536);	\
				for (var j = 0; j < 65536; j++) {	\
					cache[i][j] = 0;				\
					bestChoice[i][j] = 0;			\
				}									\
			}		\
			console.log("Raw input:");		\
			for (var i = 0; i < binNum; i++) {	\
				console.log("(", yPos[i], ",", xPos[i], ")");	\
			}	\
			for (var i = 0; i < binNum - 1; i++) {	\
				for (var j = i + 1; j < binNum; j++) {	\
					var distance = Distance(yPos[i], xPos[i], yPos[j], xPos[j]);	\
					binAdjMatrix[i][j] = distance;	\
					binAdjMatrix[j][i] = distance;	\
				}	\
			}	\
			console.log("\nAdjacent Matrix:");	\
			for (var i = 0; i < binNum; i++) {	\
				console.log(binAdjMatrix[i][0], binAdjMatrix[i][1], binAdjMatrix[i][2], binAdjMatrix[i][3]);	\
			}	\
			nodeVisited[0] = 1;	\
			console.log("\nCalculating the optimal cost");	\
			var answer = shortestPath(0, 0);		\
			console.log("total cost: ", answer);	\
			console.log("\nFinding the optimal path");		\
			path[cntPath++] = 0;		\
			findPath(0, 0);				\
			console.log("\ncntPath: ", cntPath);	\
			console.log("path: ");					\
			for (var i = 0; i < cntPath; i++) {		\
				console.log(path[i]);				\
			}		\
			console.log("cost: ", sumCost);		\
			for(var i = 0; i < cntPath; i++) {	\
				var idx = path[i];		\
				console.log("%d: (%d, %d)", i+1, yPos[idx], xPos[idx]);	\
			}	\
		</script> ');*/

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
