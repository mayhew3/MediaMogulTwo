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
      personGames: [],
      gameplaySessions: [] as GameplaySession[],
      persons: this.persons,
      igdbMatches: [],
      gamePlatforms: this.gamePlatforms,
      resolve: [],
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
    }
    return null;
  }

  // noinspection JSUnusedGlobalSymbols
  post(requestInfo: RequestInfo): Observable<Response> {
    console.log('HTTP override: POST');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'games') {
      this.addGame(requestInfo);
    } else if (collectionName === 'personGames') {
      this.addPersonGame(requestInfo);
    }
    return null;
  }

  // noinspection JSUnusedGlobalSymbols
  put(requestInfo: RequestInfo): Observable<Response> {
    console.log('HTTP override: PUT');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'games') {
      this.updateGame(requestInfo);
    } else if (collectionName === 'personGames') {
      this.updatePersonGame(requestInfo);
    } else if (collectionName === 'resolve') {
      this.packageUpResponse(this.getBody(requestInfo), requestInfo);
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
      const person_games = gameCopy.person_games;
      gameCopy.personGame = _.findWhere(person_games, {person_id: person_id});
      delete gameCopy.person_games;
      data.push(gameCopy);
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
    this.updatePlatforms(game.availablePlatforms, this.getAvailablePlatforms());
    const personGame = game.personGame;
    if (!!personGame) {
      personGame.id = this.nextPersonGameID();
      personGame.game_id = game.id;
      personGame.date_added = new Date();
      this.updatePlatforms(personGame.myPlatforms, this.getMyPlatforms());
    }
    return this.packageUpResponse(game, requestInfo);
  }

  private addPersonGame(requestInfo: RequestInfo) {
    const personGame = this.getBody(requestInfo);
    personGame.id = this.nextPersonGameID();
    personGame.date_added = new Date();
    this.updatePlatforms(personGame.myPlatforms, this.getMyPlatforms());
    return this.packageUpResponse(personGame, requestInfo);
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

  private updatePersonGame(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const personGame = this.findPersonGame(jsonBody.id);
    if (!!personGame) {
      this.updateChangedFieldsOnObject(personGame, jsonBody.changedFields);
      return this.packageUpResponse(personGame, requestInfo);
    }
  }

  private findGame(gameID: number): any {
    return _.findWhere(this.games, {id: gameID});
  }

  private getPersonGames(): any[] {
    const ownedGames = _.filter(this.games, game => !!game.person_games);
    return _.flatten(_.map(ownedGames, game => game.person_games));
  }

  private getAvailablePlatforms(): any[] {
    return _.flatten(_.map(this.games, game => game.availablePlatforms));
  }

  private getMyPlatforms(): any[] {
    return _.flatten(_.map(this.getPersonGames(), personGame => personGame.myPlatforms));
  }

  private findPersonGame(personGameID: number): any {
    const personGames = this.getPersonGames();
    return _.findWhere(personGames, {id: personGameID});
  }

  private nextID(array: any[]): number {
    const ids = _.map(array, item => parseInt(item.id));
    return ids.length > 0 ? _.max(ids) + 1 : 1;
  }

  private nextGameID(): number {
    return this.nextID(this.games);
  }

  private nextPersonGameID(): number {
    const personGames = this.getPersonGames();
    return this.nextID(personGames);
  }

  private nextAvailablePlatformID(): number {
    const availablePlatforms = this.getAvailablePlatforms();
    return this.nextID(availablePlatforms);
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
