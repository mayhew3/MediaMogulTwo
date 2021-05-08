import express from 'express';
let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../../media-mogul-two')));
app.use('/bootstrap_js', express.static(__dirname + '../../../node_modules/bootstrap/dist/js/'));
app.use('/jquery_js', express.static(__dirname + '../../../node_modules/jquery/dist/'));
app.use('/popper_js', express.static(__dirname + '../../../node_modules/@popperjs/core/dist/umd/'));

require('./routes.js')(app);

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '../../../media-mogul-two/index.html'));
});

module.exports = app;
