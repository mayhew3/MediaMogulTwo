const model = require('./model');

exports.getPlatforms = async function (request, response) {
  const platforms = await model.GamePlatform.findAll({
    order: ['id']
  });
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
    const oldPlatformName = gamePlatform.full_name;
    await gamePlatform.update(changedFields);

    const newPlatformName = changedFields.full_name;
    if (!!newPlatformName && newPlatformName !== oldPlatformName) {
      const changedAvailableFields = {
        platform_name: newPlatformName
      };

      await model.AvailableGamePlatform.update(changedAvailableFields, {
        where: {
          platform_name: oldPlatformName
        }
      });

      await model.MyGamePlatform.update(changedAvailableFields, {
        where: {
          platform_name: oldPlatformName
        }
      });
    }

    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating gamePlatform: ' + JSON.stringify(changedFields)});
  }
}
