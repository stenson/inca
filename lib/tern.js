var tern = {},
  fs = require("fs"),
  path = require("path"),
  tt = require("twitter-text"),
  mustache = require("mustache"),
  exec = require("child_process").exec;

var jsons = {},
  randoms = {},
  keys = [];

var linkifiedText = function() {
  var usernameOpts = {
    usernameClass: "atreply",
    usernameUrlBase: "#",
    listClass: "listname",
    preChunk: '<b>',
    postChunk: '</b>'
  };
  var hashtagOpts = {
    hashtagClass: "hashtag",
    hashtagUrlBase: "#",
    hash: '<s>#</s>',
    preText: '<b>',
    postText: '</b>'
  };
  var linkOpts = {
    urlClass: "link",
    target: "_blank"
  };

  return tt.autoLinkUsernamesOrLists(
    tt.autoLinkUrlsCustom(
        tt.autoLinkHashtags(this.text, hashtagOpts),
      linkOpts),
    usernameOpts).replace(/([@]+)(<[^>]*>)/g, '$2<s>$1</s>');
};

var loadHelpers = function() {
  if (path.existsSync("helpers.js")) {
    eval(fs.readFileSync("helpers.js", "utf-8"));
    if (helpers) {
      for (var h in helpers) {
        jsons[h] = helpers[h];
      }
    }
    jsons.linkified_text = linkifiedText;
  }
};

var loadJson = function() {
  if (path.existsSync("../json")) {
    fs.readdirSync("../json").forEach(function(file) {
      jsons[file.split(".")[0]] = JSON.parse(fs.readFileSync("../json/"+file, "utf-8"));
    });
  }

  fs.readdirSync("json").forEach(function(file) {
    if (file !== "urls.txt") {
      jsons[file.split(".")[0]] = JSON.parse(fs.readFileSync("json/"+file, "utf-8"));
    }
  });

  loadHelpers(); // helper functions provided by the prototyper
};

/* mustache rewriting functions */

var randomRegex = /:random\(([^\(]+)\)/g,
  variableRegex = /\{\{(#|\^|\/)?([^\{]+)\}\}/g,
  partialWithSource = /\{\{(>[^:]+):([^\{]+)\}\}/g,
  partialsRegex = new RegExp("{{([>-])([^\\/#\\^]+?)\\1?}}+", "g");

var chooseRandoms = function(line) {
  return line.replace(randomRegex, function(match, prefix) {
    var matcher = RegExp("^"+prefix);
    var indices = {};
    var matches = keys.filter(function(k, i) {
      if (k.match(matcher)) {
        indices[k] = i;
        return true;
      }
    });
    var choice = matches[Math.floor(Math.random()*matches.length)];
    delete keys[indices[choice]];
    return ":" + choice;
  });
};

var rewriteDirectives = function(line) {
  return line.replace(partialWithSource, function(match, partial, source) {
    return "{{" + ["#"+source, partial, "/"+source ].join("}}{{") + "}}";
  });
};

var rewriteDotSyntax = function(line) {
  return line.replace(variableRegex, function(match, operator, variable) {
    var vs = variable.split(".");
    var pivot = vs.length - 1;

    if (!operator) vs = vs.concat(vs.slice(0, -1).reverse());

    var re = vs.map(function(v, i) {
      var op = ((!operator || operator === "^") && i < pivot) ? "#" : (i > pivot) ? "/" : operator;
      return ["{{", op, v, "}}"].join("");
    });

    return ((operator == "/") ? re.reverse() : re).join("");
  });
};

var inlinePartials = function(line) {
  return line.replace(partialsRegex, function(match, operator, name) {
    if (operator == '>') {
      var partial = "mustaches/" + name + ".mustache";
      return path.existsSync(partial) ? fs.readFileSync(partial, "utf-8") : "";
    }
    return match;
  });
};

var rewrite = function(source) {
  var rewritten = source
    .split("\n")
    .map(chooseRandoms)
    .map(rewriteDirectives)
    .map(rewriteDotSyntax)
    .map(inlinePartials)
    .join("\n");

  return ~source.indexOf("{{>") ? rewrite(rewritten) : rewritten;
};

var extend = function(o, ps) {
  for(var p in ps) o[p] = ps[p];
  return o;
};

/* public */

module.exports = {
  compile: function(source, options) {
    jsons = {};
    randoms = {};

    return function(options) {
      if (options.body) options.yield = options.body;

      loadJson();
      jsons.settings = extend(jsons.settings, options.settings);
      keys = Object.keys(jsons);
      options = extend(options, jsons);

      var template = rewrite(source);
      //console.log(template);
      return mustache.to_html(template, options, {});
    }
  }
};