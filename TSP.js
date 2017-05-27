
// bin location
var yPos = new Array(1, 1, 2, 5, 4, 6, 9, 1, 8, 6);
var xPos = new Array(5, 3, 5, 1, 2, 6, 2, 4, 5, 1);

// the number of bins
var binNum = xPos.length;

// bin location graph (adjacent matrix)
var binAdjMatrix = new Array(binNum);
var cache = new Array(binNum);
var bestChoice = new Array(binNum);
var path = new Array(binNum);
var cntPath = 0;
var sumCost = 0;
var cnt = 0;
var FLOOR_COST = 100;
var INFINITE = 9999999;

// calculate distance between nodes
Distance = function(firstBin_Ypos, firstBin_Xpos, secondBin_Ypos, secondBin_Xpos) {
	// different floor distance
	if (firstBin_Ypos != secondBin_Ypos) {
		return Math.abs(firstBin_Ypos - secondBin_Ypos) * FLOOR_COST + firstBin_Xpos + secondBin_Xpos;
	}
	// same floor distance
	else {
		return Math.abs(firstBin_Xpos - secondBin_Xpos);
	}
}

// TSP algorithm
TSP = function(cur, visited) {
	if (visited == (1 << binNum) - 1)
		return binAdjMatrix[cur][0];

	if (cache[cur][visited] != 0)
		return cache[cur][visited];
	
	console.log("cur: ", cur, ", ", "visited: ", visited);
	cache[cur][visited] = INFINITE;


	for (var next = 0; next < binNum; next++) {
		console.log("hello1");	
		if (visited & (1 << next))
			continue;
		console.log("hello2");	
		if (binAdjMatrix[cur][next] == 0)
			continue;
	
		console.log("hello3");	
		//cache[cur][visited] = Math.min(cache[cur][visited], TSP(next, visited | (1 << next)) + binAdjMatrix[cur][next]);

		var minPath = TSP(next, visited | (1 << next)) + binAdjMatrix[cur][next];
		//cache[cur][visited] = Math.min(cache[cur][visited], minPath);
		if(minPath < cache[cur][visited]) {
			cache[cur][visited] = minPath;
			bestChoice[cur][visited] = next;
		}
	}
	console.log("min: ", cache[cur][visited]);	
	return cache[cur][visited];
}

findPath = function(cur, visited) {
	if(visited == (1 << binNum) - 1)
		return;
	var next = bestChoice[cur][visited];
	path[cntPath++] = next;
	console.log("cur: ", cur, " visited: ", visited, " next: ",  next);
	console.log("cost: ", binAdjMatrix[cur][next]);
	sumCost += binAdjMatrix[cur][next];
	findPath(next, visited | (1 << next));
}

/* Main function */

// make adjacent matrix
for (var i = 0; i < binNum; i++) {
	binAdjMatrix[i] = new Array(binNum);
	binAdjMatrix[i][i] = 0;
}

// make cache table
for (var i = 0; i < binNum; i++) {
	cache[i] = new Array(65536);
	bestChoice[i] = new Array(65536);
	for (var j = 0; j < 65536; j++) {
		cache[i][j] = 0;
		bestChoice[i][j] = 0;
	}
}

// print raw input
console.log("Raw input:");
for (var i = 0; i < binNum; i++) {
	console.log("(", yPos[i], ",", xPos[i], ")");
}

for (var i = 0; i < binNum - 1; i++) {
	for (var j = i + 1; j < binNum; j++) {
		var distance = Distance(yPos[i], xPos[i], yPos[j], xPos[j]);
		binAdjMatrix[i][j] = distance;
		binAdjMatrix[j][i] = distance;
	}
}

console.log("\nAdjacent Matrix:");
for (var i = 0; i < binNum; i++) {
	console.log(binAdjMatrix[i][0], binAdjMatrix[i][1], binAdjMatrix[i][2], binAdjMatrix[i][3], binAdjMatrix[i][4]);
}

var answer = TSP(0, 1);
console.log(answer);
path[cntPath++] = 0;
findPath(0, 1);
path[cntPath] = 0;
sumCost += binAdjMatrix[path[cntPath]][0];
console.log("path: ");
for (var i = 0; i <= cntPath; i++) {
	console.log(path[i]);
}
console.log("\n");
console.log("cost: ", sumCost);
