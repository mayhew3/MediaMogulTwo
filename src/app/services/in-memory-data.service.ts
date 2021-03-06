import {Injectable} from '@angular/core';
import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {MockGames} from '../mocks/games.mock';
import {Observable} from 'rxjs';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import * as lodash from 'lodash';
import {MockPersons} from '../mocks/persons.mock';
import {MockIGDBMatches} from '../mocks/igdb.matches.mock';
import {MockGamePlatforms} from '../mocks/gamePlatforms.mock';
import {ArrayUtil} from '../utility/ArrayUtil';
import {MockGameplaySessions} from '../mocks/gameplaySessions.mock';
import {InMemoryCallbacksService} from './in-memory-callbacks.service';
import {MyGlobalPlatformAddedMessage} from '../../shared/MyGlobalPlatformAddedMessage';
import {MyGlobalPlatformRemovedMessage} from '../../shared/MyGlobalPlatformRemovedMessage';
import {MyGlobalPlatformsRanksChangedMessage} from '../../shared/MyGlobalPlatformsRanksChangedMessage';
import {UpdateMyGamePlatformMessage} from '../../shared/UpdateMyGamePlatformMessage';
import {LoggerService} from './logger.service';
import {UpdateGameMessage} from '../../shared/UpdateGameMessage';
import {AddGameplaySessionMessage} from '../../shared/AddGameplaySessionMessage';
import {MyGamePlatformData} from '../interfaces/ModelData/MyGamePlatformData';
import {ChangePreferredPlatformMessage} from '../../shared/ChangePreferredPlatformMessage';
import {AvailableGamePlatformData} from '../interfaces/Model/AvailableGamePlatform';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games = MockGames;
  persons = MockPersons;
  gamePlatforms = MockGamePlatforms;
  gameplaySessions = MockGameplaySessions;

  constructor(private callbackService: InMemoryCallbacksService,
              private logger: LoggerService) { }

  // STATIC HELPERS

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo): ResponseOptions {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }

  createDb(): Record<string, unknown> {
    return {
      games: this.games,
      gameplaySessions: this.gameplaySessions,
      persons: this.persons,
      igdbMatches: [],
      gamePlatforms: this.gamePlatforms,
      resolve: [],
      myPlatforms: [],
      availablePlatforms: [],
      myGlobalPlatforms: [],
      multipleGlobals: [],
    };
  }

  // noinspection JSUnusedGlobalSymbols
  genId(sessions: GameplaySession[]): number {
    return sessions.length > 0 ? _.max(sessions.map(session => session.id)) as number + 1 : 1;
  }

  /* SOCKET METHODS */

  on(channel, callback): void {
    this.callbackService.on(channel, callback);
  }

  off(channel, callback): void {
    this.callbackService.off(channel, callback);
  }

  getCallbacks(channel): any[] {
    return this.callbackService.getCallbacks(channel);
  }

  broadcastToChannel(channel, msg): void {
    const callbacks = this.getCallbacks(channel);
    _.forEach(callbacks, callback => callback(msg));
  }


  // HTTP OVERRIDES

  get(requestInfo: RequestInfo): Observable<Response> {
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'games') {
      return this.getGames(requestInfo);
    } else if (collectionName === 'igdbMatches') {
      return this.getIGDBMatches(requestInfo);
    } else if (collectionName === 'gamePlatforms') {
      return this.getGamePlatforms(requestInfo);
    }
    return null;
  }

  // noinspection JSUnusedGlobalSymbols
  post(requestInfo: RequestInfo): Observable<Response> {
    console.log('HTTP override: POST');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'games') {
      this.addGame(requestInfo);
    } else if (collectionName === 'myPlatforms') {
      this.addMyPlatform(requestInfo);
    } else if (collectionName === 'availablePlatforms') {
      this.addAvailablePlatform(requestInfo);
    } else if (collectionName === 'myGlobalPlatforms') {
      this.addMyGlobalPlatform(requestInfo);
    } else if (collectionName === 'gameplaySessions') {
      this.addGameplaySession(requestInfo);
    } else if (collectionName === 'changePreferredPlatform') {
      this.changePreferredPlatform(requestInfo);
    }
    return null;
  }

  // noinspection JSUnusedGlobalSymbols
  put(requestInfo: RequestInfo): Observable<Response> {
    console.log('HTTP override: PUT');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'games') {
      this.updateGame(requestInfo);
    } else if (collectionName === 'resolve') {
      this.packageUpResponse(this.getBody(requestInfo), requestInfo);
    } else if (collectionName === 'myPlatforms') {
      this.updateMyGamePlatform(requestInfo);
    } else if (collectionName === 'gamePlatforms') {
      this.updateGamePlatform(requestInfo);
    } else if (collectionName === 'myGlobalPlatforms') {
      this.updateMyGlobalPlatform(requestInfo);
    } else if (collectionName === 'multipleGlobals') {
      this.updateMultipleGlobals(requestInfo);
    }
    return null;
  }

  // noinspection JSUnusedGlobalSymbols
  delete(requestInfo: RequestInfo): Observable<Response> {
    console.log('HTTP override: DELETE');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'myGlobalPlatforms') {
      this.deleteMyGlobalPlatform(requestInfo);
    }
    return null;
  }


  // DOMAIN HELPERS

  private getGames(requestInfo: RequestInfo): Observable<Response> {
    const person_id = +requestInfo.query.get('person_id')[0];

    const data = [];

    _.forEach(this.games, game => {
      const gameCopy = lodash.cloneDeep(game);
      _.forEach(gameCopy.availablePlatforms, availablePlatform => {
        const myPlatforms = availablePlatform.myPlatforms;
        availablePlatform.myGamePlatform = _.findWhere(myPlatforms, {person_id});
        delete availablePlatform.myPlatforms;
      });
      data.push(gameCopy);
  });

    return this.packageGetData(data, requestInfo);
  }

  private getGamePlatforms(requestInfo: RequestInfo): Observable<Response> {
    const person_id = +requestInfo.query.get('person_id')[0];

    const data = [];

    _.forEach(this.gamePlatforms, gamePlatform => {
      const gamePlatformCopy = lodash.cloneDeep(gamePlatform);
      const myPlatforms = gamePlatformCopy.my_platforms;
      if (!!myPlatforms) {
        gamePlatformCopy.myGlobalPlatform = _.findWhere(myPlatforms, {person_id});
        delete gamePlatformCopy.my_platforms;
      }

      data.push(gamePlatformCopy);
    });

    return this.packageGetData(data, requestInfo);
  }

  private getIGDBMatches(requestInfo: RequestInfo): Observable<Response> {
    return this.packageGetData(MockIGDBMatches, requestInfo);
  }

  private updateGame(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = this.getBody(requestInfo);
    const game = this.findGame(jsonBody.id);
    if (!!game) {
      ArrayUtil.updateChangedFieldsOnObject(game, jsonBody.changedFields);

      const msg: UpdateGameMessage = {
        game
      }

      this.broadcastToChannel('update_game', msg);

      return this.packageUpResponse({msg: 'Success!'}, requestInfo);
    }
  }

  private addGame(requestInfo: RequestInfo): Observable<Response> {
    const game = this.getBody(requestInfo);
    game.id = this.nextGameID();
    game.date_added = new Date();
    this.updatePlatforms(game.availablePlatforms, this.getAllAvailablePlatforms());
    return this.packageUpResponse(game, requestInfo);
  }

  private addGameplaySession(requestInfo: RequestInfo): Observable<Response> {
    const gameplaySession = this.getBody(requestInfo);
    gameplaySession.id = this.nextID(this.gameplaySessions);
    gameplaySession.date_added = new Date();
    this.gameplaySessions.push(gameplaySession);

    const msg: AddGameplaySessionMessage = {
      gameplaySession
    }

    this.broadcastToChannel('add_gameplay_session', msg);

    return this.packageUpResponse({msg: 'Success!'}, requestInfo);
  }

  private addAvailablePlatform(requestInfo: RequestInfo): Observable<Response> {
    const availablePlatform = this.getBody(requestInfo);
    availablePlatform.id = this.nextAvailablePlatformID();
    availablePlatform.date_added = new Date();
    const game = this.findGame(availablePlatform.game_id);
    game.availablePlatforms.push(availablePlatform);
    return this.packageUpResponse(availablePlatform, requestInfo);
  }

  private addMyGlobalPlatform(requestInfo: RequestInfo): Observable<Response> {
    const myGlobalPlatform = this.getBody(requestInfo);
    const gamePlatform = this.findGamePlatform(myGlobalPlatform.game_platform_id);
    myGlobalPlatform.id = this.nextMyGlobalPlatformID();
    myGlobalPlatform.date_added = new Date();
    if (!gamePlatform.my_platforms) {
      gamePlatform.my_platforms = [];
    }
    gamePlatform.my_platforms.push(myGlobalPlatform);

    const msg: MyGlobalPlatformAddedMessage = {
      myGlobalPlatform
    }

    this.broadcastToChannel('my_platform_added', msg);

    return this.packageUpResponse(myGlobalPlatform, requestInfo);
  }

  private addMyPlatform(requestInfo: RequestInfo): Observable<Response> {
    const myGamePlatform = {...(this.getBody(requestInfo))};
    myGamePlatform.id = this.nextMyPlatformID();
    myGamePlatform.date_added = new Date();
    const availableGamePlatform = this.findAvailableGamePlatform(myGamePlatform.available_game_platform_id);
    if (!availableGamePlatform.myPlatforms) {
      availableGamePlatform.myPlatforms = [];
    }
    availableGamePlatform.myPlatforms.push(myGamePlatform);

    const msg = {
      myPlatform: myGamePlatform
    };

    this.broadcastToChannel('my_game_added', msg);

    return this.packageUpResponse(myGamePlatform, requestInfo);
  }

  private updatePlatforms(array: any[], masterList: any[]): void {
    const newPlatforms = _.filter(array, platform => !platform.game_platform_id);
    _.forEach(newPlatforms, platform => {
      platform.gamePlatform = this.getOrCreateGamePlatform(platform);
      platform.game_platform_id = platform.gamePlatform.id;
    });

    const newPlatformWrappers = _.filter(array, platform => !platform.id);
    _.forEach(newPlatformWrappers, platform => {
      platform.id = this.nextID(masterList);
    });
  }

  private getOrCreateGamePlatform(platformWrapper: any): any {
    const existing = _.findWhere(this.gamePlatforms, {full_name: platformWrapper.full_name});
    if (!existing) {
      const gamePlatform = {
        id: this.nextGamePlatformID(),
        full_name: platformWrapper.full_name,
        short_name: platformWrapper.short_name,
        igdb_platform_id: platformWrapper.igdb_platform_id,
        igdb_name: platformWrapper.igdb_name,
        my_platforms: []
      };
      this.gamePlatforms.push(gamePlatform);
      return gamePlatform;
    } else {
      return existing;
    }
  }

  private updateGamePlatform(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = this.getBody(requestInfo);
    const gamePlatform = this.findGamePlatform(jsonBody.id);
    if (!!gamePlatform) {
      const changedFields = jsonBody.changedFields;
      const old_name = gamePlatform.full_name;
      ArrayUtil.updateChangedFieldsOnObject(gamePlatform, changedFields);
      const full_name = changedFields.full_name;
      if (!!full_name && full_name !== old_name) {
        this.updateAllAvailablePlatformsWithName(old_name, full_name);
        this.updateAllMyPlatformsWithName(old_name, full_name);
      }

      this.broadcastToChannel('update_global_platform', {
        global_platform_id: jsonBody.id,
        full_name: changedFields.full_name,
        short_name: changedFields.short_name,
        metacritic_uri: changedFields.metacritic_uri
      });

      return this.packageUpResponse(gamePlatform, requestInfo);
    }
  }

  private updateMyGlobalPlatform(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = this.getBody(requestInfo);
    const myGlobalPlatform = this.findMyGlobalPlatform(jsonBody.id);
    if (!!myGlobalPlatform) {
      ArrayUtil.updateChangedFieldsOnObject(myGlobalPlatform, jsonBody.changedFields);
      return this.packageUpResponse(myGlobalPlatform, requestInfo);
    }
  }

  private updateMultipleGlobals(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = this.getBody(requestInfo);
    const msg: MyGlobalPlatformsRanksChangedMessage = {
      changes: []
    };
    for (const payload of jsonBody.payloads) {
      const myGlobalPlatform = this.findMyGlobalPlatform(payload.id);
      if (!!myGlobalPlatform) {
        ArrayUtil.updateChangedFieldsOnObject(myGlobalPlatform, payload.changedFields);

        msg.changes.push({
          my_global_platform_id: myGlobalPlatform.id,
          rank: myGlobalPlatform.rank
        });
      }
    }

    this.broadcastToChannel('my_global_ranks_changed', msg);

    return this.packageUpResponse({msg: 'Success!'}, requestInfo);
  }

  private deleteMyGlobalPlatform(requestInfo: RequestInfo): Observable<Response> {
    const myGlobalPlatformID = +requestInfo.id;
    const myGlobalPlatform = this.findMyGlobalPlatform(myGlobalPlatformID);
    if (!!myGlobalPlatform) {
      const gamePlatform = this.findGamePlatform(myGlobalPlatform.game_platform_id);
      ArrayUtil.removeFromArray(gamePlatform.my_platforms, myGlobalPlatform);

      const msg: MyGlobalPlatformRemovedMessage = {
        game_platform_id: myGlobalPlatform.game_platform_id
      }

      this.broadcastToChannel('my_platform_removed', msg);

      return this.packageUpResponse({}, requestInfo);
    }
  }

  // noinspection JSUnusedLocalSymbols
  private logReadOnly(): void {
    let readOnly = 0;
    let writeable = 0;
    _.chain(this.games)
      .map(g => g.availablePlatforms)
      .flatten()
      .filter(a => !!a.myPlatforms)
      .map(a => a.myPlatforms)
      .flatten()
      .filter(n => !!n.rating)
      .each(n => {
        if (Object.getOwnPropertyDescriptor(n, 'rating').writable) {
          writeable++;
        } else {
          readOnly++;
        }
      });
    this.logger.log(`Read-only: ${readOnly}, Writeable: ${writeable}`);
  }

  private updateMyGamePlatform(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = this.getBody(requestInfo);
    const myGamePlatform = this.findMyGamePlatform(jsonBody.id);
    if (!!myGamePlatform) {

      ArrayUtil.updateChangedFieldsOnObject(myGamePlatform, jsonBody.changedFields);

      const msg: UpdateMyGamePlatformMessage = {
        my_game_platform: myGamePlatform
      }

      this.broadcastToChannel('update_my_game_platform', msg);

      return this.packageUpResponse({msg: 'Success!'}, requestInfo);
    }
  }

  private changePreferredPlatform(requestInfo: RequestInfo): Observable<Response> {
    const jsonBody = this.getBody(requestInfo);
    const myGamePlatform = this.findMyGamePlatform(jsonBody.id);
    if (!!myGamePlatform) {
      const availablePlatform: AvailableGamePlatformData = this.findAvailableGamePlatform(myGamePlatform.available_game_platform_id);
      const game = this.getGame(availablePlatform);
      const currentPreferred = this.getPreferredPlatform(game);
      if (!!currentPreferred) {
        currentPreferred.preferred = false;
      }
      myGamePlatform.preferred = true;

      const msg: ChangePreferredPlatformMessage = {
        my_game_platform_id: jsonBody.id
      };

      this.broadcastToChannel('change_preferred_platform', msg);

      return this.packageUpResponse({msg: 'Success!'}, requestInfo);
    }
  }

  private updateAllAvailablePlatformsWithName(oldName: string, newName: string): void {
    const withName = _.where(this.getAllAvailablePlatforms(), {platform_name: oldName});
    withName.forEach(availablePlatform => availablePlatform.platform_name = newName);
  }

  private updateAllMyPlatformsWithName(oldName: string, newName: string): void {
    const withName = _.where(this.getAllMyPlatforms(), {platform_name: oldName});
    withName.forEach(myPlatform => myPlatform.platform_name = newName);
  }

  private findGame(gameID: number): any {
    return _.findWhere(this.games, {id: gameID});
  }

  private findGamePlatform(gamePlatformID: number): any {
    return _.findWhere(this.gamePlatforms, {id: gamePlatformID});
  }

  private getAllAvailablePlatforms(): any[] {
    return _.flatten(_.map(this.games, game => game.availablePlatforms));
  }

  private getAllMyGlobalPlatforms(): any[] {
    return _.flatten(_.map(this.gamePlatforms, gamePlatform => gamePlatform.my_platforms));
  }

  private getGame(availableGamePlatform: AvailableGamePlatformData): any {
    return _.find(this.games, game => !!_.findWhere(game.availablePlatforms, {id: availableGamePlatform.id}));
  }

  private getPreferredPlatform(game: any): MyGamePlatformData {
    return _.chain(game.availablePlatforms)
      .flatten()
      .map(a => a.myPlatforms)
      .flatten()
      .filter(m => !!m.preferred)
      .first()
      .value();
  }

  private getAllMyPlatforms(): any[] {
    const availablePlatforms = this.getAllAvailablePlatforms();
    return _.flatten(_.map(_.filter(availablePlatforms, availablePlatform => !!availablePlatform.myPlatforms), availablePlatform => availablePlatform.myPlatforms));
  }

  private findAvailableGamePlatform(availablePlatformID: number): any {
    const availablePlatforms = this.getAllAvailablePlatforms();
    return _.findWhere(availablePlatforms, {id: availablePlatformID});
  }

  private findMyGamePlatform(myGamePlatformID: number): any {
    const myGamePlatforms = this.getAllMyPlatforms();
    return _.findWhere(myGamePlatforms, {id: myGamePlatformID});
  }

  private findMyGlobalPlatform(myGlobalPlatformID: number): any {
    const myGlobalPlatforms = this.getAllMyGlobalPlatforms();
    return _.findWhere(myGlobalPlatforms, {id: myGlobalPlatformID});
  }

  private nextID(array: any[]): number {
    const ids = _.map(array, item => {
      if (item === undefined) {
        return undefined;
      } else {
        return +item.id;
      }
    });
    const max = _.max(ids);
    return ids.length > 0 ? max + 1 : 1;
  }

  private nextGameID(): number {
    return this.nextID(this.games);
  }

  private nextAvailablePlatformID(): number {
    const availablePlatforms = this.getAllAvailablePlatforms();
    return this.nextID(availablePlatforms);
  }

  private nextMyGlobalPlatformID(): number {
    const myGlobalPlatforms = this.getAllMyGlobalPlatforms();
    return this.nextID(myGlobalPlatforms);
  }

  private nextMyPlatformID(): number {
    const myPlatforms = this.getAllMyPlatforms();
    return this.nextID(myPlatforms);
  }

  private nextGamePlatformID(): number {
    return this.nextID(this.gamePlatforms);
  }


  // DOMAIN-INDEPENDENT HELPERS

  // noinspection JSMethodCanBeStatic
  private getBody(requestInfo): any {
    return requestInfo.utils.getJsonBody(requestInfo.req);
  }

  // noinspection JSMethodCanBeStatic
  private packageGetData(data, requestInfo: RequestInfo): Observable<Response> {
    const dataEncapsulation = requestInfo.utils.getConfig().dataEncapsulation;
    const options: ResponseOptions = data ?
      {
        body: dataEncapsulation ? { data } : data,
        status: STATUS.OK
      } :
      {
        body: dataEncapsulation ? { } : data,
        status: STATUS.OK
      };
    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);
    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

  private packageUpResponse(body, requestInfo): Observable<Response> {
    const options: ResponseOptions = {
      body,
      status: STATUS.OK
    };
    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

}
