import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {PersonGame} from '../interfaces/PersonGame';
import {GameplaySession} from '../interfaces/GameplaySession';
import {Person} from '../interfaces/Person';
import {AuthService} from './auth.service';

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
  private person: Person;

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private authService: AuthService) {
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

  async getPersonID(): Promise<number> {
    return new Promise<number>(async resolve => {
      if (!this.person) {
        this.person = await this.authService.getPerson();
      }
      resolve(this.person.id);
    });
  }

  private async refreshCache(): Promise<Game[]> {
    const personID = await this.getPersonID();
    const payload = {
      person_id: personID.toString()
    };
    const options = {
      params: payload
    };
    const gameObjs = await this.http.get<any[]>(this.gamesUrl, options).toPromise();
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

  async addToMyGames(game: Game): Promise<any> {
    const personID = await this.getPersonID();
    const payload = {
      game_id: game.id,
      person_id: personID
    };
    const returnObj = await this.http.post<any>(this.personGamesUrl, payload).toPromise();
    game.personGame = new PersonGame(returnObj);
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
