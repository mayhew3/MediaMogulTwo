import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {PersonGame} from '../interfaces/PersonGame';
import {GameplaySession} from '../interfaces/GameplaySession';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gamesUrl = 'api/games';
  personGamesUrl = 'api/personGames';
  gameplaySessionUrl = 'api/gameplaySessions';
  cache: Game[];

  constructor(private http: HttpClient,
              private arrayService: ArrayService) {
    this.cache = [];
  }

  async maybeRefreshCache(): Promise<Game[]> {
    return new Promise(async resolve => {
      if (this.cache.length > 0) {
        resolve(this.cache);
      } else {
        resolve(await this.refreshCache());
      }
    });
  }

  private async refreshCache(): Promise<Game[]> {
    const gameObjs = await this.http.get<any[]>(this.gamesUrl).toPromise();
    const games = this.convertObjectsToGames(gameObjs);
    this.arrayService.refreshArray(this.cache, games);
    return this.cache;
  }

  convertObjectsToGames(gameObjs: any[]): Game[] {
    return _.map(gameObjs, gameObj => new Game(gameObj));
  }

  async addGame(gameObj: any): Promise<Game> {
    const returnObj = await this.http.post<any>(this.gamesUrl, gameObj).toPromise();
    const returnGame = new Game(returnObj);
    this.cache.push(returnGame);
    return returnGame;
  }

  async updateGame(game: Game, changedFields): Promise<any> {
    const payload = {id: game.id, changedFields};
    await this.http.put(this.gamesUrl, payload, httpOptions).toPromise();
    this.updateChangedFieldsOnObject(game, changedFields);
  }

  async updatePersonGame(game: Game, changedFields): Promise<any> {
    const personGame = game.personGame;
    const payload = {id: personGame.id, changedFields};
    await this.http.put(this.personGamesUrl, payload, httpOptions).toPromise();
    this.updateChangedFieldsOnObject(personGame, changedFields);
  }

  async insertGameplaySession(gameplaySession: any): Promise<any> {
    await this.http.post<GameplaySession>(this.gameplaySessionUrl, gameplaySession, httpOptions).toPromise();
  }

  // noinspection JSMethodCanBeStatic
  private updateChangedFieldsOnObject(obj: any, changedFields: any) {
    for (const key in changedFields) {
      if (changedFields.hasOwnProperty(key)) {
        obj[key] = changedFields[key];
      }
    }
  }

}
