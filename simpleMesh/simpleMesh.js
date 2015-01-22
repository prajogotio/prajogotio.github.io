document.addEventListener("DOMContentLoaded", function(){
	var g = document.getElementById('display').getContext('2d');
	var adj = [
		{x: 0, y: 0, z: 0},
		{x: 1, y: 0, z: 0},
		{x: 0, y: 1, z: 0},
		{x: 0, y: 0, z: 1},
		{x: 1, y: 1, z: 0},
		{x: 0, y: 1, z: 1},
		{x: 1, y: 0, z: 1},
		{x: 1, y: 1, z: 1},
	];
	var points = [
		{x: 0, y: 0, z: 0},
		{x: 200, y: 0, z: 0},
		{x: 0, y: 200, z: 0},
		{x: 0, y: 0, z: 200},
		{x: 200, y: 200, z: 0},
		{x: 0, y: 200, z: 200},
		{x: 200, y: 0, z: 200},
		{x: 200, y: 200, z: 200},
	];
	var plane = {
		n: {x:0, y:0, z:1}, 
		c: {x:0, y:0, z:0}
	};
	var proj = [];
	renderMeshProjection(g, points, plane, proj, adj);
	setInterval(function(){
		for(var i = 0;i<points.length;++i){
			rotate(points[i],2.3/360*Math.PI, 1.2/360*Math.PI, 2.5/360*Math.PI);
		}
		g.clearRect(0,0,1000,600);
		renderMeshProjection(g, points, plane, proj, adj);
	}, 1000/60);
});

function normalize(vector){
	var v = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
	if(v == 0) return;
	vector.x /= v;
	vector.y /= v;
	vector.z /= v;
}

function renderMeshProjection(g, points, plane, proj, adj){
	normalize(plane.n);
	proj = [];
	for(var i=0;i<points.length;++i){
		var k = (plane.c.x - points[i].x) * plane.n.x +
				(plane.c.y - points[i].y) * plane.n.y +
				(plane.c.z - points[i].z) * plane.n.z;
		var res = {
			x : points[i].x + k * plane.n.x,
			y : points[i].y + k * plane.n.y,
			z : points[i].z + k * plane.n.z,
		};
		proj.push(res);
		g.fillRect(res.x + 500, res.y + 250, 3, 3);
	}
	for (var i=0;i<proj.length;++i){
		var k = proj[i].z;

	}
	for (var i=0;i<adj.length;++i){
		for (var j=i+1;j<adj.length;++j){
			var cnt = 0;
			if(adj[i].x != adj[j].x) ++cnt;
			if(adj[i].y != adj[j].y) ++cnt;
			if(adj[i].z != adj[j].z) ++cnt;
			if(cnt == 1){
				g.beginPath();
				g.moveTo(proj[i].x + 500, proj[i].y + 250);
				g.lineTo(proj[j].x + 500, proj[j].y + 250);
				g.stroke();

			}
		}
	}
}

function rotate(point, alpha, beta, theta){
	var res = {
		x : point.x,
		y : point.y * Math.cos(alpha) - point.z * Math.sin(alpha),
		z : point.y * Math.sin(alpha) + point.z * Math.cos(alpha), 
	};
	point.x = res.x * Math.cos(beta) + res.z * Math.sin(beta);
	point.y = res.y;
	point.z = -res.x * Math.sin(beta) + res.z * Math.cos(beta);
	res.x = point.x * Math.cos(theta) - point.y * Math.sin(theta);
	res.y = point.x * Math.sin(theta) + point.y * Math.cos(theta);
	res.z = point.z;
	point = res;
}