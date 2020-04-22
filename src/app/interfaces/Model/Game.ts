/* tslint:disable:variable-name */
import {PersonGame} from './PersonGame';
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';

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
  igdb_id = this.registerIntegerField('igdb_id', false);
  igdb_width = this.registerIntegerField('igdb_width', false);
  igdb_height = this.registerIntegerField('igdb_height', false);

  igdb_rating = this.registerDecimalField('igdb_rating', false);
  igdb_rating_count = this.registerIntegerField('igdb_rating_count', false);
  igdb_release_date = this.registerDateField('igdb_release_date', false);
  igdb_popularity = this.registerDecimalField('igdb_popularity', false);
  igdb_slug = this.registerStringField('igdb_slug', false);
  igdb_summary = this.registerStringField('igdb_summary', false);
  igdb_updated = this.registerDateField('igdb_updated', false);

  brokenImage = false;

  private _personGame: PersonGame;
  private _availablePlatforms: GamePlatform[] = [];

  constructor(private platformService: PlatformService) {
    super();
  }

  get personGame(): PersonGame {
    return this._personGame;
  }

  set personGame(personGame: PersonGame) {
    this._personGame = personGame;
    if (!!personGame && !!personGame.game_id) {
      personGame.game_id.value = this.id.value;
    }
  }

  protected makeChangesToInsertPayload(json: any): any {
    const base = super.makeChangesToInsertPayload(json);
    if (!!this._personGame) {
      base.personGame = this._personGame.getChangedFields();
    }
    base.availablePlatforms = [];
    _.forEach(this.availablePlatforms, availablePlatform => {
      base.availablePlatforms.push({
        igdb_platform_id: availablePlatform.igdb_platform_id.value
      });
    });
    return base;
  }

  addToAvailablePlatforms(gamePlatform: GamePlatform) {
    const existing = _.find(this._availablePlatforms, platform => platform.id.value === gamePlatform.id.value);
    if (!existing) {
      this._availablePlatforms.push(gamePlatform);
    }
  }

  private static cloneArray(originalArray): any[] {
    return originalArray.slice();
  }

  get availablePlatforms(): GamePlatform[] {
    return Game.cloneArray(this._availablePlatforms);
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    this._personGame = !!jsonObj.personGame ? new PersonGame().initializedFromJSON(jsonObj.personGame) : undefined;
    this.platformService.platforms.subscribe(allPlatforms => {
      _.forEach(jsonObj.availablePlatforms, availablePlatform => {
        const foundPlatform = _.find(allPlatforms, platform => platform.id.value === availablePlatform.id);
        this.addToAvailablePlatforms(foundPlatform);
      });
    });
    this.platformService.maybeRefreshCache();
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
    if (!!this._personGame) {
      this._personGame.discardChanges();
    }
  }
}
