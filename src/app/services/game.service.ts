import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {PersonGame} from '../interfaces/Model/PersonGame';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {PlatformService} from './platform.service';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {Person} from '../interfaces/Model/Person';
import {first, takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private _gamesUrl = 'api/games';
  private _games$ = new BehaviorSubject<Game[]>([]);
  private _dataStore: {games: Game[]} = {games: []};
  private _fetching = false;

  private _destroy$ = new Subject();

  private me: Person;
  private allPlatforms: GamePlatform[];
  private gameRefreshCount = 0;

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private personService: PersonService,
              private platformService: PlatformService) {
    this.platformService.platforms.subscribe(platforms => {
      this.allPlatforms = platforms;
      if (!platforms) {
        console.log(`GameService updated with undefined platforms array.`);
      } else {
        console.log(`GameService updated with ${platforms.length} platforms.`);
      }
    });
    this.platformService.maybeRefreshCache();
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

  // todo: prune data so igdb_id is unique
  findGame(igdb_id: number): Game {
    const matching = _.filter(this._dataStore.games, game => game.igdb_id.value === igdb_id);
    if (matching.length > 1) {
      throw new Error(`Found multiple games with IGDB_ID ${igdb_id}`);
    } else if (matching.length === 0) {
      return null;
    } else {
      return matching[0];
    }
  }

  // PUBLIC CHANGE APIs. Make sure to call pushGameListChange() at the end of each operation.

  async addGame(game: Game): Promise<Game> {
    const resultGame = await game.commit(this.http);
    this._dataStore.games.push(resultGame);
    this.pushGameListChange();
    return resultGame;
  }

  async addToMyGames(game: Game, rating: number): Promise<any> {
    const personGame = new PersonGame(this.platformService, this.allPlatforms);
    personGame.person_id.value = this.me.id.value;
    personGame.game_id.value = game.id.value;
    personGame.rating.value = rating;

    game.personGame = await personGame.commit(this.http);
    this.pushGameListChange();
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
      this.me = person;
      this.platformService.platforms
        // only refresh the games the FIRST time platforms returns a valid array
        .pipe(first(platforms => !!platforms && platforms.length > 0))
        .subscribe(platforms => {
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
              this._dataStore.games = this.convertObjectsToGames(gameObjs, platforms);
              this.gameRefreshCount++;
              console.log(`Refreshing games for the ${this.gameRefreshCount} time: ${this._dataStore.games.length} games fetched.`);
              this.pushGameListChange();
              this._fetching = false;
            });
        });
    });
  }

  // re-pushes full game list out to all subscribers. Call this after any changes are made.
  private pushGameListChange() {
    this._games$.next(this.arrayService.cloneArray(this._dataStore.games));
  }

  private convertObjectsToGames(gameObjs: any[], platforms: GamePlatform[]): Game[] {
    return _.map(gameObjs, gameObj => new Game(this.platformService, platforms).initializedFromJSON(gameObj));
  }


}
