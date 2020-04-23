/* tslint:disable:variable-name */
import {PersonGame} from './PersonGame';
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';
import {ArrayUtil} from '../../utility/ArrayUtil';

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
      _.forEach(this._personGame.myPlatforms, myPlatform => {
        // todo: don't use changed fields, but id?
        base.personGame.myPlatforms.push(myPlatform.getChangedFields());
      });
    }
    base.availablePlatforms = [];
    _.forEach(this.availablePlatforms, availablePlatform => {
      // todo: don't use changed fields, but id?
      base.availablePlatforms.push(availablePlatform.getChangedFields());
    });
    return base;
  }

  addTemporaryPlatform(gamePlatform: GamePlatform) {
    if (!gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform with id using addTemporaryPlatform!');
    }
    const existing = _.find(this._availablePlatforms, platform => platform.full_name.value === gamePlatform.full_name.value);
    if (!existing) {
      this._availablePlatforms.push(gamePlatform);
    }
  }

  addToAvailablePlatforms(gamePlatform: GamePlatform) {
    if (gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform without id using addToAvailablePlatforms!');
    }
    const existing = _.find(this._availablePlatforms, platform => platform.id.value === gamePlatform.id.value);
    if (!existing) {
      this._availablePlatforms.push(gamePlatform);
    }
  }

  hasPlatform(platformName: string): boolean {
    const existing = _.find(this.availablePlatforms, platform => platform.full_name.value === platformName);
    return !!existing;
  }

  getPlatformNames(): string[] {
    return _.map(this.availablePlatforms, platform => platform.full_name.value);
  }

  private removeTemporaryPlatforms() {
    const temporaryPlatforms = _.filter(this._availablePlatforms, platform => platform.isTemporary());
    _.forEach(temporaryPlatforms, platform => ArrayUtil.removeFromArray(this._availablePlatforms, platform));
  }

  private static cloneArray(originalArray): any[] {
    return originalArray.slice();
  }

  get availablePlatforms(): GamePlatform[] {
    return Game.cloneArray(this._availablePlatforms);
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.allPlatforms) {
      throw new Error('Initialize called before platforms were available.');
    }
    this._personGame = !!jsonObj.personGame ? new PersonGame(this.platformService, this.allPlatforms).initializedFromJSON(jsonObj.personGame) : undefined;
    this.removeTemporaryPlatforms();
    _.forEach(jsonObj.availablePlatforms, availablePlatform => {
      const realPlatform = this.getOrCreateGamePlatform(availablePlatform, this.allPlatforms);
      this.addToAvailablePlatforms(realPlatform);
    });
    return this;
  }

  getOrCreateGamePlatform(platformObj: any, allPlatforms: GamePlatform[]): GamePlatform {
    const foundPlatform = _.find(allPlatforms, platform => platform.id.value === platformObj.id);
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
