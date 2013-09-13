var express = require('express'),
fs          = require('fs'),
app         = express();

app.configure(function(){
  app.use('/', express.static(__dirname));
});

app.get(/^(?!\/app|\/css|\/lib).+$/, function(req, res) {
  fs.createReadStream(__dirname + '/index.html').pipe(res);
});

app.listen(3000);