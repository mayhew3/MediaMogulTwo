import express, {Express} from 'express';
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app: Express = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../../media-mogul-two')));
app.use('/bootstrap_js', express.static(__dirname + '../../../node_modules/bootstrap/dist/js/'));
app.use('/jquery_js', express.static(__dirname + '../../../node_modules/jquery/dist/'));
app.use('/popper_js', express.static(__dirname + '../../../node_modules/@popperjs/core/dist/umd/'));

require('./routes.js')(app);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../media-mogul-two/index.html'));
});

module.exports = app;
