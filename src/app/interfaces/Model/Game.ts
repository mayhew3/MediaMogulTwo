/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {GamePlatform} from './GamePlatform';
import * as _ from 'underscore';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {MyGamePlatform} from './MyGamePlatform';
import fast_sort from 'fast-sort';
import {GameData} from '../ModelData/GameData';

export class Game {

  brokenImage = false;

  constructor(public gameData: GameData) {
  }

  get availablePlatforms(): AvailableGamePlatform[] {
    return this.gameData.availablePlatforms;
  }
/*

  protected makeChangesToInsertPayload(json: any): any {
    const base = super.makeChangesToInsertPayload(json);
    base.availablePlatforms = this.getPlatformsPayload();
    return base;
  }

  private getPlatformsPayload(): any[] {
    const availablePlatforms = [];
    _.forEach(this.availablePlatforms, availablePlatform => {
      if (!availablePlatform.platform.id) {
        // availablePlatforms.push(availablePlatform.platform.getChangedFields());
      } else {
        availablePlatforms.push({game_platform_id: availablePlatform.platform.id});
      }
    });
    return availablePlatforms;
  }

  createAndAddAvailablePlatform(platformObj: any, gamePlatform: GamePlatform): void {
    const realAvailablePlatform = new AvailableGamePlatform(gamePlatform, this).initializedFromJSON(platformObj);
    this.availablePlatforms.push(realAvailablePlatform);
  }

  addToAvailablePlatforms(availableGamePlatform: AvailableGamePlatform): void {
    this.availablePlatforms.push(availableGamePlatform);
    availableGamePlatform.game = this;
  }
*/

  hasPlatform(platformName: string): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform_name === platformName);
    return !!existing;
  }

  hasPlatformWithID(platformID: number): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.gamePlatform.id === platformID);
    return !!existing;
  }

  hasPlatformWithName(platformName: string): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform_name === platformName);
    return !!existing;
  }

  getOwnedPlatformWithID(platformID: number): MyGamePlatform {
    return _.find(this.myPlatformsInGlobal, myPlatform => myPlatform.platform.id === platformID);
  }

  ownsPlatformWithID(platformID: number): boolean {
    return !!this.getOwnedPlatformWithID(platformID);
  }

  ownsPlatformWithName(platformName: string): boolean {
    const existing = _.find(this.myPlatformsInGlobal, myPlatform => myPlatform.platform_name.value === platformName);
    return !!existing;
  }

  get myPlatforms(): MyGamePlatform[] {
    return _.compact(_.map(this.availablePlatforms, availablePlatform => availablePlatform.myGamePlatform));
  }

  get myPlatformsInGlobal(): MyGamePlatform[] {
    return _.filter(this.myPlatforms, myPlatform => !!myPlatform.platform.myGlobalPlatform);
  }

  findPlatformWithIGDBID(igdbID: number): AvailableGamePlatform {
    return _.find(this.availablePlatforms, availablePlatform => availablePlatform.gamePlatform.igdb_platform_id === igdbID);
  }
/*

  private removeTemporaryPlatforms(): void {
    const temporaryPlatforms = _.filter(this.availablePlatforms, availablePlatform => availablePlatform.isTemporary());
    _.forEach(temporaryPlatforms, availablePlatform => ArrayUtil.removeFromArray(this.availablePlatforms, availablePlatform));
  }

  private static cloneArray(originalArray): any[] {
    return originalArray.slice();
  }
*/

  get availablePlatformsNotInGlobal(): AvailableGamePlatform[] {
    return _.filter(this.availablePlatforms, availablePlatform => !availablePlatform.gamePlatform.myGlobalPlatform);
  }

  getImageUrl(): string {
    if (!!this.gameData.igdb_poster && this.gameData.igdb_poster !== '') {
      return 'https://images.igdb.com/igdb/image/upload/t_720p/' + this.gameData.igdb_poster +  '.jpg';
    } else if (!!this.gameData.logo && this.gameData.logo !== '') {
      return 'https://cdn.edgecast.steamstatic.com/steam/apps/' + this.gameData.steamid + '/header.jpg';
    } else if (!!this.gameData.giantbomb_medium_url && this.gameData.giantbomb_medium_url !== '') {
      return this.gameData.giantbomb_medium_url;
    } else {
      return 'images/GenericSeries.gif';
    }
  }
/*

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.allPlatforms) {
      throw new Error('Initialize called before platforms were available.');
    }
    this.removeTemporaryPlatforms();
    _.forEach(jsonObj.availablePlatforms, availablePlatform => {
      const realPlatform = this.getOrCreateGamePlatform(availablePlatform, this.allPlatforms);
      this.createAndAddAvailablePlatform(availablePlatform, realPlatform);
    });
    return this;
  }
*/

  getOrCreateGamePlatform(platformObj: any, allPlatforms: GamePlatform[]): GamePlatform {
    return _.find(allPlatforms, (platform: GamePlatform) => platform.id === platformObj.game_platform_id);
  }

  isOwned(): boolean {
    return !_.isEmpty(this.myPlatformsInGlobal);
  }

  getLastPlayed(): Date {
    const allLastPlayed = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.last_played.originalValue);
    const max = _.max(allLastPlayed) as Date;
    return !!max ? max : null;
  }

  getOwnershipDateAdded(): Date {
    const allDateAdded = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.collection_add.originalValue);
    const max = _.max(allDateAdded) as Date;
    return !!max ? max : null;
  }

  get myPreferredPlatform(): MyGamePlatform {
    const myPlatforms = this.myPlatformsInGlobal;
    if (myPlatforms.length > 0) {
      const manualPreferred = _.find(myPlatforms, myPlatform => !!myPlatform.preferred.originalValue);
      if (!!manualPreferred) {
        return manualPreferred;
      } else {
        fast_sort(myPlatforms)
          .asc(myPlatform => myPlatform.platform.myGlobalPlatform.rank);
        return myPlatforms[0];
      }
    } else {
      return undefined;
    }
  }
/*

  get myPreferredPlatformNullAllowed(): MyGamePlatform {
    const allPreferred = _.filter(this.myPlatformsInGlobal, myPlatform => myPlatform.preferred.originalValue === true);
    if (allPreferred.length === 0) {
      return undefined;
    } else {
      return allPreferred[0];
    }
  }
*/

  get myRating(): number {
    const preferred = this.myPreferredPlatform;
    return !preferred ? null : preferred.rating.originalValue;
  }

  get minutesToFinish(): number {
    const howlongExtras = this.gameData.howlong_extras;
    const timeTotal = this.gameData.timetotal;
    if (!howlongExtras && !timeTotal) {
      return undefined;
    }

    return !howlongExtras ? timeTotal * 60 : howlongExtras * 60;
  }

  getProgressPercent(): number {
    const minutesPlayed = this.bestPlaytime;
    const minutesToFinish = this.minutesToFinish;

    if (!minutesToFinish) {
      return undefined;
    }

    const baseRatio = minutesPlayed / minutesToFinish;
    if (baseRatio > .99) {
      return 99;
    } else {
      return Math.floor(baseRatio * 100);
    }
  }

  get bestMetacritic(): number {
    const allMetacritics = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.availableGamePlatform.metacritic);
    const max = _.max(allMetacritics);
    return max > 0 ? max : null;
  }

  get bestPlaytime(): number {
    const allPlaytimes = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.minutes_played.originalValue);
    const max = _.max(allPlaytimes);
    return max > 0 ? max : null;
  }

  get bestMyRating(): number {
    const allRatings = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.rating.originalValue);
    const max = _.max(allRatings);
    return max > 0 ? max : null;
  }

  get bestMyRatingOrMetacritic(): number {
    const myRating = this.bestMyRating;
    return !!myRating ? myRating : this.bestMetacritic;
  }

  get isFinished(): boolean {
    const allFinished = _.filter(this.myPlatformsInGlobal, myPlatform => !!myPlatform.finished_date.originalValue);
    return !_.isEmpty(allFinished);
  }

}
