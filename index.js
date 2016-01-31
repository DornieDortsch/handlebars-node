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

      fs.readdir(config.helper, function (err, files) {
        if(!err) {
          files
            .filter(function (file) { return path.extname(file) === '.js'})
            .forEach(function(file) {
              handlebars.registerHelper(path.basename(file, '.js'), require(path.join(process.cwd(), config.helper, file)));
            });
        } else {
          console.error(err);
        }
      });
    }

    if(config.partials !== undefined) {

      fs.readdir(config.partials, function (err, files) {
        if(!err) {
          files
            .filter(function (file) { return path.extname(file) === '.hbs'})
            .forEach(function(partial) {
              fs.readFile(path.join(config.partials, partial), 'utf8', function(err, data){
                if(!err) {
                  handlebars.registerPartial(path.basename(partial, '.hbs'), data);
                } else {
                  console.error(err);
                }
              });
            });
        }
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

    if(config.model !== undefined 
        && config.view !== undefined) {

      fs.readdir(config.view, function (err, files) {
        if(!err) {
          files
            .filter(function (file) {return path.extname(file) === '.hbs'})
            .forEach(function(view) {
              fs.readFile(path.join(config.view, view), 'utf8', function(err, template){
                if(!err) {
                  var model = path.join(config.model, path.basename(view, '.hbs')) + '.json';
                  fs.readFile(model, 'utf8', function(err, data){
                    if(!err) {
                      data = merge.recursive(true, {}, executeModel, JSON.parse(data));

                      if(config.output !== undefined) {
                        fs.writeFile(path.join(config.output, path.basename(view, '.hbs')) + '.html', handlebars.compile(template)(data), function (err) {
                          if(err) {
                            console.error(err);
                          }
                        });
                      } else {
                        console.log(handlebars.compile(template)(data));
                      }
                    } else {
                      console.error(err);
                    }
                  });
                }
              });
            });
        }
      });
    } else {
      console.log('Nothing to do!');
    }
  };
  
  return {
    init: init,
    execute: execute
  }
};

module.exports = new Engine();