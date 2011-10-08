var dirs = ["json", "mustaches", "public"];

module.exports = {
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
  },

  ping: function() {
    console.log("ping");
  }
};