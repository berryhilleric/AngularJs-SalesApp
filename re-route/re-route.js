var path = window.location.pathname.toString().split("/");
console.log("path length: " + path.length);
console.log("before filter: ");
console.log(path);
for (var i = 0; i < path.length; i++)
    if (path[i] == "")
        path.splice(i, 1);
console.log("path length: " + path.length);
console.log("after filter: ");
console.log(path);
var route = path[path.length - 1];

window.location.href = "https://localhost/Sales/?route=" + route;