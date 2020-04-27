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
  private _platforms: GamePlatform[] = [];
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
    if (!!this._personGame) {
      base.personGame = this._personGame.getChangedFields();
      base.personGame.myPlatforms = [];
      _.forEach(this._personGame.platforms, myPlatform => {
        if (!myPlatform.id) {
          base.personGame.myPlatforms.push(myPlatform.getChangedFields());
        } else {
          base.personGame.myPlatforms.push({id: myPlatform.id.value});
        }
      });
    }
    base.availablePlatforms = [];
    _.forEach(this.platforms, availablePlatform => {
      if (!availablePlatform.id) {
        base.availablePlatforms.push(availablePlatform.getChangedFields());
      } else {
        base.availablePlatforms.push({id: availablePlatform.id.value});
      }
    });
    return base;
  }

  addTemporaryPlatform(gamePlatform: GamePlatform) {
    if (!gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform with id using addTemporaryPlatform!');
    }
    const existing = _.find(this._platforms, platform => platform.full_name.value === gamePlatform.full_name.value);
    if (!existing) {
      this._platforms.push(gamePlatform);
    }
  }

  addToAvailablePlatforms(platformObj: any, realPlatform: GamePlatform) {
    const realAvailablePlatform = new AvailableGamePlatform(realPlatform).initializedFromJSON(platformObj);
    this._availablePlatforms.push(realAvailablePlatform);
  }

  addToPlatforms(gamePlatform: GamePlatform) {
    if (gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform without id using addToPlatforms!');
    }
    const existing = _.find(this._platforms, platform => platform.id.value === gamePlatform.id.value);
    if (!existing) {
      this._platforms.push(gamePlatform);
    }
  }

  hasPlatform(platformName: string): boolean {
    const existing = _.find(this.platforms, platform => platform.full_name.value === platformName);
    return !!existing;
  }

  hasPlatformWithID(platformID: number): boolean {
    const existing = _.find(this.platforms, platform => platform.id.value === platformID);
    return !!existing;
  }

  hasPlatformWithIGDBID(igdbID: number): boolean {
    const existing = _.find(this.platforms, platform => platform.igdb_platform_id.value === igdbID);
    return !!existing;
  }

  getAvailablePlatform(platform: GamePlatform): AvailableGamePlatform {
    return _.find(this._availablePlatforms, availablePlatform => availablePlatform.platform.id.value === platform.id.value);
  }

  getPlatformNames(): string[] {
    return _.map(this.platforms, platform => platform.full_name.value);
  }

  getPlatformIGDBIDs(): number[] {
    return _.map(this.platforms, platform => platform.igdb_platform_id.value);
  }

  private removeTemporaryPlatforms() {
    const temporaryPlatforms = _.filter(this._platforms, platform => platform.isTemporary());
    _.forEach(temporaryPlatforms, platform => ArrayUtil.removeFromArray(this._platforms, platform));
  }

  private static cloneArray(originalArray): any[] {
    return originalArray.slice();
  }

  get platforms(): GamePlatform[] {
    return Game.cloneArray(this._platforms);
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
      this.addToPlatforms(realPlatform);
    });
    this._personGame = !!jsonObj.personGame ? new PersonGame(this.platformService, this.allPlatforms, this).initializedFromJSON(jsonObj.personGame) : undefined;
    return this;
  }

  getOrCreateGamePlatform(platformObj: any, allPlatforms: GamePlatform[]): GamePlatform {
    const foundPlatform = _.find(allPlatforms, platform => platform.id.value === platformObj.game_platform_id);
    if (!foundPlatform) {
      const newPlatform = new GamePlatform().initializedFromJSON(platformObj);
      this.platformService.addToPlatformsIfDoesntExist(newPlatform);
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
