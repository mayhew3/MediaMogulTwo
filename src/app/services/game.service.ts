import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {PersonGame} from '../interfaces/Model/PersonGame';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {Person} from '../interfaces/Model/Person';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private _me: Person;

  private _gamesUrl = 'api/games';
  private _games$ = new BehaviorSubject<Game[]>([]);
  private _dataStore: {games: Game[]} = {games: []};
  private _fetching = false;

  private _destroy$ = new Subject();


  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private personService: PersonService) {
    this.personService.me$.subscribe(person => this._me = person);
  }

  // public observable for all changes to game list
  get games() {
    return this._games$.asObservable();
  }

  // trigger fetching of game list if it doesn't exist already.
  maybeRefreshCache() {
    if (this._dataStore.games.length === 0 && !this._fetching) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // PUBLIC CHANGE APIs. Make sure to call pushGameListChange() at the end of each operation.

  async addGame(game: Game): Promise<Game> {
    const personGame = game.personGame;
    if (!!personGame) {
      delete game.personGame;
    }
    const resultGame = await game.commit(this.http);
    if (!!personGame) {
      personGame.game_id.value = resultGame.id.value;
      resultGame.personGame = await personGame.commit(this.http);
    }
    this._dataStore.games.push(resultGame);
    this.pushGameListChange();
    return resultGame;
  }

  async addToMyGames(game: Game): Promise<any> {
    this.personService.me$.subscribe(async person => {
      const personGame = new PersonGame();
      personGame.person_id.value = person.id.value;
      personGame.game_id.value = game.id.value;

      game.personGame = await personGame.commit(this.http);
      this.pushGameListChange();
    });
  }

  async updateGame(game: Game): Promise<any> {
    await game.commit(this.http);
    this.pushGameListChange();
  }

  async getIGDBMatches(searchTitle: string): Promise<any[]> {
    const payload = {
      game_title: searchTitle
    };
    const options = {
      params: payload
    };
    return await this.http.get<any[]>('/api/igdbMatches', options).toPromise();
  }

  async updatePersonGame(personGame: PersonGame): Promise<any> {
    await personGame.commit(this.http);
    this.pushGameListChange();
  }

  async insertGameplaySession(gameplaySession: GameplaySession): Promise<GameplaySession> {
    const returnObj = await gameplaySession.commit(this.http);
    this.pushGameListChange();
    return returnObj;
  }


  // PRIVATE CACHE MANAGEMENT METHODS

  private refreshCache() {
    this.personService.me$.subscribe(person => {
      const personID = person.id.value;
      const payload = {
        person_id: personID.toString()
      };
      const options = {
        params: payload
      };
      this.http
        .get<any[]>(this._gamesUrl, options)
        .pipe(takeUntil(this._destroy$))
        .subscribe(gameObjs => {
          this._dataStore.games = this.convertObjectsToGames(gameObjs);
          this.pushGameListChange();
          this._fetching = false;
        })
    });
  }

  // re-pushes full game list out to all subscribers. Call this after any changes are made.
  private pushGameListChange() {
    this._games$.next(this.arrayService.cloneArray(this._dataStore.games));
  }

  private convertObjectsToGames(gameObjs: any[]): Game[] {
    return _.map(gameObjs, gameObj => new Game().initializedFromJSON(gameObj));
  }

}
