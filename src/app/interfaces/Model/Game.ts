/* tslint:disable:variable-name */
import {PersonGame} from './PersonGame';
import {DataObject} from '../DataObject/DataObject';

export class Game extends DataObject {
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

  private _personGame: PersonGame;

  get personGame(): PersonGame {
    return this._personGame;
  }

  set personGame(personGame: PersonGame) {
    this._personGame = personGame;
    if (!!personGame && !!personGame.game_id) {
      personGame.game_id.value = this.id.value;
    }
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    this._personGame = !!jsonObj.personGame ? new PersonGame().initializedFromJSON(jsonObj.personGame) : undefined;
    return this;
  }

  isOwned(): boolean {
    return !!this._personGame;
  }

  getApiMethod(): string {
    return 'games';
  }

  discardChanges(): void {
    super.discardChanges();
    this._personGame.discardChanges();
  }
}
