var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, resp) {
	//console.log(req.url);
	var str = req.url.split('?');
	//console.log(str[0], str[1]);
	if (req.url == "/create") {
		fs.readFile("./button.html", function (error, pgResp) {
			if (error) {
				resp.writeHead(404);
				resp.write('Contents are not found');
			}
			else {
				resp.writeHead(200, { 'Content-Type': 'text/html' });
				resp.write(pgResp);
			}
			resp.end();
		});
	}

	else if(str[0] =="/show_graph"){
			fs.readFile("./button2.html", function (error, pgResp) {
			if (error) {
				resp.writeHead(404);
				resp.write('Contents are not found');
			}
			else {
				resp.writeHead(200, { 'Content-Type': 'text/html' });
				resp.write(pgResp);
			}
			resp.end();
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
