import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {PlatformService} from './platform.service';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {Person} from '../interfaces/Model/Person';
import {filter, takeUntil} from 'rxjs/operators';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import fast_sort from 'fast-sort';
import {ArrayUtil} from '../utility/ArrayUtil';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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
    myGamePlatform.person_id.value = this.me.id.value;
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

  async insertGameplaySession(gameplaySession: GameplaySession): Promise<GameplaySession> {
    const returnObj = await gameplaySession.commit(this.http);
    this.pushGameListChange();
    return returnObj;
  }

  async platformAboutToBeRemovedFromGlobal(gamePlatform: GamePlatform) {
    for (const game of this._dataStore.games) {
      const myPlatformsInGlobal = game.myPlatformsInGlobal;
      const matching = game.getOwnedPlatformWithID(gamePlatform.id.originalValue);

      if (!!matching && matching.isPreferred()) {

        matching.preferred.value = false;
        await matching.commit(this.http);

        if (myPlatformsInGlobal.length > 1) {
          const otherInGlobal: MyGamePlatform[] = _.without(myPlatformsInGlobal, matching);
          fast_sort(otherInGlobal)
            .asc(myPlatform => myPlatform.platform.myGlobalPlatform.rank.originalValue);

          const replacement = otherInGlobal[0];

          replacement.preferred.value = true;
          await replacement.commit(this.http);
        }
      }

    }

    this.pushGameListChange();
  }

  async platformJustAddedToGlobal(gamePlatform: GamePlatform) {
    for (const game of this._dataStore.games) {
      const myPlatformsInGlobal = game.myPlatformsInGlobal;
      const matching = game.getOwnedPlatformWithID(gamePlatform.id.originalValue);

      if (!!matching) {
        const previousPreferred = game.myPreferredPlatformNullAllowed;

        fast_sort(myPlatformsInGlobal)
          .asc(myPlatform => myPlatform.platform.myGlobalPlatform.rank.originalValue);

        const topOption = myPlatformsInGlobal[0];

        if (!previousPreferred ||
          topOption.id.originalValue !== previousPreferred.id.originalValue) {

          topOption.preferred.value = true;
          await topOption.commit(this.http);

          if (!!previousPreferred) {
            previousPreferred.preferred.value = false;
            await previousPreferred.commit(this.http);
          }

          // NO fucking clue why this is needed. When I commit topOption, my game variable is no longer the same
          // object as the games array of the same name.
          this.updateGameWithBetterGame(game);
        }
      }

    }

    this.pushGameListChange();
  }

  updateGameWithBetterGame(outdatedGame: Game) {
    const matchingGame = _.find(this._dataStore.games, game => game.id.value === outdatedGame.id.value);
    ArrayUtil.removeFromArray(this._dataStore.games, matchingGame);
    this._dataStore.games.push(outdatedGame);
  }

  // PRIVATE CACHE MANAGEMENT METHODS

  private refreshCache() {
    this.personService.me$.subscribe(person => {
      this.me = person;
      this.platformService.platforms
        // only refresh the games the FIRST time platforms returns a valid array
        .pipe(filter(platforms => !!platforms && platforms.length > 0))
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
