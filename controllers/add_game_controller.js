const tokens = require('./igdb_token_service');

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

  const body = `search "${formatted_name}";
  fields name, platforms.name, cover.image_id, cover.width, cover.height, keywords.name, aggregated_rating,
    aggregated_rating_count, version_parent, first_release_date, genres.name, involved_companies.company.name,
    player_perspectives.name, popularity,pulse_count, rating, rating_count, release_dates.date, release_dates.platform.name,
    slug, summary, tags, updated_at, url;
  where release_dates.region = (2,8);`;

  const config = {
    headers: {
      'user-key': igdbKey,
      'Accept': 'application/json'
    }
  };

  axios.post(igdbUrl, body, config).then(matches => {
    response.json(matches.data);
  }).catch(err => {
    console.log(err.response.data[0].cause)
  });


}
