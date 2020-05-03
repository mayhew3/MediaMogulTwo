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

// todo: update all available and my platforms with full_name

exports.updateGamePlatform = async function(request, response) {
  const gamePlatformID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const gamePlatform = await model.GamePlatform.findByPk(gamePlatformID);
    await gamePlatform.update(changedFields);
    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating gamePlatform: ' + JSON.stringify(changedFields)});
  }
}
