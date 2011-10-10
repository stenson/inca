// npm dependencies
var express = require("express");
var colors = require("colors");

// node stdlibs
var path = require("path");
var fs = require("fs");

var pages = {
  welcome: function(req, res) {
    req.params.page = "index";
    pages.dynamic(req, res);
  },

  dynamic: function(req, res) {
    var jsons = {};
    fs.readdirSync("json").forEach(function(file) {
      jsons[file.split(".")[0]] = JSON.parse(fs.readFileSync("json/"+file, "utf-8"));
    });

    if (path.existsSync("helpers.js")) {
      eval(fs.readFileSync("helpers.js", "utf-8"));
      if (helpers) {
        for (var h in helpers) {
          jsons[h] = helpers[h];
        }
      }
    }

    console.log("rendering "+req.params.page);
    res.render(req.params.page, { locals: jsons });
  }
};

function mustacheError() {
  return console.log(
    "\n\n",
    "~~~ you don't have any mustaches!".blue,
    "\n",
    "~~~ run 'inca init' to get this party started.".green,
    "\n\n"
  );
}

function run() {
  if (!path.existsSync("mustaches")) return mustacheError();

  var app = express.createServer();
  var port = 8083;

  // stop
  app.set("view engine", "mustache");
  app.set("views", "mustaches");
  app.register(".mustache", require("./tern"));
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