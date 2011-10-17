// npm dependencies
var express = require("express");
var colors = require("colors");
var tern = require("./tern");

// node stdlibs
var path = require("path");
var fs = require("fs");

var pages = {
  welcome: function(req, res) {
    req.params.page = "index";
    pages.dynamic(req, res);
  },

  dynamic: function(req, res) {
    res.render(req.params.page, {
      settings: req.query
    });
  }
};

function mustacheError() {
  return console.log(
    "\n\n", "~~~ you don't have any mustaches!".blue, "\n",
    "~~~ run 'inca init' to get this party started.".green, "\n\n"
  );
}

function run() {
  if (!path.existsSync("mustaches")) return mustacheError();

  var app = express.createServer();
  var port = 8083;

  // stop
  app.set("view engine", "mustache");
  app.set("views", "mustaches");
  app.register(".mustache", tern);
  app.use(express.static("public"));

  // look
  app.get("/", pages.welcome);
  app.get("/:page", pages.dynamic);

  // & listen
  app.listen(port);

  // report!
  console.log("~~~ Welcome to Inca! ~~~".green);
  console.log("~~~ The server is currently running at localhost:8083 ~~~".blue);
  console.log("~~~ Ctrl-C to stop the server ~~~".red);
}

module.exports = {
  exec: function(args) {
    var commands = require("./commands");
    commands.run = run;

    var cmd = args[2];
    commands[cmd] ? commands[cmd]() : commands.run();
  }
};