var tern = {};
var fs = require("fs");
var path = require("path");
var mustache = require("mustache");

var variableRegex = /\{\{(#|\^|\/)?([^\{]+)\}\}/g;
var partialWithSource = /\{\{(>[^:]+):([^\{]+)\}\}/g;
var partialsRegex = new RegExp("{{([>-])([^\\/#\\^]+?)\\1?}}+", "g");

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
      var op = (!operator && i < pivot) ? "#" : (i > pivot) ? "/" : operator;
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
    .map(rewriteDirectives)
    .map(rewriteDotSyntax)
    .map(inlinePartials)
    .join("\n");

  return ~source.indexOf("{{>") ? rewrite(rewritten) : rewritten;
};

tern.compile = function (source, options) {
  return function (options) {
    if (options.body) options.yield = options.body;
    var template = rewrite(source);
    console.log(template);
    return mustache.to_html(template, options, {});
  }
};

tern.render = function(template, options) {
  return tern.compile(template, options)(options);
};

module.exports = tern;