import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {PersonGame} from '../interfaces/Model/PersonGame';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {Observable} from 'rxjs';
import {concatMap} from 'rxjs/operators';
import {Person} from '../interfaces/Model/Person';

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
              private personService: PersonService) {
    this.cache = [];
    this.personService.me$.subscribe(person => this.person = person);
  }

  async maybeRefreshCache(): Promise<Game[]> {
    return new Promise(async resolve => {
      if (this.cache.length > 0) {
        resolve(this.cache);
      } else {
        this.refreshCache().subscribe(games => resolve(games));
      }
    });
  }

  private refreshCache(): Observable<Game[]> {
    return this.personService.me$.pipe(
      concatMap(async (person) => {
        const personID = person.id.value;
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
      }));
  }

  convertObjectsToGames(gameObjs: any[]): Game[] {
    return _.map(gameObjs, gameObj => new Game().initializedFromJSON(gameObj));
  }

  async addGame(gameObj: any): Promise<Game> {
    const returnObj = await this.http.post<any>(this.gamesUrl, gameObj).toPromise();
    const returnGame = new Game().initializedFromJSON(returnObj);
    this.cache.push(returnGame);
    return returnGame;
  }

  async addToMyGames(game: Game): Promise<any> {
    this.personService.me$.subscribe(async person => {
      const personID = person.id.value;
      const payload = {
        game_id: game.id.value,
        person_id: personID
      };
      const returnObj = await this.http.post<any>(this.personGamesUrl, payload).toPromise();
      game.personGame = new PersonGame().initializedFromJSON(returnObj);
    });
  }

  async updateGame(game: Game): Promise<any> {
    await game.commit(this.http);
  }

  async updatePersonGame(personGame: PersonGame): Promise<any> {
    await personGame.commit(this.http);
  }

  async insertGameplaySession(gameplaySession: GameplaySession): Promise<GameplaySession> {
    return gameplaySession.commit(this.http);
  }

}
