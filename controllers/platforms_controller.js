const model = require('./model');

exports.getPlatforms = async function (request, response) {
  const platforms = await model.GamePlatform.findAll();
  response.json(platforms);
};

exports.addGamePlatform = async function(request, response) {
  const gamePlatformObj = request.body;

  const gamePlatform = await model.GamePlatform.create(gamePlatformObj);
  response.json(gamePlatform);
};
