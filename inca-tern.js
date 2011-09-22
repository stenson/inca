var express = require("express");
var colors = require("colors");
var fs = require("fs");
var exec = require("child_process").exec

function welcome(req, res) {
  res.render("index");
}

function mustachio(req, res) {
  var jsons = {};

  fs.readdirSync(__dirname + "/json").forEach(function(file) {
    jsons[file.split(".")[0]] = JSON.parse(fs.readFileSync(__dirname+"/json/"+file, "utf-8"));
  });

  res.render(req.params.page, { locals: jsons });
}

var app = express.createServer();
var port = 8083;

// stop
app.set("view engine", "mustache");
app.set("views", __dirname + "/mustaches");
app.register(".mustache", require("stache"));
app.use(express.static(__dirname + "/public"));

// look
app.get("/", welcome);
app.get("/:page", mustachio);

// & listen
app.listen(port);

exec("open http://localhost:8083");