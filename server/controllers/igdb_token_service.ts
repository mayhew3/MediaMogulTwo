const axios = require('axios');
let token = null;

export const getToken = (): Promise<any> => {
  if (token === null) {
    return getTokenFromIGDB();
  } else {
    return new Promise(resolve => {
      resolve(token);
    });
  }
};

const getTokenFromIGDB = (): Promise<any> => new Promise((resolve, reject) => {
  const clientID = process.env.IGDB_V4_CLIENT_ID;
  const clientSecret = process.env.IGDB_V4_CLIENT_SECRET;

  if (!clientID) {
    const errMsg = 'No IGDB_V4_CLIENT_ID variable found!';
    console.error(errMsg);
    reject(new Error(errMsg));
  }

  if (!clientSecret) {
    const errMsg = 'No IGDB_V4_CLIENT_SECRET variable found!';
    console.error(errMsg);
    reject(new Error(errMsg));
  }

  const urlString = 'https://id.twitch.tv/oauth2/token';

  const options = {
    url: urlString,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    params: {
      client_id: clientID,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    },
    json: true
  };

  axios(options).then(igdb_response => {
    if (igdb_response.status !== 200) {
      reject('Bad status code: ' + igdb_response.status);
    } else {
      token = igdb_response.data.access_token;
      resolve(token);
    }
  }).catch(error => {
    reject(error);
  });
});

// noinspection JSIgnoredPromiseFromCall
getTokenFromIGDB();
