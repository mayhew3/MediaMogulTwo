import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {PlatformService} from './platform.service';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {Person} from '../interfaces/Model/Person';
import {filter, takeUntil} from 'rxjs/operators';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';
import {ArrayUtil} from '../utility/ArrayUtil';
import {AddGameplaySession} from '../actions/gameplay.session.action';
import {ApiService} from './api.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private _gamesUrl = '/api/games';
  private _games$ = new BehaviorSubject<Game[]>([]);
  private _dataStore: {games: Game[]} = {games: []};
  private _fetching = false;

  private _destroy$ = new Subject();

  private me: Person;
  private allPlatforms: GamePlatform[];
  private gameRefreshCount = 0;

  constructor(private http: HttpClient,
              private personService: PersonService,
              private apiService: ApiService,
              private platformService: PlatformService) {
    this.platformService.platforms.subscribe(platforms => {
      this.allPlatforms = platforms;
      if (!platforms) {
        console.log(`GameService updated with undefined platforms array.`);
      } else {
        console.log(`GameService updated with ${platforms.length} platforms.`);
      }
    });
  }

  // public observable for all changes to game list
  get games(): Observable<Game[]> {
    return this._games$.asObservable();
  }

  // trigger fetching of game list if it doesn't exist already.
  maybeRefreshCache(): void {
    if (this._dataStore.games.length === 0 && !this._fetching) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  findGame(igdb_id: number): Game {
    const matching = _.filter(this._dataStore.games, game => game.igdb_id.value === igdb_id);
    if (matching.length > 1) {
      throw new Error(`Found multiple games with IGDB_ID ${igdb_id}`);
    } else if (matching.length === 0) {
      return undefined;
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

  async addAvailablePlatformForExistingGamePlatform(game: Game, availableGamePlatform: AvailableGamePlatform): Promise<AvailableGamePlatform> {
    const returnPlatform = await availableGamePlatform.commit(this.http);
    game.addToAvailablePlatforms(returnPlatform);
    this.pushGameListChange();
    return returnPlatform;
  }

  async addMyGamePlatform(availableGamePlatform: AvailableGamePlatform, myGamePlatform: MyGamePlatform): Promise<MyGamePlatform> {
    myGamePlatform.person_id.value = this.me.id;
    myGamePlatform.preferred.value = !availableGamePlatform.game.myPreferredPlatform;
    myGamePlatform.platform_name.value = availableGamePlatform.platform_name.value;
    myGamePlatform.game_platform_id.value = availableGamePlatform.game_platform_id.value;
    myGamePlatform.minutes_played.value = 0;
    myGamePlatform.collection_add.value = new Date();

    const returnMyGamePlatform = await myGamePlatform.commit(this.http);
    availableGamePlatform.myGamePlatform = returnMyGamePlatform;
    this.pushGameListChange();
    return returnMyGamePlatform;
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

  async updateMyPlatform(myGamePlatform: MyGamePlatform): Promise<any> {
    await myGamePlatform.commit(this.http);
    this.pushGameListChange();
  }

  async updateMultipleGlobalPlatforms(myGlobalPlatforms: MyGlobalPlatform[]): Promise<any> {
    const allChangedFields = [];
    _.forEach(myGlobalPlatforms, myGlobalPlatform => {
      const payload = {
        id: myGlobalPlatform.id,
        // changedFields: myGlobalPlatform.getChangedFields()
      };
      allChangedFields.push(payload);
    });
    const fullPayload = {
      // only need this for in-memory-api
      id: 213892,
      payloads: allChangedFields
    };
    await this.http.put('/api/multipleGlobals', fullPayload).toPromise();
    // _.forEach(myGlobalPlatforms, myGlobalPlatform => myGlobalPlatform.moveChanges());
  }

  async insertGameplaySession(gameplaySession: GameplaySession): Promise<void> {
    this.apiService.executePostAfterFullyConnected( '/api/gameplaySessions', gameplaySession);
  }

  async platformAboutToBeRemovedFromGlobal(gamePlatform: GamePlatform): Promise<void> {
    for (const game of this._dataStore.games) {
      const matching = game.getOwnedPlatformWithID(gamePlatform.id);

      if (!!matching && matching.isManuallyPreferred()) {
        matching.preferred.value = false;
        await matching.commit(this.http);
      }

    }
    this.pushGameListChange();
  }

  // PRIVATE CACHE MANAGEMENT METHODS

  private refreshCache(): void {
    this.personService.me$.subscribe(person => {
      this.me = person;
      this.platformService.platforms
        // only refresh the games the FIRST time platforms returns a valid array
        .pipe(filter((platforms: GamePlatform[]) => !!platforms && platforms.length > 0))
        .subscribe(platforms => {
          const personID = person.id;
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
  private pushGameListChange(): void {
    this._games$.next(ArrayUtil.cloneArray(this._dataStore.games));
  }

  private convertObjectsToGames(gameObjs: any[], platforms: GamePlatform[]): Game[] {
    return _.map(gameObjs, gameObj => new Game(this.platformService, platforms).initializedFromJSON(gameObj));
  }


}
