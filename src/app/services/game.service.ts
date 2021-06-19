import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {combineLatest, Observable} from 'rxjs';
import {PlatformService} from './platform.service';
import {filter, first, map} from 'rxjs/operators';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {ApiService} from './api.service';
import {Store} from '@ngxs/store';
import {GetGames} from '../actions/game.action';
import {GameData} from '../interfaces/ModelData/GameData';
import {PlatformRank} from '../components/my-platforms/my-platforms.component';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private get gameData(): Observable<GameData[]> {
    return this.store.select(store => store.games).pipe(
      filter(state => !!state),
      map(state => state.games),
      filter((games: GameData[]) => !!games)
    )
  };

  games: Observable<Game[]> = combineLatest([this.gameData, this.platformService.platforms]).pipe(
    map(([games, globalPlatforms]) => _.map(games, g => new Game(g, globalPlatforms)))
  );

  constructor(private http: HttpClient,
              private personService: PersonService,
              private apiService: ApiService,
              private store: Store,
              private platformService: PlatformService) {
    this.personService.me$.subscribe(me => {
      this.store.dispatch(new GetGames(me.id));
    });
  }

  findGameWithIDOnce(game_id: number): Observable<Game> {
    return this.games.pipe(
      first(),
      map(games => {
        return _.findWhere(games, {id: game_id});
      })
    );
  }

  gameWithIDObservable(game_id: number): Observable<Game> {
    return this.games.pipe(
      map(games => {
        return _.findWhere(games, {id: game_id});
      })
    );
  }

  findGame(igdb_id: number): Observable<Game> {
    return this.games.pipe(
      first(),
      map(games => {
        const matching = _.filter(games, game => game.data.igdb_id === igdb_id);
        if (matching.length > 1) {
          throw new Error(`Found multiple games with IGDB_ID ${igdb_id}`);
        } else if (matching.length === 0) {
          return undefined;
        } else {
          return matching[0];
        }
      })
    );
  }

  async addGameToCollection(igdb_id: number,
                            platform_id?: number,
                            igdb_platform_id?: number,
                            rating?: number): Promise<void> {
    return new Promise(resolve => {
      this.personService.me$.subscribe(async me => {
        const body = {
          person_id: me.id,
          igdb_id,
          platform_id,
          igdb_platform_id,
          rating
        }
        await this.apiService.executePostAfterFullyConnected('/api/games', body);
        resolve();
      });
    });

  }

  // PUBLIC CHANGE APIs. Make sure to call pushGameListChange() at the end of each operation.
/*
  async addGame(game: Game): Promise<void> {
    const resultGame = await game.commit(this.http);
    this._dataStore.games.push(resultGame);
    this.pushGameListChange();
    return resultGame;
  }*/
/*

  async addAvailablePlatformForExistingGamePlatform(game: Game, availableGamePlatform: AvailableGamePlatform): Promise<AvailableGamePlatform> {
    const returnPlatform = await availableGamePlatform.commit(this.http);
    game.addToAvailablePlatforms(returnPlatform);
    this.pushGameListChange();
    return returnPlatform;
  }
*/

  addMyGamePlatform(availableGamePlatform: AvailableGamePlatform, rating: number): void {
    this.personService.me$.subscribe(me => {

      const myGamePlatformObj = {
        person_id: me.id,
        preferred: !availableGamePlatform.game.myPreferredPlatform,
        platform_name: availableGamePlatform.platform_name,
        available_game_platform_id: availableGamePlatform.id,
        game_platform_id: availableGamePlatform.gamePlatform.id,
        minutes_played: 0,
        collection_add: new Date(),
        rating
      };

      this.apiService.executePostAfterFullyConnected('/api/myPlatforms', myGamePlatformObj);
    });

  }

  updateGame(gameID: number, changedFields: any): void {
    const body = {
      id: gameID,
      changedFields
    };
    this.apiService.executePutAfterFullyConnected('/api/games', body);
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

  updateMyPlatform(myGamePlatformID: number, changedFields: any): void {
    const body = {
      id: myGamePlatformID,
      changedFields
    };
    this.apiService.executePutAfterFullyConnected('/api/myPlatforms', body);
  }

  changePreferredPlatform(myGamePlatformID: number): void {
    const body = {
      id: myGamePlatformID
    };
    this.apiService.executePostAfterFullyConnected('/api/changePreferredPlatform', body);
  }

  updateMultipleGlobalPlatforms(platformRanks: PlatformRank[]): void {
    this.personService.me$.subscribe(me => {

      const allChangedFields = [];
      _.forEach(platformRanks, platformRank => {
        const payload = {
          id: platformRank.myGlobalPlatform.id,
          changedFields: {
            rank: platformRank.rank
          }
        };
        allChangedFields.push(payload);
      });
      const fullPayload = {
        // only need this for in-memory-api
        id: 213892,
        person_id: me.id,
        payloads: allChangedFields
      };
      this.apiService.executePutAfterFullyConnected('/api/multipleGlobals', fullPayload);

    });

  }

  insertGameplaySession(gameplaySessionObj: GameplaySessionInsertObj): void {
    this.apiService.executePostAfterFullyConnected( '/api/gameplaySessions', gameplaySessionObj);
  }
/*

  async platformAboutToBeRemovedFromGlobal(gamePlatform: GamePlatform): Promise<void> {
    for (const game of this._dataStore.games) {
      const matching = game.getOwnedPlatformWithID(gamePlatform.id);

      if (!!matching && matching.isManuallyPreferred()) {
      /!*  matching.preferred.value = false;
        await matching.commit(this.http);*!/
      }

    }
    this.pushGameListChange();
  }
*/


}

export class GameplaySessionInsertObj {
  game_id: number;
  start_time: Date;
  minutes: number;
  person_id: number;
  rating: number;
}

export class MyPlatformSessionUpdate {
  minutes_played: number;
  last_played: Date;
  finished_date?: Date;
  final_score?: number;
  replay_score?: number;
}
