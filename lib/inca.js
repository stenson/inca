// npm dependencies
var express = require("express")
  , colors = require("colors")
  , tern = require("./tern")

// node libs
  , path = require("path")
  , url = require("url")
  , fs = require("fs")

// app globals
  , port = 8083
  , mountedProjects = []
  , app;

// logic
var pages = {
  welcome: function(req, res) {
    req.params.page = "index";
    pages.dynamic("index", req, res, "");
  },

  projectList: function(req, res) {

    res.render("index", { 'projects': mountedProjects.map(function(project) { return { project: project }; }),
                          settings: {},
                          layout: false });
  },

  standard: function(req, res, next) {
    var url = req.url.split(".");

    console.log("url is %s", req.url);

    var ps = url[0].slice(1).split("/");


    if (url[1]) { // has a file extension, not capable of changing prefix
      next();
    } else {
      (path.existsSync(ps[0]))
        ? pages.dynamic(ps.slice(1).join("/"), req, res, ps[0]+"/")
        : pages.dynamic(ps.join("/"), req, res, "");
    }
  },

  dynamic: function(url, req, res, pfix) {
    console.log("serving dynamic url '%s'", url)
    for (var q in req.query) {
      if (req.query[q] === "false") req.query[q] = false; // "false" is false
    }

    res.render(url, { settings: req.query });
  },
};

function setResourcePaths(prefix, subapp) {
  prefix = prefix || '';
  var subapp = subapp || app; 
  console.log("Setting prefix to '%s'", prefix);
  subapp.set("views", path.join(prefix, "mustaches"));
  subapp.use(express.static(path.join(prefix, "public")));
}

function mustacheError() {
  return console.log(
    "\n\n", "~~~ you don't have any mustaches!".blue, "\n",
    "~~~ run 'inca init' to get this party started.".green, "\n\n"
  );
}


function mount(projectDir) {

  var subapp = express.createServer();
  subapp.set("view engine", "mustache");
  subapp.register(".mustache", tern);
  subapp.set("pathPrefix", projectDir)
  setResourcePaths(projectDir, subapp);

  subapp.get("/", pages.welcome);
  subapp.get("*", pages.standard);

  app.use('/' + projectDir, subapp);
  mountedProjects.push(projectDir);
}

function mount_index() {
  app.set("view engine", "mustache");
  app.register(".mustache", tern);

  app.set("views", '.');
  app.use(express.static("shared"));

  app.get("/", pages.projectList);
}

function mount_projects() {
  // Loop through files in directory
  fs.readdirSync('.').forEach(function(fileOrDirName) {
    // Does a mustaches folder exist?
    if (path.existsSync(path.join(fileOrDirName, "mustaches"))) {
      mount(fileOrDirName);
     }
  });

  mount_index();
}

function run(options) {
  options = options || {};
  if (!options.hosting && !path.existsSync("mustaches")) return mustacheError();
  // stop
  app = express.createServer();

  //mount('');
  mount_projects();

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
