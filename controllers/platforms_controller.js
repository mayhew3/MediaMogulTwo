const model = require('./model');

exports.getPlatforms = async function (request, response) {
  const platforms = await model.GamePlatform.findAll();
  response.json(platforms);
};
