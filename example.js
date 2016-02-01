'use strict'
var engine = require('./index.js');
engine.init({
    'helper': 'example/helper',
    'partials': 'example/partials',
    'view': 'example/view',
    'model': 'example/model',
    'siteModel': 'example/model/site.json',
    'output': 'example/build'
  });

engine.execute({
  "siteName": "example"
});