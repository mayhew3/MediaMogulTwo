import { Injectable } from '@angular/core';
import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {MockGames} from '../mocks/games.mock';
import {Observable} from 'rxjs';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  games = MockGames;

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
    };
  }


  // HTTP OVERRIDES


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


  private updateGame(requestInfo: RequestInfo) {
    const jsonBody = this.getBody(requestInfo);
    const game = _.findWhere(this.games, {id: jsonBody.id});
    if (!!game) {
      this.updateChangedFieldsOnObject(game, jsonBody.changedFields);
      return this.packageUpResponse(game, requestInfo);
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

  private findPersonGame(personGameID: number): any {
    const personGames = _.map(this.games, game => game.personGame);
    return _.findWhere(personGames, {id: personGameID});
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

  private packageUpResponse(body, requestInfo) {
    const options: ResponseOptions = {
      body,
      status: STATUS.OK
    };
    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

}
