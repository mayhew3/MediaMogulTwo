const model = require('./model');
const _ = require('underscore');
const axios = require('axios');

exports.getIGDBMatches = async function (request, response) {
  const game_title = request.query.game_title;

  console.log('Finding IGDB matches for game: ' + game_title);

  const igdbUrl = 'https://api-v3.igdb.com/games';
  const igdbKey = process.env.igdb_v3_key;

  const formatted_name = game_title
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '')
    .replace('™', '')
    .replace('®', '');

  const body = `search "${formatted_name}"; fields *;`;

  const config = {
    headers: {
      'user-key': igdbKey,
      'Accept': 'application/json'
    }
  };

  const matches = await axios.post(igdbUrl, body, config);

  response.json(matches.data);
}
