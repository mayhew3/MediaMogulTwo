import {DataObject} from './DataObject';

export class GameObj extends DataObject {
  title = this.registerStringField('title', true);
  igdb_poster = this.registerStringField('igdb_poster', false);
  logo = this.registerStringField('logo', false);
  giantbomb_medium_url = this.registerStringField('giantbomb_medium_url', false);
  steamid = this.registerIntegerField('steamid', false);
  howlong_extras = this.registerDecimalField('howlong_extras', false);
  timetotal = this.registerDecimalField('timetotal', false);
  metacritic = this.registerIntegerField('metacritic', false);
  metacritic_hint = this.registerStringField('metacritic_hint', false);
  platform = this.registerStringField('platform', true);
  natural_end = this.registerBooleanField('natural_end', false);
  howlong_id = this.registerIntegerField('howlong_id', false);
  giantbomb_id = this.registerIntegerField('giantbomb_id', false);
  steam_cloud = this.registerBooleanField('steam_cloud', false);

  brokenImage = false;
}
