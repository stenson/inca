// npm dependencies
var express = require("express")
  , colors = require("colors")
  , tern = require("./tern")

// node libs
  , path = require("path")
  , url = require("url")
  , fs = require("fs")

// app globals
  , prefix = ""
  , port = 8083
  , app;

// logic
var pages = {
  welcome: function(req, res) {
    req.params.page = "index";
    pages.dynamic("index", req, res, "");
  },

  standard: function(req, res, next) {
    var url = req.params[0].split(".");

    if (url[1]) { // has a file extension, not capable of changing prefix
      next();
    } else {
      var ps = url[0].slice(1).split("/");

      (path.existsSync(ps[0]))
        ? pages.dynamic(ps.slice(1).join("/"), req, res, ps[0]+"/")
        : pages.dynamic(ps.join("/"), req, res, "");
    }
  },

  dynamic: function(url, req, res, pfix) {
    for (var q in req.query) {
      if (req.query[q] === "false") req.query[q] = false; // "false" is false
    }

    setResourcePaths(pfix);
    res.render(url, { settings: req.query });
  },
};

function setResourcePaths(pfix) {
  prefix = pfix; // set it globally for subsequent requests resulting from page load
  app.set("views", prefix + "mustaches");
  app.use(express.static(prefix + "public"));
}

function mustacheError() {
  return console.log(
    "\n\n", "~~~ you don't have any mustaches!".blue, "\n",
    "~~~ run 'inca init' to get this party started.".green, "\n\n"
  );
}

function run() {
  if (!path.existsSync("mustaches")) return mustacheError();

  // stop
  app = express.createServer();
  app.set("view engine", "mustache");
  app.register(".mustache", tern);
  setResourcePaths();

  // look
  app.get("/", pages.welcome);
  app.get("*", pages.standard);

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