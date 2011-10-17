var tern = {},
  fs = require("fs"),
  path = require("path"),
  tt = require("twitter-text"),
  mustache = require("mustache"),
  exec = require("child_process").exec;

var variableRegex = /\{\{(#|\^|\/)?([^\{]+)\}\}/g,
  partialWithSource = /\{\{(>[^:]+):([^\{]+)\}\}/g,
  partialsRegex = new RegExp("{{([>-])([^\\/#\\^]+?)\\1?}}+", "g");

var remotes = {},
  jsons = {};

var fetchRemoteJson = function(key) {
  var url = remotes[key];
  delete remotes[key];
  exec("curl '"+url+"' > tempjson");
  try {
    jsons[key] = JSON.parse(fs.readFileSync("tempjson", "utf-8"));
  } catch (e) {
    console.log("failed to fetch resource: "+url);
  }
  exec("rm tempjson");
};

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

var loadUrls = function() {
  if (path.existsSync("json/urls.txt")) {
    fs.readFileSync("json/urls.txt", "utf-8").split("\n").forEach(function(line) {
      var pair = line.replace(/\s/g,"").split("::");
      remotes[pair[0]] = pair[1];
    });
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

var inlineRemoteUrls = function(line) {
  line.replace(variableRegex, function(match, operator, name) {
    if ((operator === "#" || !operator) && (name in remotes)) {
      fetchRemoteJson(name);
    }
    return match;
  });
  return line;
};

var rewrite = function(source) {
  var rewritten = source
    .split("\n")
    .map(rewriteDirectives)
    .map(rewriteDotSyntax)
    .map(inlinePartials)
    .map(inlineRemoteUrls)
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
    remotes = {};

    return function(options) {
      if (options.body) options.yield = options.body;

      loadJson();
      jsons.settings = extend(jsons.settings, options.settings);
      options = extend(options, jsons);

      var template = rewrite(source);
      return mustache.to_html(template, options, {});
    }
  }
};