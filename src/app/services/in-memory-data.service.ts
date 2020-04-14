import { Injectable } from '@angular/core';
import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {MockGames} from '../mocks/games.mock';
import {Observable} from 'rxjs';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import * as lodash from 'lodash';
import {MockPersons} from '../mocks/persons.mock';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games = MockGames;
  persons = MockPersons;

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
    }
    return null;
  }

  post(requestInfo: RequestInfo): Observable<Response> {
    console.log('HTTP override: POST');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'personGames') {
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

  private updateGame(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const game = this.findGame(jsonBody.id);
    if (!!game) {
      this.updateChangedFieldsOnObject(game, jsonBody.changedFields);
      return this.packageUpResponse(game, requestInfo);
    }
  }

  private addPersonGame(requestInfo: RequestInfo) {
    const body = this.getBody(requestInfo);
    const personGame = {
      id: this.nextPersonGameID(),
      person_id: body.person_id,
      tier: 1,
      minutes_played: 0
    };
    const game = this.findGame(body.game_id);
    if (!!game) {
      game.personGame = personGame;
      return this.packageUpResponse(personGame, requestInfo);
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
    return _.map(_.filter(this.games, game => !!game.personGame), game => game.personGame);
  }

  private findPersonGame(personGameID: number): any {
    const personGames = this.getPersonGames();
    return _.findWhere(personGames, {id: personGameID});
  }

  private nextPersonGameID(): number {
    const personGames = this.getPersonGames();
    // tslint:disable-next-line:radix
    const ids = _.map(personGames, personGame => parseInt(personGame.id));
    const maximum = _.max(ids);
    return maximum + 1;
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

  private packageUpResponse(body, requestInfo) {
    const options: ResponseOptions = {
      body,
      status: STATUS.OK
    };
    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

}
