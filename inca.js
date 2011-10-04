// npm dependencies
var express = require("express");
var colors = require("colors");

// node stdlibs
var exec = require("child_process").exec;
var fs = require("fs");

// constants
var dirs = ["json", "mustaches", "public"];

function welcome(req, res) {
  res.render("index");
}

function cullMustaches(req, res) {
  var jsons = {};
  fs.readdirSync("json").forEach(function(file) {
    jsons[file.split(".")[0]] = JSON.parse(fs.readFileSync("json/"+file, "utf-8"));
  });

  res.render(req.params.page, { locals: jsons });
}

var commands = {
  // the web-server command (i.e. no command at all)
  run: function() {
    var app = express.createServer();
    var port = 8083;

    // stop
    app.set("view engine", "mustache");
    app.set("views", "mustaches");
    app.register(".mustache", require("./tern"));
    app.use(express.static("public"));

    // look
    app.get("/", welcome);
    app.get("/:page", cullMustaches);

    // & listen
    app.listen(port);

    // report!
    console.log("~~~ Welcome to Inca! ~~~".green);
    console.log("~~~ The server is currently running at localhost:8083 ~~~".blue);
    console.log("~~~ Ctrl-C to stop the server ~~~".red);
  },

  init: function() {
    console.log("\n\n\twriting directories...\n\n".red);
    dirs.map(function(dir) {
      exec("mkdir "+dir);
    });
  },

  cleanup: function() {
    console.log("\n\n\tremoving directories...\n\n".red);
    dirs.map(function(dir) {
      exec("rmdir "+dir);
    });
  }
};

module.exports = {
  exec: function(args) {
    var cmd = args[2];
    commands[cmd]
      ? commands[cmd]()
      : commands.run();
  }
};