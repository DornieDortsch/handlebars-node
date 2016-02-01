'use strict'

var handlebars = require('handlebars');
var merge = require('merge');
var fs = require('fs');
var path = require('path');


var Engine = function() {

  var config = {};

  var siteModel = {};

  var init = function(options) {
    console.log('init');

    if(options !== undefined) {
      merge.recursive(config, options);
    }

    if(config.siteModel !== undefined) {
      siteModel = require(path.join(process.cwd(), config.siteModel));
    }

    if(config.helper !== undefined) {

      //try
      fs.readdirSync(config.helper)
        .filter(function (file) { return path.extname(file) === '.js'})
        .forEach(function(file) {
          handlebars.registerHelper(path.basename(file, '.js'), require(path.join(process.cwd(), config.helper, file)));
        });
    }

    if(config.partials !== undefined) {

      fs.readdirSync(config.partials)
        .filter(function (partial) { return path.extname(partial) === '.hbs'})
        .forEach(function(partial) {
          var data = fs.readFileSync(path.join(config.partials, partial), 'utf8');
          handlebars.registerPartial(path.basename(partial, '.hbs'), data);
        });
    }    
  };

  var execute = function(model) {
    var executeModel;

    if(model != undefined) {
      executeModel = merge({}, siteModel, model);
    } else {
      executeModel = siteModel;
    }

    console.log('execute');

    try {
      fs.readdirSync(config.view)
        .filter(function (view) {
          return path.extname(view) === '.hbs'
        })
        .forEach(function(view) {
          var template,
              model,
              templatePath = path.join(config.view, view),
              modelPath = path.join(config.model, path.basename(view, '.hbs')) + '.json',
              htmlPath = path.join(config.output, path.basename(view, '.hbs')) + '.html';

          try {
            template = fs.readFileSync(templatePath, 'utf8')
          } catch(e) {
            console.log('Can\'t read view (' + templatePath + ')');
            console.log(e);
          }

          try {
            model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
            model = merge.recursive(true, {}, executeModel, model);
          } catch(e) {
            console.log('No model (' + modelPath + ') for view (' + templatePath + ')');
            return;
          }
          
          if(config.output !== undefined) {
            try {
              fs.writeFileSync(
                htmlPath,
                handlebars.compile(template)(model)
              );
            } catch(e) {
              console.log('Can\'t write html (' + htmlPath + ')');
              console.error(e);
            }
          } else {
            console.log(handlebars.compile(template)(model));
          }
        });
    } catch(e) {
      console.log('Can\'t read view directory (' + config.view + ')');
    }
  };
  
  return {
    init: init,
    execute: execute
  }
};

module.exports = new Engine();