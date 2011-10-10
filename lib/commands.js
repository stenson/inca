var exec = require("child_process").exec;
var path = require("path");

var dirs = ["json", "mustaches", "public"];

module.exports = {
  init: function() {
    console.log("\n\nwriting directories...\n\n".red);
    dirs.map(function(dir) { exec("mkdir "+dir) });
  },

  cleanup: function() {
    console.log("\n\n\tremoving directories...\n\n".red);
    dirs.map(function(dir) {
      exec("rmdir "+dir);
    });
  },

  ping: function() {
    console.log("ping");
  },

  bootstrap: function() {
    exec("curl http://twitter.github.com/bootstrap/1.3.0/bootstrap.min.css > public/bootstrap.min.css");
  }
};