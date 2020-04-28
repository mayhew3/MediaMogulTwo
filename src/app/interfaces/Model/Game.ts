/* tslint:disable:variable-name */
import {PersonGame} from './PersonGame';
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';
import {ArrayUtil} from '../../utility/ArrayUtil';
import {AvailableGamePlatform} from './AvailableGamePlatform';

export class Game extends DataObject {
  title = this.registerStringField('title', true);
  platform = this.registerStringField('platform', true);
  natural_end = this.registerBooleanField('natural_end', false);
  timetotal = this.registerDecimalField('timetotal', false);

  // metacritic
  metacritic = this.registerIntegerField('metacritic', false);
  metacritic_page = this.registerBooleanField('metacritic_page', false);
  metacritic_matched = this.registerDateField('metacritic_matched', false);
  metacritic_hint = this.registerStringField('metacritic_hint', false);

  // steam
  steamid = this.registerIntegerField('steamid', false);
  steam_cloud = this.registerBooleanField('steam_cloud', false);
  steam_page_gone = this.registerDateField('steam_page_gone', false);
  steam_title = this.registerStringField('steam_title', false);
  logo = this.registerStringField('logo', false);

  // howlong
  howlong_id = this.registerIntegerField('howlong_id', false);
  howlong_title = this.registerStringField('howlong_title', false);
  howlong_extras = this.registerDecimalField('howlong_extras', false);

  // giant bomb
  giantbomb_medium_url = this.registerStringField('giantbomb_medium_url', false);
  giantbomb_id = this.registerIntegerField('giantbomb_id', false);
  giantbomb_name = this.registerStringField('giantbomb_name', false);

  // IGDB
  igdb_id = this.registerIntegerField('igdb_id', false);
  igdb_poster = this.registerStringField('igdb_poster', false);
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
  private _availablePlatforms: AvailableGamePlatform[] = [];

  constructor(private platformService: PlatformService,
              private allPlatforms: GamePlatform[]) {
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
    base.availablePlatforms = this.getPlatformsPayload();
    if (!!this._personGame) {
      base.personGame = this._personGame.getChangedFields();
      base.personGame.myPlatforms = this._personGame.getPlatformsPayload();
    }
    return base;
  }

  private getPlatformsPayload(): any[] {
    const availablePlatforms = [];
    _.forEach(this.availablePlatforms, availablePlatform => {
      if (!availablePlatform.platform.id.value) {
        availablePlatforms.push(availablePlatform.platform.getChangedFields());
      } else {
        availablePlatforms.push({game_platform_id: availablePlatform.platform.id.value});
      }
    });
    return availablePlatforms;
  }

  addTemporaryPlatform(gamePlatform: GamePlatform): AvailableGamePlatform {
    if (!gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform with id using addTemporaryPlatform!');
    }
    const existing = _.find(this._availablePlatforms, availablePlatform => availablePlatform.platform.full_name.value === gamePlatform.full_name.value);
    if (!existing) {
      const availableGamePlatform = new AvailableGamePlatform(gamePlatform);
      this._availablePlatforms.push(availableGamePlatform);
      return availableGamePlatform;
    } else {
      return existing;
    }
  }

  addToAvailablePlatforms(platformObj: any, gamePlatform: GamePlatform) {
    const realAvailablePlatform = new AvailableGamePlatform(gamePlatform).initializedFromJSON(platformObj);
    this._availablePlatforms.push(realAvailablePlatform);
  }

  addToPlatforms(gamePlatform: GamePlatform): AvailableGamePlatform {
    if (gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform without id using addToPlatforms!');
    }
    const existing = _.find(this._availablePlatforms, availablePlatform => availablePlatform.platform.id.value === gamePlatform.id.value);
    if (!existing) {
      const availablePlatform = new AvailableGamePlatform(gamePlatform);
      this._availablePlatforms.push(availablePlatform);
      return availablePlatform;
    } else {
      return existing;
    }
  }

  hasPlatform(platformName: string): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform_name.value === platformName);
    return !!existing;
  }

  hasPlatformWithID(platformID: number): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform.id.value === platformID);
    return !!existing;
  }

  hasPlatformWithIGDBID(igdbID: number): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform.igdb_platform_id.value === igdbID);
    return !!existing;
  }

  findPlatformWithIGDBID(igdbID: number): AvailableGamePlatform {
    return _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform.igdb_platform_id.value === igdbID);
  }

  getAvailablePlatform(platform: GamePlatform): AvailableGamePlatform {
    return _.find(this._availablePlatforms, availablePlatform => availablePlatform.platform.id.value === platform.id.value);
  }

  getPlatformNames(): string[] {
    return _.map(this.availablePlatforms, availablePlatform => availablePlatform.platform_name.value);
  }

  getPlatformIGDBIDs(): number[] {
    return _.map(this.availablePlatforms, availablePlatform => availablePlatform.platform.igdb_platform_id.value);
  }

  private removeTemporaryPlatforms() {
    const temporaryPlatforms = _.filter(this._availablePlatforms, availablePlatform => availablePlatform.isTemporary());
    _.forEach(temporaryPlatforms, availablePlatform => ArrayUtil.removeFromArray(this._availablePlatforms, availablePlatform));
  }

  private static cloneArray(originalArray): any[] {
    return originalArray.slice();
  }

  get availablePlatforms(): AvailableGamePlatform[] {
    return Game.cloneArray(this._availablePlatforms);
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.allPlatforms) {
      throw new Error('Initialize called before platforms were available.');
    }
    this.removeTemporaryPlatforms();
    _.forEach(jsonObj.availablePlatforms, availablePlatform => {
      const realPlatform = this.getOrCreateGamePlatform(availablePlatform, this.allPlatforms);
      this.addToAvailablePlatforms(availablePlatform, realPlatform);
    });
    this._personGame = !!jsonObj.personGame ? new PersonGame(this.platformService, this.allPlatforms, this).initializedFromJSON(jsonObj.personGame) : undefined;
    return this;
  }

  getOrCreateGamePlatform(platformObj: any, allPlatforms: GamePlatform[]): GamePlatform {
    const foundPlatform = _.find(allPlatforms, platform => platform.id.value === platformObj.game_platform_id);
    if (!foundPlatform) {
      const newPlatform = new GamePlatform().initializedFromJSON(platformObj.gamePlatform);
      this.platformService.addToPlatformsIfDoesntExist(newPlatform);
      this.allPlatforms.push(newPlatform);
      return newPlatform;
    } else {
      return foundPlatform;
    }
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
