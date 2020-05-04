/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';
import {ArrayUtil} from '../../utility/ArrayUtil';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {MyGamePlatform} from './MyGamePlatform';

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

  private _availablePlatforms: AvailableGamePlatform[] = [];

  constructor(private platformService: PlatformService,
              private allPlatforms: GamePlatform[]) {
    super();
  }

  protected makeChangesToInsertPayload(json: any): any {
    const base = super.makeChangesToInsertPayload(json);
    base.availablePlatforms = this.getPlatformsPayload();
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

  createAndAddAvailablePlatform(platformObj: any, gamePlatform: GamePlatform) {
    const realAvailablePlatform = new AvailableGamePlatform(gamePlatform, this).initializedFromJSON(platformObj);
    this._availablePlatforms.push(realAvailablePlatform);
  }

  addToAvailablePlatforms(availableGamePlatform: AvailableGamePlatform) {
    this._availablePlatforms.push(availableGamePlatform);
    availableGamePlatform.game = this;
  }

  hasPlatform(platformName: string): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform_name.value === platformName);
    return !!existing;
  }

  canAddPlaytime(): boolean {
    return this.myMutablePlatforms.length > 0;
  }

  hasPlatformWithID(platformID: number): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform.id.value === platformID);
    return !!existing;
  }

  hasPlatformWithName(platformName: string): boolean {
    const existing = _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform_name.value === platformName);
    return !!existing;
  }

  getOwnedPlatformWithID(platformID: number): MyGamePlatform {
    return _.find(this.myPlatformsInGlobal, myPlatform => myPlatform.platform.id.value === platformID);
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
    return _.filter(this.myPlatforms, myPlatform => myPlatform.platform.isAvailableForMe());
  }

  findPlatformWithIGDBID(igdbID: number): AvailableGamePlatform {
    return _.find(this.availablePlatforms, availablePlatform => availablePlatform.platform.igdb_platform_id.value === igdbID);
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

  get addablePlatforms(): AvailableGamePlatform[] {
    return _.filter(this._availablePlatforms, availablePlatform => availablePlatform.canAddToGame());
  }

  get availablePlatformsNotInGlobal(): AvailableGamePlatform[] {
    return _.filter(this._availablePlatforms, availablePlatform => !availablePlatform.gamePlatform.isAvailableForMe());
  }

  get myMutablePlatforms(): MyGamePlatform[] {
    return _.filter(this.myPlatformsInGlobal, myGamePlatform => myGamePlatform.canAddPlaytime());
  }

  getImageUrl(): string {
    if (!!this.igdb_poster.value && this.igdb_poster.value !== '') {
      return 'https://images.igdb.com/igdb/image/upload/t_720p/' + this.igdb_poster.value +  '.jpg';
    } else if (!!this.logo.value && this.logo.value !== '') {
      return 'https://cdn.edgecast.steamstatic.com/steam/apps/' + this.steamid.value + '/header.jpg';
    } else if (!!this.giantbomb_medium_url.value && this.giantbomb_medium_url.value !== '') {
      return this.giantbomb_medium_url.value;
    } else {
      return 'images/GenericSeries.gif';
    }
  }

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
    return !_.isEmpty(this.myPlatformsInGlobal);
  }

  getLastPlayed(): Date {
    const allLastPlayed = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.last_played.originalValue);
    const max = _.max(allLastPlayed);
    return max > 0 ? max : null;
  }

  getOwnershipDateAdded(): Date {
    const allDateAdded = _.map(this.myPlatformsInGlobal, myPlatform => myPlatform.collection_add.originalValue);
    const max = _.max(allDateAdded);
    return max > 0 ? max : null;
  }

  get myPreferredPlatform(): MyGamePlatform {
    const allPreferred = _.filter(this.myPlatformsInGlobal, myPlatform => myPlatform.preferred.originalValue === true);
    if (this.myPlatformsInGlobal.length > 0 && allPreferred.length !== 1) {
      throw new Error('Game should have exactly one preferred platform.');
    }
    return allPreferred[0];
  }

  get myPreferredPlatformNullAllowed(): MyGamePlatform {
    const allPreferred = _.filter(this.myPlatformsInGlobal, myPlatform => myPlatform.preferred.originalValue === true);
    if (allPreferred.length === 0) {
      return undefined;
    } else {
      return allPreferred[0];
    }
  }

  get myRating(): number {
    const preferred = this.myPreferredPlatform;
    return !preferred ? null : preferred.rating.originalValue;
  }

  get bestMetacritic(): number {
    const allMetacritics = _.map(this.availablePlatforms, availablePlatform => availablePlatform.metacritic.originalValue);
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

  getApiMethod(): string {
    return 'games';
  }

  discardChanges(): void {
    super.discardChanges();
    for (const myPlatform of this.myPlatforms) {
      myPlatform.discardChanges();
    }
  }
}
