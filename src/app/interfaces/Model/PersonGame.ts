/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {PlatformService} from '../../services/platform.service';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGamePlatform} from './MyGamePlatform';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {Game} from './Game';

export class PersonGame extends DataObject {
  last_played = this.registerDateField('last_played', false);
  tier = this.registerIntegerField('tier', true);
  rating = this.registerDecimalField('rating', false);
  final_score = this.registerDecimalField('final_score', false);
  replay_score = this.registerDecimalField('replay_score', false);
  minutes_played = this.registerIntegerField('minutes_played', false);
  finished_date = this.registerDateField('finished_date', false);
  replay_reason = this.registerStringField('replay_reason', false);
  person_id = this.registerIntegerField('person_id', true);
  game_id = this.registerIntegerField('game_id', true);

  private _myPlatforms: MyGamePlatform[] = [];

  constructor(private platformService: PlatformService,
              private allPlatforms: GamePlatform[],
              private game: Game) {
    super();
    this.minutes_played.value = 0;
    this.tier.value = 2;
    this.game_id.value = game.id.value;
  }

  get myPlatforms(): MyGamePlatform[] {
    return ArrayUtil.cloneArray(this._myPlatforms);
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    this.removeTemporaryPlatforms();
    _.forEach(jsonObj.myPlatforms, myPlatformObj => {
      const availableGamePlatform = this.game.getAvailablePlatformWithID(myPlatformObj.available_game_platform_id);
      this.addToMyPlatforms(myPlatformObj, availableGamePlatform);
    });
    return this;
  }

  protected makeChangesToInsertPayload(json: any): any {
    const base = super.makeChangesToInsertPayload(json);
    base.myPlatforms = this.getPlatformsPayload();
    return base;
  }

  getPlatformsPayload(): any {
    const myPlatforms = [];
    _.forEach(this.myPlatforms, myPlatform => {
      if (!myPlatform.platform.id.value) {
        myPlatforms.push(myPlatform.platform.getChangedFields());
      } else {
        myPlatforms.push({game_platform_id: myPlatform.platform.id.value});
      }
    });
    return myPlatforms;
  }

  getLastPlayedFormat(): string {
    const thisYear = (new Date()).getFullYear();

    if (!!this.last_played.value) {
      const year = this.last_played.value.getFullYear();

      if (year === thisYear) {
        return 'EEE M/d';
      } else {
        return 'yyyy.M.d';
      }
    } else {
      return 'yyyy.M.d';
    }
  }

  getApiMethod(): string {
    return 'personGames';
  }

  // platform methods

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

  addTemporaryPlatform(availableGamePlatform: AvailableGamePlatform): MyGamePlatform {
    if (!availableGamePlatform.platform.isTemporary()) {
      throw new Error('Cannot add platform with id using addTemporaryPlatform!');
    }
    const existing = _.find(this._myPlatforms, myPlatform => myPlatform.platform_name.value === availableGamePlatform.platform_name.value);
    if (!existing) {
      const myPlatform = new MyGamePlatform(availableGamePlatform);
      this._myPlatforms.push(myPlatform);
      return myPlatform;
    } else {
      return existing;
    }
  }

  addToMyPlatforms(myPlatformObj: any, availableGamePlatform: AvailableGamePlatform) {
    const myPlatform = new MyGamePlatform(availableGamePlatform).initializedFromJSON(myPlatformObj);
    this._myPlatforms.push(myPlatform);
  }

  addToPlatforms(availableGamePlatform: AvailableGamePlatform): MyGamePlatform {
    if (availableGamePlatform.platform.isTemporary()) {
      throw new Error('Cannot add platform without id using addToPlatforms!');
    }
    const existing = _.find(this._myPlatforms, myPlatform => myPlatform.platform.id.value === availableGamePlatform.platform.id.value);
    if (!existing) {
      const myPlatform = new MyGamePlatform(availableGamePlatform);
      this._myPlatforms.push(myPlatform);
      return myPlatform;
    } else {
      return existing;
    }
  }

  hasPlatform(platformName: string): boolean {
    const existing = _.find(this.myPlatforms, myPlatform => myPlatform.platform.full_name.value === platformName);
    return !!existing;
  }

  hasPlatformWithIGDBID(igdbID: number): boolean {
    const existing = _.find(this.myPlatforms, myPlatform => myPlatform.platform.igdb_platform_id.value === igdbID);
    return !!existing;
  }

  findPlatformWithIGDBID(igdbID: number): MyGamePlatform {
    return _.find(this.myPlatforms, myPlatform => myPlatform.platform.igdb_platform_id.value === igdbID);
  }

  getPlatformNames(): string[] {
    return _.map(this.myPlatforms, myPlatform => myPlatform.platform.full_name.value);
  }

  getPlatformIGDBIDs(): number[] {
    return _.map(this.myPlatforms, myPlatform => myPlatform.platform.igdb_platform_id.value);
  }

  private removeTemporaryPlatforms() {
    const temporaryPlatforms = _.filter(this._myPlatforms, myPlatform => myPlatform.isTemporary());
    _.forEach(temporaryPlatforms, myPlatform => ArrayUtil.removeFromArray(this._myPlatforms, myPlatform));
  }

}
