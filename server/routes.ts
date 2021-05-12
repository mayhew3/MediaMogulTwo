import {Express} from 'express';

const express = require('express');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

module.exports = (app: Express): void => {
  const games = require('./controllers/games_controller');
  const persons = require('./controllers/persons_controller');
  const platforms = require('./controllers/platforms_controller');
  const addGame = require('./controllers/add_game_controller');

  const authConfig = {
    domain: 'mayhew3.auth0.com',
    audience: 'https://media-mogul-two.herokuapp.com'
  };

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

  const router = express.Router();

  const privateGet = (endpoint, callback): void => {
    router.get(endpoint, authCheck, callback);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const publicGet = (endpoint, callback): void => {
    router.get(endpoint, callback);
  };

  const privatePost = (endpoint, callback): void => {
    router.post(endpoint, authCheck, callback);
  };

  const privatePut = (endpoint, callback): void => {
    router.put(endpoint, authCheck, callback);
  };

  const privateDelete = (endpoint, callback): void => {
    router.delete(endpoint, authCheck, callback);
  };

  privateGet('/games', games.getGames);
  privatePut('/games', games.updateGame);
  privatePost('/games', addGame.addGameToCollection);

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

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, req, res, next) => {
      console.log(err.message);
      console.log(err.stack);
      console.log('Status: ' + err.status);
      res.status(err.status || 500).json({
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err, req, res, next) => {
    console.log(err.message);
    console.log(err.stack);
    console.log('Status: ' + err.status);
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });

};
