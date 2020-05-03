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

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games = MockGames;
  persons = MockPersons;
  gamePlatforms = MockGamePlatforms;

  // STATIC HELPERS

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }


  constructor() { }

  createDb(): {} {
    return {
      games: this.games,
      gameplaySessions: [] as GameplaySession[],
      persons: this.persons,
      igdbMatches: [],
      gamePlatforms: this.gamePlatforms,
      resolve: [],
      myPlatforms: [],
      availablePlatforms: [],
      myGlobalPlatforms: [],
    };
  }

  // noinspection JSUnusedGlobalSymbols
  genId(sessions: GameplaySession[]): number {
    return sessions.length > 0 ? _.max(sessions.map(session => session.id)) + 1 : 1;
  }


  // HTTP OVERRIDES

  get(requestInfo: RequestInfo) {
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

  private getGames(requestInfo: RequestInfo): Observable<ResponseOptions> {
    const entries = requestInfo.query.entries();
    const person_id = parseInt(entries.next().value[1][0]);

    const data = [];

    _.forEach(this.games, game => {
      const gameCopy = lodash.cloneDeep(game);
      _.forEach(gameCopy.availablePlatforms, availablePlatform => {
        const myPlatforms = availablePlatform.myPlatforms;
        availablePlatform.myPlatform = _.findWhere(myPlatforms, {person_id: person_id});
        delete availablePlatform.myPlatforms;
      });
      data.push(gameCopy);
    });

    return this.packageGetData(data, requestInfo);
  }

  private getGamePlatforms(requestInfo: RequestInfo): Observable<ResponseOptions> {
    const entries = requestInfo.query.entries();
    const person_id = parseInt(entries.next().value[1][0]);

    const data = [];

    _.forEach(this.gamePlatforms, gamePlatform => {
      const gamePlatformCopy = lodash.cloneDeep(gamePlatform);
      const myPlatforms = gamePlatformCopy.my_platforms;
      if (!!myPlatforms) {
        gamePlatformCopy.myPlatform = _.findWhere(myPlatforms, {person_id: person_id});
        delete gamePlatformCopy.my_platforms;
      }

      data.push(gamePlatformCopy);
    });

    return this.packageGetData(data, requestInfo);
  }

  private getIGDBMatches(requestInfo: RequestInfo): Observable<ResponseOptions> {
    return this.packageGetData(MockIGDBMatches, requestInfo);
  }

  private updateGame(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const game = this.findGame(jsonBody.id);
    if (!!game) {
      this.updateChangedFieldsOnObject(game, jsonBody.changedFields);
      return this.packageUpResponse(game, requestInfo);
    }
  }

  private addGame(requestInfo: RequestInfo) {
    const game = this.getBody(requestInfo);
    game.id = this.nextGameID();
    game.date_added = new Date();
    this.updatePlatforms(game.availablePlatforms, this.getAllAvailablePlatforms());
    return this.packageUpResponse(game, requestInfo);
  }

  private addAvailablePlatform(requestInfo: RequestInfo) {
    const availablePlatform = this.getBody(requestInfo);
    availablePlatform.id = this.nextAvailablePlatformID();
    availablePlatform.date_added = new Date();
    const game = this.findGame(availablePlatform.game_id);
    game.availablePlatforms.push(availablePlatform);
    return this.packageUpResponse(availablePlatform, requestInfo);
  }

  private addMyGlobalPlatform(requestInfo: RequestInfo) {
    const myGlobalPlatform = this.getBody(requestInfo);
    const gamePlatform = this.findGamePlatform(myGlobalPlatform.game_platform_id);
    myGlobalPlatform.id = this.nextMyGlobalPlatformID();
    myGlobalPlatform.date_added = new Date();
    if (!gamePlatform.my_platforms) {
      gamePlatform.my_platforms = [];
    }
    gamePlatform.my_platforms.push(myGlobalPlatform);
    return this.packageUpResponse(myGlobalPlatform, requestInfo);
  }

  private addMyPlatform(requestInfo: RequestInfo) {
    const myGamePlatform = this.getBody(requestInfo);
    myGamePlatform.id = this.nextMyPlatformID();
    myGamePlatform.date_added = new Date();
    const availableGamePlatform = this.findAvailableGamePlatform(myGamePlatform.available_game_platform_id);
    if (!availableGamePlatform.myPlatforms) {
      availableGamePlatform.myPlatforms = [];
    }
    availableGamePlatform.myPlatforms.push(myGamePlatform);
    return this.packageUpResponse(myGamePlatform, requestInfo);
  }

  private updatePlatforms(array: any[], masterList: any[]) {
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
        igdb_name: platformWrapper.igdb_name
      }
      this.gamePlatforms.push(gamePlatform);
      return gamePlatform;
    } else {
      return existing;
    }
  }

  private updateGamePlatform(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const gamePlatform = this.findGamePlatform(jsonBody.id);
    if (!!gamePlatform) {
      const changedFields = jsonBody.changedFields;
      const old_name = gamePlatform.full_name;
      this.updateChangedFieldsOnObject(gamePlatform, changedFields);
      const full_name = changedFields.full_name;
      if (!!full_name && full_name !== old_name) {
        this.updateAllAvailablePlatformsWithName(old_name, full_name);
        this.updateAllMyPlatformsWithName(old_name, full_name);
      }
      return this.packageUpResponse(gamePlatform, requestInfo);
    }
  }

  private updateMyGlobalPlatform(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const myGlobalPlatform = this.findMyGlobalPlatform(jsonBody.id);
    if (!!myGlobalPlatform) {
      this.updateChangedFieldsOnObject(myGlobalPlatform, jsonBody.changedFields);
      return this.packageUpResponse(myGlobalPlatform, requestInfo);
    }
  }

  private deleteMyGlobalPlatform(requestInfo: RequestInfo) {
    const myGlobalPlatformID = parseInt(requestInfo.id);
    const myGlobalPlatform = this.findMyGlobalPlatform(myGlobalPlatformID);
    if (!!myGlobalPlatform) {
      const gamePlatform = this.findGamePlatform(myGlobalPlatform.game_platform_id);
      ArrayUtil.removeFromArray(gamePlatform.my_platforms, myGlobalPlatform);
      return this.packageUpResponse({}, requestInfo);
    }
  }

  private updateMyGamePlatform(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const myGamePlatform = this.findMyGamePlatform(jsonBody.id);
    if (!!myGamePlatform) {
      this.updateChangedFieldsOnObject(myGamePlatform, jsonBody.changedFields);
      return this.packageUpResponse(myGamePlatform, requestInfo);
    }
  }

  private updateAllAvailablePlatformsWithName(oldName: string, newName: string) {
    const withName = _.where(this.getAllAvailablePlatforms(), {platform_name: oldName});
    withName.forEach(availablePlatform => availablePlatform.platform_name = newName);
  }

  private updateAllMyPlatformsWithName(oldName: string, newName: string) {
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

  private getAllMyPlatforms(): any[] {
    const availablePlatforms = this.getAllAvailablePlatforms();
    return _.flatten(_.map(_.filter(availablePlatforms, availablePlatform => !!availablePlatform.myPlatforms), availablePlatform => {
      return availablePlatform.myPlatforms;
    }));
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
        return parseInt(item.id)
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
  private updateChangedFieldsOnObject(obj: any, changedFields: any) {
    for (const key in changedFields) {
      if (changedFields.hasOwnProperty(key)) {
        obj[key] = changedFields[key];
      }
    }
  }

  // noinspection JSMethodCanBeStatic
  private getBody(requestInfo): any {
    return requestInfo.utils.getJsonBody(requestInfo.req);
  }

  // noinspection JSMethodCanBeStatic
  private packageGetData(data, requestInfo: RequestInfo): Observable<ResponseOptions> {
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

  private packageUpResponse(body, requestInfo): Observable<ResponseOptions> {
    const options: ResponseOptions = {
      body,
      status: STATUS.OK
    };
    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

}
