let express = require('express');
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

module.exports = function(app) {
  let games = require('./controllers/games_controller');
  let persons = require('./controllers/persons_controller');
  let platforms = require('./controllers/platforms_controller');
  let addGame = require('./controllers/add_game_controller');

  const authConfig = {
    domain: 'mayhew3.auth0.com',
    audience: 'https://media-mogul-two.herokuapp.com'
  }

  const authCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithms: ['RS256']
  });

  let router = express.Router();

  privateGet('/games', games.getGames);
  privatePut('/games', games.updateGame);
  privatePost('/games', games.addGame);

  privateGet('/gameplaySessions', games.getGameplaySessions);
  privatePost('/gameplaySessions', games.addGameplaySession);

  privateGet('/persons', persons.getPersons);

  privateGet('/gamePlatforms', platforms.getPlatforms);
  privatePost('/gamePlatforms', platforms.addGamePlatform);
  privatePut('/gamePlatforms', platforms.updateGamePlatform);

  privatePost('/myGlobalPlatforms', platforms.addMyGlobalPlatform);
  privateDelete('/myGlobalPlatforms/:id', platforms.deleteMyGlobalPlatform);

  privatePut('/multipleGlobals', platforms.updateMultipleGlobals);

  privatePost('/availablePlatforms', games.addAvailableGamePlatform);

  privatePost('/myPlatforms', games.addMyGamePlatform);
  privatePut('/myPlatforms', games.updateMyGamePlatform);

  privateGet('/igdbMatches', addGame.getIGDBMatches);


  app.use('/api', router);

  function privateGet(endpoint, callback) {
    router.get(endpoint, authCheck, callback);
  }

  function publicGet(endpoint, callback) {
    router.get(endpoint, callback);
  }

  function privatePost(endpoint, callback) {
    router.post(endpoint, authCheck, callback);
  }

  function privatePut(endpoint, callback) {
    router.put(endpoint, authCheck, callback);
  }

  function privateDelete(endpoint, callback) {
    router.delete(endpoint, authCheck, callback);
  }

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
