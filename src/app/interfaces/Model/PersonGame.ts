/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {PlatformService} from '../../services/platform.service';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';

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

  private _platforms: GamePlatform[] = [];

  constructor(private platformService: PlatformService,
              private allPlatforms: GamePlatform[]) {
    super();
    this.minutes_played.value = 0;
    this.tier.value = 2;
  }

  get platforms(): GamePlatform[] {
    return ArrayUtil.cloneArray(this._platforms);
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    this.removeTemporaryPlatforms();
    _.forEach(jsonObj.myPlatforms, myPlatform => {
      const realPlatform = this.getOrCreateGamePlatform(myPlatform, this.allPlatforms);
      this.addToMyPlatforms(realPlatform);
    });
    return this;
  }

  protected makeChangesToInsertPayload(json: any): any {
    const base = super.makeChangesToInsertPayload(json);
    base.myPlatforms = [];
    _.forEach(this.platforms, myPlatform => {
      if (!myPlatform.id) {
        base.myPlatforms.push(myPlatform.getChangedFields());
      } else {
        base.myPlatforms.push({id: myPlatform.id.value});
      }
    });
    return base;
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
    const foundPlatform = _.find(allPlatforms, platform => platform.id.value === platformObj.id);
    if (!foundPlatform) {
      const newPlatform = new GamePlatform().initializedFromJSON(platformObj);
      this.platformService.addToPlatformsIfDoesntExist(newPlatform);
      return newPlatform;
    } else {
      return foundPlatform;
    }
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

  addToMyPlatforms(gamePlatform: GamePlatform) {
    if (gamePlatform.isTemporary()) {
      throw new Error('Cannot add platform without id using addToAvailablePlatforms!');
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

  hasPlatformWithIGDBID(igdbID: number): boolean {
    const existing = _.find(this.platforms, platform => platform.igdb_platform_id.value === igdbID);
    return !!existing;
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

}
