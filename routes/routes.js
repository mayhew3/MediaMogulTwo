let express = require('express');

module.exports = function(app) {
  let games = require('../controllers/games_controller');

  let router = express.Router();

  router.route('/games')
    .get(games.getGames)
    .put(games.updateGame)
    .post(games.addGame);

  router.route('/personGames')
    .put(games.updatePersonGame)
    .post(games.addPersonGame);

  router.route('/gameplaySessions')
    .post(games.addGameplaySession);

  app.use('/api', router);

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      console.log(err.message);
      console.log(err.stack);
      console.log("Status: " + err.status);
      res.status(err.status || 500).json({
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    console.log(err.message);
    console.log(err.stack);
    console.log("Status: " + err.status);
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });

};
